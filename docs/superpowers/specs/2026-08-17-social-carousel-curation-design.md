# Social Carousel Curation Design

**Date:** 2026-08-17  
**Status:** Approved in conversation; awaiting written-spec review

## Goal

Curate the opening image carousel into a tighter, more social portrait of No Bar. Replace weak and duplicate media with strong material from the existing library, No Bar Instagram, tagged or reposted Instagram carousels, and Google Maps photos.

## Visual Direction

Use the approved **Social & Lived-In** direction:

- 20% venue and interior
- 35% drinks and bartender craft
- 45% guests and people

The result should feel candid, active, and genuinely inhabited. Intentional direct-flash photography and informal guest moments are desirable. The carousel should still retain enough professional venue and drink photography to preserve No Bar's identity.

## Target Collection

Curate the carousel to approximately 40 total media items:

- 8 venue or interior items
- 14 drink or bartender-craft items
- 18 guest or people items

Small count adjustments are acceptable when required to avoid weak media, while keeping the overall 20/35/45 balance recognizable.

## Sources

Select from:

1. The existing files in `public/carousel-content/`.
2. No Bar's own Instagram posts and image carousels.
3. Instagram posts in No Bar's Tagged and Reposts grids.
4. Google Maps photos uploaded by the No Bar business account.
5. Google Maps customer-review photos explicitly selected for the local preview.

Download original media rather than saving screenshots containing Instagram or Google Maps interface elements. Record the source URL and displayed photographer, account, or reviewer name for every new external file.

Customer-review and third-party social photographs remain the copyright of their creators. Source documentation does not replace permission; publishing them should be treated as requiring rights clearance from the photographer.

## Selection Rules

Keep media that:

- Clearly depicts No Bar, its team, its drinks, or guests inside the venue.
- Has sufficient resolution for the existing full-screen masonry layout.
- Adds a distinct moment, composition, subject, or color beat.
- Fits the warm, intimate, slightly surreal visual atmosphere of the existing site.
- Keeps recognizable guests in respectful, non-sensitive contexts.

Remove media that:

- Is an exact or near duplicate.
- Has an accidental weak crop, severe compression, unusable focus, or prominent social-media UI.
- Primarily shows unrelated travel, food, streets, or other venues.
- Repeats a nearly identical angle without improving the visual sequence.
- Contains children or sensitive/private situations.

## Implementation

- Preserve the existing `Branding`, carousel, masonry animation, lightbox, and responsive behavior.
- Curate source files directly in `public/carousel-content/`.
- Give new files stable, source-identifying filenames.
- Let `scripts/prebuild-carousel.ts` generate optimized WebP derivatives and carousel metadata using the existing pipeline.
- Add a source record under `docs/` for all new external carousel photographs.
- Do not change the menu catalogue or menu photographs.
- Do not push until the user has reviewed and approved the local carousel.

## Failure Handling

- Reject any image whose original file cannot be downloaded at usable resolution.
- Reject media when the source account, review, or venue identity cannot be verified.
- If optimization fails, keep the previous working carousel and report the rejected asset.
- Keep removed originals recoverable in Git history; do not use destructive history rewriting.

## Verification

1. Confirm the final source count and category balance.
2. Confirm all retained and added media are distinct and relevant to No Bar.
3. Run carousel preprocessing, lint, type-check, and production build.
4. Inspect the opening section and lightbox locally at desktop and mobile widths.
5. Confirm images load without stretching, broken paths, or social-media interface overlays.
6. Confirm the menu and all later page sections remain unchanged.
7. Present the local preview and wait for approval before pushing.

## Out of Scope

- Redesigning the opening carousel or its animation.
- Editing drink-menu images or menu data.
- Adding captions, reviews, or attribution overlays to the website UI.
- Publishing media to Instagram or Google Maps.
