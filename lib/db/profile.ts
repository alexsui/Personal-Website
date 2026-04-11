import { cache } from 'react';
import { getPublicClient, getAdminClient } from './client';
import { DbProfile } from './types';

export const getProfile = cache(async (): Promise<DbProfile | null> => {
  const client = getPublicClient();
  const { data, error } = await client
    .from('profile')
    .select('*')
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
});

export async function updateProfile(updates: Partial<DbProfile>): Promise<DbProfile> {
  const client = getAdminClient();
  const existing = await getProfile();

  if (existing) {
    const { data, error } = await client
      .from('profile')
      .update(updates)
      .eq('id', existing.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  } else {
    const { data, error } = await client
      .from('profile')
      .insert(updates)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
}
