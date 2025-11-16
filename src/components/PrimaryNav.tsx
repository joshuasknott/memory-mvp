'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from './ui/Button';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/timeline', label: 'Timeline' },
  { href: '/save', label: 'Save a memory' },
];

export function PrimaryNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (!pathname) return href === '/';
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <nav aria-label="Primary navigation" className="flex flex-wrap items-center gap-3">
      {navItems.map((item) => {
        const active = isActive(item.href);
        return (
          <Button
            key={item.href}
            asChild
            variant={active ? 'secondary' : 'subtle'}
            aria-current={active ? 'page' : undefined}
            className={`px-5 py-2 text-base sm:text-lg ${
              active ? 'font-semibold' : 'font-medium'
            }`}
          >
            <Link href={item.href} className="no-underline">
              {item.label}
            </Link>
          </Button>
        );
      })}
    </nav>
  );
}


