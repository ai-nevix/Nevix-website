import type { Author, CaseStudy, Insight, Service, ServiceCategory } from '@vastrix/types';

import { siteConfig, siteUrl } from '@/content/site';

import { canonicalUrl } from './metadata';

/**
 * JSON-LD structured data (specification §23.2).
 *
 * Content governance applies here as strictly as it does to visible copy: the Organization schema
 * declares no awards, certifications, employee count, founding date or aggregate rating, because
 * none of those have been supplied. Search engines treat structured data as factual claims.
 */

type JsonLd = Record<string, unknown>;

export function organizationSchema(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${siteUrl}/#organization`,
    name: siteConfig.name,
    url: siteUrl,
    logo: {
      '@type': 'ImageObject',
      url: `${siteUrl}/brand/vastrix-logo.png`,
    },
    description: siteConfig.masterDescription,
    slogan: siteConfig.tagline,
    email: siteConfig.contact.email,
    // Only declared when confirmed — see DD-010.
    sameAs: siteConfig.social.map((s) => s.href),
    knowsAbout: [
      'Artificial Intelligence',
      'Business Process Automation',
      'Digital Engineering',
      'Data Analytics',
      'Document Intelligence',
      'Software Development',
    ],
  };
}

export function websiteSchema(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${siteUrl}/#website`,
    url: siteUrl,
    name: siteConfig.name,
    description: siteConfig.masterDescription,
    publisher: { '@id': `${siteUrl}/#organization` },
    inLanguage: 'en-GB',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export interface BreadcrumbEntry {
  name: string;
  href: string;
}

export function breadcrumbSchema(entries: BreadcrumbEntry[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: entries.map((entry, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: entry.name,
      item: canonicalUrl(entry.href),
    })),
  };
}

export function serviceSchema(service: Service, category: ServiceCategory): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.name,
    description: service.shortDescription,
    serviceType: category.name,
    url: canonicalUrl(`/services/${category.slug}/${service.slug}`),
    provider: { '@id': `${siteUrl}/#organization` },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: `${service.name} capabilities`,
      itemListElement: service.capabilities.map((capability) => ({
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: capability },
      })),
    },
  };
}

export function faqSchema(faq: { question: string; answer: string }[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };
}

export function articleSchema(insight: Insight, author: Author | null): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: insight.title,
    description: insight.excerpt,
    url: canonicalUrl(`/insights/${insight.slug}`),
    datePublished: insight.publishedAt,
    dateModified: insight.updatedAt ?? insight.publishedAt,
    author: {
      '@type': 'Organization',
      name: author?.name ?? siteConfig.name,
    },
    publisher: { '@id': `${siteUrl}/#organization` },
    keywords: insight.tags.join(', '),
    inLanguage: 'en-GB',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl(`/insights/${insight.slug}`),
    },
  };
}

/**
 * Demo case studies are deliberately NOT emitted as `Article` or `CreativeWork` with a client
 * attribution. They are described as illustrative content so a search engine cannot present a
 * demonstration as a delivered engagement.
 */
export function caseStudySchema(caseStudy: CaseStudy): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: caseStudy.kind === 'demo' ? `${caseStudy.title} (Demo Case Study)` : caseStudy.title,
    description: caseStudy.summary,
    url: canonicalUrl(`/case-studies/${caseStudy.slug}`),
    datePublished: caseStudy.publishedAt,
    creator: { '@id': `${siteUrl}/#organization` },
    ...(caseStudy.kind === 'demo'
      ? {
          disambiguatingDescription:
            'Illustrative demonstration content. Not an account of a delivered client engagement.',
        }
      : {}),
  };
}

export function contactPageSchema(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    url: canonicalUrl('/contact'),
    name: `Contact ${siteConfig.name}`,
    mainEntity: { '@id': `${siteUrl}/#organization` },
  };
}
