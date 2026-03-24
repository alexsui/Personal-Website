# Design Guide — Personal Website

This guide documents the design language used throughout the website. Follow these principles and patterns to maintain visual consistency when adding new pages or components.

## Design Philosophy

**Style:** Corporate Tech (inspired by Stripe, Linear, Vercel)

**Core Principles:**
- Clean and professional, but not boring
- High contrast for readability
- Generous whitespace
- Subtle animations for delight
- Consistent use of Sky Blue as the accent color

---

## Color Palette

### Primary Colors

| Name | Light Mode | Dark Mode | Usage |
|------|------------|-----------|-------|
| Primary | `#0ea5e9` | `#38bdf8` | Buttons, links, accents |
| Primary Light | `#e0f2fe` | `rgba(56, 189, 248, 0.1)` | Hover states, badges |

### Surface Colors

| Name | Light Mode | Dark Mode | Usage |
|------|------------|-----------|-------|
| Surface | `#ffffff` | `#0f172a` | Page background |
| Surface Secondary | `#f8fafc` | `#1e293b` | Cards, sections |

### Text Colors

| Name | Light Mode | Dark Mode | Usage |
|------|------------|-----------|-------|
| Ink | `#0f172a` | `#f1f5f9` | Headings, primary text |
| Ink Secondary | `#475569` | `#cbd5e1` | Body text, descriptions |
| Ink Muted | `#94a3b8` | `#64748b` | Dates, captions, placeholders |

### Border Colors

| Name | Light Mode | Dark Mode | Usage |
|------|------------|-----------|-------|
| Border | `#e2e8f0` | `#334155` | Card borders, dividers |

### CSS Variables

All colors are available as CSS variables in `globals.css`:

```css
:root {
  --surface: #ffffff;
  --surface-secondary: #f8fafc;
  --ink: #0f172a;
  --ink-secondary: #475569;
  --ink-muted: #94a3b8;
  --border: #e2e8f0;
  --primary: #0ea5e9;
  --primary-light: #e0f2fe;
}
```

---

## Typography

### Font Families

| Type | Font | Fallback |
|------|------|----------|
| Display (headings) | Outfit | system-ui, sans-serif |
| Body | System fonts | -apple-system, BlinkMacSystemFont, Segoe UI |

### Font Weights

- **Regular (400):** Body text
- **Medium (500):** Labels, nav items
- **Semibold (600):** Headings, card titles
- **Bold (700):** Page titles, hero text

### Heading Sizes

| Element | Size (Mobile) | Size (Desktop) |
|---------|---------------|----------------|
| H1 (Page title) | `text-4xl` (36px) | `text-5xl` (48px) |
| H2 (Section) | `text-2xl` (24px) | `text-2xl` (24px) |
| H3 (Card title) | `text-xl` (20px) | `text-xl` (20px) |

### Usage in Code

```tsx
// Page title
<h1 className="text-4xl sm:text-5xl font-display font-bold text-ink dark:text-ink-dark">
  Page Title
</h1>

// Section heading
<h2 className="text-2xl font-display font-semibold text-ink dark:text-ink-dark">
  Section Title
</h2>

// Body text
<p className="text-ink-secondary dark:text-ink-dark-secondary leading-relaxed">
  Body content here...
</p>
```

---

## Spacing

### Container

- Max width: `max-w-5xl` (1024px)
- Horizontal padding: `px-6` (24px)
- Applied via `.container` class

### Page Sections

- Vertical padding: `py-16` (64px) or `py-20` (80px) for hero
- Section gaps: `mb-12` (48px)

### Card Content

- Padding: `p-6` (24px)
- Internal gaps: `mb-3` to `mb-4` (12-16px)

---

## Components

### Cards

Cards use borders instead of heavy shadows. On hover, they lift slightly and show a subtle shadow.

```tsx
// Using the .card class from globals.css
<div className="card p-6">
  Card content
</div>

// Or with Tailwind directly
<div className="bg-white dark:bg-surface-dark-secondary border border-border dark:border-border-dark rounded-2xl p-6 transition-all duration-300 hover:shadow-card-hover hover:-translate-y-0.5">
  Card content
</div>
```

### Buttons

Two variants: Primary (filled) and Secondary (outlined).

```tsx
// Primary button
<Button href="/projects">View Projects</Button>

// Secondary button
<Button href="/contact" variant="secondary">Get in touch</Button>
```

**Primary Button Styles:**
- Background: `bg-primary-500`
- Text: White
- Hover: Darker blue + subtle shadow
- Border radius: `rounded-xl`

**Secondary Button Styles:**
- Background: White/transparent
- Border: `border-border`
- Hover: Light background + darker border

### Tags/Badges

Used for blog post categories and skills.

```tsx
// Using the .tag class from globals.css
<span className="tag">React</span>

// Or with Tailwind directly
<span className="px-3 py-1 text-xs font-medium bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 rounded-full">
  React
</span>
```

### Form Inputs

```tsx
// Using the .input class from globals.css
<input className="input" placeholder="Your name" />
<textarea className="input resize-none" rows={5} />
```

**Input Styles:**
- Background: White
- Border: `border-border`
- Border radius: `rounded-xl`
- Focus: Blue ring + blue border

---

## Shadows

Avoid heavy shadows. Use subtle, soft shadows for depth.

| Name | Value | Usage |
|------|-------|-------|
| `shadow-soft-sm` | Very subtle | Buttons at rest |
| `shadow-card` | Subtle depth | Cards at rest |
| `shadow-card-hover` | More pronounced | Cards on hover |
| `shadow-button-hover` | Subtle lift | Buttons on hover |

**Shadow Philosophy:**
- Cards should feel "lifted" not "heavy"
- Shadows appear/increase on interaction (hover)
- Dark mode shadows are more subtle

---

## Animations

### Built-in Animations

| Name | Duration | Effect |
|------|----------|--------|
| `animate-fade-in` | 0.5s | Fade in |
| `animate-fade-in-up` | 0.6s | Fade in + slide up |
| `animate-scale-in` | 0.4s | Fade in + scale |

### Usage

```tsx
// Page content fade in
<div className="animate-fade-in">...</div>

// Hero content slide up
<div className="animate-fade-in-up">...</div>

// Staggered children (auto-delays)
<div className="stagger-children">
  <div>First</div>  {/* delay: 0ms */}
  <div>Second</div> {/* delay: 50ms */}
  <div>Third</div>  {/* delay: 100ms */}
</div>
```

### Hover Transitions

All interactive elements should have smooth transitions:

```tsx
className="transition-all duration-200"  // Fast interactions
className="transition-all duration-300"  // Card hovers
```

---

## Icons

Use Heroicons (outline style, 24x24) for consistency.

```tsx
<svg
  className="w-5 h-5"
  fill="none"
  viewBox="0 0 24 24"
  stroke="currentColor"
  strokeWidth={2}
>
  <path strokeLinecap="round" strokeLinejoin="round" d="..." />
</svg>
```

**Common icon sizes:**
- Small (inline): `w-4 h-4`
- Medium (buttons): `w-5 h-5`
- Large (empty states): `w-6 h-6`

---

## Dark Mode

Dark mode is supported via Tailwind's `class` strategy. Always provide dark variants:

```tsx
// Example: text color with dark variant
className="text-ink dark:text-ink-dark"

// Example: background with dark variant
className="bg-white dark:bg-surface-dark-secondary"

// Example: border with dark variant
className="border-border dark:border-border-dark"
```

**Dark Mode Principles:**
- Use semantic color names (`ink`, `surface`) rather than raw colors
- Dark backgrounds should be navy (`#0f172a`), not pure black
- Primary blue should be lighter in dark mode for visibility

---

## Page Layout Pattern

Standard page layout structure:

```tsx
export default function PageName() {
  return (
    <div className="container py-16 animate-fade-in">
      {/* Page Header */}
      <div className="max-w-3xl mb-12">
        <h1 className="text-4xl sm:text-5xl font-display font-bold mb-4 text-ink dark:text-ink-dark">
          Page Title
        </h1>
        <p className="text-lg text-ink-secondary dark:text-ink-dark-secondary leading-relaxed">
          Page description or subtitle.
        </p>
      </div>

      {/* Page Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cards or content here */}
      </div>
    </div>
  );
}
```

---

## Do's and Don'ts

### Do

- Use the established color palette
- Maintain consistent spacing (multiples of 4px)
- Add hover states to interactive elements
- Support both light and dark modes
- Use the Outfit font for headings
- Keep animations subtle and purposeful

### Don't

- Use heavy drop shadows (no neumorphism)
- Use pure black (`#000000`) for text
- Mix different border radius sizes in the same section
- Add animations that distract from content
- Use colors outside the defined palette
- Forget dark mode variants

---

## File Reference

| File | Purpose |
|------|---------|
| `tailwind.config.js` | Color palette, shadows, animations, fonts |
| `app/globals.css` | CSS variables, component classes (`.card`, `.tag`, `.input`) |
| `components/ui/Button.tsx` | Button component with variants |
| `components/ui/ThemeToggle.tsx` | Light/dark mode toggle |

---

## Quick Reference: Common Class Combinations

```tsx
// Page title
"text-4xl sm:text-5xl font-display font-bold text-ink dark:text-ink-dark"

// Section heading
"text-2xl font-display font-semibold text-ink dark:text-ink-dark"

// Body text
"text-ink-secondary dark:text-ink-dark-secondary leading-relaxed"

// Muted text (dates, captions)
"text-sm text-ink-muted"

// Card
"card p-6"

// Card (manual)
"bg-white dark:bg-surface-dark-secondary border border-border dark:border-border-dark rounded-2xl p-6"

// Tag
"tag"

// Input
"input"

// Link with underline effect
"text-primary-600 dark:text-primary-400 hover:underline"

// Interactive hover (cards, buttons)
"transition-all duration-200 hover:-translate-y-0.5"
```
