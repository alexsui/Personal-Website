import { getPostBySlug, getAllPostSlugs } from '@/lib/db/posts';
import { getPostLanguage } from '@/lib/post-language';
import { getPostCategory } from '@/lib/blog-categories';
import { getSession } from '@/lib/auth';
import { mdToHtml } from '@/lib/markdown';
import Link from 'next/link';
import EditPostButton from '@/components/admin/EditPostButton';
import { createPageMetadata } from '@/lib/seo';
import type { Metadata } from 'next';

export const revalidate = 60;
export const dynamicParams = true;

export async function generateStaticParams() {
  const slugs = await getAllPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPostBySlug(params.slug);
  if (!post) return { title: 'Post not found', robots: { index: false, follow: false } };

  return createPageMetadata({
    title: post.title,
    description: post.summary,
    path: `/blog/${post.slug}`,
    image: post.cover_url ?? undefined,
    locale: getPostLanguage(post.content).code === 'zh-Hant' ? 'zh_TW' : 'en_US',
    article: { publishedTime: post.date, modifiedTime: post.updated_at },
  });
}

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

  const language = getPostLanguage(post.content);
  const html = await mdToHtml(post.content);
  const category = getPostCategory(post.tags ?? []);

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
          <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-4">
            <time dateTime={post.date} className="section-label">
              {new Date(post.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
          </p>
          <div className="flex items-start gap-3">
            <h1 lang={getPostLanguage(post.title).code} className="text-3xl sm:text-4xl lg:text-5xl font-display font-medium text-ink dark:text-ink-dark mb-5 leading-[1.1]">
              {post.title}
            </h1>
            {post.draft && (
              <span className="mt-2 text-xs font-medium uppercase tracking-wider bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2.5 py-1 rounded-full whitespace-nowrap shrink-0">
                Draft
              </span>
            )}
            <EditPostButton post={post} />
          </div>
          {category && (
            <Link
              href={`/blog?category=${category.id}`}
              className="inline-flex py-1 text-sm text-ink-muted underline underline-offset-4 decoration-border dark:decoration-border-dark hover:text-ink dark:hover:text-ink-dark transition-colors"
            >
              {category.label}
            </Link>
          )}
        </header>

        {/* Divider */}
        <div className="h-px bg-border dark:bg-border-dark mb-10" />

        {/* Article content */}
        <div
          lang={language.code}
          className="prose"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </article>
    </div>
  );
}
