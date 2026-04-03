'use client';

import { useState } from 'react';
import { createAboutSectionAction, updateAboutSectionAction, deleteAboutSectionAction } from '@/app/actions/about';
import { DbAboutSection, AboutSectionType } from '@/lib/db/types';

type Props = {
  section?: DbAboutSection;
  defaultType?: AboutSectionType;
  onClose: () => void;
};

export default function AboutEditor({ section, defaultType, onClose }: Props) {
  const isNew = !section;
  const [title, setTitle] = useState(section?.title ?? '');
  const [subtitle, setSubtitle] = useState(section?.subtitle ?? '');
  const [type] = useState<AboutSectionType>(section?.type ?? defaultType ?? 'experience');
  const [dateStart, setDateStart] = useState(section?.date_start ?? '');
  const [dateEnd, setDateEnd] = useState(section?.date_end ?? '');
  const [url, setUrl] = useState(section?.url ?? '');
  const [sortOrder, setSortOrder] = useState(section?.sort_order ?? 0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Content fields vary by type
  const content = (section?.content ?? {}) as Record<string, unknown>;
  const [bullets, setBullets] = useState<string[]>((content.bullets as string[]) ?? []);
  const [location, setLocation] = useState((content.location as string) ?? '');
  const [gpa, setGpa] = useState((content.gpa as string) ?? '');
  const [description, setDescription] = useState((content.description as string) ?? '');
  const [items, setItems] = useState<string[]>((content.items as string[]) ?? []);

  function buildContent(): Record<string, unknown> {
    switch (type) {
      case 'experience':
        return { bullets: bullets.filter(Boolean), location };
      case 'education':
        return { bullets: bullets.filter(Boolean), gpa };
      case 'publication':
        return { bullets: bullets.filter(Boolean) };
      case 'achievement':
        return {};
      case 'skill_group':
        return { items: items.filter(Boolean) };
      case 'interest':
        return { description };
      default:
        return {};
    }
  }

  async function handleSave() {
    setSaving(true);
    setError('');
    try {
      const data = {
        type,
        title,
        subtitle: subtitle || undefined,
        date_start: dateStart || undefined,
        date_end: dateEnd || undefined,
        url: url || undefined,
        content: buildContent(),
        sort_order: sortOrder,
      };
      if (isNew) {
        await createAboutSectionAction(data);
      } else {
        await updateAboutSectionAction(section.id, data);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!section || !confirm('Delete this section?')) return;
    await deleteAboutSectionAction(section.id);
    onClose();
  }

  // Bullets editor helper
  function BulletsEditor() {
    return (
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs font-medium uppercase tracking-[0.12em] text-ink-muted">Bullets</label>
          <button onClick={() => setBullets(prev => [...prev, ''])} className="text-xs text-ink-muted hover:text-ink dark:hover:text-ink-dark">+ Add</button>
        </div>
        <div className="space-y-2">
          {bullets.map((b, i) => (
            <div key={i} className="flex gap-2">
              <input type="text" value={b} onChange={e => setBullets(prev => prev.map((x, j) => j === i ? e.target.value : x))} className="input w-full text-sm" />
              <button onClick={() => setBullets(prev => prev.filter((_, j) => j !== i))} className="text-red-500 text-xs shrink-0">&times;</button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Items editor (for skill_group)
  function ItemsEditor() {
    return (
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs font-medium uppercase tracking-[0.12em] text-ink-muted">Items</label>
          <button onClick={() => setItems(prev => [...prev, ''])} className="text-xs text-ink-muted hover:text-ink dark:hover:text-ink-dark">+ Add</button>
        </div>
        <div className="flex flex-wrap gap-2">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-1 bg-ink/5 dark:bg-ink-dark/5 rounded-full px-3 py-1">
              <input type="text" value={item} onChange={e => setItems(prev => prev.map((x, j) => j === i ? e.target.value : x))} className="bg-transparent text-sm border-none outline-none w-24" />
              <button onClick={() => setItems(prev => prev.filter((_, j) => j !== i))} className="text-red-500 text-xs">&times;</button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      {/* Common fields */}
      <div>
        <label className="block text-xs font-medium uppercase tracking-[0.12em] text-ink-muted mb-1">Title</label>
        <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="input w-full" />
      </div>

      {(type === 'experience' || type === 'education' || type === 'publication') && (
        <div>
          <label className="block text-xs font-medium uppercase tracking-[0.12em] text-ink-muted mb-1">{type === 'publication' ? 'Subtitle (journal/venue)' : 'Subtitle (role/degree)'}</label>
          <input type="text" value={subtitle} onChange={e => setSubtitle(e.target.value)} className="input w-full" />
        </div>
      )}

      {(type === 'experience' || type === 'education') && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium uppercase tracking-[0.12em] text-ink-muted mb-1">Start Date</label>
            <input type="text" value={dateStart} onChange={e => setDateStart(e.target.value)} placeholder="e.g., Apr 2025" className="input w-full" />
          </div>
          <div>
            <label className="block text-xs font-medium uppercase tracking-[0.12em] text-ink-muted mb-1">End Date</label>
            <input type="text" value={dateEnd} onChange={e => setDateEnd(e.target.value)} placeholder="e.g., Present" className="input w-full" />
          </div>
        </div>
      )}

      {(type === 'experience' || type === 'education' || type === 'publication') && (
        <div>
          <label className="block text-xs font-medium uppercase tracking-[0.12em] text-ink-muted mb-1">URL</label>
          <input type="url" value={url} onChange={e => setUrl(e.target.value)} className="input w-full" />
        </div>
      )}

      {/* Type-specific content */}
      {type === 'experience' && (
        <>
          <div>
            <label className="block text-xs font-medium uppercase tracking-[0.12em] text-ink-muted mb-1">Location</label>
            <input type="text" value={location} onChange={e => setLocation(e.target.value)} className="input w-full" />
          </div>
          <BulletsEditor />
        </>
      )}

      {type === 'education' && (
        <>
          <div>
            <label className="block text-xs font-medium uppercase tracking-[0.12em] text-ink-muted mb-1">GPA</label>
            <input type="text" value={gpa} onChange={e => setGpa(e.target.value)} className="input w-full" placeholder="e.g., 4.27/4.3" />
          </div>
          <BulletsEditor />
        </>
      )}

      {type === 'publication' && <BulletsEditor />}

      {type === 'skill_group' && <ItemsEditor />}

      {type === 'interest' && (
        <div>
          <label className="block text-xs font-medium uppercase tracking-[0.12em] text-ink-muted mb-1">Description</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} className="input w-full" rows={3} />
        </div>
      )}

      <div>
        <label className="block text-xs font-medium uppercase tracking-[0.12em] text-ink-muted mb-1">Sort Order</label>
        <input type="number" value={sortOrder} onChange={e => setSortOrder(parseInt(e.target.value) || 0)} className="input w-24" />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-4 border-t border-border dark:border-border-dark">
        <button onClick={handleSave} disabled={saving || !title} className="bg-ink dark:bg-ink-dark text-surface dark:text-surface-dark rounded-full px-5 py-2 text-sm font-medium disabled:opacity-50">
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
