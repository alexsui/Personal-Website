import { getPublicClient, getAdminClient } from './client';
import { DbPhoto } from './types';
import { getPublicUrl } from '@/lib/storage';

export async function getPhotosByCollection(collectionId: string): Promise<DbPhoto[]> {
  const client = getPublicClient();
  const { data, error } = await client
    .from('photos')
    .select('*')
    .eq('collection_id', collectionId)
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function getMomentPhotos(): Promise<DbPhoto[]> {
  const client = getPublicClient();
  const { data, error } = await client
    .from('photos')
    .select('*')
    .is('collection_id', null)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export function getPhotoUrl(photo: DbPhoto): string {
  return getPublicUrl('gallery', photo.storage_path);
}

export async function createPhoto(
  photo: Omit<DbPhoto, 'id' | 'created_at'>
): Promise<DbPhoto> {
  const client = getAdminClient();
  const { data, error } = await client
    .from('photos')
    .insert(photo)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deletePhoto(id: string): Promise<void> {
  const client = getAdminClient();
  const { error } = await client.from('photos').delete().eq('id', id);
  if (error) throw error;
}

export async function reorderPhotos(
  updates: Array<{ id: string; sort_order: number }>
): Promise<void> {
  const client = getAdminClient();
  for (const { id, sort_order } of updates) {
    const { error } = await client
      .from('photos')
      .update({ sort_order })
      .eq('id', id);
    if (error) throw error;
  }
}

export async function getCollectionPhotoCount(collectionId: string): Promise<number> {
  const client = getPublicClient();
  const { count, error } = await client
    .from('photos')
    .select('*', { count: 'exact', head: true })
    .eq('collection_id', collectionId);

  if (error) throw error;
  return count ?? 0;
}
