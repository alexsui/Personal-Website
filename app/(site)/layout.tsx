import '../globals.css';
import ClientLayout from '@/components/providers/ClientLayout';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { getProfile } from '@/lib/db/profile';
import { SITE_URL } from '@/lib/seo';
import type { Metadata } from 'next';
import { ReactNode } from 'react';

export async function generateMetadata(): Promise<Metadata> {
  const profile = await getProfile().catch(() => null);
  const englishName = profile?.name ?? 'Samuel Toh';
  const chineseName = profile?.chinese_name ?? '杜得人';
  const bio = profile?.bio ?? 'Dedicated to building AI products that make life easier.';
  const title = `${englishName} · ${chineseName} — Personal Website`;
  const description = `Personal website of ${englishName} (${chineseName}). ${bio}`;

  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    keywords: [englishName, chineseName, 'Samuel Toh', '杜得人', 'portfolio', 'blog', 'AI'],
    openGraph: {
      type: 'profile',
      url: SITE_URL,
      title,
      description,
      siteName: `${englishName} · ${chineseName}`,
      images: [{ url: '/images/profile.jpg', width: 512, height: 512, alt: `${englishName} · ${chineseName}` }],
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/images/profile.jpg'],
    },
    robots: { index: true, follow: true },
  };
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const profile = await getProfile().catch(() => null);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile?.name ?? 'Samuel Toh',
    alternateName: profile?.chinese_name ?? '杜得人',
    url: SITE_URL,
    image: `${SITE_URL}/images/profile.jpg`,
    sameAs: [profile?.social?.github, profile?.social?.linkedin].filter(Boolean) as string[],
  };
  const jsonLdString = JSON.stringify(jsonLd).replace(/</g, '\\u003c');

  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <ClientLayout>
          <Header />
          <main className="flex-1 container py-8">{children}</main>
          <Footer />
        </ClientLayout>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString }} />
      </body>
    </html>
  );
}
