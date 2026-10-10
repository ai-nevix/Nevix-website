import Link from 'next/link';

import { Notice } from '@/components/sections/notice';
import { CtaSection } from '@/components/sections/cta-section';
import { PageHero } from '@/components/sections/page-hero';
import { ProcessTimeline } from '@/components/sections/process-timeline';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Section, SectionHeading } from '@/components/ui/section';
import { Reveal, Stagger, StaggerItem } from '@/components/ui/motion';
import { about } from '@/content/about';
import { ctas, siteConfig } from '@/content/site';
import { buildMetadata } from '@/lib/seo/metadata';

/**
 * About page — specification §6, instruction §25.
 *
 * Content governance: no biographies, founding dates, headcount, funding, client counts or
 * milestones. None were supplied and none are invented. The team section renders a registered
 * placeholder (DD-003) rather than fabricated profiles.
 */
export const metadata = buildMetadata({
  title: 'About NEVIX',
  description:
    'NEVIX is an intelligent technology and engineering company working across AI, automation, digital engineering and data. Our vision, mission, engineering principles and how we work.',
  path: '/about',
});

export default function AboutPage() {
  return (
    <>
      <PageHero
        breadcrumbs={[{ name: 'About', href: '/about' }]}
        eyebrow={about.hero.eyebrow}
        title={about.hero.title}
        description={about.hero.description}
        actions={
          <>
            <Button asChild size="lg" variant="onDark">
              <Link href={ctas.primary.href}>{ctas.primary.label}</Link>
            </Button>
            <Button asChild size="lg" variant="outlineOnDark">
              <Link href="/services">{ctas.services.label}</Link>
            </Button>
          </>
        }
        aside={
          <div className="rounded-(--radius-panel) border border-white/12 bg-white/5 p-6 backdrop-blur-sm">
            <p className="text-eyebrow text-cyan-brand-400 uppercase">Positioning</p>
            <p className="mt-4 text-xl leading-snug font-bold text-white">
              {siteConfig.positioning}
            </p>
            <p className="mt-4 text-sm text-neutral-400">{siteConfig.pillarLine}</p>
            <p className="mt-6 border-t border-white/10 pt-5 text-eyebrow text-neutral-400 uppercase">
              {siteConfig.tagline}
            </p>
          </div>
        }
      />

      {/* --- Story --------------------------------------------------------------------------- */}
      <Section tone="light" size="lg">
        <div className="grid gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-20">
          <div>
            <SectionHeading eyebrow="Our approach" title={about.story.title} />
            {/* DUMMY-DATA: DD-009 — replace with an approved founding story. */}
            <div className="mt-8 flex flex-col gap-5 text-base leading-relaxed text-neutral-600 sm:text-lg">
              {about.story.paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 40)}>{paragraph}</p>
              ))}
            </div>
          </div>

          <Reveal delay={0.1} className="flex flex-col gap-6">
            <div className="rounded-(--radius-panel) border border-neutral-200 bg-neutral-50 p-7">
              <h2 className="text-eyebrow text-brand-700 uppercase">{about.vision.title}</h2>
              <p className="mt-4 text-base leading-relaxed text-neutral-700">{about.vision.body}</p>
            </div>
            <div className="rounded-(--radius-panel) border border-neutral-200 bg-neutral-50 p-7">
              <h2 className="text-eyebrow text-brand-700 uppercase">{about.mission.title}</h2>
              <p className="mt-4 text-base leading-relaxed text-neutral-700">
                {about.mission.body}
              </p>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* --- Values -------------------------------------------------------------------------- */}
      <Section tone="light" size="lg" id="values">
        <SectionHeading
          eyebrow="What we hold to"
          title="Values"
          description="These are positions rather than aspirations. Each one has cost us work at some point, which is how we know they are real."
        />

        <Stagger className="mt-14">
          <ul className="grid gap-x-10 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
            {about.values.map((value, index) => (
              <StaggerItem as="li" key={value.title}>
                <span
                  className="font-mono text-sm font-bold text-brand-600 tabular-nums"
                  aria-hidden="true"
                >
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-3 text-lg font-bold tracking-tight text-neutral-900">
                  {value.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-600">{value.description}</p>
              </StaggerItem>
            ))}
          </ul>
        </Stagger>
      </Section>

      {/* --- Engineering principles ---------------------------------------------------------- */}
      <Section tone="brand-field" size="lg" id="principles">
        <SectionHeading
          eyebrow="Engineering principles"
          title="How we build"
          description="Taken from the NEVIX service catalogue. They apply to a two-week assessment as much as to a multi-quarter build."
          onDark
        />

        <Stagger className="mt-14">
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {about.principles.map((principle) => (
              <StaggerItem as="li" key={principle.title}>
                <div className="card-glass h-full p-6">
                  <h3 className="text-base font-bold tracking-tight text-white">
                    {principle.title}
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-neutral-400">
                    {principle.description}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </ul>
        </Stagger>
      </Section>

      {/* --- Lifecycle ----------------------------------------------------------------------- */}
      <Section tone="light" size="lg" id="how-we-work">
        <SectionHeading
          eyebrow="How we work"
          title="The project lifecycle"
          description="Discover → Define → Prototype → Build → Deploy → Evolve. The first two steps are where most of the risk is removed, and they are the steps clients most often want to skip."
        />
        <ProcessTimeline steps={about.lifecycle} className="mt-14" />
      </Section>

      {/* --- Engagement models --------------------------------------------------------------- */}
      <Section tone="subtle" size="lg" id="engagement">
        <SectionHeading
          eyebrow="Working together"
          title="Engagement models"
          description="Five ways we structure work. Which one fits depends on how well defined the problem is and how much of the risk is technical."
        />

        <Stagger className="mt-14">
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {about.engagementModels.map((model) => (
              <StaggerItem as="li" key={model.title}>
                <div className="card-surface h-full p-6">
                  <h3 className="text-base font-bold tracking-tight text-neutral-900">
                    {model.title}
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-neutral-600">
                    {model.description}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </ul>
        </Stagger>
      </Section>

      {/* --- Capabilities --------------------------------------------------------------------- */}
      <Section tone="light" size="lg" id="capabilities">
        <SectionHeading
          eyebrow="Technology"
          title="What we actually use"
          description="A deliberately short list. The service catalogue is explicit that technology lists should not be padded to make a company look larger, so this covers what we build with — not everything we have heard of."
        />

        <Stagger className="mt-14">
          <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {about.capabilities.map((group) => (
              <StaggerItem as="li" key={group.area}>
                <h3 className="text-eyebrow text-neutral-500 uppercase">{group.area}</h3>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {group.items.map((item) => (
                    <li key={item}>
                      <Badge tone="brand">{item}</Badge>
                    </li>
                  ))}
                </ul>
              </StaggerItem>
            ))}
          </ul>
        </Stagger>

        <Reveal delay={0.1} className="mt-12">
          <Notice variant="info" title="Open source by default">
            Our default stack is open source and self-hostable end to end, so a client is never
            locked to a platform decision made on day one. Where a proprietary component is the
            right answer, we isolate it behind an interface and document the exception rather than
            pretending the stack is pure.
          </Notice>
        </Reveal>
      </Section>

      <CtaSection
        eyebrow="Get in touch"
        title="Start with the problem"
        description="Tell us what is happening now, what it costs and what a better outcome would look like. If we are not the right people for it, we will say so."
        primary={ctas.primary}
        secondary={ctas.consultation}
      />
    </>
  );
}
