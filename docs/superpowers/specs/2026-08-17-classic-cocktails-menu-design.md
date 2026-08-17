# Classic Cocktails Menu Design

**Date:** 2026-08-17
**Status:** Approved in conversation; awaiting written-spec review
**Baseline:** Clean committed UI with no pre-conversation working-tree changes

## Goal

Complete the two existing No Bar collections and add a third collection of popular classic cocktails. Every drink must have an identifiable, high-quality photograph stored locally.

## Menu Structure

The menu will contain three categories.

### E LỜ

Keep the three Instagram-verified drinks and their current photographs:

1. Lan Man
2. Loạng Choạng
3. Lộn Xộn

### SẮC HUYỀN KHÔNG HỎI NGÃ NẶNG

Keep the four currently published drinks and restore the two missing drinks from the complete source asset set:

1. Sắc — `image_1.webp`
2. Huyền — `image_4.webp`
3. Không — `image_6.webp`
4. Hỏi — `image_2.webp`
5. Ngã — `image_5.webp`
6. Nặng — `image_3.webp`

The existing localized copy for Sắc and Hỏi is already present in both locale files and will be used without rewriting it.

### OLD FASHIONED

Add a category named `OLD FASHIONED` containing the six highest-ranked classic cocktails selected from the 2026 Drinks International list:

1. Old Fashioned
2. Negroni
3. Margarita
4. Dry Martini
5. Espresso Martini
6. Daiquiri

The category name is an editorial title for the classics collection; it does not imply that every drink is an Old Fashioned variation.

## Classic Cocktail Copy

Use concise, recognizable recipes based on official IBA specifications where available.

| Drink | English ingredients | Vietnamese ingredients | Taste profile |
|---|---|---|---|
| Old Fashioned | Bourbon or rye whiskey; sugar; aromatic bitters; water | Bourbon hoặc rye whiskey; đường; bitter thảo mộc; nước | Spirit-forward, bittersweet, citrus |
| Negroni | Gin; Campari; sweet vermouth | Gin; Campari; vermouth ngọt | Bitter, herbal, citrus |
| Margarita | Tequila; orange liqueur; fresh lime | Tequila; rượu mùi cam; chanh xanh tươi | Bright, tart, saline |
| Dry Martini | Gin; dry vermouth; lemon peel or olive | Gin; vermouth khô; vỏ chanh hoặc ô-liu | Dry, crisp, botanical |
| Espresso Martini | Vodka; coffee liqueur; espresso; sugar syrup | Vodka; rượu mùi cà phê; espresso; syrup đường | Rich, roasted, bittersweet |
| Daiquiri | White rum; fresh lime; sugar syrup | Rum trắng; chanh xanh tươi; syrup đường | Bright, tart, clean |

The final locale strings will use the existing uppercase menu style.

## Translation Style

Use concise ingredient labels rather than literal process descriptions. Keep familiar bar and product terms such as rum, gin, whiskey, bitter, milk punch, vermouth, Campari, matcha, kombucha, and absinthe. Translate ordinary flavor ingredients naturally and remove repetition across adjacent lines.

Examples:

- Use `MATCHA`, not `BỌT MATCHA`.
- Use `KEM — FRANGELICO`, not `KEM — MATCHA — FRANGELICO` immediately after a separate matcha line.
- Use `CỒN ỚT`, not the mixed-language `TINCTURE ỚT`.
- Use `HẠT DỔI`, not the botanical Latin `MICHELIA TONKINENSIS`, in Vietnamese.
- Use `SHERRY CREAM`, not the misleading literal translation `KEM SHERRY`.
- Keep Vietnamese lines compact enough to fit the existing mobile menu layout.

## Image Sourcing

Use searched photography rather than generated imagery.

- Source only free-to-use photographs from Unsplash or Pexels.
- Record the source page, photographer, and license for every selected image in a project source document.
- Do not use premium-only results, watermarked files, generic Google thumbnails, or images without a clear reuse license.
- Select photographs that unmistakably depict the named cocktail and its expected glassware or garnish.
- Prefer people-free, glass-centered compositions with dark backgrounds and restrained amber, red, blue, or purple bar lighting.
- Crop all six photographs to a consistent portrait-friendly composition and optimize them to WebP.
- Store source files under `public/images/menu/classics/` and optimized files under `public/images/menu-optimized/classics/`.

The set should feel editorially related to the existing No Bar photographs without pretending to be photographed inside No Bar.

## Data and UI Behavior

- Add the `old-fashioned` category to `app/data/menu.json` after the two house collections.
- Add Sắc and Hỏi to the six-tone category using their existing IDs and optimized assets.
- Add six stable classic drink IDs and bilingual menu copy.
- Reuse the current carousel, category navigation, shapes, and transitions.
- Assign dark background and accent colors sampled from each selected image so text remains readable.
- Do not redesign typography, layout, animation, or navigation.

## Error Handling

- The build must fail clearly if an added source image cannot be optimized.
- Every menu image path must resolve to an existing optimized file before completion.
- If a searched photograph cannot be verified for license or drink identity, reject it and choose another source.

## Verification

1. Confirm the clean baseline has no unrelated UI changes.
2. Confirm all fifteen drinks are present: nine house drinks and six classics.
3. Confirm category and drink ordering.
4. Confirm every source and optimized image exists.
5. Confirm every external photograph has documented source and license information.
6. Run lint, type-check, and the production build.
7. Visually inspect all three categories at desktop and mobile widths.
8. Confirm the carousel wraps correctly for three, six, and six items.
9. Confirm English and Vietnamese copy renders without missing translation keys.

## Out of Scope

- Prices or ordering controls.
- New cocktail recipes unique to No Bar.
- Generated images.
- Premium stock purchases.
- Replacing existing No Bar photographs.
- A broader page redesign.

## References

- Drinks International, *The bestselling classic cocktails at the world's best bars 2026*: https://drinksint.com/the-bestselling-classic-cocktails-at-the-worlds-best-bars-2026/
- International Bartenders Association official cocktail list: https://iba-world.com/cocktails/
