'use client';

import { useState, useRef, useEffect } from 'react';
import { createPhotoAction } from '@/app/actions/photos';
import Image from 'next/image';

type Props = {
  collectionId: string | null;
  storagePath: string;
};

type UploadItem = {
  file: File;
  preview: string; // local blob URL for instant thumbnail
  status: 'pending' | 'uploading' | 'done' | 'error';
  url?: string;
  error?: string;
};

export default function PhotoUploader({ collectionId, storagePath }: Props) {
  const [items, setItems] = useState<UploadItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Clean up blob URLs on unmount
  useEffect(() => {
    return () => {
      items.forEach((item) => URL.revokeObjectURL(item.preview));
    };
  }, [items]);

  function handleFiles(files: FileList | null) {
    if (!files) return;
    const newItems: UploadItem[] = Array.from(files).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      status: 'pending' as const,
    }));
    setItems((prev) => [...prev, ...newItems]);
  }

  async function handleUpload() {
    setUploading(true);
    const pendingItems = items.filter((i) => i.status === 'pending');

    for (let idx = 0; idx < pendingItems.length; idx++) {
      const item = pendingItems[idx];

      setItems((prev) =>
        prev.map((i) =>
          i === item ? { ...i, status: 'uploading' as const } : i
        )
      );

      try {
        const formData = new FormData();
        formData.append('bucket', 'gallery');
        formData.append('path', storagePath);
        formData.append('files', item.file);

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 60000); // 60s timeout

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
          signal: controller.signal,
        });
        clearTimeout(timeout);

        if (!res.ok) {
          throw new Error(`Upload returned ${res.status}: ${res.statusText}`);
        }
        const data = await res.json();

        if (data.results?.length > 0) {
          const result = data.results[0];
          await createPhotoAction({
            collection_id: collectionId,
            storage_path: result.storagePath,
            filename: result.filename,
            sort_order: idx,
          });
          setItems((prev) =>
            prev.map((i) =>
              i === item
                ? { ...i, status: 'done' as const, url: result.url }
                : i
            )
          );
        } else {
          const errMsg = data.errors?.[0]?.error || 'Upload failed';
          setItems((prev) =>
            prev.map((i) =>
              i === item ? { ...i, status: 'error' as const, error: errMsg } : i
            )
          );
        }
      } catch {
        setItems((prev) =>
          prev.map((i) =>
            i === item
              ? { ...i, status: 'error' as const, error: 'Upload failed' }
              : i
          )
        );
      }
    }
    setUploading(false);
  }

  function removeItem(idx: number) {
    setItems((prev) => {
      const item = prev[idx];
      URL.revokeObjectURL(item.preview);
      return prev.filter((_, i) => i !== idx);
    });
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  }

  const pendingCount = items.filter((i) => i.status === 'pending').length;
  const doneCount = items.filter((i) => i.status === 'done').length;
  const totalCount = items.length;

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-border dark:border-border-dark rounded-xl p-8 text-center cursor-pointer hover:border-ink-muted dark:hover:border-ink-dark-secondary transition-colors"
      >
        <p className="text-sm text-ink-muted">
          Drop photos here or click to select
        </p>
        <p className="text-xs text-ink-muted/60 mt-1">
          JPG, PNG, WebP — max 10MB each
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {/* Upload button + progress */}
      {items.length > 0 && (
        <div className="flex items-center gap-3">
          {pendingCount > 0 && (
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="bg-ink dark:bg-ink-dark text-surface dark:text-surface-dark rounded-full px-5 py-2 text-sm font-medium disabled:opacity-50"
            >
              {uploading
                ? `Uploading ${doneCount + 1}/${totalCount}…`
                : `Upload ${pendingCount} photo${pendingCount > 1 ? 's' : ''}`}
            </button>
          )}
          {uploading && (
            <div className="flex-1 h-1.5 bg-border dark:bg-border-dark rounded-full overflow-hidden">
              <div
                className="h-full bg-ink dark:bg-ink-dark rounded-full transition-all duration-300"
                style={{ width: `${((doneCount) / totalCount) * 100}%` }}
              />
            </div>
          )}
          {!uploading && doneCount === totalCount && totalCount > 0 && (
            <span className="text-xs text-green-600 dark:text-green-400 font-medium">
              All {totalCount} photos uploaded
            </span>
          )}
        </div>
      )}

      {/* Thumbnails grid */}
      {items.length > 0 && (
        <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-6 gap-2">
          {items.map((item, i) => (
            <div
              key={i}
              className="relative aspect-square rounded-lg overflow-hidden group"
            >
              {/* Thumbnail — always show local preview */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.status === 'done' && item.url ? item.url : item.preview}
                alt={item.file.name}
                className="w-full h-full object-cover"
              />

              {/* Status overlay */}
              {item.status === 'uploading' && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                </div>
              )}

              {item.status === 'error' && (
                <div className="absolute inset-0 bg-red-900/50 flex flex-col items-center justify-center gap-1">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                    />
                  </svg>
                  <span className="text-[10px] text-white/80">Failed</span>
                </div>
              )}

              {item.status === 'done' && (
                <div className="absolute top-1 left-1">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.5 12.75l6 6 9-13.5"
                      />
                    </svg>
                  </div>
                </div>
              )}

              {/* Remove button (pending/error only) */}
              {(item.status === 'pending' || item.status === 'error') && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeItem(i);
                  }}
                  className="absolute top-1 right-1 w-5 h-5 bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                >
                  ×
                </button>
              )}

              {/* Filename tooltip on hover */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-[10px] text-white truncate">
                  {item.file.name}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
