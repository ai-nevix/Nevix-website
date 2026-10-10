import type { Metadata, Viewport } from 'next';
import { Manrope, Sora } from 'next/font/google';
import type { ReactNode } from 'react';

import { PointerEffects } from '@/components/effects/pointer-effects';
import { JsonLd } from '@/components/seo/json-ld';
import { INTRO_ENABLED, INTRO_STORAGE_KEY, INTRO_TOTAL_MS } from '@/lib/brand/intro-config';
import { buildRootMetadata } from '@/lib/seo/metadata';
import { organizationSchema, websiteSchema } from '@/lib/seo/structured-data';

import './globals.css';

/**
 * Two typefaces: Manrope for body copy and Sora for headings. Sora's geometric, slightly wide
 * letterforms are the closest open typeface to the NEVIX wordmark, so headings sit naturally beside
 * the logo; Manrope stays on long-form text, where Sora's width would tire the eye.
 *
 * `next/font` downloads and self-hosts the files at build time, so no request goes to a font CDN
 * at runtime — which is both faster and what allows the Content Security Policy to forbid
 * external font and style origins outright.
 */
const manrope = Manrope({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-manrope',
  weight: ['400', '500', '600', '700', '800'],
  fallback: ['ui-sans-serif', 'system-ui', 'Segoe UI', 'Roboto', 'sans-serif'],
});

const sora = Sora({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sora',
  weight: ['500', '600', '700'],
  fallback: ['ui-sans-serif', 'system-ui', 'Segoe UI', 'Roboto', 'sans-serif'],
});

export const metadata: Metadata = buildRootMetadata();

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    // The header is midnight on every page, so the browser chrome matches it in both schemes.
    { media: '(prefers-color-scheme: light)', color: '#02060f' },
    { media: '(prefers-color-scheme: dark)', color: '#02060f' },
  ],
};

/**
 * Decides whether the welcome intro plays, and paints its curtain, before the first paint.
 *
 * This runs ahead of React on purpose. A client component cannot render before hydration, so an
 * intro that lived only in React would show the homepage first and then cover it — a flash on
 * every first visit. Setting the class here lets CSS fill the screen with the brand midnight
 * immediately (see globals.css), and the React overlay then mounts on top of the same colour.
 *
 * Four conditions, all decided here so nothing can disagree with anything else: the homepage
 * only, once per browsing session, never under reduced motion, and never when the intro is
 * switched off.
 *
 * The failsafe timer matters more than it looks. If the bundle never arrives, or throws, nothing
 * else would ever clear the curtain and the site would be unreachable behind it. This guarantees
 * the page is handed back regardless of what React does — the animation can fail without taking
 * the site with it.
 *
 * Any storage failure (private browsing, blocked cookies) simply means no intro.
 */
function buildIntroArmingScript({
  enabled,
  storageKey,
  failsafeMs,
}: {
  enabled: boolean;
  storageKey: string;
  failsafeMs: number;
}) {
  if (!enabled) return null;

  return `(function(){try{
if(location.pathname!=='/')return;
if(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
if(sessionStorage.getItem(${JSON.stringify(storageKey)}))return;
sessionStorage.setItem(${JSON.stringify(storageKey)},'1');
var d=document.documentElement;d.classList.add('nevix-intro-armed');
setTimeout(function(){d.classList.remove('nevix-intro-armed');},${failsafeMs});
}catch(e){}})();`;
}

const introArmingScript = buildIntroArmingScript({
  enabled: INTRO_ENABLED,
  storageKey: INTRO_STORAGE_KEY,
  // Comfortably past the end of the animation, so it only ever fires when React did not.
  failsafeMs: INTRO_TOTAL_MS + 1500,
});

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en-GB" className={`${manrope.variable} ${sora.variable}`} suppressHydrationWarning>
      <body className="min-h-dvh bg-light font-sans antialiased">
        {introArmingScript ? (
          <script dangerouslySetInnerHTML={{ __html: introArmingScript }} />
        ) : null}
        <JsonLd id="organization" data={organizationSchema()} />
        <JsonLd id="website" data={websiteSchema()} />
        {children}
        <PointerEffects />
      </body>
    </html>
  );
}
