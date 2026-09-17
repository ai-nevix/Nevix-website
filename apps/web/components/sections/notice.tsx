import { FlaskConical, Info, ShieldAlert, TriangleAlert } from 'lucide-react';
import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

/**
 * Governance notices.
 *
 * These exist to keep the site honest about what is demonstration content and what VASTRIX does
 * not claim. Specification §31 and instruction §33/§34 require that unverified content is never
 * presented as fact, so these notices are part of the content contract rather than decoration —
 * do not remove one without removing the content it qualifies.
 */

type NoticeVariant = 'demo' | 'illustrative' | 'compliance' | 'draft' | 'info';

const variantConfig: Record<
  NoticeVariant,
  { Icon: typeof Info; label: string; light: string; dark: string }
> = {
  demo: {
    Icon: FlaskConical,
    label: 'Demo content',
    light: 'border-amber-300 bg-warning-bg text-neutral-800',
    dark: 'border-amber-400/40 bg-amber-400/10 text-amber-100',
  },
  illustrative: {
    Icon: Info,
    label: 'Illustrative',
    light: 'border-neutral-300 bg-neutral-100 text-neutral-700',
    dark: 'border-white/15 bg-white/5 text-neutral-300',
  },
  compliance: {
    Icon: ShieldAlert,
    label: 'Important',
    light: 'border-brand-200 bg-info-bg text-neutral-800',
    dark: 'border-cyan-brand-400/30 bg-cyan-brand-500/10 text-neutral-200',
  },
  draft: {
    Icon: TriangleAlert,
    label: 'Draft',
    light: 'border-amber-300 bg-warning-bg text-neutral-800',
    dark: 'border-amber-400/40 bg-amber-400/10 text-amber-100',
  },
  info: {
    Icon: Info,
    label: 'Note',
    light: 'border-neutral-300 bg-white text-neutral-700',
    dark: 'border-white/15 bg-white/5 text-neutral-300',
  },
};

export function Notice({
  variant = 'info',
  title,
  children,
  onDark = false,
  className,
}: {
  variant?: NoticeVariant;
  title?: string;
  children: ReactNode;
  onDark?: boolean;
  className?: string;
}) {
  const { Icon, label, light, dark } = variantConfig[variant];

  return (
    <div
      className={cn(
        'flex gap-3.5 rounded-(--radius-card) border p-4 sm:p-5',
        onDark ? dark : light,
        className,
      )}
    >
      <Icon className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
      <div className="min-w-0 text-sm leading-relaxed">
        <p className="font-bold">{title ?? label}</p>
        <div className="mt-1.5">{children}</div>
      </div>
    </div>
  );
}

/**
 * The standard demo-case-study disclosure. Centralised so the wording cannot drift between the
 * card, the detail page and the index.
 *
 * DUMMY-DATA: DD-001
 */
export function DemoCaseStudyNotice({ onDark = false }: { onDark?: boolean }) {
  return (
    <Notice variant="demo" title="Demo Case Study — illustrative example" onDark={onDark}>
      This is demonstration content written to show how VASTRIX approaches a problem. It is not an
      account of work delivered to a client, no organisation described here is a VASTRIX client, and
      the outcomes are design intentions rather than measured results.
    </Notice>
  );
}

/**
 * The standard "we claim no credentials" disclosure for regulated and public-sector pages.
 * Required by catalogue §8 and specification §31.
 */
export function NoCredentialsNotice({
  sector,
  onDark = false,
}: {
  sector: string;
  onDark?: boolean;
}) {
  return (
    <Notice variant="compliance" title="What this page does not claim" onDark={onDark}>
      This page describes capabilities VASTRIX can deliver for the {sector.toLowerCase()} sector. It
      is not a claim of approval, empanelment, registration, accreditation or certification, and
      VASTRIX does not currently hold sector-specific credentials. Any requirement of that kind
      should be raised with us directly so we can answer it accurately.
    </Notice>
  );
}
