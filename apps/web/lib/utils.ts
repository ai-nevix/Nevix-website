import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * tailwind-merge has no knowledge of the custom scales declared in `@theme` (globals.css).
 *
 * Without this configuration it classifies `text-display-md` as a *colour* utility — because
 * `display-md` is not one of its known font sizes — and then silently drops it when a later
 * `text-neutral-900` appears in the same `cn()` call. The heading renders at body size with no
 * error anywhere. Registering the custom scales here is what keeps that from happening.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [{ text: ['display-xl', 'display-lg', 'display-md', 'display-sm', 'eyebrow'] }],
      rounded: [{ rounded: ['card', 'panel'] }],
      shadow: [{ shadow: ['card', 'card-hover', 'panel'] }],
    },
  },
});

/** Merge Tailwind classes, with later conflicting utilities winning. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Formats an ISO date for display. Uses a fixed locale and UTC so server and client render the
 * same string — a locale-dependent format causes a hydration mismatch.
 */
export function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

/** Machine-readable date for `<time dateTime>`. */
export function toDateTimeAttribute(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? '' : (date.toISOString().split('T')[0] ?? '');
}

/** Rough reading time at 220 words per minute, floored at one minute. */
export function readingMinutes(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 220));
}

/** Truncates at a word boundary, appending an ellipsis only when text was removed. */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  const clipped = text.slice(0, maxLength);
  const lastSpace = clipped.lastIndexOf(' ');
  return `${clipped.slice(0, lastSpace > 0 ? lastSpace : maxLength).trimEnd()}…`;
}

/** Converts a tag or slug into a display label: "digital-transformation" -> "Digital Transformation". */
export function slugToLabel(slug: string): string {
  return slug
    .split('-')
    .map((part) => (part.length <= 2 ? part.toUpperCase() : part[0]!.toUpperCase() + part.slice(1)))
    .join(' ');
}
