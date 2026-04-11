'use client';

import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { signIn, signOut, useSession } from 'next-auth/react';

const TAP_COUNT = 5;
const TAP_TIMEOUT = 2000; // 2 seconds to complete all taps

type Props = {
  name?: string;
  chineseName?: string | null;
};

export default function AdminTrigger({ name = 'Samuel Toh', chineseName }: Props) {
  const { data: session } = useSession();
  const tapCount = useRef(0);
  const tapTimer = useRef<NodeJS.Timeout | null>(null);
  const currentYear = new Date().getFullYear();

  // Login modal state
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleTap() {
    tapCount.current++;

    if (tapTimer.current) clearTimeout(tapTimer.current);
    tapTimer.current = setTimeout(() => {
      tapCount.current = 0;
    }, TAP_TIMEOUT);

    if (tapCount.current >= TAP_COUNT) {
      tapCount.current = 0;
      if (tapTimer.current) clearTimeout(tapTimer.current);

      if (session) {
        signOut();
      } else {
        setOpen(true);
      }
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError('Invalid credentials');
    } else {
      setOpen(false);
      setEmail('');
      setPassword('');
    }
  }

  return (
    <>
      <p
        className="text-sm text-ink-muted cursor-default select-none"
        onClick={handleTap}
      >
        &copy; {currentYear} <span lang="en">{name}</span>
        {chineseName && (
          <>
            {' · '}
            <span lang="zh-Hant">{chineseName}</span>
          </>
        )}
      </p>

      {open && createPortal(
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <form
            onSubmit={handleSubmit}
            className="relative bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-2xl p-8 w-full max-w-sm shadow-xl"
          >
            <h2 className="font-display text-xl font-medium text-ink dark:text-ink-dark mb-6">
              Admin Login
            </h2>

            {error && (
              <p className="text-sm text-red-600 dark:text-red-400 mb-4">{error}</p>
            )}

            <label className="block text-xs font-medium uppercase tracking-label text-ink-muted mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input w-full mb-4"
              required
            />

            <label className="block text-xs font-medium uppercase tracking-label text-ink-muted mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input w-full mb-6"
              required
            />

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-ink dark:bg-ink-dark text-surface dark:text-surface-dark rounded-full px-4 py-2 text-sm font-medium disabled:opacity-50"
              >
                {loading ? 'Signing in\u2026' : 'Sign in'}
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex-1 border border-border dark:border-border-dark rounded-full px-4 py-2 text-sm font-medium text-ink-muted"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>,
        document.body
      )}
    </>
  );
}
