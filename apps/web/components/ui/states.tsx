import { AlertTriangle, Inbox, Loader2 } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

/**
 * Empty, error and loading states (instruction §52).
 *
 * These never expose an exception message or stack trace to a visitor. Diagnostic detail belongs
 * in the server log, keyed by request id.
 */

export function EmptyState({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center rounded-(--radius-card) border border-dashed border-neutral-300 bg-neutral-50 px-6 py-14 text-center',
        className,
      )}
    >
      <Inbox className="size-8 text-neutral-400" aria-hidden="true" />
      <p className="mt-4 text-base font-semibold text-neutral-800">{title}</p>
      {description ? <p className="mt-2 max-w-md text-sm text-neutral-600">{description}</p> : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

export function ErrorState({
  title = 'This content is temporarily unavailable',
  description = 'We could not load this section just now. Please try again shortly.',
  action,
  className,
}: {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center rounded-(--radius-card) border border-amber-200 bg-warning-bg px-6 py-12 text-center',
        className,
      )}
    >
      <AlertTriangle className="size-8 text-warning" aria-hidden="true" />
      <p className="mt-4 text-base font-semibold text-neutral-900">{title}</p>
      <p className="mt-2 max-w-md text-sm text-neutral-700">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

export function LoadingState({
  label = 'Loading',
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn('flex items-center justify-center gap-3 py-12 text-neutral-600', className)}
    >
      <Loader2 className="size-5 animate-spin" aria-hidden="true" />
      <span className="text-sm font-medium">{label}…</span>
    </div>
  );
}

/** Content-shaped placeholder used while an async section resolves. */
export function CardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="h-56 animate-pulse rounded-(--radius-card) border border-neutral-200 bg-neutral-100"
        />
      ))}
    </div>
  );
}
