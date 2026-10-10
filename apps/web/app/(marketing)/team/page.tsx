import Link from 'next/link';

import { TeamCard } from '@/components/cards';
import { CtaSection } from '@/components/sections/cta-section';
import { PageHero } from '@/components/sections/page-hero';
import { JsonLd } from '@/components/seo/json-ld';
import { Button } from '@/components/ui/button';
import { Section, SectionHeading } from '@/components/ui/section';
import { Reveal, Stagger, StaggerItem } from '@/components/ui/motion';
import { team } from '@/content/about';
import { ctas, siteConfig } from '@/content/site';
import { buildMetadata, canonicalUrl } from '@/lib/seo/metadata';
import { breadcrumbSchema } from '@/lib/seo/structured-data';

/**
 * Team — specification §6, instruction §25.
 *
 * Content governance: each card states the name, the role and the quote credited to that person on
 * the supplied material, and nothing else. No biography, career history, qualification, tenure or
 * prior employer appears here, because none was supplied and instruction §25 forbids inventing
 * them.
 *
 * The cards are the supplied artwork, published whole. The facts they contain are repeated in the
 * structured data below and in each card's alternative text, so nothing that matters is available
 * only as pixels.
 */
export const revalidate = 3600;

export const metadata = buildMetadata({
  title: 'Team',
  description: `The people behind ${siteConfig.name} — ${team.map((m) => `${m.name}, ${m.role}`).join('; ')}.`,
  path: '/team',
});

/**
 * `Person` entries, each linked back to the organisation. Only fields we actually hold are
 * emitted — an empty `jobTitle` or an invented `sameAs` would be a claim, not metadata.
 */
function teamSchema() {
  return {
    '@context': 'https://schema.org',
    '@graph': team.map((member) => ({
      '@type': 'Person',
      '@id': canonicalUrl(`/team#${member.slug}`),
      name: member.name,
      jobTitle: member.role,
      image: canonicalUrl(member.card),
      worksFor: { '@type': 'Organization', name: siteConfig.name, url: canonicalUrl('/') },
    })),
  };
}

export default function TeamPage() {
  return (
    <>
      <JsonLd id="team" data={teamSchema()} />
      <JsonLd
        id="team-breadcrumbs"
        data={breadcrumbSchema([
          { name: 'Home', href: '/' },
          { name: 'Team', href: '/team' },
        ])}
      />

      <PageHero
        breadcrumbs={[
          { name: 'About', href: '/about' },
          { name: 'Team', href: '/team' },
        ]}
        eyebrow="Team"
        title="The people behind NEVIX"
        description="NEVIX was founded to build intelligent technology that holds up in production. These are the people accountable for that."
        actions={
          <>
            <Button asChild size="lg" variant="onDark">
              <Link href={ctas.primary.href}>{ctas.primary.label}</Link>
            </Button>
            <Button asChild size="lg" variant="outlineOnDark">
              <Link href="/about">More about NEVIX</Link>
            </Button>
          </>
        }
      />

      <Section tone="light" size="lg">
        <SectionHeading
          eyebrow="Founders"
          title="Who we are"
          description="Each card states a name, a role and the words that person stands behind. We publish what has been approved for release and nothing beyond it."
        />

        <Stagger className="mt-14">
          {/*
            The founder's card is 3:2 and the co-founder's square. Splitting the row 3:2 gives both
            the same height, so the pair sits level without either being cropped.
          */}
          <ul className="grid items-start gap-8 md:grid-cols-[3fr_2fr]">
            {team.map((member, index) => (
              <StaggerItem as="li" key={member.slug}>
                <TeamCard member={member} priority={index === 0} />
              </StaggerItem>
            ))}
          </ul>
        </Stagger>

        <Reveal delay={0.1} className="mt-12">
          <p className="mx-auto max-w-prose text-center text-sm text-neutral-600">
            More of the team will appear here as their profiles are approved for release. See{' '}
            <Link href="/about">about NEVIX</Link> for how we work, or{' '}
            <Link href="/contact">get in touch</Link> to talk to us directly.
          </p>
        </Reveal>
      </Section>

      <CtaSection />
    </>
  );
}
