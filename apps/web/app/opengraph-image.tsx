import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import { ImageResponse } from 'next/og';

import { brandAssets, siteConfig } from '@/content/site';

/**
 * Default OpenGraph / social sharing image.
 *
 * Generated rather than shipped as a file so it stays consistent with the brand tokens. The
 * composition follows the supplied NEVIX artwork: the glowing N and white wordmark on midnight,
 * the brand line, and the tagline beneath a short gradient rule.
 *
 * The N and the wordmark are the derived logo files (see scripts/derive-brand-assets.mjs), read
 * from disk at build time and embedded — the logo is never redrawn in markup.
 */
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = `${siteConfig.name} — ${siteConfig.headline} ${siteConfig.tagline}`;

async function asDataUrl(publicPath: string) {
  const bytes = await readFile(join(process.cwd(), 'public', publicPath));
  return `data:image/png;base64,${bytes.toString('base64')}`;
}

export default async function OpengraphImage() {
  const [mark, wordmark] = await Promise.all([
    asDataUrl(brandAssets.mark.src),
    asDataUrl(brandAssets.wordmarkLight.src),
  ]);

  const markHeight = 300;
  const markWidth = Math.round((markHeight * brandAssets.mark.width) / brandAssets.mark.height);
  const wordWidth = 420;
  const wordHeight = Math.round(
    (wordWidth * brandAssets.wordmarkLight.height) / brandAssets.wordmarkLight.width,
  );

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        padding: '0 88px',
        gap: '72px',
        background:
          'radial-gradient(620px 420px at 22% 50%, rgba(11,92,255,0.45), transparent 70%),' +
          'radial-gradient(700px 300px at 70% 120%, rgba(255,154,77,0.16), transparent 70%),' +
          'radial-gradient(600px 400px at 100% 0%, rgba(0,200,255,0.18), transparent 60%),' +
          'linear-gradient(160deg, #02060f 0%, #050b1a 55%, #061030 100%)',
        fontFamily: 'sans-serif',
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse renders plain img only */}
      <img src={mark} width={markWidth} height={markHeight} alt="" />

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse renders plain img only */}
        <img src={wordmark} width={wordWidth} height={wordHeight} alt="" />

        <div
          style={{
            marginTop: '44px',
            fontSize: '64px',
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: '-0.03em',
            color: '#ffffff',
            display: 'flex',
          }}
        >
          {siteConfig.headline}
        </div>

        <div
          style={{
            marginTop: '28px',
            width: '72px',
            height: '3px',
            borderRadius: '999px',
            background: 'linear-gradient(90deg, #33c6ff, #0b55f0)',
          }}
        />

        <div
          style={{
            marginTop: '22px',
            fontSize: '24px',
            fontWeight: 600,
            letterSpacing: '0.24em',
            color: '#7ddcff',
          }}
        >
          {siteConfig.tagline.toUpperCase()}
        </div>

        <div style={{ marginTop: '18px', fontSize: '22px', color: '#93a0b6' }}>
          {siteConfig.pillarLine}
        </div>
      </div>
    </div>,
    size,
  );
}
