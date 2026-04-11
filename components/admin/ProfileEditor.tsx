'use client';

import { useState } from 'react';
import { updateProfileAction } from '@/app/actions/profile';
import { DbProfile } from '@/lib/db/types';

type Props = {
  profile: DbProfile;
  onClose: () => void;
};

export default function ProfileEditor({ profile, onClose }: Props) {
  const [name, setName] = useState(profile.name);
  const [chineseName, setChineseName] = useState(profile.chinese_name ?? '');
  const [bio, setBio] = useState(profile.bio);
  const [email, setEmail] = useState(profile.email);
  const [github, setGithub] = useState(profile.social?.github ?? '');
  const [linkedin, setLinkedin] = useState(profile.social?.linkedin ?? '');
  const [ctaLabel, setCtaLabel] = useState(profile.cta?.label ?? '');
  const [ctaHref, setCtaHref] = useState(profile.cta?.href ?? '');
  const [highlights, setHighlights] = useState(profile.highlights ?? []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function updateHighlight(idx: number, field: 'text' | 'url' | 'label', value: string) {
    setHighlights(prev => prev.map((h, i) => i === idx ? { ...h, [field]: value || undefined } : h));
  }

  function addHighlight() {
    setHighlights(prev => [...prev, { text: '' }]);
  }

  function removeHighlight(idx: number) {
    setHighlights(prev => prev.filter((_, i) => i !== idx));
  }

  async function handleSave() {
    setSaving(true);
    setError('');
    try {
      await updateProfileAction({
        name,
        chinese_name: chineseName.trim() || null,
        bio,
        email,
        social: { github: github || undefined, linkedin: linkedin || undefined },
        cta: { label: ctaLabel || undefined, href: ctaHref || undefined },
        highlights: highlights.filter(h => h.text),
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      <div>
        <label className="block text-xs font-medium uppercase tracking-[0.12em] text-ink-muted mb-1">Name</label>
        <input type="text" value={name} onChange={e => setName(e.target.value)} className="input w-full" />
      </div>

      <div>
        <label className="block text-xs font-medium uppercase tracking-[0.12em] text-ink-muted mb-1">Chinese Name</label>
        <input
          type="text"
          value={chineseName}
          onChange={e => setChineseName(e.target.value)}
          lang="zh-Hant"
          placeholder="e.g. 杜得人"
          className="input w-full"
        />
      </div>

      <div>
        <label className="block text-xs font-medium uppercase tracking-[0.12em] text-ink-muted mb-1">Bio</label>
        <textarea value={bio} onChange={e => setBio(e.target.value)} className="input w-full" rows={2} />
      </div>

      <div>
        <label className="block text-xs font-medium uppercase tracking-[0.12em] text-ink-muted mb-1">Email</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input w-full" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium uppercase tracking-[0.12em] text-ink-muted mb-1">GitHub URL</label>
          <input type="url" value={github} onChange={e => setGithub(e.target.value)} className="input w-full" />
        </div>
        <div>
          <label className="block text-xs font-medium uppercase tracking-[0.12em] text-ink-muted mb-1">LinkedIn URL</label>
          <input type="url" value={linkedin} onChange={e => setLinkedin(e.target.value)} className="input w-full" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium uppercase tracking-[0.12em] text-ink-muted mb-1">CTA Label</label>
          <input type="text" value={ctaLabel} onChange={e => setCtaLabel(e.target.value)} className="input w-full" />
        </div>
        <div>
          <label className="block text-xs font-medium uppercase tracking-[0.12em] text-ink-muted mb-1">CTA Link</label>
          <input type="text" value={ctaHref} onChange={e => setCtaHref(e.target.value)} className="input w-full" />
        </div>
      </div>

      {/* Highlights */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-medium uppercase tracking-[0.12em] text-ink-muted">Highlights</label>
          <button onClick={addHighlight} className="text-xs text-ink-muted hover:text-ink dark:hover:text-ink-dark transition-colors">+ Add</button>
        </div>
        <div className="space-y-3">
          {highlights.map((h, i) => (
            <div key={i} className="space-y-2 p-3 border border-border dark:border-border-dark rounded-lg">
              <input type="text" value={h.text} onChange={e => updateHighlight(i, 'text', e.target.value)} placeholder="Highlight text" className="input w-full text-sm" />
              <div className="grid grid-cols-2 gap-2">
                <input type="url" value={h.url ?? ''} onChange={e => updateHighlight(i, 'url', e.target.value)} placeholder="URL (optional)" className="input w-full text-sm" />
                <input type="text" value={h.label ?? ''} onChange={e => updateHighlight(i, 'label', e.target.value)} placeholder="Link label (optional)" className="input w-full text-sm" />
              </div>
              <button onClick={() => removeHighlight(i)} className="text-xs text-red-500 hover:text-red-600">Remove</button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3 pt-4 border-t border-border dark:border-border-dark">
        <button onClick={handleSave} disabled={saving || !name} className="bg-ink dark:bg-ink-dark text-surface dark:text-surface-dark rounded-full px-5 py-2 text-sm font-medium disabled:opacity-50">
          {saving ? 'Saving\u2026' : 'Save'}
        </button>
        <button onClick={onClose} className="border border-border dark:border-border-dark rounded-full px-5 py-2 text-sm font-medium text-ink-muted">Cancel</button>
      </div>
    </div>
  );
}
