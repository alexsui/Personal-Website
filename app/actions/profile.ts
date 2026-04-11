'use server';

import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/lib/auth';
import { updateProfile } from '@/lib/db/profile';

export async function updateProfileAction(updates: {
  name?: string;
  chinese_name?: string | null;
  bio?: string;
  photo_url?: string;
  email?: string;
  social?: { github?: string; linkedin?: string };
  cta?: { label?: string; href?: string };
  highlights?: Array<{ text: string; url?: string; label?: string }>;
}) {
  await requireAuth();
  const profile = await updateProfile(updates);
  revalidatePath('/', 'layout');
  return profile;
}
