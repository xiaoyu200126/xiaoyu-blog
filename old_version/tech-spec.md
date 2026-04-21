# 落笔阁 (LuoBiGe) — Technical Specification

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| react | ^19.0.0 | UI framework |
| react-dom | ^19.0.0 | DOM renderer |
| react-router-dom | ^7.0.0 | Client-side routing (Home, About, Archives) |
| gsap | ^3.12.0 | Animation engine (ScrollTrigger, timelines) |
| lenis | ^1.2.0 | Smooth scroll with inertia |
| lucide-react | ^0.460.0 | Icon library (Menu, Arrow, Mail, etc.) |
| tailwindcss | ^4.0.0 | Utility-first CSS |
| @tailwindcss/vite | ^4.0.0 | Tailwind Vite integration |
| typescript | ^5.6.0 | Type safety |
| vite | ^6.0.0 | Build tool |
| @types/react | ^19.0.0 | React types |
| @types/react-dom | ^19.0.0 | ReactDOM types |

No shadcn/ui components — this is a fully custom design with no standard UI patterns (no forms, dialogs, tables, or dropdowns).

---

## Component Inventory

### Layout

| Component | Source | Notes |
|-----------|--------|-------|
| AppLayout | Custom | Wraps all pages: Lenis provider, magnetic cursor, navigation, footer |
| Header | Custom | Minimal top bar with site logo (text-only) and hamburger menu trigger |
| MobileMenu | Custom | Full-screen overlay menu with staggered link reveals |
| Footer | Custom | Large subscribe input + minimal link columns |

### Sections (Page-specific)

| Component | Source | Notes |
|-----------|--------|-------|
| HeroSection | Custom | 100vh, Letterpress effect, no images |
| FeaturedArchive | Custom | 150vh scroll area, 3 articles in asymmetric grid with parallax |
| VisualStorytelling | Custom | Dark background section, CMYK scatter polaroid array |

### Reusable Components

| Component | Source | Used By |
|-----------|--------|---------|
| MagneticCursor | Custom | AppLayout (global) — custom cursor with hover expansion + magnetic snap |
| PolaroidFrame | Custom | VisualStorytelling — image container with 4 CMYK overlay layers |

### Hooks

| Hook | Purpose |
|------|---------|
| useLenis | Initialize and manage Lenis smooth scroll instance |
| useLetterpress | Initialize GSAP timeline + mouse tracking for Hero effect |
| usePrintScatter | Initialize GSAP timeline for CMYK scatter on each polaroid |

---

## Animation Implementation

| Animation | Library | Approach | Complexity |
|-----------|---------|----------|------------|
| **Letterpress Reveal** (Hero title) | GSAP | `clipPath: inset()` reveal + mouse-driven `radial-gradient` position via CSS custom properties | **High** |
| **Letterpress Grid** (background words) | GSAP | `opacity` stagger from random + class toggle to enable `::before`/`::after` pseudo-layers | **High** |
| **Mouse light tracking** (Hero) | Vanilla JS | `mousemove` listener updates `--px`/`--py` CSS vars on title + grid container | Medium |
| **Featured Archive parallax** | GSAP ScrollTrigger | `scrub: 1` timeline: text drifts `y: 50`, images drift `y: -30` on scroll | Medium |
| **CMYK Print Scatter** | GSAP | 4-layer `drop-shadow` offset → converge with `elastic.out` easing on scroll trigger | **High** |
| **Smooth scroll** | Lenis | Global instance with `lerp: 0.08`, synced with GSAP ScrollTrigger | Low |
| **Magnetic cursor** | Vanilla JS | Custom cursor element follows mouse with lerp; expands + snaps on hoverable elements | Medium |
| **Nav link hover** | CSS | `transition` on `letter-spacing` + `color` to `var(--color-cmyk-red)` | Low |
| **Menu overlay reveal** | GSAP | Staggered fade/slide of links on hamburger click | Medium |
| **Polaroid scroll trigger** | GSAP ScrollTrigger | `onEnter` triggers `initPrintScatterEffect` per figure | Medium |

---

## State & Logic Plan

### Lenis ↔ GSAP ScrollTrigger Bridge
Lenis must drive GSAP's scroll position. On every Lenis scroll event, call `ScrollTrigger.update()`. This is a global integration in `AppLayout`.

### Letterpress Effect — CSS Variable Coordination
The `--px`/`--py` custom properties must be updated simultaneously on **two selectors**: `.title` (for its own `radial-gradient`) and `.grid--bg` (for the grid items' `::before` pseudo-element highlight layer). This is a single `mousemove` handler writing to two elements.

### CMYK Scatter — Imperative Per-Element Timelines
Each `PolaroidFrame` manages its own GSAP timeline. The component receives a trigger ref (from ScrollTrigger `onEnter`) and creates/destroys its timeline on mount/unmount. The 4 overlay layers are DOM elements appended at runtime, not pre-declared in JSX.

### Magnetic Cursor — Global Hover Detection
The cursor component needs a global mechanism to detect hoverable elements. Use a CSS class (e.g., `.cursor-hover`) on all links/buttons, and listen for `mouseenter`/`mouseleave` via event delegation on `document.body`.

---

## Other Key Decisions

- **No shadcn/ui**: Every element is custom-styled; no standard UI primitives needed.
- **Chinese font loading**: Use Google Fonts CDN with `<link rel="preload">` for Noto Serif SC and Noto Sans SC to prevent FOUT during GSAP animations.
- **Routing**: React Router with 3 routes: `/` (Home), `/about`, `/archives`. Only Home has the full animated sections; other pages reuse Header/Footer with simpler content.
- **Image strategy**: 4 generated images (2 featured, 2 polaroid). All served as static assets, loaded normally (no lazy-load needed for a small photography site).
- **Dark mode toggle**: Not required — the design uses intentional dark sections within a light page, not a global dark mode.
