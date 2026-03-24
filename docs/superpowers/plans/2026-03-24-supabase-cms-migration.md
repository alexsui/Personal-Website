# Supabase CMS Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the personal website from static filesystem content to a Supabase-backed CMS with inline editing.

**Architecture:** Next.js Server Actions for mutations, Supabase (Postgres + Storage) for data, NextAuth.js for single-user auth. All Supabase-specific code isolated in `lib/db/` and `lib/storage.ts` for portability. ISR with on-demand revalidation for performance.

**Tech Stack:** Next.js 14, React 18, Tailwind CSS, Supabase JS v2, NextAuth.js v4, bcryptjs

**Spec:** `docs/superpowers/specs/2026-03-24-supabase-cms-migration-design.md`

---

## File Map

### New Files

| File | Responsibility |
|------|---------------|
| `lib/db/client.ts` | Supabase client initialization (server + browser) |
| `lib/db/posts.ts` | Posts CRUD queries |
| `lib/db/collections.ts` | Collections CRUD queries |
| `lib/db/photos.ts` | Photos queries + moment queries |
| `lib/db/profile.ts` | Profile singleton queries |
| `lib/db/about.ts` | About sections CRUD queries |
| `lib/db/types.ts` | Database row types (mirrors Postgres schema) |
| `lib/storage.ts` | Storage upload/delete/getPublicUrl abstraction |
| `lib/auth.ts` | NextAuth config, authOptions, helpers |
| `lib/slug.ts` | Slug generation utility |
| `app/api/auth/[...nextauth]/route.ts` | NextAuth route handler |
| `app/api/upload/route.ts` | Image upload endpoint |
| `app/actions/posts.ts` | Post Server Actions (create, update, delete, toggleDraft) |
| `app/actions/collections.ts` | Collection Server Actions |
| `app/actions/photos.ts` | Photo Server Actions (upload, delete, reorder) |
| `app/actions/profile.ts` | Profile Server Actions |
| `app/actions/about.ts` | About section Server Actions |
| `components/admin/AuthGate.tsx` | Renders children only when authenticated |
| `components/admin/EditButton.tsx` | Pencil icon overlay button |
| `components/admin/EditorPanel.tsx` | Resizable slide-in panel shell |
| `components/admin/PostEditor.tsx` | Blog post markdown editor form |
| `components/admin/CollectionEditor.tsx` | Collection metadata editor |
| `components/admin/PhotoUploader.tsx` | Drag-and-drop bulk photo uploader |
| `components/admin/MomentUploader.tsx` | Moment photo uploader |
| `components/admin/ProfileEditor.tsx` | Profile + highlights editor |
| `components/admin/AboutEditor.tsx` | About section editor |
| `components/admin/LoginModal.tsx` | Email + password login modal |
| `app/(site)/contact/ContactForm.tsx` | Client component extracted from contact page |
| `components/admin/MarkdownPreview.tsx` | Live markdown preview component |
| `supabase/migrations/001_initial_schema.sql` | Full database schema |
| `scripts/migrate.ts` | One-time data migration script |
| `.env.local` | Environment variables (gitignored) |

### Modified Files

| File | Change |
|------|--------|
| `package.json` | Add dependencies: @supabase/supabase-js, next-auth, bcryptjs, @types/bcryptjs |
| `next.config.js` | Add images.remotePatterns for Supabase Storage |
| `.gitignore` | Add .env.local |
| `components/providers/ClientLayout.tsx` | Wrap with NextAuth SessionProvider |
| `components/layout/Header.tsx` | Add login icon + AuthGate |
| `components/layout/Hero.tsx` | Fetch profile + highlights from DB instead of hardcoded |
| `app/(site)/page.tsx` | Fetch from lib/db instead of lib/content |
| `app/(site)/blog/page.tsx` | Fetch from lib/db, add AuthGate + New button |
| `app/(site)/blog/[slug]/page.tsx` | Fetch from lib/db, add EditButton |
| `app/(site)/projects/page.tsx` | Fetch from lib/db, add AuthGate + New/Upload buttons |
| `app/(site)/projects/[slug]/page.tsx` | Fetch from lib/db, add EditButton + PhotoUploader |
| `app/(site)/about/page.tsx` | Fetch from lib/db instead of hardcoded arrays |
| `app/(site)/contact/page.tsx` | Split into server parent + client child for profile.email |
| `components/blog/PreviewList.tsx` | Accept data as props instead of calling lib/content |
| `components/ui/GalleryTabs.tsx` | Accept photo URLs instead of filenames |

---

## Phase 1: Foundation

### Task 1: Install Dependencies

**Files:**
- Modify: `package.json`
- Modify: `.gitignore`

- [ ] **Step 1: Install Supabase, NextAuth, and bcryptjs**

```bash
npm install @supabase/supabase-js next-auth bcryptjs
npm install -D @types/bcryptjs
```

- [ ] **Step 2: Add .env.local to .gitignore**

Add to `.gitignore`:
```
.env.local
.env*.local
```

- [ ] **Step 3: Create .env.local with placeholder values**

Create `.env.local`:
```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# NextAuth
NEXTAUTH_SECRET=generate-a-random-secret-here
NEXTAUTH_URL=http://localhost:3000

# Admin
ADMIN_EMAIL=your@email.com
ADMIN_PASSWORD_HASH=generate-with-bcryptjs
```

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json .gitignore
git commit -m "chore: add Supabase, NextAuth, and bcryptjs dependencies"
```

---

### Task 2: Database Schema Migration

**Files:**
- Create: `supabase/migrations/001_initial_schema.sql`

- [ ] **Step 1: Write the SQL migration file**

```sql
-- 001_initial_schema.sql
-- Portable Postgres schema — no Supabase-specific extensions

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Posts
CREATE TABLE posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  date date NOT NULL,
  summary text NOT NULL,
  content text NOT NULL DEFAULT '',
  tags text[] NOT NULL DEFAULT '{}',
  cover_url text,
  draft boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Collections
CREATE TABLE collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  date date NOT NULL,
  end_date date,
  location text NOT NULL,
  description text NOT NULL DEFAULT '',
  cover_photo_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER collections_updated_at
  BEFORE UPDATE ON collections
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Photos
CREATE TABLE photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id uuid REFERENCES collections(id) ON DELETE CASCADE,
  storage_path text NOT NULL,
  filename text NOT NULL,
  alt text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Add cover_photo_id FK after photos table exists
ALTER TABLE collections
  ADD CONSTRAINT collections_cover_photo_id_fkey
  FOREIGN KEY (cover_photo_id) REFERENCES photos(id) ON DELETE SET NULL;

-- Profile (singleton)
CREATE TABLE profile (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  bio text NOT NULL DEFAULT '',
  photo_url text,
  email text NOT NULL,
  social jsonb NOT NULL DEFAULT '{}',
  cta jsonb NOT NULL DEFAULT '{}',
  highlights jsonb NOT NULL DEFAULT '[]',
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER profile_updated_at
  BEFORE UPDATE ON profile
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- About sections
CREATE TABLE about_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('experience', 'education', 'publication', 'achievement', 'skill_group', 'interest', 'highlight')),
  title text NOT NULL,
  subtitle text,
  date_start text,
  date_end text,
  url text,
  content jsonb NOT NULL DEFAULT '{}',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER about_sections_updated_at
  BEFORE UPDATE ON about_sections
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Indexes
CREATE INDEX idx_posts_slug ON posts(slug);
CREATE INDEX idx_posts_date ON posts(date DESC);
CREATE INDEX idx_posts_draft ON posts(draft);
CREATE INDEX idx_collections_slug ON collections(slug);
CREATE INDEX idx_collections_date ON collections(date DESC);
CREATE INDEX idx_photos_collection ON photos(collection_id);
CREATE INDEX idx_photos_moments ON photos(collection_id) WHERE collection_id IS NULL;
CREATE INDEX idx_about_sections_type ON about_sections(type);

-- Row Level Security
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE about_sections ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Public read posts" ON posts FOR SELECT USING (true);
CREATE POLICY "Public read collections" ON collections FOR SELECT USING (true);
CREATE POLICY "Public read photos" ON photos FOR SELECT USING (true);
CREATE POLICY "Public read profile" ON profile FOR SELECT USING (true);
CREATE POLICY "Public read about_sections" ON about_sections FOR SELECT USING (true);

-- Service role write policies (server-side only, scoped to service_role)
CREATE POLICY "Service write posts" ON posts FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service write collections" ON collections FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service write photos" ON photos FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service write profile" ON profile FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service write about_sections" ON about_sections FOR ALL TO service_role USING (true) WITH CHECK (true);
```

- [ ] **Step 2: Apply migration to Supabase**

Run in the Supabase SQL Editor (dashboard) or via CLI:
```bash
# If using Supabase CLI:
supabase db push
# Otherwise: paste the SQL into the Supabase dashboard SQL Editor
```

- [ ] **Step 3: Create storage buckets in Supabase dashboard**

In Supabase dashboard → Storage:
1. Create bucket `gallery` — public
2. Create bucket `covers` — public
3. Create bucket `profile` — public

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/001_initial_schema.sql
git commit -m "chore: add initial database schema migration"
```

---

### Task 3: Supabase Client & Types

**Files:**
- Create: `lib/db/client.ts`
- Create: `lib/db/types.ts`

- [ ] **Step 1: Create the Supabase client module**

`lib/db/client.ts`:
```typescript
import { createClient, SupabaseClient } from '@supabase/supabase-js';

let _publicClient: SupabaseClient | null = null;
let _adminClient: SupabaseClient | null = null;

// Public client — used for reads (respects RLS)
export function getPublicClient(): SupabaseClient {
  if (!_publicClient) {
    _publicClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return _publicClient;
}

// Admin client — used for writes (bypasses RLS via service role)
// Only call server-side — never import this in client components
export function getAdminClient(): SupabaseClient {
  if (!_adminClient) {
    _adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  return _adminClient;
}
```

- [ ] **Step 2: Create the database types**

`lib/db/types.ts`:
```typescript
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
```

- [ ] **Step 3: Commit**

```bash
git add lib/db/client.ts lib/db/types.ts
git commit -m "feat: add Supabase client and database types"
```

---

### Task 4: Storage Abstraction

**Files:**
- Create: `lib/storage.ts`

- [ ] **Step 1: Create the storage abstraction module**

`lib/storage.ts`:
```typescript
import { getAdminClient } from '@/lib/db/client';

export type StorageBucket = 'gallery' | 'covers' | 'profile';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function getPublicUrl(bucket: StorageBucket, path: string): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
}

export async function uploadFile(
  bucket: StorageBucket,
  path: string,
  file: File
): Promise<string> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error(`File type ${file.type} not allowed. Accepted: jpg, png, webp`);
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File too large. Max size: 10MB`);
  }

  const supabase = getAdminClient();
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { upsert: true });

  if (error) throw new Error(`Upload failed: ${error.message}`);
  return getPublicUrl(bucket, path);
}

export async function deleteFile(
  bucket: StorageBucket,
  path: string
): Promise<void> {
  const supabase = getAdminClient();
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) throw new Error(`Delete failed: ${error.message}`);
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/storage.ts
git commit -m "feat: add storage upload/delete abstraction"
```

---

### Task 5: Slug Utility

**Files:**
- Create: `lib/slug.ts`

- [ ] **Step 1: Create slug generation helper**

`lib/slug.ts`:
```typescript
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/slug.ts
git commit -m "feat: add slug generation utility"
```

---

### Task 6: Next.js Config Update

**Files:**
- Modify: `next.config.js`

- [ ] **Step 1: Add images.remotePatterns for Supabase Storage**

Update `next.config.js` to include:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

module.exports = nextConfig;
```

- [ ] **Step 2: Commit**

```bash
git add next.config.js
git commit -m "chore: add Supabase Storage to Next.js image remote patterns"
```

---

## Phase 2: Auth

### Task 7: NextAuth Setup

**Files:**
- Create: `lib/auth.ts`
- Create: `app/api/auth/[...nextauth]/route.ts`

- [ ] **Step 1: Create the NextAuth configuration**

`lib/auth.ts`:
```typescript
import { NextAuthOptions, getServerSession } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Admin Login',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

        if (!adminEmail || !adminPasswordHash) return null;
        if (credentials.email !== adminEmail) return null;

        const valid = await bcrypt.compare(credentials.password, adminPasswordHash);
        if (!valid) return null;

        return { id: '1', email: adminEmail, name: 'Admin' };
      },
    }),
  ],
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/', // We use a custom modal, not a sign-in page
  },
};

export async function getSession() {
  return getServerSession(authOptions);
}

export async function requireAuth() {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');
  return session;
}
```

- [ ] **Step 2: Create the NextAuth route handler**

`app/api/auth/[...nextauth]/route.ts`:
```typescript
import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

- [ ] **Step 3: Verify the auth route works**

Run: `npm run dev`
Visit: `http://localhost:3000/api/auth/providers`
Expected: JSON response listing the credentials provider

- [ ] **Step 4: Commit**

```bash
git add lib/auth.ts app/api/auth/\[...nextauth\]/route.ts
git commit -m "feat: add NextAuth.js with credentials provider"
```

---

### Task 8: Auth Provider & Login Modal

**Files:**
- Create: `components/admin/LoginModal.tsx`
- Create: `components/admin/AuthGate.tsx`
- Modify: `components/providers/ClientLayout.tsx`
- Modify: `components/layout/Header.tsx`

- [ ] **Step 1: Add SessionProvider to ClientLayout**

Modify `components/providers/ClientLayout.tsx`:
- Import `SessionProvider` from `next-auth/react`
- Wrap the existing ThemeProvider children with `<SessionProvider>`

```typescript
'use client';

import { SessionProvider } from 'next-auth/react';
import ThemeProvider from './ThemeProvider';
import Header from '../layout/Header';
import Footer from '../layout/Footer';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <Header />
        <main className="flex-1 py-8">{children}</main>
        <Footer />
      </ThemeProvider>
    </SessionProvider>
  );
}
```

- [ ] **Step 2: Create AuthGate component**

`components/admin/AuthGate.tsx`:
```typescript
'use client';

import { useSession } from 'next-auth/react';

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  if (!session) return null;
  return <>{children}</>;
}
```

- [ ] **Step 3: Create LoginModal component**

`components/admin/LoginModal.tsx`:
```typescript
'use client';

import { useState } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';

export default function LoginModal() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (session) {
    return (
      <button
        onClick={() => signOut()}
        className="text-ink-muted hover:text-ink dark:hover:text-ink-dark transition-colors"
        title="Sign out"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
        </svg>
      </button>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError('Invalid credentials');
    } else {
      setOpen(false);
      setEmail('');
      setPassword('');
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-ink-muted/30 hover:text-ink-muted dark:text-ink-dark-secondary/30 dark:hover:text-ink-dark-secondary transition-colors"
        title="Admin login"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <form
            onSubmit={handleSubmit}
            className="relative bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-2xl p-8 w-full max-w-sm shadow-xl"
          >
            <h2 className="font-display text-xl font-medium text-ink dark:text-ink-dark mb-6">
              Admin Login
            </h2>

            {error && (
              <p className="text-sm text-red-600 dark:text-red-400 mb-4">{error}</p>
            )}

            <label className="block text-xs font-medium uppercase tracking-label text-ink-muted mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input w-full mb-4"
              required
            />

            <label className="block text-xs font-medium uppercase tracking-label text-ink-muted mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input w-full mb-6"
              required
            />

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-ink dark:bg-ink-dark text-surface dark:text-surface-dark rounded-full px-4 py-2 text-sm font-medium disabled:opacity-50"
              >
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex-1 border border-border dark:border-border-dark rounded-full px-4 py-2 text-sm font-medium text-ink-muted"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
```

- [ ] **Step 4: Add LoginModal to Header**

Modify `components/layout/Header.tsx`:
- Import `LoginModal` from `@/components/admin/LoginModal`
- Add `<LoginModal />` next to the ThemeToggle component in the header flex container

Insert after the ThemeToggle:
```tsx
<LoginModal />
```

- [ ] **Step 5: Verify login flow**

Run: `npm run dev`

1. Look for subtle key icon in header (should be very faint)
2. Click it → login modal appears
3. Generate a test password hash: `node -e "const b=require('bcryptjs');b.hash('test123',10).then(h=>console.log(h))"`
4. Put the hash in `ADMIN_PASSWORD_HASH` in `.env.local`, set `ADMIN_EMAIL`
5. Log in with those credentials
6. Verify: key icon changes to logout icon
7. Refresh page — session persists

- [ ] **Step 6: Commit**

```bash
git add components/providers/ClientLayout.tsx components/admin/AuthGate.tsx components/admin/LoginModal.tsx components/layout/Header.tsx
git commit -m "feat: add auth system with login modal and AuthGate"
```

---

## Phase 3: Data Layer

### Task 9: Database Query Modules

**Files:**
- Create: `lib/db/posts.ts`
- Create: `lib/db/collections.ts`
- Create: `lib/db/photos.ts`
- Create: `lib/db/profile.ts`
- Create: `lib/db/about.ts`

- [ ] **Step 1: Create posts query module**

`lib/db/posts.ts`:
```typescript
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
```

- [ ] **Step 2: Create collections query module**

`lib/db/collections.ts`:
```typescript
import { getPublicClient, getAdminClient } from './client';
import { DbCollection } from './types';

export async function getCollections(): Promise<DbCollection[]> {
  const client = getPublicClient();
  const { data, error } = await client
    .from('collections')
    .select('*')
    .order('date', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getCollectionBySlug(slug: string): Promise<DbCollection | null> {
  const client = getPublicClient();
  const { data, error } = await client
    .from('collections')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function getAllCollectionSlugs(): Promise<string[]> {
  const client = getPublicClient();
  const { data, error } = await client.from('collections').select('slug');
  if (error) throw error;
  return (data ?? []).map((c) => c.slug);
}

export async function createCollection(
  collection: Omit<DbCollection, 'id' | 'cover_photo_id' | 'created_at' | 'updated_at'>
): Promise<DbCollection> {
  const client = getAdminClient();
  const { data, error } = await client
    .from('collections')
    .insert(collection)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateCollection(id: string, updates: Partial<DbCollection>): Promise<DbCollection> {
  const client = getAdminClient();
  const { data, error } = await client
    .from('collections')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteCollection(id: string): Promise<void> {
  const client = getAdminClient();
  const { error } = await client.from('collections').delete().eq('id', id);
  if (error) throw error;
}
```

- [ ] **Step 3: Create photos query module**

`lib/db/photos.ts`:
```typescript
import { getPublicClient, getAdminClient } from './client';
import { DbPhoto } from './types';
import { getPublicUrl } from '@/lib/storage';

export async function getPhotosByCollection(collectionId: string): Promise<DbPhoto[]> {
  const client = getPublicClient();
  const { data, error } = await client
    .from('photos')
    .select('*')
    .eq('collection_id', collectionId)
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function getMomentPhotos(): Promise<DbPhoto[]> {
  const client = getPublicClient();
  const { data, error } = await client
    .from('photos')
    .select('*')
    .is('collection_id', null)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export function getPhotoUrl(photo: DbPhoto): string {
  return getPublicUrl('gallery', photo.storage_path);
}

export async function createPhoto(
  photo: Omit<DbPhoto, 'id' | 'created_at'>
): Promise<DbPhoto> {
  const client = getAdminClient();
  const { data, error } = await client
    .from('photos')
    .insert(photo)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deletePhoto(id: string): Promise<void> {
  const client = getAdminClient();
  const { error } = await client.from('photos').delete().eq('id', id);
  if (error) throw error;
}

export async function reorderPhotos(
  updates: Array<{ id: string; sort_order: number }>
): Promise<void> {
  const client = getAdminClient();
  for (const { id, sort_order } of updates) {
    const { error } = await client
      .from('photos')
      .update({ sort_order })
      .eq('id', id);
    if (error) throw error;
  }
}

export async function getCollectionPhotoCount(collectionId: string): Promise<number> {
  const client = getPublicClient();
  const { count, error } = await client
    .from('photos')
    .select('*', { count: 'exact', head: true })
    .eq('collection_id', collectionId);

  if (error) throw error;
  return count ?? 0;
}
```

- [ ] **Step 4: Create profile query module**

`lib/db/profile.ts`:
```typescript
import { getPublicClient, getAdminClient } from './client';
import { DbProfile } from './types';

export async function getProfile(): Promise<DbProfile | null> {
  const client = getPublicClient();
  const { data, error } = await client
    .from('profile')
    .select('*')
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function updateProfile(updates: Partial<DbProfile>): Promise<DbProfile> {
  const client = getAdminClient();
  // Upsert the singleton row
  const existing = await getProfile();

  if (existing) {
    const { data, error } = await client
      .from('profile')
      .update(updates)
      .eq('id', existing.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  } else {
    const { data, error } = await client
      .from('profile')
      .insert(updates)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
}
```

- [ ] **Step 5: Create about sections query module**

`lib/db/about.ts`:
```typescript
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
```

- [ ] **Step 6: Commit**

```bash
git add lib/db/posts.ts lib/db/collections.ts lib/db/photos.ts lib/db/profile.ts lib/db/about.ts
git commit -m "feat: add database query modules for all content types"
```

---

## Phase 4: Server Actions & Upload API

### Task 10: Server Actions

**Files:**
- Create: `app/actions/posts.ts`
- Create: `app/actions/collections.ts`
- Create: `app/actions/photos.ts`
- Create: `app/actions/profile.ts`
- Create: `app/actions/about.ts`

- [ ] **Step 1: Create post actions**

`app/actions/posts.ts`:
```typescript
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
```

- [ ] **Step 2: Create collection actions**

`app/actions/collections.ts`:
```typescript
'use server';

import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/lib/auth';
import {
  createCollection,
  updateCollection,
  deleteCollection,
} from '@/lib/db/collections';
import { getPhotosByCollection } from '@/lib/db/photos';
import { deleteFile } from '@/lib/storage';
import { generateSlug } from '@/lib/slug';

export async function createCollectionAction(formData: {
  title: string;
  date: string;
  end_date?: string;
  location: string;
  description: string;
}) {
  await requireAuth();

  const slug = generateSlug(formData.title);
  const collection = await createCollection({
    slug,
    title: formData.title,
    date: formData.date,
    end_date: formData.end_date ?? null,
    location: formData.location,
    description: formData.description,
  });

  revalidatePath('/projects');
  revalidatePath('/');
  return collection;
}

export async function updateCollectionAction(
  id: string,
  updates: {
    title?: string;
    slug?: string;
    date?: string;
    end_date?: string | null;
    location?: string;
    description?: string;
    cover_photo_id?: string | null;
  }
) {
  await requireAuth();

  const collection = await updateCollection(id, updates);
  revalidatePath('/projects');
  revalidatePath(`/projects/${collection.slug}`);
  revalidatePath('/');
  return collection;
}

export async function deleteCollectionAction(id: string, slug: string) {
  await requireAuth();

  // Delete storage files for all photos in this collection
  const photos = await getPhotosByCollection(id);
  for (const photo of photos) {
    await deleteFile('gallery', photo.storage_path);
  }

  // Cascade delete handles DB rows
  await deleteCollection(id);
  revalidatePath('/projects');
  revalidatePath(`/projects/${slug}`);
  revalidatePath('/');
}
```

- [ ] **Step 3: Create photo actions**

`app/actions/photos.ts`:
```typescript
'use server';

import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/lib/auth';
import { createPhoto, deletePhoto, reorderPhotos } from '@/lib/db/photos';
import { deleteFile } from '@/lib/storage';

export async function createPhotoAction(photo: {
  collection_id: string | null;
  storage_path: string;
  filename: string;
  sort_order: number;
}) {
  await requireAuth();

  const newPhoto = await createPhoto({
    collection_id: photo.collection_id,
    storage_path: photo.storage_path,
    filename: photo.filename,
    alt: null,
    sort_order: photo.sort_order,
  });

  revalidatePath('/projects');
  if (photo.collection_id) {
    // We don't know the slug here, revalidate all project pages
    revalidatePath('/projects/[slug]', 'page');
  }
  revalidatePath('/');
  return newPhoto;
}

export async function deletePhotoAction(
  id: string,
  storagePath: string,
  collectionSlug?: string
) {
  await requireAuth();
  await deleteFile('gallery', storagePath);
  await deletePhoto(id);

  revalidatePath('/projects');
  if (collectionSlug) revalidatePath(`/projects/${collectionSlug}`);
  revalidatePath('/');
}

export async function reorderPhotosAction(
  updates: Array<{ id: string; sort_order: number }>,
  collectionSlug?: string
) {
  await requireAuth();
  await reorderPhotos(updates);

  if (collectionSlug) revalidatePath(`/projects/${collectionSlug}`);
}
```

- [ ] **Step 4: Create profile actions**

`app/actions/profile.ts`:
```typescript
'use server';

import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/lib/auth';
import { updateProfile } from '@/lib/db/profile';

export async function updateProfileAction(updates: {
  name?: string;
  bio?: string;
  photo_url?: string;
  email?: string;
  social?: { github?: string; linkedin?: string };
  cta?: { label?: string; href?: string };
  highlights?: Array<{ text: string; url?: string; label?: string }>;
}) {
  await requireAuth();
  const profile = await updateProfile(updates);

  revalidatePath('/');
  revalidatePath('/about');
  revalidatePath('/contact');
  return profile;
}
```

- [ ] **Step 5: Create about section actions**

`app/actions/about.ts`:
```typescript
'use server';

import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/lib/auth';
import {
  createAboutSection,
  updateAboutSection,
  deleteAboutSection,
} from '@/lib/db/about';
import { AboutSectionType } from '@/lib/db/types';

export async function createAboutSectionAction(section: {
  type: AboutSectionType;
  title: string;
  subtitle?: string;
  date_start?: string;
  date_end?: string;
  url?: string;
  content: Record<string, unknown>;
  sort_order: number;
}) {
  await requireAuth();
  const created = await createAboutSection({
    ...section,
    subtitle: section.subtitle ?? null,
    date_start: section.date_start ?? null,
    date_end: section.date_end ?? null,
    url: section.url ?? null,
  });

  revalidatePath('/about');
  return created;
}

export async function updateAboutSectionAction(
  id: string,
  updates: Partial<{
    title: string;
    subtitle: string | null;
    date_start: string | null;
    date_end: string | null;
    url: string | null;
    content: Record<string, unknown>;
    sort_order: number;
  }>
) {
  await requireAuth();
  const section = await updateAboutSection(id, updates);
  revalidatePath('/about');
  return section;
}

export async function deleteAboutSectionAction(id: string) {
  await requireAuth();
  await deleteAboutSection(id);
  revalidatePath('/about');
}
```

- [ ] **Step 6: Commit**

```bash
git add app/actions/
git commit -m "feat: add server actions for all content types"
```

---

### Task 11: Upload API Route

**Files:**
- Create: `app/api/upload/route.ts`

- [ ] **Step 1: Create the upload endpoint**

`app/api/upload/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { uploadFile, StorageBucket } from '@/lib/storage';

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const bucket = formData.get('bucket') as StorageBucket;
  const pathPrefix = formData.get('path') as string;
  const files = formData.getAll('files') as File[];

  if (!bucket || !files.length) {
    return NextResponse.json(
      { error: 'Missing bucket or files' },
      { status: 400 }
    );
  }

  const validBuckets: StorageBucket[] = ['gallery', 'covers', 'profile'];
  if (!validBuckets.includes(bucket)) {
    return NextResponse.json({ error: 'Invalid bucket' }, { status: 400 });
  }

  const results: Array<{ filename: string; url: string; storagePath: string }> = [];
  const errors: Array<{ filename: string; error: string }> = [];

  for (const file of files) {
    try {
      const storagePath = pathPrefix
        ? `${pathPrefix}/${file.name}`
        : file.name;

      const url = await uploadFile(bucket, storagePath, file);
      results.push({ filename: file.name, url, storagePath });
    } catch (err) {
      errors.push({
        filename: file.name,
        error: err instanceof Error ? err.message : 'Upload failed',
      });
    }
  }

  return NextResponse.json({ results, errors });
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/upload/route.ts
git commit -m "feat: add image upload API route"
```

---

## Phase 5: Migrate Page Data Sources

### Task 12: Migrate Homepage

**Files:**
- Modify: `app/(site)/page.tsx`
- Modify: `components/blog/PreviewList.tsx`
- Modify: `components/layout/Hero.tsx`

- [ ] **Step 1: Update Hero to fetch profile from DB**

Modify `components/layout/Hero.tsx`:
- Change from importing hardcoded `profile` object to accepting props
- Accept `profile: DbProfile` as a prop instead of reading from `lib/profile.ts`
- Render `profile.highlights` from the DB jsonb field

The Hero becomes a presentational component receiving data from its parent page.

```typescript
import { DbProfile } from '@/lib/db/types';
import Image from 'next/image';
import Link from 'next/link';

type Props = { profile: DbProfile };

export default function Hero({ profile }: Props) {
  // ... render profile.name, profile.bio, profile.highlights, etc.
  // Replace hardcoded highlights array with profile.highlights.map(...)
  // Replace profile.photo with profile.photo_url
  // Replace profile.cta with profile.cta
  // Replace profile.social with profile.social
}
```

- [ ] **Step 2: Update PreviewList to accept data as props**

Modify `components/blog/PreviewList.tsx`:
- Change from calling `getLatestPosts()` / `getAllCollections()` internally
- Accept `posts` and `collections` (with photo URLs already resolved) as props
- This makes it a pure presentational component

- [ ] **Step 3: Update homepage to fetch from Supabase**

Modify `app/(site)/page.tsx`:
```typescript
import { getPosts } from '@/lib/db/posts';
import { getCollections } from '@/lib/db/collections';
import { getPhotosByCollection } from '@/lib/db/photos';
import { getProfile } from '@/lib/db/profile';
import { getPublicUrl } from '@/lib/storage';
import Hero from '@/components/layout/Hero';
import PreviewList from '@/components/blog/PreviewList';

export const revalidate = 60;

export default async function HomePage() {
  const [profile, posts, collections] = await Promise.all([
    getProfile(),
    getPosts(),
    getCollections(),
  ]);

  const latestPosts = posts.slice(0, 2);
  const latestCollections = await Promise.all(
    collections.slice(0, 2).map(async (c) => {
      const photos = await getPhotosByCollection(c.id);
      return {
        ...c,
        photoCount: photos.length,
        coverUrl: c.cover_photo_id
          ? getPublicUrl('gallery', photos.find(p => p.id === c.cover_photo_id)?.storage_path ?? photos[0]?.storage_path ?? '')
          : photos[0] ? getPublicUrl('gallery', photos[0].storage_path) : '',
      };
    })
  );

  return (
    <>
      {profile && <Hero profile={profile} />}
      <PreviewList posts={latestPosts} collections={latestCollections} />
    </>
  );
}
```

- [ ] **Step 4: Verify homepage renders from database**

Run: `npm run dev`
Visit: `http://localhost:3000`
Expected: Homepage renders with data from Supabase (will be empty until migration script runs)

- [ ] **Step 5: Commit**

```bash
git add app/(site)/page.tsx components/layout/Hero.tsx components/blog/PreviewList.tsx
git commit -m "feat: migrate homepage to fetch from Supabase"
```

---

### Task 13: Migrate Blog Pages

**Files:**
- Modify: `app/(site)/blog/page.tsx`
- Modify: `app/(site)/blog/[slug]/page.tsx`

- [ ] **Step 1: Update blog index page**

Modify `app/(site)/blog/page.tsx`:
- Replace `getAllPosts()` / `getAllTags()` from `lib/content` with `getPosts()` / `getAllTags()` from `lib/db/posts`
- Add `export const revalidate = 60;`
- Pass `includeDrafts` based on session (check with `getSession()`)
- For authenticated users, include draft posts with a "Draft" badge

- [ ] **Step 2: Update blog detail page**

Modify `app/(site)/blog/[slug]/page.tsx`:
- Replace `getPostBySlug()` from `lib/content` with `getPostBySlug()` from `lib/db/posts`
- Replace `generateStaticParams` to use `getAllPostSlugs()` from `lib/db/posts`
- Add `export const revalidate = 60;`
- Add `export const dynamicParams = true;`
- Keep markdown rendering via `lib/markdown.ts` — the `content` field is still markdown

- [ ] **Step 3: Verify blog pages**

Run dev server and visit `/blog` and `/blog/[slug]`
Expected: pages render from database

- [ ] **Step 4: Commit**

```bash
git add app/(site)/blog/
git commit -m "feat: migrate blog pages to fetch from Supabase"
```

---

### Task 14: Migrate Gallery Pages

**Files:**
- Modify: `app/(site)/projects/page.tsx`
- Modify: `app/(site)/projects/[slug]/page.tsx`
- Modify: `components/ui/GalleryTabs.tsx`

- [ ] **Step 1: Update gallery index page**

Modify `app/(site)/projects/page.tsx`:
- Replace filesystem reads with `getCollections()`, `getMomentPhotos()`, `getPhotosByCollection()` from `lib/db/*`
- Compute photo URLs via `getPublicUrl('gallery', photo.storage_path)`
- Remove `fs` and `path` imports
- Add `export const revalidate = 60;`
- Pass resolved photo URLs to GalleryTabs instead of filenames

- [ ] **Step 2: Update GalleryTabs to use URLs**

Modify `components/ui/GalleryTabs.tsx`:
- Change `Collection.photos` from `string[]` (filenames) to `Array<{ id: string; url: string }>` (resolved URLs)
- Change `moments` from `string[]` (paths) to `Array<{ id: string; url: string }>` (resolved URLs)
- Update Image `src` to use the URL directly instead of constructing from slug + filename

- [ ] **Step 3: Update collection detail page**

Modify `app/(site)/projects/[slug]/page.tsx`:
- Replace `getCollectionBySlug()` from `lib/content` with `getCollectionBySlug()` + `getPhotosByCollection()` from `lib/db/*`
- Compute photo URLs with `getPublicUrl()`
- Replace `generateStaticParams` to use `getAllCollectionSlugs()` from `lib/db/collections`
- Add `export const revalidate = 60;` and `export const dynamicParams = true;`
- Keep `formatCollectionDate` utility (move to a shared `lib/dates.ts` or keep inline)

- [ ] **Step 4: Verify gallery pages**

Visit `/projects` and `/projects/[slug]`
Expected: gallery renders from database

- [ ] **Step 5: Commit**

```bash
git add app/(site)/projects/ components/ui/GalleryTabs.tsx
git commit -m "feat: migrate gallery pages to fetch from Supabase"
```

---

### Task 15: Migrate About Page

**Files:**
- Modify: `app/(site)/about/page.tsx`

- [ ] **Step 1: Rewrite about page to fetch from database**

Modify `app/(site)/about/page.tsx`:
- Remove all hardcoded data arrays (skills, experiences, education, publications, achievements)
- Import `getAboutSections` from `lib/db/about` and `getProfile` from `lib/db/profile`
- Fetch all sections grouped by type
- Add `export const revalidate = 60;`
- Render each section type using the same visual layout as currently hardcoded
- The `content` jsonb field holds section-specific data:
  - `experience`: `{ bullets: string[], location: string }`
  - `education`: `{ bullets: string[], gpa: string }`
  - `publication`: `{ bullets: string[] }`
  - `achievement`: `{ text: string }` (or just use `title`)
  - `skill_group`: `{ items: string[] }`
  - `interest`: `{ description: string }`

- [ ] **Step 2: Verify about page**

Visit `/about`
Expected: page renders from database with same layout

- [ ] **Step 3: Commit**

```bash
git add app/(site)/about/page.tsx
git commit -m "feat: migrate about page to fetch from Supabase"
```

---

### Task 16: Migrate Contact Page

**Files:**
- Modify: `app/(site)/contact/page.tsx`

- [ ] **Step 1: Split contact page into server + client components**

The contact page is currently `'use client'` and imports `profile.recipientEmail` statically. We need to:

1. Create a server component wrapper that fetches `profile.email` from DB
2. Pass it as a prop to the existing client component

Restructure `app/(site)/contact/page.tsx`:
```typescript
import { getProfile } from '@/lib/db/profile';
import ContactForm from './ContactForm';

export const revalidate = 60;

export default async function ContactPage() {
  const profile = await getProfile();
  const email = profile?.email ?? '';

  return <ContactForm recipientEmail={email} />;
}
```

Create `app/(site)/contact/ContactForm.tsx`:
- Move the existing `'use client'` contact page content here
- Accept `recipientEmail` as a prop instead of importing from `lib/profile`
- Everything else stays the same

- [ ] **Step 2: Verify contact page**

Visit `/contact`
Expected: form works, email populates from database

- [ ] **Step 3: Commit**

```bash
git add app/(site)/contact/
git commit -m "feat: migrate contact page to fetch email from Supabase"
```

---

## Phase 6: Admin UI Components

### Task 17: Editor Panel Shell

**Files:**
- Create: `components/admin/EditButton.tsx`
- Create: `components/admin/EditorPanel.tsx`

- [ ] **Step 1: Create EditButton component**

`components/admin/EditButton.tsx`:
```typescript
'use client';

import AuthGate from './AuthGate';

type Props = {
  onClick: () => void;
  className?: string;
};

export default function EditButton({ onClick, className = '' }: Props) {
  return (
    <AuthGate>
      <button
        onClick={onClick}
        className={`absolute top-3 right-3 z-10 bg-surface/80 dark:bg-surface-dark/80 backdrop-blur border border-border dark:border-border-dark rounded-full w-8 h-8 flex items-center justify-center text-ink-muted hover:text-ink dark:hover:text-ink-dark transition-colors ${className}`}
        title="Edit"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
        </svg>
      </button>
    </AuthGate>
  );
}
```

- [ ] **Step 2: Create EditorPanel component**

`components/admin/EditorPanel.tsx`:
```typescript
'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
};

export default function EditorPanel({ open, onClose, title, children }: Props) {
  const [width, setWidth] = useState(50); // percentage of viewport
  const dragging = useRef(false);

  const handleMouseDown = useCallback(() => {
    dragging.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      if (!dragging.current) return;
      const pct = ((window.innerWidth - e.clientX) / window.innerWidth) * 100;
      setWidth(Math.min(Math.max(pct, 30), 90));
    }
    function handleMouseUp() {
      dragging.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />

      {/* Panel */}
      <div
        className="absolute top-0 right-0 h-full bg-surface dark:bg-surface-dark border-l border-border dark:border-border-dark shadow-xl flex flex-col"
        style={{ width: `${width}vw` }}
      >
        {/* Drag handle */}
        <div
          className="absolute left-0 top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-ink/10 dark:hover:bg-ink-dark/10 transition-colors"
          onMouseDown={handleMouseDown}
        />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border dark:border-border-dark">
          <h2 className="font-display text-lg font-medium text-ink dark:text-ink-dark">
            {title}
          </h2>
          <div className="flex items-center gap-2">
            {/* Maximize */}
            <button
              onClick={() => setWidth(width >= 85 ? 50 : 90)}
              className="text-ink-muted hover:text-ink dark:hover:text-ink-dark transition-colors"
              title={width >= 85 ? 'Restore' : 'Maximize'}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d={width >= 85 ? "M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" : "M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"} />
              </svg>
            </button>
            {/* Close */}
            <button
              onClick={onClose}
              className="text-ink-muted hover:text-ink dark:hover:text-ink-dark transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {children}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add components/admin/EditButton.tsx components/admin/EditorPanel.tsx
git commit -m "feat: add EditButton and resizable EditorPanel components"
```

---

### Task 18: Post Editor

**Files:**
- Create: `components/admin/PostEditor.tsx`
- Create: `components/admin/MarkdownPreview.tsx`
- Modify: `app/(site)/blog/[slug]/page.tsx` — add edit button
- Modify: `app/(site)/blog/page.tsx` — add new post button

- [ ] **Step 1: Create MarkdownPreview component**

`components/admin/MarkdownPreview.tsx` — renders markdown to HTML using the existing remark pipeline from `lib/markdown.ts`. This is a client component that calls a server action or uses a lightweight client-side markdown renderer. For simplicity, use `remark` + `remark-html` client-side (they're already dependencies).

- [ ] **Step 2: Create PostEditor component**

`components/admin/PostEditor.tsx` — form with:
- Title input
- Slug input (auto-generated from title, editable)
- Date picker
- Summary textarea
- Tags input (comma-separated)
- Markdown content textarea (min-height 400px, auto-grows)
- Side-by-side or tabbed markdown preview
- Draft toggle (Publish/Unpublish button)
- Save / Cancel / Delete buttons
- Uses `createPostAction` or `updatePostAction` from `app/actions/posts`

- [ ] **Step 3: Wire edit buttons into blog pages**

- Blog index: add "+ New Post" button wrapped in AuthGate
- Blog detail: add EditButton that opens EditorPanel with PostEditor
- Both use `useState` for panel open/close

- [ ] **Step 4: Verify post editing flow**

1. Log in as admin
2. See "+ New Post" button on /blog
3. Click → editor panel opens → fill fields → save → post appears
4. Click edit on existing post → editor opens with existing data → modify → save
5. Toggle draft → post disappears for public, visible for admin

- [ ] **Step 5: Commit**

```bash
git add components/admin/PostEditor.tsx components/admin/MarkdownPreview.tsx app/(site)/blog/
git commit -m "feat: add inline post editor with markdown preview"
```

---

### Task 19: Collection Editor & Photo Uploader

**Files:**
- Create: `components/admin/CollectionEditor.tsx`
- Create: `components/admin/PhotoUploader.tsx`
- Create: `components/admin/MomentUploader.tsx`
- Modify: `app/(site)/projects/page.tsx` — add new collection button + moment uploader
- Modify: `app/(site)/projects/[slug]/page.tsx` — add edit + upload

- [ ] **Step 1: Create CollectionEditor**

`components/admin/CollectionEditor.tsx` — form with:
- Title, slug, location, date, end_date, description fields
- Cover photo selector (from uploaded photos)
- Delete button with confirmation
- Uses `createCollectionAction` / `updateCollectionAction`

- [ ] **Step 2: Create PhotoUploader**

`components/admin/PhotoUploader.tsx`:
- Drag-and-drop zone accepting multiple files
- Shows upload progress per file
- Calls `/api/upload` with `bucket=gallery` and `path=collections/{slug}`
- After upload, calls `createPhotoAction` for each file
- Shows thumbnails of uploaded photos
- Delete button per photo

- [ ] **Step 3: Create MomentUploader**

`components/admin/MomentUploader.tsx`:
- Similar to PhotoUploader but for moments
- Uploads to `gallery` bucket with path `moments/{filename}`
- Creates photo with `collection_id = null`

- [ ] **Step 4: Wire into gallery pages**

- Gallery index: "+ New Collection" button, MomentUploader on Moments tab (all wrapped in AuthGate)
- Collection detail: EditButton for collection metadata + PhotoUploader drop zone below photo grid

- [ ] **Step 5: Verify gallery editing flow**

1. Create new collection → fill metadata → save
2. Navigate to collection → drag-drop photos → they appear in grid
3. Edit collection metadata
4. Upload moments from Moments tab
5. Delete a photo → disappears from grid and storage

- [ ] **Step 6: Commit**

```bash
git add components/admin/CollectionEditor.tsx components/admin/PhotoUploader.tsx components/admin/MomentUploader.tsx app/(site)/projects/
git commit -m "feat: add collection editor and photo uploader"
```

---

### Task 20: Profile Editor

**Files:**
- Create: `components/admin/ProfileEditor.tsx`
- Modify: `components/layout/Hero.tsx` — add edit button

- [ ] **Step 1: Create ProfileEditor**

`components/admin/ProfileEditor.tsx` — form with:
- Name, bio, email fields
- Profile photo upload (single file → `profile` bucket)
- Social links (github, linkedin)
- CTA (label, href)
- Highlights list editor (add/remove/edit items, each with text + optional url + label)
- Uses `updateProfileAction`

- [ ] **Step 2: Add edit button to Hero**

Wrap an EditButton + EditorPanel with ProfileEditor in the Hero section, visible only when authenticated.

- [ ] **Step 3: Verify profile editing**

1. Log in → see edit pencil on hero section
2. Click → editor panel → change name → save → hero updates
3. Upload new profile photo → updates
4. Edit highlights → they update on homepage

- [ ] **Step 4: Commit**

```bash
git add components/admin/ProfileEditor.tsx components/layout/Hero.tsx
git commit -m "feat: add inline profile editor"
```

---

### Task 21: About Section Editor

**Files:**
- Create: `components/admin/AboutEditor.tsx`
- Modify: `app/(site)/about/page.tsx` — add edit/add buttons

- [ ] **Step 1: Create AboutEditor**

`components/admin/AboutEditor.tsx` — contextual form based on section `type`:
- Common fields: title, subtitle, date_start, date_end, url, sort_order
- Content editor adapts to type:
  - `experience` / `education`: bullet list editor + location/GPA
  - `publication`: bullet list editor
  - `achievement`: simple text
  - `skill_group`: tag list editor (add/remove items)
  - `interest`: description textarea
- Save / Cancel / Delete buttons
- Uses `createAboutSectionAction` / `updateAboutSectionAction` / `deleteAboutSectionAction`

- [ ] **Step 2: Wire into about page**

- EditButton on each section item (experience entry, education entry, etc.)
- "Add Section" button per type group
- EditorPanel with AboutEditor for create/edit

- [ ] **Step 3: Verify about editing**

1. Log in → see edit pencils on each about section
2. Edit an experience entry → save → page updates
3. Add new education entry → appears in list
4. Reorder items via sort_order
5. Delete an achievement → disappears

- [ ] **Step 4: Commit**

```bash
git add components/admin/AboutEditor.tsx app/(site)/about/page.tsx
git commit -m "feat: add inline about section editor"
```

---

## Phase 7: Migration & Cleanup

### Task 22: Data Migration Script

**Files:**
- Create: `scripts/migrate.ts`

- [ ] **Step 1: Write the migration script**

`scripts/migrate.ts`:
- Uses Node.js to read existing content files and upload to Supabase
- Reads `content/posts/*.md` → parse frontmatter → insert into `posts` table
- Reads `content/gallery/*.md` → parse frontmatter → insert into `collections` table
- Reads `public/images/gallery/{slug}/*.{jpg,png,webp}` → upload to `gallery` bucket → insert into `photos` table
- Reads `public/images/gallery/moments/*.{jpg,png,webp}` → upload to `gallery` bucket with path `moments/` → insert into `photos` with `collection_id = null`
- Reads hardcoded about page data from source → insert into `about_sections`
- Reads `lib/profile.ts` data → insert into `profile` table
- Extracts hero highlights from `components/layout/Hero.tsx` (hardcoded there, not in profile.ts) → stores in `profile.highlights` jsonb
- Uploads `public/images/profile.jpg` → `profile` bucket

Script should:
- Be idempotent (check for existing slugs before inserting)
- Log progress clearly
- Handle errors per-item without stopping the whole migration
- Run via `npx tsx scripts/migrate.ts`

- [ ] **Step 2: Install tsx as dev dependency**

```bash
npm install -D tsx
```

- [ ] **Step 3: Run the migration**

```bash
npx tsx scripts/migrate.ts
```

Expected: all content appears in Supabase dashboard (tables + storage buckets)

- [ ] **Step 4: Verify the site works from database**

Run `npm run dev` and check:
- Homepage shows profile, posts, collections
- Blog posts render correctly
- Gallery shows collections and moments
- About page shows all sections
- Contact page works

- [ ] **Step 5: Commit**

```bash
git add scripts/migrate.ts package.json package-lock.json
git commit -m "feat: add data migration script from filesystem to Supabase"
```

---

### Task 23: Cleanup Old Filesystem Code

**Files:**
- Remove dependency: `gray-matter` from `package.json`
- Modify: `lib/content.ts` — mark as deprecated or remove
- Keep: `content/` and `public/images/` as safety net (do NOT delete yet)

- [ ] **Step 1: Remove gray-matter dependency**

```bash
npm uninstall gray-matter
```

- [ ] **Step 2: Remove or deprecate old content loader**

Option A (safer): Add a comment at the top of `lib/content.ts`:
```typescript
// DEPRECATED: This file is no longer used. Data now comes from lib/db/*.
// Kept temporarily as a fallback reference. Remove after production verification.
```

Option B: Delete `lib/content.ts` and `lib/profile.ts` if all pages have been migrated.

Choose Option A for now — delete after production verification.

Note: `content/projects/` markdown files and the `Project` type in `lib/content.ts` are intentionally NOT migrated (per spec Non-Goals — projects were retired as a content type). They should be removed during final cleanup along with `ProjectCard.tsx`.

- [ ] **Step 3: Remove old imports**

Search all files for imports from `@/lib/content` and `@/lib/profile`. Replace any remaining references with the new `lib/db/*` modules.

- [ ] **Step 4: Verify build passes**

```bash
npm run build
```

Expected: build succeeds with no errors referencing old content modules

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: remove gray-matter, deprecate old filesystem content loader"
```

---

### Task 24: Final Verification & Production Readiness

- [ ] **Step 1: Full end-to-end test**

Run through every page and admin flow:
1. Homepage renders correctly
2. Blog index shows posts, tag filtering works
3. Blog detail renders markdown correctly
4. Gallery shows collections and moments
5. Collection detail shows photos in masonry grid
6. About page shows all sections
7. Contact page works with email from DB
8. Login → edit a post → save → page updates
9. Create new post as draft → publish → visible to public
10. Upload photos to a collection → they appear
11. Upload moments → they appear
12. Edit profile → hero updates
13. Edit about section → about page updates
14. Dark mode works throughout

- [ ] **Step 2: Check ISR works**

1. Edit a post via admin UI
2. Open an incognito window → visit the blog
3. Verify the change is reflected within seconds

- [ ] **Step 3: Commit any fixes**

```bash
git add -A
git commit -m "fix: address issues found during final verification"
```

- [ ] **Step 4: Push to remote**

```bash
git push origin main
```
