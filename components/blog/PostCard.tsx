import Link from 'next/link';
import PostDate from '@/components/blog/PostDate';
import { getPostLanguage } from '@/lib/post-language';

export default function PostCard({
  post,
}: {
  post: {
    slug: string;
    title: string;
    date: string;
    summary: string;
    draft?: boolean;
  };
}) {
  const language = getPostLanguage(post.summary);
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
      <PostDate date={post.date} className="mt-1 mb-2 block text-xs font-medium uppercase tracking-label text-ink-muted" />

      {/* Summary */}
      <p lang={language.code} className="text-sm text-ink-secondary dark:text-ink-dark-secondary leading-relaxed line-clamp-2">
        {post.summary}
      </p>

    </Link>
  );
}
