import Image from 'next/image';
import Link from 'next/link';
import { getPostLanguage } from '@/lib/post-language';
import { DbPost } from '@/lib/db/types';

type CollectionPreview = {
  slug: string;
  title: string;
  location: string;
  coverUrl: string;
  dateFormatted: string;
  photoCount: number;
};

type Props = {
  posts: DbPost[];
  collections: CollectionPreview[];
  featuredPhoto?: {
    src: string;
    href: string;
    alt: string;
    title: string;
    caption: string;
    location: string;
  };
};

export default function PreviewList({ posts, collections, featuredPhoto }: Props) {
  return (
    <div className="space-y-20">
      {/* Latest Posts */}
      {posts.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-8">
            <p className="section-label">Latest Posts</p>
            <Link
              href="/blog"
              className="text-sm font-medium text-ink-muted hover:text-ink dark:hover:text-ink-dark transition-colors"
            >
              View all
            </Link>
          </div>
          <div className="space-y-0 divide-y divide-border dark:divide-border-dark">
            {posts.map((p) => (
              <Link key={p.slug} href={`/blog/${p.slug}`} className="group block py-6 first:pt-0 last:pb-0">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-2">
                  <h3 lang={getPostLanguage(p.summary).code} className="font-display text-3xl font-medium text-ink dark:text-ink-dark group-hover:opacity-60 transition-opacity">
                    {p.title}
                  </h3>
                  <time dateTime={p.date} className="text-xs font-medium uppercase tracking-label text-ink-muted whitespace-nowrap">
                    {new Date(p.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                    })}
                  </time>
                  <span className="text-xs text-ink-muted">{getPostLanguage(p.summary).label}</span>
                </div>
                <p lang={getPostLanguage(p.summary).code} className="text-sm text-ink-secondary dark:text-ink-dark-secondary leading-relaxed line-clamp-2">
                  {p.summary}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Gallery Preview */}
      {(featuredPhoto || collections.length > 0) && (
        <>
          {posts.length > 0 && (
            <div className="h-px bg-border dark:bg-border-dark" />
          )}
          <section aria-label="Photography" id="photography" className="scroll-mt-24">
            <div className="flex items-center justify-between mb-8">
              <p className="section-label">Photography</p>
              <Link
                href="/projects"
                className="text-sm font-medium text-ink-muted hover:text-ink dark:hover:text-ink-dark transition-colors"
              >
                View gallery
              </Link>
            </div>
            {featuredPhoto && (
              <figure className="grid grid-cols-1 md:grid-cols-[2fr_3fr] gap-8 md:gap-16 items-center mb-12">
                <Link href={featuredPhoto.href} className="block w-full max-w-sm mx-auto md:mx-0 rounded-xl overflow-hidden focus-ring">
                  <Image
                    src={featuredPhoto.src}
                    alt={featuredPhoto.alt}
                    width={2080}
                    height={3120}
                    sizes="(min-width: 768px) 384px, (min-width: 432px) 384px, calc(100vw - 48px)"
                    className="w-full h-auto"
                  />
                </Link>
                <figcaption className="max-w-sm">
                  <p className="section-label mb-4">{featuredPhoto.location}</p>
                  <h3 className="font-display text-3xl sm:text-4xl font-medium leading-snug text-ink dark:text-ink-dark mb-4">{featuredPhoto.title}</h3>
                  <p className="text-ink-secondary dark:text-ink-dark-secondary leading-relaxed mb-8">{featuredPhoto.caption}</p>
                  <Link href={featuredPhoto.href} className="inline-flex items-center gap-2 text-sm text-accent dark:text-accent-dark underline underline-offset-4 decoration-accent/30">
                    View Tamsui album <span aria-hidden="true">→</span>
                  </Link>
                </figcaption>
              </figure>
            )}
            <div className={`grid grid-cols-1 sm:grid-cols-2 gap-x-10 ${featuredPhoto ? 'border-t border-border dark:border-border-dark pt-6' : ''}`}>
              {collections.map((c) => (
                <Link
                  key={c.slug}
                  href={`/projects/${c.slug}`}
                  className="group flex items-center gap-4 py-4"
                >
                  <div className="overflow-hidden rounded-lg shrink-0">
                    <Image
                      src={c.coverUrl}
                      alt={c.title}
                      width={200}
                      height={200}
                      className="w-16 h-16 object-cover group-hover:opacity-80 transition-opacity duration-300"
                    />
                  </div>
                  <div>
                    <h3 className="font-display text-2xl font-medium text-ink dark:text-ink-dark group-hover:opacity-60 transition-opacity">
                      {c.title}
                    </h3>
                    <p className="text-xs font-medium uppercase tracking-label text-ink-muted mt-1">
                      {c.location} · {c.photoCount} photos
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
