/**
 * Skip link.
 *
 * Visually hidden until focused, then rendered as a normal, high-contrast control at the top of
 * the viewport. It is the first focusable element on every page.
 */
export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only-focusable fixed top-3 left-3 z-[100] rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
    >
      Skip to main content
    </a>
  );
}
