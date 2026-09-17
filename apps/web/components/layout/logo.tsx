import Image from 'next/image';
import Link from 'next/link';

import { siteConfig } from '@/content/site';
import { cn } from '@/lib/utils';

/**
 * VASTRIX logo lockup.
 *
 * The supplied logo asset is authoritative and is never substituted with text (instruction §9).
 * Variants are derived from that one asset — see scripts/derive-brand-assets.mjs and
 * docs/content/brand-assets.md.
 */
export function Logo({
  variant = 'light',
  className,
  priority = false,
  /** When false, renders the image without a surrounding link. */
  asLink = true,
}: {
  variant?: 'light' | 'dark' | 'symbol';
  className?: string;
  priority?: boolean;
  asLink?: boolean;
}) {
  const source =
    variant === 'symbol'
      ? { src: '/brand/vastrix-symbol.png', width: 256, height: 116 }
      : variant === 'dark'
        ? { src: '/brand/vastrix-logo-dark.png', width: 640, height: 287 }
        : { src: '/brand/vastrix-logo.png', width: 640, height: 287 };

  const image = (
    <Image
      src={source.src}
      width={source.width}
      height={source.height}
      // The wordmark is part of the image, so the alt text names the company rather than
      // describing the artwork.
      alt={siteConfig.name}
      priority={priority}
      className={cn('h-auto w-auto object-contain', className)}
      sizes="(max-width: 768px) 120px, 160px"
    />
  );

  if (!asLink) return image;

  return (
    <Link
      href="/"
      aria-label={`${siteConfig.name} — home`}
      className="inline-flex shrink-0 items-center rounded-md transition-opacity hover:opacity-85"
    >
      {image}
    </Link>
  );
}
