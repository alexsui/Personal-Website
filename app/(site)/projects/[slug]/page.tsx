import { getCollectionBySlug, getAllCollectionSlugs } from '@/lib/db/collections';
import { getPhotosByCollection, getPhotoUrl } from '@/lib/db/photos';
import { formatCollectionDate } from '@/lib/content';
import Image from 'next/image';
import Link from 'next/link';

export const revalidate = 60;
export const dynamicParams = true;

type Props = { params: { slug: string } };

export default async function CollectionPage({ params }: Props) {
  const collection = await getCollectionBySlug(params.slug);

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

  const photos = await getPhotosByCollection(collection.id);
  const photoUrls = photos.map((p) => ({
    id: p.id,
    url: getPhotoUrl(p),
  }));

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
          <time>{formatCollectionDate(collection.date, collection.end_date ?? undefined)}</time>
          <span className="w-1 h-1 rounded-full bg-ink-muted" />
          <span>{photoUrls.length} photos</span>
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
        {photoUrls.map((photo) => (
          <div
            key={photo.id}
            className="break-inside-avoid overflow-hidden rounded-xl"
          >
            <Image
              src={photo.url}
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

export async function generateStaticParams() {
  const slugs = await getAllCollectionSlugs();
  return slugs.map((slug) => ({ slug }));
}
