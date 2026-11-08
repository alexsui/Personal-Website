import Link from 'next/link';
import { getPostLanguage } from '@/lib/post-language';
import { getPostCategory, getTopicTags, type BlogCategory } from '@/lib/blog-categories';

export default function PostCard({
  post,
  activeCategory,
  activeTag,
}: {
  activeCategory?: BlogCategory;
  activeTag?: string;
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
  const tags = getTopicTags(post.tags ?? []).filter(tag =>
    tag !== activeTag && (!activeCategory || getPostCategory([tag])?.id !== activeCategory.id)
  );
  return (
    <Link href={`/blog/${post.slug}`} className="group block">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h3 lang={language.code} className="text-2xl font-display font-medium text-ink dark:text-ink-dark group-hover:opacity-60 transition-opacity">
          {post.title}
        </h3>
        {post.draft && (
          <span className="text-[10px] font-medium uppercase tracking-wider bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full whitespace-nowrap">
            Draft
          </span>
        )}
      </div>
      <div className="mt-1 mb-2 flex flex-wrap items-baseline gap-x-2 gap-y-1 text-[0.8125rem] text-ink-muted">
        <time
          dateTime={post.date}
          className="text-xs font-medium uppercase tracking-label text-ink-muted whitespace-nowrap"
        >
          {new Date(post.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            timeZone: 'UTC',
          })}
        </time>
        {tags.map(tag => (
          <span key={tag} className="min-w-0 max-w-full break-words">
            <span aria-hidden="true">· </span>{tag}
          </span>
        ))}
      </div>

      {/* Summary */}
      <p lang={language.code} className="text-sm text-ink-secondary dark:text-ink-dark-secondary leading-relaxed line-clamp-2">
        {post.summary}
      </p>

    </Link>
  );
}
