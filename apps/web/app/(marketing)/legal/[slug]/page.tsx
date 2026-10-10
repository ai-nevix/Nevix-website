import { notFound } from 'next/navigation';

import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { Notice } from '@/components/sections/notice';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { draftNotice, legalDocuments } from '@/content/legal';
import { buildMetadata } from '@/lib/seo/metadata';
import { formatDate, toDateTimeAttribute } from '@/lib/utils';

/**
 * Legal pages — instruction §71.
 *
 * DUMMY-DATA: DD-006
 * These are drafts. Every page renders a prominent draft banner and is excluded from indexing
 * until counsel has reviewed the text — an unreviewed legal page appearing in search results is
 * worse than no page.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return legalDocuments.map((document) => ({ slug: document.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const document = legalDocuments.find((d) => d.slug === slug);
  if (!document) return {};

  return buildMetadata({
    title: `${document.title} (Draft)`,
    description: document.description,
    path: `/legal/${document.slug}`,
    // Remove `noIndex` only once the draft banner is removed after legal review.
    seo: { noIndex: true },
  });
}

export default async function LegalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const document = legalDocuments.find((d) => d.slug === slug);

  if (!document) notFound();

  return (
    <>
      <section className="brand-field dark-section">
        <Container size="prose">
          <div className="py-14 sm:py-16">
            <Breadcrumbs
              entries={[{ name: document.title, href: `/legal/${document.slug}` }]}
              onDark
            />
            <p className="mt-9 text-eyebrow text-cyan-brand-400 uppercase">Legal</p>
            <h1 className="mt-4 text-display-md text-white">{document.title}</h1>
            <p className="mt-5 text-base text-neutral-400">
              Last updated{' '}
              <time dateTime={toDateTimeAttribute(document.lastUpdated)}>
                {formatDate(document.lastUpdated)}
              </time>
            </p>

            {/* DUMMY-DATA: DD-006 — remove only after legal review. */}
            <div className="mt-8">
              <Notice variant="draft" title={`${draftNotice.label} — not yet reviewed`} onDark>
                {draftNotice.text}
              </Notice>
            </div>
          </div>
        </Container>
      </section>

      <Section tone="light" size="lg" containerSize="prose">
        <p className="prose-nevix text-lg">{document.intro}</p>

        <div className="mt-12 flex flex-col gap-10">
          {document.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-xl font-bold tracking-tight text-neutral-900">
                {section.heading}
              </h2>

              {section.paragraphs?.length ? (
                <div className="prose-nevix mt-4">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph.slice(0, 40)}>{paragraph}</p>
                  ))}
                </div>
              ) : null}

              {section.list?.length ? (
                <ul className="prose-nevix mt-4 list-disc">
                  {section.list.map((item) => (
                    <li key={item.slice(0, 40)}>{item}</li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
        </div>
      </Section>
    </>
  );
}
