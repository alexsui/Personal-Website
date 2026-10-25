export const blogCategories = [
  { id: 'recommendation', label: 'Recommendation Systems' },
  { id: 'data-engineering', label: 'Data Engineering' },
  { id: 'product', label: 'Product Development' },
] as const;

export type BlogCategory = (typeof blogCategories)[number];

const legacyCategoryIds: Record<string, BlogCategory['id']> = {
  ml: 'recommendation',
  engineering: 'data-engineering',
  reflection: 'product',
};

export function getBlogCategory(id: string | string[] | undefined): BlogCategory | undefined {
  if (typeof id !== 'string') return undefined;
  return blogCategories.find((category) => category.id === (legacyCategoryIds[id] ?? id));
}

export function getPostCategory(tags: string[]): BlogCategory | undefined {
  const normalizedTags = tags.map((tag) => tag.trim().toLowerCase());
  // Classify by subject. Broad tags such as reflection or research are not subjects.
  if (normalizedTags.includes('recommendation system')) {
    return blogCategories[0];
  }
  if (normalizedTags.some((tag) => ['data-pipeline', 'data-engineering'].includes(tag))) {
    return blogCategories[1];
  }
  if (normalizedTags.includes('product')) {
    return blogCategories[2];
  }
  return undefined;
}
