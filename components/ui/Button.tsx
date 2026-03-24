import { ReactNode } from 'react';
import Link from 'next/link';

type Props = {
  href?: string;
  onClick?: () => void;
  children: ReactNode;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  type?: 'button' | 'submit';
};

export default function Button({
  href,
  onClick,
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  type = 'button',
}: Props) {
  const baseStyles = `
    inline-flex items-center justify-center gap-2
    font-sans font-medium rounded-full
    transition-all duration-200 ease-out
    focus:outline-none focus:ring-2 focus:ring-ink/20 focus:ring-offset-2 focus:ring-offset-surface
    dark:focus:ring-ink-dark/20 dark:focus:ring-offset-surface-dark
    active:scale-[0.98]
  `;

  const sizeStyles = {
    sm: 'px-5 py-2 text-sm',
    md: 'px-7 py-3 text-sm',
    lg: 'px-9 py-4 text-base',
  };

  const variantStyles = {
    primary: `
      bg-ink dark:bg-ink-dark
      text-surface dark:text-surface-dark
      hover:opacity-85
    `,
    secondary: `
      bg-transparent
      text-ink dark:text-ink-dark
      border border-border dark:border-border-dark
      hover:bg-surface-secondary dark:hover:bg-surface-dark-secondary
    `,
  };

  const classes = `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`;

  if (href) {
    return (
      <Link className={classes} href={href}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} onClick={onClick} type={type}>
      {children}
    </button>
  );
}
