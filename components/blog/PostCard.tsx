import Link from 'next/link';
import { getPostLanguage } from '@/lib/post-language';
import { getPostCategory } from '@/lib/blog-categories';

export default function PostCard({
  post,
}: {
  post: {
    slug: string;
    title: string;
    date: string;
    summary: string;
    tags?: string[];
    draft?: boolean;
  };
}) {
  const language = getPostLanguage(post.summary);
  const category = getPostCategory(post.tags ?? []);
  return (
    <Link href={`/blog/${post.slug}`} className="group block">
      {/* Title + Date */}
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-2">
        <h3 lang={language.code} className="text-2xl font-display font-medium text-ink dark:text-ink-dark group-hover:opacity-60 transition-opacity">
          {post.title}
        </h3>
        {post.draft && (
          <span className="text-[10px] font-medium uppercase tracking-wider bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full whitespace-nowrap">
            Draft
          </span>
        )}
        <time
          dateTime={post.date}
          className="text-xs font-medium uppercase tracking-label text-ink-muted whitespace-nowrap"
        >
          {new Date(post.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
          })}
        </time>
        <span className="text-xs text-ink-muted">{language.label}</span>
      </div>

      {/* Summary */}
      <p lang={language.code} className="text-sm text-ink-secondary dark:text-ink-dark-secondary leading-relaxed line-clamp-2">
        {post.summary}
      </p>

      {/* Topic */}
      {category && (
        <p className="mt-3 text-xs text-ink-muted dark:text-ink-dark-secondary">
          {category.label}
        </p>
      )}
    </Link>
  );
}
