import { Clock, Mail, MessageSquare, ShieldCheck } from 'lucide-react';
import { Suspense } from 'react';

import { ContactForm } from '@/components/forms/contact-form';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { JsonLd } from '@/components/seo/json-ld';
import { Container } from '@/components/ui/container';
import { LoadingState } from '@/components/ui/states';
import { Section } from '@/components/ui/section';
import { Reveal } from '@/components/ui/motion';
import { about } from '@/content/about';
import { siteConfig } from '@/content/site';
import { buildMetadata } from '@/lib/seo/metadata';
import { contactPageSchema } from '@/lib/seo/structured-data';

/**
 * Contact page — instruction §26.
 *
 * The form is a client component wrapped in Suspense because it reads `useSearchParams` to
 * pre-select the service interest from a CTA link (`/contact?interest=automation`). Everything
 * around it stays server-rendered.
 */
export const metadata = buildMetadata({
  title: 'Contact',
  description:
    'Tell NEVIX what you are trying to solve. Structured enquiry form for AI, automation, digital engineering, data, product engineering and consulting requirements.',
  path: '/contact',
});

const assurances = [
  {
    icon: MessageSquare,
    title: 'A person reads it',
    body: 'Enquiries are read by an engineer, not routed into a sales sequence.',
  },
  {
    icon: Clock,
    title: 'Usually within two working days',
    body: 'If it will take longer to give you a useful answer, we will say so first.',
  },
  {
    icon: ShieldCheck,
    title: 'We will tell you if we are wrong for it',
    body: 'If the problem is outside what we do well, we would rather say so than take the work.',
  },
];

export default function ContactPage() {
  return (
    <>
      <JsonLd id="contact-page" data={contactPageSchema()} />

      <section className="brand-field dark-section hero-offset">
        <Container>
          <div className="py-14 sm:py-16 lg:py-20">
            <Breadcrumbs entries={[{ name: 'Contact', href: '/contact' }]} onDark />
            <div className="mt-9 max-w-3xl">
              <p className="text-eyebrow text-cyan-brand-400 uppercase">Contact</p>
              <h1 className="mt-4 text-display-lg text-white">
                Start with the problem, not the solution
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-neutral-300">
                You do not need a specification or a technology preference. Tell us what is
                happening now, what it costs and what a better outcome would look like — that is
                enough for a useful first conversation.
              </p>
            </div>
          </div>
        </Container>
      </section>

      <Section tone="light" size="lg">
        <div className="grid gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:gap-16">
          <Reveal>
            <h2 className="sr-only">Enquiry form</h2>
            <Suspense fallback={<LoadingState label="Loading the form" />}>
              <ContactForm />
            </Suspense>
          </Reveal>

          <Reveal delay={0.1} className="flex flex-col gap-6">
            <div className="rounded-(--radius-panel) border border-neutral-200 bg-neutral-50 p-6">
              <h2 className="text-eyebrow text-brand-700 uppercase">Direct contact</h2>
              <a
                href={`mailto:${siteConfig.contact.email}`}
                className="mt-4 flex items-center gap-2.5 text-base font-semibold text-neutral-900 hover:text-brand-700"
              >
                <Mail className="size-5 text-brand-600" aria-hidden="true" />
                {siteConfig.contact.email}
              </a>
              {/*
                DUMMY-DATA: DD-004
                No phone number or postal address is published, because none has been supplied.
                An invented one would be worse than its absence.
              */}
              <p className="mt-4 text-sm leading-relaxed text-neutral-600">
                A phone number and registered office address will be published here once confirmed.
                Email is the fastest route to us in the meantime.
              </p>
            </div>

            <div className="rounded-(--radius-panel) border border-neutral-200 bg-white p-6">
              <h2 className="text-eyebrow text-brand-700 uppercase">What happens next</h2>
              <ul className="mt-5 flex flex-col gap-5">
                {assurances.map(({ icon: Icon, title, body }) => (
                  <li key={title} className="flex gap-3">
                    <Icon className="mt-0.5 size-5 shrink-0 text-brand-600" aria-hidden="true" />
                    <div>
                      <p className="text-sm font-bold text-neutral-900">{title}</p>
                      <p className="mt-1 text-sm leading-relaxed text-neutral-600">{body}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-(--radius-panel) border border-neutral-200 bg-white p-6">
              <h2 className="text-eyebrow text-brand-700 uppercase">Engagement models</h2>
              <ul className="mt-4 flex flex-col gap-3">
                {about.engagementModels.map((model) => (
                  <li key={model.title} className="text-sm">
                    <span className="font-semibold text-neutral-900">{model.title}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </Section>
    </>
  );
}
