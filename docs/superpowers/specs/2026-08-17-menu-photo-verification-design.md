# Menu Photo Verification Design

**Date:** 2026-08-17
**Status:** Approved
**Scope:** Restore missing verified drinks and preserve correct photo assignments.

## Goal

Show every cocktail that No Bar still sells while ensuring each visible menu item has a verified photo. Keep both the six-tone collection and the E LỜ collection.

## Verified Menu Scope

The menu contains nine drinks across two existing categories:

- E LỜ: Lan Man, Loạng Choạng, Lộn Xộn
- SẮC HUYỀN KHÔNG HỎI NGÃ NẶNG: Sắc, Huyền, Không, Hỏi, Ngã, Nặng

The Instagram audit confirms that E LỜ is a three-cocktail collection and names Lan Man, Loạng Choạng, and Lộn Xộn. The Lan Man post also refers to Huyền as a distinct earlier drink. The user confirmed that the earlier collection remains available and must not be removed.

No other named cocktail was found in the additional visible Instagram posts. Community, venue, and promotional posts are not menu evidence.

## Photo Verification Rule

A drink may appear only when the project contains both menu copy and a photo whose identity is supported by the existing asset set or Instagram.

- Keep all seven currently visible drink-to-photo assignments.
- Restore Sắc with `/images/menu-optimized/image_1.webp`; its matcha appearance matches the existing matcha-based recipe.
- Restore Hỏi with `/images/menu-optimized/image_2.webp`; it is the remaining identified photo in the complete six-drink source asset set and has matching localized menu copy.
- Keep Lan Man, Loạng Choạng, and Lộn Xộn mapped to their named optimized assets; Instagram independently confirms their identities and recipes.
- Do not use reel screenshots, low-resolution frames, or speculative photos.

## Menu Data Changes

Add Sắc and Hỏi to `app/data/menu.json` using their existing localized copy and optimized images. Do not change the established image assignments for the other seven drinks.

Use the category's stated display order:

1. Sắc
2. Huyền
3. Không
4. Hỏi
5. Ngã
6. Nặng

Keep E LỜ in its confirmed order:

1. Lan Man
2. Loạng Choạng
3. Lộn Xộn

## Visual Treatment

Follow the existing dark menu-carousel treatment. Give Sắc and Hỏi dark background and accent colors derived from their photos, with contrast equivalent to the current drinks. Reuse the existing blob shapes so the additions feel native to the current carousel.

No layout, typography, animation, or navigation redesign is included.

## Verification

1. Confirm all nine menu items are present in the data.
2. Confirm every image path resolves to an existing optimized file.
3. Confirm the six-tone carousel follows the specified order.
4. Confirm the E LỜ carousel remains unchanged.
5. Run the project's lint, type-check, and production build checks that are available.
6. Render the menu locally and visually verify both categories on desktop and mobile widths.

## Out of Scope

- Adding drinks that appear without an identifiable photo.
- Replacing existing high-quality photos with Instagram screenshots.
- Removing older drinks.
- Changing recipes or translating new copy.
- Redesigning the menu interface.
