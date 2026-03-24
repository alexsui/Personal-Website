# Feature Specification: Personal Website

**Feature Branch**: `001-personal-website`  
**Created**: 2025-11-09  
**Status**: Draft  
**Input**: User description: "I want to build a personal webiste. This website do not need DB. Website Content Overview: Home: Introduce yourself with a profile photo, a short bio, and a call-to-action (e.g., “View Projects” or “Read Articles”). Below that, display previews of your latest articles or projects. About: A detailed self- introduction including your skills list and a timeline of your experiences. This part should include the resume download area for anyone interest to me can get my resume. Portfolio / Projects: Showcase your projects, each with an image, description, and link. Blog / Articles: A blog index page displaying the title, summary, and date of each post. Clicking on a post opens its full content page. Articles should be categorized by tags and read from the /posts folder in the repository. Contact: A simple contact form (integrated with EmailJS, no backend required), plus links to your social media profiles(LinkedIn, GitHub). I want to build in this design tone: note that I’m not mean the middle picture, but the whole vibe and front of the image."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Discover Me Quickly (Priority: P1)

A visitor lands on the Home page, immediately understands who I am from my name, photo and a short intro, and uses a clear call‑to‑action to reach Projects or Articles.

**Why this priority**: Establishes trust and drives visitors to core content.

**Independent Test**: From a clean session, open Home and click the CTA to reach the intended destination in one click; verify hero content and latest previews render.

**Acceptance Scenarios**:

1. Given a first‑time visitor on Home, When the page loads, Then a hero shows name, photo, short bio, and one primary CTA.
2. Given the Home page, When scrolling below the hero, Then the latest previews (projects or posts) display with title, date and link.

---

### User Story 2 - Read an Article (Priority: P1)

A visitor browses the Blog index, opens an article, and reads full content with metadata and tags.

**Why this priority**: Articles are a primary channel to demonstrate expertise.

**Independent Test**: From Blog index, open any listed article and confirm title, date, tags and full content display correctly.

**Acceptance Scenarios**:

1. Given the Blog index, When the visitor clicks a post title or card, Then the post detail loads with full content, date, and tags.
2. Given a post detail, When a tag is clicked, Then the visitor sees a list filtered by that tag.

---

### User Story 3 - Explore Projects (Priority: P2)

A visitor opens the Projects page to scan featured work, view a project card, and follow a link to a demo or repository.

**Why this priority**: Projects showcase capability and drive opportunities.

**Independent Test**: Open Projects, verify each card contains image, title, description and link that opens in a new tab.

**Acceptance Scenarios**:

1. Given the Projects page, When it renders, Then at least one project card with image, title, description and external link displays.
2. Given a project card, When the link is clicked, Then an external page opens in a new tab.

---

### User Story 4 - Learn Background & Download Resume (Priority: P2)

A visitor opens About to read a longer bio, skills, and a timeline of experiences, and downloads a PDF resume.

**Why this priority**: Enables hiring decisions with a clear document of record.

**Independent Test**: Open About and click “Download Resume”; verify a PDF downloads successfully.

**Acceptance Scenarios**:

1. Given the About page, When it loads, Then skills and a chronological experience timeline display.
2. Given the About page, When “Download Resume” is clicked, Then a PDF file downloads without error.

---

### User Story 5 - Get in Touch (Priority: P2)

A visitor fills out a simple contact form and receives confirmation that the message was sent, or a helpful error if it fails.

**Why this priority**: Converts interest into conversations.

**Independent Test**: Submit valid name, email, and message; verify an on‑page notice appears and the default email client opens with a prefilled draft. Simulate environments without a default email client to see fallback guidance.

**Acceptance Scenarios**:

1. Given the Contact page, When required fields are valid and the visitor clicks Send, Then their default email client opens with a prefilled draft addressed to the configured recipient and an on‑page notice confirms that a draft was opened.
2. Given a device without a configured email client or when the mailto action is blocked, When Send is clicked, Then a non‑blocking error appears with fallback actions (copy email address, copy message, or reveal a direct mailto link) and the user’s typed input remains intact.

---

### User Story 6 - Find Content by Tag (Priority: P3)

A visitor filters blog posts by a tag from the index or a post page.

**Why this priority**: Improves discoverability and reduces bounce.

**Independent Test**: Click any tag badge and confirm only posts with that tag are listed.

**Acceptance Scenarios**:

1. Given the Blog index, When a tag is selected, Then the list updates to show only posts with that tag and the selection is visible.

### Edge Cases

- No posts exist in `/posts`: Blog index displays a friendly empty state and suggests creating the first post.
- Missing or malformed post metadata: Post is skipped from lists and a console/build warning is surfaced to the maintainer.
- Duplicate slugs: The later file wins with a warning; links remain unique.
- No default email client available / mailto blocked: Show fallback actions (copy email address/message, reveal direct mailto link) and preserve form input.
- Resume file missing: Download button is disabled with a note to check back soon.
- Images fail to load: Show placeholders with alt text; layout remains stable.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: Provide a Home page with a hero section including name, profile photo, a 1–2 sentence bio, and one primary CTA button.
- **FR-002**: Show up to 3 latest previews beneath the hero. Previews include title, date (for posts) or role/year (for projects), short summary, and a link.
- **FR-003**: Provide an About page with an extended bio, a structured skills list (grouped), and a chronological experience timeline with organization, role, and dates.
- **FR-004**: Include a “Download Resume” button that serves a PDF file from the site and triggers a file download.
- **FR-005**: Provide a Projects page listing project cards with image/thumbnail, title, short description, optional tags, and an external link opening in a new tab.
- **FR-006**: Provide a Blog index that reads content files from a `/posts` folder in the repository and lists each post with title, summary/excerpt, date, and tags; list ordered by newest first.
- **FR-007**: Opening a blog post displays the full content with title, date, tags, and an estimated reading time; internal links and images render correctly.
- **FR-008**: Enable tag-based filtering from the Blog index and from a post page (clicking a tag shows a filtered list of posts with that tag).
- **FR-009**: Provide a Contact page with a form containing Name, Email, and Message fields; client‑side validation prevents submission until fields are valid.
- **FR-010**: Submitting the Contact form constructs a `mailto:` link that opens the visitor’s default email client with a prefilled draft to the site owner’s configured recipient address; the draft includes subject and body composed from the form fields.
- **FR-011**: After invoking `mailto:`, show an on‑page notice that an email draft was opened; if the action is blocked or no client is configured, show clear fallback actions (copy address/message or open a direct mail link) without losing typed content.
- **FR-012**: Global navigation includes Home, About, Projects, Blog, and Contact, and indicates the current page.
- **FR-013**: Footer includes icon links to GitHub and LinkedIn: GitHub `https://github.com/alexsui`, LinkedIn `https://www.linkedin.com/in/samuel-toh-1510031a1/`.
- **FR-014**: Design tone reflects a calm, airy marketing‑site vibe: generous whitespace, soft light background (subtle gradients), rounded typography, clean iconography, and friendly micro‑interactions; avoid busy illustrations in hero.
- **FR-015**: Basic SEO: per‑page titles and descriptions, open‑graph metadata for shareable pages, canonical URLs, and valid sitemap/robots as appropriate to a static site.
- **FR-016**: Accessibility: All images have alt text, interactive elements are keyboard‑navigable, focus states are visible, and color contrast is sufficient for common text sizes.
- **FR-017**: Performance: Initial content and navigation feel instant on typical consumer connections; avoid blocking assets that delay first paint.
- **FR-018**: Content maintenance: Adding a file to `/posts` with required metadata automatically includes it in the index without code changes.
- **FR-019**: Home page previews use a balanced mix by default: show the two latest articles and one latest project (newest overall first). This mix is configurable.

### Key Entities \*(include if feature involves data)

- **Post**: slug (derived from filename), title, date, summary/excerpt, tags[], cover image (optional), content body, reading time (derived), draft flag (optional; drafts excluded from lists).
- **Project**: id/slug, title, short description, image/thumbnail, tags/stack[], external link (demo or repository), year/period, optional highlights.
- **Profile**: name, short bio, profile photo, resume path, social links (LinkedIn, GitHub).
- **Experience Item**: organization, role/title, start date, end date (or present), brief description/highlights.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: 95% of first‑time visitors can identify who the site is about and reach Projects or Blog from the Home CTA within 10 seconds.
- **SC-002**: 95% of visitors who click Send on the Contact form see their email client open with a prefilled draft within 3 seconds; when blocked/unavailable, a fallback notice and actions appear within 1 second.
- **SC-003**: New content appears on the Blog index within 1 minute of adding a file to `/posts` (no code changes required).
- **SC-004**: Resume downloads succeed for 99% of clicks over a 30‑day period (no broken link incidents).
- **SC-005**: Blog index and post pages are readable and navigable via keyboard only; basic screen‑reader announcements exist for key landmarks (verified by manual check).
- **SC-006**: Perceived page load is “instant” for 90% of sessions on typical home broadband (primary content visible within ~2 seconds); no layout shift disrupts reading.

## Assumptions & Dependencies

- The site is static and requires no database or server‑side code.
- Blog posts are Markdown files in a repository `/posts` directory with front‑matter fields: `title`, `date`, `summary`, `tags`, optionally `cover` and `draft`.
- The resume is a PDF asset served from the site (e.g., `public/resume.pdf`).
- Contact uses `mailto:` with a recipient address configurable by the site owner; no third‑party delivery provider is required.
- Final LinkedIn and GitHub URLs will be provided by the site owner.
- Visual design follows the referenced vibe: light, calm, minimal, rounded typography, subtle gradients, and small friendly iconography (no central illustration required).
