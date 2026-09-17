import type { ApiErrorBody } from '@vastrix/types';

import { clientEnv } from '@/lib/env';

/**
 * Browser-side API client.
 *
 * Requests go to a same-origin Next.js route handler (`/api/backend/*`) which proxies to FastAPI.
 * That keeps the backend's address out of the browser, keeps `connect-src 'self'` in the Content
 * Security Policy, and removes the need for cross-origin CORS on the public endpoints.
 */

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    /** Field-level validation messages, keyed by form field name. */
    readonly details?: Record<string, string[]>,
    readonly requestId?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }

  /** True when the failure is the visitor's input rather than a fault on our side. */
  get isValidationError(): boolean {
    return this.status === 422 || this.status === 400;
  }

  get isRateLimited(): boolean {
    return this.status === 429;
  }
}

const DEFAULT_TIMEOUT_MS = 15_000;

export async function apiRequest<TResponse, TBody = unknown>(
  path: string,
  options: { method?: 'GET' | 'POST' | 'PATCH'; body?: TBody; timeoutMs?: number } = {},
): Promise<TResponse> {
  const { method = 'GET', body, timeoutMs = DEFAULT_TIMEOUT_MS } = options;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${clientEnv.NEXT_PUBLIC_API_URL}${path}`, {
      method,
      headers: {
        Accept: 'application/json',
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
      // Public endpoints are unauthenticated; sending credentials would only widen the CSRF surface.
      credentials: 'omit',
    });

    const contentType = response.headers.get('content-type') ?? '';
    const payload = contentType.includes('application/json')
      ? ((await response.json()) as unknown)
      : null;

    if (!response.ok) {
      const errorBody = payload as ApiErrorBody | null;
      throw new ApiError(
        response.status,
        errorBody?.error?.code ?? 'unknown_error',
        errorBody?.error?.message ?? 'Something went wrong. Please try again.',
        errorBody?.error?.details,
        errorBody?.error?.request_id,
      );
    }

    return payload as TResponse;
  } catch (error) {
    if (error instanceof ApiError) throw error;

    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError(
        408,
        'request_timeout',
        'The request took too long. Please check your connection and try again.',
      );
    }

    throw new ApiError(
      0,
      'network_error',
      'We could not reach the server. Please check your connection and try again.',
    );
  } finally {
    clearTimeout(timeout);
  }
}
