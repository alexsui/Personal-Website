export type DbPost = {
  id: string;
  slug: string;
  title: string;
  date: string;
  summary: string;
  content: string;
  tags: string[];
  cover_url: string | null;
  draft: boolean;
  created_at: string;
  updated_at: string;
};

export type DbCollection = {
  id: string;
  slug: string;
  title: string;
  date: string;
  end_date: string | null;
  location: string;
  description: string;
  cover_photo_id: string | null;
  created_at: string;
  updated_at: string;
};

export type DbPhoto = {
  id: string;
  collection_id: string | null;
  storage_path: string;
  filename: string;
  alt: string | null;
  sort_order: number;
  created_at: string;
};

export type DbProfile = {
  id: string;
  name: string;
  chinese_name: string | null;
  bio: string;
  photo_url: string | null;
  email: string;
  social: { github?: string; linkedin?: string };
  cta: { label?: string; href?: string };
  highlights: Array<{ text: string; url?: string; label?: string }>;
  updated_at: string;
};

export type AboutSectionType =
  | 'experience'
  | 'education'
  | 'publication'
  | 'achievement'
  | 'skill_group'
  | 'interest'
  | 'highlight';

export type DbAboutSection = {
  id: string;
  type: AboutSectionType;
  title: string;
  subtitle: string | null;
  date_start: string | null;
  date_end: string | null;
  url: string | null;
  content: Record<string, unknown>;
  sort_order: number;
  created_at: string;
  updated_at: string;
};
