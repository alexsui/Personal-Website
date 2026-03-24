import { getCollections } from '@/lib/db/collections';
import { getPhotosByCollection, getMomentPhotos, getPhotoUrl } from '@/lib/db/photos';
import { formatCollectionDate } from '@/lib/content';
import GalleryTabs from '@/components/ui/GalleryTabs';

export const revalidate = 60;

export default async function GalleryPage() {
  const dbCollections = await getCollections();
  const dbMoments = await getMomentPhotos();

  const collections = await Promise.all(
    dbCollections.map(async (c) => {
      const photos = await getPhotosByCollection(c.id);
      const coverPhoto = photos[0];
      return {
        slug: c.slug,
        title: c.title,
        date: c.date,
        endDate: c.end_date ?? undefined,
        dateFormatted: formatCollectionDate(c.date, c.end_date ?? undefined),
        location: c.location,
        description: c.description,
        coverUrl: coverPhoto ? getPhotoUrl(coverPhoto) : '',
        photoCount: photos.length,
      };
    })
  );

  const moments = dbMoments.map((p) => ({
    id: p.id,
    url: getPhotoUrl(p),
  }));

  return (
    <div className="container py-16 animate-fade-in">
      {/* Page Header */}
      <div className="max-w-3xl mb-12">
        <p className="section-label mb-4">Gallery</p>
        <h1 className="text-4xl sm:text-5xl font-display font-medium mb-4 text-ink dark:text-ink-dark">
          Photography
        </h1>
        <p className="text-ink-secondary dark:text-ink-dark-secondary leading-relaxed">
          Capturing natural scenery, street life, and people — finding beauty in everyday moments.
        </p>
      </div>

      <GalleryTabs collections={collections} moments={moments} />
    </div>
  );
}
