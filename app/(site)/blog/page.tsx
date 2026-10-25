import PostCard from '@/components/blog/PostCard';
import { getPosts } from '@/lib/db/posts';
import { getPostLanguage } from '@/lib/post-language';
import { blogCategories, getBlogCategory, getPostCategory } from '@/lib/blog-categories';
import Link from 'next/link';
import { getSession } from '@/lib/auth';
import AuthGate from '@/components/admin/AuthGate';
import NewPostButton from '@/components/admin/NewPostButton';
import EditPostButton from '@/components/admin/EditPostButton';

export const revalidate = 60;

export default async function BlogIndex({
  searchParams = {},
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const category = getBlogCategory(searchParams.category);
  // Keep existing links from article tags working.
  const tag = !category && typeof searchParams.tag === 'string'
    ? searchParams.tag.toLowerCase()
    : undefined;

  const session = await getSession();
  const includeDrafts = !!session;

  const allPosts = await getPosts(includeDrafts);
  const posts = allPosts.filter((post) => category
    ? getPostCategory(post.tags ?? [])?.id === category.id
    : tag ? (post.tags ?? []).includes(tag) : true);
  const featured = allPosts.filter((post) => (post.tags ?? []).includes('featured'));

  return (
    <div className="container py-16 animate-fade-in">
      {/* Page Header */}
      <div className="max-w-3xl mb-12">
        <p className="section-label mb-4">Writing</p>
        <h1 className="text-4xl sm:text-5xl font-display font-medium mb-4 text-ink dark:text-ink-dark">
          Blog
        </h1>
        <p className="text-ink-secondary dark:text-ink-dark-secondary leading-relaxed">
          Notes from work, written mostly in Traditional Chinese.
        </p>
        <AuthGate>
          <div className="mt-4">
            <NewPostButton />
          </div>
        </AuthGate>
      </div>

      <nav aria-label="Post categories" className="mb-10 flex flex-wrap gap-x-6 sm:gap-x-7 gap-y-1 items-center border-b border-border dark:border-border-dark">
        {/* Use a document navigation when clearing query filters to avoid stale router results. */}
        <a
          href="/blog"
          aria-current={!category && !tag ? 'page' : undefined}
          className={`-mb-px py-3 text-sm whitespace-nowrap border-b transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current ${
            !category && !tag
              ? 'font-medium text-ink dark:text-ink-dark border-ink dark:border-ink-dark'
              : 'text-ink-muted border-transparent hover:text-ink dark:hover:text-ink-dark hover:border-ink/30 dark:hover:border-ink-dark/30'
          }`}
        >
          All
        </a>
        {blogCategories.map((item) => (
          <Link
            key={item.id}
            href={`/blog?category=${item.id}`}
            aria-current={category?.id === item.id ? 'page' : undefined}
            className={`-mb-px py-3 text-sm whitespace-nowrap border-b transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current ${
              category?.id === item.id
                ? 'font-medium text-ink dark:text-ink-dark border-ink dark:border-ink-dark'
                : 'text-ink-muted border-transparent hover:text-ink dark:hover:text-ink-dark hover:border-ink/30 dark:hover:border-ink-dark/30'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {!category && !tag && featured.length > 0 && (
        <section aria-label="Featured research" className="mb-12 border-l border-border dark:border-border-dark pl-5">
          <h2 className="font-sans text-xs font-medium tracking-wide text-ink-muted mb-3">Featured research</h2>
          <div className="space-y-4">
            {featured.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="group block">
                <h3 lang={getPostLanguage(post.summary).code} className="font-display text-xl sm:text-2xl text-ink dark:text-ink-dark group-hover:underline underline-offset-4 decoration-border dark:decoration-border-dark">{post.title}</h3>
                <p className="mt-1 text-xs text-ink-muted">{new Date(post.date).getUTCFullYear()} · {getPostCategory(post.tags ?? [])?.label ?? 'Research'}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-6">
        <h2 className="font-sans text-sm font-semibold text-ink dark:text-ink-dark">{category?.label ?? (tag ? `Tag: ${tag}` : 'All posts')}</h2>
        {tag && <a href="/blog" className="text-xs underline underline-offset-4 text-ink-secondary dark:text-ink-dark-secondary">Clear filter</a>}
      </div>

      {/* Posts */}
      <div className="space-y-0 divide-y divide-border dark:divide-border-dark">
        {posts.map((p) => (
          <div key={p.slug} className="py-8 first:pt-0 last:pb-0 flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <PostCard post={p} />
            </div>
            <EditPostButton post={p} />
          </div>
        ))}
      </div>

      {/* Empty State */}
      {posts.length === 0 && (
        <div className="text-center py-16 rounded-2xl border border-border dark:border-border-dark">
          <p className="text-ink-secondary dark:text-ink-dark-secondary">
            No posts in this category yet.
          </p>
        </div>
      )}
    </div>
  );
}
