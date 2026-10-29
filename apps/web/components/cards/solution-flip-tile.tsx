'use client';

import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState, type FocusEvent } from 'react';

import type { Solution } from '@nevix/types';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { solutionStatusMeta } from '@/content/solutions';
import { cn } from '@/lib/utils';

const statusTone = {
  neutral: 'neutral',
  info: 'info',
  warning: 'warning',
  success: 'success',
} as const;

/**
 * A solution shown logo-first: the tile is the project's own logo and nothing else, until a visitor
 * hovers, focuses or taps it, at which point it flips to a short description and a link to the full
 * page. Used on the homepage teaser and the `/solutions` index — the related-solutions lists on
 * industry and service pages keep the plain text `SolutionCard` instead, where a flip tile would be
 * cramped.
 *
 * Hover and keyboard focus both preview the back (so the card does not depend on a pointer); a
 * click or tap pins it open, which is what a touch device needs since it has no hover state. The
 * flip itself is purely presentational and respects `prefers-reduced-motion` — the content behind
 * it is identical either way, just not animated into view.
 */
export function SolutionFlipTile({ solution }: { solution: Solution }) {
  const [hovering, setHovering] = useState(false);
  const [pinned, setPinned] = useState(false);
  const status = solutionStatusMeta[solution.status];
  const flipped = hovering || pinned;

  function handleBlur(event: FocusEvent<HTMLDivElement>) {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setHovering(false);
    }
  }

  return (
    <div
      className="group relative aspect-video [perspective:1600px]"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onFocus={() => setHovering(true)}
      onBlur={handleBlur}
    >
      <div
        className={cn(
          'relative h-full w-full transition-transform duration-700 [transform-style:preserve-3d] motion-reduce:transition-none',
          flipped && '[transform:rotateY(180deg)]',
        )}
      >
        {/* --- Front: logo only ------------------------------------------------------------------ */}
        <button
          type="button"
          onClick={() => setPinned((value) => !value)}
          aria-expanded={flipped}
          aria-label={`${solution.name} — show description`}
          className="absolute inset-0 size-full overflow-hidden rounded-(--radius-card) border border-neutral-200 bg-white shadow-(--shadow-card) [backface-visibility:hidden] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand-400 focus-visible:ring-offset-2"
        >
          {solution.logo ? (
            <Image
              src={solution.logo.src}
              alt={solution.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover"
            />
          ) : (
            <span className="flex size-full items-center justify-center bg-linear-to-br from-brand-50 to-cyan-brand-300/15">
              <Icon name={solution.icon} className="size-10 text-brand-700" />
            </span>
          )}
        </button>

        {/* --- Back: description -------------------------------------------------------------------
            A plain click anywhere back here (other than the link) un-pins the tile — the front-face
            button that opened it is rotated out of reach once flipped, so without this a tap on a
            touch device would have no way to close it again. */}
        <div
          aria-hidden={!flipped}
          onClick={() => setPinned(false)}
          className="absolute inset-0 flex size-full flex-col gap-3 rounded-(--radius-card) border border-neutral-200 bg-white p-5 shadow-(--shadow-card) [backface-visibility:hidden] [transform:rotateY(180deg)]"
        >
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-base leading-snug font-semibold tracking-tight text-neutral-900">
              {solution.name}
            </h3>
            <Badge tone={statusTone[status.tone]} className="shrink-0">
              {status.label}
            </Badge>
          </div>

          <p className="line-clamp-3 flex-1 text-sm leading-relaxed text-neutral-600">
            {solution.summary}
          </p>

          <Button
            asChild
            size="sm"
            variant="secondary"
            className="self-start"
            tabIndex={flipped ? 0 : -1}
          >
            <Link href={`/solutions/${solution.slug}`} onClick={(event) => event.stopPropagation()}>
              View details
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
