import { getCollections } from '@/lib/db/collections';
import { getPhotosByCollection, getMomentPhotos, getPhotoUrl } from '@/lib/db/photos';
import { formatCollectionDate } from '@/lib/content';
import GalleryTabs from '@/components/ui/GalleryTabs';
import AuthGate from '@/components/admin/AuthGate';
import NewCollectionButton from '@/components/admin/NewCollectionButton';

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
    storagePath: p.storage_path,
  }));

  return (
    <div className="container py-16 animate-fade-in">
      {/* Page Header */}
      <div className="max-w-3xl mb-12">
        <div className="flex items-center gap-4 mb-4">
          <p className="section-label">Gallery</p>
          <AuthGate>
            <NewCollectionButton />
          </AuthGate>
        </div>
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
