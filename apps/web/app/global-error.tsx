'use client';

/**
 * Root error boundary.
 *
 * Replaces the entire document when the root layout itself fails, so it must render its own
 * `<html>` and `<body>` and cannot rely on the design system or any shared component — those are
 * exactly what may have failed. Styling is therefore inline and deliberately minimal.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en-GB">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0a0f1c',
          color: '#f8fafc',
          fontFamily: 'ui-sans-serif, system-ui, sans-serif',
          padding: '24px',
        }}
      >
        <main style={{ maxWidth: '36rem', textAlign: 'center' }}>
          <p
            style={{
              fontSize: '0.75rem',
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: '#22d3ee',
              fontWeight: 700,
            }}
          >
            VASTRIX
          </p>
          <h1 style={{ fontSize: '2rem', marginTop: '1rem', lineHeight: 1.2 }}>
            The site is temporarily unavailable
          </h1>
          <p style={{ marginTop: '1rem', color: '#94a3b8', lineHeight: 1.6 }}>
            Something failed while loading the page. The problem has been logged. Please try again
            in a moment.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: '2rem',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              border: 'none',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
          {error.digest ? (
            <p style={{ marginTop: '2rem', fontSize: '0.8125rem', color: '#64748b' }}>
              Reference: {error.digest}
            </p>
          ) : null}
        </main>
      </body>
    </html>
  );
}
