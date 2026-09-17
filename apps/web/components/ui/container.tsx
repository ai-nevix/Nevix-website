import * as React from 'react';

import { cn } from '@/lib/utils';

/**
 * Horizontal page gutter and max width.
 *
 * The side padding lives here so that every section shares one gutter value and nothing can
 * touch the viewport edge on a narrow screen.
 */
export function Container({
  className,
  as: Component = 'div',
  size = 'content',
  ...props
}: React.HTMLAttributes<HTMLElement> & {
  as?: React.ElementType;
  size?: 'content' | 'prose' | 'wide';
}) {
  return (
    <Component
      className={cn(
        'mx-auto w-full px-5 sm:px-6 lg:px-8',
        size === 'content' && 'max-w-(--container-content)',
        size === 'prose' && 'max-w-(--container-prose)',
        size === 'wide' && 'max-w-[90rem]',
        className,
      )}
      {...props}
    />
  );
}
