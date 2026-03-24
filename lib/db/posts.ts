import { getPublicClient, getAdminClient } from './client';
import { DbPost } from './types';

export async function getPosts(includeDrafts = false): Promise<DbPost[]> {
  const client = getPublicClient();
  let query = client
    .from('posts')
    .select('*')
    .order('date', { ascending: false });

  if (!includeDrafts) {
    query = query.eq('draft', false);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function getPostBySlug(slug: string, includeDrafts = false): Promise<DbPost | null> {
  const client = getPublicClient();
  let query = client
    .from('posts')
    .select('*')
    .eq('slug', slug);

  if (!includeDrafts) {
    query = query.eq('draft', false);
  }

  const { data, error } = await query.single();
  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function getAllPostSlugs(): Promise<string[]> {
  const client = getPublicClient();
  const { data, error } = await client
    .from('posts')
    .select('slug')
    .eq('draft', false);

  if (error) throw error;
  return (data ?? []).map((p) => p.slug);
}

export async function getAllTags(): Promise<string[]> {
  const posts = await getPosts();
  const tags = new Set<string>();
  posts.forEach((p) => p.tags.forEach((t) => tags.add(t)));
  return Array.from(tags).sort();
}

export async function createPost(post: Omit<DbPost, 'id' | 'created_at' | 'updated_at'>): Promise<DbPost> {
  const client = getAdminClient();
  const { data, error } = await client
    .from('posts')
    .insert(post)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updatePost(id: string, updates: Partial<DbPost>): Promise<DbPost> {
  const client = getAdminClient();
  const { data, error } = await client
    .from('posts')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deletePost(id: string): Promise<void> {
  const client = getAdminClient();
  const { error } = await client.from('posts').delete().eq('id', id);
  if (error) throw error;
}
