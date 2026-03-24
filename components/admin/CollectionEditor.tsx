'use client';

import { useState, useEffect } from 'react';
import { generateSlug } from '@/lib/slug';
import { createCollectionAction, updateCollectionAction, deleteCollectionAction } from '@/app/actions/collections';
import { DbCollection } from '@/lib/db/types';

type Props = {
  collection?: DbCollection;
  onClose: () => void;
};

export default function CollectionEditor({ collection, onClose }: Props) {
  const isNew = !collection;
  const [title, setTitle] = useState(collection?.title ?? '');
  const [slug, setSlug] = useState(collection?.slug ?? '');
  const [location, setLocation] = useState(collection?.location ?? '');
  const [date, setDate] = useState(collection?.date ?? new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(collection?.end_date ?? '');
  const [description, setDescription] = useState(collection?.description ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isNew && title) setSlug(generateSlug(title));
  }, [title, isNew]);

  async function handleSave() {
    setSaving(true);
    setError('');
    try {
      if (isNew) {
        await createCollectionAction({ title, date, end_date: endDate || undefined, location, description });
      } else {
        await updateCollectionAction(collection.id, { title, slug, date, end_date: endDate || null, location, description });
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!collection || !confirm('Delete this collection and all its photos? This cannot be undone.')) return;
    await deleteCollectionAction(collection.id, collection.slug);
    onClose();
  }

  return (
    <div className="space-y-5">
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      <div>
        <label className="block text-xs font-medium uppercase tracking-[0.12em] text-ink-muted mb-1">Title</label>
        <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="input w-full" />
      </div>
      <div>
        <label className="block text-xs font-medium uppercase tracking-[0.12em] text-ink-muted mb-1">Slug</label>
        <input type="text" value={slug} onChange={e => setSlug(e.target.value)} className="input w-full" />
      </div>
      <div>
        <label className="block text-xs font-medium uppercase tracking-[0.12em] text-ink-muted mb-1">Location</label>
        <input type="text" value={location} onChange={e => setLocation(e.target.value)} className="input w-full" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium uppercase tracking-[0.12em] text-ink-muted mb-1">Start Date</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="input w-full" />
        </div>
        <div>
          <label className="block text-xs font-medium uppercase tracking-[0.12em] text-ink-muted mb-1">End Date</label>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="input w-full" />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium uppercase tracking-[0.12em] text-ink-muted mb-1">Description</label>
        <textarea value={description} onChange={e => setDescription(e.target.value)} className="input w-full" rows={3} />
      </div>
      <div className="flex items-center gap-3 pt-4 border-t border-border dark:border-border-dark">
        <button onClick={handleSave} disabled={saving || !title || !location} className="bg-ink dark:bg-ink-dark text-surface dark:text-surface-dark rounded-full px-5 py-2 text-sm font-medium disabled:opacity-50">
          {saving ? 'Saving\u2026' : 'Save'}
        </button>
        <button onClick={onClose} className="border border-border dark:border-border-dark rounded-full px-5 py-2 text-sm font-medium text-ink-muted">Cancel</button>
        {!isNew && (
          <button onClick={handleDelete} className="ml-auto text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 transition-colors">Delete</button>
        )}
      </div>
    </div>
  );
}
