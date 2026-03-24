'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { deletePhotoAction } from '@/app/actions/photos';

type Props = {
  id: string;
  url: string;
  storagePath: string;
  alt: string;
  collectionSlug?: string;
};

export default function DeletablePhoto({ id, url, storagePath, alt, collectionSlug }: Props) {
  const { data: session } = useSession();
  const [deleting, setDeleting] = useState(false);
  const [deleted, setDeleted] = useState(false);

  async function handleDelete() {
    if (!confirm('Delete this photo? This cannot be undone.')) return;
    setDeleting(true);
    try {
      await deletePhotoAction(id, storagePath, collectionSlug);
      setDeleted(true);
    } catch {
      setDeleting(false);
    }
  }

  if (deleted) return null;

  return (
    <div className="relative group">
      <Image
        src={url}
        alt={alt}
        width={800}
        height={600}
        className="w-full h-auto object-cover"
      />
      {session && (
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 disabled:opacity-50"
          title="Delete photo"
        >
          {deleting ? (
            <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </button>
      )}
    </div>
  );
}
