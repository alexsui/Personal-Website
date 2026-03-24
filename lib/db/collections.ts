import { getPublicClient, getAdminClient } from './client';
import { DbCollection } from './types';

export async function getCollections(): Promise<DbCollection[]> {
  const client = getPublicClient();
  const { data, error } = await client
    .from('collections')
    .select('*')
    .order('date', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getCollectionBySlug(slug: string): Promise<DbCollection | null> {
  const client = getPublicClient();
  const { data, error } = await client
    .from('collections')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function getAllCollectionSlugs(): Promise<string[]> {
  const client = getPublicClient();
  const { data, error } = await client.from('collections').select('slug');
  if (error) throw error;
  return (data ?? []).map((c) => c.slug);
}

export async function createCollection(
  collection: Omit<DbCollection, 'id' | 'cover_photo_id' | 'created_at' | 'updated_at'>
): Promise<DbCollection> {
  const client = getAdminClient();
  const { data, error } = await client
    .from('collections')
    .insert(collection)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateCollection(id: string, updates: Partial<DbCollection>): Promise<DbCollection> {
  const client = getAdminClient();
  const { data, error } = await client
    .from('collections')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteCollection(id: string): Promise<void> {
  const client = getAdminClient();
  const { error } = await client.from('collections').delete().eq('id', id);
  if (error) throw error;
}
