'use client';

import * as Accordion from '@radix-ui/react-accordion';
import { Plus } from 'lucide-react';

import type { FaqItem } from '@vastrix/types';

import { cn } from '@/lib/utils';

/**
 * FAQ accordion.
 *
 * Radix Accordion gives correct `button` semantics, `aria-expanded`, `aria-controls` and arrow-key
 * navigation between items. `type="multiple"` lets a visitor open several answers at once — with
 * a single-open accordion, reading two related answers means losing the first.
 *
 * `forceMount` keeps the answers in the server-rendered HTML rather than mounting them on open,
 * so the text is present for crawlers. Service pages additionally emit FAQPage structured data.
 */
export function Faq({ items, className }: { items: FaqItem[]; className?: string }) {
  if (items.length === 0) return null;

  return (
    <Accordion.Root type="multiple" className={cn('divide-y divide-neutral-200', className)}>
      {items.map((item, index) => (
        <Accordion.Item key={item.question} value={`item-${index}`}>
          <Accordion.Header>
            <Accordion.Trigger className="group flex w-full items-start justify-between gap-6 py-5 text-left transition-colors hover:text-brand-700">
              <span className="text-base font-bold tracking-tight text-neutral-900 group-hover:text-brand-700">
                {item.question}
              </span>
              <Plus
                className="mt-0.5 size-5 shrink-0 text-neutral-500 transition-transform duration-200 group-data-[state=open]:rotate-45"
                aria-hidden="true"
              />
            </Accordion.Trigger>
          </Accordion.Header>

          <Accordion.Content forceMount className="overflow-hidden data-[state=closed]:hidden">
            <p className="pb-6 text-base leading-relaxed text-neutral-600">{item.answer}</p>
          </Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
}
