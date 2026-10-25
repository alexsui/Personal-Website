export const blogCategories = [
  { id: 'ml', label: '推薦與 ML' },
  { id: 'engineering', label: '工程實作' },
  { id: 'reflection', label: '工作心得' },
] as const;

export type BlogCategory = (typeof blogCategories)[number];

export function getPostCategory(tags: string[]): BlogCategory | undefined {
  if (tags.some((tag) => ['machine-learning', 'deep learning', 'recommendation system', 'research'].includes(tag))) {
    return blogCategories[0];
  }
  if (tags.some((tag) => ['engineering', 'data-pipeline'].includes(tag))) {
    return blogCategories[1];
  }
  if (tags.some((tag) => ['reflection', 'product'].includes(tag))) {
    return blogCategories[2];
  }
  return undefined;
}
