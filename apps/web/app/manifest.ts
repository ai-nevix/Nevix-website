import type { MetadataRoute } from 'next';

import { siteConfig } from '@/content/site';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${siteConfig.name} — ${siteConfig.headline.replace(/\.$/, '')}`,
    short_name: siteConfig.name,
    description: siteConfig.masterDescription,
    start_url: '/',
    display: 'standalone',
    background_color: '#050b1a',
    theme_color: '#02060f',
    icons: [
      { src: '/brand/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/brand/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    ],
  };
}
