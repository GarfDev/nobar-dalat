# Nobar Dalat Scrollcraft Refactor Design

Date: 2026-08-25

## Objective

Refactor the existing React Router landing page into a premium, scroll-driven Nobar experience using the unmodified Scrollcraft engine from `nateherkai/scroll-craft`. Preserve the current content sequence, bilingual behavior, live menu, map, analytics, and the in-progress birthday route while replacing the current Lenis snap stack and parent-level Framer Motion blur transitions.

The page must make visitors believe that Nobar is not a generic cocktail venue in Da Lat. It is a living Vietnamese night space with its own visual language, atmosphere, and drinks. The repeated action is **Get Directions**.

## Source brief

The working brief is stored at `scrollcraft/builds/nobar-dalat/BRIEF.md`. The user provided three direct answers and explicitly delegated the remaining creative decisions. Those inferred answers are marked as self-authored.

## Chosen grammar

Use the **rhythmic cutlist** grammar.

It fits the user's requirement for full energy and the bar's real nightlife photography. The five existing content chapters remain in order, but each chapter is subdivided into short, hard-cut visual beats. No act is pinned, no act uses dwell, and the total experience stays within 8 to 14 viewport-heights.

Why the other grammars lost:

- Filmic one-shot is too close to the current sticky-card experience and would soften the explicit full-energy brief.
- Chaptered editorial gives the heritage story more reading room but is too restrained for the requested pace.
- Live surface does not fit a hospitality destination.
- Continuous world would require a costly, fragile flight and contradict the distinct-scene direction.
- Typographic poster would discard Nobar's strongest asset, its real physical-space photography.
- Gallery/catalog serves the menu well but weakens the venue, concept, and destination journey.
- Split stage needs a two-sided argument that the brand does not have.

## Fingerprint

The local registry is empty, so this first build clears the fingerprint gate automatically.

Planned row:

| Dimension | Choice |
|---|---|
| Grammar | Rhythmic cutlist |
| Navigation | Loud fixed tone rail that becomes menu navigation |
| Hero | Immediate full-frame venue cut with composition-scale Nobar mark |
| Sequence | 12 short flow acts, approximately 10 to 12 viewport-heights |
| Close | Abrupt stable destination plate with Get Directions |
| Signature move | Vietnamese tone marks conduct the page and become the menu controls |
| World | Nocturnal documentary using real Nobar media |

The registry row will be appended only after the build ships and verification passes.

## Experience architecture

### Macro sequence

The existing sequence remains Branding, Concept, Menu, Map, Contact. Semantic landmarks and bilingual copy remain real HTML in reading order.

### Scroll score

| Beat | Chapter | Feeling | Primary device | Content |
|---|---|---|---|---|
| 1 | Branding | Pulse | `flow` + `in` | Full-frame venue image or branding film frame, large Nobar mark |
| 2 | Branding | Recognition | `reveal` up | Guests and staff in the real space |
| 3 | Branding | Intrigue | `kinetic` lines | Logo rhythm separates into tone-like strokes |
| 4 | Concept | Pride | `reveal` left | Bilingual Vietnamese identity statement and material detail |
| 5 | Concept | Anticipation | `flow` + `in` | One isolated drink and compressed fixed tone rail |
| 6 | Menu | Appetite | `reveal` iris | Full-bleed macro cocktail texture |
| 7 | Menu | Delight | bespoke tone choreography | Six marks call six Vietnamese-tone drinks into view |
| 8 | Menu | Awe | bespoke fixed-chrome peak | Tone rail conducts the field and resolves into controls |
| 9 | Menu | Momentum | `flow` + `in` | Existing interactive menu for tone drinks, classics, and contemporary drinks |
| 10 | Map | Urgency | `reveal` right | Address, opening status, and map arrive as one destination system |
| 11 | Map | Arrival | `kinetic` lines | Physical venue geometry converges on the address |
| 12 | Contact | Resolve | `flow` + `in`, final hold | Stable final plate with hours, Instagram, and Get Directions |

This uses flow entrances, large reveals, kinetic type, hard ground cuts, and the bespoke tone choreography. No primary device repeats in adjacent beats. The peak lives in fixed chrome across beats 7 and 8, so it can hold without violating the cutlist ban on pinned acts.

## Signature move: the tone rail

Create a fixed, accessible rail based on the six Vietnamese tone states used by Nobar's menu: sắc, huyền, không, hỏi, ngã, and nặng.

Before the menu, the rail is a visual instrument. Scroll progress changes its active mark and transforms the mark geometry at each beat. The rail remains useful rather than decorative by showing chapter progress without numerical section counters.

Across beats 7 and 8, the marks spread into the screen and visually call the six corresponding drinks. At the end of the peak, they settle into buttons. Selecting a mark focuses the corresponding drink in the existing menu. Keyboard, touch, and pointer interaction use the same state path.

The signature move is implemented in page-owned React and CSS driven by scroll state and custom properties. The Scrollcraft engine remains unmodified.

Reduced motion keeps the rail as a stable six-button menu. It removes geometry travel and uses direct opacity changes so meaning and navigation remain intact.

## React and engine integration

### Unmodified engine

Copy `engine/scrollcraft.js` and `engine/scrollcraft.css` from the installed skill to `public/vendor/scrollcraft/scrollcraft.js` and `public/vendor/scrollcraft/scrollcraft.css`. Do not edit either file. Load the stylesheet and script from the document root.

Create `app/modules/welcome/scrollcraft-runtime.tsx` as a typed React adapter that mounts `window.ScrollCraft` on the Welcome root after hydration. It owns the mount guard and exposes only the current root and layout refresh behavior. Page-specific behavior does not enter the engine. Add the global type in `app/types/scrollcraft.d.ts`.

### Page composition

Replace the current `Welcome` sticky-card and Lenis orchestration with a semantic cutlist composition. `Welcome` owns the active chapter and selected tone-drink coordination. Individual chapter components remain responsible for their content and local interactions.

Remove:

- `ReactLenis` and the scroll-stop snapping timer.
- Parent `useScroll` blur and opacity transforms.
- Sticky `.card-container` and `.card` stacking.
- `react-scroll` navigation in the branding layer.

Retain Framer Motion only where it owns non-scroll UI state, such as menu item transitions, the lightbox, and the birthday overlay. Scroll-driven entrances move to Scrollcraft attributes and page CSS to avoid competing animation systems.

### Component boundaries

- `Welcome`: semantic sequence, Scrollcraft mount root, chapter coordination.
- `Branding`: first three cuts, lightbox access, language switcher, and birthday overlay preservation.
- `Concept`: two asymmetric concept cuts with real bilingual copy.
- `ToneRail`: fixed chrome, progress state, accessible tone buttons, and signature choreography.
- `Menu`: controlled selection support plus its existing category and swipe interactions.
- `Map`: destination cut with live status, copy-address, and directions behavior.
- `Contact`: stable final plate and repeated Get Directions action.

Do not generate the page from a score/config object. The score documents intent; the React tree remains authored semantic markup.

## Visual system

Use the existing brand fonts only: iCiel Novecento Sans for display and Beau Sans for text where the available weights render cleanly. No third family.

Token direction:

- Canvas: blue-black, not pure black.
- Surface: inked violet-black.
- Ink: warm smoke.
- Soft ink: violet-tinted grey.
- Accent: Nobar moss, with violet owning larger brand regions.
- Drink highlight: amber belongs to photography rather than becoming a second UI accent.

The world is nocturnal documentary: practical warm light, deep violet and moss, amber drinks, honest skin and surfaces, visible grain, and occasional direct-flash contrast. Existing assets are primary. No AI media generation is planned.

Each cut uses an opaque local ground so colour arrives on the cut. Do not use Scrollcraft drift interpolation on this short-act grammar. Text over images gets a local corner, band, or column scrim only where needed.

## Content and accessibility

- Preserve English and Vietnamese translations and route-driven locale behavior.
- Add only concise copy needed to connect the existing chapters; all new copy must exist in both locale files.
- Keep one visible `h1`, logical heading levels, real buttons and links, and DOM reading order matching the visual journey.
- Preserve keyboard access for the menu, map actions, language control, lightbox, and tone rail.
- Use visible focus styles, minimum 44px touch targets, descriptive image alternatives where images carry meaning, and empty alternatives for decorative media.
- Do not add autoplay audio, scroll cues, section counters, invented statistics, or text baked into media.
- Ensure the final screen holds content and actions at the bottom of the document.

## Birthday route boundary

The current worktree contains uncommitted birthday-route changes. Preserve them.

The birthday overlay stays inside the branding chapter when `birthdayLang` is present. Its copy and no-index metadata remain unchanged. Its ring motion remains disabled under reduced motion. Refactoring Branding must carry the existing `birthdayLang` prop and overlay branch forward rather than recreating or deleting that work.

## Performance

- Reuse optimized WebP menu and carousel media.
- Do not preload the entire social collection. Select only the images needed for the initial cuts and keep the existing carousel lazy behavior.
- Keep the 32.6-second branding video as normal ambient media unless testing proves a short excerpt can scrub reliably. The rhythmic grammar does not require a scrub act.
- Animate only transform, opacity, and sanctioned clip paths.
- Remove Lenis to restore native touch scrolling and avoid scroll-controller contention.
- Keep the map lazy-loaded and disable map wheel zoom as today.

## Failure handling

- If Scrollcraft is unavailable before hydration, render the complete semantic page without hidden content. Enhancement failure must not blank a section.
- If media fails, retain an explicit poster or image ground and readable copy.
- If reduced motion is requested, show all meaningful states without position-driven choreography.
- If the tone rail cannot coordinate with the menu, the menu's existing category and previous/next controls remain fully functional.

## Verification

### Automated checks

- Add tests for the Scrollcraft semantic structure, tone ordering, controlled menu selection, bilingual signature copy, reduced-motion fallbacks, and preservation of birthday routing.
- Run all existing Node tests.
- Run `npm run typecheck`, `npm run lint`, and `npm run build`.

### Scrollcraft verification

Install `playwright-core` for the verification pass. Run the Scrollcraft screenshot harness against the local `/en` page at desktop, 390x844 mobile, and reduced-motion settings. Review its reports for dead scroll, incomplete cues, frozen media, and composited contrast.

Read each generated contact sheet manually. Confirm that:

- every cut is legible at entry and exit;
- the tone-rail peak is the largest visual change;
- beat 5 reads as authored anticipation rather than a loading gap;
- the menu remains usable after the signature transition;
- the last screen resolves and holds;
- no birthday content was lost;
- keyboard focus order matches reading order.

Run a cold feel check and compare the felt curve with `BRIEF.md`. Document any mismatch and the correction. Headless verification does not prove real iPhone video decoding or touch behavior, so final handoff will identify real-device testing as the remaining manual check unless such a device is tested.

## Out of scope

- New generated photography or video.
- Changes to cocktail data, opening hours, address, analytics, SEO metadata, or Supabase cursor behavior.
- Deployment or production publishing.
- Rewriting the birthday announcement content.
