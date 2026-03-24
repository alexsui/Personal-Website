'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import EditButton from './EditButton';
import EditorPanel from './EditorPanel';
import PostEditor from './PostEditor';
import { DbPost } from '@/lib/db/types';

export default function EditPostButton({ post }: { post: DbPost }) {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  if (!session) return null;

  return (
    <>
      <EditButton onClick={() => setOpen(true)} />
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
