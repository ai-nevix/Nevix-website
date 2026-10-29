'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import Image from 'next/image';
import { useRef, useState, type KeyboardEvent } from 'react';

import type { GalleryImage } from '@nevix/types';

/**
 * A solution's screenshot gallery: a thumbnail grid that opens a full-size lightbox on click, with
 * previous/next navigation. Built on Radix Dialog rather than by hand, so focus trapping, Escape to
 * close, returning focus to the thumbnail on close, and marking the rest of the page inert for
 * screen readers all come for free.
 *
 * Renders nothing when a solution has no screenshots yet — this is additive, not a layout a project
 * has to fill before it ships.
 */
export function SolutionGallery({
  images,
  solutionName,
}: {
  images: GalleryImage[];
  solutionName: string;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const triggerRefs = useRef<(HTMLButtonElement | null)[]>([]);
  // Radix returns focus to whatever opened the dialog, but that only works through its own
  // `Dialog.Trigger`. Here the trigger is one of several dynamically mapped buttons, so the index
  // is tracked by hand and focus is restored explicitly in `onCloseAutoFocus` below.
  const lastOpenIndexRef = useRef<number | null>(null);

  if (images.length === 0) return null;

  const current = openIndex === null ? null : images[openIndex]!;

  function openAt(index: number) {
    lastOpenIndexRef.current = index;
    setOpenIndex(index);
  }

  function show(delta: number) {
    setOpenIndex((index) => {
      if (index === null) return index;
      const next = (index + delta + images.length) % images.length;
      lastOpenIndexRef.current = next;
      return next;
    });
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'ArrowLeft') show(-1);
    if (event.key === 'ArrowRight') show(1);
  }

  return (
    <>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((image, index) => (
          <li key={image.src}>
            <button
              ref={(element) => {
                triggerRefs.current[index] = element;
              }}
              type="button"
              onClick={() => openAt(index)}
              aria-label={`View screenshot ${index + 1} of ${images.length}${image.caption ? `: ${image.caption}` : ''}`}
              className="group relative block aspect-video w-full overflow-hidden rounded-(--radius-card) border border-neutral-200 bg-neutral-100 shadow-(--shadow-card) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand-400 focus-visible:ring-offset-2"
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              {image.caption ? (
                <span className="absolute inset-x-0 bottom-0 bg-linear-to-t from-ink-950/85 to-transparent p-3 text-left text-sm font-medium text-white">
                  {image.caption}
                </span>
              ) : null}
            </button>
          </li>
        ))}
      </ul>

      <Dialog.Root open={openIndex !== null} onOpenChange={(open) => !open && setOpenIndex(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-ink-950/85 backdrop-blur-sm" />

          <Dialog.Content
            onKeyDown={handleKeyDown}
            onCloseAutoFocus={(event) => {
              event.preventDefault();
              const index = lastOpenIndexRef.current;
              if (index !== null) triggerRefs.current[index]?.focus();
            }}
            className="fixed inset-4 z-50 flex items-center justify-center outline-none sm:inset-10"
            aria-label={`${solutionName} screenshots`}
          >
            <Dialog.Title className="sr-only">
              {current ? current.alt : `${solutionName} screenshot`}
            </Dialog.Title>

            <Dialog.Close asChild>
              <button
                type="button"
                className="absolute top-0 right-0 inline-flex size-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand-400"
                aria-label="Close"
              >
                <X className="size-6" aria-hidden="true" />
              </button>
            </Dialog.Close>

            {images.length > 1 ? (
              <>
                <button
                  type="button"
                  onClick={() => show(-1)}
                  className="absolute top-1/2 left-0 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand-400"
                  aria-label="Previous screenshot"
                >
                  <ChevronLeft className="size-6" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => show(1)}
                  className="absolute top-1/2 right-0 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand-400"
                  aria-label="Next screenshot"
                >
                  <ChevronRight className="size-6" aria-hidden="true" />
                </button>
              </>
            ) : null}

            {current ? (
              <figure className="flex max-h-full w-[min(90vw,1400px)] flex-col items-center gap-3 px-14">
                <div
                  className="relative max-h-[78vh] w-full"
                  style={{
                    aspectRatio:
                      current.width && current.height
                        ? `${current.width} / ${current.height}`
                        : '16 / 9',
                  }}
                >
                  <Image
                    src={current.src}
                    alt={current.alt}
                    fill
                    sizes="90vw"
                    className="rounded-(--radius-card) object-contain"
                  />
                </div>
                {current.caption ? (
                  <figcaption className="text-sm text-neutral-200">{current.caption}</figcaption>
                ) : null}
                {images.length > 1 ? (
                  <p className="text-xs text-neutral-400">
                    {openIndex! + 1} / {images.length}
                  </p>
                ) : null}
              </figure>
            ) : null}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
