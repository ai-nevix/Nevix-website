/**
 * Assembles and runs the Next.js standalone output — the production deployment artifact, so local
 * verification exercises the real thing rather than `next start`.
 *
 * `output: 'standalone'` emits a minimal server but does not copy `.next/static` or `public` into
 * it; this script does.
 *
 * The assembled server is staged into `.serve/` rather than run in place. Running it from inside
 * `.next` keeps a file handle open on the build directory, which makes the next `next build` fail
 * on Windows with EBUSY — so the two never share a directory.
 *
 * Usage: node scripts/serve-standalone.mjs [port]
 */
import { access, cp, rm } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const webDir = join(repoRoot, 'apps', 'web');
const buildOutput = join(webDir, '.next', 'standalone');
// Port-specific so two servers (for example a manual one and the E2E suite) never contend for
// the same directory.
const stageDir = join(repoRoot, '.serve', `p${process.argv[2] ?? '3000'}`);
const stagedWeb = join(stageDir, 'apps', 'web');
const port = process.argv[2] ?? '3000';

await access(join(buildOutput, 'apps', 'web', 'server.js')).catch(() => {
  console.error('No standalone build found. Run `npm run build` first.');
  process.exit(1);
});

await rm(stageDir, { recursive: true, force: true });
await cp(buildOutput, stageDir, { recursive: true });
await cp(join(webDir, '.next', 'static'), join(stagedWeb, '.next', 'static'), {
  recursive: true,
  force: true,
});
await cp(join(webDir, 'public'), join(stagedWeb, 'public'), { recursive: true, force: true });

console.log(`Serving standalone build on http://localhost:${port}`);

const child = spawn(process.execPath, [join(stagedWeb, 'server.js')], {
  stdio: 'inherit',
  env: { ...process.env, PORT: port, HOSTNAME: '0.0.0.0' },
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => child.kill(signal));
}

child.on('exit', (code) => process.exit(code ?? 0));
