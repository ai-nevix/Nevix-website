import * as React from 'react';

import { cn } from '@/lib/utils';

import { Container } from './container';

/**
 * Page section with a consistent vertical rhythm and one of four surface treatments.
 *
 * Alternating `light` and `midnight` sections is the core of the VASTRIX visual language
 * (specification §4.1: "use dark sections selectively; not every page should be dark").
 */
export type SectionTone = 'light' | 'subtle' | 'midnight' | 'brand-field';

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  tone?: SectionTone;
  size?: 'sm' | 'md' | 'lg';
  containerSize?: 'content' | 'prose' | 'wide';
  /** Set to render children without the inner Container, for full-bleed content. */
  bleed?: boolean;
  as?: React.ElementType;
}

const toneClasses: Record<SectionTone, string> = {
  light: 'bg-white text-neutral-700',
  subtle: 'bg-neutral-50 text-neutral-700',
  midnight: 'dark-section',
  'brand-field': 'brand-field dark-section',
};

const sizeClasses = {
  sm: 'py-12 sm:py-16',
  md: 'py-16 sm:py-20 lg:py-24',
  lg: 'py-20 sm:py-28 lg:py-32',
} as const;

export function Section({
  tone = 'light',
  size = 'md',
  containerSize = 'content',
  bleed = false,
  className,
  children,
  as: Component = 'section',
  ...props
}: SectionProps) {
  return (
    <Component
      className={cn(toneClasses[tone], sizeClasses[size], 'relative', className)}
      {...props}
    >
      {bleed ? children : <Container size={containerSize}>{children}</Container>}
    </Component>
  );
}

export interface SectionHeadingProps {
  /** Small uppercase kicker above the title. */
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Renders light-on-dark. Set on midnight sections. */
  onDark?: boolean;
  align?: 'left' | 'center';
  /** Heading level. Defaults to h2 since a page should have exactly one h1. */
  as?: 'h1' | 'h2' | 'h3';
  className?: string;
  /** Rendered to the right of the heading on wide screens — usually a link or button. */
  action?: React.ReactNode;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  onDark = false,
  align = 'left',
  as: Heading = 'h2',
  className,
  action,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-6',
        action && 'lg:flex-row lg:items-end lg:justify-between',
        className,
      )}
    >
      <div className={cn('max-w-3xl', align === 'center' && 'mx-auto text-center')}>
        {eyebrow ? (
          <p
            className={cn(
              'mb-4 text-eyebrow uppercase',
              onDark ? 'text-cyan-brand-400' : 'text-brand-700',
            )}
          >
            {eyebrow}
          </p>
        ) : null}

        <Heading
          className={cn(
            Heading === 'h1' ? 'text-display-lg' : 'text-display-md',
            onDark ? 'text-white' : 'text-neutral-900',
          )}
        >
          {title}
        </Heading>

        {description ? (
          <div
            className={cn(
              'mt-5 text-base leading-relaxed sm:text-lg',
              onDark ? 'text-neutral-300' : 'text-neutral-600',
            )}
          >
            {description}
          </div>
        ) : null}
      </div>

      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
