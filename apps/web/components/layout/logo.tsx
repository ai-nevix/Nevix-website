import Image from 'next/image';
import Link from 'next/link';

import { brandAssets, siteConfig } from '@/content/site';
import { cn } from '@/lib/utils';

/**
 * NEVIX logo lockup — the N beside the wordmark.
 *
 * Both halves are the supplied artwork, separated from its background by
 * scripts/derive-brand-assets.mjs; nothing is redrawn and the name is never set as live text in
 * place of the logo (instruction §9).
 *
 * The lockup is assembled here rather than shipped as one image because the supplied lockups
 * carry the tagline beneath the wordmark, which is a few pixels tall at header size. Setting the
 * two halves side by side keeps the mark and the wordmark at the proportion they have in the
 * primary logo, without the tagline.
 *
 * - `onDark`  — white wordmark, for the midnight header, footer and heroes
 * - `onLight` — navy wordmark, for light surfaces
 * - `symbol`  — the N alone
 */
const sizes = {
  sm: { mark: 'h-7', word: 'h-[0.95rem]', gap: 'gap-2.5' },
  md: { mark: 'h-8 lg:h-9', word: 'h-[1.05rem] lg:h-[1.15rem]', gap: 'gap-2.5 lg:gap-3' },
  lg: { mark: 'h-11', word: 'h-[1.4rem]', gap: 'gap-3.5' },
} as const;

export function Logo({
  variant = 'onDark',
  size = 'md',
  className,
  priority = false,
  /** When false, renders the artwork without a surrounding link. */
  asLink = true,
}: {
  variant?: 'onDark' | 'onLight' | 'symbol';
  size?: keyof typeof sizes;
  className?: string;
  priority?: boolean;
  asLink?: boolean;
}) {
  const scale = sizes[size];
  const wordmark = variant === 'onLight' ? brandAssets.wordmarkDark : brandAssets.wordmarkLight;

  const artwork = (
    <span className={cn('inline-flex items-center', scale.gap, className)}>
      <Image
        src={brandAssets.mark.src}
        width={brandAssets.mark.width}
        height={brandAssets.mark.height}
        // When the wordmark is present it names the company; the mark alone needs the name itself.
        alt={variant === 'symbol' ? siteConfig.name : ''}
        priority={priority}
        className={cn('w-auto', scale.mark)}
        sizes="48px"
      />
      {variant === 'symbol' ? null : (
        <Image
          src={wordmark.src}
          width={wordmark.width}
          height={wordmark.height}
          alt={siteConfig.name}
          priority={priority}
          className={cn('w-auto', scale.word)}
          sizes="140px"
        />
      )}
    </span>
  );

  if (!asLink) return artwork;

  return (
    <Link
      href="/"
      aria-label={`${siteConfig.name} — home`}
      className="inline-flex shrink-0 items-center rounded-md transition-opacity hover:opacity-85"
    >
      {artwork}
    </Link>
  );
}
