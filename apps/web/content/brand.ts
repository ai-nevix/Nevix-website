/**
 * Brand page content.
 *
 * Every picture listed here is supplied NEVIX artwork from `brand-assets/nevix/`, re-encoded by
 * scripts/derive-brand-assets.mjs and published whole — none is cropped, retouched or redrawn. The
 * alternative text describes what each picture actually shows, including any words set into it,
 * because those words are pixels a screen reader cannot otherwise reach.
 *
 * The palette and type entries describe how this website applies the identity. They are design
 * tokens drawn from the artwork (see app/globals.css), not a separately issued brand standard.
 */

/**
 * The Brand page is hidden for now, at the company's request (2026-10-10): `/brand` returns a 404,
 * and it is left out of the footer and the sitemap. Its content, code and images are kept so it can
 * come back unchanged — set this to `true` and the page, its footer link and its sitemap entry all
 * return together.
 */
export const BRAND_PAGE_ENABLED = false;

export interface BrandPicture {
  src: string;
  width: number;
  height: number;
  title: string;
  caption: string;
  alt: string;
  /** Background the picture is presented on — matches the artwork's own background. */
  surface: 'light' | 'dark';
}

export const brandIntro = {
  eyebrow: 'Brand',
  title: 'The NEVIX identity',
  description:
    'The mark, the wordmark and the world they live in. Everything on this page is the supplied NEVIX artwork, shown whole.',
};

export const markStory = {
  title: 'An N, written in light',
  paragraphs: [
    'The NEVIX mark is a single letter built from three strokes: a rising left stroke, a rounded diagonal that carries the eye forward, and a right stroke the diagonal folds into. Drawn in one movement, it reads as connected systems and continuous flow — work that keeps moving forward.',
    'It is lit from deep electric blue to bright cyan, the same light that runs through the wordmark’s X. On midnight it glows; on white it holds its own as clean, solid colour.',
  ],
  lines: [
    { label: 'Tagline', value: 'Explore. Automate. Evolve.' },
    { label: 'Brand line', value: 'Intelligence in Motion.' },
  ],
};

export const lockups: readonly BrandPicture[] = [
  {
    src: '/brand/nevix-lockup-light.webp',
    width: 2172,
    height: 724,
    title: 'Primary logo',
    caption: 'Horizontal lockup for light backgrounds.',
    alt: 'The primary NEVIX logo on white: the blue gradient N beside the navy NEVIX wordmark, whose X is picked out in blue, above the tagline Explore. Automate. Evolve.',
    surface: 'light',
  },
  {
    src: '/brand/nevix-lockup-dark.webp',
    width: 2172,
    height: 724,
    title: 'On midnight',
    caption: 'Horizontal lockup for dark backgrounds, with the glow of the N.',
    alt: 'The NEVIX logo on a midnight background: the glowing blue N beside the white NEVIX wordmark with a blue X, above the tagline Explore. Automate. Evolve.',
    surface: 'dark',
  },
  {
    src: '/brand/nevix-wordmark-board.webp',
    width: 2172,
    height: 724,
    title: 'Wordmark',
    caption: 'The wordmark alone, for places the N already appears.',
    alt: 'The NEVIX wordmark in white with a blue gradient X on a midnight background, above the tagline Explore. Automate. Evolve.',
    surface: 'dark',
  },
];

export const marks: readonly BrandPicture[] = [
  {
    src: '/brand/nevix-lockup-vertical.webp',
    width: 1024,
    height: 1536,
    title: 'Vertical logo',
    caption: 'Stacked lockup for tall and square formats.',
    alt: 'The vertical NEVIX logo on midnight: the glowing N above the white wordmark and the tagline Explore. Automate. Evolve.',
    surface: 'dark',
  },
  {
    src: '/brand/nevix-app-icon.webp',
    width: 1254,
    height: 1254,
    title: 'App icon',
    caption: 'The N on its own, glowing on midnight. Used for the favicon and app icons.',
    alt: 'The NEVIX app icon: the N in luminous blue and cyan on a deep midnight square.',
    surface: 'dark',
  },
  {
    src: '/brand/nevix-mark-silver-board.webp',
    width: 1254,
    height: 1254,
    title: 'Silver monochrome',
    caption: 'Single-colour mark for print, embossing and quiet surfaces.',
    alt: 'The NEVIX N in brushed silver on white.',
    surface: 'light',
  },
];

export const brandBoard: BrandPicture = {
  src: '/brand/nevix-brand-board.webp',
  width: 1536,
  height: 1024,
  title: 'Logo summary',
  caption: 'Every approved form of the logo on one board, with clear space and minimum size.',
  alt: 'The NEVIX logo summary board: the primary horizontal logo, the logo on a dark background, the vertical logo, the wordmark alone, app icons, monochrome and single-colour versions, the minimum size and clear space, and the logo applied to an illuminated wall sign, embossed paper and a laptop lid.',
  surface: 'light',
};

export const inTheWorld: readonly BrandPicture[] = [
  {
    src: '/brand/nevix-wall-sign.webp',
    width: 1928,
    height: 815,
    title: 'Wall sign',
    caption: 'The logo as an illuminated studio sign.',
    alt: 'The NEVIX logo as an illuminated sign on a dark textured wall: the N glowing blue beside the white wordmark and the tagline Explore. Automate. Evolve.',
    surface: 'dark',
  },
  {
    src: '/brand/nevix-workspace-sunset.webp',
    width: 1672,
    height: 941,
    title: 'Intelligence in motion',
    caption: 'The brand line, set in a workspace at first light.',
    alt: 'A NEVIX workspace overlooking a city and mountains at sunset. A panel shows the NEVIX logo, the words Intelligence in Motion and Transforming ideas into real-world impact, with AI solutions, automation systems, machine learning and digital solutions. The corner reads Think bolder. Build smarter. Grow together. A laptop and mug carry the N.',
    surface: 'dark',
  },
  {
    src: '/brand/nevix-wallpaper.webp',
    width: 1672,
    height: 941,
    title: 'Wallpaper',
    caption: 'People, ideas, technology, progress.',
    alt: 'The NEVIX wallpaper: a workspace overlooking a city at sunset, the NEVIX logo and tagline above six themes — ideas, automation, technology, progress, people and impact — with the words People, ideas, technology, progress and A smarter tomorrow, together.',
    surface: 'dark',
  },
  {
    src: '/brand/nevix-badge.webp',
    width: 1254,
    height: 1254,
    title: 'Profile badge',
    caption: 'Round badge for social profiles.',
    alt: 'A round NEVIX badge: the glowing N and the NEVIX wordmark over snow-capped mountains at sunrise, with the tagline Explore. Automate. Evolve., inside a luminous blue ring.',
    surface: 'dark',
  },
];

/** Colour tokens as this site applies them — see app/globals.css. */
export const palette = [
  { name: 'Electric blue', hex: '#0B5CFF', role: 'The body of the N. Primary actions and links.' },
  { name: 'Cyan', hex: '#00C8FF', role: 'The leading edge of the gradient. Accents on midnight.' },
  { name: 'Indigo', hex: '#1F2FD6', role: 'The deepest stroke of the N. Depth in gradients.' },
  { name: 'Midnight', hex: '#050B1A', role: 'The ground the logo is lit on. Dark sections.' },
  { name: 'Horizon', hex: '#FF9A4D', role: 'First light in the photography. Hairlines only.' },
  { name: 'Cloud', hex: '#F6F8FC', role: 'Light sections and quiet surfaces.' },
] as const;

export const typefaces = [
  {
    name: 'Sora',
    role: 'Headings',
    note: 'Geometric and slightly wide — the closest open typeface to the NEVIX wordmark.',
    className: 'font-display',
  },
  {
    name: 'Manrope',
    role: 'Body copy',
    note: 'Open and even at reading sizes, where Sora’s width would tire the eye.',
    className: 'font-sans',
  },
] as const;

/** Transparent logo files published by the asset pipeline, for press and partners. */
export const downloads = [
  { label: 'N mark', file: '/brand/nevix-mark.png', note: 'PNG, transparent, 450 × 551' },
  {
    label: 'Wordmark for dark backgrounds',
    file: '/brand/nevix-wordmark-light.png',
    note: 'PNG, transparent, 1457 × 255',
  },
  {
    label: 'Wordmark for light backgrounds',
    file: '/brand/nevix-wordmark-dark.png',
    note: 'PNG, transparent, 1302 × 268',
  },
  { label: 'App icon', file: '/brand/icon-512.png', note: 'PNG, 512 × 512' },
] as const;
