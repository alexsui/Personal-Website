import { getAllCollections, formatCollectionDate } from '@/lib/content';
import GalleryTabs from '@/components/ui/GalleryTabs';
import fs from 'fs';
import path from 'path';

function getMoments() {
  const dir = path.join(process.cwd(), 'public/images/gallery/moments');
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => /\.(jpg|jpeg|png|webp)$/i.test(f))
    .sort()
    .map((filename) => `/images/gallery/moments/${filename}`);
}

export default function GalleryPage() {
  const collections = getAllCollections();
  const moments = getMoments();

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

      <GalleryTabs
        collections={collections.map((c) => ({
          ...c,
          dateFormatted: formatCollectionDate(c.date, c.endDate),
        }))}
        moments={moments}
      />
    </div>
  );
}
