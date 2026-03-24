import PostCard from '@/components/blog/PostCard';
import { getPosts, getAllTags } from '@/lib/db/posts';
import { getSession } from '@/lib/auth';
import AuthGate from '@/components/admin/AuthGate';
import NewPostButton from '@/components/admin/NewPostButton';

export const revalidate = 60;

function getTagFromSearch(searchParams: {
  [key: string]: string | string[] | undefined;
}) {
  const tag = (searchParams?.tag as string | undefined)?.toLowerCase();
  return tag;
}

export default async function BlogIndex({
  searchParams = {} as any,
}: {
  searchParams?: any;
}) {
  const tag = getTagFromSearch(searchParams);

  const session = await getSession();
  const includeDrafts = !!session;

  const [allPosts, tags] = await Promise.all([
    getPosts(includeDrafts),
    getAllTags(),
  ]);

  const posts = allPosts.filter((p) =>
    tag ? (p.tags || []).includes(tag) : true
  );

  return (
    <div className="container py-16 animate-fade-in">
      {/* Page Header */}
      <div className="max-w-3xl mb-12">
        <p className="section-label mb-4">Writing</p>
        <h1 className="text-4xl sm:text-5xl font-display font-medium mb-4 text-ink dark:text-ink-dark">
          Blog
        </h1>
        <p className="text-ink-secondary dark:text-ink-dark-secondary leading-relaxed">
          Thoughts, tutorials, and insights on software development and AI.
        </p>
        <AuthGate>
          <div className="mt-4">
            <NewPostButton />
          </div>
        </AuthGate>
      </div>

      {/* Tag Filter */}
      <div className="mb-10 flex flex-wrap gap-2 items-center">
        <span className="text-xs font-medium uppercase tracking-label text-ink-muted mr-2">
          Filter
        </span>
        <a
          href="/blog"
          className={`px-3 py-1.5 text-sm font-medium rounded-full border transition-all duration-200 ${
            !tag
              ? 'bg-ink dark:bg-ink-dark text-surface dark:text-surface-dark border-ink dark:border-ink-dark'
              : 'text-ink-muted border-border dark:border-border-dark hover:text-ink dark:hover:text-ink-dark hover:border-ink/30 dark:hover:border-ink-dark/30'
          }`}
        >
          All
        </a>
        {tags.map((t) => (
          <a
            key={t}
            href={`/blog?tag=${encodeURIComponent(t)}`}
            className={`px-3 py-1.5 text-sm font-medium rounded-full border transition-all duration-200 ${
              tag === t
                ? 'bg-ink dark:bg-ink-dark text-surface dark:text-surface-dark border-ink dark:border-ink-dark'
                : 'text-ink-muted border-border dark:border-border-dark hover:text-ink dark:hover:text-ink-dark hover:border-ink/30 dark:hover:border-ink-dark/30'
            }`}
          >
            {t}
          </a>
        ))}
      </div>

      {/* Posts */}
      <div className="space-y-0 divide-y divide-border dark:divide-border-dark">
        {posts.map((p) => (
          <div key={p.slug} className="py-8 first:pt-0 last:pb-0">
            <PostCard post={p} />
          </div>
        ))}
      </div>

      {/* Empty State */}
      {posts.length === 0 && (
        <div className="text-center py-16 rounded-2xl border border-border dark:border-border-dark">
          <p className="text-ink-secondary dark:text-ink-dark-secondary">
            No posts found{tag ? ` for tag "${tag}"` : ''}.
          </p>
        </div>
      )}
    </div>
  );
}
