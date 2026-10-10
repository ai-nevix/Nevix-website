import { Download } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { CtaSection } from '@/components/sections/cta-section';
import { PageHero } from '@/components/sections/page-hero';
import { Button } from '@/components/ui/button';
import { Section, SectionHeading } from '@/components/ui/section';
import { Reveal, Stagger, StaggerItem } from '@/components/ui/motion';
import {
  BRAND_PAGE_ENABLED,
  brandBoard,
  brandIntro,
  downloads,
  inTheWorld,
  lockups,
  markStory,
  marks,
  palette,
  typefaces,
  type BrandPicture,
} from '@/content/brand';
import { brandAssets, ctas } from '@/content/site';
import { buildMetadata } from '@/lib/seo/metadata';
import { cn } from '@/lib/utils';

/**
 * Brand — the NEVIX identity, and the home of every supplied brand image.
 *
 * Each picture is the supplied artwork, published whole and presented on the background it was
 * made for. The page states what the artwork shows and how this site applies it; it does not
 * invent usage rules beyond what the supplied logo summary itself sets out.
 *
 * Currently hidden: while `BRAND_PAGE_ENABLED` is false (content/brand.ts) this route renders the
 * 404 page and nothing on the site links to it.
 */
export const metadata = buildMetadata({
  title: 'Brand',
  description:
    'The NEVIX identity: the N mark, the wordmark, the logo lockups, colours and typefaces, and the brand in use.',
  path: '/brand',
});

function Picture({
  picture,
  sizes,
  className,
}: {
  picture: BrandPicture;
  sizes: string;
  className?: string;
}) {
  return (
    <figure className={cn('flex h-full flex-col', className)}>
      <div
        className={cn(
          'relative overflow-hidden rounded-(--radius-card)',
          picture.surface === 'dark'
            ? 'bg-ink-950 ring-1 ring-white/10'
            : 'bg-white ring-1 ring-neutral-200',
        )}
      >
        <Image
          src={picture.src}
          width={picture.width}
          height={picture.height}
          alt={picture.alt}
          sizes={sizes}
          className="h-auto w-full"
        />
      </div>
      <figcaption className="mt-4">
        <span className="block font-display text-base font-semibold tracking-tight text-neutral-900">
          {picture.title}
        </span>
        <span className="mt-1 block text-sm text-neutral-600">{picture.caption}</span>
      </figcaption>
    </figure>
  );
}

export default function BrandPage() {
  if (!BRAND_PAGE_ENABLED) notFound();

  return (
    <>
      <PageHero
        breadcrumbs={[{ name: 'Brand', href: '/brand' }]}
        eyebrow={brandIntro.eyebrow}
        title={brandIntro.title}
        description={brandIntro.description}
        actions={
          <>
            <Button asChild size="lg" variant="onDark">
              <a href="#downloads">Download the logo</a>
            </Button>
            <Button asChild size="lg" variant="outlineOnDark">
              <Link href="/about">About NEVIX</Link>
            </Button>
          </>
        }
      />

      {/* --- The mark ------------------------------------------------------------------------ */}
      <Section tone="light" size="lg">
        <div className="grid items-center gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:gap-24">
          <div>
            <SectionHeading eyebrow="The mark" title={markStory.title} />
            <div className="mt-7 flex flex-col gap-5 text-base leading-relaxed text-neutral-600 sm:text-lg">
              {markStory.paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 32)}>{paragraph}</p>
              ))}
            </div>

            <dl className="mt-10 grid gap-4 sm:grid-cols-2">
              {markStory.lines.map((line) => (
                <div key={line.label} className="card-surface p-5">
                  <dt className="text-eyebrow text-neutral-500 uppercase">{line.label}</dt>
                  <dd className="mt-2 font-display text-lg font-semibold tracking-tight text-neutral-900">
                    {line.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <Reveal delay={0.1}>
            <div className="relative mx-auto flex aspect-square w-full max-w-sm items-center justify-center overflow-hidden rounded-(--radius-panel) bg-ink-950">
              <div
                aria-hidden="true"
                className="absolute inset-[22%] rounded-full bg-brand-600/45 blur-3xl"
              />
              <Image
                src={brandAssets.mark.src}
                width={brandAssets.mark.width}
                height={brandAssets.mark.height}
                alt="The NEVIX N: a left stroke, a rounded diagonal and a right stroke, lit from deep blue to cyan."
                sizes="240px"
                className="relative h-auto w-[58%] drop-shadow-[0_0_24px_rgb(51_198_255/0.45)]"
              />
            </div>
          </Reveal>
        </div>
      </Section>

      {/* --- Lockups ------------------------------------------------------------------------- */}
      <Section tone="subtle" size="lg">
        <SectionHeading
          eyebrow="Logo"
          title="Lockups"
          description="The N and the wordmark together, in the forms supplied for light and dark surfaces."
        />

        <Stagger className="mt-14">
          <ul className="grid gap-8 lg:grid-cols-2">
            {lockups.map((picture, index) => (
              <StaggerItem as="li" key={picture.src} className={index === 0 ? 'lg:col-span-2' : ''}>
                <Picture
                  picture={picture}
                  sizes={
                    index === 0
                      ? '(max-width: 1280px) 100vw, 1280px'
                      : '(max-width: 1024px) 100vw, 640px'
                  }
                />
              </StaggerItem>
            ))}
          </ul>
        </Stagger>

        <Stagger className="mt-12">
          <ul className="grid gap-8 sm:grid-cols-3">
            {marks.map((picture) => (
              <StaggerItem as="li" key={picture.src}>
                <Picture picture={picture} sizes="(max-width: 640px) 100vw, 420px" />
              </StaggerItem>
            ))}
          </ul>
        </Stagger>
      </Section>

      {/* --- Logo summary --------------------------------------------------------------------- */}
      <Section tone="light" size="lg">
        <SectionHeading
          eyebrow="Logo summary"
          title="Every form on one board"
          description={brandBoard.caption}
        />
        <Reveal delay={0.1} className="mt-12">
          <div className="overflow-hidden rounded-(--radius-panel) bg-white shadow-[var(--shadow-panel)] ring-1 ring-neutral-200">
            <Image
              src={brandBoard.src}
              width={brandBoard.width}
              height={brandBoard.height}
              alt={brandBoard.alt}
              sizes="(max-width: 1280px) 100vw, 1280px"
              className="h-auto w-full"
            />
          </div>
        </Reveal>
      </Section>

      {/* --- Colour and type ------------------------------------------------------------------ */}
      <Section tone="brand-field" size="lg">
        <SectionHeading
          eyebrow="Colour and type"
          title="How this site applies the identity"
          description="Colours sampled from the artwork, and the typefaces set beside it. These are the design tokens this website is built on."
          onDark
        />

        <Stagger className="mt-14">
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {palette.map((colour) => (
              <StaggerItem as="li" key={colour.hex} className="card-glass overflow-hidden">
                <div className="h-24" style={{ backgroundColor: colour.hex }} aria-hidden="true" />
                <div className="p-5">
                  <p className="flex items-baseline justify-between gap-3">
                    <span className="font-display text-base font-semibold text-white">
                      {colour.name}
                    </span>
                    <span className="font-mono text-xs text-neutral-400">{colour.hex}</span>
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-400">{colour.role}</p>
                </div>
              </StaggerItem>
            ))}
          </ul>
        </Stagger>

        <Stagger className="mt-12">
          <ul className="grid gap-4 md:grid-cols-2">
            {typefaces.map((face) => (
              <StaggerItem as="li" key={face.name} className="card-glass p-7">
                <p className="text-eyebrow text-cyan-brand-300 uppercase">{face.role}</p>
                <p
                  className={cn(
                    'mt-4 text-5xl font-semibold tracking-tight text-white',
                    face.className,
                  )}
                >
                  {face.name}
                </p>
                <p className={cn('mt-3 text-lg text-neutral-300', face.className)}>
                  Explore. Automate. Evolve. — 0123456789
                </p>
                <p className="mt-4 text-sm leading-relaxed text-neutral-400">{face.note}</p>
              </StaggerItem>
            ))}
          </ul>
        </Stagger>
      </Section>

      {/* --- In the world -------------------------------------------------------------------- */}
      <Section tone="light" size="lg">
        <SectionHeading
          eyebrow="In use"
          title="The brand in the world"
          description="The identity applied to space, screens and profiles."
        />

        <Stagger className="mt-14">
          <ul className="grid gap-8 md:grid-cols-2">
            {inTheWorld.map((picture, index) => (
              <StaggerItem as="li" key={picture.src} className={index === 0 ? 'md:col-span-2' : ''}>
                <Picture
                  picture={picture}
                  sizes={
                    index === 0
                      ? '(max-width: 1280px) 100vw, 1280px'
                      : '(max-width: 768px) 100vw, 640px'
                  }
                />
              </StaggerItem>
            ))}
          </ul>
        </Stagger>
      </Section>

      {/* --- Downloads ------------------------------------------------------------------------ */}
      <Section tone="subtle" size="md" id="downloads">
        <SectionHeading
          eyebrow="Downloads"
          title="Logo files"
          description="Transparent files, separated from their backgrounds without redrawing — ready for light and dark surfaces."
        />

        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {downloads.map((item) => (
            <li key={item.file}>
              <a
                href={item.file}
                download
                className="card-surface card-interactive group relative flex h-full flex-col gap-3 p-5"
              >
                <Download
                  className="size-5 text-brand-600 transition-transform group-hover:translate-y-0.5"
                  aria-hidden="true"
                />
                <span className="font-display text-base font-semibold tracking-tight text-neutral-900">
                  {item.label}
                </span>
                <span className="text-xs text-neutral-500">{item.note}</span>
              </a>
            </li>
          ))}
        </ul>
      </Section>

      <CtaSection
        eyebrow="Work with us"
        title="Intelligence in motion starts with a conversation"
        primary={ctas.primary}
        secondary={ctas.services}
      />
    </>
  );
}
