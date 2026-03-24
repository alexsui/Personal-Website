'use client';

import { useState, useRef } from 'react';
import { createPhotoAction } from '@/app/actions/photos';
import Image from 'next/image';

type Props = {
  collectionId: string | null;
  storagePath: string;
};

type UploadItem = {
  file: File;
  status: 'pending' | 'uploading' | 'done' | 'error';
  url?: string;
  error?: string;
};

export default function PhotoUploader({ collectionId, storagePath }: Props) {
  const [items, setItems] = useState<UploadItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFiles(files: FileList | null) {
    if (!files) return;
    const newItems: UploadItem[] = Array.from(files).map(file => ({ file, status: 'pending' as const }));
    setItems(prev => [...prev, ...newItems]);
  }

  async function handleUpload() {
    setUploading(true);
    const pendingItems = items.filter(i => i.status === 'pending');

    for (let idx = 0; idx < pendingItems.length; idx++) {
      const item = pendingItems[idx];

      setItems(prev => prev.map(i => i === item ? { ...i, status: 'uploading' as const } : i));

      try {
        const formData = new FormData();
        formData.append('bucket', 'gallery');
        formData.append('path', storagePath);
        formData.append('files', item.file);

        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        const data = await res.json();

        if (data.results?.length > 0) {
          const result = data.results[0];
          await createPhotoAction({
            collection_id: collectionId,
            storage_path: result.storagePath,
            filename: result.filename,
            sort_order: idx,
          });
          setItems(prev => prev.map(i => i === item ? { ...i, status: 'done' as const, url: result.url } : i));
        } else {
          const errMsg = data.errors?.[0]?.error || 'Upload failed';
          setItems(prev => prev.map(i => i === item ? { ...i, status: 'error' as const, error: errMsg } : i));
        }
      } catch {
        setItems(prev => prev.map(i => i === item ? { ...i, status: 'error' as const, error: 'Upload failed' } : i));
      }
    }
    setUploading(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  }

  const pendingCount = items.filter(i => i.status === 'pending').length;

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-border dark:border-border-dark rounded-xl p-8 text-center cursor-pointer hover:border-ink-muted dark:hover:border-ink-dark-secondary transition-colors"
      >
        <p className="text-sm text-ink-muted">Drop photos here or click to select</p>
        <p className="text-xs text-ink-muted/60 mt-1">JPG, PNG, WebP — max 10MB each</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={e => handleFiles(e.target.files)}
        />
      </div>

      {/* Upload button */}
      {pendingCount > 0 && (
        <button
          onClick={handleUpload}
          disabled={uploading}
          className="bg-ink dark:bg-ink-dark text-surface dark:text-surface-dark rounded-full px-5 py-2 text-sm font-medium disabled:opacity-50"
        >
          {uploading ? 'Uploading\u2026' : `Upload ${pendingCount} photo${pendingCount > 1 ? 's' : ''}`}
        </button>
      )}

      {/* Items list */}
      {items.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {items.map((item, i) => (
            <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-ink/5 dark:bg-ink-dark/5">
              {item.url ? (
                <Image src={item.url} alt={item.file.name} fill className="object-cover" />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <span className={`text-xs ${item.status === 'error' ? 'text-red-500' : item.status === 'uploading' ? 'text-ink-muted animate-pulse' : 'text-ink-muted'}`}>
                    {item.status === 'error' ? '\u2715' : item.status === 'uploading' ? '\u2191' : '\u25CB'}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
