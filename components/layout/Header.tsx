'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeToggle from '@/components/ui/ThemeToggle';

export default function Header() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  const navLinks = [
    { href: '/about', label: 'About' },
    { href: '/projects', label: 'Gallery' },
    { href: '/blog', label: 'Blog' },
    { href: '/contact', label: 'Contact' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-surface/80 dark:bg-surface-dark/80 backdrop-blur-lg">
      <div className="container flex items-center justify-between h-16">
        {/* Logo */}
        <Link
          href="/"
          className="font-display text-2xl font-medium text-ink dark:text-ink-dark hover:opacity-70 transition-opacity"
        >
          Samuel Toh
        </Link>

        {/* Navigation */}
        <div className="flex items-center gap-6">
          <nav className="hidden sm:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 text-sm font-medium tracking-wide transition-all duration-200 ${
                  isActive(link.href)
                    ? 'text-ink dark:text-ink-dark'
                    : 'text-ink-muted dark:text-ink-muted hover:text-ink dark:hover:text-ink-dark'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Thin divider */}
          <div className="hidden sm:block w-px h-5 bg-border dark:bg-border-dark" />

          <ThemeToggle />
        </div>
      </div>

      {/* Bottom border line */}
      <div className="h-px bg-border dark:bg-border-dark" />
    </header>
  );
}
