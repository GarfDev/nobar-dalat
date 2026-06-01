# UI/UX Polish + Scroll Performance

**Date:** 2026-06-01
**Status:** Draft
**Scope:** Visual consistency pass + scroll performance optimization

## Problem

The site scroll experience feels like "playing a 4K game on a low-spec GPU." The stacked card layout uses scroll-linked `filter: blur(20px)` across full-screen sections, which causes expensive GPU repaint on every scroll frame. Visual polish also needs consistency: typography, spacing, animation timing, contrast, and section transitions currently vary by section.

## Goals

1. Make scroll feel smoother on mid-range and lower-end devices.
2. Keep the current aesthetic direction: dark/light contrast, morphing blobs, stacked cards, Lenis scroll, Vietnamese identity focus.
3. Preserve the blur transition aesthetic, but make it lighter.
4. Unify type scale, spacing, motion timing, and contrast across the full page.

## Performance Strategy

### 1. Blur only the section leaving view

Keep the blur aesthetic, but avoid stacking multiple expensive blur computations.

In `app/modules/welcome/index.tsx`, the intended behavior is:

- Branding blurs only when Concept covers Branding.
- Concept blurs only when Menu covers Concept.
- Menu blurs only when Map covers Menu.
- Map blurs only when Contact covers Map.
- Incoming sections use opacity and transform only, not blur.

The key implementation rule: at any scroll position, only one major full-screen section should have active `filter: blur(...)`.

### 2. Add `content-visibility: auto` for off-screen sections

Add browser rendering isolation to card sections in `app/modules/welcome/style.css`:

```css
.card {
  content-visibility: auto;
  contain-intrinsic-size: 100vw 100vh;
}
```

This lets the browser skip work for sections outside the viewport.

Test sticky behavior after adding this. If it conflicts with sticky cards or scroll-linked motion, use a narrower optimization instead: apply containment only to static inner wrappers, not the sticky `.card` itself.

### 3. Reduce blur radius from 20px to 8px

Change every full-section scroll blur from `blur(20px)` to `blur(8px)` in `app/modules/welcome/index.tsx`.

Affected transforms:

- `brandingBlur`
- `conceptBlur`
- `menuBlur`
- `mapBlur`

8px still reads as a soft transition, but costs much less than 20px.

### 4. Add targeted compositor hints

Use `will-change: filter, opacity` only on animated card layers. Do not apply it globally forever if it increases memory pressure.

Preferred CSS:

```css
.card {
  will-change: filter, opacity;
}
```

If profiling shows memory pressure, replace with state/scroll-threshold-driven classes later.

## Visual Polish Strategy

### Typography

Use a consistent hierarchy across sections instead of each section choosing sizes independently.

Recommended scale:

| Role | Mobile | Medium | Large | Usage |
|---|---:|---:|---:|---|
| Display | `text-4xl` | `text-6xl` | `text-8xl` | Major section titles |
| Heading | `text-2xl` | `text-4xl` | `text-6xl` | Footer brand, map address, drink names where needed |
| Body | `text-sm` | `text-base` | `text-lg` | Descriptions, readable content |
| Caption | `text-xs` | `text-sm` | `text-sm` | Labels, tags, metadata |

Target changes:

- Concept title already mostly matches Display scale; keep it.
- Menu drink names are very large (`lg:text-9xl`); reduce slightly for better balance.
- Map title should align with Display scale.
- Contact footer text should avoid tiny mobile text below `text-xs`.

### Spacing

Adopt one page rhythm:

- Section horizontal padding: `px-6 md:px-12 lg:px-20`.
- Section internal gaps: `gap-4`, `gap-8`, `gap-12`.
- Avoid one-off margins like `mb-4 md:mb-6` unless visually necessary.
- Align Concept, Map, Menu, and Contact to similar edge spacing on desktop.

### Motion

Standardize motion language:

- Primary easing: `[0.16, 1, 0.3, 1]`.
- Entrances: `0.8s`.
- Exits: `0.3s`.
- Hover transitions: `0.2s`.
- Background color transitions: `0.5s`.
- Spring tab indicator: keep `type: "spring", stiffness: 300, damping: 30`.

Reduce scattered delays (`0.1`, `0.2`, `0.4`) where they make the page feel sluggish.

### Contrast and readability

Improve readability without changing the visual direction:

- Concept description: bump from `text-white/60` to `text-white/70`.
- Map labels: bump from `text-white/50` to `text-white/60`.
- Contact mobile copy: avoid `text-[10px]`; use `text-xs` minimum.
- Menu ingredients: reduce tracking or increase weight so uppercase text remains readable.

### Section transitions

Refine scroll opacity timing so sections feel present earlier:

Current pattern:

```ts
[0, 0.4, 1] -> [0, 0, 1]
```

Proposed pattern:

```ts
[0, 0.25, 0.8] -> [0, 0, 1]
```

This makes the incoming section appear earlier and finish fading before it fully covers the previous section.

## Files to Modify

| File | Planned changes |
|---|---|
| `app/modules/welcome/index.tsx` | Blur radius, opacity timing, one-active-blur rule, compositor hints if needed |
| `app/modules/welcome/style.css` | `content-visibility`, intrinsic sizing, possibly shared card performance classes |
| `app/modules/welcome/branding/index.tsx` | Animation duration/easing consistency |
| `app/modules/welcome/concept/index.tsx` | Typography, contrast, motion consistency |
| `app/modules/welcome/menu/index.tsx` | Typography, spacing, motion consistency, ingredient readability |
| `app/modules/welcome/map/index.tsx` | Typography, spacing, contrast |
| `app/modules/welcome/contact/index.tsx` | Mobile readability, typography, spacing |

## Testing Plan

1. Run `npm run typecheck`.
2. Run `npm run lint`.
3. Run local site with `npm run dev`.
4. Test desktop scroll through all sections.
5. Test mobile viewport scroll and menu interactions.
6. Verify no sticky/card regressions from `content-visibility`.
7. Verify blur still appears but feels lighter.
8. Check browser console for runtime warnings.

## Success Criteria

- Scroll transitions feel smoother and less GPU-heavy.
- Blur aesthetic remains visible but lighter.
- No section visually disappears or sticks incorrectly.
- Typography and spacing feel consistent between Branding, Concept, Menu, Map, and Contact.
- Mobile text remains readable.
- Typecheck and lint pass.

## Out of Scope

- Full redesign.
- New content or sections.
- Image pipeline changes.
- Bundle splitting beyond current lazy-loaded map.
- Replacing Lenis or Framer Motion.
