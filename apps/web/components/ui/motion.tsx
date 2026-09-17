import * as React from 'react';

import { cn } from '@/lib/utils';

/**
 * Scroll-reveal primitives (specification §4.1, §23.1, instruction §37).
 *
 * These are **server components that emit plain markup**. The reveal is driven entirely by CSS
 * scroll-driven animations (`animation-timeline: view()`), for three reasons:
 *
 * 1. **Content is visible without JavaScript.** An earlier implementation used Framer Motion's
 *    `whileInView`, which server-renders the element with `opacity: 0` and only reveals it once
 *    the client bundle has hydrated and an IntersectionObserver has fired. Any visitor without
 *    JavaScript — or with a slow connection, or a crawler that does not execute scripts — saw
 *    blank sections. That is a correctness problem, not a styling preference.
 * 2. **No client bundle cost.** Specification §23.1 asks for minimal unnecessary client-side
 *    JavaScript. These components ship none.
 * 3. **Reduced motion is honoured at the CSS layer**, so it cannot be bypassed by a hydration
 *    race.
 *
 * Browsers without `animation-timeline` support simply render the content in its final state —
 * the animation is progressive enhancement, never a precondition for visibility.
 *
 * Framer Motion is still used for genuinely interactive motion, where enter/exit transitions have
 * to coordinate with unmounting (see components/navigation/mobile-nav.tsx).
 */

export interface RevealProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * Stagger index. Shifts the animation range slightly so adjacent elements resolve in sequence.
   * Values above about 6 stop being perceptible.
   */
  delay?: number;
  as?: React.ElementType;
}

/** Reveals a block as it scrolls into view. */
export function Reveal({
  className,
  delay = 0,
  as: Component = 'div',
  style,
  ...props
}: RevealProps) {
  return (
    <Component
      className={cn('reveal', className)}
      style={{ ...style, ...revealDelayStyle(delay) }}
      {...props}
    />
  );
}

export interface StaggerProps extends React.HTMLAttributes<HTMLElement> {
  as?: React.ElementType;
}

/**
 * Marks a container whose `StaggerItem` children reveal in sequence.
 *
 * The container itself does not animate; it only establishes the counter that gives each child a
 * different animation range.
 */
export function Stagger({ className, as: Component = 'div', ...props }: StaggerProps) {
  return <Component className={cn('stagger', className)} {...props} />;
}

export interface StaggerItemProps extends React.HTMLAttributes<HTMLElement> {
  as?: React.ElementType;
}

export function StaggerItem({ className, as: Component = 'div', ...props }: StaggerItemProps) {
  return <Component className={cn('stagger-item', className)} {...props} />;
}

/**
 * Framer Motion's `delay` is expressed in seconds; this keeps the same call sites working by
 * mapping a small second-value onto the CSS stagger step.
 */
function revealDelayStyle(delay: number): React.CSSProperties {
  const steps = Math.min(6, Math.max(0, Math.round(delay / 0.05)));
  return steps > 0 ? ({ ['--reveal-step']: String(steps) } as React.CSSProperties) : {};
}
