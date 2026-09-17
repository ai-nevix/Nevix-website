/**
 * Strapi server configuration.
 *
 * Every secret comes from the environment. Strapi refuses to start without APP_KEYS, so a
 * missing secret is caught immediately rather than producing an insecure default.
 */
module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  app: {
    keys: env.array('APP_KEYS'),
  },
  // Behind Nginx. Without this, Strapi builds redirect and media URLs from the container's own
  // address rather than the public hostname.
  proxy: true,
  url: env('PUBLIC_URL', undefined),
  webhooks: {
    populateRelations: env.bool('WEBHOOKS_POPULATE_RELATIONS', false),
  },
});
