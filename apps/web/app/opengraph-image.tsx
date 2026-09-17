import { ImageResponse } from 'next/og';

import { siteConfig } from '@/content/site';

/**
 * Default OpenGraph / social sharing image.
 *
 * Generated rather than shipped as a file so it stays consistent with the brand tokens. The
 * layout follows the supplied brand board: midnight field, blue/cyan light, the positioning line
 * and the tagline. The logo artwork is not redrawn here — the mark is represented by the brand
 * gradient and typography only, and the authoritative logo asset is used everywhere it appears as
 * an image.
 */
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = `${siteConfig.name} — ${siteConfig.positioning}`;

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '72px',
        background:
          'radial-gradient(900px 500px at 8% -8%, rgba(37,99,235,0.42), transparent 62%),' +
          'radial-gradient(700px 440px at 95% 10%, rgba(6,182,212,0.28), transparent 60%),' +
          'linear-gradient(160deg, #05070f 0%, #0a0f1c 55%, #0b1120 100%)',
        fontFamily: 'sans-serif',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
        <div
          style={{
            width: '14px',
            height: '52px',
            borderRadius: '999px',
            background: 'linear-gradient(180deg, #22d3ee 0%, #2563eb 100%)',
          }}
        />
        <div
          style={{
            fontSize: '40px',
            fontWeight: 800,
            letterSpacing: '0.16em',
            color: '#ffffff',
          }}
        >
          {siteConfig.name}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            fontSize: '68px',
            fontWeight: 800,
            lineHeight: 1.08,
            letterSpacing: '-0.03em',
            color: '#ffffff',
            maxWidth: '900px',
          }}
        >
          Intelligent Technology for a Smarter Tomorrow.
        </div>
        <div
          style={{
            marginTop: '28px',
            fontSize: '28px',
            color: '#94a3b8',
            maxWidth: '880px',
            lineHeight: 1.4,
          }}
        >
          AI · Automation · Digital Engineering · Data &amp; Analytics
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid rgba(148,163,184,0.22)',
          paddingTop: '28px',
        }}
      >
        <div
          style={{
            fontSize: '24px',
            fontWeight: 700,
            letterSpacing: '0.12em',
            color: '#22d3ee',
          }}
        >
          {siteConfig.tagline.toUpperCase()}
        </div>
        <div style={{ fontSize: '22px', color: '#64748b' }}>vastrix.ai</div>
      </div>
    </div>,
    size,
  );
}
