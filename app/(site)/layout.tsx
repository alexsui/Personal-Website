import '../globals.css';
import ClientLayout from '@/components/providers/ClientLayout';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { getProfile } from '@/lib/db/profile';
import { SITE_URL, PROFESSIONAL_FOCUS, createPersonStructuredData } from '@/lib/seo';
import StructuredData from '@/components/StructuredData';
import type { Metadata } from 'next';
import { ReactNode } from 'react';

export async function generateMetadata(): Promise<Metadata> {
  const profile = await getProfile().catch(() => null);
  const englishName = profile?.name ?? 'Samuel Toh';
  const chineseName = profile?.chinese_name ?? '杜得人';
  const title = `${englishName} ${chineseName} | ${PROFESSIONAL_FOCUS}`;
  const description = `${englishName} (${chineseName}), Machine Learning Engineer working on recommendation systems and AI agents. Notes on ads ranking, retrieval, RAG, and LLM evaluation.`;

  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    openGraph: {
      type: 'website',
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
  const jsonLd = { '@context': 'https://schema.org', ...createPersonStructuredData(profile) };

  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <ClientLayout>
          <Header />
          <main className="flex-1 container py-8">{children}</main>
          <Footer />
        </ClientLayout>
        <StructuredData data={jsonLd} />
      </body>
    </html>
  );
}
