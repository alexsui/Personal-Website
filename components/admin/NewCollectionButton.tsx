'use client';

import { useState } from 'react';
import EditorPanel from './EditorPanel';
import CollectionEditor from './CollectionEditor';

export default function NewCollectionButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-sm font-medium text-ink-muted hover:text-ink dark:hover:text-ink-dark transition-colors"
      >
        + New Collection
      </button>
      <EditorPanel open={open} onClose={() => setOpen(false)} title="New Collection">
        <CollectionEditor onClose={() => setOpen(false)} />
      </EditorPanel>
    </>
  );
}
