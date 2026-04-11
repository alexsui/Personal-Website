'use client';
import { useState } from 'react';
import { buildMailto } from '@/lib/mailto';
import { LINKEDIN_URL } from '@/lib/social';
import Button from '@/components/ui/Button';

export default function ContactForm({ recipientEmail }: { recipientEmail: string }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [notice, setNotice] = useState<string | null>(null);
  const valid = name.trim() && /.+@.+\..+/.test(email) && message.trim();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid)
      return setNotice('Please fill out all fields with a valid email.');
    const href = buildMailto({
      to: recipientEmail,
      name,
      email,
      message,
    });
    const isE2E =
      process.env.NEXT_PUBLIC_E2E === '1' ||
      process.env.NEXT_PUBLIC_E2E === 'true';
    if (isE2E) {
      setNotice('Opening your email client with a prefilled draft…');
      return;
    }
    try {
      window.location.href = href;
      setNotice('Opening your email client with a prefilled draft…');
    } catch {
      setNotice('Could not open an email client. Copy the message below.');
    }
  };

  return (
    <div className="container py-16 animate-fade-in">
      <div className="max-w-xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-12">
          <p className="section-label mb-4">Contact</p>
          <h1 className="text-4xl sm:text-5xl font-display font-medium mb-4 text-ink dark:text-ink-dark">
            Get In Touch
          </h1>
          <p className="text-ink-secondary dark:text-ink-dark-secondary leading-relaxed">
            Have a question or want to work together? I&apos;d love to hear from you.
          </p>
        </div>

        {/* Contact Form */}
        <div className="p-8 rounded-2xl bg-surface-secondary dark:bg-surface-dark-secondary border border-border dark:border-border-dark">
          <form onSubmit={onSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium mb-2 text-ink dark:text-ink-dark"
              >
                Name
              </label>
              <input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="input"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium mb-2 text-ink dark:text-ink-dark"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="input"
              />
            </div>

            <div>
              <label
                htmlFor="message"
                className="block text-sm font-medium mb-2 text-ink dark:text-ink-dark"
              >
                Message
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Your message..."
                rows={5}
                className="input resize-none"
              />
            </div>

            <Button
              type="submit"
              className={`w-full ${!valid ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Send Message
            </Button>
          </form>

          {/* Notice */}
          {notice && (
            <div className="mt-6 p-4 rounded-xl bg-surface-elevated dark:bg-surface-dark-elevated border border-border dark:border-border-dark">
              <p className="text-sm text-ink-secondary dark:text-ink-dark-secondary mb-3">
                {notice}
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium text-ink-muted hover:text-ink dark:hover:text-ink-dark border border-border dark:border-border-dark hover:bg-surface-secondary dark:hover:bg-surface-dark-secondary transition-colors"
                  onClick={() =>
                    navigator.clipboard.writeText(recipientEmail)
                  }
                >
                  Copy email
                </button>
                <button
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium text-ink-muted hover:text-ink dark:hover:text-ink-dark border border-border dark:border-border-dark hover:bg-surface-secondary dark:hover:bg-surface-dark-secondary transition-colors"
                  onClick={() => navigator.clipboard.writeText(message)}
                >
                  Copy message
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Alternative Contact */}
        <p className="mt-8 text-center text-sm text-ink-muted">
          Or email me directly at{' '}
          <a
            href={`mailto:${recipientEmail}`}
            className="text-ink dark:text-ink-dark underline underline-offset-4 decoration-border hover:decoration-ink transition-colors"
          >
            {recipientEmail}
          </a>
          {' '}— or connect on{' '}
          <a
            href={LINKEDIN_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-ink dark:text-ink-dark underline underline-offset-4 decoration-border hover:decoration-ink transition-colors"
          >
            LinkedIn
          </a>
          .
        </p>
      </div>
    </div>
  );
}
