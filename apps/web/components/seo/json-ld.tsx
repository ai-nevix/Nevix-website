/**
 * Renders a JSON-LD script tag.
 *
 * The payload is serialised with `JSON.stringify` and the `<` character is escaped, which
 * prevents a string in CMS content from closing the script element early — the standard XSS
 * vector for inline JSON-LD.
 */
export function JsonLd({ id, data }: { id: string; data: Record<string, unknown> }) {
  const json = JSON.stringify(data).replace(/</g, '\u003c');

  return (
    <script
      type="application/ld+json"
      id={`ld-${id}`}
      // Escaped above: `<` is replaced so a string in CMS content cannot close the script tag.
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
