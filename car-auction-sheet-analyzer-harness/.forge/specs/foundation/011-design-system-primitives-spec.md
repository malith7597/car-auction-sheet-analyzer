# FS-011 Design System Primitives

> Status: draft
> Author: malith3
> Reviewed by:
> Date: 2026-06-01

## Context

The React SPA needs a consistent set of design tokens and atomic components before any feature UI work begins. Without this substrate, feature components are built on ad-hoc styling decisions that diverge over time and require costly harmonization. This slice establishes the minimum atomic layer: tokens for color, typography, and spacing, plus the reusable primitives (Button, Input, Card, Layout) that all feature screens assemble from.

## Requirements

### Functional Requirements

- Design tokens defined as CSS custom properties in a global tokens file:
  - Color palette (primary, secondary, surface, error, warning, success, text, border)
  - Typography scale (font family, size steps: xs / sm / base / lg / xl / 2xl / display)
  - Spacing scale (4px base unit: 4, 8, 12, 16, 24, 32, 48, 64, 96)
  - Border radius (sm / md / lg / full)
  - Shadow levels (sm / md / lg)
  - Transition durations (fast: 150ms, normal: 300ms)
- Atomic components exported from a single design-system index:
  - `Button` — variants: primary, secondary, ghost; sizes: sm, md, lg; loading and disabled states
  - `Input` — text, with label, error state, helper text
  - `Card` — surface container with optional header and footer slots
  - `Layout` — page wrapper (max-width, padding), Stack (vertical spacing), Row (horizontal spacing)
  - `Typography` — Heading (h1–h4) and Body (sm, base, lg) with token-sourced styles
- Storybook or equivalent component catalogue running locally (`pnpm storybook`)
- All components pass keyboard navigation (focus-visible ring visible, logical tab order)
- All components render correctly at 320px, 768px, and 1440px breakpoints

### Non-Functional Requirements

- Token changes cascade automatically (CSS custom property inheritance — no manual find-and-replace)
- Component bundle contribution < 20 KB gzipped for the full primitives set
- No runtime theme switching required (single theme, light mode only for Phase 1)

## Acceptance Criteria

- [ ] `pnpm storybook` starts and all 5 component stories render without errors
- [ ] `Button` renders all 3 variants × 3 sizes × loading and disabled states
- [ ] `Input` renders default, error, and disabled states with correct label association
- [ ] `Card` renders with and without header/footer slots
- [ ] `Layout` correctly constrains content to max-width and applies consistent page padding
- [ ] `Typography` Heading and Body variants match the token-defined type scale
- [ ] All components have visible focus ring on keyboard navigation
- [ ] No hardcoded color or spacing values in component source — all sourced from tokens
- [ ] Token file is the single source of truth: changing `--color-primary` updates all components

## Scope Boundaries

### In Scope

- CSS custom properties token file (`src/styles/tokens.css`)
- Atomic components: Button, Input, Card, Layout (Stack + Row + PageWrapper), Typography
- Storybook stories for each component (one story per variant)
- Responsive behavior at 3 breakpoints
- Keyboard accessibility (focus ring, tab order)

### Out of Scope

- Dark mode / theme switching (Phase 2)
- Complex compound components (DatePicker, Dropdown, Modal, Table — ship with the features that need them)
- Animation library integration (can be introduced per-feature)
- Figma / design token sync tooling
- Feature-specific components (UploadDropzone, ReportCard, etc.)

## Constraints and Dependencies

- Blocked by: FS-003 (React SPA app shell)
- Stack: React 18, Vite, CSS custom properties (no CSS-in-JS)
- No Tailwind or external component library — tokens + hand-authored components only (intentional design direction per CLAUDE.md)
- Storybook 8 (or latest compatible with Vite 5)

## Design Direction

Intentional visual direction for Phase 1 (not "clean minimal default"):
- **Palette:** neutral grays with a single branded accent (deep blue or teal TBD by project)
- **Typography:** system font stack (no custom fonts in Phase 1 to avoid network overhead)
- **Spacing:** generous whitespace — auction data is dense; the UI should breathe
- **Radius:** rounded-md throughout (not sharp corners, not pill-shaped)

## Input Sources

- architecture.md §Components (React SPA row)
- architecture.md §Foundation Backlog (F-011)
- web/design-quality.md (anti-template policy, design direction requirements)
- web/coding-style.md (CSS custom properties, file organization)

## Open Questions

## Revisions
