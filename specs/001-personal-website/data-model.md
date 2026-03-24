# Data Model: Personal Website

**Source of truth**: specs/001-personal-website/spec.md

## Entities

### Post

- slug: string (filename without extension; unique)
- title: string (required)
- date: ISO 8601 date (required)
- summary: string (required)
- tags: string[] (lowercase canonicalization)
- cover: string (optional path under `public/`)
- draft: boolean (default false; excluded from lists)
- readingTime: number (minutes, derived at build)
- content: Markdown body (rendered to HTML during build)

Validation

- `title`, `date`, `summary` present
- `date` not in the future for published posts
- `tags` normalized to lowercase; empty tags removed

### Project

- slug: string (filename or derived id; unique)
- title: string (required)
- description: string (required)
- image: string (optional path under `public/`)
- tags: string[]
- link: string (URL; external; opens in new tab)
- year: string (e.g., "2023")

Validation

- `title`, `description`, `link` present
- `link` is https URL

### Profile

- name: string
- bio: string (short)
- photo: string (path)
- resume: string (path to PDF)
- social: { github: url, linkedin: url }

### ExperienceItem

- organization: string
- role: string
- startDate: string (YYYY-MM)
- endDate: string | "present"
- summary: string

## Relationships

- Post has many tags (string taxonomy). Tag pages are client‑side filtered views.
- Profile owns social links and resume.

## Derived/Indexes

- Posts sorted by `date` desc.
- Tag index built from union of `tags` across non‑draft posts.

**_ End of Data Model _**
