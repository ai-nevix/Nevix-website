'use client';

import { AlertCircle } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

/**
 * Accessible form field primitives (specification §10.1, §23.3).
 *
 * Rules enforced by these components rather than left to each form:
 * - every control has a real `<label>` tied by `htmlFor`
 * - errors are linked with `aria-describedby` and announced via `role="alert"`
 * - invalid controls set `aria-invalid`, so the state is exposed to assistive technology and not
 *   only shown as a red border
 * - the required marker is a visible asterisk plus a text hint, never colour alone
 */

interface FieldWrapperProps {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: (props: {
    id: string;
    'aria-describedby': string | undefined;
    'aria-invalid': boolean | undefined;
    'aria-required': boolean | undefined;
  }) => React.ReactNode;
}

export function Field({
  id,
  label,
  hint,
  error,
  required,
  className,
  children,
}: FieldWrapperProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className="text-sm font-semibold text-neutral-800">
        {label}
        {required ? (
          <>
            <span aria-hidden="true" className="ml-0.5 text-danger">
              *
            </span>
            <span className="sr-only"> (required)</span>
          </>
        ) : (
          <span className="ml-1.5 text-xs font-normal text-neutral-500">(optional)</span>
        )}
      </label>

      {hint ? (
        <p id={hintId} className="text-xs text-neutral-500">
          {hint}
        </p>
      ) : null}

      {children({
        id,
        'aria-describedby': describedBy,
        'aria-invalid': error ? true : undefined,
        'aria-required': required || undefined,
      })}

      {error ? (
        <p
          id={errorId}
          role="alert"
          className="flex items-start gap-1.5 text-sm font-medium text-danger"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </p>
      ) : null}
    </div>
  );
}

const controlClasses = [
  'w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-neutral-900',
  'placeholder:text-neutral-400',
  'transition-colors duration-150',
  'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand-600',
  'disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-500',
  'aria-[invalid=true]:border-danger aria-[invalid=true]:focus-visible:outline-danger',
].join(' ');

export const TextInput = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  function TextInput({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        className={cn(controlClasses, 'h-11 border-neutral-300', className)}
        {...props}
      />
    );
  },
);

export const TextArea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<'textarea'>>(
  function TextArea({ className, rows = 5, ...props }, ref) {
    return (
      <textarea
        ref={ref}
        rows={rows}
        className={cn(controlClasses, 'resize-y border-neutral-300', className)}
        {...props}
      />
    );
  },
);

/**
 * Native `<select>` rather than a custom listbox.
 *
 * A native select is keyboard accessible, screen-reader correct and uses the platform picker on
 * mobile, all for free. A custom component here would add risk without adding value.
 */
export const Select = React.forwardRef<HTMLSelectElement, React.ComponentProps<'select'>>(
  function Select({ className, children, ...props }, ref) {
    return (
      <select
        ref={ref}
        className={cn(controlClasses, 'h-11 cursor-pointer border-neutral-300 pr-9', className)}
        {...props}
      >
        {children}
      </select>
    );
  },
);

export const Checkbox = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  function Checkbox({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        type="checkbox"
        className={cn(
          'mt-0.5 size-4.5 shrink-0 cursor-pointer rounded border-neutral-400 text-brand-600',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600',
          className,
        )}
        {...props}
      />
    );
  },
);

/**
 * Honeypot field.
 *
 * Positioned off-screen rather than `display: none`, because some bots skip hidden inputs.
 * `aria-hidden` and `tabIndex={-1}` keep it away from real users and screen readers.
 */
export function HoneypotField(props: React.ComponentProps<'input'>) {
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
      <label htmlFor={props.id ?? 'website'}>Leave this field empty</label>
      <input id={props.id ?? 'website'} type="text" tabIndex={-1} autoComplete="off" {...props} />
    </div>
  );
}
