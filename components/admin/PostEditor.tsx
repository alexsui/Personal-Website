'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { generateSlug } from '@/lib/slug';
import {
  createPostAction,
  updatePostAction,
  deletePostAction,
  toggleDraftAction,
} from '@/app/actions/posts';
import { renderMarkdown } from '@/app/actions/markdown';
import { DbPost } from '@/lib/db/types';

type Props = {
  post?: DbPost;
  onClose: () => void;
};

export default function PostEditor({ post, onClose }: Props) {
  const isNew = !post;
  const router = useRouter();
  const [title, setTitle] = useState(post?.title ?? '');
  const [slug, setSlug] = useState(post?.slug ?? '');
  const [date, setDate] = useState(
    post?.date ?? new Date().toISOString().split('T')[0]
  );
  const [summary, setSummary] = useState(post?.summary ?? '');
  const [tags, setTags] = useState(post?.tags?.join(', ') ?? '');
  const [content, setContent] = useState(post?.content ?? '');
  const [tab, setTab] = useState<'write' | 'preview'>('write');
  const [previewHtml, setPreviewHtml] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Auto-generate slug from title (only for new posts)
  useEffect(() => {
    if (isNew && title) {
      setSlug(generateSlug(title));
    }
  }, [title, isNew]);

  // Render preview when switching to preview tab
  useEffect(() => {
    if (tab === 'preview' && content) {
      renderMarkdown(content).then(setPreviewHtml);
    }
  }, [tab, content]);

  async function handleSave() {
    setSaving(true);
    setError('');
    try {
      const tagList = tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
      if (isNew) {
        const created = await createPostAction({
          title,
          date,
          summary,
          content,
          tags: tagList,
        });
        onClose();
        router.push(`/blog/${created.slug}`);
      } else {
        await updatePostAction(post.id, {
          title,
          date,
          summary,
          content,
          tags: tagList,
        });
        onClose();
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!post || !confirm('Delete this post? This cannot be undone.')) return;
    await deletePostAction(post.id, post.slug);
    router.push('/blog');
  }

  async function handleToggleDraft() {
    if (!post) return;
    await toggleDraftAction(post.id, post.slug, !post.draft);
    onClose();
  }

  return (
    <div className="space-y-5">
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      {/* Title */}
      <div>
        <label className="block text-xs font-medium uppercase tracking-[0.12em] text-ink-muted mb-1">
          Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="input w-full"
        />
      </div>

      {/* Slug — only show for new posts */}
      {isNew && (
        <div>
          <label className="block text-xs font-medium uppercase tracking-[0.12em] text-ink-muted mb-1">
            Slug
          </label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="input w-full"
          />
        </div>
      )}

      {/* Date */}
      <div>
        <label className="block text-xs font-medium uppercase tracking-[0.12em] text-ink-muted mb-1">
          Date
        </label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="input w-full"
        />
      </div>

      {/* Summary */}
      <div>
        <label className="block text-xs font-medium uppercase tracking-[0.12em] text-ink-muted mb-1">
          Summary
        </label>
        <textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          className="input w-full"
          rows={2}
        />
      </div>

      {/* Tags */}
      <div>
        <label className="block text-xs font-medium uppercase tracking-[0.12em] text-ink-muted mb-1">
          Tags (comma-separated)
        </label>
        <input
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className="input w-full"
        />
      </div>

      {/* Content with tabs */}
      <div>
        <div className="flex items-center gap-4 mb-2">
          <label className="text-xs font-medium uppercase tracking-[0.12em] text-ink-muted">
            Content
          </label>
          <div className="flex gap-2 ml-auto">
            <button
              onClick={() => setTab('write')}
              className={`text-xs font-medium px-2 py-1 rounded ${
                tab === 'write'
                  ? 'bg-ink/10 dark:bg-ink-dark/10 text-ink dark:text-ink-dark'
                  : 'text-ink-muted'
              }`}
            >
              Write
            </button>
            <button
              onClick={() => setTab('preview')}
              className={`text-xs font-medium px-2 py-1 rounded ${
                tab === 'preview'
                  ? 'bg-ink/10 dark:bg-ink-dark/10 text-ink dark:text-ink-dark'
                  : 'text-ink-muted'
              }`}
            >
              Preview
            </button>
          </div>
        </div>

        {tab === 'write' ? (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="input w-full font-mono text-sm"
            style={{ minHeight: '400px' }}
          />
        ) : (
          <div
            className="prose border border-border dark:border-border-dark rounded-xl p-4"
            style={{ minHeight: '400px' }}
            dangerouslySetInnerHTML={{
              __html:
                previewHtml ||
                '<p class="text-ink-muted">Nothing to preview</p>',
            }}
          />
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-4 border-t border-border dark:border-border-dark">
        <button
          onClick={handleSave}
          disabled={saving || !title || !summary}
          className="bg-ink dark:bg-ink-dark text-surface dark:text-surface-dark rounded-full px-5 py-2 text-sm font-medium disabled:opacity-50"
        >
          {saving ? 'Saving\u2026' : 'Save'}
        </button>
        <button
          onClick={onClose}
          className="border border-border dark:border-border-dark rounded-full px-5 py-2 text-sm font-medium text-ink-muted"
        >
          Cancel
        </button>

        {!isNew && (
          <>
            <button
              onClick={handleToggleDraft}
              className="ml-auto text-sm font-medium text-ink-muted hover:text-ink dark:hover:text-ink-dark transition-colors"
            >
              {post.draft ? 'Publish' : 'Unpublish'}
            </button>
            <button
              onClick={handleDelete}
              className="text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 transition-colors"
            >
              Delete
            </button>
          </>
        )}
      </div>
    </div>
  );
}
