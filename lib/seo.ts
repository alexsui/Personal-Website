import type { Metadata } from 'next';
import type { DbProfile } from '@/lib/db/types';

export const SITE_URL = 'https://samueltoh.dev';
export const PROFESSIONAL_FOCUS = 'Recommendation Systems & AI Agents';
export const PERSON_ID = `${SITE_URL}/about#person`;

export function createPersonStructuredData(profile: DbProfile | null) {
  return {
    '@type': 'Person',
    '@id': PERSON_ID,
    name: profile?.name ?? 'Samuel Toh',
    alternateName: profile?.chinese_name ?? '杜得人',
    url: `${SITE_URL}/about`,
    image: new URL(profile?.photo_url ?? '/images/profile.jpg', SITE_URL).toString(),
    jobTitle: 'Machine Learning Engineer',
    knowsAbout: ['Recommendation systems', 'Ads ranking', 'AI agents', 'Retrieval-augmented generation', 'LLM evaluation'],
    sameAs: [profile?.social?.github, profile?.social?.linkedin].filter(Boolean) as string[],
  };
}

export function pageTitle(base: string, suffix = 'Samuel Toh') {
  return `${base} · ${suffix}`;
}

export function createPageMetadata({
  title,
  description,
  path,
  image = '/images/profile.jpg',
  locale = 'en_US',
  article,
}: {
  title: string;
  description: string;
  path: string;
  image?: string;
  locale?: string;
  article?: { publishedTime: string; modifiedTime: string };
}): Metadata {
  const fullTitle = pageTitle(title);
  const url = new URL(path, SITE_URL).toString();
  const images = [{ url: image, alt: title }];

  return {
    title: fullTitle,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: 'Samuel Toh · 杜得人',
      locale,
      images,
      ...(article
        ? { type: 'article' as const, ...article, authors: ['Samuel Toh'] }
        : { type: 'website' as const }),
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images,
    },
  };
}
