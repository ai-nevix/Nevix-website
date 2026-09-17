/**
 * Security headers shared by Next.js (next.config.mjs) and the Nginx configuration generator.
 *
 * Specification §22 and instruction §32. Defined once in JavaScript so the two layers cannot drift:
 * `scripts/generate-nginx-headers.mjs` renders these into `infra/nginx/snippets/security-headers.conf`.
 */

/**
 * Content Security Policy directives.
 *
 * script-src includes 'unsafe-inline'. This is a deliberate, measured decision — see
 * docs/security/threat-model.md and docs/architecture/adr/ADR-010-csp-unsafe-inline.md.
 *
 * In short: Next.js App Router emits inline bootstrap and RSC-payload scripts in the prerendered
 * HTML. A nonce cannot cover them, because the nonce must be generated per request while the HTML
 * is generated once at build time — the two can never match on a statically rendered page, and we
 * verified that they do not. The alternative is to render every page dynamically, which would
 * contradict the rendering strategy the specification mandates in §13 and §23.1.
 *
 * The residual risk is constrained by the rest of the policy rather than left open:
 * - `connect-src 'self'` — an injected script cannot exfiltrate to an external host
 * - `script-src` lists no external origin, so no third-party script can be loaded at all
 * - `form-action 'self'` — credential and form-post hijacking to another origin is blocked
 * - `object-src 'none'`, `base-uri 'self'`, `frame-ancestors 'none'`
 * - the application renders no user-supplied HTML; the single `dangerouslySetInnerHTML` in the
 *   codebase is escaped JSON-LD (components/seo/json-ld.tsx)
 *
 * Other deliberate relaxations:
 * - `'unsafe-inline'` for style-src: Next.js injects inline styles for critical CSS and
 *   `next/image` sizing.
 * - `'unsafe-eval'` in development only, for React Fast Refresh.
 * - No analytics, tag manager or third-party script origin is permitted — see ADR-009.
 *
 * @param {{ isDev?: boolean, cmsOrigin?: string, apiOrigin?: string }} options
 * @returns {string}
 */
export function contentSecurityPolicy({ isDev = false, cmsOrigin = '', apiOrigin = '' } = {}) {
  const extraOrigins = [cmsOrigin, apiOrigin].filter(Boolean).join(' ');

  const directives = {
    'default-src': ["'self'"],
    'base-uri': ["'self'"],
    'script-src': ["'self'", "'unsafe-inline'", ...(isDev ? ["'unsafe-eval'"] : [])],
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': ["'self'", 'data:', 'blob:', extraOrigins].filter(Boolean),
    'font-src': ["'self'", 'data:'],
    'connect-src': ["'self'", extraOrigins, ...(isDev ? ['ws:', 'wss:'] : [])].filter(Boolean),
    'media-src': ["'self'"],
    'object-src': ["'none'"],
    'frame-src': ["'none'"],
    'frame-ancestors': ["'none'"],
    'form-action': ["'self'"],
    'manifest-src': ["'self'"],
    'worker-src': ["'self'", 'blob:'],
  };

  const rendered = Object.entries(directives)
    .map(([key, values]) => `${key} ${values.join(' ')}`)
    .join('; ');

  // upgrade-insecure-requests would break plain-HTTP local development.
  return isDev ? rendered : `${rendered}; upgrade-insecure-requests`;
}

/**
 * @param {{ isDev?: boolean, cmsOrigin?: string, apiOrigin?: string }} options
 * @returns {{ key: string, value: string }[]}
 */
export function securityHeaders({ isDev = false, cmsOrigin = '', apiOrigin = '' } = {}) {
  /** @type {{ key: string, value: string }[]} */
  const headers = [
    {
      key: 'Content-Security-Policy',
      value: contentSecurityPolicy({ isDev, cmsOrigin, apiOrigin }),
    },
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'X-Frame-Options', value: 'DENY' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    { key: 'X-DNS-Prefetch-Control', value: 'off' },
    { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
    { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
    {
      key: 'Permissions-Policy',
      value: [
        'accelerometer=()',
        'autoplay=()',
        'camera=()',
        'display-capture=()',
        'encrypted-media=()',
        'fullscreen=(self)',
        'geolocation=()',
        'gyroscope=()',
        'magnetometer=()',
        'microphone=()',
        'midi=()',
        'payment=()',
        'usb=()',
        'interest-cohort=()',
      ].join(', '),
    },
  ];

  // HSTS is only meaningful over HTTPS and would strand a developer on http://localhost.
  if (!isDev) {
    headers.push({
      key: 'Strict-Transport-Security',
      value: 'max-age=63072000; includeSubDomains; preload',
    });
  }

  return headers;
}
