import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { Reveal } from '@/components/ui/motion';
import { ctas, siteConfig } from '@/content/site';

export interface CtaSectionProps {
  eyebrow?: string;
  title?: string;
  description?: string;
  primary?: { label: string; href: string };
  secondary?: { label: string; href: string };
  /** Light variant for pages that already end on a dark section. */
  tone?: 'midnight' | 'light';
}

/**
 * Closing call to action.
 *
 * Reused at the foot of every content page with a context-appropriate label. Catalogue §15 lists
 * the approved CTA wording; buttons describe the action rather than saying "Learn more"
 * (specification §10.1).
 */
export function CtaSection({
  eyebrow = 'Next step',
  title = 'Tell us what you are trying to solve',
  description = 'Describe the problem, the constraints and what a good outcome looks like. We will tell you whether it is worth building, and what we would build first.',
  primary = ctas.primary,
  secondary = ctas.consultation,
  tone = 'midnight',
}: CtaSectionProps) {
  const onDark = tone === 'midnight';

  return (
    <section className={onDark ? 'brand-field dark-section' : 'bg-neutral-50'}>
      <Container>
        <Reveal className="py-20 sm:py-24 lg:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <p
              className={`text-eyebrow uppercase ${onDark ? 'text-cyan-brand-400' : 'text-brand-700'}`}
            >
              {eyebrow}
            </p>

            <h2 className={`mt-5 text-display-md ${onDark ? 'text-white' : 'text-neutral-900'}`}>
              {title}
            </h2>

            <p
              className={`mx-auto mt-6 max-w-2xl text-lg leading-relaxed ${
                onDark ? 'text-neutral-300' : 'text-neutral-600'
              }`}
            >
              {description}
            </p>

            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild size="lg" variant={onDark ? 'onDark' : 'primary'}>
                <Link href={primary.href}>
                  {primary.label}
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild size="lg" variant={onDark ? 'outlineOnDark' : 'secondary'}>
                <Link href={secondary.href}>{secondary.label}</Link>
              </Button>
            </div>

            <p className={`mt-8 text-sm ${onDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
              Prefer email?{' '}
              <a
                href={`mailto:${siteConfig.contact.email}`}
                className={`font-semibold underline underline-offset-4 ${
                  onDark ? 'text-white hover:text-cyan-brand-300' : 'text-brand-700'
                }`}
              >
                {siteConfig.contact.email}
              </a>
            </p>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
