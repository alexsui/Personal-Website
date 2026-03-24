'use server';

import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/lib/auth';
import { createCollection, updateCollection, deleteCollection } from '@/lib/db/collections';
import { getPhotosByCollection } from '@/lib/db/photos';
import { deleteFile } from '@/lib/storage';
import { generateSlug } from '@/lib/slug';

export async function createCollectionAction(formData: {
  title: string;
  date: string;
  end_date?: string;
  location: string;
  description: string;
}) {
  await requireAuth();
  const slug = generateSlug(formData.title);
  const collection = await createCollection({
    slug,
    title: formData.title,
    date: formData.date,
    end_date: formData.end_date ?? null,
    location: formData.location,
    description: formData.description,
  });
  revalidatePath('/projects');
  revalidatePath('/');
  return collection;
}

export async function updateCollectionAction(
  id: string,
  updates: {
    title?: string;
    slug?: string;
    date?: string;
    end_date?: string | null;
    location?: string;
    description?: string;
    cover_photo_id?: string | null;
  }
) {
  await requireAuth();
  const collection = await updateCollection(id, updates);
  revalidatePath('/projects');
  revalidatePath(`/projects/${collection.slug}`);
  revalidatePath('/');
  return collection;
}

export async function deleteCollectionAction(id: string, slug: string) {
  await requireAuth();
  const photos = await getPhotosByCollection(id);
  for (const photo of photos) {
    await deleteFile('gallery', photo.storage_path);
  }
  await deleteCollection(id);
  revalidatePath('/projects');
  revalidatePath(`/projects/${slug}`);
  revalidatePath('/');
}
