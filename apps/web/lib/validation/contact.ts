import { z } from 'zod';

import {
  BUDGET_OPTIONS,
  INDUSTRY_OPTIONS,
  SERVICE_INTERESTS,
  TIMELINE_OPTIONS,
} from '@vastrix/types';

/**
 * Contact and newsletter validation schemas.
 *
 * These mirror the Pydantic schemas in `apps/api/app/schemas/contact.py`. Client-side validation
 * is a UX affordance only — the server validates independently and never trusts this
 * (specification §14, instruction §26).
 *
 * Error messages are written for the person filling the form, not for a developer.
 */

/**
 * Deliberately permissive. Zod's stricter email rules reject addresses that are valid in
 * practice, and rejecting a real prospect's address is a worse outcome than accepting one that
 * bounces.
 */
const emailSchema = z
  .string()
  .trim()
  .min(1, 'Enter your email address')
  .max(254, 'That email address is too long')
  .regex(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, 'Enter a valid email address');

export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Enter your name')
    .max(120, 'Please keep your name under 120 characters'),

  email: emailSchema,

  organization: z
    .string()
    .trim()
    .max(160, 'Please keep the organisation name under 160 characters')
    .optional()
    .or(z.literal('')),

  service_interest: z.enum(SERVICE_INTERESTS, {
    message: 'Select the area you are interested in',
  }),

  industry: z.enum(INDUSTRY_OPTIONS).optional().or(z.literal('')),

  requirement: z
    .string()
    .trim()
    .min(20, 'Please describe your requirement in at least 20 characters')
    .max(5000, 'Please keep your description under 5,000 characters'),

  timeline: z.enum(TIMELINE_OPTIONS).optional().or(z.literal('')),

  budget: z.enum(BUDGET_OPTIONS).optional().or(z.literal('')),

  consent: z.literal(true, {
    message: 'Please confirm you are happy for us to contact you about this enquiry',
  }),

  /**
   * Honeypot. Hidden from sighted users and from assistive technology; a value means the
   * submission came from a bot filling every field it found.
   */
  website: z.string().max(0).optional().or(z.literal('')),

  source: z.string().max(200).optional(),
});

export type ContactFormValues = z.input<typeof contactSchema>;

export const newsletterSchema = z.object({
  email: emailSchema,
  consent: z.literal(true, {
    message: 'Please confirm you would like to receive these emails',
  }),
  website: z.string().max(0).optional().or(z.literal('')),
  source: z.string().max(200).optional(),
});

export type NewsletterFormValues = z.input<typeof newsletterSchema>;

/**
 * Attachment constraints, enforced again server-side (instruction §32).
 * Kept here so the file input can reject early and explain why.
 */
export const ATTACHMENT_RULES = {
  maxBytes: 10 * 1024 * 1024,
  maxLabel: '10 MB',
  /** Document formats only. Archives and executables are excluded deliberately. */
  acceptedMimeTypes: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv',
    'image/png',
    'image/jpeg',
  ],
  acceptedLabel: 'PDF, Word, Excel, CSV, plain text, PNG or JPEG',
} as const;

export function validateAttachment(file: File): string | null {
  if (file.size > ATTACHMENT_RULES.maxBytes) {
    return `That file is larger than ${ATTACHMENT_RULES.maxLabel}. Please attach a smaller file or send it by email.`;
  }
  if (!ATTACHMENT_RULES.acceptedMimeTypes.includes(file.type as never)) {
    return `That file type is not accepted. Please attach ${ATTACHMENT_RULES.acceptedLabel}.`;
  }
  return null;
}
