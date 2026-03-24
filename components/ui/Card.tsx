import { ReactNode } from 'react';

type Props = { children: ReactNode; className?: string };

export default function Card({ children, className = '' }: Props) {
  return (
    <div
      className={`rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 ${className}`}
    >
      {children}
    </div>
  );
}
