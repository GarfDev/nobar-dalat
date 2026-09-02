# Nobar Private Party Print Set Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce three independent, visually verified, print-ready Nobar artifacts: a 40 x 90 cm parking sign, a 50 x 70 cm private-event sign, and an A5 two-sided party menu.

**Architecture:** A focused Python renderer owns shared brand assets, content, geometry, SVG authoring, and PDF export. One validation module reopens the PDFs to verify page counts, physical boxes, required text, and file separation; Poppler-rendered PNGs provide visual QA. Final PDFs live in `output/pdf/`, editable sources in `output/source/`, previews in `output/previews/`, and the project-bound musician illustration in `assets/print/`. The two-sided menu has one SVG source per side, so four editable SVG files produce three independent PDFs.

**Tech Stack:** Python 3, ReportLab, Pillow, pypdf, fontTools, Poppler (`pdftoppm`, `pdfinfo`), repository iCiel Novecento Sans and Beau Sans fonts.

**Spec:** `docs/superpowers/specs/2026-09-02-private-party-print-design.md`

## Global Constraints

- Produce exactly three independent print PDFs; do not impose them onto one sheet.
- Trim sizes are 400 x 900 mm, 500 x 700 mm, and A5 portrait 148 x 210 mm.
- Add 3 mm bleed on all sides and set PDF TrimBox and BleedBox explicitly.
- Use `public/images/nobar-logo-color.png` as the default official logo; use `public/images/nobar-logo-black-white.png` only when monochrome contrast is necessary.
- Preserve logo proportions and colours; never crop, stretch, rotate, outline, or overlap the logo.
- Use iCiel Novecento Sans for display copy and Beau Sans for supporting copy.
- Use the approved light off-white ground, restrained five-colour palette, decorative circles, curves, tone marks, and original trumpet-player illustration.
- Keep essential text vector-based and embed the converted font programs in PDFs.
- The menu has two pages, Highball is 200K, and both pages state that prices exclude 10% tax in Vietnamese and English.
- Use ASCII hyphens in generated PDF strings and metadata.

---

### Task 1: Lock Content, Geometry, and Brand Asset Validation

**Files:**
- Create: `scripts/print_designs/model.py`
- Create: `tests/print_designs/test_model.py`
- Create: `assets/print/nobar-musician-trumpet.png`

**Interfaces:**
- Consumes: `app/data/menu.json`, `public/images/nobar-logo-color.png`, `public/images/nobar-logo-black-white.png`, generated musician PNG.
- Produces: `ARTIFACTS: tuple[ArtifactSpec, ...]`, `MENU_SIDES: tuple[MenuSide, MenuSide]`, `PALETTE: dict[str, str]`, and validated asset paths for the renderer.

- [ ] **Step 1: Copy the approved generated musician illustration into the project**

Copy `/Users/garfdev/.codex/generated_images/01a06297-c1eb-7220-972f-bc867b446afa/exec-6c30d784-76aa-48a8-b735-1014f5f2e7be.png` to `assets/print/nobar-musician-trumpet.png`. Confirm it remains RGBA and has non-opaque alpha pixels.

- [ ] **Step 2: Write the failing model tests**

```python
import unittest
from scripts.print_designs.model import ARTIFACTS, MENU_SIDES, validate_assets


class PrintModelTest(unittest.TestCase):
    def test_three_independent_artifacts(self):
        self.assertEqual([a.slug for a in ARTIFACTS], [
            "parking-sign-40x90cm",
            "private-event-sign-50x70cm",
            "private-party-menu-a5",
        ])

    def test_menu_content_and_tax_note(self):
        rows = [row for side in MENU_SIDES for row in side.items]
        self.assertEqual(len(rows), 11)
        self.assertEqual(next(r.price for r in rows if r.name == "Highball"), "200K")
        self.assertTrue(all(side.tax_vi == "Giá chưa bao gồm 10% thuế." for side in MENU_SIDES))
        self.assertTrue(all(side.tax_en == "Prices are subject to 10% tax." for side in MENU_SIDES))

    def test_required_assets_are_valid(self):
        validate_assets()
```

- [ ] **Step 3: Run the tests to verify they fail**

Run: `python3 -m unittest tests.print_designs.test_model -v`

Expected: FAIL because `scripts.print_designs.model` does not exist.

- [ ] **Step 4: Implement the immutable content model**

Create dataclasses for `ArtifactSpec`, `MenuItem`, and `MenuSide`. Encode the three trim sizes, 3 mm bleed, the exact bilingual sign copy, the eleven approved menu rows, the two tax lines, and this palette:

```python
PALETTE = {
    "paper": "#FFFDF6",
    "ink": "#171717",
    "orange": "#F4A82F",
    "violet": "#8D68CD",
    "pink": "#EF73C5",
    "blue": "#45B5CF",
    "green": "#83D62D",
}
```

`validate_assets()` must confirm both logo files exist, the musician file is RGBA, its alpha extrema start below 255, and both font families contain a usable WOFF/WOFF2 source.

- [ ] **Step 5: Run the model tests**

Run: `python3 -m unittest tests.print_designs.test_model -v`

Expected: all tests PASS.

- [ ] **Step 6: Commit the model and asset**

```bash
git add assets/print/nobar-musician-trumpet.png scripts/print_designs/model.py tests/print_designs/test_model.py
git commit -m "feat: define Nobar private party print content"
```

### Task 2: Build Shared Typography and Drawing Primitives

**Files:**
- Create: `scripts/print_designs/render.py`
- Create: `tests/print_designs/test_render_helpers.py`
- Create: `output/source/.gitkeep`
- Create: `output/pdf/.gitkeep`
- Create: `output/previews/.gitkeep`

**Interfaces:**
- Consumes: `ARTIFACTS`, `MENU_SIDES`, `PALETTE`, logo paths, musician path from `model.py`.
- Produces: `prepare_fonts() -> FontSet`, `fit_text(...) -> float`, `draw_logo(...)`, `draw_musician(...)`, `draw_ornaments(...)`, `set_page_boxes(...)`, and SVG/PDF output helpers.

- [ ] **Step 1: Write failing helper tests**

```python
import unittest
from scripts.print_designs.render import mm, media_size_mm, trim_box_mm


class RenderHelperTest(unittest.TestCase):
    def test_bleed_geometry(self):
        self.assertEqual(media_size_mm(400, 900, 3), (406, 906))
        self.assertEqual(trim_box_mm(400, 900, 3), (3, 3, 403, 903))

    def test_mm_conversion(self):
        self.assertAlmostEqual(mm(25.4), 72.0, places=5)
```

- [ ] **Step 2: Run the helper tests to verify they fail**

Run: `python3 -m unittest tests.print_designs.test_render_helpers -v`

Expected: FAIL because `render.py` does not exist.

- [ ] **Step 3: Implement font preparation and shared primitives**

Use fontTools to open the selected repository WOFF/WOFF2 files, set `font.flavor = None`, and save temporary TTFs under `tmp/pdfs/fonts/`. Register the TTFs in ReportLab as `NovecentoDisplay`, `NovecentoDisplayBold`, `BeauSans`, and `BeauSansBold`. Implement millimetre conversion, image alpha preservation, proportional logo placement, line/circle/tone-mark ornaments, automatic text fitting, and pypdf page boxes.

For the editable SVGs, emit physical `width` and `height` in millimetres, a matching `viewBox`, linked font-family names, embedded PNG data URIs for the official logo and musician, and named layer groups: `background`, `ornaments`, `illustration`, `logo`, `copy`, and `cut-guides`.

- [ ] **Step 4: Run the helper tests**

Run: `python3 -m unittest tests.print_designs.test_render_helpers -v`

Expected: all tests PASS.

- [ ] **Step 5: Commit shared rendering infrastructure**

```bash
git add scripts/print_designs/render.py tests/print_designs/test_render_helpers.py output/source/.gitkeep output/pdf/.gitkeep output/previews/.gitkeep
git commit -m "feat: add print rendering primitives"
```

### Task 3: Render Three Separate Designs

**Files:**
- Modify: `scripts/print_designs/render.py`
- Create: `scripts/generate-print-designs.py`
- Test: `tests/print_designs/test_render_helpers.py`

**Interfaces:**
- Consumes: shared drawing primitives and content model.
- Produces: three independent PDFs, four editable SVG source files, and four preview PNGs because the menu has two pages.

- [ ] **Step 1: Add failing output-manifest tests**

```python
from pathlib import Path
import unittest
from scripts.print_designs.render import output_manifest


class OutputManifestTest(unittest.TestCase):
    def test_pdf_manifest_is_exactly_three_files(self):
        manifest = output_manifest(Path("output"))
        self.assertEqual([p.name for p in manifest.pdfs], [
            "nobar-parking-sign-40x90cm.pdf",
            "nobar-private-event-sign-50x70cm.pdf",
            "nobar-private-party-menu-a5.pdf",
        ])
```

- [ ] **Step 2: Run the manifest test to verify it fails**

Run: `python3 -m unittest tests.print_designs.test_render_helpers.OutputManifestTest -v`

Expected: FAIL because `output_manifest` is missing.

- [ ] **Step 3: Implement the three compositions**

Implement `render_parking_sign()`, `render_private_event_sign()`, and `render_menu()` with these priorities:

- Parking: headline and arrow dominate; English line follows; musician is a small decorative crop; logo and address remain in the footer.
- Private event: headline remains readable first; full musician provides the focal illustration; event name/date and farewell copy are secondary.
- Menu: page 1 holds five Nobar drinks; page 2 holds six classics; name, tasting note, and right-aligned price form one consistent row; the official logo and small musician crop anchor the pages; both tax lines appear on both pages.

Each renderer must draw the background through the full BleedBox and keep essential copy inside a 10 mm safe area measured from TrimBox. `scripts/generate-print-designs.py` calls all renderers and exits non-zero if the manifest is incomplete.

- [ ] **Step 4: Generate the artifacts**

Immediately before the first authoring command, run the PDF artifact-operation marker exactly once:

```bash
node container_tools/mark_artifact_operation_started.mjs --operation-kind create --expected-output-count 3 --output-format pdf
```

Then run:

```bash
python3 scripts/generate-print-designs.py
```

Expected: three PDFs under `output/pdf/`, three SVGs under `output/source/`, and no traceback.

- [ ] **Step 5: Run unit tests**

Run: `python3 -m unittest discover -s tests/print_designs -v`

Expected: all tests PASS.

- [ ] **Step 6: Commit the renderer and generated sources**

```bash
git add scripts/generate-print-designs.py scripts/print_designs/render.py tests/print_designs/test_render_helpers.py output/source
git commit -m "feat: render Nobar private party print set"
```

### Task 4: Validate PDF Structure, Copy, and Physical Sizes

**Files:**
- Create: `scripts/print_designs/validation.py`
- Create: `scripts/validate-print-designs.py`
- Create: `tests/print_designs/test_pdf_outputs.py`
- Modify: PDFs or renderer only when validation identifies a defect.

**Interfaces:**
- Consumes: three generated PDFs.
- Produces: deterministic pass/fail validation for file count, page count, physical boxes, required copy, and font embedding.

- [ ] **Step 1: Write failing PDF validation tests**

```python
import unittest
from pathlib import Path
from scripts.print_designs.validation import validate_output_set


class PdfOutputTest(unittest.TestCase):
    def test_print_output_set(self):
        report = validate_output_set(Path("output/pdf"))
        self.assertEqual(report.pdf_count, 3)
        self.assertEqual(report.page_counts["nobar-private-party-menu-a5.pdf"], 2)
        self.assertEqual(report.errors, ())
```

- [ ] **Step 2: Run the validation test to verify it fails**

Run: `python3 -m unittest tests.print_designs.test_pdf_outputs -v`

Expected: FAIL because the validation module does not exist.

- [ ] **Step 3: Implement structural validation**

Create `scripts/print_designs/validation.py` and a CLI wrapper. Reopen each PDF with pypdf and assert:

- exactly three filenames match the manifest;
- parking and private-event PDFs have one page; menu has two;
- MediaBox includes 3 mm bleed and TrimBox matches the approved finished size within 0.25 mm;
- extracted text contains all required bilingual sign text, all eleven menu names, `Highball`, `200K`, and both tax notices on both menu pages;
- every page has at least one embedded font resource and no interactive form fields.

- [ ] **Step 4: Run full structural validation**

Run: `python3 scripts/validate-print-designs.py`

Expected: summary reports 3 PDFs, 4 total pages, correct boxes, required copy present, and zero errors.

- [ ] **Step 5: Commit the validator**

```bash
git add scripts/print_designs/validation.py scripts/validate-print-designs.py tests/print_designs/test_pdf_outputs.py
git commit -m "test: validate Nobar print outputs"
```

### Task 5: Render and Inspect Every Final Page

**Files:**
- Create: `output/previews/nobar-parking-sign-40x90cm.png`
- Create: `output/previews/nobar-private-event-sign-50x70cm.png`
- Create: `output/previews/nobar-private-party-menu-a5-1.png`
- Create: `output/previews/nobar-private-party-menu-a5-2.png`
- Modify: renderer or source files if visual QA reveals defects.

**Interfaces:**
- Consumes: final PDFs from Task 3.
- Produces: four reviewed PNG previews and the final verified PDF set.

- [ ] **Step 1: Render all pages with Poppler**

```bash
pdftoppm -png -r 120 -singlefile output/pdf/nobar-parking-sign-40x90cm.pdf output/previews/nobar-parking-sign-40x90cm
pdftoppm -png -r 120 -singlefile output/pdf/nobar-private-event-sign-50x70cm.pdf output/previews/nobar-private-event-sign-50x70cm
pdftoppm -png -r 180 output/pdf/nobar-private-party-menu-a5.pdf output/previews/nobar-private-party-menu-a5
```

Expected: two sign previews and two numbered menu previews.

- [ ] **Step 2: Inspect all four preview images**

Use the image viewer at original detail. Check that no text is clipped or overlaps, every Vietnamese accent renders, logo proportions are unchanged, the arrow dominates the parking sign, the private notice remains clearer than the illustration, both menu pages scan consistently, the 10% note is legible, and no unintended dark rectangle surrounds the musician PNG.

- [ ] **Step 3: Correct and regenerate any visual defects**

Make one targeted renderer change per defect, rerun generation, rerun structural validation, rerender every affected page, and inspect the updated preview again. Repeat until there are zero visual defects.

- [ ] **Step 4: Run final verification**

```bash
python3 -m unittest discover -s tests/print_designs -v
python3 scripts/validate-print-designs.py
pdfinfo output/pdf/nobar-parking-sign-40x90cm.pdf
pdfinfo output/pdf/nobar-private-event-sign-50x70cm.pdf
pdfinfo output/pdf/nobar-private-party-menu-a5.pdf
```

Expected: tests pass, validation reports zero errors, and PDF metadata shows one parking page, one private-event page, and two menu pages.

- [ ] **Step 5: Commit final generated deliverables**

```bash
git add output/pdf output/previews output/source scripts tests/print_designs
git commit -m "feat: deliver verified Nobar party print artwork"
```
