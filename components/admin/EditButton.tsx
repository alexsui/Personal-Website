'use client';

import AuthGate from './AuthGate';

type Props = {
  onClick: () => void;
  className?: string;
};

export default function EditButton({ onClick, className = '' }: Props) {
  return (
    <AuthGate>
      <button
        onClick={onClick}
        className={`absolute top-3 right-3 z-10 bg-surface/80 dark:bg-surface-dark/80 backdrop-blur border border-border dark:border-border-dark rounded-full w-8 h-8 flex items-center justify-center text-ink-muted hover:text-ink dark:hover:text-ink-dark transition-colors ${className}`}
        title="Edit"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
        </svg>
      </button>
    </AuthGate>
  );
}
