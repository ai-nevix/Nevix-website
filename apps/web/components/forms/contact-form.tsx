'use client';

import { AlertCircle, CheckCircle2, Loader2, Paperclip, X } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';

import {
  BUDGET_OPTIONS,
  INDUSTRY_OPTIONS,
  SERVICE_INTERESTS,
  TIMELINE_OPTIONS,
  type ContactRequest,
  type ContactResponse,
  type ServiceInterest,
} from '@vastrix/types';

import { Button } from '@/components/ui/button';
import { ApiError, apiRequest } from '@/lib/api/client';
import {
  ATTACHMENT_RULES,
  contactSchema,
  validateAttachment,
  type ContactFormValues,
} from '@/lib/validation/contact';
import { cn } from '@/lib/utils';

import { Checkbox, Field, Select, TextArea, TextInput } from './fields';

/**
 * Contact / lead capture form — instruction §26.
 *
 * Behaviour:
 * - client-side validation with Zod, purely for UX; the server validates independently
 * - accessible inline errors, linked by `aria-describedby` and announced by `role="alert"`
 * - focus moves to the first invalid field on a failed submit
 * - honeypot plus a minimum time-on-form check for basic spam resistance
 * - server rate limiting produces a distinct, non-alarming message
 * - explicit success and failure states, both announced to assistive technology
 *
 * The attachment is uploaded separately and only its returned URL is submitted with the form, so
 * a large file cannot block or bloat the JSON enquiry request.
 */

/** Maps `?interest=<service-category-slug>` onto the matching select option. */
const INTEREST_BY_CATEGORY: Record<string, ServiceInterest> = {
  'ai-intelligence': 'AI & Intelligence',
  automation: 'Automation',
  'digital-engineering': 'Digital Engineering',
  'data-analytics': 'Data & Analytics',
  'product-saas-engineering': 'Product & SaaS Engineering',
  consulting: 'Consulting & Technology Advisory',
};

type SubmitState =
  | { status: 'idle' }
  | { status: 'submitting' }
  | { status: 'success'; reference: string; notified: boolean }
  | { status: 'error'; message: string };

export function ContactForm() {
  const searchParams = useSearchParams();
  const interestParam = searchParams.get('interest');
  const presetInterest = interestParam ? INTEREST_BY_CATEGORY[interestParam] : undefined;

  const [submitState, setSubmitState] = useState<SubmitState>({ status: 'idle' });
  const [attachment, setAttachment] = useState<{ name: string; url: string } | null>(null);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const successRef = useRef<HTMLDivElement>(null);

  /**
   * When the form became interactive, used for the minimum time-on-form check below.
   *
   * Set in an effect rather than as the initial ref value: `Date.now()` is impure and calling it
   * during render can produce a different value on every re-render.
   */
  const mountedAt = useRef<number | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    setFocus,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactFormValues>({
    defaultValues: {
      service_interest: presetInterest ?? ('Not sure yet' as ServiceInterest),
      consent: false as never,
    },
  });

  useEffect(() => {
    mountedAt.current = Date.now();
  }, []);

  // Move focus to the confirmation so a screen-reader user is taken to the outcome.
  useEffect(() => {
    if (submitState.status === 'success') successRef.current?.focus();
  }, [submitState.status]);

  async function uploadAttachment(file: File) {
    const clientError = validateAttachment(file);
    if (clientError) {
      setAttachmentError(clientError);
      return;
    }

    setAttachmentError(null);
    setUploading(true);

    try {
      const body = new FormData();
      body.append('file', file);

      const response = await fetch('/api/backend/v1/uploads', { method: 'POST', body });
      if (!response.ok) throw new Error('upload failed');

      const result = (await response.json()) as { url: string; filename: string };
      setAttachment({ name: result.filename, url: result.url });
    } catch {
      setAttachmentError(
        'We could not upload that file. You can submit the form without it and email the document to us instead.',
      );
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(values: ContactFormValues) {
    setSubmitState({ status: 'submitting' });

    const parsed = contactSchema.safeParse(values);

    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const field = issue.path[0];
        if (typeof field === 'string') {
          setError(field as keyof ContactFormValues, { message: issue.message });
        }
      }
      const first = parsed.error.issues[0]?.path[0];
      if (typeof first === 'string') setFocus(first as keyof ContactFormValues);
      setSubmitState({ status: 'idle' });
      return;
    }

    // Bots submit almost instantly. A person cannot realistically complete this form in under a
    // few seconds, so an unrealistically fast submission is treated as automated.
    const openedAt = mountedAt.current;
    if (openedAt !== null && Date.now() - openedAt < 3000) {
      setSubmitState({
        status: 'error',
        message: 'That was submitted a little too quickly. Please try again.',
      });
      return;
    }

    const payload: ContactRequest = {
      name: parsed.data.name,
      email: parsed.data.email,
      organization: parsed.data.organization || undefined,
      service_interest: parsed.data.service_interest,
      industry: parsed.data.industry || undefined,
      requirement: parsed.data.requirement,
      timeline: parsed.data.timeline || undefined,
      budget: parsed.data.budget || undefined,
      attachment_url: attachment?.url,
      consent: true,
      source: typeof window !== 'undefined' ? window.location.pathname : undefined,
      website: '',
    };

    try {
      const response = await apiRequest<ContactResponse, ContactRequest>('/v1/contact', {
        method: 'POST',
        body: payload,
      });

      setSubmitState({
        status: 'success',
        reference: response.reference,
        notified: response.notification_sent,
      });
      reset();
      setAttachment(null);
    } catch (error) {
      if (error instanceof ApiError && error.isValidationError && error.details) {
        for (const [field, messages] of Object.entries(error.details)) {
          setError(field as keyof ContactFormValues, { message: messages[0] });
        }
        setSubmitState({
          status: 'error',
          message: 'Please correct the highlighted fields and try again.',
        });
        return;
      }

      setSubmitState({
        status: 'error',
        message:
          error instanceof ApiError && error.isRateLimited
            ? 'You have sent several enquiries recently. Please wait a few minutes before trying again, or email us directly.'
            : error instanceof ApiError
              ? error.message
              : 'We could not send your enquiry just now. Please try again, or email us directly.',
      });
    }
  }

  if (submitState.status === 'success') {
    return (
      <div
        ref={successRef}
        tabIndex={-1}
        role="status"
        className="rounded-(--radius-panel) border border-emerald-200 bg-success-bg p-8 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
      >
        <CheckCircle2 className="size-8 text-success" aria-hidden="true" />
        <h2 className="mt-4 text-xl font-bold tracking-tight text-neutral-900">
          Thank you — we have your enquiry
        </h2>
        <p className="mt-3 text-base leading-relaxed text-neutral-700">
          Your reference is{' '}
          <span className="font-mono font-bold text-neutral-900">{submitState.reference}</span>.
          Please quote it if you follow up.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-neutral-600">
          {submitState.notified
            ? 'A member of the team has been notified and will read it properly before replying — usually within two working days.'
            : 'Your enquiry has been recorded. A member of the team will review it and reply, usually within two working days.'}
        </p>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <Button variant="secondary" onClick={() => setSubmitState({ status: 'idle' })}>
            Send another enquiry
          </Button>
          <Button asChild variant="ghost">
            <Link href="/insights">Read our insights while you wait</Link>
          </Button>
        </div>
      </div>
    );
  }

  const busy = isSubmitting || submitState.status === 'submitting';

  return (
    <form
      // `handleSubmit(onSubmit)` is constructed here rather than during render: `onSubmit` reads
      // a ref, and building the handler in the render phase would count as a render-time ref read.
      onSubmit={(event) => {
        void handleSubmit(onSubmit)(event);
      }}
      noValidate
      className="flex flex-col gap-6"
    >
      <div className="grid gap-6 sm:grid-cols-2">
        <Field id="name" label="Your name" error={errors.name?.message} required>
          {(a11y) => (
            <TextInput {...a11y} autoComplete="name" placeholder="Jane Doe" {...register('name')} />
          )}
        </Field>

        <Field id="email" label="Work email" error={errors.email?.message} required>
          {(a11y) => (
            <TextInput
              {...a11y}
              type="email"
              autoComplete="email"
              placeholder="jane@organisation.com"
              {...register('email')}
            />
          )}
        </Field>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field id="organization" label="Organisation" error={errors.organization?.message}>
          {(a11y) => (
            <TextInput
              {...a11y}
              autoComplete="organization"
              placeholder="Organisation name"
              {...register('organization')}
            />
          )}
        </Field>

        <Field id="industry" label="Industry" error={errors.industry?.message}>
          {(a11y) => (
            <Select {...a11y} defaultValue="" {...register('industry')}>
              <option value="">Select an industry</option>
              {INDUSTRY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          )}
        </Field>
      </div>

      <Field
        id="service_interest"
        label="What are you interested in?"
        error={errors.service_interest?.message}
        required
      >
        {(a11y) => (
          <Select {...a11y} {...register('service_interest')}>
            {SERVICE_INTERESTS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
        )}
      </Field>

      <Field
        id="requirement"
        label="What are you trying to solve?"
        hint="The more concrete the better: what happens now, what it costs, and what a good outcome would look like."
        error={errors.requirement?.message}
        required
      >
        {(a11y) => (
          <TextArea
            {...a11y}
            rows={6}
            placeholder="We process around 2,000 supplier invoices a month by hand. Errors surface at month-end reconciliation and tracing them back is slow…"
            {...register('requirement')}
          />
        )}
      </Field>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field id="timeline" label="Timeline" error={errors.timeline?.message}>
          {(a11y) => (
            <Select {...a11y} defaultValue="" {...register('timeline')}>
              <option value="">Select a timeline</option>
              {TIMELINE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          )}
        </Field>

        <Field
          id="budget"
          label="Budget range"
          hint="Optional. It helps us propose something realistic rather than guessing."
          error={errors.budget?.message}
        >
          {(a11y) => (
            <Select {...a11y} defaultValue="" {...register('budget')}>
              <option value="">Prefer not to say</option>
              {BUDGET_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          )}
        </Field>
      </div>

      {/* --- Attachment ------------------------------------------------------------------------- */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="attachment" className="text-sm font-semibold text-neutral-800">
          Attachment
          <span className="ml-1.5 text-xs font-normal text-neutral-500">(optional)</span>
        </label>
        <p id="attachment-hint" className="text-xs text-neutral-500">
          {ATTACHMENT_RULES.acceptedLabel}, up to {ATTACHMENT_RULES.maxLabel}.
        </p>

        {attachment ? (
          <div className="mt-1 flex items-center justify-between gap-3 rounded-lg border border-neutral-300 bg-neutral-50 px-3.5 py-2.5">
            <span className="flex min-w-0 items-center gap-2 text-sm text-neutral-700">
              <Paperclip className="size-4 shrink-0 text-neutral-500" aria-hidden="true" />
              <span className="truncate">{attachment.name}</span>
            </span>
            <button
              type="button"
              onClick={() => {
                setAttachment(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              className="inline-flex size-8 shrink-0 items-center justify-center rounded text-neutral-600 hover:bg-neutral-200"
              aria-label={`Remove attachment ${attachment.name}`}
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>
        ) : (
          <input
            ref={fileInputRef}
            id="attachment"
            type="file"
            accept={ATTACHMENT_RULES.acceptedMimeTypes.join(',')}
            aria-describedby={
              attachmentError ? 'attachment-hint attachment-error' : 'attachment-hint'
            }
            aria-invalid={attachmentError ? true : undefined}
            disabled={uploading}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void uploadAttachment(file);
            }}
            className={cn(
              'mt-1 block w-full cursor-pointer rounded-lg border border-neutral-300 bg-white text-sm text-neutral-700',
              'file:mr-4 file:cursor-pointer file:border-0 file:bg-neutral-100 file:px-4 file:py-2.5',
              'file:text-sm file:font-semibold file:text-neutral-700 hover:file:bg-neutral-200',
              'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand-600',
              'aria-[invalid=true]:border-danger',
            )}
          />
        )}

        {uploading ? (
          <p role="status" className="flex items-center gap-2 text-sm text-neutral-600">
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Uploading…
          </p>
        ) : null}

        {attachmentError ? (
          <p
            id="attachment-error"
            role="alert"
            className="flex items-start gap-1.5 text-sm font-medium text-danger"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <span>{attachmentError}</span>
          </p>
        ) : null}
      </div>

      {/* --- Consent ---------------------------------------------------------------------------- */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-start gap-3">
          <Checkbox
            id="consent"
            aria-describedby={errors.consent ? 'consent-error' : undefined}
            aria-invalid={errors.consent ? true : undefined}
            {...register('consent')}
          />
          <label htmlFor="consent" className="text-sm leading-relaxed text-neutral-700">
            I am happy for VASTRIX to contact me about this enquiry, and I have read the{' '}
            <Link href="/legal/privacy" className="font-semibold text-brand-700 underline">
              privacy policy
            </Link>
            .
            <span aria-hidden="true" className="ml-0.5 text-danger">
              *
            </span>
            <span className="sr-only"> (required)</span>
          </label>
        </div>

        {errors.consent ? (
          <p
            id="consent-error"
            role="alert"
            className="flex items-start gap-1.5 text-sm font-medium text-danger"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <span>{errors.consent.message}</span>
          </p>
        ) : null}
      </div>

      {/* Honeypot — off-screen rather than display:none, since some bots skip hidden inputs. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="website">Leave this field empty</label>
        <input id="website" type="text" tabIndex={-1} autoComplete="off" {...register('website')} />
      </div>

      {submitState.status === 'error' ? (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-(--radius-card) border border-red-200 bg-danger-bg p-4"
        >
          <AlertCircle className="mt-0.5 size-5 shrink-0 text-danger" aria-hidden="true" />
          <div className="text-sm">
            <p className="font-bold text-neutral-900">We could not send that</p>
            <p className="mt-1 text-neutral-700">{submitState.message}</p>
          </div>
        </div>
      ) : null}

      <div className="flex flex-col gap-4 border-t border-neutral-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-relaxed text-neutral-500">
          We use your details only to respond to this enquiry. No analytics, no tracking, and we do
          not share them.
        </p>

        <Button type="submit" size="lg" disabled={busy || uploading} className="sm:shrink-0">
          {busy ? (
            <>
              <Loader2 className="animate-spin" aria-hidden="true" />
              <span>Sending</span>
            </>
          ) : (
            'Send enquiry'
          )}
        </Button>
      </div>
    </form>
  );
}
