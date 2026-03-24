# Implementation Plan: Personal Website

**Branch**: `001-personal-website` | **Date**: 2025-11-09 | **Spec**: specs/001-personal-website/spec.md
**Input**: Feature specification from `specs/001-personal-website/spec.md`

## Summary

Build a static personal website using Next.js and Tailwind CSS with a light, modern style inspired by the referenced design. Content is authored in Markdown files within the repository and rendered into pages at build time (no backend, no database). Deploy to Vercel. Contact uses a mailto flow (prefilled draft in the visitor’s email client). Home previews show a mix: two latest articles and one latest project.

## Technical Context

**Language/Version**: TypeScript (Node.js LTS)  
**Primary Dependencies**: Next.js (App Router), Tailwind CSS, remark/rehype Markdown toolchain, gray-matter (front‑matter), reading-time (estimate)  
**Storage**: None (static files in repo). Content read from `/posts` at build time; project data as JSON/markdown in repo.  
**Testing**: Unit tests for utilities; basic component tests; optional Playwright smoke for routes (home, blog index, post, projects, about, contact).  
**Target Platform**: Web, deployed on Vercel (static generation with optional ISR disabled by default).  
**Project Type**: Web single app (frontend only).  
**Performance Goals**: Primary content visible within ~2s on typical broadband; minimal layout shift; images optimized via Next Image or static assets.  
**Constraints**: No backend, no database, client-only contact via `mailto:`; accessibility targets from spec; SEO basics per page.  
**Scale/Scope**: Single author; <500 posts; low concurrency; repo-managed content.

Open decisions resolved in research (below):

- App Router vs Pages Router → App Router
- Markdown vs MDX → Markdown (.md) with optional MDX support for future
- Content indexing approach → Build-time filesystem scan; SSG only
- Tag filtering approach → Client-side filter on prebuilt lists
- Font and palette → Modern, rounded sans (e.g., Inter), light gray surface with blue accent

## Constitution Check

Gate summary (based on repo constitution placeholders and spec):

- Simplicity: PASS — single frontend app, static generation, no backend.
- Observability/Versioning: N/A for static site; basic console warnings during build acceptable.
- Test‑First: PARTIAL — lightweight tests planned (utilities/components). No heavy integration tests required.

Conclusion: Proceed. No violations requiring justification.

## Project Structure

### Documentation (this feature)

```text
specs/001-personal-website/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── contracts/           # Phase 1 output (content schemas, no backend APIs)
```

### Source Code (repository root)

```text
app/                      # Next.js App Router
├── (site)/               # Route group for layout
│  ├── layout.tsx
│  ├── page.tsx           # Home
│  ├── about/page.tsx
│  ├── projects/page.tsx
│  ├── blog/page.tsx      # Blog index + tag filter
│  └── blog/[slug]/page.tsx
├── contact/page.tsx
├── globals.css           # Tailwind base
components/
├── ui/                   # Buttons, cards, badges
├── layout/               # Header, Footer, Container
├── blog/                 # Post card, Tag list
lib/
├── content.ts            # FS loaders, parsing, caching
├── markdown.ts           # remark/rehype pipeline
content/
├── posts/                # Markdown posts with front‑matter
└── projects/             # Project entries (markdown or JSON)
public/
├── images/
└── resume.pdf
```

**Structure Decision**: Single Next.js app using the App Router with content stored under `content/` and exposed via lib utilities. Blog uses filesystem content at build time; no server APIs are created.

## Complexity Tracking

No constitution violations; section not used.
