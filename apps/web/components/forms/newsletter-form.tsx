'use client';

import { CheckCircle2, Loader2 } from 'lucide-react';
import { useState } from 'react';

import type { NewsletterResponse } from '@nevix/types';

import { Button } from '@/components/ui/button';
import { ApiError, apiRequest } from '@/lib/api/client';
import { newsletterSchema } from '@/lib/validation/contact';
import { cn } from '@/lib/utils';

/**
 * Newsletter subscription form.
 *
 * Double opt-in: the backend records a pending subscriber and sends a confirmation email. Nothing
 * is added to a sending list until the recipient confirms, which is both the lawful default and
 * the reason the success message says "check your inbox" rather than "subscribed".
 */
export function NewsletterForm({
  className,
  source = 'footer',
}: {
  className?: string;
  source?: string;
}) {
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [honeypot, setHoneypot] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    const parsed = newsletterSchema.safeParse({ email, consent, website: honeypot, source });

    if (!parsed.success) {
      setStatus('error');
      setMessage(parsed.error.issues[0]?.message ?? 'Please check the details and try again.');
      return;
    }

    setStatus('submitting');

    try {
      const response = await apiRequest<NewsletterResponse>('/v1/newsletter', {
        method: 'POST',
        body: parsed.data,
      });
      setStatus('success');
      setMessage(response.message);
      setEmail('');
      setConsent(false);
    } catch (error) {
      setStatus('error');
      setMessage(
        error instanceof ApiError
          ? error.message
          : 'We could not complete that just now. Please try again shortly.',
      );
    }
  }

  if (status === 'success') {
    return (
      <div
        className={cn(
          'flex items-start gap-3 rounded-lg border border-cyan-brand-400/30 bg-cyan-brand-500/10 p-4',
          className,
        )}
        role="status"
      >
        <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-cyan-brand-400" aria-hidden="true" />
        <p className="text-sm text-neutral-200">{message}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={cn('flex flex-col gap-3', className)} noValidate>
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="flex-1">
          <label htmlFor="newsletter-email" className="sr-only">
            Email address
          </label>
          <input
            id="newsletter-email"
            type="email"
            name="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@organisation.com"
            aria-invalid={status === 'error' || undefined}
            aria-describedby={message ? 'newsletter-message' : undefined}
            className={cn(
              'h-11 w-full rounded-lg border border-white/15 bg-white/5 px-3.5 text-sm text-white',
              'placeholder:text-neutral-500',
              'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-cyan-brand-400',
              'aria-[invalid=true]:border-red-400/60',
            )}
          />
        </div>

        <Button type="submit" variant="onDark" disabled={status === 'submitting'}>
          {status === 'submitting' ? (
            <>
              <Loader2 className="animate-spin" aria-hidden="true" />
              <span>Subscribing</span>
            </>
          ) : (
            'Subscribe'
          )}
        </Button>
      </div>

      <div className="flex items-start gap-2.5">
        <input
          id="newsletter-consent"
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5 size-4 shrink-0 cursor-pointer rounded border-white/30 bg-white/10 text-brand-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-brand-400"
        />
        <label htmlFor="newsletter-consent" className="text-xs leading-relaxed text-neutral-400">
          I agree to receive occasional emails from NEVIX and understand I can unsubscribe at any
          time.
        </label>
      </div>

      {/* Honeypot — see HoneypotField for why this is positioned off-screen rather than hidden. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="newsletter-website">Leave this field empty</label>
        <input
          id="newsletter-website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      {message && status === 'error' ? (
        <p id="newsletter-message" role="alert" className="text-sm font-medium text-red-300">
          {message}
        </p>
      ) : null}
    </form>
  );
}
