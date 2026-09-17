/**
 * Strapi plugin configuration.
 *
 * Uploads are stored on a mounted volume by default. Switching to MinIO is a configuration
 * change here plus the "storage" compose profile (ADR-008).
 */
module.exports = ({ env }) => ({
  upload: {
    config: {
      sizeLimit: env.int('UPLOAD_SIZE_LIMIT', 64 * 1024 * 1024),
    },
  },
});
