import { z } from 'zod';

/**
 * Validated environment configuration.
 *
 * Two separate schemas enforce the rule in specification §13.1: no private secret may reach the
 * browser bundle. `clientEnv` is safe to read anywhere. `serverEnv` throws if it is imported into
 * a client component, so a mistake fails at build time rather than leaking a token to visitors.
 */

const clientSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.url().default('http://localhost:3000'),
  /** Public base URL of the FastAPI service, used by the browser to submit enquiries. */
  NEXT_PUBLIC_API_URL: z.string().default('/api/backend'),
  NEXT_PUBLIC_MEDIA_URL: z.string().optional(),
  NEXT_PUBLIC_ENV: z.enum(['local', 'development', 'staging', 'production']).default('local'),
  /**
   * Master switch for the welcome intro (components/branding/nevix-intro.tsx).
   *
   * Set `NEXT_PUBLIC_SHOW_INTRO=false` to drop it entirely — the overlay is then never rendered,
   * not merely hidden, so it costs nothing at all.
   */
  NEXT_PUBLIC_SHOW_INTRO: z
    .enum(['true', 'false'])
    .default('true')
    .transform((value) => value === 'true'),
});

const serverSchema = z.object({
  /**
   * Content provider. `local` uses the typed content in `content/` and requires no CMS.
   * `strapi` reads from a running Strapi instance. See ADR-006.
   */
  CONTENT_PROVIDER: z.enum(['local', 'strapi']).default('local'),
  CMS_URL: z.string().optional(),
  /** Read-only Strapi API token. Never exposed to the browser. */
  CMS_API_TOKEN: z.string().optional(),
  /** Server-side base URL for FastAPI, used by route handlers and server components. */
  API_INTERNAL_URL: z.string().default('http://localhost:8000'),
  /** Seconds. Controls ISR revalidation for CMS-backed routes. */
  CONTENT_REVALIDATE_SECONDS: z.coerce.number().int().positive().default(3600),
});

function formatIssues(error: z.ZodError): string {
  return error.issues.map((i) => `  ${i.path.join('.') || '(root)'}: ${i.message}`).join('\n');
}

function parseClientEnv() {
  // Next.js inlines NEXT_PUBLIC_* at build time only when referenced as a static property path,
  // so these cannot be read from a dynamic index expression.
  const parsed = clientSchema.safeParse({
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_MEDIA_URL: process.env.NEXT_PUBLIC_MEDIA_URL,
    NEXT_PUBLIC_ENV: process.env.NEXT_PUBLIC_ENV,
    NEXT_PUBLIC_SHOW_INTRO: process.env.NEXT_PUBLIC_SHOW_INTRO,
  });

  if (!parsed.success) {
    throw new Error(`Invalid public environment configuration:\n${formatIssues(parsed.error)}`);
  }

  return parsed.data;
}

export const clientEnv = parseClientEnv();

let cachedServerEnv: z.infer<typeof serverSchema> | null = null;

/**
 * Server-only configuration. Throws when called from the browser, which turns an accidental
 * client import into an immediate, obvious failure rather than a silent secret leak.
 */
export function getServerEnv(): z.infer<typeof serverSchema> {
  if (typeof window !== 'undefined') {
    throw new Error(
      'getServerEnv() was called in the browser. Server configuration must never reach the client bundle.',
    );
  }

  if (cachedServerEnv) return cachedServerEnv;

  const parsed = serverSchema.safeParse({
    CONTENT_PROVIDER: process.env.CONTENT_PROVIDER,
    CMS_URL: process.env.CMS_URL,
    CMS_API_TOKEN: process.env.CMS_API_TOKEN,
    API_INTERNAL_URL: process.env.API_INTERNAL_URL,
    CONTENT_REVALIDATE_SECONDS: process.env.CONTENT_REVALIDATE_SECONDS,
  });

  if (!parsed.success) {
    throw new Error(`Invalid server environment configuration:\n${formatIssues(parsed.error)}`);
  }

  // Selecting the Strapi provider without connection details would fail at request time with a
  // confusing 500. Fail here instead, while the message can still be acted on.
  if (parsed.data.CONTENT_PROVIDER === 'strapi' && !parsed.data.CMS_URL) {
    throw new Error('CONTENT_PROVIDER=strapi requires CMS_URL to be set.');
  }

  cachedServerEnv = parsed.data;
  return cachedServerEnv;
}

export const isProduction = process.env.NODE_ENV === 'production';
