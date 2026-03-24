# Research: Personal Website

**Date**: 2025-11-09  
**Context**: Next.js + Tailwind static personal site. Content in Markdown from repo; deploy to Vercel; no backend.

## Decisions

1. App Router

- Decision: Use Next.js App Router with `app/` directory.
- Rationale: File‑system routing, server components support, simple nested layouts; ideal for static content.
- Alternatives: Pages Router — older pattern; perfectly viable but less aligned with current defaults.

2. Markdown Format

- Decision: Author posts in `.md` with YAML front‑matter. Allow optional `.mdx` in future but not required.
- Rationale: Keeps authoring simple; MDX can be added without breaking content.
- Alternatives: MDX only — increased complexity for minimal benefit.

3. Parsing/Rendering Toolchain

- Decision: `gray-matter` for front‑matter; `remark` + `rehype` plugins for Markdown → HTML; `reading-time` for estimates.
- Rationale: Stable, widely used, works at build time with static generation.
- Alternatives: Contentlayer — powerful, but adds tooling overhead; not needed for small scale.

4. Content Discovery & Ordering

- Decision: Build-time filesystem scan of `content/posts/*.md`; sort by `date` desc; derive slug from filename.
- Rationale: Deterministic static builds; no runtime file system access needed on Vercel.
- Alternatives: ISR or CMS — unnecessary for current constraints.

5. Tags & Filtering

- Decision: Tags as string array in front‑matter. Case‑insensitive; stored canonicalized (lowercase, hyphenated for URLs). Filter is client‑side on the prebuilt list.
- Rationale: Keeps routes static while enabling UX filter.
- Alternatives: Dynamic tag routes — possible but not required.

6. Reading Time

- Decision: 200 wpm default; include in post header.
- Rationale: Standard heuristic; adds helpful context.

7. Image Handling

- Decision: Store images in `public/images` and reference by path; use Next Image where feasible. Provide `alt` in front‑matter when used as cover.
- Rationale: Optimized images, stable paths.

8. Contact Flow

- Decision: `mailto:` to a configured recipient; subject `[Website] {Name}`; body includes name, email, message.
- Rationale: No backend; meets spec; graceful fallback if no default client.
- Alternatives: Client email services — not needed given clarified requirement.

9. Theme & Typography

- Decision: Light theme, generous whitespace, rounded sans (Inter or similar), blue accent; subtle background gradient on hero.
- Rationale: Matches desired “simple, modern, calm” vibe.

10. Deployment

- Decision: Deploy to Vercel as static site; build script creates static output; no special server configuration.
- Rationale: Owner will upload repo to Vercel; default settings suffice.

## Outstanding Risks

- None critical. Future MDX adoption may require small adjustments to parser pipeline.

**_ End of Research _**
