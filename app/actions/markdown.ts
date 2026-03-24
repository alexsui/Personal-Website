'use server';

import { mdToHtml } from '@/lib/markdown';

export async function renderMarkdown(md: string): Promise<string> {
  return mdToHtml(md);
}
