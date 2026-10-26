import Hero from '@/components/layout/Hero';
import PreviewList from '@/components/blog/PreviewList';
import { getPosts } from '@/lib/db/posts';
import { getCollections } from '@/lib/db/collections';
import { getPhotosByCollection, getPhotoUrl, getCollectionPhotoCount, getPhotoById } from '@/lib/db/photos';
import { getProfile } from '@/lib/db/profile';
import { formatCollectionDate } from '@/lib/content';
import type { Metadata } from 'next';

export const revalidate = 60;

export const metadata: Metadata = {
  alternates: { canonical: '/' },
};

export default async function HomePage() {
  const [posts, collections, profile, selectedPhoto] = await Promise.all([
    getPosts(),
    getCollections(),
    getProfile(),
    getPhotoById('61855eb8-95e2-43a6-b894-e9fabb402d96'),
  ]);

  const latestPosts = posts.slice(0, 2);
  const selectedCollection = collections.find((collection) => collection.id === selectedPhoto?.collection_id);
  const featuredPhoto = selectedPhoto && selectedCollection ? {
    src: getPhotoUrl(selectedPhoto),
    href: `/projects/${selectedCollection.slug}`,
    alt: 'A bridge over the Tamsui River at sunset, with a moored boat in the foreground',
    title: 'An evening in Tamsui',
    caption: 'A bridge, a boat, and the last light on the river.',
    location: selectedCollection.location,
  } : undefined;
  const previewCollections = collections.filter((collection) => collection.id !== selectedCollection?.id).slice(0, 2);

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
    bio: 'My background is in recommendation systems research. I later worked on AI agents for legal research and document review. I’m now a Machine Learning Engineer at momo, working on candidate retrieval and ads ranking.\n\nI write about what I’m working on, what I’m learning, and the questions I’m still figuring out.\n\nOutside of work, I take photos of landscapes, streets, and people.',
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
        <PreviewList posts={latestPosts} collections={collectionPreviews} featuredPhoto={featuredPhoto} />
      </section>
    </>
  );
}
