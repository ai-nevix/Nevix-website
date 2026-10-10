import * as React from 'react';

import { cn } from '@/lib/utils';

/**
 * Minimal Markdown renderer for Insight article bodies.
 *
 * Why not a Markdown library: the content set is small and the syntax used is deliberately
 * limited to headings, paragraphs, lists, blockquotes, fenced code and inline emphasis/code/links.
 * A parser here would add a dependency and, more importantly, most of them emit raw HTML — which
 * would mean trusting CMS content enough to inject it into the page.
 *
 * This renderer never produces raw HTML. Every node is a React element, so React escapes all text
 * and a `<script>` in an article body is rendered as literal characters rather than executed.
 * That is the security property that matters once the CMS is writable by non-engineers.
 */

type Block =
  | { type: 'heading'; level: 2 | 3 | 4; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] }
  | { type: 'quote'; text: string }
  | { type: 'code'; language: string | null; code: string };

function parse(markdown: string): Block[] {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const blocks: Block[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index] ?? '';

    if (line.trim() === '') {
      index += 1;
      continue;
    }

    // Fenced code block.
    const fence = /^```(\w+)?\s*$/.exec(line);
    if (fence) {
      const language = fence[1] ?? null;
      const body: string[] = [];
      index += 1;
      while (index < lines.length && !/^```\s*$/.test(lines[index] ?? '')) {
        body.push(lines[index] ?? '');
        index += 1;
      }
      index += 1; // consume the closing fence
      blocks.push({ type: 'code', language, code: body.join('\n') });
      continue;
    }

    const heading = /^(#{2,4})\s+(.*)$/.exec(line);
    if (heading) {
      blocks.push({
        type: 'heading',
        level: heading[1]!.length as 2 | 3 | 4,
        text: heading[2]!.trim(),
      });
      index += 1;
      continue;
    }

    if (/^>\s?/.test(line)) {
      const body: string[] = [];
      while (index < lines.length && /^>\s?/.test(lines[index] ?? '')) {
        body.push((lines[index] ?? '').replace(/^>\s?/, ''));
        index += 1;
      }
      blocks.push({ type: 'quote', text: body.join(' ') });
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^[-*]\s+/.test(lines[index] ?? '')) {
        items.push((lines[index] ?? '').replace(/^[-*]\s+/, ''));
        index += 1;
      }
      blocks.push({ type: 'ul', items });
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^\d+\.\s+/.test(lines[index] ?? '')) {
        items.push((lines[index] ?? '').replace(/^\d+\.\s+/, ''));
        index += 1;
      }
      blocks.push({ type: 'ol', items });
      continue;
    }

    // Paragraph: consume until a blank line or the start of another block.
    const paragraph: string[] = [];
    while (index < lines.length) {
      const current = lines[index] ?? '';
      if (
        current.trim() === '' ||
        /^(#{2,4})\s+/.test(current) ||
        /^[-*]\s+/.test(current) ||
        /^\d+\.\s+/.test(current) ||
        /^>\s?/.test(current) ||
        /^```/.test(current)
      ) {
        break;
      }
      paragraph.push(current);
      index += 1;
    }
    blocks.push({ type: 'paragraph', text: paragraph.join(' ') });
  }

  return blocks;
}

/**
 * Renders inline `**bold**`, `*italic*`, `` `code` `` and `[text](href)` as React elements.
 * Returns an array of nodes; never a string of HTML.
 */
function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  const pattern = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let counter = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    const token = match[0];
    const key = `${keyPrefix}-${counter++}`;

    if (token.startsWith('**')) {
      nodes.push(<strong key={key}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith('`')) {
      nodes.push(<code key={key}>{token.slice(1, -1)}</code>);
    } else if (token.startsWith('[')) {
      const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(token);
      if (link) {
        const href = link[2]!;
        const isExternal = /^https?:\/\//.test(href);
        nodes.push(
          <a
            key={key}
            href={href}
            {...(isExternal ? { rel: 'noopener noreferrer', target: '_blank' } : {})}
          >
            {link[1]}
          </a>,
        );
      } else {
        nodes.push(token);
      }
    } else {
      nodes.push(<em key={key}>{token.slice(1, -1)}</em>);
    }

    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes;
}

export function Markdown({ content, className }: { content: string; className?: string }) {
  const blocks = parse(content);

  return (
    <div className={cn('prose-nevix', className)}>
      {blocks.map((block, index) => {
        const key = `block-${index}`;

        switch (block.type) {
          case 'heading': {
            const Heading = `h${block.level}` as 'h2' | 'h3' | 'h4';
            // Slugged so headings can be linked to directly.
            const id = block.text
              .toLowerCase()
              .replace(/[^a-z0-9\s-]/g, '')
              .trim()
              .replace(/\s+/g, '-');
            return (
              <Heading key={key} id={id}>
                {renderInline(block.text, key)}
              </Heading>
            );
          }
          case 'paragraph':
            return <p key={key}>{renderInline(block.text, key)}</p>;
          case 'ul':
            return (
              <ul key={key}>
                {block.items.map((item, i) => (
                  <li key={`${key}-${i}`}>{renderInline(item, `${key}-${i}`)}</li>
                ))}
              </ul>
            );
          case 'ol':
            return (
              <ol key={key}>
                {block.items.map((item, i) => (
                  <li key={`${key}-${i}`}>{renderInline(item, `${key}-${i}`)}</li>
                ))}
              </ol>
            );
          case 'quote':
            return <blockquote key={key}>{renderInline(block.text, key)}</blockquote>;
          case 'code':
            return (
              <pre key={key}>
                <code {...(block.language ? { 'data-language': block.language } : {})}>
                  {block.code}
                </code>
              </pre>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
