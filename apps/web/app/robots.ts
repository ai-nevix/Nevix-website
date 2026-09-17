import type { MetadataRoute } from 'next';

import { siteUrl } from '@/content/site';

/**
 * robots.txt (specification §23.2).
 *
 * Non-production environments disallow everything. A staging site indexed alongside production
 * splits ranking signals and can surface unreviewed content publicly — the cost of getting this
 * wrong is much higher than the cost of the check.
 */
export default function robots(): MetadataRoute.Robots {
  const isProduction = process.env.NEXT_PUBLIC_ENV === 'production';

  if (!isProduction) {
    return {
      rules: [{ userAgent: '*', disallow: '/' }],
    };
  }

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          // Search result pages are thin and infinitely variable.
          '/search',
          // The backend proxy is not content.
          '/api/',
          // Demo case studies and placeholder products carry noIndex; this reinforces it at the
          // crawler level so unverified content cannot be indexed by mistake.
          '/case-studies',
          '/legal/',
          '/insights/tag/',
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
