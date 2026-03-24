'use client';

import { useState } from 'react';
import EditButton from './EditButton';
import EditorPanel from './EditorPanel';
import CollectionEditor from './CollectionEditor';
import { DbCollection } from '@/lib/db/types';

export default function EditCollectionButton({ collection }: { collection: DbCollection }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <EditButton onClick={() => setOpen(true)} className="static inline-flex ml-3" />
      <EditorPanel open={open} onClose={() => setOpen(false)} title="Edit Collection">
        <CollectionEditor collection={collection} onClose={() => setOpen(false)} />
      </EditorPanel>
    </>
  );
}
