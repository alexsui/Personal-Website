'use client';

import { useState } from 'react';
import EditButton from './EditButton';
import EditorPanel from './EditorPanel';
import PostEditor from './PostEditor';
import { DbPost } from '@/lib/db/types';

export default function EditPostButton({ post }: { post: DbPost }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <EditButton
        onClick={() => setOpen(true)}
        className="static inline-flex ml-3"
      />
      <EditorPanel
        open={open}
        onClose={() => setOpen(false)}
        title="Edit Post"
      >
        <PostEditor post={post} onClose={() => setOpen(false)} />
      </EditorPanel>
    </>
  );
}
