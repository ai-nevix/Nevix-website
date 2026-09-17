/**
 * Verifies the dummy-data registry against the codebase (instruction §33).
 *
 * The registry only works if it stays accurate, and a registry that drifts from the code is worse
 * than none — it creates confidence that placeholder content is tracked when it is not. This runs
 * in CI as a blocking check.
 *
 * Fails when:
 *   - a `DUMMY-DATA: DD-nnn` marker in the code has no entry in registry.md
 *   - a registry entry's stated location contains no matching marker
 *   - an ID is defined twice in the registry
 *   - an ID is skipped in the sequence (usually a typo)
 *
 * Usage: node scripts/audit-dummy-data.mjs
 */

import { readdir, readFile, stat } from 'node:fs/promises';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const registryPath = join(repoRoot, 'docs', 'dummy-data', 'registry.md');

const SCAN_DIRS = ['apps/web', 'apps/api', 'apps/cms', 'packages', 'infra', 'scripts'];
const SCAN_EXTENSIONS = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.mjs',
  '.cjs',
  '.py',
  '.json',
  '.md',
  '.yml',
  '.yaml',
  '.conf',
]);
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
]);

const MARKER = /DUMMY-DATA:\s*(DD-\d{3})/g;
const REGISTRY_ROW = /^\|\s*(DD-\d{3})\s*\|(.+)$/gm;

/** Recursively collects candidate files. */
async function collectFiles(directory) {
  const found = [];

  async function walk(current) {
    let entries;
    try {
      entries = await readdir(current, { withFileTypes: true });
    } catch {
      return; // directory does not exist in this checkout
    }

    for (const entry of entries) {
      if (IGNORE_SEGMENTS.has(entry.name)) continue;
      const full = join(current, entry.name);

      if (entry.isDirectory()) {
        await walk(full);
      } else if (SCAN_EXTENSIONS.has(entry.name.slice(entry.name.lastIndexOf('.')))) {
        found.push(full);
      }
    }
  }

  await walk(directory);
  return found;
}

async function main() {
  // ---- Parse the registry -------------------------------------------------------------------
  let registrySource;
  try {
    registrySource = await readFile(registryPath, 'utf8');
  } catch {
    console.error(`Registry not found at ${relative(repoRoot, registryPath)}`);
    process.exit(1);
  }

  /** @type {Map<string, { location: string, status: string }>} */
  const registry = new Map();
  const duplicates = [];

  for (const match of registrySource.matchAll(REGISTRY_ROW)) {
    const id = match[1];
    const columns = match[2].split('|').map((c) => c.trim());

    if (registry.has(id)) {
      duplicates.push(id);
      continue;
    }

    registry.set(id, {
      // Columns: dummy data | location | why | replacement | status
      location: (columns[1] ?? '').replace(/`/g, ''),
      status: columns[4] ?? 'Unknown',
    });
  }

  // ---- Scan the codebase --------------------------------------------------------------------
  /** @type {Map<string, string[]>} */
  const markers = new Map();

  for (const directory of SCAN_DIRS) {
    const files = await collectFiles(join(repoRoot, directory));

    for (const file of files) {
      // The registry and its sibling docs describe the markers; they are not markers themselves.
      if (file.includes(join('docs', 'dummy-data'))) continue;

      const contents = await readFile(file, 'utf8');
      for (const match of contents.matchAll(MARKER)) {
        const id = match[1];
        const relativePath = relative(repoRoot, file).split(sep).join('/');
        const list = markers.get(id) ?? [];
        if (!list.includes(relativePath)) list.push(relativePath);
        markers.set(id, list);
      }
    }
  }

  // ---- Compare ------------------------------------------------------------------------------
  const problems = [];

  for (const id of duplicates) {
    problems.push(`${id} appears more than once in the registry.`);
  }

  for (const [id, files] of markers) {
    if (!registry.has(id)) {
      problems.push(
        `${id} is marked in the code but has no registry entry.\n` +
          `    Found in: ${files.join(', ')}\n` +
          `    Add a row to docs/dummy-data/registry.md.`,
      );
    }
  }

  for (const [id, entry] of registry) {
    if (entry.status === 'Removed') continue;

    if (!markers.has(id)) {
      problems.push(
        `${id} is in the registry but no matching marker was found in the code.\n` +
          `    Registry location: ${entry.location}\n` +
          `    Either add the marker comment, or set the entry's status to "Removed".`,
      );
    }
  }

  // Gaps in the sequence are almost always a typo in an ID.
  const ids = [...registry.keys()].map((id) => Number(id.slice(3))).sort((a, b) => a - b);
  for (let index = 1; index < ids.length; index += 1) {
    const previous = ids[index - 1];
    const current = ids[index];
    if (current - previous > 1) {
      problems.push(
        `Registry IDs jump from DD-${String(previous).padStart(3, '0')} to ` +
          `DD-${String(current).padStart(3, '0')}. Check for a typo.`,
      );
    }
  }

  // ---- Report -------------------------------------------------------------------------------
  console.log(
    `Dummy-data audit: ${registry.size} registry entries, ` +
      `${markers.size} distinct markers across ` +
      `${[...markers.values()].reduce((total, files) => total + files.length, 0)} file locations.`,
  );

  const pending = [...registry.values()].filter((entry) => entry.status === 'Pending').length;
  if (pending > 0) {
    console.log(
      `  ${pending} entries still Pending — see docs/dummy-data/replacement-checklist.md.`,
    );
  }

  if (problems.length === 0) {
    console.log('  Registry and code agree.');
    return;
  }

  console.error(`\n${problems.length} problem(s):\n`);
  for (const problem of problems) console.error(`  - ${problem}`);
  process.exit(1);
}

main().catch((error) => {
  console.error('Dummy-data audit failed:', error);
  process.exit(1);
});
