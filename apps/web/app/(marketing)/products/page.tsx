import Link from 'next/link';

import { ProductCard } from '@/components/cards';
import { CtaSection } from '@/components/sections/cta-section';
import { Notice } from '@/components/sections/notice';
import { PageHero } from '@/components/sections/page-hero';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Section, SectionHeading } from '@/components/ui/section';
import { Reveal, Stagger, StaggerItem } from '@/components/ui/motion';
import { productStatusMeta } from '@/content/products';
import { ctas } from '@/content/site';
import { getProducts } from '@/lib/cms';
import { buildMetadata } from '@/lib/seo/metadata';

/**
 * Products index — specification §9.1, instruction §22.
 *
 * DUMMY-DATA: DD-002
 * NEVIX has no products yet. Every entry is at concept status and the page says so plainly at
 * the top rather than implying a shipping roadmap.
 */
export const revalidate = 3600;

export const metadata = buildMetadata({
  title: 'Products',
  description:
    'Product directions NEVIX is considering, and the lifecycle we use to take a product from concept to production. Nothing listed is currently available.',
  path: '/products',
});

const lifecycle: (keyof typeof productStatusMeta)[] = [
  'concept',
  'prototype',
  'beta',
  'live',
  'coming-soon',
];

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <>
      <PageHero
        breadcrumbs={[{ name: 'Products', href: '/products' }]}
        eyebrow="Products"
        title="Nothing here is available yet — and we would rather say so"
        description="NEVIX does not currently ship a product. Below are directions under consideration, drawn from patterns we build repeatedly. They are listed at concept status so nobody mistakes an idea for a roadmap."
        notice={
          <Notice variant="demo" title="Concept stage — not available" onDark>
            Every product on this page is at concept stage. None has been built, none is available
            for purchase or trial, and no availability date is implied. This section exists so the
            product architecture is in place for when there is something real to publish.
          </Notice>
        }
        actions={
          <>
            <Button asChild size="lg" variant="onDark">
              <Link href="/services/product-saas-engineering">Product engineering services</Link>
            </Button>
            <Button asChild size="lg" variant="outlineOnDark">
              <Link href={ctas.buildProduct.href}>{ctas.buildProduct.label}</Link>
            </Button>
          </>
        }
      />

      <Section tone="light" size="lg">
        <SectionHeading
          eyebrow="Under consideration"
          title="Directions we are weighing"
          description="Each of these packages something we build repeatedly in client work. Whether any becomes a product depends on whether the configurable version is genuinely better than the bespoke one."
        />

        <Stagger className="mt-14">
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <StaggerItem as="li" key={product.slug}>
                <ProductCard product={product} />
              </StaggerItem>
            ))}
          </ul>
        </Stagger>
      </Section>

      <Section tone="brand-field" size="lg">
        <SectionHeading
          eyebrow="Product lifecycle"
          title="How we would take a product to production"
          description="Concept → Prototype → Beta → Live. Each status on this site means something specific, and we do not skip steps to make a page look busier."
          onDark
        />

        <Stagger className="mt-14">
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {lifecycle.map((status, index) => {
              const meta = productStatusMeta[status];
              return (
                <StaggerItem as="li" key={status}>
                  <div className="card-glass h-full p-5">
                    <span
                      className="font-mono text-xs text-neutral-500 tabular-nums"
                      aria-hidden="true"
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <h3 className="mt-3 text-base font-bold text-white">{meta.label}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-neutral-400">
                      {meta.description}
                    </p>
                  </div>
                </StaggerItem>
              );
            })}
          </ul>
        </Stagger>
      </Section>

      <Section tone="light" size="md">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <Badge tone="brand">Client-owned products</Badge>
            <h2 className="mt-5 text-display-sm text-neutral-900">
              We also build products you own
            </h2>
            <p className="mt-5 text-base leading-relaxed text-neutral-600">
              Most of our product engineering is client-owned: your idea, your intellectual
              property, our engineering. Ownership, commercial and support terms are agreed in
              writing before work starts rather than left to be worked out later.
            </p>
            <Button asChild variant="secondary" className="mt-8">
              <Link href="/services/product-saas-engineering">
                Product &amp; SaaS Engineering services
              </Link>
            </Button>
          </div>
        </Reveal>
      </Section>

      <CtaSection
        eyebrow="Building a product?"
        title="Take it from validated idea to running service"
        description="Whether it is a first MVP or a system you want to productise, the early architecture decisions — tenancy, isolation, access control — are the expensive ones to reverse."
        primary={ctas.buildProduct}
        secondary={ctas.consultation}
      />
    </>
  );
}
