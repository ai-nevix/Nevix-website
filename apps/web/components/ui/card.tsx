import * as React from 'react';

import { cn } from '@/lib/utils';

/**
 * Card surface.
 *
 * `interactive` adds hover and focus-within affordances. It is applied when the whole card
 * contains a link — the affordance responds to keyboard focus as well as hover, so the card does
 * not depend on a pointer (specification §10.1).
 */
export function Card({
  className,
  interactive = false,
  variant = 'surface',
  as: Component = 'div',
  ...props
}: React.HTMLAttributes<HTMLElement> & {
  interactive?: boolean;
  variant?: 'surface' | 'glass';
  as?: React.ElementType;
}) {
  return (
    <Component
      className={cn(
        variant === 'surface' ? 'card-surface' : 'card-glass',
        interactive && 'card-interactive',
        'relative flex flex-col',
        className,
      )}
      {...props}
    />
  );
}

export function CardBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-1 flex-col p-6', className)} {...props} />;
}

export function CardTitle({
  className,
  as: Component = 'h3',
  ...props
}: React.HTMLAttributes<HTMLHeadingElement> & { as?: React.ElementType }) {
  return (
    <Component
      className={cn('text-lg font-bold tracking-tight text-neutral-900', className)}
      {...props}
    />
  );
}

export function CardDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn('mt-2 text-sm leading-relaxed text-neutral-600', className)} {...props} />
  );
}
