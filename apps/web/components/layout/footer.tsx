import Image from 'next/image';
import Link from 'next/link';

import { NewsletterForm } from '@/components/forms/newsletter-form';
import { Logo } from '@/components/layout/logo';
import { Container } from '@/components/ui/container';
import { brandAssets, footerNav, siteConfig } from '@/content/site';

/**
 * Site footer.
 *
 * The legal-entity line renders a registered placeholder (DD-005) rather than an invented company
 * name, and no certification, partnership or membership marks appear — none have been supplied.
 *
 * The silver N, very large and very faint, closes the page the way the wall sign closes the brand
 * photography. It is decorative and hidden from assistive technology.
 */
export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="dark-section relative overflow-hidden bg-ink-950">
      <div className="horizon-line top-0 bottom-auto" aria-hidden="true" />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -bottom-40 hidden w-[30rem] opacity-[0.05] lg:block"
      >
        <Image
          src={brandAssets.markSilver.src}
          width={brandAssets.markSilver.width}
          height={brandAssets.markSilver.height}
          alt=""
          sizes="480px"
          className="h-auto w-full"
        />
      </div>

      <Container className="relative">
        <div className="grid gap-12 py-16 lg:grid-cols-[minmax(0,22rem)_1fr] lg:gap-16 lg:py-20">
          <div>
            <Logo size="lg" />

            <p className="mt-6 text-eyebrow text-cyan-brand-300 uppercase">{siteConfig.tagline}</p>
            <span className="rule-accent mt-3" aria-hidden="true" />

            <p className="mt-6 max-w-sm text-sm leading-relaxed text-neutral-400">
              {siteConfig.masterDescription}
            </p>

            <div className="mt-8 rounded-(--radius-card) border border-white/10 bg-white/3 p-5">
              <h2 className="text-sm font-semibold text-white">Insights by email</h2>
              <p className="mt-1.5 text-sm text-neutral-400">
                Occasional writing on applied AI, automation and engineering. No tracking, and you
                can unsubscribe from any message.
              </p>
              <NewsletterForm className="mt-4" />
            </div>
          </div>

          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {footerNav.map((column) => (
              <nav key={column.title} aria-labelledby={`footer-${column.title.toLowerCase()}`}>
                <h2
                  id={`footer-${column.title.toLowerCase()}`}
                  className="font-sans text-eyebrow text-neutral-400 uppercase"
                >
                  {column.title}
                </h2>
                <ul className="mt-5 flex flex-col gap-3">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-neutral-300 transition-colors hover:text-white"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-6 border-t border-white/10 py-8 md:flex-row md:items-center md:justify-between">
          <div className="text-sm text-neutral-400">
            <p>
              © {year} {siteConfig.name}. All rights reserved.
            </p>
            {/* DUMMY-DATA: DD-005 — replace with the registered entity details once confirmed. */}
            <p className="mt-1 text-xs text-neutral-400">{siteConfig.legalEntity}</p>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <a
              href={`mailto:${siteConfig.contact.email}`}
              className="text-sm text-neutral-300 transition-colors hover:text-white"
            >
              {siteConfig.contact.email}
            </a>

            {/* DUMMY-DATA: DD-010 — confirm or remove each profile before launch. */}
            <ul className="flex items-center gap-4">
              {siteConfig.social.map((profile) => (
                <li key={profile.href}>
                  <a
                    href={profile.href}
                    rel="noopener noreferrer me"
                    target="_blank"
                    className="text-sm text-neutral-400 transition-colors hover:text-white"
                  >
                    {profile.label}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </footer>
  );
}
