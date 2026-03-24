import { getPublicClient, getAdminClient } from './client';
import { DbAboutSection, AboutSectionType } from './types';

export async function getAboutSections(): Promise<DbAboutSection[]> {
  const client = getPublicClient();
  const { data, error } = await client
    .from('about_sections')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function getAboutSectionsByType(
  type: AboutSectionType
): Promise<DbAboutSection[]> {
  const client = getPublicClient();
  const { data, error } = await client
    .from('about_sections')
    .select('*')
    .eq('type', type)
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function createAboutSection(
  section: Omit<DbAboutSection, 'id' | 'created_at' | 'updated_at'>
): Promise<DbAboutSection> {
  const client = getAdminClient();
  const { data, error } = await client
    .from('about_sections')
    .insert(section)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateAboutSection(
  id: string,
  updates: Partial<DbAboutSection>
): Promise<DbAboutSection> {
  const client = getAdminClient();
  const { data, error } = await client
    .from('about_sections')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteAboutSection(id: string): Promise<void> {
  const client = getAdminClient();
  const { error } = await client.from('about_sections').delete().eq('id', id);
  if (error) throw error;
}
