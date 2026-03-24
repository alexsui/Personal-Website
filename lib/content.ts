import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export type PostMeta = {
  slug: string;
  title: string;
  date: string;
  summary: string;
  tags?: string[];
  cover?: string;
  draft?: boolean;
  readingTime?: number;
};

export type Project = {
  slug: string;
  title: string;
  description: string;
  image?: string;
  tags?: string[];
  link: string;
  year?: string;
};

export type GalleryCollection = {
  slug: string;
  title: string;
  date: string;
  endDate?: string;
  location: string;
  cover: string;
  photos: string[];
  description: string;
};

const POSTS_DIR = path.join(process.cwd(), 'content', 'posts');
const PROJECTS_DIR = path.join(process.cwd(), 'content', 'projects');
const GALLERY_DIR = path.join(process.cwd(), 'content', 'gallery');

function readDirSafe(dir: string): string[] {
  try {
    return fs.readdirSync(dir);
  } catch {
    return [];
  }
}

export function getAllPosts(): PostMeta[] {
  const files = readDirSafe(POSTS_DIR).filter((f) => f.endsWith('.md'));
  const posts = files.map((file) => {
    const slug = file.replace(/\.md$/, '');
    const full = path.join(POSTS_DIR, file);
    const raw = fs.readFileSync(full, 'utf8');
    const { data } = matter(raw);
    const meta: PostMeta = {
      slug: (data.slug as string) || slug,
      title: data.title as string,
      date: data.date as string,
      summary: data.summary as string,
      tags: (data.tags as string[] | undefined)?.map((t) =>
        String(t).toLowerCase()
      ),
      cover: data.cover as string | undefined,
      draft: Boolean(data.draft),
    };
    return meta;
  });
  return posts
    .filter((p) => p.title && p.date && p.summary && !p.draft)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getLatestPosts(n = 3) {
  return getAllPosts().slice(0, n);
}

export function getAllTags(): string[] {
  const tags = new Set<string>();
  getAllPosts().forEach((p) =>
    (p.tags || []).forEach((t) => tags.add(t.toLowerCase()))
  );
  return Array.from(tags).sort();
}

export function getPostBySlug(slug: string) {
  const filename = fs.existsSync(path.join(POSTS_DIR, slug + '.md'))
    ? slug + '.md'
    : undefined;
  if (!filename) return null;
  const full = path.join(POSTS_DIR, filename);
  const raw = fs.readFileSync(full, 'utf8');
  const { data, content } = matter(raw);
  const meta: PostMeta = {
    slug: (data.slug as string) || slug,
    title: data.title as string,
    date: data.date as string,
    summary: data.summary as string,
    tags: (data.tags as string[] | undefined)?.map((t) =>
      String(t).toLowerCase()
    ),
    cover: data.cover as string | undefined,
    draft: Boolean(data.draft),
  };
  return { meta, content };
}

export function getAllProjects(): Project[] {
  const files = readDirSafe(PROJECTS_DIR).filter((f) => f.endsWith('.md'));
  const items = files.map((file) => {
    const slug = file.replace(/\.md$/, '');
    const full = path.join(PROJECTS_DIR, file);
    const raw = fs.readFileSync(full, 'utf8');
    const { data } = matter(raw);
    const item: Project = {
      slug: (data.slug as string) || slug,
      title: data.title as string,
      description: data.description as string,
      image: data.image as string | undefined,
      tags: (data.tags as string[] | undefined) || [],
      link: data.link as string,
      year: data.year as string | undefined,
    };
    return item;
  });
  return items.filter((p) => p.title && p.description && p.link);
}

export function getLatestProjects(n = 1) {
  return getAllProjects().slice(0, n);
}

function getPhotosFromFolder(slug: string): string[] {
  const dir = path.join(process.cwd(), 'public/images/gallery', slug);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => /\.(jpg|jpeg|png|webp)$/i.test(f))
    .sort();
}

export function getAllCollections(): GalleryCollection[] {
  const files = readDirSafe(GALLERY_DIR).filter((f) => f.endsWith('.md'));
  const items = files.map((file) => {
    const slug = file.replace(/\.md$/, '');
    const full = path.join(GALLERY_DIR, file);
    const raw = fs.readFileSync(full, 'utf8');
    const { data, content } = matter(raw);
    const photos = getPhotosFromFolder(slug);
    const collection: GalleryCollection = {
      slug,
      title: data.title as string,
      date: data.date as string,
      endDate: data.endDate as string | undefined,
      location: data.location as string,
      cover: (data.cover as string) || photos[0] || '',
      photos,
      description: content.trim(),
    };
    return collection;
  });
  return items
    .filter((c) => c.title && c.date && c.photos.length > 0)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getCollectionBySlug(slug: string): GalleryCollection | null {
  const filename = slug + '.md';
  const full = path.join(GALLERY_DIR, filename);
  if (!fs.existsSync(full)) return null;
  const raw = fs.readFileSync(full, 'utf8');
  const { data, content } = matter(raw);
  const photos = getPhotosFromFolder(slug);
  return {
    slug,
    title: data.title as string,
    date: data.date as string,
    endDate: data.endDate as string | undefined,
    location: data.location as string,
    cover: (data.cover as string) || photos[0] || '',
    photos,
    description: content.trim(),
  };
}

export function formatCollectionDate(date: string, endDate?: string): string {
  const start = new Date(date);
  if (!endDate) {
    return start.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }
  const end = new Date(endDate);
  const sameMonth = start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();
  const sameYear = start.getFullYear() === end.getFullYear();
  if (sameMonth) {
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${end.getDate()}, ${end.getFullYear()}`;
  }
  if (sameYear) {
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${end.getFullYear()}`;
  }
  return `${start.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })} – ${end.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}`;
}
