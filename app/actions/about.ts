'use server';

import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/lib/auth';
import { createAboutSection, updateAboutSection, deleteAboutSection } from '@/lib/db/about';
import { AboutSectionType } from '@/lib/db/types';

export async function createAboutSectionAction(section: {
  type: AboutSectionType;
  title: string;
  subtitle?: string;
  date_start?: string;
  date_end?: string;
  url?: string;
  content: Record<string, unknown>;
  sort_order: number;
}) {
  await requireAuth();
  const created = await createAboutSection({
    ...section,
    subtitle: section.subtitle ?? null,
    date_start: section.date_start ?? null,
    date_end: section.date_end ?? null,
    url: section.url ?? null,
  });
  revalidatePath('/about');
  return created;
}

export async function updateAboutSectionAction(
  id: string,
  updates: Partial<{
    title: string;
    subtitle: string | null;
    date_start: string | null;
    date_end: string | null;
    url: string | null;
    content: Record<string, unknown>;
    sort_order: number;
  }>
) {
  await requireAuth();
  const section = await updateAboutSection(id, updates);
  revalidatePath('/about');
  return section;
}

export async function deleteAboutSectionAction(id: string) {
  await requireAuth();
  await deleteAboutSection(id);
  revalidatePath('/about');
}
