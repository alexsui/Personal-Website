'use server';

import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/lib/auth';
import { createPost, updatePost, deletePost } from '@/lib/db/posts';
import { generateSlug } from '@/lib/slug';

export async function createPostAction(formData: {
  title: string;
  date: string;
  summary: string;
  content: string;
  tags: string[];
  cover_url?: string;
}) {
  await requireAuth();
  const slug = generateSlug(formData.title);
  const post = await createPost({
    slug,
    title: formData.title,
    date: formData.date,
    summary: formData.summary,
    content: formData.content,
    tags: formData.tags.map((t) => t.toLowerCase()),
    cover_url: formData.cover_url ?? null,
    draft: true,
  });
  revalidatePath('/blog');
  revalidatePath('/');
  return post;
}

export async function updatePostAction(
  id: string,
  updates: {
    title?: string;
    slug?: string;
    date?: string;
    summary?: string;
    content?: string;
    tags?: string[];
    cover_url?: string | null;
    draft?: boolean;
  }
) {
  await requireAuth();
  if (updates.tags) {
    updates.tags = updates.tags.map((t) => t.toLowerCase());
  }
  const post = await updatePost(id, updates);
  revalidatePath('/blog');
  revalidatePath(`/blog/${post.slug}`);
  revalidatePath('/');
  return post;
}

export async function deletePostAction(id: string, slug: string) {
  await requireAuth();
  await deletePost(id);
  revalidatePath('/blog');
  revalidatePath(`/blog/${slug}`);
  revalidatePath('/');
}

export async function toggleDraftAction(id: string, slug: string, draft: boolean) {
  await requireAuth();
  await updatePost(id, { draft });
  revalidatePath('/blog');
  revalidatePath(`/blog/${slug}`);
  revalidatePath('/');
}
