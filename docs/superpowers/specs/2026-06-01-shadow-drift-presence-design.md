# Shadow Drift Presence Design

**Date:** 2026-06-01
**Status:** Approved
**Scope:** Replace literal multiplayer cursor visuals with subtle ambient presence shadows.

## Problem

The site already has realtime cursor presence in `app/components/cursor-sync.tsx`, but the current visual reads like a multiplayer cursor demo: small colored dots with blob shapes. That makes the experience feel technical rather than atmospheric.

The site should feel like a quiet bar room with other people present, not like a collaboration tool.

## Goal

Turn remote visitors into soft ambient shadows that move through the page quietly. Preserve the existing Supabase presence system, but change the presentation layer.

## User Experience

When other visitors are online on the same device type:

- They appear as soft drifting shadows, not pointer dots.
- Their movement lags slightly behind their actual cursor position.
- Shadows sit behind the content visually and never block interaction.
- On dark sections, they read as faint smoky glows.
- On the light menu section, they read as faint ink-like shadows.
- If no one else is online, nothing appears.
- On mobile, presence is disabled for performance and visual clarity.

## Visual Design

Each remote visitor renders as a single blurred radial blob:

- Size: 80-140px, derived from stable user identity.
- Opacity: 0.08-0.16.
- Blur: 24px.
- Shape: circular or near-circular. Do not reuse the current hard blob border-radius as the main visible form.
- Color: existing assigned user color, softened with opacity.
- Blend mode:
  - Dark sections: `screen`.
  - Light menu section: `multiply`.

The shadow should not have a visible center dot, cursor arrow, label, ring, or username.

## Behavior

Keep existing realtime data flow:

- Supabase anonymous auth.
- Supabase Realtime channel `room_01`.
- Presence state for late joiners.
- Broadcast `cursor-move` for frequent updates.
- Same-device filtering.

Change only the visual output:

- Rename or replace `Cursor` with `PresenceShadow`.
- Keep x/y spring smoothing.
- Use slower/softer spring settings than a cursor:
  - Lower stiffness than current cursor.
  - Higher damping to remove bounce.
- Keep normalized document-coordinate projection so shadows remain aligned during scroll.

## Section Awareness

The component needs to know whether a remote visitor is over the light menu section or a dark section.

Recommended minimal approach:

- Compute the remote viewport y coordinate as currently done.
- Use `document.elementFromPoint(viewportX, viewportY)` or section bounds to detect the closest section id.
- If inside `#menu`, use `mixBlendMode: "multiply"` and slightly lower opacity.
- Otherwise use `mixBlendMode: "screen"`.

If section detection is unreliable, fallback to `screen` globally. This is acceptable because the feature is ambient, not functional.

## Performance Constraints

Hard limits:

- Maximum visible remote shadows: 6.
- Disable entirely on mobile (`window.innerWidth < 768`).
- Disable if `prefers-reduced-motion: reduce` is active.
- No canvas.
- No SVG filters.
- No trails.
- No per-frame layout scans beyond existing movement updates.
- One DOM element per visible visitor.

Rendering properties:

- Animate `transform` with Framer Motion springs.
- Animate opacity lightly.
- Keep blur static.
- Use `pointer-events: none`.
- Use fixed positioning or existing absolute positioning only if document-coordinate projection remains correct.

## Files to Modify

| File | Changes |
|---|---|
| `app/components/cursor-sync.tsx` | Replace cursor dot rendering with `PresenceShadow`, disable on mobile/reduced motion, cap visible shadows, tune spring motion, add blend-mode awareness |

No other files should be required unless section awareness needs a tiny helper in the welcome module.

## Acceptance Criteria

- Remote users no longer appear as hard cursor dots.
- Remote users appear as faint drifting shadows on desktop.
- Shadows are not visible on mobile.
- Shadows never block clicks or hover states.
- At most 6 remote shadows render.
- `prefers-reduced-motion: reduce` disables the effect.
- Existing realtime presence still works.
- `npm run lint` and `npm run typecheck` pass with no new errors.

## Out of Scope

- User names or labels.
- Exact cursor arrows.
- Trails or afterimages.
- Section-specific custom animations beyond blend-mode switching.
- New Supabase tables or backend changes.
- Admin controls for presence.
