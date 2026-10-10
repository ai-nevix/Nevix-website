/**
 * Publishes the site through an ngrok tunnel.
 *
 * `NEXT_PUBLIC_SITE_URL` is read at build time — canonical links, the sitemap and the JSON-LD all
 * bake it in. Starting a tunnel and serving an existing build therefore publishes a site whose
 * every canonical points at localhost, which is worse than not publishing it: search engines and
 * link previews would follow addresses no visitor can reach.
 *
 * So the order here is deliberate: start the tunnel first, ask it what address it was actually
 * given, and only then build. That works whether the address is a reserved domain or a fresh
 * random one, without the caller having to say which.
 *
 * The address that was built is recorded, so a rebuild can say which address it is replacing — and
 * so `--no-build` can warn when the build it is about to serve was made for a different one.
 *
 * Usage:
 *   node scripts/serve-public.mjs [port]     port defaults to 3000
 *   NGROK_DOMAIN=<domain> node scripts/serve-public.mjs
 *
 * Flags:
 *   --no-build   serve the existing build without rebuilding
 */
import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const args = process.argv.slice(2);
/**
 * Rebuilding is the default; skipping it is the opt-in.
 *
 * It used to be the other way round — the build was skipped whenever the public address had not
 * changed. That is wrong for what this command is actually used for: "restart it so I can see my
 * changes". The address rarely changes and the code changes constantly, so the fast path was the
 * one that silently served stale output.
 *
 * A Next build with nothing to do takes a few seconds. Serving yesterday's code without noticing
 * costs more than that.
 */
const skipBuild = args.includes('--no-build');
const port = args.find((a) => /^\d+$/.test(a)) ?? '3000';

// ngrok serves its own status API here. It is how the agent reports the address it was assigned,
// and it is bound to loopback by ngrok itself.
const NGROK_API = 'http://127.0.0.1:4040/api/tunnels';
const markerPath = join(repoRoot, '.serve', '.public-url');

/** Locates ngrok: the repo-local copy first, then whatever is on PATH. */
async function findNgrok() {
  const local = join(repoRoot, '.tooling', process.platform === 'win32' ? 'ngrok.exe' : 'ngrok');
  const found = await access(local).then(
    () => local,
    () => 'ngrok',
  );
  return found;
}

const children = new Set();

/** Spawns a child and registers it for shutdown. */
function run(command, commandArgs, options = {}) {
  const child = spawn(command, commandArgs, { stdio: 'inherit', ...options });
  children.add(child);
  child.on('exit', () => children.delete(child));
  return child;
}

/** Runs a command to completion, rejecting on a non-zero exit. */
function runToCompletion(command, commandArgs, options = {}) {
  return new Promise((resolve, reject) => {
    const child = run(command, commandArgs, options);
    child.on('error', reject);
    child.on('exit', (code) =>
      code === 0 ? resolve() : reject(new Error(`${command} exited with ${code}`)),
    );
  });
}

/** Polls the ngrok status API until it reports an HTTPS tunnel, or gives up. */
async function waitForPublicUrl({ attempts = 40, intervalMs = 500 } = {}) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const response = await fetch(NGROK_API);
      if (response.ok) {
        const { tunnels = [] } = await response.json();
        // ngrok opens both http and https on one address; only the https one is worth publishing.
        const tunnel = tunnels.find((t) => t.public_url?.startsWith('https://'));
        if (tunnel) return tunnel.public_url;
      }
    } catch {
      // The agent has not finished starting its status API yet.
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
  return null;
}

/**
 * Turns an ngrok failure into something actionable.
 *
 * The agent's log is ~25 lines of connection detail with the one line that matters buried in the
 * middle, repeated four times, escaped. Recognised failures are reported as the fix; anything
 * unrecognised still prints the raw log, because a truncated message for an unknown error is worse
 * than a verbose one.
 */
function explainNgrokFailure(log) {
  if (log.includes('ERR_NGROK_4018')) {
    return [
      'ngrok is not authenticated — the authtoken has not been saved on this machine.',
      '',
      '  1. Copy your token: https://dashboard.ngrok.com/get-started/your-authtoken',
      '  2. Run:  .\\.tooling\\ngrok.exe config add-authtoken <your-token>',
      '',
      'This is needed once per machine, not once per run.',
    ].join('\n');
  }

  if (log.includes('ERR_NGROK_105')) {
    return [
      'The saved authtoken is not a valid ngrok authtoken.',
      '',
      'A common mix-up: the dashboard also shows resource IDs that start with "rd_" (a reserved',
      'domain) or "ak_" (an API key). Neither is the authtoken. The authtoken is a long string',
      'with an underscore roughly two-thirds of the way through.',
      '',
      '  Copy it from: https://dashboard.ngrok.com/get-started/your-authtoken',
      '  Then run:     .\\.tooling\\ngrok.exe config add-authtoken <your-token>',
    ].join('\n');
  }

  if (log.includes('ERR_NGROK_3200') || /not found|failed to bind/i.test(log)) {
    return [
      `The domain "${process.env.NGROK_DOMAIN ?? '(none set)'}" is not available on this account.`,
      '',
      'Check it matches a reserved domain at https://dashboard.ngrok.com/domains exactly,',
      'or unset NGROK_DOMAIN to use a random address.',
    ].join('\n');
  }

  if (log.includes('ERR_NGROK_334') || /already online/i.test(log)) {
    return [
      `The domain "${process.env.NGROK_DOMAIN ?? ''}" is already being served by another tunnel.`,
      '',
      'Something else is still publishing it — most often a previous run of this script in',
      'another terminal, which does not stop when that terminal is merely closed.',
      '',
      '  Find it:  https://dashboard.ngrok.com/agents   (stop the agent from there)',
      '  Or:       Get-Process ngrok | Stop-Process',
      '',
      'One endpoint per domain is a free-plan limit.',
    ].join('\n');
  }

  if (log.includes('ERR_NGROK_108') || /simultaneous.*session/i.test(log)) {
    return [
      'Another ngrok session is already running on this account.',
      '',
      'Stop it, or end it from https://dashboard.ngrok.com/agents — the free plan allows one.',
    ].join('\n');
  }

  return `ngrok failed:\n${log}`;
}

/** Shuts down every child process, once. */
let shuttingDown = false;
function shutdown(code = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const child of children) child.kill();
  process.exit(code);
}

for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => shutdown(0));

// ---- 1. Start the tunnel ------------------------------------------------------------------------
const ngrok = await findNgrok();
const domain = process.env.NGROK_DOMAIN?.trim();

const ngrokArgs = ['http', port, '--log', 'stdout', '--log-format', 'logfmt'];
if (domain) ngrokArgs.push(`--url=${domain}`);

console.log(
  domain
    ? `Starting ngrok on the reserved address ${domain} -> localhost:${port}`
    : `Starting ngrok on a random address -> localhost:${port}`,
);

// The agent's own log is noisy and its useful line (the address) is read from the API instead, so
// it is kept out of the terminal unless it fails.
const ngrokLog = [];
const ngrokProcess = spawn(ngrok, ngrokArgs, { stdio: ['ignore', 'pipe', 'pipe'] });
children.add(ngrokProcess);
for (const stream of [ngrokProcess.stdout, ngrokProcess.stderr]) {
  stream.on('data', (chunk) => ngrokLog.push(chunk.toString()));
}
ngrokProcess.on('error', (error) => {
  console.error(`Could not start ngrok: ${error.message}`);
  shutdown(1);
});
ngrokProcess.on('exit', () => {
  if (shuttingDown) return;
  console.error(`\n${explainNgrokFailure(ngrokLog.join(''))}\n`);
  shutdown(1);
});

const publicUrl = await waitForPublicUrl();
if (!publicUrl) {
  console.error(`\nngrok did not report a public address within 20s.`);
  console.error(`${explainNgrokFailure(ngrokLog.join(''))}\n`);
  shutdown(1);
}

console.log(`\n  Public address: ${publicUrl}`);
console.log(`  Tunnel inspector: http://127.0.0.1:4040\n`);

// ---- 2. Build against it, if it changed ---------------------------------------------------------
const builtUrl = await readFile(markerPath, 'utf8').then(
  (value) => value.trim(),
  () => null,
);

if (!skipBuild) {
  console.log(
    builtUrl && builtUrl !== publicUrl
      ? `The last build targeted ${builtUrl}. Rebuilding so canonical links match.\n`
      : 'Building, so the site reflects the current code and the public address.\n',
  );

  // npm is a shell script on every platform — `npm.cmd` on Windows. Since Node 20.12, spawning a
  // .cmd without a shell throws EINVAL (the CVE-2024-27980 hardening), so the shell is requested
  // explicitly there.
  //
  // The command is passed as one string with no argument array: combining `shell: true` with
  // separate arguments is deprecated (DEP0190) because they are concatenated rather than escaped.
  // Here the whole command is a fixed literal, so there is nothing to escape.
  const isWindows = process.platform === 'win32';

  await runToCompletion(isWindows ? 'npm.cmd run build' : 'npm run build', [], {
    cwd: repoRoot,
    shell: true,
    env: {
      ...process.env,
      NEXT_PUBLIC_SITE_URL: publicUrl,
      // Anything other than `production` keeps robots.txt disallowing everything, which is what a
      // preview of unapproved content needs. See docs/dummy-data/replacement-checklist.md.
      NEXT_PUBLIC_ENV: process.env.NEXT_PUBLIC_ENV ?? 'staging',
    },
  }).catch((error) => {
    console.error(`\nBuild failed: ${error.message}`);
    shutdown(1);
  });

  await mkdir(dirname(markerPath), { recursive: true });
  await writeFile(markerPath, publicUrl, 'utf8');
} else {
  console.log(
    builtUrl === publicUrl
      ? `Skipping the build (--no-build). Serving the existing build of ${publicUrl}.\n`
      : `Skipping the build (--no-build). WARNING: the existing build targets ${builtUrl ?? 'an unknown address'}, not ${publicUrl} — canonical links and the sitemap will be wrong.\n`,
  );
}

// ---- 3. Serve ------------------------------------------------------------------------------------
const server = run(process.execPath, [join(repoRoot, 'scripts', 'serve-standalone.mjs'), port], {
  cwd: repoRoot,
});

server.on('exit', (code) => {
  if (!shuttingDown) {
    console.error(`\nThe web server exited with ${code}.`);
    shutdown(code ?? 1);
  }
});

// ---- 4. Confirm before claiming it is live -------------------------------------------------------
//
// The agent reports a public address as soon as it has *configured* the tunnel, which is before the
// remote side has accepted it. A domain already served by another agent, for instance, fails after
// that point. Announcing the address on the strength of the API alone therefore prints "the site is
// live" and the failure that contradicts it within the same second.
//
// So the claim waits for evidence: the local server answering, and the tunnel still up behind it.
const reachable = await (async () => {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    if (ngrokProcess.exitCode !== null) return false;
    try {
      const response = await fetch(`http://127.0.0.1:${port}/`, { redirect: 'manual' });
      if (response.status < 500) return true;
    } catch {
      // The server is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  return false;
})();

if (!reachable) {
  // An ngrok failure has already been reported by its exit handler; anything else is the server.
  if (ngrokProcess.exitCode === null) {
    console.error(`\nThe server did not answer on port ${port} within 30s.`);
    shutdown(1);
  }
} else {
  console.log(`\n  The site is live at ${publicUrl}`);
  console.log('  Press Ctrl+C to stop the server and close the tunnel.\n');
}
