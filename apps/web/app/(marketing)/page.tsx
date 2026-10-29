import { ArrowRight, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import {
  CaseStudyCard,
  IndustryCard,
  InsightCard,
  PillarCard,
  ProductCard,
  SolutionFlipTile,
} from '@/components/cards';
import { NevixIntro } from '@/components/branding/nevix-intro';
import { HomeHero } from '@/components/hero/home-hero';
import { CtaSection } from '@/components/sections/cta-section';
import { ProcessTimeline } from '@/components/sections/process-timeline';
import { Button } from '@/components/ui/button';
import { Eyebrow, Section, SectionHeading } from '@/components/ui/section';
import { Reveal, Stagger, StaggerItem } from '@/components/ui/motion';
import { about } from '@/content/about';
import { brandAssets, ctas, siteConfig } from '@/content/site';
import { buildMetadata } from '@/lib/seo/metadata';
import {
  getCaseStudies,
  getIndustries,
  getInsightCategories,
  getInsights,
  getProducts,
  getServiceCategories,
  getSolutions,
} from '@/lib/cms';

/**
 * Homepage — specification §6 and instruction §12.
 *
 * Section order follows the specified structure: hero, four-pillar strip, what we do, the NEVIX
 * difference, solutions, industries, how we work, selected work, products, insights, about, CTA.
 *
 * Every section is server-rendered. The only client JavaScript on this page comes from the header
 * and the scroll-reveal wrappers.
 */
export const revalidate = 3600;

export const metadata = buildMetadata({
  title: `${siteConfig.name} — ${siteConfig.headline.replace(/\.$/, '')}`,
  description: siteConfig.masterDescription,
  path: '/',
});

export default async function HomePage() {
  // Fetched in parallel — these are independent reads and serialising them would add latency for
  // no benefit.
  const [categories, solutions, industries, caseStudies, products, insights, insightCategories] =
    await Promise.all([
      getServiceCategories(),
      getSolutions(),
      getIndustries(),
      getCaseStudies({ limit: 3 }),
      getProducts(),
      getInsights({ limit: 3 }),
      getInsightCategories(),
    ]);

  const pillars = categories.filter((c) => c.isCorePillar);
  const extended = categories.filter((c) => !c.isCorePillar);
  const categoryName = (slug: string) => insightCategories.find((c) => c.slug === slug)?.name;

  return (
    <>
      <NevixIntro />

      <HomeHero />

      {/* --- What we do ------------------------------------------------------------------------ */}
      <Section tone="midnight" size="lg" className="bg-ink-900">
        <SectionHeading
          eyebrow="Four core pillars"
          title="What we do"
          description={siteConfig.masterDescriptionExtended}
          onDark
        />

        <Stagger className="mt-14">
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {pillars.map((category, index) => (
              <StaggerItem as="li" key={category.slug}>
                <PillarCard category={category} index={index} />
              </StaggerItem>
            ))}
          </ul>
        </Stagger>

        <Reveal delay={0.1} className="mt-8">
          <div className="rounded-(--radius-card) border border-white/10 bg-white/4 p-6 sm:p-7">
            <p className="text-sm font-semibold text-white">
              Extended by product engineering and advisory
            </p>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {extended.map((category) => (
                <li key={category.slug}>
                  <Link
                    href={`/services/${category.slug}`}
                    className="group flex items-start justify-between gap-4 rounded-lg p-3 transition-colors hover:bg-white/5"
                  >
                    <span>
                      <span className="block text-sm font-semibold text-white">
                        {category.name}
                      </span>
                      <span className="mt-1 block text-sm text-neutral-400">
                        {category.oneLineValue}
                      </span>
                    </span>
                    <ArrowRight
                      className="mt-0.5 size-4 shrink-0 text-cyan-brand-400 transition-transform group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </Section>

      {/* --- The NEVIX difference ------------------------------------------------------------ */}
      <Section tone="light" size="lg" className="overflow-hidden">
        {/* The silver N, large and faint behind the section — decorative only. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-16 -left-40 hidden w-[34rem] opacity-[0.07] lg:block"
        >
          <Image
            src={brandAssets.markSilver.src}
            width={brandAssets.markSilver.width}
            height={brandAssets.markSilver.height}
            alt=""
            sizes="544px"
            className="h-auto w-full"
          />
        </div>

        <div className="relative grid gap-14 lg:grid-cols-[minmax(0,26rem)_1fr] lg:gap-20">
          <div>
            <SectionHeading
              eyebrow="The NEVIX difference"
              title="Engineering-led, not demo-led"
              description="Our positions on how this work should be done. They are also the reasons a project either survives production or quietly stops being used."
            />
            <Reveal delay={0.1}>
              <Button asChild variant="secondary" className="mt-8">
                <Link href="/about#principles">Read our engineering principles</Link>
              </Button>
            </Reveal>
          </div>

          <Stagger>
            <ul className="grid gap-4 sm:grid-cols-2">
              {about.values.map((value) => (
                <StaggerItem
                  as="li"
                  key={value.title}
                  className="flex gap-3.5 rounded-(--radius-card) border border-neutral-200/80 bg-neutral-25 p-5"
                >
                  <CheckCircle2
                    className="mt-0.5 size-5 shrink-0 text-brand-600"
                    aria-hidden="true"
                  />
                  <div>
                    <h3 className="text-base font-semibold tracking-tight text-neutral-900">
                      {value.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-neutral-600">
                      {value.description}
                    </p>
                  </div>
                </StaggerItem>
              ))}
            </ul>
          </Stagger>
        </div>
      </Section>

      {/* --- Solutions ------------------------------------------------------------------------- */}
      <Section tone="subtle" size="lg">
        <SectionHeading
          eyebrow="Solutions"
          title="Projects we have actually built"
          description="Hover or tap a tile to see what it does and its real build status — Concept, Prototype, Beta or Coming Soon."
          action={
            <Button asChild variant="secondary">
              <Link href="/solutions">All solutions</Link>
            </Button>
          }
        />

        <Stagger className="mt-14">
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {solutions.slice(0, 6).map((solution) => (
              <StaggerItem as="li" key={solution.slug}>
                <SolutionFlipTile solution={solution} />
              </StaggerItem>
            ))}
          </ul>
        </Stagger>
      </Section>

      {/* --- Industries ------------------------------------------------------------------------ */}
      <Section tone="light" size="lg">
        <SectionHeading
          eyebrow="Industries"
          title="Where this work happens"
          description="Sector context that shapes the engineering — accessibility obligations, data sensitivity, integration surfaces and audit expectations. We describe what we can build, not credentials we do not hold."
          action={
            <Button asChild variant="secondary">
              <Link href="/industries">All industries</Link>
            </Button>
          }
        />

        <Stagger className="mt-14">
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {industries.map((industry) => (
              <StaggerItem as="li" key={industry.slug}>
                <IndustryCard industry={industry} />
              </StaggerItem>
            ))}
          </ul>
        </Stagger>
      </Section>

      {/* --- How we work ----------------------------------------------------------------------- */}
      <Section tone="brand-field" size="lg">
        <SectionHeading
          eyebrow="How we work"
          title="Discover → Define → Prototype → Build → Deploy → Evolve"
          description="The same lifecycle on every engagement, whether it is a two-week assessment or a multi-quarter build. The early steps exist to stop us building the wrong thing."
          onDark
        />

        <ProcessTimeline steps={about.lifecycle} onDark className="mt-14" />
      </Section>

      {/* --- Selected work --------------------------------------------------------------------- */}
      <Section tone="light" size="lg">
        <SectionHeading
          eyebrow="Selected work"
          title="How we approach a problem"
          description="NEVIX has not yet published client engagements. These are labelled demonstration case studies that show the approach, the architecture and the trade-offs — not accounts of delivered client work."
          action={
            <Button asChild variant="secondary">
              <Link href="/case-studies">All case studies</Link>
            </Button>
          }
        />

        <Stagger className="mt-14">
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {caseStudies.map((caseStudy) => (
              <StaggerItem as="li" key={caseStudy.slug}>
                <CaseStudyCard caseStudy={caseStudy} />
              </StaggerItem>
            ))}
          </ul>
        </Stagger>
      </Section>

      {/* --- Products -------------------------------------------------------------------------- */}
      <Section tone="subtle" size="lg">
        <SectionHeading
          eyebrow="Products"
          title="Product directions under consideration"
          description="Patterns we build repeatedly that may be worth packaging. Every entry below is at concept stage — none is available, and we would rather say so than imply a roadmap we have not committed to."
          action={
            <Button asChild variant="secondary">
              <Link href="/products">About our products</Link>
            </Button>
          }
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

      {/* --- Insights -------------------------------------------------------------------------- */}
      <Section tone="light" size="lg">
        <SectionHeading
          eyebrow="Insights"
          title="Writing from the engineering team"
          description="Practical notes on applied AI, automation, data and delivery. No predictions, no vendor comparisons."
          action={
            <Button asChild variant="secondary">
              <Link href="/insights">All insights</Link>
            </Button>
          }
        />

        <Stagger className="mt-14">
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {insights.map((insight) => (
              <StaggerItem as="li" key={insight.slug}>
                <InsightCard insight={insight} categoryName={categoryName(insight.categorySlug)} />
              </StaggerItem>
            ))}
          </ul>
        </Stagger>
      </Section>

      {/* --- About ----------------------------------------------------------------------------- */}
      <Section tone="subtle" size="lg">
        {/* The illuminated wall sign — the brand in a physical space. */}
        <Reveal className="mb-16 lg:mb-20">
          <figure className="relative overflow-hidden rounded-(--radius-panel) bg-ink-950 shadow-[var(--shadow-panel)]">
            <Image
              src={brandAssets.wallSign.src}
              width={brandAssets.wallSign.width}
              height={brandAssets.wallSign.height}
              alt="The NEVIX logo as an illuminated sign on a dark studio wall, the N glowing blue beside the wordmark and the tagline Explore. Automate. Evolve."
              sizes="(max-width: 1280px) 100vw, 1280px"
              className="h-auto w-full"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 rounded-(--radius-panel) ring-1 ring-white/10 ring-inset"
            />
          </figure>
        </Reveal>

        <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-20">
          <Reveal>
            <Eyebrow>About NEVIX</Eyebrow>
            <h2 className="mt-5 text-display-md text-neutral-900">
              An intelligent technology and engineering company
            </h2>
            <div className="mt-6 flex flex-col gap-4 text-base leading-relaxed text-neutral-600">
              {about.story.paragraphs.slice(0, 2).map((paragraph) => (
                <p key={paragraph.slice(0, 40)}>{paragraph}</p>
              ))}
            </div>
            <Button asChild variant="secondary" className="mt-8">
              <Link href="/about">More about NEVIX</Link>
            </Button>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="card-surface rounded-(--radius-panel) p-7 sm:p-8">
              <h3 className="font-sans text-eyebrow text-neutral-500 uppercase">
                Engagement models
              </h3>
              <ul className="mt-5 flex flex-col divide-y divide-neutral-200">
                {about.engagementModels.map((model) => (
                  <li key={model.title} className="py-4 first:pt-0 last:pb-0">
                    <p className="text-sm font-bold text-neutral-900">{model.title}</p>
                    <p className="mt-1 text-sm text-neutral-600">{model.description}</p>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </Section>

      <CtaSection
        title="Ready to discuss a project?"
        description="Whether you have a defined requirement or an unclear problem, the first conversation is the same: what is happening now, what it costs, and what a better outcome would look like."
        primary={ctas.primary}
        secondary={ctas.automate}
      />
    </>
  );
}
