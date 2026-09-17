import { NextResponse, type NextRequest } from 'next/server';

import { getServerEnv } from '@/lib/env';

/**
 * Same-origin proxy to the FastAPI backend.
 *
 * Why proxy rather than call FastAPI directly from the browser:
 * - the backend address stays out of the client bundle and out of DNS lookups by the visitor
 * - `connect-src 'self'` stays intact in the Content Security Policy
 * - no CORS configuration is needed for the public endpoints (specification §22, §75)
 * - the client IP is forwarded explicitly, so backend rate limiting sees the real caller rather
 *   than the proxy
 *
 * Only an allow-listed set of paths is forwarded. Administrative endpoints are deliberately not
 * reachable through this route — instruction §31 requires public and admin boundaries to stay
 * separate, and a `/api/v1/admin/*` path arriving here is rejected before any network call.
 */

/** Public endpoints the browser may reach. Anything else returns 404. */
const ALLOWED = [
  { method: 'POST', pattern: /^v1\/contact$/ },
  { method: 'POST', pattern: /^v1\/leads$/ },
  { method: 'POST', pattern: /^v1\/newsletter$/ },
  { method: 'POST', pattern: /^v1\/newsletter\/confirm$/ },
  { method: 'POST', pattern: /^v1\/uploads$/ },
  { method: 'GET', pattern: /^v1\/health$/ },
  { method: 'GET', pattern: /^v1\/site-config$/ },
  { method: 'GET', pattern: /^v1\/search$/ },
] as const;

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

function isAllowed(method: string, path: string): boolean {
  return ALLOWED.some((rule) => rule.method === method && rule.pattern.test(path));
}

function notFound() {
  return NextResponse.json(
    { error: { code: 'not_found', message: 'Not found.' } },
    { status: 404 },
  );
}

async function forward(request: NextRequest, path: string) {
  if (!isAllowed(request.method, path)) return notFound();

  const env = getServerEnv();
  const target = new URL(`/api/${path}`, env.API_INTERNAL_URL);
  target.search = request.nextUrl.search;

  // Never forward the browser's cookies or authorization header to the backend: these endpoints
  // are unauthenticated, and passing credentials through would widen the CSRF surface.
  const headers = new Headers();
  const contentType = request.headers.get('content-type');
  if (contentType) headers.set('content-type', contentType);
  headers.set('accept', 'application/json');

  // The backend rate-limits per client IP, so it needs the original caller, not the proxy.
  const forwardedFor =
    request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? '';
  if (forwardedFor) headers.set('x-forwarded-for', forwardedFor);

  const userAgent = request.headers.get('user-agent');
  if (userAgent) headers.set('user-agent', userAgent);

  let body: BodyInit | undefined;

  if (request.method !== 'GET') {
    if (contentType?.includes('multipart/form-data')) {
      const contentLength = Number(request.headers.get('content-length') ?? 0);
      if (contentLength > MAX_UPLOAD_BYTES) {
        return NextResponse.json(
          {
            error: {
              code: 'payload_too_large',
              message: 'That file is larger than the 10 MB limit.',
            },
          },
          { status: 413 },
        );
      }
      // Re-send the multipart body as-is; `content-type` carries the boundary.
      body = await request.arrayBuffer();
    } else {
      body = await request.text();
    }
  }

  try {
    const response = await fetch(target, {
      method: request.method,
      headers,
      body,
      // These are user actions; never serve them from a cache.
      cache: 'no-store',
      signal: AbortSignal.timeout(20_000),
    });

    const payload = await response.text();

    return new NextResponse(payload, {
      status: response.status,
      headers: {
        'content-type': response.headers.get('content-type') ?? 'application/json',
        'cache-control': 'no-store',
        // Surface the backend's rate-limit signal so the browser can back off correctly.
        ...(response.headers.has('retry-after')
          ? { 'retry-after': response.headers.get('retry-after')! }
          : {}),
      },
    });
  } catch (error) {
    // The backend URL and the underlying error never reach the visitor (instruction §52).
    console.error('[api-proxy] Upstream request failed', {
      path,
      method: request.method,
      message: error instanceof Error ? error.message : 'unknown',
    });

    return NextResponse.json(
      {
        error: {
          code: 'upstream_unavailable',
          message:
            'We could not reach the service just now. Please try again shortly, or email us directly.',
        },
      },
      { status: 502 },
    );
  }
}

export async function GET(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  return forward(request, path.join('/'));
}

export async function POST(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  return forward(request, path.join('/'));
}
