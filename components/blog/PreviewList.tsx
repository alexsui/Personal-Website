import { getLatestPosts, getAllCollections } from '@/lib/content';
import Image from 'next/image';
import Link from 'next/link';

export default function PreviewList() {
  const posts = getLatestPosts(2);
  const collections = getAllCollections().slice(0, 2);

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
                <div className="flex items-baseline gap-3 mb-2">
                  <h3 className="font-display text-3xl font-medium text-ink dark:text-ink-dark group-hover:opacity-60 transition-opacity">
                    {p.title}
                  </h3>
                  <time className="text-xs font-medium uppercase tracking-label text-ink-muted whitespace-nowrap">
                    {new Date(p.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                    })}
                  </time>
                </div>
                <p className="text-sm text-ink-secondary dark:text-ink-dark-secondary leading-relaxed line-clamp-2">
                  {p.summary}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Gallery Preview */}
      {collections.length > 0 && (
        <>
          {posts.length > 0 && (
            <div className="h-px bg-border dark:bg-border-dark" />
          )}
          <div>
            <div className="flex items-center justify-between mb-8">
              <p className="section-label">Photography</p>
              <Link
                href="/projects"
                className="text-sm font-medium text-ink-muted hover:text-ink dark:hover:text-ink-dark transition-colors"
              >
                View gallery
              </Link>
            </div>
            <div className="space-y-0 divide-y divide-border dark:divide-border-dark">
              {collections.map((c) => (
                <Link
                  key={c.slug}
                  href={`/projects/${c.slug}`}
                  className="group flex items-center gap-5 py-6 first:pt-0 last:pb-0"
                >
                  <div className="overflow-hidden rounded-lg shrink-0">
                    <Image
                      src={`/images/gallery/${c.slug}/${c.cover}`}
                      alt={c.title}
                      width={200}
                      height={200}
                      className="w-20 h-20 object-cover group-hover:opacity-80 transition-opacity duration-300"
                    />
                  </div>
                  <div>
                    <h3 className="font-display text-2xl font-medium text-ink dark:text-ink-dark group-hover:opacity-60 transition-opacity">
                      {c.title}
                    </h3>
                    <p className="text-xs font-medium uppercase tracking-label text-ink-muted mt-1">
                      {c.location} · {c.photos.length} photos
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
