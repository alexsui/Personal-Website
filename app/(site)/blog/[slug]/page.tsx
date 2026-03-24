import { getPostBySlug, getAllPostSlugs } from '@/lib/db/posts';
import { getSession } from '@/lib/auth';
import { mdToHtml } from '@/lib/markdown';
import Link from 'next/link';
import EditPostButton from '@/components/admin/EditPostButton';

export const revalidate = 60;
export const dynamicParams = true;

export async function generateStaticParams() {
  const slugs = await getAllPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

type Props = { params: { slug: string } };

export default async function PostPage({ params }: Props) {
  const session = await getSession();
  const includeDrafts = !!session;

  const post = await getPostBySlug(params.slug, includeDrafts);

  if (!post)
    return (
      <div className="container py-16 text-center">
        <h1 className="text-2xl font-display font-medium text-ink dark:text-ink-dark mb-4">
          Post not found
        </h1>
        <Link
          href="/blog"
          className="text-ink-muted hover:text-ink dark:hover:text-ink-dark transition-colors"
        >
          Back to blog
        </Link>
      </div>
    );

  const html = await mdToHtml(post.content);

  return (
    <div className="container py-16 animate-fade-in">
      <article className="max-w-3xl mx-auto">
        {/* Back link */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm font-medium text-ink-muted hover:text-ink dark:hover:text-ink-dark transition-colors mb-10"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to blog
        </Link>

        {/* Article header */}
        <header className="mb-12">
          <p className="section-label mb-4">
            <time dateTime={post.date}>
              {new Date(post.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
          </p>
          <div className="flex items-start gap-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-medium text-ink dark:text-ink-dark mb-5 leading-[1.1]">
              {post.title}
            </h1>
            <EditPostButton post={post} />
          </div>
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag: string) => (
                <Link
                  key={tag}
                  href={`/blog?tag=${encodeURIComponent(tag)}`}
                  className="tag"
                >
                  {tag}
                </Link>
              ))}
            </div>
          )}
        </header>

        {/* Divider */}
        <div className="h-px bg-border dark:bg-border-dark mb-10" />

        {/* Article content */}
        <div
          className="prose"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </article>
    </div>
  );
}
