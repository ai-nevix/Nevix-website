'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { ChevronDown, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

import { Logo } from '@/components/layout/logo';
import { Button } from '@/components/ui/button';
import { ctas, primaryNav, siteConfig } from '@/content/site';
import { cn } from '@/lib/utils';

/**
 * Mobile navigation.
 *
 * Radix Dialog handles the accessibility requirements that are easy to get wrong by hand: focus
 * is trapped inside the panel while open, Escape closes it, focus returns to the trigger on
 * close, and the rest of the page is marked `aria-hidden` for screen readers.
 *
 * Sub-menus are disclosure buttons rather than hover targets, and each section header is itself a
 * link — so tapping "Services" can either expand the list or go to the services page, and neither
 * is hidden behind the other.
 */
export function MobileNav() {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const pathname = usePathname();

  /**
   * Closes the panel when a link inside it is followed.
   *
   * Handled here rather than in an effect on `pathname`: calling setState synchronously from an
   * effect causes a cascading render, and reacting to the route change is indirect anyway — the
   * user clicked a link, so the panel should close. Delegated from the container so each link
   * does not need its own handler.
   */
  function handleNavigate(event: React.MouseEvent<HTMLElement>) {
    if ((event.target as HTMLElement).closest('a')) setOpen(false);
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          className="inline-flex size-11 items-center justify-center rounded-lg text-neutral-200 transition-colors hover:bg-white/8 hover:text-white lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="size-6" aria-hidden="true" />
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink-950/60 backdrop-blur-sm lg:hidden" />

        <Dialog.Content
          className={cn(
            'dark-section brand-field fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col border-l border-white/10 shadow-[var(--shadow-panel)] lg:hidden',
            'motion-safe:data-[state=open]:animate-in motion-safe:data-[state=closed]:animate-out',
          )}
          aria-label="Site menu"
        >
          <Dialog.Title className="sr-only">{siteConfig.name} navigation</Dialog.Title>
          <Dialog.Description className="sr-only">
            Primary site navigation and contact links.
          </Dialog.Description>

          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <Logo size="sm" />
            <Dialog.Close asChild>
              <button
                type="button"
                className="inline-flex size-11 items-center justify-center rounded-lg text-neutral-200 transition-colors hover:bg-white/8 hover:text-white"
                aria-label="Close menu"
              >
                <X className="size-6" aria-hidden="true" />
              </button>
            </Dialog.Close>
          </div>

          <nav
            onClick={handleNavigate}
            className="scrollbar-slim flex-1 overflow-y-auto overscroll-contain px-3 py-4"
          >
            <ul className="flex flex-col gap-0.5">
              <li>
                <Link
                  href="/"
                  aria-current={pathname === '/' ? 'page' : undefined}
                  className={cn(
                    'flex min-h-11 items-center rounded-lg px-3 text-base font-semibold',
                    pathname === '/' ? 'bg-white/8 text-white' : 'text-neutral-200',
                  )}
                >
                  Home
                </Link>
              </li>

              {primaryNav.map((item) => {
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                const isExpanded = expanded === item.href;

                return (
                  <li key={item.href}>
                    <div className="flex items-stretch gap-1">
                      <Link
                        href={item.href}
                        aria-current={active ? 'page' : undefined}
                        className={cn(
                          'flex min-h-11 flex-1 items-center rounded-lg px-3 text-base font-semibold',
                          active ? 'bg-white/8 text-white' : 'text-neutral-200',
                        )}
                      >
                        {item.label}
                      </Link>

                      {item.children ? (
                        <button
                          type="button"
                          onClick={() => setExpanded(isExpanded ? null : item.href)}
                          aria-expanded={isExpanded}
                          aria-controls={`submenu-${item.href.replace(/\//g, '-')}`}
                          aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${item.label} menu`}
                          className="inline-flex size-11 shrink-0 items-center justify-center rounded-lg text-neutral-300 hover:bg-white/8 hover:text-white"
                        >
                          <ChevronDown
                            className={cn(
                              'size-5 transition-transform duration-200',
                              isExpanded && 'rotate-180',
                            )}
                            aria-hidden="true"
                          />
                        </button>
                      ) : null}
                    </div>

                    {item.children ? (
                      <ul
                        id={`submenu-${item.href.replace(/\//g, '-')}`}
                        hidden={!isExpanded}
                        className="mt-1 mb-2 ml-3 flex flex-col gap-0.5 border-l border-white/10 pl-3"
                      >
                        {item.children.map((child) => (
                          <li key={child.href}>
                            <Link
                              href={child.href}
                              className="flex min-h-11 items-center rounded-lg px-3 text-sm font-medium text-neutral-300 hover:bg-white/5 hover:text-white"
                            >
                              {child.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </nav>

          <div onClick={handleNavigate} className="border-t border-white/10 p-5">
            <Button asChild size="lg" variant="onDark" className="w-full">
              <Link href={ctas.primary.href}>{ctas.primary.label}</Link>
            </Button>
            <a
              href={`mailto:${siteConfig.contact.email}`}
              className="mt-3 block text-center text-sm font-medium text-neutral-300 hover:text-white"
            >
              {siteConfig.contact.email}
            </a>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
