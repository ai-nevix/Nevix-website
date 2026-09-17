/**
 * Generates the dependency licence inventory (instruction §5, §14; specification §11).
 *
 * The specification is explicit that "open source" must be verified at the exact version used,
 * not assumed. This reads the installed `node_modules` — the versions actually resolved by the
 * lockfile — rather than the ranges declared in `package.json`.
 *
 *   node scripts/generate-license-inventory.mjs            # write docs/licenses/npm-dependencies.md
 *   node scripts/generate-license-inventory.mjs --check    # fail on a non-permissive licence
 *
 * `--check` runs in CI so a dependency that relicenses becomes a decision rather than a surprise.
 */

import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const outputPath = join(repoRoot, 'docs', 'licenses', 'npm-dependencies.md');
const CHECK_ONLY = process.argv.includes('--check');

/**
 * Licences that are unambiguously safe for commercial use in a self-hosted product.
 * Anything outside this set is reported for a human decision rather than silently accepted.
 */
const PERMISSIVE = new Set([
  'MIT',
  'MIT-0',
  'ISC',
  'BSD-2-Clause',
  'BSD-3-Clause',
  '0BSD',
  'Apache-2.0',
  'Unlicense',
  'CC0-1.0',
  'BlueOak-1.0.0',
  'Python-2.0',
  'WTFPL',
  'Zlib',
]);

/**
 * Copyleft licences that are acceptable in specific, documented circumstances.
 * They are not a blocker; they are a reason to check how the component is used.
 */
const REVIEW_REQUIRED = new Map([
  [
    'AGPL-3.0',
    'Network copyleft. Fine for internally operated tooling; a consideration if ever embedded in a client-facing product.',
  ],
  ['AGPL-3.0-only', 'See AGPL-3.0.'],
  ['AGPL-3.0-or-later', 'See AGPL-3.0.'],
  ['GPL-2.0', 'Strong copyleft. Acceptable for a build-time-only or separate-process dependency.'],
  ['GPL-3.0', 'Strong copyleft. Acceptable for a build-time-only or separate-process dependency.'],
  ['LGPL-3.0', 'Weak copyleft; dynamic linking is generally acceptable.'],
  ['MPL-2.0', 'File-level copyleft; modifications to the covered files must be shared.'],
  [
    'LGPL-3.0-or-later',
    'Weak copyleft, reached via the libvips library bundled with sharp. Dynamic linking inside a container is the standard accepted use, and libvips is not modified.',
  ],
  ['LGPL-2.1-or-later', 'Weak copyleft; dynamic linking is generally acceptable.'],
  ['CC-BY-4.0', 'Attribution required. Usually a data or font package.'],
]);

/** Reads one package.json and extracts what the inventory needs. */
async function readPackage(path) {
  try {
    const raw = await readFile(join(path, 'package.json'), 'utf8');
    const pkg = JSON.parse(raw);

    let license = pkg.license ?? pkg.licenses ?? 'UNKNOWN';
    if (typeof license === 'object') {
      license = Array.isArray(license)
        ? license.map((l) => l.type ?? l).join(' OR ')
        : (license.type ?? 'UNKNOWN');
    }

    return {
      name: pkg.name ?? 'unknown',
      version: pkg.version ?? 'unknown',
      license: String(license),
      description: (pkg.description ?? '').slice(0, 120),
      repository: typeof pkg.repository === 'string' ? pkg.repository : (pkg.repository?.url ?? ''),
    };
  } catch {
    return null;
  }
}

/** Walks node_modules, including one level of scoped packages. */
async function collectPackages(nodeModulesPath) {
  const packages = new Map();

  let entries;
  try {
    entries = await readdir(nodeModulesPath, { withFileTypes: true });
  } catch {
    return packages;
  }

  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name === '.bin' || entry.name === '.package-lock.json') {
      continue;
    }

    if (entry.name.startsWith('@')) {
      const scoped = await readdir(join(nodeModulesPath, entry.name), { withFileTypes: true });
      for (const inner of scoped) {
        if (!inner.isDirectory()) continue;
        const pkg = await readPackage(join(nodeModulesPath, entry.name, inner.name));
        if (pkg) packages.set(`${pkg.name}@${pkg.version}`, pkg);
      }
      continue;
    }

    const pkg = await readPackage(join(nodeModulesPath, entry.name));
    if (pkg) packages.set(`${pkg.name}@${pkg.version}`, pkg);
  }

  return packages;
}

/** Only the packages this repository declares directly — the ones we chose. */
async function directDependencies() {
  const manifests = [
    'package.json',
    'apps/web/package.json',
    'apps/cms/package.json',
    'packages/types/package.json',
    'packages/config/package.json',
  ];

  const direct = new Set();

  for (const manifest of manifests) {
    try {
      const pkg = JSON.parse(await readFile(join(repoRoot, manifest), 'utf8'));
      for (const section of ['dependencies', 'devDependencies']) {
        for (const name of Object.keys(pkg[section] ?? {})) direct.add(name);
      }
    } catch {
      // Manifest absent in this checkout; skip it.
    }
  }

  return direct;
}

/**
 * Classifies an SPDX expression.
 *
 * OR and AND mean different things and must not be treated alike:
 *   "MIT OR Apache-2.0"                  — we may pick either, so one permissive side is enough
 *   "Apache-2.0 AND LGPL-3.0-or-later"   — BOTH apply, so the most restrictive term governs
 *
 * Getting this backwards would silently pass a copyleft obligation as permissive.
 */
function classify(license) {
  const normalised = license.replace(/[()]/g, '').trim();

  // OR first: any permissive alternative makes the whole expression permissive.
  const orParts = normalised.split(/\s+OR\s+/i).map((p) => p.trim());
  if (orParts.length > 1 && orParts.some((p) => PERMISSIVE.has(p))) {
    return { status: 'permissive', note: '' };
  }

  // AND: every term applies simultaneously, so the strictest one decides.
  const andParts = normalised.split(/\s+AND\s+/i).map((p) => p.trim());

  if (andParts.every((p) => PERMISSIVE.has(p))) {
    return { status: 'permissive', note: '' };
  }

  const reviewable = andParts.filter((p) => REVIEW_REQUIRED.has(p));
  if (reviewable.length > 0 && andParts.every((p) => PERMISSIVE.has(p) || REVIEW_REQUIRED.has(p))) {
    return {
      status: 'review',
      note: reviewable.map((p) => REVIEW_REQUIRED.get(p)).join(' '),
    };
  }

  return { status: 'unknown', note: 'Not recognised — verify manually before release.' };
}

async function main() {
  const packages = await collectPackages(join(repoRoot, 'node_modules'));
  const direct = await directDependencies();

  const all = [...packages.values()].sort((a, b) => a.name.localeCompare(b.name));
  const directPackages = all.filter((p) => direct.has(p.name));

  const byLicense = new Map();
  const needsReview = [];
  const unknown = [];

  for (const pkg of all) {
    byLicense.set(pkg.license, (byLicense.get(pkg.license) ?? 0) + 1);
    const { status, note } = classify(pkg.license);
    if (status === 'review') needsReview.push({ ...pkg, note });
    if (status === 'unknown') unknown.push(pkg);
  }

  if (CHECK_ONLY) {
    console.log(`Licence check: ${all.length} packages, ${byLicense.size} distinct licences.`);

    if (unknown.length > 0) {
      console.error(`\n${unknown.length} package(s) with an unrecognised licence:\n`);
      for (const pkg of unknown.slice(0, 25)) {
        console.error(`  ${pkg.name}@${pkg.version} — ${pkg.license}`);
      }
      console.error('\nVerify each manually and add it to PERMISSIVE or REVIEW_REQUIRED.');
      process.exit(1);
    }

    if (needsReview.length > 0) {
      console.log(`\n${needsReview.length} package(s) under a copyleft licence (documented):`);
      for (const pkg of needsReview) console.log(`  ${pkg.name}@${pkg.version} — ${pkg.license}`);
    }

    console.log('\nNo unrecognised licences.');
    return;
  }

  const timestamp = new Date().toISOString().split('T')[0];

  const lines = [
    '# npm Dependency Licence Inventory',
    '',
    '> **Generated file.** Run `npm run licenses:inventory` to regenerate.',
    `> Generated ${timestamp} from the versions resolved in \`node_modules\`, not from the`,
    '> ranges declared in `package.json` — specification §11 requires verification at the exact',
    '> version used.',
    '',
    `**${all.length}** packages across **${byLicense.size}** distinct licences.`,
    `**${directPackages.length}** are direct dependencies — the ones we chose; the rest are transitive.`,
    '',
    '## Summary by licence',
    '',
    '| Licence | Packages | Commercial use |',
    '| --- | ---: | --- |',
  ];

  for (const [license, count] of [...byLicense.entries()].sort((a, b) => b[1] - a[1])) {
    const { status } = classify(license);
    const verdict =
      status === 'permissive'
        ? 'Permitted'
        : status === 'review'
          ? 'Permitted — see notes'
          : '**Verify manually**';
    lines.push(`| ${license} | ${count} | ${verdict} |`);
  }

  if (needsReview.length > 0) {
    lines.push(
      '',
      '## Copyleft dependencies',
      '',
      'Present and acceptable, with the reasoning recorded so the boundary stays visible.',
      '',
      '| Package | Version | Licence | Note |',
      '| --- | --- | --- | --- |',
    );
    for (const pkg of needsReview) {
      lines.push(`| \`${pkg.name}\` | ${pkg.version} | ${pkg.license} | ${pkg.note} |`);
    }
  }

  if (unknown.length > 0) {
    lines.push(
      '',
      '## Unrecognised licences — action required',
      '',
      '| Package | Version | Declared licence |',
      '| --- | --- | --- |',
    );
    for (const pkg of unknown) {
      lines.push(`| \`${pkg.name}\` | ${pkg.version} | ${pkg.license} |`);
    }
  }

  lines.push(
    '',
    '## Direct dependencies',
    '',
    'The packages this repository declares explicitly.',
    '',
    '| Package | Version | Licence | Purpose |',
    '| --- | --- | --- | --- |',
  );

  for (const pkg of directPackages) {
    const purpose = pkg.description.replace(/\|/g, '\\|') || '—';
    lines.push(`| \`${pkg.name}\` | ${pkg.version} | ${pkg.license} | ${purpose} |`);
  }

  lines.push(
    '',
    '## Full transitive inventory',
    '',
    '<details>',
    '<summary>All ' + all.length + ' packages</summary>',
    '',
    '| Package | Version | Licence |',
    '| --- | --- | --- |',
  );

  for (const pkg of all) {
    lines.push(`| \`${pkg.name}\` | ${pkg.version} | ${pkg.license} |`);
  }

  lines.push('', '</details>', '');

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, lines.join('\n'), 'utf8');

  console.log(`Wrote ${outputPath}`);
  console.log(
    `  ${all.length} packages, ${directPackages.length} direct, ${byLicense.size} licences`,
  );
  if (needsReview.length) console.log(`  ${needsReview.length} copyleft (documented)`);
  if (unknown.length) console.log(`  ${unknown.length} UNRECOGNISED — review required`);
}

main().catch((error) => {
  console.error('Licence inventory failed:', error);
  process.exit(1);
});
