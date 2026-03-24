import { getCollectionBySlug, getAllCollections, formatCollectionDate } from '@/lib/content';
import Image from 'next/image';
import Link from 'next/link';

type Props = { params: { slug: string } };

export default function CollectionPage({ params }: Props) {
  const collection = getCollectionBySlug(params.slug);

  if (!collection)
    return (
      <div className="container py-16 text-center">
        <h1 className="text-2xl font-display font-medium text-ink dark:text-ink-dark mb-4">
          Collection not found
        </h1>
        <Link
          href="/projects"
          className="text-ink-muted hover:text-ink dark:hover:text-ink-dark transition-colors"
        >
          Back to gallery
        </Link>
      </div>
    );

  return (
    <div className="container py-16 animate-fade-in">
      {/* Back link */}
      <Link
        href="/projects"
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
        Back to gallery
      </Link>

      {/* Header */}
      <div className="max-w-3xl mb-12">
        <div className="flex items-center gap-3 text-xs font-medium uppercase tracking-label text-ink-muted mb-4">
          <span>{collection.location}</span>
          <span className="w-1 h-1 rounded-full bg-ink-muted" />
          <time>{formatCollectionDate(collection.date, collection.endDate)}</time>
          <span className="w-1 h-1 rounded-full bg-ink-muted" />
          <span>{collection.photos.length} photos</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-display font-medium mb-4 text-ink dark:text-ink-dark">
          {collection.title}
        </h1>
        {collection.description && (
          <p className="text-ink-secondary dark:text-ink-dark-secondary leading-relaxed">
            {collection.description}
          </p>
        )}
      </div>

      <div className="h-px bg-border dark:bg-border-dark mb-10" />

      {/* Photo grid — masonry */}
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
        {collection.photos.map((photo) => (
          <div
            key={photo}
            className="break-inside-avoid overflow-hidden rounded-xl"
          >
            <Image
              src={`/images/gallery/${collection.slug}/${photo}`}
              alt={collection.title}
              width={800}
              height={600}
              className="w-full h-auto object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export function generateStaticParams() {
  return getAllCollections().map((c) => ({ slug: c.slug }));
}
