import Hero from '@/components/layout/Hero';
import PreviewList from '@/components/blog/PreviewList';
import { getPosts } from '@/lib/db/posts';
import { getCollections } from '@/lib/db/collections';
import { getPhotosByCollection, getPhotoUrl, getCollectionPhotoCount } from '@/lib/db/photos';
import { getProfile } from '@/lib/db/profile';
import { formatCollectionDate } from '@/lib/content';
import type { Metadata } from 'next';

export const revalidate = 60;

export const metadata: Metadata = {
  alternates: { canonical: '/' },
};

export default async function HomePage() {
  const [posts, collections, profile] = await Promise.all([
    getPosts(),
    getCollections(),
    getProfile(),
  ]);

  const latestPosts = posts.slice(0, 2);
  const previewCollections = collections.slice(0, 2);

  // Resolve cover URLs and photo counts for each collection
  const collectionPreviews = await Promise.all(
    previewCollections.map(async (c) => {
      const [photos, photoCount] = await Promise.all([
        getPhotosByCollection(c.id),
        getCollectionPhotoCount(c.id),
      ]);

      // Use the cover photo if set, otherwise use the first photo
      const coverPhoto = c.cover_photo_id
        ? photos.find((p) => p.id === c.cover_photo_id) ?? photos[0]
        : photos[0];

      const coverUrl = coverPhoto
        ? getPhotoUrl(coverPhoto)
        : '/images/placeholder.jpg';

      return {
        slug: c.slug,
        title: c.title,
        location: c.location,
        coverUrl,
        dateFormatted: formatCollectionDate(c.date, c.end_date ?? undefined),
        photoCount,
      };
    })
  );

  // Use a fallback profile if none exists in the DB yet
  const defaultProfile = {
    id: '',
    name: 'Samuel Toh',
    chinese_name: '杜得人',
    bio: 'Dedicated to building AI products that make life easier.',
    photo_url: '/images/profile.jpg',
    email: '',
    social: {},
    cta: { label: 'About me', href: '/about' },
    highlights: [],
    updated_at: '',
  };

  return (
    <>
      <Hero profile={profile ?? defaultProfile} />
      <div className="h-px bg-border dark:bg-border-dark" />
      <section className="container py-20">
        <PreviewList posts={latestPosts} collections={collectionPreviews} />
      </section>
    </>
  );
}
