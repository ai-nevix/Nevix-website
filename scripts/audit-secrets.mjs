/**
 * Scans the working tree for committed secrets (instruction §32, §45: "No secrets in Git").
 *
 * This is a fast pre-commit / CI guard, not a replacement for a dedicated scanner. The pipeline
 * additionally runs gitleaks over the full history, which catches anything already committed.
 * This catches the common case — a credential pasted into a config file — before it lands.
 *
 * Usage: node scripts/audit-secrets.mjs
 */

import { readdir, readFile } from 'node:fs/promises';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));

const IGNORE_SEGMENTS = new Set([
  'node_modules',
  '.next',
  'dist',
  'build',
  '.venv',
  '__pycache__',
  'coverage',
  '.serve',
  '.tooling',
  '.git',
  '.tmp',
  'playwright-report',
  'test-results',
]);

const SCAN_EXTENSIONS = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.mjs',
  '.cjs',
  '.py',
  '.json',
  '.yml',
  '.yaml',
  '.conf',
  '.sh',
  '.env',
  '.ini',
  '.toml',
  '.md',
]);

/**
 * Files that legitimately contain secret-shaped strings.
 * `.env.example` holds empty placeholders; the compose files reference variables, not values;
 * test fixtures use obviously fake credentials that the application refuses in production.
 */
const ALLOWED_PATHS = [
  '.env.example',
  'docker-compose.dev.yml',
  'apps/api/tests/',
  'apps/cms/Dockerfile',
  'scripts/audit-secrets.mjs',
  'scripts/generate-secrets.sh',
  'docs/',
];

/**
 * Each rule looks for an assignment of a *literal* value, not a reference to a variable.
 * `PASSWORD=${DB_PASSWORD}` is correct usage; `PASSWORD=hunter2` is not.
 */
const RULES = [
  {
    name: 'Hard-coded password assignment',
    pattern: /\b(password|passwd|pwd)\s*[:=]\s*["']([^"'${}\s][^"']{6,})["']/gi,
  },
  {
    name: 'Hard-coded secret or API key',
    pattern:
      /\b(secret[_-]?key|api[_-]?key|access[_-]?token|auth[_-]?token|private[_-]?key)\s*[:=]\s*["']([^"'${}\s][^"']{15,})["']/gi,
  },
  {
    name: 'AWS access key id',
    pattern: /\bAKIA[0-9A-Z]{16}\b/g,
  },
  {
    name: 'Private key block',
    pattern: /-----BEGIN (RSA |EC |OPENSSH |PGP )?PRIVATE KEY-----/g,
  },
  {
    name: 'Database URL with inline credentials',
    // Matches scheme://user:password@host but not scheme://user:${VAR}@host.
    // The password is captured as group 2 so the placeholder allow-list can evaluate it.
    // Without that, the known development default is reported on every run and the whole check
    // gets ignored as noise — which is how a real credential slips through.
    pattern:
      /\b(postgres(?:ql)?|mysql|mongodb|redis)(?:\+\w+)?:\/\/[^\s:"'${}]+:(?!\$\{)([^\s:@"'${}]{4,})@/gi,
  },
  {
    name: 'Slack or GitHub token',
    pattern: /\b(xox[baprs]-[0-9A-Za-z-]{10,}|gh[pousr]_[0-9A-Za-z]{30,})\b/g,
  },
  {
    name: 'JWT with a payload',
    pattern: /\beyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g,
  },
];

/**
 * Values that match a rule but are demonstrably not real credentials: documented placeholders and
 * the deliberately weak development defaults the application rejects in production.
 */
const KNOWN_PLACEHOLDERS = [
  /^(change[_-]?me|placeholder|example|redacted|your[_-].*|xxx+|\.\.\.)$/i,
  /^(local|dev|development|test|ci)[_-]/i,
  /not[_-]for[_-]production/i,
  /^vastrix$/i,
  /^build$/,
];

function isAllowedPath(relativePath) {
  return ALLOWED_PATHS.some((allowed) => relativePath.startsWith(allowed));
}

function isPlaceholder(value) {
  return KNOWN_PLACEHOLDERS.some((pattern) => pattern.test(value));
}

async function collectFiles(directory) {
  const found = [];

  async function walk(current) {
    let entries;
    try {
      entries = await readdir(current, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      if (IGNORE_SEGMENTS.has(entry.name)) continue;
      const full = join(current, entry.name);

      if (entry.isDirectory()) {
        await walk(full);
        continue;
      }

      const extension = entry.name.slice(entry.name.lastIndexOf('.'));
      const isEnvFile = entry.name.startsWith('.env');

      if (SCAN_EXTENSIONS.has(extension) || isEnvFile || !entry.name.includes('.')) {
        found.push(full);
      }
    }
  }

  await walk(directory);
  return found;
}

async function main() {
  const files = await collectFiles(repoRoot);
  const findings = [];
  let committedEnvFile = false;

  for (const file of files) {
    const relativePath = relative(repoRoot, file).split(sep).join('/');

    // A real .env must never be tracked. .env.example is the only permitted one.
    if (/(^|\/)\.env$/.test(relativePath) || /(^|\/)\.env\.(?!example)/.test(relativePath)) {
      findings.push({
        file: relativePath,
        rule: 'Environment file present in the working tree',
        detail:
          'Only .env.example may be committed. Confirm this file is gitignored and holds no real secret.',
      });
      committedEnvFile = true;
      continue;
    }

    if (isAllowedPath(relativePath)) continue;

    let contents;
    try {
      contents = await readFile(file, 'utf8');
    } catch {
      continue; // binary or unreadable
    }

    for (const rule of RULES) {
      rule.pattern.lastIndex = 0;

      for (const match of contents.matchAll(rule.pattern)) {
        const value = match[2] ?? match[0];
        if (isPlaceholder(value)) continue;

        const line = contents.slice(0, match.index).split('\n').length;
        findings.push({
          file: relativePath,
          line,
          rule: rule.name,
          // Never print the matched value — that would put the secret in the CI log.
          detail: `${match[0].slice(0, 24).replace(/[^\w:=/@-]/g, '')}… (redacted)`,
        });
      }
    }
  }

  console.log(`Secret audit: scanned ${files.length} files.`);

  if (findings.length === 0) {
    console.log('  No committed secrets detected.');
    return;
  }

  console.error(`\n${findings.length} potential secret(s):\n`);
  for (const finding of findings) {
    const location = finding.line ? `${finding.file}:${finding.line}` : finding.file;
    console.error(`  - ${location}\n      ${finding.rule}: ${finding.detail}`);
  }

  if (committedEnvFile) {
    console.error('\n  A .env file is present. Verify it is gitignored: git check-ignore -v .env');
  }

  console.error(
    '\n  If a match is a false positive, add its path to ALLOWED_PATHS in this script with a\n' +
      '  comment explaining why, or reference the value from an environment variable instead.',
  );
  process.exit(1);
}

main().catch((error) => {
  console.error('Secret audit failed:', error);
  process.exit(1);
});
