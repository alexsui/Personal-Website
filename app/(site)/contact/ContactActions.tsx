'use client';

import { useRef, useState } from 'react';
import Button from '@/components/ui/Button';

export default function ContactActions({ email }: { email: string }) {
  const [notice, setNotice] = useState('');
  const addressRef = useRef<HTMLAnchorElement>(null);

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(email);
      setNotice('Email address copied.');
    } catch {
      if (addressRef.current) {
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(addressRef.current);
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
      setNotice('Couldn’t copy automatically. Select and copy the email address above.');
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        <a ref={addressRef} href={`mailto:${email}`} className="inline-flex min-h-11 items-center select-text break-all text-xl sm:text-2xl text-ink dark:text-ink-dark underline decoration-border dark:decoration-border-dark underline-offset-4 hover:decoration-current focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4">
          {email}
        </a>
        <Button onClick={copyEmail} variant="secondary">Copy email</Button>
      </div>
      <p role="status" className="mt-2 empty:mt-0 text-sm text-ink-secondary dark:text-ink-dark-secondary">
        {notice}
      </p>
    </div>
  );
}
