'use server';

import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/lib/auth';
import { createPhoto, deletePhoto, reorderPhotos } from '@/lib/db/photos';
import { deleteFile } from '@/lib/storage';

export async function createPhotoAction(photo: {
  collection_id: string | null;
  storage_path: string;
  filename: string;
  sort_order: number;
}) {
  await requireAuth();
  const newPhoto = await createPhoto({
    collection_id: photo.collection_id,
    storage_path: photo.storage_path,
    filename: photo.filename,
    alt: null,
    sort_order: photo.sort_order,
  });
  revalidatePath('/projects');
  revalidatePath('/');
  return newPhoto;
}

export async function deletePhotoAction(
  id: string,
  storagePath: string,
  collectionSlug?: string
) {
  await requireAuth();
  await deleteFile('gallery', storagePath);
  await deletePhoto(id);
  revalidatePath('/projects');
  if (collectionSlug) revalidatePath(`/projects/${collectionSlug}`);
  revalidatePath('/');
}

export async function reorderPhotosAction(
  updates: Array<{ id: string; sort_order: number }>,
  collectionSlug?: string
) {
  await requireAuth();
  await reorderPhotos(updates);
  if (collectionSlug) revalidatePath(`/projects/${collectionSlug}`);
}
