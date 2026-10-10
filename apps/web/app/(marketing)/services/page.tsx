import Link from 'next/link';

import { ServiceCard, ServiceCategoryCard } from '@/components/cards';
import { CtaSection } from '@/components/sections/cta-section';
import { PageHero } from '@/components/sections/page-hero';
import { Button } from '@/components/ui/button';
import { Section, SectionHeading } from '@/components/ui/section';
import { Stagger, StaggerItem } from '@/components/ui/motion';
import { ctas } from '@/content/site';
import { getServiceCategories, getServices } from '@/lib/cms';
import { buildMetadata } from '@/lib/seo/metadata';

/**
 * Services index — specification §6, §7.
 *
 * Shows the six categories, then every service grouped by category, so a visitor can find a
 * specific capability without opening six pages.
 */
export const revalidate = 3600;

export const metadata = buildMetadata({
  title: 'Services',
  description:
    'NEVIX services across six categories: AI & Intelligence, Automation, Digital Engineering, Data & Analytics, Product & SaaS Engineering, and Consulting & Technology Advisory.',
  path: '/services',
});

export default async function ServicesPage() {
  const [categories, services] = await Promise.all([getServiceCategories(), getServices()]);

  return (
    <>
      <PageHero
        breadcrumbs={[{ name: 'Services', href: '/services' }]}
        eyebrow="Services"
        title="Four core pillars, extended by product engineering and advisory"
        description="Thirty-five services across six categories. Each one starts from a defined problem and ends with something deployed, documented and maintainable."
        actions={
          <>
            <Button asChild size="lg" variant="onDark">
              <Link href={ctas.primary.href}>{ctas.primary.label}</Link>
            </Button>
            <Button asChild size="lg" variant="outlineOnDark">
              <Link href="/solutions">See solution patterns</Link>
            </Button>
          </>
        }
      />

      <Section tone="light" size="lg">
        <SectionHeading
          eyebrow="Service categories"
          title="Where to start"
          description="If you already know the capability you need, go straight to the category. If you are working from a business problem instead, the solutions pages are the better entry point."
        />

        <Stagger className="mt-14">
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <StaggerItem as="li" key={category.slug}>
                <ServiceCategoryCard category={category} />
              </StaggerItem>
            ))}
          </ul>
        </Stagger>
      </Section>

      {categories.map((category, index) => {
        const categoryServices = services
          .filter((s) => s.categorySlug === category.slug)
          .sort((a, b) => a.order - b.order);

        return (
          <Section
            key={category.slug}
            tone={index % 2 === 0 ? 'subtle' : 'light'}
            size="lg"
            id={category.slug}
          >
            <SectionHeading
              eyebrow={`0${index + 1} — ${category.isCorePillar ? 'Core pillar' : 'Extended capability'}`}
              title={category.name}
              description={category.positioning}
              action={
                <Button asChild variant="secondary">
                  <Link href={`/services/${category.slug}`}>{category.cardCta}</Link>
                </Button>
              }
            />

            <Stagger className="mt-12">
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {categoryServices.map((service) => (
                  <StaggerItem as="li" key={service.slug}>
                    <ServiceCard service={service} />
                  </StaggerItem>
                ))}
              </ul>
            </Stagger>
          </Section>
        );
      })}

      <CtaSection
        eyebrow="Not sure which applies?"
        title="Describe the problem instead"
        description="Most enquiries do not arrive with a service name attached. Tell us what is happening now and we will tell you which capability actually fits — including when the answer is none of them."
        primary={ctas.primary}
        secondary={ctas.consultation}
      />
    </>
  );
}
