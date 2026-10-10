import { cn } from '@/lib/utils';

/**
 * The living backdrop of a light section: drifting clouds of the N's blue and cyan, and a soft
 * light — with a faint dot lattice — that follows the cursor.
 *
 * Plain markup with no JavaScript of its own. The drift is CSS (see `.live-backdrop` in
 * app/globals.css) and runs only while the section is on screen; the cursor position comes from
 * the single shared listener in components/effects/pointer-effects.tsx, which writes it to the
 * section as CSS variables. Without JavaScript the clouds simply hold still.
 *
 * Purely decorative: hidden from assistive technology and transparent to the pointer.
 */
export function LiveBackdrop({
  warm = false,
  className,
}: {
  /** Adds a faint warm horizon cloud — used on the cooler `subtle` sections. */
  warm?: boolean;
  className?: string;
}) {
  return (
    <div aria-hidden="true" className={cn('live-backdrop', className)}>
      <div className="live-backdrop__cloud live-backdrop__cloud--blue" />
      <div className="live-backdrop__cloud live-backdrop__cloud--cyan" />
      {warm ? <div className="live-backdrop__cloud live-backdrop__cloud--horizon" /> : null}
      <div className="live-backdrop__lattice" />
      <div className="live-backdrop__spotlight" />
    </div>
  );
}
