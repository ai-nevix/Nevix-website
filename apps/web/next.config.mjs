import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { securityHeaders } from './lib/security-headers.mjs';

/**
 * Next.js configuration for the NEVIX website.
 *
 * Security headers are set here as a defence-in-depth layer. Nginx sets the same headers at the
 * edge (infra/nginx/snippets/security-headers.conf), so a misconfigured proxy cannot silently
 * drop them — see docs/security/threat-model.md.
 */

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const isDev = process.env.NODE_ENV !== 'production';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  // Emits a minimal standalone server bundle for the production container image. The tracing root
  // must be the monorepo root so workspace dependencies are included.
  output: 'standalone',
  outputFileTracingRoot: repoRoot,

  // The shared types package ships raw TypeScript.
  transpilePackages: ['@nevix/types'],

  typedRoutes: false,

  typescript: {
    ignoreBuildErrors: false,
  },

  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [360, 480, 640, 768, 1024, 1280, 1536, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Strapi serves CMS media. Hosts are allow-listed from configuration, never wildcarded.
    remotePatterns: buildRemotePatterns(),
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders({
          isDev,
          cmsOrigin: originOf(process.env.NEXT_PUBLIC_MEDIA_URL ?? process.env.CMS_URL),
        }),
      },
    ];
  },

  async redirects() {
    return [
      // The specification uses "Projects / Case Studies" in navigation; /projects is an alias.
      { source: '/projects', destination: '/case-studies', permanent: true },
      { source: '/projects/:slug', destination: '/case-studies/:slug', permanent: true },
      { source: '/blog', destination: '/insights', permanent: true },
      { source: '/blog/:slug', destination: '/insights/:slug', permanent: true },
      // The page was published briefly as /leadership before being widened to the whole team.
      { source: '/leadership', destination: '/team', permanent: true },
    ];
  },
};

/** Returns `scheme://host[:port]` for a URL string, or an empty string when unset or invalid. */
function originOf(value) {
  if (!value) return '';
  try {
    return new URL(value).origin;
  } catch {
    console.warn(`[next.config] Ignoring invalid URL: ${value}`);
    return '';
  }
}

/** Builds the `next/image` remote allow-list from CMS_URL / NEXT_PUBLIC_MEDIA_URL. */
function buildRemotePatterns() {
  const candidates = [process.env.CMS_URL, process.env.NEXT_PUBLIC_MEDIA_URL].filter(Boolean);

  return candidates.flatMap((value) => {
    try {
      const url = new URL(value);
      return [
        {
          protocol: url.protocol.replace(':', ''),
          hostname: url.hostname,
          ...(url.port ? { port: url.port } : {}),
          pathname: '/**',
        },
      ];
    } catch {
      return [];
    }
  });
}

export default nextConfig;
