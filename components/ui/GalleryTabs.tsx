'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import AuthGate from '@/components/admin/AuthGate';
import MomentUploader from '@/components/admin/MomentUploader';

type Collection = {
  slug: string;
  title: string;
  date: string;
  endDate?: string;
  dateFormatted: string;
  location: string;
  description: string;
  coverUrl: string;
  photoCount: number;
};

type Props = {
  collections: Collection[];
  moments: Array<{ id: string; url: string }>;
};

export default function GalleryTabs({ collections, moments }: Props) {
  const [tab, setTab] = useState<'stories' | 'moments'>('stories');

  return (
    <>
      {/* Tabs */}
      <div className="flex items-center gap-6 mb-10">
        <button
          onClick={() => setTab('stories')}
          className={`text-sm font-medium transition-colors ${
            tab === 'stories'
              ? 'text-ink dark:text-ink-dark'
              : 'text-ink-muted hover:text-ink dark:hover:text-ink-dark'
          }`}
        >
          Stories
        </button>
        <span className="w-1 h-1 rounded-full bg-ink-muted" />
        <button
          onClick={() => setTab('moments')}
          className={`text-sm font-medium transition-colors ${
            tab === 'moments'
              ? 'text-ink dark:text-ink-dark'
              : 'text-ink-muted hover:text-ink dark:hover:text-ink-dark'
          }`}
        >
          Moments
        </button>
      </div>

      {/* Stories tab */}
      {tab === 'stories' && (
        <>
          {collections.length > 0 ? (
            <div className="space-y-0 divide-y divide-border dark:divide-border-dark">
              {collections.map((collection) => (
                <Link
                  key={collection.slug}
                  href={`/projects/${collection.slug}`}
                  className="group block py-10 first:pt-0 last:pb-0"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-6 items-start">
                    <div className="overflow-hidden rounded-xl">
                      <Image
                        src={collection.coverUrl}
                        alt={collection.title}
                        width={400}
                        height={300}
                        className="w-full h-36 object-cover group-hover:opacity-80 transition-opacity duration-300"
                      />
                    </div>
                    <div>
                      <h2 className="font-display text-3xl font-medium text-ink dark:text-ink-dark group-hover:opacity-60 transition-opacity mb-2">
                        {collection.title}
                      </h2>
                      <div className="flex items-center gap-3 text-xs font-medium uppercase tracking-label text-ink-muted mb-3">
                        <span>{collection.location}</span>
                        <span className="w-1 h-1 rounded-full bg-ink-muted" />
                        <time>
                          {collection.dateFormatted}
                        </time>
                        <span className="w-1 h-1 rounded-full bg-ink-muted" />
                        <span>{collection.photoCount} photos</span>
                      </div>
                      {collection.description && (
                        <p className="text-sm text-ink-secondary dark:text-ink-dark-secondary leading-relaxed">
                          {collection.description}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-ink-muted py-10">No stories yet.</p>
          )}
        </>
      )}

      {/* Moments tab */}
      {tab === 'moments' && (
        <>
          {moments.length > 0 ? (
            <div className="columns-2 sm:columns-3 gap-4 space-y-4">
              {moments.map((moment) => (
                <div
                  key={moment.id}
                  className="break-inside-avoid overflow-hidden rounded-xl"
                >
                  <Image
                    src={moment.url}
                    alt="Moment"
                    width={600}
                    height={400}
                    className="w-full h-auto object-cover"
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-ink-muted py-10">No moments yet.</p>
          )}

          {/* Moment uploader for authenticated users */}
          <AuthGate>
            <div className="mt-12 pt-10 border-t border-border dark:border-border-dark">
              <h3 className="text-sm font-medium uppercase tracking-[0.12em] text-ink-muted mb-4">Upload Moments</h3>
              <MomentUploader />
            </div>
          </AuthGate>
        </>
      )}
    </>
  );
}
