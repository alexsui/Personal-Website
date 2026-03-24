'use client';

import { useState } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';

export default function LoginModal() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (session) {
    return (
      <button
        onClick={() => signOut()}
        className="text-ink-muted hover:text-ink dark:hover:text-ink-dark transition-colors"
        title="Sign out"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
        </svg>
      </button>
    );
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
      <button
        onClick={() => setOpen(true)}
        className="text-ink-muted/30 hover:text-ink-muted dark:text-ink-dark-secondary/30 dark:hover:text-ink-dark-secondary transition-colors"
        title="Admin login"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
        </svg>
      </button>

      {open && (
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
                {loading ? 'Signing in…' : 'Sign in'}
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
        </div>
      )}
    </>
  );
}
