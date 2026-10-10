/**
 * Derives every brand asset the site serves from the supplied NEVIX originals.
 *
 * The originals in `brand-assets/nevix/` are the source of truth and are never edited in place.
 * Everything this script writes is reproducible by rerunning it, so a corrected original can simply
 * be dropped in and the site regenerated.
 *
 * Four kinds of derivation, all mechanical — nothing here redraws the logo:
 *
 * 1. **Logo separation.** Every supplied logo file is flattened onto a background — white for the
 *    primary lockup and the silver mark, midnight for the light-on-dark wordmark. A logo the site can
 *    place on any surface needs that background removed, and removing it naively (keying out
 *    "white-ish" pixels) leaves the antialiased edge carrying the old background: a pale ring on the
 *    midnight header, a dark one on white.
 *
 *    So the background is removed by un-compositing. A pixel at the artwork's edge is a blend
 *    `P = a·C + (1 − a)·B` of the artwork colour C and the background B. The background region is
 *    found by flood fill from the border; the artwork colour C at an edge pixel is taken from the
 *    nearest solid interior pixel; and the coverage `a` then follows from the blend. The result keeps
 *    the edge's smoothness and loses its background. Interior pixels are untouched.
 *
 * 2. **Crops.** The mark and the wordmark are cut from the supplied lockups so the site can set them
 *    side by side at header size, where the lockup's own tagline would be a few pixels tall.
 *
 * 3. **Icons.** Favicon, Apple touch icon and PWA icons come from the supplied app icon.
 *
 * 4. **Pictures.** Team cards, photographs and presentation boards are re-encoded as WebP at their
 *    native size. They are composed artwork — names, roles and tag lines are part of the pixels — so
 *    they are published whole and uncropped. The one exception is the homepage hero, which uses a
 *    region of `nevix-google.png` that contains landscape only: the rest of that image carries its
 *    own logo and copy, which would duplicate the page's real heading.
 *
 * Usage:
 *   node scripts/derive-brand-assets.mjs           write the derived assets
 *   node scripts/derive-brand-assets.mjs --check   verify they are up to date (CI)
 */
import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const suppliedDir = join(repoRoot, 'brand-assets', 'nevix');
const publicDir = join(repoRoot, 'apps', 'web', 'public');
const brandDir = join(publicDir, 'brand');
const teamDir = join(publicDir, 'team');
const appDir = join(repoRoot, 'apps', 'web', 'app');
const checkOnly = process.argv.includes('--check');

const supplied = (name) => join(suppliedDir, name);

/* ============================================================================================== */
/* Pixel helpers                                                                                   */
/* ============================================================================================== */

const NEIGHBOURS_4 = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];
const NEIGHBOURS_8 = [...NEIGHBOURS_4, [1, 1], [1, -1], [-1, 1], [-1, -1]];

/**
 * Breadth-first expansion from a set of seed pixels. Returns, for every pixel, the index of the
 * nearest seed (or -1 if unreachable) and the step distance to it.
 */
function nearestSeed(width, height, isSeed, canEnter = () => true, neighbours = NEIGHBOURS_8) {
  const size = width * height;
  const source = new Int32Array(size).fill(-1);
  const distance = new Int32Array(size).fill(-1);
  const queue = [];

  for (let i = 0; i < size; i += 1) {
    if (isSeed(i)) {
      source[i] = i;
      distance[i] = 0;
      queue.push(i);
    }
  }

  for (let head = 0; head < queue.length; head += 1) {
    const index = queue[head];
    const x = index % width;
    const y = (index - x) / width;
    for (const [dx, dy] of neighbours) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
      const next = ny * width + nx;
      if (source[next] !== -1 || !canEnter(next)) continue;
      source[next] = source[index];
      distance[next] = distance[index] + 1;
      queue.push(next);
    }
  }

  return { source, distance };
}

/**
 * Removes a flat background by un-compositing — see the header.
 *
 * @param isBackground  (r, g, b) => boolean — true for pixels that are plainly background
 * @param background    [r, g, b] — the background colour the artwork was flattened onto
 * @param edgeDepth     how many pixels in from the background the antialiased edge may extend
 */
function separateFromBackground(data, width, height, { isBackground, background, edgeDepth = 3 }) {
  const size = width * height;
  const rgb = (i) => [data[i * 4], data[i * 4 + 1], data[i * 4 + 2]];

  // 1. The background is what plainly-background pixels reach from the border. Anything enclosed by
  //    artwork stays artwork even if it happens to be pale (a silver highlight, say).
  const onBorder = (i) => {
    const x = i % width;
    const y = (i - x) / width;
    return x === 0 || y === 0 || x === width - 1 || y === height - 1;
  };
  const plain = (i) => isBackground(...rgb(i));
  const bg = nearestSeed(
    width,
    height,
    (i) => onBorder(i) && plain(i),
    plain,
    NEIGHBOURS_4,
  ).source.map((s) => (s === -1 ? 0 : 1));

  // 2. Distance of every artwork pixel from the background; the first few pixels are the edge.
  const fromBackground = nearestSeed(
    width,
    height,
    (i) => bg[i] === 1,
    (i) => bg[i] === 0,
  ).distance;
  const isInterior = (i) => bg[i] === 0 && fromBackground[i] > edgeDepth;

  // 3. Every edge pixel takes its colour from the nearest interior pixel, and its coverage from how
  //    far it sits between that colour and the background.
  const interior = nearestSeed(width, height, isInterior).source;

  let edge = 0;
  for (let i = 0; i < size; i += 1) {
    if (bg[i] === 1) {
      data[i * 4 + 3] = 0;
      continue;
    }
    if (isInterior(i)) continue;

    const from = interior[i];
    if (from === -1) {
      data[i * 4 + 3] = 0;
      continue;
    }

    const pixel = rgb(i);
    const colour = rgb(from);
    // Use the channel where the artwork differs most from the background — it carries the most
    // signal and is least affected by compression noise.
    let best = 0;
    let coverage = 0;
    for (let c = 0; c < 3; c += 1) {
      const span = colour[c] - background[c];
      if (Math.abs(span) > Math.abs(best)) {
        best = span;
        coverage = (pixel[c] - background[c]) / span;
      }
    }
    if (Math.abs(best) < 24) coverage = 1;

    data[i * 4] = colour[0];
    data[i * 4 + 1] = colour[1];
    data[i * 4 + 2] = colour[2];
    data[i * 4 + 3] = Math.round(Math.min(1, Math.max(0, coverage)) * 255);
    edge += 1;
  }

  // 4. Fully transparent pixels still carry a colour, and every scaler interpolates it across
  //    neighbours regardless of alpha. Bleeding the artwork's colour into them stops the old
  //    background creeping back along the edge whenever the image is resized.
  const solid = nearestSeed(width, height, (i) => data[i * 4 + 3] >= 250).source;
  for (let i = 0; i < size; i += 1) {
    if (data[i * 4 + 3] >= 250) continue;
    const from = solid[i];
    if (from === -1) continue;
    data[i * 4] = data[from * 4];
    data[i * 4 + 1] = data[from * 4 + 1];
    data[i * 4 + 2] = data[from * 4 + 2];
  }

  return { edge };
}

/** Trims fully transparent margins, leaving `pad` pixels of air on every side. */
async function trimToContent(buffer, pad = 4) {
  const { data, info } = await sharp(buffer).raw().toBuffer({ resolveWithObject: true });
  let [left, top, right, bottom] = [info.width, info.height, -1, -1];
  for (let y = 0; y < info.height; y += 1)
    for (let x = 0; x < info.width; x += 1)
      if (data[(y * info.width + x) * 4 + 3] > 8) {
        left = Math.min(left, x);
        right = Math.max(right, x);
        top = Math.min(top, y);
        bottom = Math.max(bottom, y);
      }
  left = Math.max(0, left - pad);
  top = Math.max(0, top - pad);
  right = Math.min(info.width - 1, right + pad);
  bottom = Math.min(info.height - 1, bottom + pad);
  return sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
    .extract({ left, top, width: right - left + 1, height: bottom - top + 1 })
    .png({ compressionLevel: 9 })
    .toBuffer();
}

/** Cuts a region from a supplied logo and separates it from its background. */
async function logoRegion(file, region, options) {
  const { data, info } = await sharp(supplied(file))
    .extract(region)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { edge } = separateFromBackground(data, info.width, info.height, options);
  const png = await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
    .png({ compressionLevel: 9 })
    .toBuffer();
  const trimmed = await trimToContent(png);
  const meta = await sharp(trimmed).metadata();
  console.log(`${file} ${JSON.stringify(region)}: ${edge} edge pixels un-composited`);
  return { buffer: trimmed, width: meta.width, height: meta.height };
}

/* ============================================================================================== */
/* Output                                                                                          */
/* ============================================================================================== */

const results = [];

async function emit(name, buffer, directory = brandDir) {
  const target = join(directory, name);
  const digest = createHash('sha256').update(buffer).digest('hex').slice(0, 12);

  if (checkOnly) {
    const existing = await readFile(target).catch(() => null);
    const existingDigest = existing
      ? createHash('sha256').update(existing).digest('hex').slice(0, 12)
      : null;
    results.push({ name, ok: existingDigest === digest, digest, existingDigest });
    return;
  }

  await writeFile(target, buffer);
  results.push({ name, ok: true, digest, bytes: buffer.length });
}

/**
 * Minimal ICO container. Modern browsers accept PNG payloads inside ICO, so each size is simply a
 * PNG with a directory entry in front of it — no bitmap encoding needed.
 */
function encodeIco(pngs) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(pngs.length, 4);
  const entries = [];
  let offset = 6 + 16 * pngs.length;
  for (const { size, buffer } of pngs) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size >= 256 ? 0 : size, 0);
    entry.writeUInt8(size >= 256 ? 0 : size, 1);
    entry.writeUInt8(0, 2);
    entry.writeUInt8(0, 3);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(buffer.length, 8);
    entry.writeUInt32LE(offset, 12);
    entries.push(entry);
    offset += buffer.length;
  }
  return Buffer.concat([header, ...entries, ...pngs.map((p) => p.buffer)]);
}

/* ============================================================================================== */
/* 1–2. Logo separation and crops                                                                  */
/* ============================================================================================== */

const nearWhite = (r, g, b) => Math.min(r, g, b) >= 244;
const WHITE = [255, 255, 255];

/** Measured from `nevix-primarylgog.png` (2172x724): the N spans x 171–611, the wordmark 716–2008. */
const mark = await logoRegion(
  'nevix-primarylgog.png',
  { left: 140, top: 60, width: 500, height: 600 },
  { isBackground: nearWhite, background: WHITE },
);
await emit('nevix-mark.png', mark.buffer);

/** The wordmark band only — the tagline below it is set in HTML wherever it is needed. */
async function wordmarkBand(file, columns, options) {
  const { data, info } = await sharp(supplied(file))
    .extract({ left: columns[0], top: 0, width: columns[1] - columns[0], height: 724 })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  // Rows containing artwork, grouped into bands: the first band is the wordmark, the second the
  // tagline.
  const bands = [];
  let start = null;
  for (let y = 0; y < info.height; y += 1) {
    let count = 0;
    for (let x = 0; x < info.width; x += 1) {
      const i = (y * info.width + x) * 4;
      if (!options.isBackground(data[i], data[i + 1], data[i + 2])) count += 1;
    }
    const has = count > 2;
    if (has && start === null) start = y;
    if ((!has || y === info.height - 1) && start !== null) {
      bands.push([start, y]);
      start = null;
    }
  }
  const [top, bottom] = bands.reduce((a, b) => (b[1] - b[0] > a[1] - a[0] ? b : a));
  return logoRegion(
    file,
    {
      left: columns[0],
      top: Math.max(0, top - 12),
      width: columns[1] - columns[0],
      height: bottom - top + 24,
    },
    options,
  );
}

const wordmarkDark = await wordmarkBand('nevix-primarylgog.png', [690, 2040], {
  isBackground: nearWhite,
  background: WHITE,
});
await emit('nevix-wordmark-dark.png', wordmarkDark.buffer);

const MIDNIGHT = [0, 7, 19];
const nearMidnight = (r, g, b) =>
  Math.max(Math.abs(r - MIDNIGHT[0]), Math.abs(g - MIDNIGHT[1]), Math.abs(b - MIDNIGHT[2])) <= 30;

const wordmarkLight = await wordmarkBand('nevix-wordmark.png', [340, 1840], {
  isBackground: nearMidnight,
  background: MIDNIGHT,
});
await emit('nevix-wordmark-light.png', wordmarkLight.buffer);

const silver = await logoRegion(
  'nevix-silvermonochrome.png',
  { left: 180, top: 80, width: 900, height: 1070 },
  { isBackground: nearWhite, background: WHITE },
);
// Only ever shown large and faint as a watermark, so half resolution is ample and saves ~500 KB.
const SILVER_WIDTH = 420;
silver.height = Math.round((silver.height * SILVER_WIDTH) / silver.width);
silver.width = SILVER_WIDTH;
silver.buffer = await sharp(silver.buffer)
  .resize({ width: SILVER_WIDTH, kernel: 'lanczos3' })
  .png({ compressionLevel: 9, palette: true, quality: 90 })
  .toBuffer();
await emit('nevix-mark-silver.png', silver.buffer);

/* ============================================================================================== */
/* 3. Icons                                                                                        */
/* ============================================================================================== */

/**
 * The supplied app icon is the glowing N on midnight. Small sizes are cropped a little tighter so
 * the N stays legible at 16–32px instead of shrinking into its own glow.
 */
async function icon(size, { tight = false } = {}) {
  const source = sharp(supplied('nevix-appicon.png'));
  const pipeline = tight
    ? source.extract({ left: 150, top: 110, width: 1000, height: 1000 })
    : source;
  // RGBA even though the icon is opaque: PNG payloads inside an ICO must carry an alpha channel,
  // and decoders (including Next's) reject the file otherwise.
  return pipeline
    .resize(size, size, { kernel: 'lanczos3' })
    .ensureAlpha()
    .png({ compressionLevel: 9 })
    .toBuffer();
}

await emit('icon-192.png', await icon(192));
await emit('icon-512.png', await icon(512));
await emit('icon.png', await icon(512), appDir);
await emit('apple-icon.png', await icon(180), appDir);
await emit(
  'favicon.ico',
  encodeIco([
    { size: 16, buffer: await icon(16, { tight: true }) },
    { size: 32, buffer: await icon(32, { tight: true }) },
    { size: 48, buffer: await icon(48, { tight: true }) },
  ]),
  appDir,
);

/* ============================================================================================== */
/* 4. Pictures                                                                                     */
/* ============================================================================================== */

async function picture(source, output, { directory = brandDir, extract, quality = 84 } = {}) {
  let pipeline = sharp(source);
  if (extract) pipeline = pipeline.extract(extract);
  const buffer = await pipeline.webp({ quality, effort: 5 }).toBuffer();
  const meta = await sharp(buffer).metadata();
  console.log(`${output}: ${meta.width}x${meta.height}`);
  await emit(output, buffer, directory);
}

/**
 * Team cards — finished compositions, published whole. They are not the same shape (the founder's
 * card is 3:2, the co-founder's square), so the page frames each at its own ratio rather than
 * forcing one on both.
 */
await picture(supplied('CEO.png'), 'jyoti-rokade.webp', { directory: teamDir, quality: 86 });
await picture(supplied('CoFounder.png'), 'vaidehi-bhagane.webp', {
  directory: teamDir,
  quality: 86,
});

/**
 * Homepage hero: the landscape half of `nevix-google.png`. The region stops short of the mug
 * (which carries the logo) on the left and the tag lines in the top-right corner.
 */
await picture(supplied('nevix-google.png'), 'nevix-hero-horizon.webp', {
  extract: { left: 760, top: 165, width: 912, height: 776 },
  quality: 86,
});

/** Presentation pieces, published whole on the brand page and wherever else they appear. */
const BOARDS = [
  ['nevix-google.png', 'nevix-workspace-sunset.webp'],
  ['nevix-wallpaper.png', 'nevix-wallpaper.webp'],
  ['nevix-walllogo.png', 'nevix-wall-sign.webp'],
  ['CEO-profile.png', 'nevix-badge.webp'],
  ['nevix-primarylgog.png', 'nevix-lockup-light.webp'],
  ['nevix-darkbg.png', 'nevix-lockup-dark.webp'],
  ['nevix-verticallogo.png', 'nevix-lockup-vertical.webp'],
  ['nevix-wordmark.png', 'nevix-wordmark-board.webp'],
  ['nevix-appicon.png', 'nevix-app-icon.webp'],
  ['nevix-silvermonochrome.png', 'nevix-mark-silver-board.webp'],
];
for (const [source, output] of BOARDS) await picture(supplied(source), output);
await picture(join(repoRoot, 'brand-assets', 'logo-summary.png'), 'nevix-brand-board.webp');

/* ============================================================================================== */
/* Report                                                                                          */
/* ============================================================================================== */

console.log();
const failed = results.filter((r) => !r.ok);
for (const r of results) {
  console.log(
    checkOnly
      ? `  ${r.ok ? 'up to date' : 'STALE    '}  ${r.name}  ${r.digest}${r.ok ? '' : ` (found ${r.existingDigest ?? 'nothing'})`}`
      : `  wrote  ${r.name}  ${r.bytes} bytes  ${r.digest}`,
  );
}

console.log(
  `\nmark ${mark.width}x${mark.height}  wordmark-dark ${wordmarkDark.width}x${wordmarkDark.height}  ` +
    `wordmark-light ${wordmarkLight.width}x${wordmarkLight.height}  silver ${silver.width}x${silver.height}`,
);

if (checkOnly && failed.length > 0) {
  console.error(
    `\n${failed.length} derived asset(s) are stale. Run: node ${'scripts/derive-brand-assets.mjs'}`,
  );
  process.exit(1);
}
