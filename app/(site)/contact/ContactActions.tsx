'use client';

import { useRef, useState } from 'react';
import Button from '@/components/ui/Button';

export default function ContactActions({ email }: { email: string }) {
  const [notice, setNotice] = useState('');
  const addressRef = useRef<HTMLSpanElement>(null);

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
      <span ref={addressRef} className="block select-text break-all text-xl sm:text-2xl text-ink dark:text-ink-dark mb-6">
        {email}
      </span>
      <div className="flex flex-wrap gap-3">
        <Button href={`mailto:${email}`}>Email me</Button>
        <Button onClick={copyEmail} variant="secondary">Copy email</Button>
      </div>
      <p className="mt-4 text-sm text-ink-muted">
        Opens your email app. You can also copy the address to use it in your browser.
      </p>
      <p role="status" className="mt-2 min-h-5 text-sm text-ink-secondary dark:text-ink-dark-secondary">
        {notice}
      </p>
    </div>
  );
}
