export { TeamCard } from './team-card';

import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

import type {
  CaseStudy,
  Industry,
  Insight,
  Product,
  Service,
  ServiceCategory,
  Solution,
} from '@nevix/types';

import { Badge } from '@/components/ui/badge';
import { Card, CardBody, CardDescription, CardTitle } from '@/components/ui/card';
import { IconTile } from '@/components/ui/icon';
import { productStatusMeta } from '@/content/products';
import { solutionStatusMeta } from '@/content/solutions';
import { formatDate, readingMinutes, toDateTimeAttribute } from '@/lib/utils';

/**
 * Content cards.
 *
 * Each card uses the "stretched link" pattern: one real anchor on the heading, expanded to cover
 * the card with an absolutely positioned pseudo-element. That gives a large pointer target while
 * keeping exactly one link in the tab order and one accessible name — nesting the whole card in
 * an anchor would swallow any interactive content inside it and produce a very long link name.
 */

const stretchedLink = 'after:absolute after:inset-0 after:content-[""] focus-visible:outline-none';

/* ---------------------------------------------------------------------------------------------- */
/* Service category                                                                                */
/* ---------------------------------------------------------------------------------------------- */

export function PillarCard({ category, index }: { category: ServiceCategory; index?: number }) {
  return (
    <Card variant="glass" interactive className="group h-full overflow-hidden">
      {/* A light that travels along the top edge on interaction — the N's gradient, in motion. */}
      <span
        aria-hidden="true"
        className="absolute inset-x-6 top-0 h-px origin-left scale-x-25 bg-linear-to-r from-cyan-brand-400 to-brand-500 opacity-70 transition-transform duration-500 group-focus-within:scale-x-100 group-hover:scale-x-100"
      />
      <CardBody className="gap-4">
        <div className="flex items-start justify-between gap-4">
          <IconTile name={category.icon} tone="onDark" />
          {typeof index === 'number' ? (
            <span
              className="font-display text-sm font-semibold text-neutral-500 tabular-nums"
              aria-hidden="true"
            >
              {String(index + 1).padStart(2, '0')}
            </span>
          ) : null}
        </div>

        <h3 className="text-lg font-semibold tracking-tight text-white">
          <Link href={`/services/${category.slug}`} className={stretchedLink}>
            {category.name}
          </Link>
        </h3>

        <p className="flex-1 text-sm leading-relaxed text-neutral-400">{category.positioning}</p>

        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-cyan-brand-400 transition-transform duration-200 group-hover:translate-x-0.5">
          {category.cardCta}
          <ArrowRight className="size-4" aria-hidden="true" />
        </span>
      </CardBody>
    </Card>
  );
}

export function ServiceCategoryCard({ category }: { category: ServiceCategory }) {
  return (
    <Card interactive className="group h-full">
      <CardBody className="gap-4">
        <IconTile name={category.icon} />

        <CardTitle>
          <Link href={`/services/${category.slug}`} className={stretchedLink}>
            {category.name}
          </Link>
        </CardTitle>

        <CardDescription className="mt-0 flex-1">{category.description}</CardDescription>

        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 transition-transform duration-200 group-hover:translate-x-0.5">
          {category.cardCta}
          <ArrowRight className="size-4" aria-hidden="true" />
        </span>
      </CardBody>
    </Card>
  );
}

/* ---------------------------------------------------------------------------------------------- */
/* Service                                                                                         */
/* ---------------------------------------------------------------------------------------------- */

export function ServiceCard({ service }: { service: Service }) {
  return (
    <Card interactive className="group h-full">
      <CardBody className="gap-3 p-5">
        <CardTitle className="text-base">
          <Link
            href={`/services/${service.categorySlug}/${service.slug}`}
            className={stretchedLink}
          >
            {service.name}
          </Link>
        </CardTitle>

        <CardDescription className="mt-0 flex-1 text-sm">
          {service.shortDescription}
        </CardDescription>

        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 transition-transform duration-200 group-hover:translate-x-0.5">
          Learn more
          <ArrowRight className="size-4" aria-hidden="true" />
        </span>
      </CardBody>
    </Card>
  );
}

/* ---------------------------------------------------------------------------------------------- */
/* Solution                                                                                        */
/* ---------------------------------------------------------------------------------------------- */

const statusTone = {
  neutral: 'neutral',
  info: 'info',
  warning: 'warning',
  success: 'success',
} as const;

export function SolutionCard({ solution }: { solution: Solution }) {
  const status = solutionStatusMeta[solution.status];

  return (
    <Card interactive className="group h-full">
      <CardBody className="gap-4">
        <div className="flex items-start justify-between gap-3">
          <IconTile name={solution.icon} />
          <Badge tone={statusTone[status.tone]}>{status.label}</Badge>
        </div>

        <CardTitle>
          <Link href={`/solutions/${solution.slug}`} className={stretchedLink}>
            {solution.name}
          </Link>
        </CardTitle>

        <p className="text-sm leading-relaxed text-neutral-500">
          <span className="font-semibold text-neutral-700">The problem: </span>
          {solution.problem}
        </p>

        <CardDescription className="mt-0 flex-1">{solution.summary}</CardDescription>

        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 transition-transform duration-200 group-hover:translate-x-0.5">
          How it works
          <ArrowRight className="size-4" aria-hidden="true" />
        </span>
      </CardBody>
    </Card>
  );
}

/* ---------------------------------------------------------------------------------------------- */
/* Industry                                                                                        */
/* ---------------------------------------------------------------------------------------------- */

export function IndustryCard({ industry }: { industry: Industry }) {
  return (
    <Card interactive className="group h-full">
      <CardBody className="gap-4">
        <IconTile name={industry.icon} />

        <CardTitle>
          <Link href={`/industries/${industry.slug}`} className={stretchedLink}>
            {industry.name}
          </Link>
        </CardTitle>

        <CardDescription className="mt-0 flex-1">{industry.summary}</CardDescription>

        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 transition-transform duration-200 group-hover:translate-x-0.5">
          Explore sector
          <ArrowRight className="size-4" aria-hidden="true" />
        </span>
      </CardBody>
    </Card>
  );
}

/* ---------------------------------------------------------------------------------------------- */
/* Product                                                                                         */
/* ---------------------------------------------------------------------------------------------- */

export function ProductCard({ product }: { product: Product }) {
  const status = productStatusMeta[product.status];

  return (
    <Card interactive className="group h-full">
      <CardBody className="gap-4">
        <div className="flex items-start justify-between gap-3">
          <IconTile name={product.icon} />
          <Badge tone={statusTone[status.tone]}>{status.label}</Badge>
        </div>

        <CardTitle>
          <Link href={`/products/${product.slug}`} className={stretchedLink}>
            {product.name}
          </Link>
        </CardTitle>

        <CardDescription className="mt-0 flex-1">{product.summary}</CardDescription>

        <p className="text-xs text-neutral-500">{status.description}</p>
      </CardBody>
    </Card>
  );
}

/* ---------------------------------------------------------------------------------------------- */
/* Case study                                                                                      */
/* ---------------------------------------------------------------------------------------------- */

export function CaseStudyCard({ caseStudy }: { caseStudy: CaseStudy }) {
  return (
    <Card interactive className="group h-full">
      <CardBody className="gap-4">
        {/*
          DUMMY-DATA: DD-001
          Demo content must be unmistakable. The badge is the first thing in the card and repeats
          in the detail page heading — catalogue §16 forbids presenting unapproved case studies as
          client work.
        */}
        {caseStudy.kind === 'demo' ? (
          <Badge tone="warning" className="self-start">
            Demo Case Study
          </Badge>
        ) : null}

        <CardTitle>
          <Link href={`/case-studies/${caseStudy.slug}`} className={stretchedLink}>
            {caseStudy.title}
          </Link>
        </CardTitle>

        <CardDescription className="mt-0 flex-1">{caseStudy.summary}</CardDescription>

        <ul className="flex flex-wrap gap-1.5">
          {caseStudy.technologies.slice(0, 4).map((tech) => (
            <li key={tech}>
              <Badge tone="neutral">{tech}</Badge>
            </li>
          ))}
        </ul>
      </CardBody>
    </Card>
  );
}

/* ---------------------------------------------------------------------------------------------- */
/* Insight                                                                                         */
/* ---------------------------------------------------------------------------------------------- */

export function InsightCard({
  insight,
  categoryName,
}: {
  insight: Insight;
  categoryName?: string;
}) {
  const minutes = insight.readingMinutes ?? readingMinutes(insight.content);

  return (
    <Card interactive as="article" className="group h-full">
      <CardBody className="gap-3">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-500">
          {categoryName ? (
            <span className="font-semibold text-brand-700">{categoryName}</span>
          ) : null}
          <time dateTime={toDateTimeAttribute(insight.publishedAt)}>
            {formatDate(insight.publishedAt)}
          </time>
          <span aria-hidden="true">·</span>
          <span>{minutes} min read</span>
        </div>

        <CardTitle className="text-base leading-snug">
          <Link href={`/insights/${insight.slug}`} className={stretchedLink}>
            {insight.title}
          </Link>
        </CardTitle>

        <CardDescription className="mt-0 flex-1">{insight.excerpt}</CardDescription>
      </CardBody>
    </Card>
  );
}
