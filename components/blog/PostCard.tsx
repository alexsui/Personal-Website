import Link from 'next/link';

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
  return (
    <Link href={`/blog/${post.slug}`} className="group block">
      {/* Title + Date */}
      <div className="flex items-baseline gap-3 mb-2">
        <h3 className="text-2xl font-display font-medium text-ink dark:text-ink-dark group-hover:opacity-60 transition-opacity">
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
      </div>

      {/* Summary */}
      <p className="text-sm text-ink-secondary dark:text-ink-dark-secondary leading-relaxed line-clamp-2">
        {post.summary}
      </p>

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {post.tags.map((tag) => (
            <span key={tag} className="tag">
              {tag}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}
