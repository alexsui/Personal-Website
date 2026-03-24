# Supabase CMS Migration Design

**Date:** 2026-03-24
**Status:** Approved
**Author:** Samuel Toh + Claude

## Overview

Migrate the personal website from a static filesystem-based content system (markdown files + local images) to a dynamic Supabase-backed CMS with inline editing. The public-facing site remains visually identical — this is a backend and content management change.

## Goals

1. **Manage all content through the website UI** — blog posts, gallery collections, moments, about page, profile
2. **Inline editing** — edit buttons appear on public pages when logged in, no separate admin panel
3. **Image uploads** — bulk drag-and-drop for gallery, single upload for blog covers and profile
4. **Data portability** — all Supabase-specific code isolated behind abstraction layers for future migration to Neon DB or similar
5. **Performance parity** — ISR keeps public pages fast and static; changes go live within seconds

## Non-Goals

- Multi-user authentication or role-based access
- Separate admin dashboard
- Rich text (WYSIWYG) editor — markdown with live preview is sufficient
- Mobile app or external API consumers
- Projects as a separate content type — the existing `sample-project.md` was a placeholder; real projects (like FairCDSR) have already been moved to blog posts. The `/projects` route serves the photo gallery only. The `content/projects/` directory and `Project` type will be removed during migration.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, React 18, Tailwind CSS (unchanged) |
| Backend | Next.js Server Actions + 1 API route (upload) |
| Database | Supabase (Postgres) |
| Storage | Supabase Storage (3 buckets) |
| Auth | NextAuth.js (credentials provider, single user) |
| Deploy | Vercel + Supabase cloud |
| Caching | ISR + on-demand revalidation |

## Architecture

### Approach: Server Actions + Direct Supabase

All CRUD mutations use Next.js Server Actions. Pages fetch data server-side via Supabase client. No REST API layer — the only API route is `/api/upload` for multipart image uploads with progress tracking.

### Data Flow

**Public read (visitors):**
```
Page (RSC) → lib/db/*.ts → Supabase → cached via ISR
```
Static pages, revalidated on content change.

**Admin write (authenticated):**
```
Edit component → Server Action → lib/db/*.ts → Supabase → revalidatePath()
```
Inline editors appear when authenticated. After mutation, the affected page cache is busted.

**Image upload:**
```
PhotoUploader → /api/upload → lib/storage.ts → Supabase Storage → returns public URL
```
API route needed for multipart form data and upload progress.

### Portability Layer

All Supabase-specific code is isolated in `lib/`:

| File | Current | Migration Target |
|------|---------|-----------------|
| `lib/db/client.ts` | Supabase JS client | Drizzle ORM + Neon |
| `lib/db/*.ts` | Supabase queries | Drizzle queries |
| `lib/storage.ts` | Supabase Storage | S3 / Cloudflare R2 |
| `lib/auth.ts` | NextAuth.js | NextAuth.js (already agnostic) |

Constraints:
- Standard Postgres only — no Supabase-specific extensions or RPC functions
- SQL migration files that work on any Postgres instance
- Components never import Supabase directly — always go through `lib/`

## Database Schema

### `posts`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK, default gen_random_uuid() |
| slug | text | UNIQUE |
| title | text | |
| date | date | |
| summary | text | |
| content | text | Markdown body |
| tags | text[] | Lowercase |
| cover_url | text | Nullable, URL from storage |
| draft | boolean | Default true |
| created_at | timestamptz | Default now() |
| updated_at | timestamptz | Default now() |

`readingTime` is not stored — computed at render time from markdown content length.
Slugs are auto-generated from the title (kebab-case) on creation, editable afterward.

### `collections`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| slug | text | UNIQUE |
| title | text | |
| date | date | Trip start date |
| end_date | date | Nullable, trip end date |
| location | text | |
| description | text | |
| cover_photo_id | uuid | FK → photos.id, nullable, ON DELETE SET NULL |
| created_at | timestamptz | |
| updated_at | timestamptz | |

Slugs are auto-generated from the title (kebab-case) on creation, editable afterward.

### `photos`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| collection_id | uuid | FK → collections.id, nullable |
| storage_path | text | Path in Supabase Storage bucket. Public URL computed at read time via `lib/storage.ts` `getPublicUrl()` — not stored. |
| filename | text | Original filename |
| alt | text | Nullable. Alt text for accessibility. Omitted in v1 — defaults to collection title or "Moment" |
| sort_order | integer | For ordering within collection |
| created_at | timestamptz | |

- `collection_id = NULL` → Moment photo (loose, not in a collection)
- `collection_id = set` → Collection photo
- Deleting a collection cascades to its photos (both DB rows and storage objects)
- No redundant `is_moment` flag — moment status is inferred from `collection_id IS NULL`

### `profile`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK, single row (singleton) |
| name | text | |
| bio | text | |
| photo_url | text | |
| email | text | Used as contact page recipient (replaces hardcoded `recipientEmail`). Contact page uses a server component parent to fetch profile and pass email as prop to the client component. |
| social | jsonb | `{ github: "...", linkedin: "..." }` |
| cta | jsonb | `{ label: "...", href: "..." }` |
| highlights | jsonb | Array of `{ text, url?, label? }` for hero section highlights (e.g., IEEE paper, AWS cert) |
| updated_at | timestamptz | |

### `about_sections`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| type | text | One of: experience, education, publication, achievement, skill_group, interest, highlight |
| title | text | |
| subtitle | text | Nullable (e.g., role, degree) |
| date_start | text | Nullable |
| date_end | text | Nullable |
| url | text | Nullable (link to company/school) |
| content | jsonb | Flexible: bullets, tags, description, GPA, etc. |
| sort_order | integer | Ordering within type group |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### Supabase Storage Buckets

| Bucket | Purpose | Access |
|--------|---------|--------|
| `gallery` | Collection photos + moment photos | Public read, authenticated write |
| `covers` | Blog post cover images | Public read, authenticated write |
| `profile` | Profile photo | Public read, authenticated write |

### Row Level Security

All tables have RLS enabled:
- **SELECT**: allowed for `anon` role (public read)
- **INSERT/UPDATE/DELETE**: allowed for `service_role` only (server-side mutations via service role key)

### Triggers

A standard Postgres trigger sets `updated_at = now()` on every UPDATE for all tables that have an `updated_at` column. Defined in the SQL migration file as a reusable trigger function — no Supabase-specific extensions.

## Authentication

- **NextAuth.js** with credentials provider
- **Single allowed user**: email in `ADMIN_EMAIL` env var, bcrypt-hashed password in `ADMIN_PASSWORD_HASH` env var
- **JWT session**: stored in httpOnly cookie, no database session table
- **Server Action protection**: every mutation checks `getServerSession()` before proceeding
- **Upload route protection**: `/api/upload` checks session before accepting files
- **No Supabase Auth dependency**: auth is entirely NextAuth, making it portable
- **CSRF protection**: Server Actions rely on Next.js's built-in Origin header check. The `/api/upload` route is protected by the session cookie (httpOnly, SameSite=Lax), which provides implicit CSRF protection for same-site requests.

## Inline Editing UX

### Login

A subtle key icon (🔑) in the site header, only noticeable if you know it's there. Click opens a centered login modal with email + password fields.

### Edit Mode

When authenticated, the following appear on public pages:

- **Edit pencil buttons** (✏️) on every content block: blog posts, gallery collections, about sections, profile/hero
- **"+ New" buttons** at the top of blog index and gallery index pages
- **Drop zone** on collection detail pages for bulk photo upload
- **"Add Section" button** at the bottom of about page sections
- **Drag handles** on about sections and gallery photos for reordering

### Editor Panel

Clicking an edit button opens a **slide-in panel from the right**:

- **Default width**: 50% of viewport
- **Resizable**: drag handle on the left edge
- **Maximize button**: expand to full viewport for long-form writing
- **Fields**: contextual to content type (title, date, tags, markdown content, etc.)
- **Blog posts**: markdown textarea with live preview, auto-grows with content, minimum height 400px
- **Save / Cancel** buttons at the bottom
- Page content dims behind the panel

### Draft Posts

When authenticated, draft posts appear in the blog index with a "Draft" badge. The post editor includes a **Publish / Unpublish** toggle. New posts default to `draft = true`. Public visitors never see drafts.

### Creating New Content

- **New Post**: "+ New" on `/blog` → opens editor panel with empty fields, slug auto-generated from title, defaults to draft
- **New Collection**: "+ New" on `/projects` → opens editor with title, location, date range fields
- **New Photos**: drag-and-drop zone on collection detail page, supports bulk upload with per-file progress
- **New Moments**: drag-and-drop on the Moments tab of the gallery
- **New About Section**: "Add Section" button with type dropdown (experience, education, etc.)

## Image Handling

- **Accepted formats**: jpg, jpeg, png, webp
- **Max file size**: 10MB per image
- **Upload flow**: client → `/api/upload` (validates session, file type, size) → `lib/storage.ts` → Supabase Storage → returns public URL → inserts into `photos` table
- **Bulk upload**: API route accepts multiple files, client shows per-file progress
- **Image optimization**: Next.js `<Image>` component handles resizing/format conversion at serve time (same as current). Originals stored in Supabase Storage. `next.config.js` must add `images.remotePatterns` for the Supabase Storage domain (e.g., `*.supabase.co`).
- **Deletion**: removes both storage object and database row. Collection deletion cascades to all its photos.

## ISR & Caching Strategy

- **Fallback revalidation**: `revalidate = 60` on public pages (revalidate at most every 60 seconds)
- **On-demand revalidation**: every Server Action calls `revalidatePath()` or `revalidateTag()` after mutation to immediately bust the cache
- **Dynamic routes**: `dynamicParams = true` on `[slug]` routes so new content is generated on first visit
- **Result**: visitors get fast static pages; changes go live within seconds of saving

## Code Structure

```
lib/
├── db/
│   ├── client.ts          ← Supabase client initialization
│   ├── posts.ts           ← getPosts, getPost, createPost, updatePost, deletePost
│   ├── collections.ts     ← getCollections, getCollection, createCollection...
│   ├── photos.ts          ← getPhotos, createPhoto, deletePhoto, reorder...
│   ├── profile.ts         ← getProfile, updateProfile
│   └── about.ts           ← getAboutSections, createSection, updateSection...
├── auth.ts                ← NextAuth config + helpers
├── storage.ts             ← upload/delete/getPublicUrl abstraction
├── markdown.ts            ← (unchanged) remark/rehype pipeline
└── seo.ts                 ← (unchanged)

app/
├── (site)/                ← Public pages (routes unchanged)
│   ├── page.tsx
│   ├── blog/ + [slug]/
│   ├── projects/ + [slug]/
│   ├── about/
│   └── contact/
├── api/
│   ├── auth/[...nextauth]/route.ts  ← NextAuth route handler
│   └── upload/route.ts              ← Image upload endpoint
├── actions/               ← Server Actions
│   ├── posts.ts
│   ├── collections.ts
│   ├── photos.ts
│   ├── profile.ts
│   └── about.ts
├── globals.css
└── layout.tsx

components/
├── layout/                ← (unchanged: Header, Footer, Hero)
├── blog/                  ← (unchanged: PostCard, PreviewList, TagBadge)
├── ui/                    ← (unchanged: Button, Card, GalleryTabs, etc.)
├── providers/             ← (add SessionProvider for NextAuth)
└── admin/                 ← NEW: inline editing components
    ├── AuthGate.tsx       ← Renders children only when authenticated
    ├── EditButton.tsx     ← Pencil icon overlay
    ├── EditorPanel.tsx    ← Resizable slide-in panel shell
    ├── PostEditor.tsx     ← Blog post form + markdown editor
    ├── CollectionEditor.tsx
    ├── PhotoUploader.tsx  ← Drag-and-drop, bulk support
    ├── MomentUploader.tsx
    ├── ProfileEditor.tsx
    ├── AboutEditor.tsx
    └── LoginModal.tsx

scripts/
└── migrate.ts             ← One-time migration script
```

## Migration Script

`scripts/migrate.ts` performs a one-time data migration:

1. Read all markdown files from `content/posts/`, `content/gallery/`
2. Parse frontmatter and content
3. Upload images from `public/images/gallery/` and `public/images/` to Supabase Storage
4. Insert posts, collections, photos into database
5. Extract hardcoded about page data (all 6 types: interests, experience, education, publications, achievements, skills) and insert into `about_sections`
6. Extract profile data from `lib/profile.ts` (including hero highlights) and insert into `profile`
7. Upload moment photos from `public/images/gallery/moments/` and insert into `photos` with `collection_id = NULL`

7. Read existing `content/projects/` markdown files — these are retired (see Non-Goals), no migration target needed

After migration, keep `content/` and `public/images/` intact as a safety net until the Supabase-backed site is verified in production. Once verified, the following can be removed:
- `content/` directory
- `public/images/gallery/`, `public/images/projects/`
- `lib/content.ts` (old filesystem loader)
- `gray-matter` dependency

## Environment Variables

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# NextAuth
NEXTAUTH_SECRET=random-secret-string
NEXTAUTH_URL=https://your-domain.com

# Admin
ADMIN_EMAIL=your@email.com
ADMIN_PASSWORD_HASH=$2b$10$...
```
