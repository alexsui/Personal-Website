# Quickstart: Personal Website (Next.js + Tailwind)

## Prerequisites

- Node.js LTS
- npm or pnpm

## Setup

```bash
# from repo root
npm install  # or pnpm install
npm run dev  # starts Next.js locally
```

## Content Authoring

- Posts live under `content/posts/` as `.md` files with YAML front‑matter; see contracts/content-schema.md.
- Projects live under `content/projects/` as `.md` or a JSON list.
- Images go under `public/images/`.

## Routes

- `/` Home (hero + previews: 2 articles + 1 project)
- `/about` About (skills + timeline + resume download)
- `/projects` Projects list
- `/blog` Blog index with tag filter
- `/blog/[slug]` Post details
- `/contact` Contact form → `mailto:`

## Deploy

- Target: Vercel
- Framework preset: Next.js
- Build command: `npm run build`
- Output: default Next.js build (SSG)
- Environment: none required for baseline; configure recipient email in site settings when implementing mailto.

## Design Notes

- Light theme, generous whitespace, rounded sans (Inter or similar).
- Subtle light background gradient; blue accent for primary actions.
- Icons for GitHub and LinkedIn linking to provided URLs.

**_ End of Quickstart _**
