import type { MetadataRoute } from 'next';
import { getPosts } from '@/lib/db/posts';
import { getCollections } from '@/lib/db/collections';
import { getProfile } from '@/lib/db/profile';
import { SITE_URL } from '@/lib/seo';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, collections, profile] = await Promise.all([
    getPosts().catch(() => []),
    getCollections().catch(() => []),
    getProfile().catch(() => null),
  ]);

  const latestPostDate = posts[0]?.updated_at ? new Date(posts[0].updated_at) : new Date();
  const latestCollectionDate = collections[0]?.updated_at ? new Date(collections[0].updated_at) : new Date();
  const profileDate = profile?.updated_at ? new Date(profile.updated_at) : new Date();
  const homeLastMod = new Date(Math.max(profileDate.getTime(), latestPostDate.getTime(), latestCollectionDate.getTime()));

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: homeLastMod, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/about`, lastModified: profileDate, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE_URL}/blog`, lastModified: latestPostDate, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/projects`, lastModified: latestCollectionDate, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/contact`, lastModified: profileDate, changeFrequency: 'monthly', priority: 0.5 },
  ];

  const postRoutes: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${SITE_URL}/blog/${p.slug}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  const collectionRoutes: MetadataRoute.Sitemap = collections.map((c) => ({
    url: `${SITE_URL}/projects/${c.slug}`,
    lastModified: c.updated_at ? new Date(c.updated_at) : new Date(),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  return [...staticRoutes, ...postRoutes, ...collectionRoutes];
}
