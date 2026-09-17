'use client';

import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import { ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { IconTile } from '@/components/ui/icon';
import { primaryNav } from '@/content/site';
import { cn } from '@/lib/utils';

/**
 * Desktop primary navigation.
 *
 * Built on Radix NavigationMenu so the mega-menu is fully keyboard operable: arrow keys move
 * between triggers, Enter/Space opens a panel, Escape closes it and returns focus to the trigger.
 *
 * Specification §10.1 requires that no critical content depend on hover, so every panel also
 * contains a direct "View all" link to the section's own page. A visitor who never opens a panel
 * can still reach /services, /solutions and /industries from the header.
 *
 * Rendered without a NavigationMenu.Viewport: each panel is positioned relative to the menu root,
 * which keeps the panel width independent of the trigger and avoids a shared animating container.
 */
export function DesktopNav() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <NavigationMenu.Root className="relative hidden lg:flex" delayDuration={80}>
      <NavigationMenu.List className="flex items-center gap-0.5">
        {primaryNav.map((item) => {
          const active = isActive(item.href);

          if (!item.children) {
            return (
              <NavigationMenu.Item key={item.href}>
                <NavigationMenu.Link asChild>
                  <Link
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'inline-flex h-10 items-center rounded-lg px-3 text-sm font-semibold transition-colors',
                      active
                        ? 'text-brand-700'
                        : 'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900',
                    )}
                  >
                    {item.label}
                  </Link>
                </NavigationMenu.Link>
              </NavigationMenu.Item>
            );
          }

          return (
            <NavigationMenu.Item key={item.href}>
              <NavigationMenu.Trigger
                className={cn(
                  'group inline-flex h-10 items-center gap-1 rounded-lg px-3 text-sm font-semibold transition-colors',
                  active
                    ? 'text-brand-700'
                    : 'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900',
                )}
              >
                {item.label}
                <ChevronDown
                  className="size-4 transition-transform duration-200 group-data-[state=open]:rotate-180"
                  aria-hidden="true"
                />
              </NavigationMenu.Trigger>

              <NavigationMenu.Content
                className={cn(
                  'absolute top-full left-0 z-50 pt-3',
                  item.children.length > 2
                    ? 'w-[min(58rem,calc(100vw-4rem))]'
                    : 'w-[min(26rem,calc(100vw-4rem))]',
                )}
              >
                <div className="overflow-hidden rounded-(--radius-panel) border border-neutral-200 bg-white shadow-[var(--shadow-panel)]">
                  <div className="grid gap-8 p-7 lg:grid-cols-[minmax(0,17rem)_1fr]">
                    <div className="lg:border-r lg:border-neutral-200 lg:pr-7">
                      <p className="text-eyebrow text-brand-700 uppercase">{item.panelHeading}</p>
                      <p className="mt-3 text-sm leading-relaxed text-neutral-600">
                        {item.panelDescription}
                      </p>
                      <NavigationMenu.Link asChild>
                        <Link
                          href={item.href}
                          className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-800"
                        >
                          View all {item.label.toLowerCase()}
                          <span aria-hidden="true">→</span>
                        </Link>
                      </NavigationMenu.Link>
                    </div>

                    <ul className="grid gap-1.5 sm:grid-cols-2">
                      {item.children.map((child) => (
                        <li key={child.href}>
                          <NavigationMenu.Link asChild>
                            <Link
                              href={child.href}
                              className="group flex gap-3.5 rounded-xl p-3 transition-colors hover:bg-neutral-50 focus-visible:bg-neutral-50"
                            >
                              {child.icon ? (
                                <IconTile name={child.icon} className="size-9 rounded-lg" />
                              ) : null}
                              <span className="min-w-0">
                                <span className="block text-sm font-semibold text-neutral-900 group-hover:text-brand-700">
                                  {child.label}
                                </span>
                                {child.description ? (
                                  <span className="mt-1 block text-xs leading-relaxed text-neutral-600">
                                    {child.description}
                                  </span>
                                ) : null}
                              </span>
                            </Link>
                          </NavigationMenu.Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </NavigationMenu.Content>
            </NavigationMenu.Item>
          );
        })}
      </NavigationMenu.List>
    </NavigationMenu.Root>
  );
}
