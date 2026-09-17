import { Reveal, Stagger, StaggerItem } from '@/components/ui/motion';
import { cn } from '@/lib/utils';

export interface ProcessStep {
  step: string;
  description: string;
}

/**
 * Project lifecycle timeline — catalogue §10 (Discover → Define → Prototype → Build → Deploy →
 * Evolve).
 *
 * Rendered as an ordered list so the sequence is conveyed by the markup, not only by the visual
 * connector line. The connector is a decorative pseudo-element hidden from assistive technology.
 */
export function ProcessTimeline({
  steps,
  onDark = false,
  className,
}: {
  steps: readonly ProcessStep[];
  onDark?: boolean;
  className?: string;
}) {
  return (
    <Stagger className={className}>
      <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {steps.map((item, index) => (
          <StaggerItem as="li" key={item.step}>
            <div
              className={cn(
                'relative h-full rounded-(--radius-card) border p-6',
                onDark ? 'border-white/12 bg-white/4' : 'border-neutral-200 bg-white',
              )}
            >
              {/* Connector line to the next step, on wide layouts only. */}
              {index < steps.length - 1 ? (
                <span
                  aria-hidden="true"
                  className={cn(
                    'absolute top-11 -right-3 hidden h-px w-6 lg:block',
                    onDark ? 'bg-white/15' : 'bg-neutral-300',
                    (index + 1) % 3 === 0 && 'lg:hidden',
                  )}
                />
              ) : null}

              <span
                className={cn(
                  'inline-flex size-9 items-center justify-center rounded-lg font-mono text-sm font-bold tabular-nums',
                  onDark
                    ? 'bg-cyan-brand-500/15 text-cyan-brand-300'
                    : 'bg-brand-50 text-brand-700',
                )}
                aria-hidden="true"
              >
                {String(index + 1).padStart(2, '0')}
              </span>

              <h3
                className={cn(
                  'mt-4 text-base font-bold tracking-tight',
                  onDark ? 'text-white' : 'text-neutral-900',
                )}
              >
                {item.step}
              </h3>

              <p
                className={cn(
                  'mt-2 text-sm leading-relaxed',
                  onDark ? 'text-neutral-400' : 'text-neutral-600',
                )}
              >
                {item.description}
              </p>
            </div>
          </StaggerItem>
        ))}
      </ol>
    </Stagger>
  );
}

/**
 * Numbered workflow steps used on solution pages. Visually distinct from the lifecycle timeline
 * so the two do not read as the same thing.
 */
export function WorkflowSteps({
  steps,
  className,
}: {
  steps: readonly { title: string; description: string }[];
  className?: string;
}) {
  return (
    <Reveal className={className}>
      <ol className="relative flex flex-col gap-0">
        {steps.map((step, index) => (
          <li key={step.title} className="relative flex gap-5 pb-8 last:pb-0">
            {/* Vertical rail connecting the step markers. */}
            {index < steps.length - 1 ? (
              <span
                aria-hidden="true"
                className="absolute top-10 bottom-0 left-[1.1875rem] w-px bg-neutral-200"
              />
            ) : null}

            <span
              aria-hidden="true"
              className="relative z-10 inline-flex size-9.5 shrink-0 items-center justify-center rounded-full border border-brand-200 bg-brand-50 font-mono text-sm font-bold text-brand-700 tabular-nums"
            >
              {index + 1}
            </span>

            <div className="pt-1">
              <h3 className="text-base font-bold tracking-tight text-neutral-900">{step.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-neutral-600">{step.description}</p>
            </div>
          </li>
        ))}
      </ol>
    </Reveal>
  );
}
