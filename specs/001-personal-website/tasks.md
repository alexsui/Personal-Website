# Tasks: Personal Website

**Input**: Design documents from `specs/001-personal-website/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Not requested; omitted to keep scope lean. Each story includes independent test criteria.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize project structure and styling system

- [x] T001 Create directories: `app/(site)/`, `components/ui/`, `components/layout/`, `components/blog/`, `lib/`, `content/posts/`, `content/projects/`, `public/images/`
- [x] T002 Create Tailwind configs `tailwind.config.js` and `postcss.config.js` with color tokens per plan
- [x] T003 [P] Create `app/globals.css` with Tailwind base, container and gradient helpers
- [x] T004 [P] Add formatting configs: `.prettierrc`, `.eslintrc.json`
- [x] T005 [P] Add placeholder resume at `public/resume.pdf`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core layout, content pipeline, and shared components

- [x] T006 Create `app/(site)/layout.tsx` with header/footer shell and default `metadata`
- [x] T007 [P] Implement header nav in `components/layout/Header.tsx` (Home, About, Projects, Blog, Contact)
- [x] T008 [P] Implement footer with social icons in `components/layout/Footer.tsx` (GitHub, LinkedIn)
- [x] T009 [P] Create `components/ui/Button.tsx` for primary/secondary buttons
- [x] T010 [P] Create `components/ui/Card.tsx` for cards with image, title, meta, actions
- [x] T011 Implement Markdown pipeline in `lib/markdown.ts` using remark/rehype
- [x] T012 Implement content loaders in `lib/content.ts` (getAllPosts, getPostBySlug, getAllTags, getLatestPosts, getAllProjects, getLatestProjects)
- [x] T013 [P] Seed example post `content/posts/hello-world.md` with front‑matter (title, date, summary, tags)
- [x] T014 [P] Seed example project `content/projects/sample-project.md` with fields (title, description, link, image, year)
- [x] T015 Add profile and site constants in `lib/profile.ts` (name, bio, photo, recipientEmail, social links)
- [x] T016 [P] Add SEO helpers in `lib/seo.ts` (pageTitle, openGraph helpers)

**Checkpoint**: Foundation ready — user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Discover Me Quickly (Priority: P1) 🎯 MVP

**Goal**: Home page introduces owner and routes visitors to Projects or Blog. Shows mixed previews (2 articles + 1 project).

**Independent Test**: Load `/` → see hero (name, photo, bio, primary CTA) and previews below; CTA navigates to intended page in one click.

### Implementation

- [x] T017 [US1] Create hero component `components/layout/Hero.tsx` with name, photo, bio, primary CTA
- [x] T018 [P] [US1] Create previews component `components/blog/PreviewList.tsx` to render 2 posts + 1 project
- [x] T019 [US1] Implement Home page in `app/(site)/page.tsx` using loaders from `lib/content.ts`
- [x] T020 [US1] Add subtle gradient/background styling for hero in `app/globals.css`

**Checkpoint**: User Story 1 functional and independently testable

---

## Phase 4: User Story 2 - Read an Article (Priority: P1)

**Goal**: Blog index lists posts with title, date, summary, tags; clicking opens full post with reading time.

**Independent Test**: Visit `/blog` to see post cards. Click a post to view `/blog/[slug]` with content, date, tags, reading time.

### Implementation

- [x] T021 [US2] Create post card component `components/blog/PostCard.tsx`
- [x] T022 [P] [US2] Create tag badge component `components/blog/TagBadge.tsx`
- [x] T023 [US2] Implement blog index page `app/(site)/blog/page.tsx` with list sorted by date
- [x] T024 [US2] Implement post details page `app/(site)/blog/[slug]/page.tsx` using `lib/markdown.ts`
- [x] T025 [P] [US2] Clicking a tag navigates to `/blog?tag={tag}` (from card and post page)

**Checkpoint**: Blog index and post pages fully functional

---

## Phase 5: User Story 3 - Explore Projects (Priority: P2)

**Goal**: Projects page shows cards with image, title, description and an external link opening in a new tab.

**Independent Test**: Visit `/projects` and click a card link to open external page in new tab.

### Implementation

- [x] T026 [US3] Create project card `components/ui/ProjectCard.tsx`
- [x] T027 [US3] Implement projects page `app/(site)/projects/page.tsx` listing projects from `lib/content.ts`
- [ ] T028 [P] [US3] Ensure external links use `target="_blank" rel="noopener noreferrer"`

**Checkpoint**: Projects page functional and independently testable

---

## Phase 6: User Story 4 - Learn Background & Download Resume (Priority: P2)

**Goal**: About page shows extended bio, skills, experience timeline, and resume download.

**Independent Test**: Visit `/about` → see sections and a working “Download Resume” button.

### Implementation

- [x] T029 [US4] Implement About page `app/(site)/about/page.tsx` with bio, skills list, experience timeline (data from `lib/profile.ts`)
- [x] T030 [P] [US4] Add resume download link to `public/resume.pdf` in `app/(site)/about/page.tsx`

**Checkpoint**: About page complete with resume download

---

## Phase 7: User Story 5 - Get in Touch (Priority: P2)

**Goal**: Contact form validates input and opens the visitor’s email client with a prefilled draft; fallback when mail client is unavailable.

**Independent Test**: Submit valid form on `/contact` → mail client opens with prefilled message; when blocked, see fallback actions with preserved inputs.

### Implementation

- [x] T031 [US5] Implement mailto builder `lib/mailto.ts` (subject/body encoding)
- [x] T032 [US5] Implement contact page `app/contact/page.tsx` with Name/Email/Message and client-side validation
- [x] T033 [P] [US5] Add fallback actions (copy address/message, direct link) when `mailto:` is unavailable

**Checkpoint**: Contact flow complete and independently testable

---

## Phase 8: User Story 6 - Find Content by Tag (Priority: P3)

**Goal**: Filter posts by tag from blog index or a post page.

**Independent Test**: Click any tag to load `/blog?tag={tag}` and see only posts with that tag; selection is visible.

### Implementation

- [x] T034 [US6] Implement client-side tag filter state + query param handling in `app/(site)/blog/page.tsx`
- [x] T035 [P] [US6] From post page `app/(site)/blog/[slug]/page.tsx`, tag click routes to `/blog?tag={tag}`

**Checkpoint**: Tag filtering functional and independently testable

---

## Phase 9: Polish & Cross‑Cutting

**Purpose**: Finalize SEO, accessibility, and performance polish

- [ ] T036 Add per‑page metadata exports using `lib/seo.ts` in `app/(site)/*`
- [ ] T037 [P] Accessibility pass: alt text, labels, keyboard focus visible across components in `components/**`
- [ ] T038 [P] Optimize images using Next Image in `components/blog/PostCard.tsx`, `components/ui/ProjectCard.tsx`, and hero
- [ ] T039 Implement static sitemap in `app/sitemap.ts` including posts and projects
- [ ] T040 Update validation steps in `specs/001-personal-website/quickstart.md` (manual test checklist)
- [ ] T041 Review and refine styles in `app/globals.css` to match the calm, airy tone

---

## Dependencies & Execution Order

### Phase Dependencies

- Setup → Foundation → User Stories → Polish
- User stories can proceed in parallel after Foundation; recommended order by priority: US1, US2 (P1) → US3, US4, US5 (P2) → US6 (P3)

### User Story Dependency Graph

- US1 (Home) — no deps after Foundation
- US2 (Blog) — no deps after Foundation
- US3 (Projects) — no deps after Foundation
- US4 (About/Resume) — no deps after Foundation
- US5 (Contact) — no deps after Foundation
- US6 (Tag Filter) — depends on US2 pages existing

### Parallel Execution Examples

- During Foundation: T007, T008, T009, T010, T013, T014, T016 can run in parallel
- For US2: T021 and T022 can run in parallel before T023; T025 can run in parallel with T024
- For US1: T018 can run in parallel with T017

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 and Phase 2
2. Implement Phase 3 (US1) and validate
3. Optional: Deploy to Vercel for a first demo

### Incremental Delivery

1. Add US2 (Blog) → demo
2. Add US3 (Projects) → demo
3. Add US4 (About/Resume) → demo
4. Add US5 (Contact) → demo
5. Add US6 (Tag Filter) → demo

---

## Summary & Validation

- All tasks follow required checklist format with IDs, [P] markers, and [US#] labels for story phases.
- Each story includes independent test criteria and can be implemented/tested in isolation after Foundation.

**_ End of Tasks _**
