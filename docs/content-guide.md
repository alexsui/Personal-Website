# Content & Configuration Guide — Personal Website

This guide explains how to replace placeholder content with your real information after the project is scaffolded.

Repository paths below reflect the planned project layout.

## Quick Map (what to edit)

- Profile, social links, contact email: `lib/profile.ts`
- Resume PDF file: `public/resume.pdf`
- Home hero CTA text/target: `lib/profile.ts` (cta settings)
- Blog posts (Markdown): `content/posts/*.md`
- Project entries (Markdown): `content/projects/*.md` (or JSON later)
- Images/assets: `public/images/**`
- Site colors/spacing: `tailwind.config.js`
- Global styles (typography, component classes): `app/globals.css`
- Per‑page titles/description: route `metadata` export or helpers in `lib/seo.ts`

## 1) Profile & Social links

Edit `lib/profile.ts` (will be created during scaffolding) and set:

```ts
export const profile = {
  name: 'Your Name',
  bio: 'Short intro (1–2 sentences)',
  photo: '/images/profile.jpg', // place the file in public/images/
  recipientEmail: 'you@example.com', // used by mailto in Contact
  social: {
    github: 'https://github.com/alexsui',
    linkedin: 'https://www.linkedin.com/in/samuel-toh-1510031a1/',
  },
  cta: { label: 'View Projects', href: '/projects' },
};
```

- Replace `name`, `bio`, and `photo` with your real info.
- Set `recipientEmail` to receive Contact messages.
- Update `cta` if you want the Home button to point to Blog instead.

## 2) Resume

- Replace `public/resume.pdf` with your real PDF file (keep the same filename or update the About page link).

## 3) Blog posts (Markdown)

Create files in `content/posts/` using this front‑matter:

```yaml
---
# filename: hello-world.md (slug derived from filename unless you set slug)
slug: hello-world # optional; defaults to filename
title: Hello World # required
summary: One‑line teaser. # required
date: 2025-01-15 # required (YYYY-MM-DD)
tags: [nextjs, personal]
cover: /images/covers/hello.png # optional (under public/)
draft: false # optional; drafts hidden from lists
---
Your Markdown content here…
```

Rules:

- `title`, `summary`, and `date` are required.
- Tags are case‑insensitive; they’re normalized to lowercase for filtering.
- Images should live under `public/images/**` and be referenced by absolute path (e.g., `/images/…`).

## 4) Projects

Create files in `content/projects/`:

```yaml
---
slug: my-project
title: My Project
description: Short description of the project.
link: https://example.com/demo # opens in new tab
image: /images/projects/my.png
year: '2024'
tags: [react, ui]
---
(Optional longer notes in Markdown)
```

Rules:

- `title`, `description`, and `link` are required.
- Use HTTPS links. Thumbnails should be placed under `public/images/projects/`.

## 5) Images

- Put all images in `public/images/…`.
- Prefer reasonably sized images (≤ 200KB for covers where possible). The site uses optimized rendering to keep pages fast.

## 6) Colors, fonts, and vibe

- Open `tailwind.config.js` and adjust your theme tokens (primary, surface, ink, border) to customize the color palette.
- Tweak typography and component classes (`.card`, `.tag`, `.input`) in `app/globals.css`.
- Fonts:
  - **Headings:** Outfit (loaded from Google Fonts in `globals.css`)
  - **Body:** System fonts for fast loading
- See `docs/design-guide.md` for the full design system documentation.

## 7) SEO basics

- Each route exports `metadata` or uses helpers in `lib/seo.ts`.
- Update the site title/description and add meaningful Open Graph images for Home and Blog posts if you want rich link previews.

## 8) Contact behavior (mailto)

- The Contact form creates a `mailto:` draft to `profile.recipientEmail`.
- If a device has no default mail client, the page shows fallback actions (copy address/message or open a direct link).

## 9) Preview & Deploy

```bash
npm install
npm run dev    # http://localhost:3000
npm run build  # verify it builds successfully before deploying
```

Deploy to Vercel using the Next.js preset. No environment variables are required for the baseline setup.

## Troubleshooting

- A post isn’t showing on the Blog index:
  - Ensure `draft: false` (or omitted), required fields are present, and `date` is valid.
- A tag filter shows nothing:
  - Check that tags are spelled the same across posts (they are normalized to lowercase).
- Resume link doesn’t work:
  - Ensure `public/resume.pdf` exists and the About page points to it.

---

If you’d like, I can scaffold the project now so these files exist and you can start replacing the placeholders immediately.
