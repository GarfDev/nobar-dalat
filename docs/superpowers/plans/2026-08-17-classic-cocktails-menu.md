# Classic Cocktails Menu Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the two No Bar house collections and add an `OLD FASHIONED` category containing six popular classic cocktails with licensed, locally stored photography.

**Architecture:** Keep `app/data/menu.json` as the single menu catalogue and the locale JSON files as the UI copy source. Extend the existing build-time Sharp pipeline so nested source-image folders produce matching nested WebP folders, then validate catalogue order, translations, and asset paths with a project script before build. The existing menu component remains data-driven and requires no layout changes.

**Tech Stack:** React Router 7, React 19, TypeScript 5.8, i18next, Sharp, Node.js built-in assertions, Pexels/Unsplash licensed photography.

## Global Constraints

- Preserve the clean committed UI; do not restore the discarded pre-conversation page redesign.
- Keep all nine No Bar drinks and their verified photo assignments.
- Use concise Vietnamese ingredient labels; avoid literal translations and repeated ingredients across adjacent lines.
- Add exactly six classics: Old Fashioned, Negroni, Margarita, Dry Martini, Espresso Martini, and Daiquiri.
- Use searched free-to-use photography; do not generate images or use premium/watermarked files.
- Store classic sources under `public/images/menu/classics/` and WebP outputs under `public/images/menu-optimized/classics/`.
- Reuse the existing carousel, typography, animation, and category navigation.
- Record photographer, source page, and license for every external photograph.

---

## File Map

- Create `scripts/menu-images.ts`: recursively optimize menu source images while preserving relative paths.
- Create `scripts/validate-menu.ts`: validate category/item ordering, translation coverage, unique IDs, and optimized image existence.
- Modify `scripts/prebuild-carousel.ts`: call the recursive menu optimizer.
- Modify `package.json`: add `validate:menu` and run it after image preprocessing in `build`.
- Modify `app/data/menu.json`: restore Sắc and Hỏi and add the six classic drinks/category.
- Modify `public/locales/en/translation.json`: add the category and six English drink entries.
- Modify `public/locales/vi/translation.json`: add the category and six Vietnamese drink entries.
- Create `docs/menu-classic-image-sources.md`: preserve licensing and photographer records.
- Create six source photographs under `public/images/menu/classics/`.
- Generate six optimized WebP files under `public/images/menu-optimized/classics/`.
- Test `tests/menu-images.test.ts`: prove recursive optimization and path preservation.

---

### Task 1: Recursive Menu Image Optimizer

**Files:**
- Create: `scripts/menu-images.ts`
- Modify: `scripts/prebuild-carousel.ts`
- Test: `tests/menu-images.test.ts`

**Interfaces:**
- Produces: `optimizeMenuImages(inputDir: string, outputDir: string): Promise<string[]>`
- Returns: normalized relative WebP paths such as `classics/old-fashioned.webp`
- Consumed by: `scripts/prebuild-carousel.ts`

- [ ] **Step 1: Write the failing recursive optimizer test**

```ts
import assert from "node:assert/strict";
import { mkdtemp, mkdir, access } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import sharp from "sharp";
import { optimizeMenuImages } from "../scripts/menu-images";

test("optimizes nested menu images and preserves relative paths", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "nobar-menu-images-"));
  const input = path.join(root, "input");
  const output = path.join(root, "output");
  await mkdir(path.join(input, "classics"), { recursive: true });
  await sharp({
    create: { width: 24, height: 32, channels: 3, background: "#8b4513" },
  }).jpeg().toFile(path.join(input, "classics", "old-fashioned.jpg"));

  const generated = await optimizeMenuImages(input, output);

  assert.deepEqual(generated, ["classics/old-fashioned.webp"]);
  await access(path.join(output, "classics", "old-fashioned.webp"));
});
```

- [ ] **Step 2: Run the test and verify the module is missing**

Run: `node --import tsx --test tests/menu-images.test.ts`

Expected: FAIL with `Cannot find module '../scripts/menu-images'`.

- [ ] **Step 3: Implement the recursive optimizer**

```ts
import path from "node:path";
import { mkdir, readdir } from "node:fs/promises";
import sharp from "sharp";

const menuImagePattern = /\.(png|jpe?g)$/i;

async function listImages(root: string, current = root): Promise<string[]> {
  const entries = await readdir(current, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const absolute = path.join(current, entry.name);
    if (entry.isDirectory()) return listImages(root, absolute);
    if (!entry.isFile() || !menuImagePattern.test(entry.name)) return [];
    return [path.relative(root, absolute)];
  }));
  return nested.flat().sort();
}

export async function optimizeMenuImages(
  inputDir: string,
  outputDir: string,
): Promise<string[]> {
  const sources = await listImages(inputDir);
  const generated: string[] = [];
  for (const relativeSource of sources) {
    const relativeOutput = path.join(
      path.dirname(relativeSource),
      `${path.parse(relativeSource).name}.webp`,
    );
    const outputPath = path.join(outputDir, relativeOutput);
    await mkdir(path.dirname(outputPath), { recursive: true });
    await sharp(path.join(inputDir, relativeSource))
      .rotate()
      .resize(600, null, { withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(outputPath);
    generated.push(relativeOutput.split(path.sep).join("/"));
  }
  return generated;
}
```

- [ ] **Step 4: Replace the flat menu-image loop**

Import `optimizeMenuImages` in `scripts/prebuild-carousel.ts`, remove its inline `readdir(menuInputDir)` loop, and call:

```ts
const optimizedMenuImages = await optimizeMenuImages(menuInputDir, menuOutputDir);
console.log(
  `[prebuild-carousel] Optimized ${optimizedMenuImages.length} menu images to ${menuOutputDir}`,
);
```

- [ ] **Step 5: Run the focused test**

Run: `node --import tsx --test tests/menu-images.test.ts`

Expected: one passing test and an optimized nested WebP fixture.

- [ ] **Step 6: Commit the optimizer**

```bash
git add scripts/menu-images.ts scripts/prebuild-carousel.ts tests/menu-images.test.ts
git commit -m "build: optimize nested menu images"
```

---

### Task 2: Licensed Classic Cocktail Photographs

**Files:**
- Create: `public/images/menu/classics/old-fashioned.jpg`
- Create: `public/images/menu/classics/negroni.jpg`
- Create: `public/images/menu/classics/margarita.jpg`
- Create: `public/images/menu/classics/dry-martini.jpg`
- Create: `public/images/menu/classics/espresso-martini.jpg`
- Create: `public/images/menu/classics/daiquiri.jpg`
- Create: `docs/menu-classic-image-sources.md`

**Interfaces:**
- Produces: six JPEG source assets consumed by `optimizeMenuImages`
- Produces: a permanent source/license record for maintainers

- [ ] **Step 1: Download the six approved free-use candidates**

Use each source page's free-download control and save the original-resolution result under the exact filenames above:

| Drink | Photographer | Source page | License |
|---|---|---|---|
| Old Fashioned | Airam Dato-on | `https://www.pexels.com/photo/elegant-old-fashioned-cocktail-on-bar-counter-29707925/` | Pexels License, free to use |
| Negroni | Tommaso Ubezio | `https://unsplash.com/photos/a-negroni-cocktail-with-an-orange-slice-garnish-qpSoF5XcO9s` | Unsplash License, free to use |
| Margarita | Caio Niceas | `https://www.pexels.com/photo/refreshing-margarita-cocktail-with-lime-36580798/` | Pexels License, free to use |
| Dry Martini | Stanislav Ivanitskiy | `https://unsplash.com/photos/martini-cocktail-VIYPN3KykEU` | Unsplash License, free to use |
| Espresso Martini | Rodrigo Ortega | `https://www.pexels.com/photo/espresso-martini-with-coffee-beans-on-dark-wood-31042724/` | Pexels License, free to use |
| Daiquiri | James McGraw | `https://unsplash.com/photos/a-person-holding-a-cocktail-glass-with-a-lime-garnish-m_p7oNWUm9g` | Unsplash License, free to use |

- [ ] **Step 2: Write the source record**

Create `docs/menu-classic-image-sources.md` with the table above, access date `2026-08-17`, the final local source path, and the statement: `Images are used under the license displayed on each source page at download time.`

- [ ] **Step 3: Validate the downloaded files**

Run:

```bash
file public/images/menu/classics/*
npx tsx -e 'import sharp from "sharp"; import {readdir} from "node:fs/promises"; const d="public/images/menu/classics"; for (const f of await readdir(d)) { const m=await sharp(`${d}/${f}`).metadata(); if (!m.width || !m.height || m.width < 800 || m.height < 800) throw new Error(`${f} is too small`); console.log(f,m.width,m.height); }'
```

Expected: six readable JPEG/PNG inputs, each at least 800 pixels on both axes.

- [ ] **Step 4: Generate the optimized WebPs**

Run: `npx tsx scripts/prebuild-carousel.ts`

Expected: six files under `public/images/menu-optimized/classics/`, each no wider than 600 pixels.

- [ ] **Step 5: Visually inspect all six source and optimized files**

Confirm the named cocktail is unambiguous, the glass remains centered after `object-cover`, and no watermark or premium-stock overlay is present. Reject and replace a candidate if any check fails.

- [ ] **Step 6: Commit sources, derivatives, and licensing record**

```bash
git add public/images/menu/classics public/images/menu-optimized/classics docs/menu-classic-image-sources.md
git commit -m "assets: add licensed classic cocktail photos"
```

---

### Task 3: Menu Catalogue Validator

**Files:**
- Create: `scripts/validate-menu.ts`
- Modify: `package.json`

**Interfaces:**
- Consumes: `app/data/menu.json`, both translation files, and project-relative image paths
- Produces: exit code 0 only for the complete fifteen-drink catalogue

- [ ] **Step 1: Write the validator with exact expected IDs**

Create a TypeScript script that asserts:

```ts
const expectedCategories = ["elo", "dau", "old-fashioned"];
const expectedByCategory = {
  elo: ["lan-man", "loang-choang", "lon-xon"],
  dau: ["sac", "huyen", "khong", "hoi", "nga", "nang"],
  "old-fashioned": [
    "old-fashioned",
    "negroni",
    "margarita",
    "dry-martini",
    "espresso-martini",
    "daiquiri",
  ],
} as const;
```

For every item, assert a unique ID, its exact order within its category, a non-empty `bgColor`, `accentColor`, `image`, and `shape`, a real optimized image file under `public`, and `name`, `ingredients`, and `tags` keys in both locale files. Print `Validated 3 categories and 15 menu items.` on success.

- [ ] **Step 2: Add the package command and build gate**

Update `package.json` scripts to:

```json
"build": "tsx ./scripts/prebuild-carousel.ts && npm run validate:menu && react-router build",
"validate:menu": "tsx ./scripts/validate-menu.ts"
```

- [ ] **Step 3: Run the validator before catalogue changes**

Run: `npm run validate:menu`

Expected: FAIL because category `old-fashioned` and items `sac`, `hoi`, and the six classics are missing.

- [ ] **Step 4: Commit the failing validation gate**

```bash
git add scripts/validate-menu.ts package.json
git commit -m "test: validate complete menu catalogue"
```

---

### Task 4: Complete the House Collections

**Files:**
- Modify: `app/data/menu.json`
- Modify: `public/locales/en/translation.json`
- Modify: `public/locales/vi/translation.json`

**Interfaces:**
- Produces: ordered `dau` items `[sac, huyen, khong, hoi, nga, nang]`
- Uses: existing locale entries and `/images/menu-optimized/image_1.webp` through `image_6.webp`

- [ ] **Step 1: Add Sắc and Hỏi and normalize six-tone ordering**

Add `sac` with order `0`, image `/images/menu-optimized/image_1.webp`, colors `#173F2B` and `#277C4A`, and shape `blob2`. Add `hoi` with order `3`, image `/images/menu-optimized/image_2.webp`, colors `#33241B` and `#8B5A2B`, and shape `blob3`. Use their existing English/Vietnamese ingredients and tags from the locale files.

Set `huyen.order` to `1`, `khong.order` to `2`, `nga.order` to `4`, and `nang.order` to `5`. Reorder the JSON objects to match the display order.

- [ ] **Step 2: Simplify and normalize house-menu copy**

Apply these exact changes to both locale files and the matching embedded `en`/`vi` objects in `app/data/menu.json`:

| Drink | Locale | Ingredients |
|---|---|---|
| Lan Man | English | `JACKFRUIT — RUM`; `MATCHA`; `CREAM — FRANGELICO` |
| Lan Man | Vietnamese | `MÍT — RUM`; `MATCHA`; `KEM — FRANGELICO` |
| Loạng Choạng | Vietnamese | `ME — CÀ PHÊ`; `YUZU — CHANH`; `CỒN ỚT — RUM ĐEN`; `RUM CHUỐI — HẠT DỔI` |
| Nặng | Vietnamese | `BOURBON Ủ NGÔ`; `MẬT ONG`; `WHISKEY KNOB CREEK`; `BITTER CACAO — NHỤC ĐẬU KHẤU` |
| Ngã | English | `FENNEL SEEDS-INFUSED WHISKEY`; `OOLONG TEA — HOPS`; `OOLONG-INFUSED GIN`; `AMARETTO — ABSINTHE` |
| Ngã | Vietnamese | `WHISKEY Ủ HẠT THÌ LÀ`; `TRÀ Ô LONG — HOA BIA`; `GIN Ủ TRÀ Ô LONG`; `AMARETTO — ABSINTHE` |
| Không | Vietnamese | `VODKA Ủ NHỤC ĐẬU KHẤU`; `MEZCAL — XOÀI — THÌ LÀ`; `SHERRY CREAM — HOA BIA` |

Keep all unlisted house-menu ingredient and tag strings unchanged.

- [ ] **Step 3: Run the validator**

Run: `npm run validate:menu`

Expected: still FAIL only for the missing `old-fashioned` category and its six items; `sac` and `hoi` must no longer appear in the failure output.

- [ ] **Step 4: Commit the house-menu restoration and copy cleanup**

```bash
git add app/data/menu.json public/locales/en/translation.json public/locales/vi/translation.json
git commit -m "feat: restore and refine house menus"
```

---

### Task 5: Add the Classic Cocktail Catalogue and Copy

**Files:**
- Modify: `app/data/menu.json`
- Modify: `public/locales/en/translation.json`
- Modify: `public/locales/vi/translation.json`

**Interfaces:**
- Produces: category ID `old-fashioned` and six translated item IDs
- Consumed by: existing `Menu` component through `menuData.categories`, `menuData.items`, and i18next keys

- [ ] **Step 1: Add the category**

Append this category after `dau`:

```json
{
  "id": "old-fashioned",
  "order": 2,
  "en": "OLD FASHIONED",
  "vi": "OLD FASHIONED"
}
```

- [ ] **Step 2: Add six menu items**

Use these exact identity and presentation fields:

| ID | Order | Image | Background | Accent | Shape |
|---|---:|---|---|---|---|
| `old-fashioned` | 0 | `/images/menu-optimized/classics/old-fashioned.webp` | `#3B1F16` | `#B8602B` | `blob1` |
| `negroni` | 1 | `/images/menu-optimized/classics/negroni.webp` | `#361826` | `#B23A54` | `blob2` |
| `margarita` | 2 | `/images/menu-optimized/classics/margarita.webp` | `#18382D` | `#2F8A68` | `blob3` |
| `dry-martini` | 3 | `/images/menu-optimized/classics/dry-martini.webp` | `#162C38` | `#6E9BAD` | `blob1` |
| `espresso-martini` | 4 | `/images/menu-optimized/classics/espresso-martini.webp` | `#2D1D18` | `#8A5D3B` | `blob2` |
| `daiquiri` | 5 | `/images/menu-optimized/classics/daiquiri.webp` | `#1E293A` | `#775C9C` | `blob3` |

Set `category` to `old-fashioned`, `backgroundType` to `color`, and `backgroundImage` to an empty string for all six.
Add matching embedded `en` and `vi` objects to each item using the exact locale copy in Steps 3 and 4, preserving the existing menu-data shape.

- [ ] **Step 3: Add exact English locale copy**

```json
"old-fashioned": {"name":"old fashioned","ingredients":["BOURBON OR RYE WHISKEY","SUGAR — AROMATIC BITTERS","WATER — ORANGE PEEL"],"tags":"SPIRIT-FORWARD — BITTERSWEET — CITRUS"},
"negroni": {"name":"negroni","ingredients":["GIN","CAMPARI","SWEET VERMOUTH — ORANGE"],"tags":"BITTER — HERBAL — CITRUS"},
"margarita": {"name":"margarita","ingredients":["TEQUILA","ORANGE LIQUEUR","FRESH LIME — SALT"],"tags":"BRIGHT — TART — SALINE"},
"dry-martini": {"name":"dry martini","ingredients":["GIN","DRY VERMOUTH","LEMON PEEL OR OLIVE"],"tags":"DRY — CRISP — BOTANICAL"},
"espresso-martini": {"name":"espresso martini","ingredients":["VODKA","COFFEE LIQUEUR","ESPRESSO — SUGAR SYRUP"],"tags":"RICH — ROASTED — BITTERSWEET"},
"daiquiri": {"name":"daiquiri","ingredients":["WHITE RUM","FRESH LIME","SUGAR SYRUP"],"tags":"BRIGHT — TART — CLEAN"}
```

Add category key `"old-fashioned": "OLD FASHIONED"`.

- [ ] **Step 4: Add exact Vietnamese locale copy**

```json
"old-fashioned": {"name":"old fashioned","ingredients":["BOURBON HOẶC RYE","ĐƯỜNG — BITTER","NƯỚC — VỎ CAM"],"tags":"NỒNG — ĐẮNG NGỌT — HƯƠNG CAM"},
"negroni": {"name":"negroni","ingredients":["GIN","CAMPARI","VERMOUTH NGỌT — VỎ CAM"],"tags":"ĐẮNG — THẢO MỘC — HƯƠNG CAM"},
"margarita": {"name":"margarita","ingredients":["TEQUILA","RƯỢU CAM","CHANH XANH — MUỐI"],"tags":"TƯƠI — CHUA — MẶN NHẸ"},
"dry-martini": {"name":"dry martini","ingredients":["GIN","VERMOUTH KHÔ","VỎ CHANH HOẶC Ô-LIU"],"tags":"KHÔ — SẮC NÉT — THẢO MỘC"},
"espresso-martini": {"name":"espresso martini","ingredients":["VODKA","RƯỢU CÀ PHÊ","ESPRESSO — SYRUP ĐƯỜNG"],"tags":"ĐẬM — RANG THƠM — NGỌT ĐẮNG"},
"daiquiri": {"name":"daiquiri","ingredients":["RUM TRẮNG","CHANH XANH","SYRUP ĐƯỜNG"],"tags":"TƯƠI — CHUA — THANH"}
```

Add category key `"old-fashioned": "OLD FASHIONED"`.

- [ ] **Step 5: Run the catalogue validator**

Run: `npm run validate:menu`

Expected: `Validated 3 categories and 15 menu items.`

- [ ] **Step 6: Commit catalogue and translations**

```bash
git add app/data/menu.json public/locales/en/translation.json public/locales/vi/translation.json
git commit -m "feat: add popular classic cocktails menu"
```

---

### Task 6: Full Verification and Visual QA

**Files:**
- Verify all modified and generated files

**Interfaces:**
- Consumes: completed catalogue, translations, source images, optimized images, and unchanged Menu component
- Produces: evidence that all requirements pass without unrelated UI changes

- [ ] **Step 1: Confirm only intended files changed**

Run: `git status --short` and `git diff --stat 9cabe3c..HEAD`.

Expected: menu data, locales, image tooling/test, six source/optimized assets, source documentation, and plan/spec files only. No branding, concept, map, contact, menu-component, or global-style edits.

- [ ] **Step 2: Run automated checks**

```bash
node --import tsx --test tests/menu-images.test.ts
npm run validate:menu
npm run lint
npm run typecheck
npm run build
```

Expected: all commands exit 0; build reports three categories and fifteen valid items before React Router compilation.

- [ ] **Step 3: Start or reuse the local preview**

Run: `npm run dev -- --host 127.0.0.1` and open `http://127.0.0.1:5173/en`.

- [ ] **Step 4: Verify desktop behavior**

At a desktop viewport, click `OUR MENU`, then confirm:

- Category tabs show `E LỜ`, `SẮC HUYỀN KHÔNG HỎI NGÃ NẶNG`, and `OLD FASHIONED`.
- E LỜ has 3 pagination dots and wraps after Lộn Xộn.
- The six-tone category has 6 dots in the required order.
- OLD FASHIONED has 6 dots in the required order.
- Every title, recipe, tag, background, and photograph changes together.
- No image is stretched, broken, watermarked, or incorrectly identified.

- [ ] **Step 5: Verify mobile behavior**

At a 390×844 viewport, repeat all three categories and confirm the long category tabs scroll horizontally, both arrow controls remain reachable, drink titles fit, and the image crop keeps the glass visible.

- [ ] **Step 6: Verify Vietnamese copy**

Switch to Vietnamese and confirm all six classic ingredient lists and taste tags render without raw translation keys.

- [ ] **Step 7: Review browser logs**

Confirm there are no new error-level console messages, hydration failures, missing-image requests, or i18next missing-key warnings.

- [ ] **Step 8: Commit any verification-only correction**

If a correction is required, commit only the corrected menu, locale, image, or optimizer files with:

```bash
git add app/data/menu.json public/locales/en/translation.json public/locales/vi/translation.json scripts/menu-images.ts scripts/prebuild-carousel.ts public/images/menu/classics public/images/menu-optimized/classics docs/menu-classic-image-sources.md
git commit -m "fix: correct classic menu verification issue"
```

If no correction is required, do not create an empty commit.
