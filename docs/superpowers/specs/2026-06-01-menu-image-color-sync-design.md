# Menu Image Color Sync Design

**Date:** 2026-06-01
**Status:** Approved
**Scope:** Build-time extraction of menu image colors with manual override support.

## Problem

The menu section currently uses manually authored `bgColor` and `accentColor` values from `app/data/menu.json`. This keeps the section stable, but the background can feel disconnected from the actual drink image.

The desired behavior: the menu background should sync with the primary color of the active drink image, while text should use an opposite/readable color.

## Goal

Generate image-aware menu colors at build time, with manual overrides available per drink.

## Chosen Approach

Use build-time color extraction in `scripts/prebuild-carousel.ts`.

This avoids runtime canvas work, avoids flicker, and keeps SSR/client render stable. Manual values remain the source of taste control when auto extraction produces a muddy or ugly result.

## Data Model

Extend menu item data with optional generated/override color fields:

```ts
type MenuItemColorFields = {
  useAutoColors?: boolean;
  autoBgColor?: string;
  autoTextColor?: string;
  autoAccentColor?: string;
  colorOverride?: {
    bgColor?: string;
    textColor?: string;
    accentColor?: string;
  };
};
```

Interpretation:

- `useAutoColors: true` means the UI may use extracted colors.
- `autoBgColor` is extracted from the drink image.
- `autoTextColor` is calculated for readable contrast against `autoBgColor`.
- `autoAccentColor` can be a slightly stronger variant of `autoBgColor` for tags/buttons/image blob.
- `colorOverride` wins over generated values when present.
- Existing `bgColor` and `accentColor` remain fallback values.

## Color Selection Rules

Priority order in UI:

1. `colorOverride.bgColor`
2. `useAutoColors ? autoBgColor : undefined`
3. existing `bgColor`
4. fallback `#f5f5f4`

For text:

1. `colorOverride.textColor`
2. `useAutoColors ? autoTextColor : undefined`
3. readable text from `bgColor`
4. fallback `#000000`

For accent:

1. `colorOverride.accentColor`
2. `useAutoColors ? autoAccentColor : undefined`
3. existing `accentColor`
4. fallback `#111827`

## “Opposite Text” Definition

Do not use literal color-wheel opposite as primary rule. It can produce ugly or inaccessible colors.

Use readable contrast instead:

- Calculate relative luminance for `autoBgColor`.
- Pick near-black text for light backgrounds.
- Pick near-white text for dark backgrounds.
- Use `#111111` and `#f8f4ec` instead of pure black/white for softer bar aesthetic.

Optional later enhancement: compute a complementary accent color, but keep body text contrast-based.

## Build-Time Extraction

In `scripts/prebuild-carousel.ts`:

1. During menu image optimization, read each source image with Sharp.
2. Apply `.rotate()` before analysis so EXIF orientation is respected.
3. Resize a copy to a tiny sample size, e.g. `32x32`.
4. Remove alpha or composite over neutral background.
5. Sample pixels and choose a dominant color.
6. Avoid extreme near-white/near-black unless the image truly has no better color.
7. Write generated colors into a derived menu data output.

Preferred output model:

- Keep `app/data/menu.json` as editable source data.
- Generate `app/data/menu.generated.json` with merged menu items and extracted color fields.
- Update `Menu` to import generated data if present.

Reason: build output should not mutate the hand-authored menu source every run.

## UI Behavior

In `app/modules/welcome/menu/index.tsx`:

- Resolve `menuColors` from the priority rules above.
- Animate section background to `menuColors.bg`.
- Set section-level CSS variable values:

```tsx
style={{
  "--menu-bg": menuColors.bg,
  "--menu-text": menuColors.text,
  "--menu-accent": menuColors.accent,
} as React.CSSProperties}
```

- Replace hardcoded black/white menu classes where needed:
  - Main outside text uses `var(--menu-text)`.
  - Category inactive text uses `var(--menu-text)` with opacity.
  - Active category pill uses `var(--menu-text)` or `var(--menu-accent)` depending contrast.
  - Arrows use `var(--menu-text)`.
  - Pagination dots use `var(--menu-text)`.
  - Tag uses `var(--menu-accent)` background and contrast-safe text.

The inside-image clipped text can stay white if the image mask needs it, unless readability suffers.

## Files to Modify

| File | Changes |
|---|---|
| `scripts/prebuild-carousel.ts` | Extract menu image colors and write generated menu data |
| `app/modules/welcome/menu/index.tsx` | Import generated menu data, resolve color priority, apply CSS variables, update text/control colors |
| `app/data/menu.generated.json` | Generated output containing extracted color fields |

## Testing Plan

1. Run `npm run dev` or `npm run build` to trigger prebuild.
2. Confirm `app/data/menu.generated.json` is created/updated.
3. Verify `image_7` and `image_8` orientation remains correct after `.rotate()`.
4. Verify each menu item has `autoBgColor`, `autoTextColor`, and `autoAccentColor` when image exists.
5. Run `npm run lint`.
6. Run `npm run typecheck`.
7. Visually check Menu section:
   - Background changes per drink.
   - Text remains readable.
   - Category tabs/arrows/dots remain visible.
   - Transition remains smooth.

## Acceptance Criteria

- Menu background uses image-derived color when `useAutoColors` is true.
- Text color is contrast-safe against generated background.
- Manual overrides can force background/text/accent per drink.
- Existing `bgColor` and `accentColor` still work as fallback.
- No runtime canvas/image analysis is used.
- Build process respects EXIF orientation before color analysis.
- `npm run lint` and `npm run typecheck` pass with no new errors.

## Out of Scope

- Perfect artistic palette extraction.
- User-facing color editor.
- Admin UI changes.
- Runtime palette extraction.
- Multi-color gradients.
