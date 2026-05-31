'use client';

import { useState } from 'react';
import EditorPanel from './EditorPanel';
import AboutEditor from './AboutEditor';
import { AboutSectionType } from '@/lib/db/types';

export default function AddAboutButton({
  type,
  nextSortOrder,
}: {
  type: AboutSectionType;
  nextSortOrder: number;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-xs font-medium uppercase tracking-[0.12em] text-ink-muted/60 hover:text-ink dark:hover:text-ink-dark transition-colors"
        title="Add"
      >
        + Add
      </button>
      <EditorPanel open={open} onClose={() => setOpen(false)} title={`Add ${type}`}>
        <AboutEditor defaultType={type} defaultSortOrder={nextSortOrder} onClose={() => setOpen(false)} />
      </EditorPanel>
    </>
  );
}
