# Content Schema Contracts

## Post (Markdown front‑matter)

```yaml
# content/posts/my-post.md
---
slug: my-post # optional; defaults to filename
title: My Post Title # required
summary: One‑line teaser. # required
date: 2025-01-15 # required (ISO 8601)
tags: [nextjs, personal]
cover: /images/covers/x.png # optional path under public/
draft: false # optional, defaults false
---
# Markdown body follows...
```

Rules

- `title`, `summary`, `date` required
- `tags` are strings; canonicalize to lowercase
- If `slug` omitted, derive from filename

## Project (Markdown front‑matter or JSON)

```yaml
# content/projects/my-project.md
---
slug: my-project
title: My Project
description: Short description of the project.
link: https://example.com/demo
image: /images/projects/my.png
year: '2024'
tags: [react, ui]
---
# Optional extended body
```

Rules

- `title`, `description`, `link` required
- `link` must be https URL
- If JSON is preferred, use the same field names

**_ End of Contracts _**
