import type { Metadata } from 'next';

export const SITE_URL = 'https://samueltoh.dev';

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
