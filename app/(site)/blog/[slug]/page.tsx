import { getPostBySlug } from '@/lib/content';
import { mdToHtml } from '@/lib/markdown';
import Link from 'next/link';

type Props = { params: { slug: string } };

export default async function PostPage({ params }: Props) {
  const record = getPostBySlug(params.slug);
  if (!record)
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

  const html = await mdToHtml(record.content);

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
            <time dateTime={record.meta.date}>
              {new Date(record.meta.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-medium text-ink dark:text-ink-dark mb-5 leading-[1.1]">
            {record.meta.title}
          </h1>
          {record.meta.tags && record.meta.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {record.meta.tags.map((tag: string) => (
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
