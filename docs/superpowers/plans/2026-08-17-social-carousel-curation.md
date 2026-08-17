# Social Carousel Curation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current loosely assembled opening carousel with a locally stored, source-documented, forty-item Social & Lived-In collection balanced at 20% venue, 35% drinks, and 45% people.

**Architecture:** Add a manifest as the single source of truth for selected carousel media, classification, attribution, and rights status. Keep original media in `public/carousel-content/`, make the existing Sharp prebuild process consume only manifest-listed files in the manifest's deliberate sequence, and validate the exact count, ratios, unique files, source metadata, and file existence before every production build. The existing React masonry carousel and lightbox remain unchanged.

**Tech Stack:** React Router 7, React 19, TypeScript 5.8, Node.js built-in test/assertion APIs, Sharp, Instagram and Google Maps browser sourcing.

## Global Constraints

- Use the approved **Social & Lived-In** direction.
- Target exactly 40 items: 8 venue, 14 drinks, and 18 people.
- Keep the current opening-section masonry animation, lightbox, and responsive layout unchanged.
- Do not modify menu data or menu photographs.
- Use original media files, never screenshots containing Instagram or Google Maps interface elements.
- Record source URL, displayed creator/reviewer, source type, and rights status for every selected item.
- Mark third-party Instagram and Google Maps review media as `permission-required`.
- Do not push until the user approves the local carousel and explicitly accepts the permission-required list.
- Preserve excluded legacy files in Git history; do not rewrite history.

---

## File Map

- Create `app/data/carousel-curation.json`: ordered forty-item selection and attribution manifest.
- Create `scripts/carousel-curation.ts`: manifest types, loader, validator, and category-count reporting.
- Create `tests/carousel-curation.test.ts`: exact-count, ratio, duplicate, rights, and file-path tests.
- Modify `scripts/prebuild-carousel.ts`: process only manifest-listed media and preserve manifest order.
- Modify `package.json`: add `validate:carousel` and include it in `build`.
- Create `docs/carousel-image-sources.md`: readable attribution and rights-clearance table.
- Add selected external originals under `public/carousel-content/` with source-identifying filenames.
- Generate matching optimized WebP files under `public/carousel-content-optimized/`.
- Modify `app/data/carousel-content.json`: generated output containing exactly the selected forty items.

---

### Task 1: Manifest Validation Contract

**Files:**
- Create: `scripts/carousel-curation.ts`
- Create: `scripts/validate-carousel.ts`
- Create: `tests/carousel-curation.test.ts`
- Modify: `package.json`

**Interfaces:**
- Produces: `CarouselCategory`, `CarouselRightsStatus`, `CarouselCurationItem`, `CarouselCurationManifest`
- Produces: `summarizeCarouselManifest(manifest): Record<CarouselCategory, number>`
- Produces: `validateCarouselManifest(manifest, rootDir): Promise<Record<CarouselCategory, number>>`
- Consumed by: `scripts/prebuild-carousel.ts` and `scripts/validate-carousel.ts`

- [ ] **Step 1: Write the failing validator test**

Create a temporary fixture directory containing dummy media files plus 8 venue, 14 drink, and 18 people entries, each shaped as:

```ts
{
  file: "existing-01.jpg",
  category: "venue",
  sourceType: "existing",
  sourceUrl: "legacy://existing-01.jpg",
  credit: "No Bar Đà Lạt",
  rightsStatus: "owner"
}
```

Assert that the validator returns:

```ts
assert.deepEqual(counts, { venue: 8, drink: 14, people: 18 });
```

Add separate tests asserting rejection of a duplicate `file`, missing `sourceUrl`, missing `credit`, an unsupported `rightsStatus`, and a manifest with 39 items.

- [ ] **Step 2: Run the test and verify the module is missing**

Run: `node --import tsx --test tests/carousel-curation.test.ts`

Expected: FAIL because `../scripts/carousel-curation` does not exist.

- [ ] **Step 3: Implement the validator**

Use these exact types and constants:

```ts
export type CarouselCategory = "venue" | "drink" | "people";
export type CarouselRightsStatus = "owner" | "permission-required";

export type CarouselCurationItem = {
  file: string;
  category: CarouselCategory;
  sourceType: "existing" | "instagram-owner" | "instagram-third-party" | "google-owner" | "google-review";
  sourceUrl: string;
  credit: string;
  rightsStatus: CarouselRightsStatus;
};

export type CarouselCurationManifest = {
  items: CarouselCurationItem[];
};

export const requiredCounts = { venue: 8, drink: 14, people: 18 } as const;
```

`summarizeCarouselManifest` must return category counts without enforcing completeness. `validateCarouselManifest` must assert exactly 40 items, exact category counts, unique filenames, non-empty source URL and credit, valid rights status, supported media extensions, and an existing file under `public/carousel-content/`.

- [ ] **Step 4: Add the validation command**

Create `scripts/validate-carousel.ts` to load the manifest, print the current category summary, call `validateCarouselManifest`, and print this on success:

```text
Carousel validation passed: 40 items (8 venue, 14 drink, 18 people).
```

On failure, it must print the current total and category counts before the validation error. Add to `package.json`:

```json
"validate:carousel": "tsx ./scripts/validate-carousel.ts"
```

- [ ] **Step 5: Run the focused test**

Run: `node --import tsx --test tests/carousel-curation.test.ts`

Expected: all validator tests pass.

- [ ] **Step 6: Commit the contract**

```bash
git add scripts/carousel-curation.ts scripts/validate-carousel.ts tests/carousel-curation.test.ts package.json
git commit -m "test: define carousel curation contract"
```

---

### Task 2: Audit and Select the Existing Library

**Files:**
- Read: `public/carousel-content/*`
- Create: `app/data/carousel-curation.json`

**Interfaces:**
- Consumes: the manifest schema from Task 1
- Produces: a provisional manifest containing 22 retained existing items: 6 venue, 6 drink, and 10 people

- [ ] **Step 1: Generate a visual inventory**

Create a temporary contact sheet outside tracked source directories showing every current image and a representative frame from every video, with its filename printed beneath it. Do not add the contact sheet to Git.

- [ ] **Step 2: Classify every current item**

Assign each item to `venue`, `drink`, `people`, or `exclude`. Exclude exact duplicates, near duplicates, irrelevant images, severe accidental blur, weak crops, and repeated angles.

- [ ] **Step 3: Select the retained baseline**

Choose exactly 22 existing items with this distribution:

```json
{ "venue": 6, "drink": 6, "people": 10 }
```

Prefer professional No Bar photography for the six venue items, visually distinct drink compositions for the six drink items, and candid but respectful guest/team moments for the ten people items.

- [ ] **Step 4: Write provisional manifest entries**

Use `sourceType: "existing"`, `credit: "No Bar Đà Lạt"`, `rightsStatus: "owner"`, and `sourceUrl: "legacy://<filename>"` for retained legacy media. Interleave categories so no more than three consecutive items share the same category.

- [ ] **Step 5: Run validation and record the expected incomplete state**

Run: `npm run validate:carousel`

Expected: FAIL with the provisional counts `venue: 6`, `drink: 6`, `people: 10`, proving that 18 external slots remain.

- [ ] **Step 6: Commit the audited baseline**

```bash
git add app/data/carousel-curation.json
git commit -m "content: curate existing carousel baseline"
```

---

### Task 3: Acquire Instagram Originals

**Files:**
- Add: `public/carousel-content/instagram-*.jpg`
- Modify: `app/data/carousel-curation.json`

**Interfaces:**
- Consumes: authenticated in-app Instagram session and provisional manifest
- Produces: 12 selected Instagram originals: 1 venue, 5 drink, and 6 people

- [ ] **Step 1: Review the approved Instagram candidate pool**

Inspect every slide in these exact posts:

```text
https://www.instagram.com/eipyhh/p/Db3IQOEkpMC/
https://www.instagram.com/micovery_/p/Dbvuc3ZFPVK/
https://www.instagram.com/yapviacamera/p/DaHanmKpEZF/
https://www.instagram.com/iamkim_vip/p/DYXSLRKD09W/
https://www.instagram.com/whoisthuw/p/DX69k5KEiOA/
https://www.instagram.com/hieu.ngynn_/p/DX4bywZEuHJ/
https://www.instagram.com/sugarsugarwhereru/p/DUI0Pwhj3Dz/
```

- [ ] **Step 2: Select the Instagram contribution**

Choose exactly 12 originals with this distribution:

```json
{ "venue": 1, "drink": 5, "people": 6 }
```

The selection must include at least one bartender-at-work image, at least two guests visibly holding drinks, and no screenshot UI, travel-only slide, menu-only slide, or image from another venue.

- [ ] **Step 3: Download original-resolution media**

Save files as `instagram-<account>-<shortcode>-<slide-number>.jpg`, for example:

```text
instagram-whoisthuw-DX69k5KEiOA-01.jpg
instagram-iamkim_vip-DYXSLRKD09W-05.jpg
```

Reject any downloaded file below 900 pixels on its shortest dimension.

- [ ] **Step 4: Add attribution entries**

For No Bar-owned media use `sourceType: "instagram-owner"` and `rightsStatus: "owner"`. For tagged/reposted guest media use `sourceType: "instagram-third-party"` and `rightsStatus: "permission-required"`. Set `credit` to the displayed Instagram account and `sourceUrl` to the exact post URL.

- [ ] **Step 5: Verify the provisional total**

Run the manifest reporter and confirm:

```text
venue: 7
drink: 11
people: 16
total: 34
```

- [ ] **Step 6: Commit Instagram originals and manifest entries**

```bash
git add public/carousel-content/instagram-*.jpg app/data/carousel-curation.json
git commit -m "assets: add curated Instagram carousel photos"
```

---

### Task 4: Acquire Google Maps Originals

**Files:**
- Add: `public/carousel-content/google-maps-*.jpg`
- Modify: `app/data/carousel-curation.json`

**Interfaces:**
- Consumes: the No Bar Google Maps Photos and Reviews galleries
- Produces: 6 selected Google Maps originals: 1 venue, 3 drink, and 2 people

- [ ] **Step 1: Review owner and customer galleries**

Open the No Bar listing and inspect `Food & drink`, `Vibe`, `By owner`, and review-photo galleries. Include the Tim W review with the labeled `Shiitake old fashioned` photo and the Ekaterina Solovey review photo set in the candidate audit.

- [ ] **Step 2: Select the Google Maps contribution**

Choose exactly six originals with this distribution:

```json
{ "venue": 1, "drink": 3, "people": 2 }
```

Reject duplicate Instagram imagery, Google Street View, screenshots, menu-only photos, images dominated by another venue, and files below 900 pixels on the shortest dimension.

- [ ] **Step 3: Download original media**

Save files as `google-maps-<uploader-slug>-<sequence>.jpg`, for example:

```text
google-maps-tim-w-01.jpg
google-maps-ekaterina-solovey-02.jpg
```

- [ ] **Step 4: Add attribution and rights metadata**

Use `sourceType: "google-owner"` and `rightsStatus: "owner"` for business-account uploads. Use `sourceType: "google-review"` and `rightsStatus: "permission-required"` for customer-review uploads. Set `credit` to the displayed uploader name and `sourceUrl` to the exact listing or review URL.

- [ ] **Step 5: Run full manifest validation**

Run: `npm run validate:carousel`

Expected: `Carousel validation passed: 40 items (8 venue, 14 drink, 18 people).`

- [ ] **Step 6: Commit Google Maps originals and final manifest**

```bash
git add public/carousel-content/google-maps-*.jpg app/data/carousel-curation.json
git commit -m "assets: add curated Google Maps carousel photos"
```

---

### Task 5: Manifest-Driven Build and Source Record

**Files:**
- Modify: `scripts/prebuild-carousel.ts`
- Modify: `package.json`
- Create: `docs/carousel-image-sources.md`

**Interfaces:**
- Consumes: `app/data/carousel-curation.json`
- Produces: `app/data/carousel-content.json` containing exactly the manifest's forty items
- Consumes: the `npm run validate:carousel` command created in Task 1

- [ ] **Step 1: Make prebuild consume the manifest**

Replace the unfiltered directory listing and Fisher-Yates shuffle with the ordered `manifest.items.map(({ file }) => file)`. Keep the existing Sharp resize, WebP, placeholder, metadata, video, and error-reporting behavior.

- [ ] **Step 2: Add the production build gate**

Update `build` to:

```json
"build": "tsx ./scripts/prebuild-carousel.ts && npm run validate:carousel && npm run validate:menu && react-router build"
```

- [ ] **Step 3: Generate optimized files and output metadata**

Run: `npx tsx scripts/prebuild-carousel.ts`

Expected: exactly 40 generated carousel entries in manifest order, with optimized WebPs for every image.

- [ ] **Step 4: Write the readable source record**

Create `docs/carousel-image-sources.md` with one row per manifest item: filename, category, source type, creator/reviewer, source URL, rights status, and access date `2026-08-17`. Add a prominent `Permission required before publishing` section listing every third-party item.

- [ ] **Step 5: Run focused verification**

```bash
node --import tsx --test tests/carousel-curation.test.ts
npm run validate:carousel
```

Expected: all tests pass and exact category counts are printed.

- [ ] **Step 6: Commit build integration and documentation**

```bash
git add scripts/validate-carousel.ts scripts/prebuild-carousel.ts package.json docs/carousel-image-sources.md public/carousel-content-optimized app/data/carousel-content.json
git commit -m "build: generate curated social carousel"
```

---

### Task 6: Full Verification and Local Visual Review

**Files:**
- Verify all curated, generated, test, and documentation files

**Interfaces:**
- Consumes: completed forty-item manifest and generated carousel
- Produces: evidence for local approval without pushing

- [ ] **Step 1: Verify repository scope**

Run `git status --short` and inspect the branch diff. Confirm there are no changes to `app/data/menu.json`, locale files, or `app/modules/welcome/menu/`.

- [ ] **Step 2: Run automated checks**

```bash
node --import tsx --test tests/carousel-curation.test.ts tests/menu-images.test.ts
npm run validate:carousel
npm run validate:menu
npm run lint
npm run typecheck
npm run build
```

Expected: all commands exit zero. Existing lint warnings may remain, but no new errors or warnings may originate from carousel-curation files.

- [ ] **Step 3: Inspect desktop opening section**

At a desktop viewport, verify the masonry rhythm, category balance, deliberate sequence, image loading, videos, hover/click behavior, and original-resolution lightbox images.

- [ ] **Step 4: Inspect mobile opening section**

At 390×844, verify single-column motion, crop quality, lazy loading, legible logo overlay, and no broken or stretched media.

- [ ] **Step 5: Review browser logs**

Confirm no missing-file responses, failed image decodes, hydration errors, or new console errors.

- [ ] **Step 6: Present the local preview and rights list**

Open `http://127.0.0.1:5173/en` at the first section and provide the user with the exact list of `permission-required` items. Wait for explicit approval before pushing.

- [ ] **Step 7: Commit verification-only corrections**

If visual QA requires changes, update only the manifest, external images, optimized images, source record, or carousel tooling, then commit:

```bash
git add app/data/carousel-curation.json public/carousel-content public/carousel-content-optimized docs/carousel-image-sources.md scripts/carousel-curation.ts scripts/prebuild-carousel.ts scripts/validate-carousel.ts tests/carousel-curation.test.ts package.json app/data/carousel-content.json
git commit -m "fix: refine curated opening carousel"
```

Do not create an empty commit when no correction is needed.
