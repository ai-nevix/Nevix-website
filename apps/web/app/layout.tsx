import type { Metadata, Viewport } from 'next';
import { Manrope } from 'next/font/google';
import type { ReactNode } from 'react';

import { JsonLd } from '@/components/seo/json-ld';
import { INTRO_ENABLED, INTRO_STORAGE_KEY, INTRO_TOTAL_MS } from '@/lib/brand/intro-config';
import { buildRootMetadata } from '@/lib/seo/metadata';
import { organizationSchema, websiteSchema } from '@/lib/seo/structured-data';

import './globals.css';

/**
 * Manrope is the VASTRIX brand typeface (specification §4).
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

export const metadata: Metadata = buildRootMetadata();

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f8fafc' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0f1c' },
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
var d=document.documentElement;d.classList.add('vastrix-intro-armed');
setTimeout(function(){d.classList.remove('vastrix-intro-armed');},${failsafeMs});
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
    <html lang="en-GB" className={manrope.variable} suppressHydrationWarning>
      <body className="min-h-dvh bg-light font-sans antialiased">
        {introArmingScript ? (
          <script dangerouslySetInnerHTML={{ __html: introArmingScript }} />
        ) : null}
        <JsonLd id="organization" data={organizationSchema()} />
        <JsonLd id="website" data={websiteSchema()} />
        {children}
      </body>
    </html>
  );
}
