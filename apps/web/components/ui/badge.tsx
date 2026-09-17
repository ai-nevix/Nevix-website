import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

/**
 * Badge.
 *
 * Tone carries meaning, so every badge also renders text. Nothing on the site communicates
 * status by colour alone (specification §23.3).
 */
const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold leading-none',
  {
    variants: {
      tone: {
        neutral: 'border-neutral-300 bg-neutral-100 text-neutral-700',
        brand: 'border-brand-200 bg-brand-50 text-brand-800',
        info: 'border-brand-200 bg-info-bg text-info',
        success: 'border-emerald-200 bg-success-bg text-success',
        warning: 'border-amber-200 bg-warning-bg text-warning',
        danger: 'border-red-200 bg-danger-bg text-danger',
        onDark: 'border-white/20 bg-white/10 text-neutral-100',
        cyanOnDark: 'border-cyan-brand-400/40 bg-cyan-brand-500/15 text-cyan-brand-300',
      },
    },
    defaultVariants: { tone: 'neutral' },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}
