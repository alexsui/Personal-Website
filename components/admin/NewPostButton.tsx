'use client';

import { useState } from 'react';
import EditorPanel from './EditorPanel';
import PostEditor from './PostEditor';

export default function NewPostButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-sm font-medium text-ink-muted hover:text-ink dark:hover:text-ink-dark transition-colors"
      >
        + New Post
      </button>
      <EditorPanel
        open={open}
        onClose={() => setOpen(false)}
        title="New Post"
      >
        <PostEditor onClose={() => setOpen(false)} />
      </EditorPanel>
    </>
  );
}
