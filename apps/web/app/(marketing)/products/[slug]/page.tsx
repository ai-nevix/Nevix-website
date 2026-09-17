import { Dot } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { ServiceCard } from '@/components/cards';
import { CtaSection } from '@/components/sections/cta-section';
import { Notice } from '@/components/sections/notice';
import { PageHero } from '@/components/sections/page-hero';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Section, SectionHeading } from '@/components/ui/section';
import { Reveal, Stagger, StaggerItem } from '@/components/ui/motion';
import { products as allProducts, productStatusMeta } from '@/content/products';
import { ctas } from '@/content/site';
import { getProductBySlug, getServices } from '@/lib/cms';
import { buildMetadata } from '@/lib/seo/metadata';

export const revalidate = 3600;
export const dynamicParams = false;

export function generateStaticParams() {
  return allProducts.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};

  return buildMetadata({
    title: `${product.name} — ${productStatusMeta[product.status].label}`,
    description: product.summary,
    path: `/products/${product.slug}`,
    seo: product.seo,
  });
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const allServices = await getServices();
  const relatedServices = allServices.filter((s) => product.relatedServiceSlugs.includes(s.slug));
  const status = productStatusMeta[product.status];

  return (
    <>
      <PageHero
        breadcrumbs={[
          { name: 'Products', href: '/products' },
          { name: product.name, href: `/products/${product.slug}` },
        ]}
        eyebrow={`Product — ${status.label}`}
        title={product.heroTitle}
        description={product.heroDescription}
        notice={
          /* DUMMY-DATA: DD-002 — concept placeholder; replace with real product data. */
          product.isPlaceholder ? (
            <Notice variant="demo" title={`${status.label} — not available`} onDark>
              This product has not been built. It is a direction under consideration, published so
              the product architecture exists on the site. There is no availability date, no
              pricing, no trial and no waiting list, and nothing on this page should be read as a
              commitment to build it.
            </Notice>
          ) : undefined
        }
        actions={
          <>
            <Button asChild size="lg" variant="onDark">
              <Link href={ctas.talk.href}>Discuss this direction</Link>
            </Button>
            <Button asChild size="lg" variant="outlineOnDark">
              <Link href="/products">All products</Link>
            </Button>
          </>
        }
        aside={
          <div className="rounded-(--radius-panel) border border-white/12 bg-white/5 p-6 backdrop-blur-sm">
            <p className="text-eyebrow text-cyan-brand-400 uppercase">Status</p>
            <div className="mt-4">
              <Badge tone="onDark">{status.label}</Badge>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-neutral-400">{status.description}</p>
          </div>
        }
      />

      <Section tone="light" size="lg">
        <div className="grid gap-14 lg:grid-cols-[minmax(0,20rem)_1fr] lg:gap-20">
          <SectionHeading eyebrow="The problem" title="Why this might be worth building" />
          <Reveal>
            <p className="text-lg leading-relaxed text-neutral-700 sm:text-xl">{product.problem}</p>
          </Reveal>
        </div>
      </Section>

      <Section tone="subtle" size="lg">
        <SectionHeading
          eyebrow="Planned capabilities"
          title="What it would do"
          description="A description of scope under consideration. None of this is built."
        />
        <Stagger className="mt-12">
          <ul className="flex flex-col gap-3">
            {product.plannedCapabilities.map((capability) => (
              <StaggerItem as="li" key={capability} className="flex items-start gap-2.5">
                <Dot className="mt-0.5 size-5 shrink-0 text-brand-600" aria-hidden="true" />
                <span className="text-base leading-relaxed text-neutral-700">{capability}</span>
              </StaggerItem>
            ))}
          </ul>
        </Stagger>
      </Section>

      {relatedServices.length > 0 ? (
        <Section tone="light" size="lg">
          <SectionHeading
            eyebrow="Available today"
            title="What we can build for you now"
            description="The capabilities behind this concept are services we already deliver as bespoke engagements. That route is available immediately."
          />
          <Stagger className="mt-12">
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {relatedServices.map((service) => (
                <StaggerItem as="li" key={service.slug}>
                  <ServiceCard service={service} />
                </StaggerItem>
              ))}
            </ul>
          </Stagger>
        </Section>
      ) : null}

      <CtaSection
        eyebrow="Interested in this direction?"
        title="Tell us — it affects what we build"
        description="If this concept maps onto a problem you actually have, we would like to hear about it. In the meantime we can build the same capability as a bespoke engagement."
        primary={ctas.talk}
        secondary={ctas.consultation}
      />
    </>
  );
}
