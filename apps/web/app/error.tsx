'use client';

import { RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';

/**
 * Route-level error boundary (instruction §52).
 *
 * The visitor is never shown the exception message or a stack trace. `error.digest` is the
 * server-side correlation id, so a support conversation can be tied to the log entry without
 * exposing anything about the failure itself.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Reported to the browser console and, in production, to GlitchTip via the platform SDK.
    console.error('Route error', { digest: error.digest });
  }, [error]);

  return (
    <Container size="prose">
      <div className="py-20 sm:py-28">
        <p className="font-mono text-sm font-bold text-danger">Error</p>
        <h1 className="mt-4 text-display-md text-neutral-900">Something went wrong</h1>
        <p className="mt-5 text-lg leading-relaxed text-neutral-600">
          This page failed to load. The problem has been logged and we will look at it. Trying again
          often works, because most failures of this kind are transient.
        </p>

        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <Button size="lg" onClick={reset}>
            <RotateCcw aria-hidden="true" />
            Try again
          </Button>
          <Button asChild size="lg" variant="secondary">
            <Link href="/">Back to the homepage</Link>
          </Button>
        </div>

        {error.digest ? (
          <p className="mt-10 border-t border-neutral-200 pt-6 text-sm text-neutral-500">
            If you contact us about this, quote reference{' '}
            <span className="font-mono font-semibold text-neutral-700">{error.digest}</span>.
          </p>
        ) : null}
      </div>
    </Container>
  );
}
