/**
 * Strapi middleware stack.
 *
 * Security headers are set by Nginx at the edge, but Strapi sets its own too so a direct call —
 * or a misconfigured proxy — still gets them.
 */
module.exports = [
  'strapi::logger',
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:'],
          // The admin panel renders uploaded media; blob: and data: are required for previews.
          'img-src': ["'self'", 'data:', 'blob:'],
          'media-src': ["'self'", 'data:', 'blob:'],
          'frame-ancestors': ["'none'"],
          upgradeInsecureRequests: null,
        },
      },
      frameguard: { action: 'deny' },
      hsts: { maxAge: 63072000, includeSubDomains: true, preload: true },
    },
  },
  {
    name: 'strapi::cors',
    config: {
      // The website reads content server-side, so no browser origin needs cross-origin access by
      // default. Populate CMS_CORS_ORIGINS only if a browser client genuinely requires it.
      origin: (process.env.CMS_CORS_ORIGINS || '').split(',').filter(Boolean),
      methods: ['GET', 'HEAD', 'OPTIONS'],
      credentials: false,
    },
  },
  'strapi::poweredBy',
  'strapi::query',
  {
    name: 'strapi::body',
    config: {
      formLimit: '10mb',
      jsonLimit: '10mb',
      textLimit: '10mb',
      formidable: { maxFileSize: 64 * 1024 * 1024 },
    },
  },
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
