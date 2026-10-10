/**
 * Derives the brand assets the site needs from the supplied originals.
 *
 * The supplied files are the source of truth and are never edited in place. Everything this
 * script writes is reproducible by rerunning it, so a corrected original can simply be dropped in.
 *
 * Two derivations, both mechanical:
 *
 * 1. **Matte repair.** Every supplied asset carrying transparency has a pure white matte baked
 *    into its antialiased edge — the artwork was flattened onto white, and the edge pixels kept
 *    white in their colour channel while their alpha was preserved. On a light background that is
 *    invisible. On the brand midnight it reads as a thin light outline around every stroke, like
 *    a sticker.
 *
 *    The fix carries each pixel's colour in from the nearest fully opaque pixel and leaves its
 *    alpha untouched. Shape, proportion, gradient and colour are unchanged; only the colour of
 *    pixels that are already partly or wholly transparent is corrected. This repairs a
 *    compositing artifact — it does not redraw the logo.
 *
 *    The bleed deliberately covers *fully* transparent pixels too, which looks pointless and is
 *    not. The mark is displayed far larger than its 256px source, and every scaler interpolates
 *    the colour channel across neighbours without regard to alpha. Leaving white behind an alpha
 *    of zero therefore puts it straight back along every edge as soon as the image is enlarged —
 *    which is exactly the halo this repair is meant to remove. Verified: before the bleed was
 *    extended, 938 of 2435 edge pixels were white again at display size.
 *
 * 2. **Wordmark crops.** The lockups place the wordmark in a band beneath the mark. Cropping that
 *    band gives a wordmark that can be revealed separately from the emblem. It is a trim of the
 *    supplied artwork, not a redrawing.
 *
 * 3. **Team cards.** The supplied team images are composed marketing cards: the logo, the
 *    person's name, their title and a quote are all part of the artwork. They are published whole
 *    and uncropped, so the composition arrives as it was designed. Only the encoding changes —
 *    PNG and WebP sources become one consistent WebP at a sensible size.
 *
 *    Because the name and title are then pixels rather than text, the page carries them
 *    separately for machines: in the image's alternative text, in a visually hidden caption, and
 *    in the `Person` structured data. Nothing a sighted visitor sees is duplicated.
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
const brandDir = join(repoRoot, 'apps', 'web', 'public', 'brand');
const checkOnly = process.argv.includes('--check');

/** Alpha at or above this counts as solid artwork whose colour can be trusted. */
const OPAQUE = 250;

/**
 * Replaces the colour of every partly transparent pixel with the colour of the nearest opaque
 * one, by breadth-first expansion outward from the solid artwork. Alpha is never touched.
 */
function repairMatte(data, width, height) {
  const size = width * height;
  const source = new Int32Array(size).fill(-1);
  const queue = [];

  for (let i = 0; i < size; i += 1) {
    if (data[i * 4 + 3] >= OPAQUE) {
      source[i] = i;
      queue.push(i);
    }
  }

  // Breadth-first, so the first source to reach a pixel is a nearest one.
  for (let head = 0; head < queue.length; head += 1) {
    const index = queue[head];
    const x = index % width;
    const y = (index - x) / width;

    for (const [dx, dy] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
      [1, 1],
      [1, -1],
      [-1, 1],
      [-1, -1],
    ]) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;

      const neighbour = ny * width + nx;
      if (source[neighbour] !== -1) continue;

      source[neighbour] = source[index];
      queue.push(neighbour);
    }
  }

  let repaired = 0;
  for (let i = 0; i < size; i += 1) {
    const from = source[i];
    if (from === -1 || from === i) continue;
    data[i * 4] = data[from * 4];
    data[i * 4 + 1] = data[from * 4 + 1];
    data[i * 4 + 2] = data[from * 4 + 2];
    repaired += 1;
  }

  return repaired;
}

/**
 * Removes the pale ring left along the outside of the solid artwork by the same flattening.
 *
 * The matte bleed above cannot reach these: they are fully opaque, so by every reasonable
 * definition they are the artwork. But the boundary pixel of each stroke is a blend of the stroke
 * colour and the white it was flattened onto — `#a2d3f6` where the stroke itself is `#0086f9` —
 * and at the size the intro shows the mark, that one pixel becomes a visible outline.
 *
 * White is detected by the smallest channel rather than by luminance, which matters for this
 * palette: the brand blues and cyans all have a channel at or near zero, while anything diluted
 * with white does not. A bright cyan highlight is therefore left alone and a washed edge is not.
 *
 * Only the outermost ring is considered, and only where it is measurably whiter than the pixel
 * inside it, so the correction can never be more than one pixel deep.
 */
function repairBoundaryRing(data, width, height, { threshold = 20 } = {}) {
  const size = width * height;
  const alphaAt = (i) => data[i * 4 + 3];
  const minChannel = (i) => Math.min(data[i * 4], data[i * 4 + 1], data[i * 4 + 2]);

  const neighbours = (i) => {
    const x = i % width;
    const y = (i - x) / width;
    const out = [];
    for (const [dx, dy] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ]) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx >= 0 && ny >= 0 && nx < width && ny < height) out.push(ny * width + nx);
    }
    return out;
  };

  const ring = new Set();
  for (let i = 0; i < size; i += 1) {
    if (alphaAt(i) < OPAQUE) continue;
    if (neighbours(i).some((n) => alphaAt(n) < OPAQUE)) ring.add(i);
  }

  // Read every replacement before writing any, so a corrected pixel cannot become the source for
  // the next one and walk the correction inward.
  const replacements = [];
  for (const i of ring) {
    const interior = neighbours(i).filter((n) => alphaAt(n) >= OPAQUE && !ring.has(n));
    if (interior.length === 0) continue;

    const best = interior.reduce((a, b) => (minChannel(a) <= minChannel(b) ? a : b));
    if (minChannel(i) - minChannel(best) > threshold) replacements.push([i, best]);
  }

  for (const [target, source] of replacements) {
    data[target * 4] = data[source * 4];
    data[target * 4 + 1] = data[source * 4 + 1];
    data[target * 4 + 2] = data[source * 4 + 2];
  }

  return { ring: ring.size, corrected: replacements.length };
}

/** Counts edge pixels whose colour is close to white — the signature of the matte. */
function countWhiteFringe(data, size) {
  let total = 0;
  let white = 0;
  for (let i = 0; i < size; i += 1) {
    const a = data[i * 4 + 3];
    if (a <= 20 || a >= 200) continue;
    total += 1;
    const [r, g, b] = [data[i * 4], data[i * 4 + 1], data[i * 4 + 2]];
    if (0.2126 * r + 0.7152 * g + 0.0722 * b > 200) white += 1;
  }
  return { total, white };
}

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

// ---- 1. The mark, matte repaired -----------------------------------------------------------
{
  const input = join(brandDir, 'vastrix-symbol.png');
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const before = countWhiteFringe(data, info.width * info.height);
  // Order matters: the ring is corrected from artwork that is still original, then the matte is
  // bled outward from the corrected ring.
  const ring = repairBoundaryRing(data, info.width, info.height);
  const repaired = repairMatte(data, info.width, info.height);
  const after = countWhiteFringe(data, info.width * info.height);

  console.log(
    `vastrix-symbol.png:\n` +
      `  matte      ${before.white}/${before.total} semi-transparent edge pixels were white; ` +
      `${repaired} pixels bled; now ${after.white}/${after.total}\n` +
      `  ring       ${ring.corrected} of ${ring.ring} boundary pixels were diluted with white and were corrected`,
  );

  const png = await sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png({ compressionLevel: 9 })
    .toBuffer();

  await emit('vastrix-symbol-clean.png', png);
}

// ---- 2. Wordmarks, cropped from the supplied lockups ----------------------------------------
/**
 * Finds the wordmark band. The light lockup is flattened onto opaque white, so content is
 * detected by colour there; the dark one is transparent, so alpha works.
 */
async function cropWordmark({ file, output, byAlpha, repair }) {
  const input = join(brandDir, file);
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width: W, height: H } = info;

  const present = (x, y) => {
    const i = (y * W + x) * 4;
    if (byAlpha) return data[i + 3] > 40;
    if (data[i + 3] < 40) return false;
    return 255 - data[i] + (255 - data[i + 1]) + (255 - data[i + 2]) > 60;
  };

  const bands = [];
  let start = null;
  for (let y = 0; y < H; y += 1) {
    let count = 0;
    for (let x = 0; x < W; x += 1) if (present(x, y)) count += 1;
    const has = count > 2;
    if (has && start === null) start = y;
    if ((!has || y === H - 1) && start !== null) {
      bands.push([start, has ? y : y - 1]);
      start = null;
    }
  }
  if (bands.length < 2) throw new Error(`${file}: expected a mark band and a wordmark band`);

  const [top, bottom] = bands[bands.length - 1];
  let left = W;
  let right = 0;
  for (let y = top; y <= bottom; y += 1)
    for (let x = 0; x < W; x += 1)
      if (present(x, y)) {
        if (x < left) left = x;
        if (x > right) right = x;
      }

  let pipeline = sharp(input).extract({
    left,
    top,
    width: right - left + 1,
    height: bottom - top + 1,
  });

  if (repair) {
    // Same two corrections as the mark: the ring first, then the matte outward from it.
    const cropped = await pipeline.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    repairBoundaryRing(cropped.data, cropped.info.width, cropped.info.height);
    repairMatte(cropped.data, cropped.info.width, cropped.info.height);
    pipeline = sharp(cropped.data, {
      raw: { width: cropped.info.width, height: cropped.info.height, channels: 4 },
    });
  }

  console.log(`${file}: wordmark band y ${top}-${bottom}, x ${left}-${right}`);
  await emit(output, await pipeline.png({ compressionLevel: 9 }).toBuffer());
}

await cropWordmark({
  file: 'vastrix-logo-dark.png',
  output: 'vastrix-wordmark-light.png',
  byAlpha: true,
  repair: true,
});
await cropWordmark({
  file: 'vastrix-logo.png',
  output: 'vastrix-wordmark-dark.png',
  byAlpha: false,
  repair: false,
});

// ---- 3. Team cards -------------------------------------------------------------------------
/**
 * Published whole. The supplied files are square and already composed, so there is nothing to
 * crop and no framing decision to make — an earlier version cropped to the face and lost the
 * design around it.
 *
 * They are not resized either. The sources differ (1254px and 912px) and upscaling the smaller
 * one to match would invent detail; both are square, so they sit in a square frame identically
 * whatever their pixel size.
 */
const TEAM_CARDS = [
  { source: 'CEO.png', output: 'jyoti-rokade.webp' },
  { source: 'CoFounder.png', output: 'vaidehi-bhagane.webp' },
];

const suppliedDir = join(repoRoot, 'brand-assets');
const teamDir = join(repoRoot, 'apps', 'web', 'public', 'team');

for (const card of TEAM_CARDS) {
  const input = join(suppliedDir, card.source);
  const meta = await sharp(input).metadata();

  if (meta.width !== meta.height) {
    throw new Error(
      `${card.source}: expected a square card, got ${meta.width}x${meta.height}. The team grid ` +
        `frames these 1:1, so a non-square source would be cropped.`,
    );
  }

  const buffer = await sharp(input).webp({ quality: 88 }).toBuffer();

  console.log(
    `${card.source}: ${meta.width}x${meta.height} ${meta.format} -> webp, published uncropped`,
  );
  await emit(card.output, buffer, teamDir);
}

// ---- Report ---------------------------------------------------------------------------------
console.log();
const failed = results.filter((r) => !r.ok);
for (const r of results) {
  console.log(
    checkOnly
      ? `  ${r.ok ? 'up to date' : 'STALE    '}  ${r.name}  ${r.digest}${r.ok ? '' : ` (found ${r.existingDigest ?? 'nothing'})`}`
      : `  wrote  ${r.name}  ${r.bytes} bytes  ${r.digest}`,
  );
}

if (checkOnly && failed.length > 0) {
  console.error(
    `\n${failed.length} derived asset(s) are stale. Run: node ${'scripts/derive-brand-assets.mjs'}`,
  );
  process.exit(1);
}
