import type { Metadata, Viewport } from 'next';
import { Manrope } from 'next/font/google';
import type { ReactNode } from 'react';

import { JsonLd } from '@/components/seo/json-ld';
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

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en-GB" className={manrope.variable} suppressHydrationWarning>
      <body className="min-h-dvh bg-light font-sans antialiased">
        <JsonLd id="organization" data={organizationSchema()} />
        <JsonLd id="website" data={websiteSchema()} />
        {children}
      </body>
    </html>
  );
}
