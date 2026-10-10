import {
  Banknote,
  BookOpen,
  Boxes,
  BrainCircuit,
  Code2,
  Compass,
  FactoryIcon,
  FileCog,
  FileText,
  Gauge,
  GraduationCap,
  HeartPulse,
  Inbox,
  Landmark,
  LayoutPanelLeft,
  Network,
  Package,
  PanelsTopLeft,
  Scale,
  ServerCog,
  Settings2,
  Workflow,
  type LucideIcon,
} from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

/**
 * Icon registry.
 *
 * Content stores an icon *key* rather than importing a component, so CMS-managed entries can
 * choose an icon without the CMS knowing anything about the frontend's icon library.
 *
 * Icons are decorative throughout — every one is paired with a visible text label, so they are
 * hidden from assistive technology (specification §23.3).
 */
const registry = {
  brain: BrainCircuit,
  settings: Settings2,
  code: Code2,
  chart: Gauge,
  package: Package,
  compass: Compass,
  'file-text': FileText,
  'file-cog': FileCog,
  inbox: Inbox,
  workflow: Workflow,
  'book-open': BookOpen,
  gauge: Gauge,
  'layout-panel-left': LayoutPanelLeft,
  'panels-top-left': PanelsTopLeft,
  'server-cog': ServerCog,
  scale: Scale,
  landmark: Landmark,
  'heart-pulse': HeartPulse,
  factory: FactoryIcon,
  banknote: Banknote,
  'graduation-cap': GraduationCap,
  network: Network,
  boxes: Boxes,
} as const satisfies Record<string, LucideIcon>;

export type IconKey = keyof typeof registry;

export function isIconKey(value: string): value is IconKey {
  return value in registry;
}

export function Icon({
  name,
  className,
  strokeWidth = 1.6,
}: {
  name: string;
  className?: string;
  strokeWidth?: number;
}) {
  // An unknown key from CMS content should degrade to a sensible default rather than crash.
  const Component: LucideIcon = isIconKey(name) ? registry[name] : Boxes;
  return (
    <Component className={cn('size-6', className)} strokeWidth={strokeWidth} aria-hidden="true" />
  );
}

/**
 * Icon in a tinted, rounded tile. The standard treatment for pillar, service and solution cards.
 */
export function IconTile({
  name,
  tone = 'brand',
  className,
}: {
  name: string;
  tone?: 'brand' | 'cyan' | 'onDark';
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex size-11 shrink-0 items-center justify-center rounded-xl border',
        tone === 'brand' &&
          'border-brand-100 bg-linear-to-br from-brand-50 to-cyan-brand-300/15 text-brand-700',
        tone === 'cyan' && 'border-cyan-brand-400/30 bg-cyan-brand-500/10 text-cyan-brand-700',
        tone === 'onDark' &&
          'border-white/12 bg-linear-to-br from-brand-500/25 to-cyan-brand-400/10 text-cyan-brand-300 shadow-[inset_0_1px_0_0_rgb(255_255_255/0.08)]',
        className,
      )}
    >
      <Icon name={name} className="size-5.5" />
    </span>
  );
}
