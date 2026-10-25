import PostCard from '@/components/blog/PostCard';
import { getPosts } from '@/lib/db/posts';
import { blogCategories, getPostCategory } from '@/lib/blog-categories';
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
  const category = blogCategories.find((item) => item.id === searchParams.category);
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
          記錄推薦系統、工程實作，以及工作中慢慢想清楚的事情。
        </p>
        <AuthGate>
          <div className="mt-4">
            <NewPostButton />
          </div>
        </AuthGate>
      </div>

      <nav aria-label="文章分類" className="mb-10 flex flex-wrap gap-2 items-center">
        <Link
          href="/blog"
          aria-current={!category && !tag ? 'page' : undefined}
          className={`px-3 py-1.5 text-sm font-medium rounded-full border transition-all duration-200 ${
            !category && !tag
              ? 'bg-accent dark:bg-accent-dark text-white dark:text-surface-dark border-accent dark:border-accent-dark'
              : 'text-ink-muted border-border dark:border-border-dark hover:text-ink dark:hover:text-ink-dark hover:border-ink/30 dark:hover:border-ink-dark/30'
          }`}
        >
          全部
        </Link>
        {blogCategories.map((item) => (
          <Link
            key={item.id}
            href={`/blog?category=${item.id}`}
            aria-current={category?.id === item.id ? 'page' : undefined}
            className={`px-3 py-1.5 text-sm font-medium rounded-full border transition-all duration-200 ${
              category?.id === item.id
                ? 'bg-accent dark:bg-accent-dark text-white dark:text-surface-dark border-accent dark:border-accent-dark'
                : 'text-ink-muted border-border dark:border-border-dark hover:text-ink dark:hover:text-ink-dark hover:border-ink/30 dark:hover:border-ink-dark/30'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {!category && !tag && featured.length > 0 && (
        <section aria-label="精選研究" className="mb-12 border-l-2 border-accent/50 dark:border-accent-dark/50 pl-5">
          <h2 className="font-sans text-xs font-semibold tracking-wide text-accent dark:text-accent-dark mb-3">精選研究</h2>
          <div className="space-y-4">
            {featured.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="group block">
                <h3 className="font-display text-xl sm:text-2xl text-ink dark:text-ink-dark group-hover:text-accent dark:group-hover:text-accent-dark transition-colors">{post.title}</h3>
                <p className="mt-1 text-xs text-ink-muted">{new Date(post.date).getUTCFullYear()} · {getPostCategory(post.tags ?? [])?.label ?? 'Research'}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="flex items-baseline gap-3 mb-6">
        <h2 className="font-sans text-sm font-semibold text-ink dark:text-ink-dark">{category?.label ?? (tag ? `標籤：${tag}` : '所有文章')}</h2>
        <span className="text-xs text-ink-muted">{posts.length} 篇 · 由新到舊</span>
        {tag && <Link href="/blog" className="text-xs underline underline-offset-4 text-accent dark:text-accent-dark">清除篩選</Link>}
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
            這個分類目前還沒有文章。
          </p>
        </div>
      )}
    </div>
  );
}
