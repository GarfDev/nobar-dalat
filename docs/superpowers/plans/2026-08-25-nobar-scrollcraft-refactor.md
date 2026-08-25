# Nobar Scrollcraft Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Nobar's Lenis-powered sticky card stack with an energetic 12-beat rhythmic cutlist driven by the unmodified Scrollcraft engine and a functional Vietnamese tone-rail signature interaction.

**Architecture:** The installed Scrollcraft engine is vendored byte-for-byte and mounted through a small typed React adapter. The page keeps authored semantic React markup, while a page-owned `ToneRail` coordinates the six Vietnamese-tone drinks with a controlled version of the existing menu. Framer Motion remains only for local UI transitions; native scroll and Scrollcraft own the page timeline.

**Tech Stack:** React 19, React Router 7, TypeScript 5.8, Tailwind CSS 4, Framer Motion 12, Scrollcraft vanilla runtime, i18next, Node test runner, Playwright/Chrome.

**Spec:** `docs/superpowers/specs/2026-08-25-nobar-scrollcraft-refactor-design.md`

## Global Constraints

- Preserve the visible sequence: Branding, Concept, Menu, Map, Contact.
- Use the rhythmic cutlist grammar: no pinned acts, no dwell, no Lenis, and 12 short beats totaling 8 to 14 viewport-heights.
- Copy the Scrollcraft engine without editing it. Project-specific behavior belongs in React and page CSS.
- Preserve English and Vietnamese routes, menu behavior, map behavior, analytics, lightbox access, and all in-progress birthday-route changes.
- Use Nobar's existing media. Do not generate replacement imagery or add autoplay audio.
- Keep one visible `h1`, semantic reading order, visible focus styles, 44px minimum touch targets, reduced-motion meaning, and a stable final screen.
- Use **Get Directions** as the only repeated primary CTA label.
- Do not add scroll cues, section counters, invented statistics, gradient text, generic neon glow, or text baked into media.
- Do not stage unrelated user changes. Every commit must name explicit files.

---

## File Structure

### New files

- `public/vendor/scrollcraft/scrollcraft.js`: unmodified engine runtime.
- `public/vendor/scrollcraft/scrollcraft.css`: unmodified engine taste floor and devices.
- `app/types/scrollcraft.d.ts`: global engine types.
- `app/modules/welcome/scrollcraft-runtime.tsx`: hydration-safe engine mount adapter.
- `app/modules/welcome/scroll-beat.tsx`: semantic wrapper for explicitly authored cutlist beats.
- `app/modules/welcome/tone-rail/model.ts`: tone metadata and pure progress/selection helpers.
- `app/modules/welcome/tone-rail/index.tsx`: fixed accessible signature rail.
- `app/modules/welcome/tone-rail/style.css`: rail choreography and reduced-motion fallback.
- `app/modules/welcome/menu/peak.tsx`: appetite and peak beats before the live menu.
- `tests/scrollcraft-vendor.test.ts`: vendor parity and document-loading contract.
- `tests/tone-rail.test.tsx`: tone order, progress phases, and accessible controls.
- `tests/menu-selection.test.ts`: controlled menu selection contract.
- `tests/scrollcraft-structure.test.ts`: authored 12-beat source contract and prohibited legacy imports.

### Modified files

- `app/root.tsx`: load vendor CSS and runtime.
- `app/app.css`: Beau Sans faces and Scrollcraft-compatible document defaults.
- `app/modules/welcome/index.tsx`: explicit 12-beat page composition and shared selection state.
- `app/modules/welcome/style.css`: cutlist art direction, hard grounds, scrims, responsive and reduced-motion rules.
- `app/modules/welcome/branding/index.tsx`: three branding beats while preserving carousel/lightbox and birthday overlay.
- `app/modules/welcome/concept/index.tsx`: two asymmetric concept beats.
- `app/modules/welcome/menu/index.tsx`: controlled drink selection and local UI-only motion.
- `app/modules/welcome/map/index.tsx`: destination and arrival beats without duplicate landmark IDs.
- `app/modules/welcome/contact/index.tsx`: stable final plate with Get Directions.
- `public/locales/en/translation.json`: signature and connective copy.
- `public/locales/vi/translation.json`: matching Vietnamese copy.
- `package.json`, `package-lock.json`: tests, Playwright, and removal of superseded scroll packages.
- `scrollcraft/builds/nobar-dalat/BRIEF.md`: verification feel-check result.
- `scrollcraft/FINGERPRINTS.md`: append the shipped build fingerprint.

---

### Task 1: Vendor and mount the unmodified Scrollcraft engine

**Files:**
- Create: `public/vendor/scrollcraft/scrollcraft.js`
- Create: `public/vendor/scrollcraft/scrollcraft.css`
- Create: `app/types/scrollcraft.d.ts`
- Create: `app/modules/welcome/scrollcraft-runtime.tsx`
- Modify: `app/root.tsx`
- Test: `tests/scrollcraft-vendor.test.ts`

**Interfaces:**
- Consumes: `window.ScrollCraft.mount(root: Element, options?: { lerp?: number })` from the vendored runtime.
- Produces: `useScrollcraftRuntime(rootRef: RefObject<HTMLElement | null>): void` and global `ScrollCraftInstance.layout()`/`read()` types.

- [ ] **Step 1: Write the failing vendor contract test**

```ts
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("vendors the Scrollcraft engine without project-specific edits", async () => {
  const [sourceJs, vendorJs, sourceCss, vendorCss] = await Promise.all([
    readFile("/Users/garfdev/.codex/skills/scrollcraft/engine/scrollcraft.js", "utf8"),
    readFile("public/vendor/scrollcraft/scrollcraft.js", "utf8"),
    readFile("/Users/garfdev/.codex/skills/scrollcraft/engine/scrollcraft.css", "utf8"),
    readFile("public/vendor/scrollcraft/scrollcraft.css", "utf8"),
  ]);

  assert.equal(vendorJs, sourceJs);
  assert.equal(vendorCss, sourceCss);
  assert.match(vendorJs, /global\.ScrollCraft = \{ mount: mount/);
});

test("loads the Scrollcraft assets from the document root", async () => {
  const root = await readFile("app/root.tsx", "utf8");
  assert.match(root, /\/vendor\/scrollcraft\/scrollcraft\.css/);
  assert.match(root, /\/vendor\/scrollcraft\/scrollcraft\.js/);
});
```

- [ ] **Step 2: Run the test and verify the missing vendor files fail**

Run: `node --import tsx --test tests/scrollcraft-vendor.test.ts`

Expected: FAIL with `ENOENT` for `public/vendor/scrollcraft/scrollcraft.js`.

- [ ] **Step 3: Copy the engine byte-for-byte**

Run:

```bash
mkdir -p public/vendor/scrollcraft
cp /Users/garfdev/.codex/skills/scrollcraft/engine/scrollcraft.js public/vendor/scrollcraft/scrollcraft.js
cp /Users/garfdev/.codex/skills/scrollcraft/engine/scrollcraft.css public/vendor/scrollcraft/scrollcraft.css
```

- [ ] **Step 4: Add global engine types**

Create `app/types/scrollcraft.d.ts`:

```ts
type ScrollCraftAct = {
  el: Element;
  device: string;
  p: number;
};

type ScrollCraftInstance = {
  layout(): void;
  read(): void;
  acts: ScrollCraftAct[];
  worlds: unknown[];
  clips: unknown[];
  lerp: number;
};

interface Window {
  ScrollCraft?: {
    mount(
      root: Element | string,
      options?: { lerp?: number },
    ): ScrollCraftInstance;
    reduce: boolean;
    instances: ScrollCraftInstance[];
  };
}
```

- [ ] **Step 5: Add the hydration-safe adapter**

Create `app/modules/welcome/scrollcraft-runtime.tsx`:

```tsx
import { useEffect, type RefObject } from "react";

const MOUNTED = "scrollcraftMounted";

export function useScrollcraftRuntime(
  rootRef: RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root || root.dataset[MOUNTED] === "true") return;

    const mount = () => {
      if (!window.ScrollCraft || root.dataset[MOUNTED] === "true") return false;
      window.ScrollCraft.mount(root, { lerp: 0.22 });
      root.dataset[MOUNTED] = "true";
      return true;
    };

    if (mount()) return;
    const timer = window.setInterval(() => {
      if (mount()) window.clearInterval(timer);
    }, 25);
    const timeout = window.setTimeout(() => window.clearInterval(timer), 2000);

    return () => {
      window.clearInterval(timer);
      window.clearTimeout(timeout);
    };
  }, [rootRef]);
}
```

- [ ] **Step 6: Load vendor assets from `app/root.tsx`**

Add this link to `links()` after the font preloads:

```ts
{ rel: "stylesheet", href: "/vendor/scrollcraft/scrollcraft.css" },
```

Add this script immediately before the React Router `<Scripts />` element:

```tsx
<script src="/vendor/scrollcraft/scrollcraft.js" />
```

- [ ] **Step 7: Run the vendor test and typecheck**

Run:

```bash
node --import tsx --test tests/scrollcraft-vendor.test.ts
npm run typecheck
```

Expected: both commands PASS.

- [ ] **Step 8: Commit the isolated runtime slice**

```bash
git add public/vendor/scrollcraft/scrollcraft.js public/vendor/scrollcraft/scrollcraft.css app/types/scrollcraft.d.ts app/modules/welcome/scrollcraft-runtime.tsx app/root.tsx tests/scrollcraft-vendor.test.ts
git commit -m "feat: mount the Scrollcraft runtime"
```

---

### Task 2: Build the Vietnamese tone-rail model and accessible chrome

**Files:**
- Create: `app/modules/welcome/tone-rail/model.ts`
- Create: `app/modules/welcome/tone-rail/index.tsx`
- Create: `app/modules/welcome/tone-rail/style.css`
- Test: `tests/tone-rail.test.tsx`

**Interfaces:**
- Produces: `TONES`, `ToneId`, `TonePhase`, `getToneRailState(progress)`, and `<ToneRail selectedDrinkId onSelect />`.
- Consumes later: `Menu` receives the selected `ToneId` as `selectedDrinkId`.

- [ ] **Step 1: Write failing tests for order, phases, and markup**

```tsx
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import test from "node:test";
import { ToneRail } from "../app/modules/welcome/tone-rail";
import {
  TONES,
  getToneRailState,
} from "../app/modules/welcome/tone-rail/model";

test("orders the six Nobar tone drinks", () => {
  assert.deepEqual(
    TONES.map(({ id, label }) => [id, label]),
    [
      ["sac", "sắc"],
      ["huyen", "huyền"],
      ["khong", "không"],
      ["hoi", "hỏi"],
      ["nga", "ngã"],
      ["nang", "nặng"],
    ],
  );
});

test("moves from conducting to expanded to menu-ready", () => {
  assert.deepEqual(getToneRailState(0), { phase: "conducting", activeIndex: 0 });
  assert.deepEqual(getToneRailState(0.58), { phase: "compressed", activeIndex: 3 });
  assert.deepEqual(getToneRailState(0.7), { phase: "expanded", activeIndex: 4 });
  assert.deepEqual(getToneRailState(0.82), { phase: "menu", activeIndex: 5 });
});

test("renders six real tone buttons", () => {
  const markup = renderToStaticMarkup(
    createElement(ToneRail, { selectedDrinkId: "sac", onSelect: () => {} }),
  );
  assert.equal((markup.match(/<button/g) || []).length, 6);
  assert.match(markup, /aria-label="Show sắc cocktail"/);
  assert.match(markup, /aria-pressed="true"/);
});
```

- [ ] **Step 2: Run the tests and verify imports fail**

Run: `node --import tsx --test tests/tone-rail.test.tsx`

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `tone-rail`.

- [ ] **Step 3: Implement the pure tone model**

Create `app/modules/welcome/tone-rail/model.ts`:

```ts
export const TONES = [
  { id: "sac", label: "sắc", mark: "´" },
  { id: "huyen", label: "huyền", mark: "`" },
  { id: "khong", label: "không", mark: "•" },
  { id: "hoi", label: "hỏi", mark: "ˀ" },
  { id: "nga", label: "ngã", mark: "~" },
  { id: "nang", label: "nặng", mark: "." },
] as const;

export type ToneId = (typeof TONES)[number]["id"];
export type TonePhase = "conducting" | "compressed" | "expanded" | "menu";

export function getToneRailState(progress: number): {
  phase: TonePhase;
  activeIndex: number;
} {
  const value = Math.min(1, Math.max(0, progress));
  const phase: TonePhase =
    value >= 0.78
      ? "menu"
      : value >= 0.64
        ? "expanded"
        : value >= 0.48
          ? "compressed"
          : "conducting";
  return {
    phase,
    activeIndex: Math.min(
      TONES.length - 1,
      Math.floor(value * TONES.length + 0.5),
    ),
  };
}
```

- [ ] **Step 4: Implement the rail without React scroll rerenders**

Create `app/modules/welcome/tone-rail/index.tsx` with this public contract:

```tsx
import { useEffect, useRef } from "react";
import { TONES, getToneRailState, type ToneId } from "./model";
import "./style.css";

export function ToneRail({
  selectedDrinkId,
  onSelect,
}: {
  selectedDrinkId: ToneId;
  onSelect: (id: ToneId) => void;
}) {
  const railRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
      const progress = Math.min(1, Math.max(0, scrollY / max));
      const state = getToneRailState(progress);
      rail.style.setProperty("--tone-progress", progress.toFixed(4));
      rail.dataset.phase = state.phase;
      rail.dataset.active = String(state.activeIndex);
    };
    const requestUpdate = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    addEventListener("scroll", requestUpdate, { passive: true });
    addEventListener("resize", requestUpdate, { passive: true });
    return () => {
      removeEventListener("scroll", requestUpdate);
      removeEventListener("resize", requestUpdate);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <nav ref={railRef} className="tone-rail" aria-label="Vietnamese tone cocktails">
      <span className="tone-rail__wordmark" aria-hidden="true">NOBAR</span>
      <div className="tone-rail__marks">
        {TONES.map(({ id, label, mark }, index) => (
          <button
            key={id}
            type="button"
            className="tone-rail__mark"
            data-tone-index={index}
            aria-label={`Show ${label} cocktail`}
            aria-pressed={selectedDrinkId === id}
            onClick={() => onSelect(id)}
          >
            <span aria-hidden="true">{mark}</span>
            <span>{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
```

Write `style.css` so the rail is fixed, uses `transform` and `opacity` only, keeps every button at least 44px, and makes all buttons stable and visible under `prefers-reduced-motion: reduce`. Use `[data-phase="menu"]` to reveal labels and the individual `data-tone-index` values to create six different trajectories. Do not animate width, height, top, or left.

Start from this mechanism and add the six index-specific translate/rotate values beneath it:

```css
.tone-rail {
  position: fixed;
  inset: 0 0 auto;
  z-index: var(--sc-z-chrome);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--sc-3) var(--sc-gutter);
  pointer-events: none;
}

.tone-rail__marks {
  display: flex;
  align-items: center;
  gap: clamp(0.25rem, 1vw, 0.75rem);
}

.tone-rail__mark {
  min-width: 44px;
  min-height: 44px;
  border: 0;
  background: transparent;
  pointer-events: auto;
  transform: translate3d(0, calc((0.5 - var(--tone-progress)) * 24px), 0);
  transition: color 160ms var(--sc-ease-out), opacity 160ms var(--sc-ease-out);
}

.tone-rail__mark > span:last-child {
  opacity: 0;
  transform: translate3d(0, 6px, 0);
}

.tone-rail[data-phase="menu"] .tone-rail__mark > span:last-child {
  opacity: 1;
  transform: none;
}

@media (prefers-reduced-motion: reduce) {
  .tone-rail__mark,
  .tone-rail__mark > span:last-child {
    opacity: 1;
    transform: none;
  }
}
```

- [ ] **Step 5: Run tests, typecheck, and lint**

```bash
node --import tsx --test tests/tone-rail.test.tsx
npm run typecheck
npm run lint
```

Expected: PASS with no new errors.

- [ ] **Step 6: Commit the tone rail**

```bash
git add app/modules/welcome/tone-rail tests/tone-rail.test.tsx
git commit -m "feat: add the Nobar tone rail"
```

---

### Task 3: Make the existing menu controllable by the tone rail

**Files:**
- Modify: `app/modules/welcome/menu/index.tsx`
- Test: `tests/menu-selection.test.ts`

**Interfaces:**
- Consumes: `ToneId` values matching menu item IDs.
- Produces: `MenuProps { selectedDrinkId?: string; onDrinkChange?: (id: string) => void }`, `findDrinkSelection(id)`, and `wrapDrinkIndex(index, length)`.

- [ ] **Step 1: Write failing pure selection tests**

```ts
import assert from "node:assert/strict";
import test from "node:test";
import {
  findDrinkSelection,
  wrapDrinkIndex,
} from "../app/modules/welcome/menu";

test("finds an externally selected Vietnamese tone drink", () => {
  assert.deepEqual(findDrinkSelection("nga"), {
    categoryId: "dau",
    page: 4,
  });
});

test("rejects an unknown external drink", () => {
  assert.equal(findDrinkSelection("missing"), null);
});

test("wraps menu pagination in both directions", () => {
  assert.equal(wrapDrinkIndex(-1, 6), 5);
  assert.equal(wrapDrinkIndex(6, 6), 0);
});
```

- [ ] **Step 2: Run the test and verify missing exports fail**

Run: `node --import tsx --test tests/menu-selection.test.ts`

Expected: FAIL because `findDrinkSelection` is not exported.

- [ ] **Step 3: Add pure helpers and the public props**

Add near the top of `menu/index.tsx`:

```ts
export type MenuProps = {
  selectedDrinkId?: string;
  onDrinkChange?: (id: string) => void;
};

export function wrapDrinkIndex(index: number, length: number) {
  return ((index % length) + length) % length;
}

export function findDrinkSelection(id: string) {
  const drink = drinks.find((item) => item.id === id);
  if (!drink) return null;
  const categoryDrinks = drinks.filter((item) => item.category === drink.category);
  return {
    categoryId: drink.category,
    page: categoryDrinks.findIndex((item) => item.id === id),
  };
}
```

- [ ] **Step 4: Synchronize controlled selection without breaking local controls**

Change the component to `export function Menu({ selectedDrinkId, onDrinkChange }: MenuProps)`. Use `wrapDrinkIndex` for `drinkIndex`. Add an effect that applies `findDrinkSelection(selectedDrinkId)` only when it points to a different current item. Call `onDrinkChange?.(nextDrink.id)` after arrow, swipe, or category selection changes the visible item. Keep existing analytics event names.

Use this synchronization shape:

```tsx
useEffect(() => {
  if (!selectedDrinkId || drink.id === selectedDrinkId) return;
  const selection = findDrinkSelection(selectedDrinkId);
  if (!selection) return;
  setActiveCategory(selection.categoryId);
  setPage([selection.page, selection.page >= drinkIndex ? 1 : -1]);
}, [selectedDrinkId, drink.id, drinkIndex]);

const selectPage = (nextPage: number, nextDirection: number) => {
  const nextIndex = wrapDrinkIndex(nextPage, filteredDrinks.length);
  setPage([nextPage, nextDirection]);
  onDrinkChange?.(filteredDrinks[nextIndex].id);
};
```

Route `paginate`, swipe completion, and category reset through `selectPage`; when a category changes, emit the first drink ID in that category.

Replace all `transition-all` classes in this file with explicit transition properties. Keep Framer Motion for the item crossfade and drag interaction because those are local UI state, not scroll state.

- [ ] **Step 5: Run the focused and existing menu checks**

```bash
node --import tsx --test tests/menu-selection.test.ts
npm run validate:menu
npm run typecheck
```

Expected: PASS.

- [ ] **Step 6: Commit the controlled menu slice**

```bash
git add app/modules/welcome/menu/index.tsx tests/menu-selection.test.ts
git commit -m "feat: control menu selection from the tone rail"
```

---

### Task 4: Author the branding and concept cutlist beats

**Files:**
- Create: `app/modules/welcome/scroll-beat.tsx`
- Modify: `app/modules/welcome/branding/index.tsx`
- Modify: `app/modules/welcome/concept/index.tsx`
- Modify: `public/locales/en/translation.json`
- Modify: `public/locales/vi/translation.json`
- Test: `tests/scrollcraft-structure.test.ts`

**Interfaces:**
- Produces: `<ScrollBeat id chapter className children>` with `data-sc-act="flow"`, `data-sc-beat`, and one semantic `<section>`.
- Branding continues to consume `carouselItems` and optional `birthdayLang`.

- [ ] **Step 1: Write the failing beat and branding source tests**

```ts
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("provides the semantic flow-beat primitive", async () => {
  const beat = await readFile("app/modules/welcome/scroll-beat.tsx", "utf8");
  assert.match(beat, /data-sc-act="flow"/);
  assert.match(beat, /data-sc-beat=\{id\}/);
});

test("removes react-scroll navigation from branding", async () => {
  const branding = await readFile("app/modules/welcome/branding/index.tsx", "utf8");
  assert.doesNotMatch(branding, /from "react-scroll"/);
  assert.match(branding, /birthdayLang/);
  assert.match(branding, /BirthdayOverlay/);
});
```

- [ ] **Step 2: Run the test and verify the old Welcome fails**

Run: `node --import tsx --test tests/scrollcraft-structure.test.ts`

Expected: FAIL because `scroll-beat.tsx` does not exist and Branding still imports `react-scroll`.

- [ ] **Step 3: Add the semantic beat primitive**

Create `app/modules/welcome/scroll-beat.tsx`:

```tsx
import type { ComponentPropsWithoutRef } from "react";
import cn from "classnames";

export function ScrollBeat({
  id,
  chapter,
  className,
  ...props
}: ComponentPropsWithoutRef<"section"> & {
  id: string;
  chapter: "branding" | "concept" | "menu" | "map" | "contact";
}) {
  return (
    <section
      {...props}
      id={id}
      data-sc-act="flow"
      data-sc-beat={id}
      data-chapter={chapter}
      className={cn("nobar-beat", className)}
    />
  );
}
```

- [ ] **Step 4: Refactor Branding into three explicit fragments**

Split Branding into three named fragments so Welcome authors the section order explicitly:

```ts
export function BrandingHero(props: Pick<BrandingProps, "birthdayLang">): React.ReactNode
export function BrandingPeople(props: Pick<BrandingProps, "carouselItems">): React.ReactNode
export function BrandingMark(): React.ReactNode
```

Define the shared type in the same file:

```ts
export type BrandingProps = {
  carouselItems: MediaItem[];
  birthdayLang?: string;
};
```

`BrandingHero` uses the existing `<BackgroundVideo />` as ambient media, not a scrub clip, and preserves the current conditional birthday overlay behavior. When `birthdayLang` exists, render `<BirthdayOverlay lang={birthdayLang} />`; otherwise render the normal hero mark and copy. `BrandingPeople` owns the carousel and lightbox state locally, receiving `carouselItems` and rendering the existing `<Carousel />` as its active photographic field. `BrandingMark` uses `/carousel-content-optimized/nobar-07-26-_DSC4281.webp` with `/images/nobar-logo-black-white.png` at composition scale. Replace `react-scroll` links with native anchors to `#concept` and `#menu`, using semantic `<a>` elements.

- [ ] **Step 5: Refactor Concept into two asymmetric fragments**

Expose:

```ts
export function ConceptIdentity(): React.ReactNode
export function ConceptAnticipation(): React.ReactNode
```

`ConceptIdentity` renders `concept.title`, `concept.subtitle`, and `concept.description` in a 42/58 asymmetric split with `/carousel-content-optimized/nobar-07-26-_DSC4281.webp` as the venue-material image. `ConceptAnticipation` renders `/images/menu-optimized/image_6.webp` with new keys `concept.anticipationTitle` and `concept.anticipationBody`. Use `data-sc-in`, `data-sc-stagger="45"`, `data-sc-reveal="left"`, and `data-sc-kinetic="lines"` only as specified by the score.

- [ ] **Step 6: Add matching bilingual connective copy**

Add exactly these keys:

```json
// English
"branding.night": "A Vietnamese night, intact.",
"branding.people": "Drinks, low light, and the people who make the room.",
"concept.anticipationTitle": "A language you can taste.",
"concept.anticipationBody": "Six tones. Six drinks. One menu spoken in a different register."
```

```json
// Vietnamese
"branding.night": "Một đêm Việt, vẹn nguyên.",
"branding.people": "Rượu, ánh sáng thấp và những người làm nên căn phòng.",
"concept.anticipationTitle": "Một ngôn ngữ có thể nếm.",
"concept.anticipationBody": "Sáu thanh. Sáu ly. Một thực đơn được nói bằng một âm vực khác."
```

- [ ] **Step 7: Run focused tests and translation validation through typecheck/build parsing**

```bash
node --import tsx --test tests/scrollcraft-structure.test.ts
npm run typecheck
node -e "JSON.parse(require('fs').readFileSync('public/locales/en/translation.json')); JSON.parse(require('fs').readFileSync('public/locales/vi/translation.json'))"
```

Expected: the structure test, TypeScript, and JSON parsing all pass.

- [ ] **Step 8: Commit the authored chapter fragments**

```bash
git add app/modules/welcome/scroll-beat.tsx app/modules/welcome/branding/index.tsx app/modules/welcome/concept/index.tsx public/locales/en/translation.json public/locales/vi/translation.json tests/scrollcraft-structure.test.ts
git commit -m "refactor: author Nobar branding and concept cuts"
```

---

### Task 5: Build the menu peak and compose all 12 beats in Welcome

**Files:**
- Create: `app/modules/welcome/menu/peak.tsx`
- Modify: `app/modules/welcome/index.tsx`
- Modify: `app/modules/welcome/map/index.tsx`
- Modify: `app/modules/welcome/contact/index.tsx`
- Modify: `app/modules/welcome/style.css`
- Test: `tests/scrollcraft-structure.test.ts`

**Interfaces:**
- Consumes: `ToneId`, `ToneRail`, controlled `Menu`, Branding and Concept fragments, Map, Contact, and `useScrollcraftRuntime`.
- Produces: a single Welcome mount root containing exactly 12 explicit `ScrollBeat` elements.

- [ ] **Step 1: Add exact chapter-order assertions to the structural test**

Append:

```ts
test("authors twelve explicit Scrollcraft beats without legacy scroll controllers", async () => {
  const welcome = await readFile("app/modules/welcome/index.tsx", "utf8");
  assert.equal((welcome.match(/<ScrollBeat/g) || []).length, 12);
  assert.doesNotMatch(welcome, /ReactLenis|useScroll|useTransform/);
  assert.doesNotMatch(welcome, /snap-start|snap-always/);
});

test("keeps the approved chapter order in the authored score", async () => {
  const welcome = await readFile("app/modules/welcome/index.tsx", "utf8");
  const chapters = [...welcome.matchAll(/chapter="(branding|concept|menu|map|contact)"/g)]
    .map((match) => match[1]);
  assert.deepEqual(chapters, [
    "branding", "branding", "branding",
    "concept", "concept",
    "menu", "menu", "menu", "menu",
    "map", "map",
    "contact",
  ]);
});
```

- [ ] **Step 2: Implement the three menu-peak fragments**

Create `menu/peak.tsx` exporting:

```ts
export function MenuAppetite(): React.ReactNode
export function ToneConstellation(): React.ReactNode
export function ToneResolve(): React.ReactNode
```

`MenuAppetite` uses `/images/menu-optimized/image_1.webp` as a full-bleed macro reveal. `ToneConstellation` renders six labelled figures from `TONES` and the matching six menu images in authored markup. `ToneResolve` renders the final peak composition with a single real heading and no duplicate buttons; the fixed `ToneRail` supplies the functional controls.

- [ ] **Step 3: Split Map into destination and arrival content**

Keep the lazy Leaflet surface, status, copy-address action, and Get Directions link in `MapDestination`. Export a second `MapArrival` fragment that uses the real address and a venue image without mounting a second Leaflet map. Ensure only one element owns `id="map"`.

Public exports:

```ts
export function MapDestination(): React.ReactNode
export function MapArrival(): React.ReactNode
```

- [ ] **Step 4: Turn Contact into a stable final plate**

Remove `whileInView` from the outer content. Render all content visible by default, then use `data-sc-in` for enhancement. Add the existing Google Maps URL as a visible `<a>` labelled with `t("map.getDirections")`. Keep hours and Instagram.

- [ ] **Step 5: Replace Welcome with the explicit score**

Use this state and root contract:

```tsx
const rootRef = useRef<HTMLElement>(null);
const [selectedTone, setSelectedTone] = useState<ToneId>("sac");
useScrollcraftRuntime(rootRef);

return (
  <main ref={rootRef} className="nobar-scrollcraft" data-sc-root data-sc-lerp="0.22">
    <ToneRail selectedDrinkId={selectedTone} onSelect={setSelectedTone} />
    <ScrollBeat id="branding-pulse" chapter="branding"><BrandingHero birthdayLang={birthdayLang} /></ScrollBeat>
    <ScrollBeat id="branding-people" chapter="branding"><BrandingPeople carouselItems={carouselItems} /></ScrollBeat>
    <ScrollBeat id="branding-mark" chapter="branding"><BrandingMark /></ScrollBeat>
    <ScrollBeat id="concept-pride" chapter="concept"><ConceptIdentity /></ScrollBeat>
    <ScrollBeat id="concept-pressure" chapter="concept"><ConceptAnticipation /></ScrollBeat>
    <ScrollBeat id="menu-appetite" chapter="menu"><MenuAppetite /></ScrollBeat>
    <ScrollBeat id="menu-delight" chapter="menu"><ToneConstellation /></ScrollBeat>
    <ScrollBeat id="menu-peak" chapter="menu"><ToneResolve /></ScrollBeat>
    <ScrollBeat id="menu-live" chapter="menu"><Menu selectedDrinkId={selectedTone} onDrinkChange={(id) => isToneId(id) && setSelectedTone(id)} /></ScrollBeat>
    <ScrollBeat id="map-urgency" chapter="map"><MapDestination /></ScrollBeat>
    <ScrollBeat id="map-arrival" chapter="map"><MapArrival /></ScrollBeat>
    <ScrollBeat id="contact-resolve" chapter="contact"><Contact /></ScrollBeat>
  </main>
);
```

Add this guard to `tone-rail/model.ts`:

```ts
export function isToneId(value: string): value is ToneId {
  return TONES.some(({ id }) => id === value);
}
```

Append this focused test to `tests/tone-rail.test.tsx`:

```ts
test("recognizes only the six tone drink IDs", () => {
  assert.equal(isToneId("sac"), true);
  assert.equal(isToneId("negroni"), false);
});
```

- [ ] **Step 6: Replace sticky-card CSS with cutlist foundations**

Delete `.card-container`, `.card`, snap classes, and Lenis-specific assumptions from `welcome/style.css`. Add:

```css
.nobar-scrollcraft {
  --sc-canvas: #08090b;
  --sc-surface: #171320;
  --sc-ink: #f0ece7;
  --sc-ink-soft: #aaa1b2;
  --sc-accent: #78945e;
  --sc-accent-ink: #0b0d0a;
  --sc-font-display: "iCiel Novecento sans", system-ui, sans-serif;
  --sc-font-text: "BT Beau Sans", system-ui, sans-serif;
  position: relative;
  overflow: clip;
  background: var(--sc-canvas);
}

.nobar-beat {
  position: relative;
  min-height: 100svh;
  overflow: clip;
  isolation: isolate;
}

.nobar-beat > * {
  min-height: inherit;
}
```

Then author distinct hard grounds and layouts for every beat ID. Use only transform, opacity, and clip-path for continuous motion. Give beat 8 the largest visual delta while keeping it below 1.4 viewport-heights.

Use this exact ground and composition map:

| Beat | Ground | Composition |
|---|---|---|
| `branding-pulse` | `#09080b` | full-bleed portrait film, lead wordmark |
| `branding-people` | `#2b1721` | full-frame masonry field, trail caption |
| `branding-mark` | `#55476a` | venue geometry full bleed, centered oversized mark |
| `concept-pride` | `#0f1410` | 42/58 copy and venue split |
| `concept-pressure` | `#111015` | isolated drink at trail, lead copy |
| `menu-appetite` | `#173f2b` | full-bleed macro, bottom-band copy |
| `menu-delight` | `#2c1736` | six asymmetric drink figures |
| `menu-peak` | `#78945e` | fixed-rail choreography over high-contrast field |
| `menu-live` | selected drink background | existing interactive menu |
| `map-urgency` | `#0b0e12` | 4/8 information and live-map split |
| `map-arrival` | `#3b2420` | venue image masked away from address copy |
| `contact-resolve` | `#08090b` | stable two-column destination plate |

- [ ] **Step 7: Remove old orchestration imports and pass the structural test**

Remove `framer-motion` page progress imports, Lenis, `ElementRef`, snap timers, blur constants, and parent motion wrappers from Welcome. Run:

```bash
node --import tsx --test tests/scrollcraft-structure.test.ts tests/tone-rail.test.tsx tests/menu-selection.test.ts
npm run typecheck
npm run lint
```

Expected: PASS.

- [ ] **Step 8: Commit the complete semantic cutlist**

```bash
git add app/modules/welcome/index.tsx app/modules/welcome/menu/peak.tsx app/modules/welcome/map/index.tsx app/modules/welcome/contact/index.tsx app/modules/welcome/style.css app/modules/welcome/tone-rail/model.ts tests/scrollcraft-structure.test.ts
git commit -m "refactor: compose the Nobar rhythmic cutlist"
```

---

### Task 6: Finish the visual system, dependency cleanup, and automated checks

**Files:**
- Modify: `app/app.css`
- Modify: `app/modules/welcome/style.css`
- Modify: `app/modules/welcome/tone-rail/style.css`
- Modify: touched chapter files containing `transition-all`
- Modify: `package.json`
- Modify: `package-lock.json`
- Test: all `tests/*.test.ts` and `tests/*.test.tsx`

**Interfaces:**
- Consumes: completed 12-beat page.
- Produces: production-ready responsive and reduced-motion styling with no superseded scroll dependencies.

- [ ] **Step 1: Add Beau Sans as the text family**

In `app/app.css`, define `BT Beau Sans` regular, medium, and bold faces using the existing WOFF2 files. Remove `content-visibility: auto` from `html, body`, set native `scroll-behavior: auto` for the cutlist, and keep the off-black overscroll ground.

- [ ] **Step 2: Audit hard-rule motion and surface violations**

Run:

```bash
rg -n "transition-all|transition:\s*all|ReactLenis|from \"react-scroll\"|snap-always|snap-start|gradient.*text|scroll to explore|01 / 06" app
```

Expected before fixes: only touched legacy components may match. Replace each touched `transition-all` with `transition-[property]`, `transition-transform`, `transition-colors`, or `transition-opacity`. Final expected output: no matches for prohibited scroll systems or generic transitions in the Welcome module.

- [ ] **Step 3: Complete responsive and reduced-motion CSS**

For widths below 700px, step display type down one rung, convert corner copy to bottom-band layouts, preserve at least 44px controls, and ensure the fixed rail does not cover language navigation. Under reduced motion:

```css
@media (prefers-reduced-motion: reduce) {
  .nobar-scrollcraft [data-sc-in],
  .nobar-scrollcraft [data-sc-reveal],
  .tone-rail__mark {
    opacity: 1;
    transform: none;
    clip-path: none;
  }
}
```

Do not hide content behind a class that only appears after runtime mount.

- [ ] **Step 4: Remove superseded dependencies and add verification tooling**

Run:

```bash
npm uninstall lenis react-scroll @types/react-scroll
npm install --save-dev playwright-core
```

Add this script to `package.json`:

```json
"test": "node --import tsx --test tests/*.test.ts tests/*.test.tsx"
```

- [ ] **Step 5: Run the complete automated suite**

```bash
npm test
npm run validate:carousel
npm run validate:menu
npm run typecheck
npm run lint
npm run build
```

Expected: all commands exit 0. If lint reveals pre-existing errors outside touched files, record them separately and ensure no new error comes from the refactor.

- [ ] **Step 6: Commit visual polish and dependency cleanup**

```bash
git add app/app.css app/modules/welcome app/root.tsx public/locales/en/translation.json public/locales/vi/translation.json package.json package-lock.json tests
git commit -m "style: finish the Nobar Scrollcraft experience"
```

Before committing, inspect `git diff --cached --name-only` and unstage any birthday-route file not intentionally edited by this plan.

---

### Task 7: Run Scrollcraft verification, feel check, and append the fingerprint

**Files:**
- Modify: `scrollcraft/builds/nobar-dalat/BRIEF.md`
- Modify: `scrollcraft/FINGERPRINTS.md`
- Generate: `scrollcraft/builds/nobar-dalat/lab/desktop/*`
- Generate: `scrollcraft/builds/nobar-dalat/lab/mobile/*`
- Generate: `scrollcraft/builds/nobar-dalat/lab/reduced/*`

**Interfaces:**
- Consumes: local production-equivalent `/en` and `/en/birthday` routes.
- Produces: verified contact sheets, feel-check diff, and append-only fingerprint record.

- [ ] **Step 1: Start the local site and capture its URL**

Run: `npm run dev`

Expected: React Router dev server reports `http://localhost:5173` or the actual available port. Keep the session running.

- [ ] **Step 2: Run the Scrollcraft harness at all required modes**

```bash
node /Users/garfdev/.codex/skills/scrollcraft/scripts/shoot.mjs --url http://localhost:5173/en --out scrollcraft/builds/nobar-dalat/lab/desktop
node /Users/garfdev/.codex/skills/scrollcraft/scripts/shoot.mjs --url http://localhost:5173/en --out scrollcraft/builds/nobar-dalat/lab/mobile --width 390 --height 844
node /Users/garfdev/.codex/skills/scrollcraft/scripts/shoot.mjs --url http://localhost:5173/en --out scrollcraft/builds/nobar-dalat/lab/reduced --reduced-motion
```

Expected: each run writes a report and contact sheet. Reports contain no unexplained dead scroll, cue that never reaches full opacity, frozen media, or failing composited contrast.

- [ ] **Step 3: Inspect all three contact sheets visually**

Open each `sheet.png`. Verify:

- beat 5 is charged anticipation, not a blank delay;
- beat 8 is the largest visual change;
- every image crop works at desktop and 390x844;
- the rail becomes readable controls by the live menu;
- the final screen is stable and contains Get Directions;
- reduced motion preserves every message and control.

If any check fails, fix the smallest owning component or style, rerun automated checks for that slice, then rerun all three harness modes.

- [ ] **Step 4: Verify keyboard and birthday behavior in Chrome**

Tab from the language control through tone buttons, menu categories, menu arrows, map actions, Instagram, and Get Directions. Focus must remain visible and follow DOM reading order.

Open `/en/birthday` and `/vi/birthday`. Confirm the announcement overlay, language-preserving route switch, no-index metadata, and reduced-motion ring fallback remain intact.

- [ ] **Step 5: Run the cold feel check and document the diff**

Without rereading `BRIEF.md`, scroll `/en` once at a normal pace and record one felt word per beat. Then compare against:

`Pulse, Recognition, Intrigue, Pride, Anticipation, Appetite, Delight, Awe, Momentum, Urgency, Arrival, Resolve.`

Append a `## Feel-check result` section to `BRIEF.md` containing the felt curve, mismatches, and exact fixes. Do not rewrite the intended curve to match the result.

- [ ] **Step 6: Append the shipped fingerprint**

Add this row to the registry table, replacing the port with the actual local port:

```markdown
| nobar-dalat | Rhythmic cutlist | Fixed tone rail becoming menu navigation | Full-frame venue cut with composition-scale mark | 12 flow acts, 10-12vh | Abrupt stable destination plate | Vietnamese tone marks conduct the page and become menu controls | Nocturnal documentary | 5173 |
```

Add bullets under **What is taken** for the rhythmic cutlist grammar, fixed-to-functional tone rail, 12-act 10-to-12vh band, abrupt destination close, and this signature move.

- [ ] **Step 7: Run final verification from a clean command sequence**

```bash
npm test
npm run typecheck
npm run lint
npm run build
git diff --check
git status --short
```

Expected: all verification commands pass. `git status` may still show the user's pre-existing birthday changes only if they were not committed independently; no unrelated file is staged.

- [ ] **Step 8: Commit verification records**

```bash
git add scrollcraft/builds/nobar-dalat/BRIEF.md scrollcraft/FINGERPRINTS.md
git commit -m "test: verify the Nobar Scrollcraft journey"
```

Keep generated screenshots uncommitted unless the repository's artifact policy explicitly requires them. Report their absolute paths in the handoff.

---

## Completion Report

Report:

- grammar choice and why the seven alternatives lost;
- signature move and fingerprint result;
- intended versus felt curve and corrections;
- exact automated commands that passed;
- desktop, mobile, and reduced-motion contact-sheet paths;
- what was verified on the birthday routes;
- the local URL;
- the remaining requirement to test real iPhone decoding and touch behavior if no physical device was available.
