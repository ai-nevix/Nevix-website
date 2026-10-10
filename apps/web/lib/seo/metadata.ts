import type { Metadata } from 'next';

import type { SeoMetadata } from '@nevix/types';

import { siteConfig, siteUrl } from '@/content/site';

/**
 * Page metadata construction (specification §23.2).
 *
 * Every indexable page gets a unique title, a unique description, a canonical URL and OpenGraph
 * metadata. Anything marked `noIndex` — demo case studies, placeholder products — is excluded
 * from indexing so unverified content cannot be presented as fact in search results.
 */

const TITLE_SUFFIX = `${siteConfig.name} — Intelligent Technology`;

export interface BuildMetadataOptions {
  title: string;
  description: string;
  /** Path relative to the site root, e.g. `/services/automation`. */
  path: string;
  seo?: SeoMetadata;
  /** Overrides the generated OpenGraph image. */
  ogImage?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  tags?: string[];
}

export function canonicalUrl(path: string): string {
  const normalized = path === '/' ? '' : `/${path.replace(/^\/|\/$/g, '')}`;
  return `${siteUrl}${normalized}`;
}

export function buildMetadata(options: BuildMetadataOptions): Metadata {
  const { seo } = options;

  const title = seo?.title ?? options.title;
  const description = seo?.description ?? options.description;
  const url = canonicalUrl(options.path);
  const image = options.ogImage ?? seo?.ogImage ?? '/opengraph-image';

  const metadata: Metadata = {
    title,
    description,
    keywords: seo?.keywords,
    alternates: { canonical: url },
    openGraph: {
      type: options.type ?? 'website',
      url,
      title: `${title} | ${siteConfig.name}`,
      description,
      siteName: siteConfig.name,
      locale: 'en_GB',
      images: [{ url: image, width: 1200, height: 630, alt: `${title} — ${siteConfig.name}` }],
      ...(options.type === 'article'
        ? {
            publishedTime: options.publishedTime,
            modifiedTime: options.modifiedTime,
            authors: options.authors,
            tags: options.tags,
          }
        : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ${siteConfig.name}`,
      description,
      images: [image],
    },
  };

  if (seo?.noIndex) {
    metadata.robots = {
      index: false,
      follow: true,
      googleBot: { index: false, follow: true },
    };
  }

  return metadata;
}

/** Root metadata applied in `app/layout.tsx` and inherited by every page. */
export function buildRootMetadata(): Metadata {
  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: `${siteConfig.name} — ${siteConfig.positioning}`,
      template: `%s | ${TITLE_SUFFIX}`,
    },
    description: siteConfig.masterDescription,
    applicationName: siteConfig.name,
    referrer: 'strict-origin-when-cross-origin',
    keywords: [
      'AI solutions',
      'intelligent automation',
      'digital engineering',
      'data analytics',
      'document intelligence',
      'workflow automation',
      'custom software development',
      'open source technology partner',
    ],
    authors: [{ name: siteConfig.name }],
    creator: siteConfig.name,
    publisher: siteConfig.name,
    formatDetection: { email: false, address: false, telephone: false },
    alternates: { canonical: siteUrl },
    openGraph: {
      type: 'website',
      url: siteUrl,
      siteName: siteConfig.name,
      locale: 'en_GB',
      title: `${siteConfig.name} — ${siteConfig.positioning}`,
      description: siteConfig.masterDescription,
      images: [
        {
          url: '/opengraph-image',
          width: 1200,
          height: 630,
          alt: `${siteConfig.name} — ${siteConfig.tagline}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${siteConfig.name} — ${siteConfig.positioning}`,
      description: siteConfig.masterDescription,
      images: ['/opengraph-image'],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    icons: {
      icon: [
        { url: '/favicon.ico', sizes: '48x48' },
        { url: '/icon.svg', type: 'image/svg+xml' },
      ],
      apple: [{ url: '/apple-icon.png', sizes: '180x180' }],
    },
    manifest: '/manifest.webmanifest',
  };
}
