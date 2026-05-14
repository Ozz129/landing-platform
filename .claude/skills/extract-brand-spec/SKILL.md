---
name: extract-brand-spec
description: Analyze a public website and generate a high-fidelity extraction package with content, styles, images, screenshots, computed CSS, and visual references for landing-ui-builder.
argument-hint: "[url] [project-name]"
disable-model-invocation: true
allowed-tools: Bash, Read, Write, Edit, MultiEdit, Glob, Grep, WebFetch, WebSearch, Agent
---

# extract-brand-spec

Analyze the provided website and generate a high-fidelity extraction package that helps `landing-ui-builder` recreate a landing page as visually close as practical to the original reference.

This skill is portable and must run inside the Docker workspace.

## Portable paths

- Workspace root: `/workspace`
- Skills root: `/workspace/.claude/skills`
- Capture script: `/workspace/.claude/skills/extract-brand-spec/capture.js`
- Node modules: `/workspace/node_modules`
- Projects root: `/workspace/projects`

Do not use `/Users/...`, `~/.claude/...`, or any relative path outside `/workspace`.

## Arguments

1. **First argument**: URL to analyze (required)
2. **Second argument**: project name (optional) → output goes to `/workspace/projects/<project-name>/docs/`

If no project name is provided, ask the user which project to write to. If none exists yet, default to writing to `docs/` relative to the current working directory.

## Important output rule

All generated files must be written to the project's `docs/` folder:

`/workspace/projects/<project-name>/docs/`

Never write generated files to:
- `/workspace/.claude/skills/extract-brand-spec/`
- `/workspace/.claude/skills/`
- `~/.claude/`

## Primary goal

Produce a package that helps `landing-ui-builder` recreate a landing page that feels as close as practical to the source website in:

- hero composition and section rhythm
- color palette and section backgrounds
- typography scale and font choices
- button styling, card design, badges, shadows, borders
- logo/trust strips and imagery
- layout density, CTA emphasis, and overall tone

## Scope

Always analyze:
1. The homepage
2. Up to 2 additional highly relevant internal pages if they improve visual fidelity

Prefer pages with: hero patterns, product/offer cards, trust sections, pricing, visual CTA patterns, section backgrounds, image usage.

Do not crawl the full site. Skip legal pages, blog archives, and support pages.

---

## Execution steps

Follow these steps **in order**. Do not skip steps.

---

### Step 0 — Resolve project root and create output directories

Determine `PROJECT_ROOT` from context:
- If a project name was given: `PROJECT_ROOT=/workspace/projects/<project-name>`
- If called from `create-landing` with an override: use the project root it specifies
- If called standalone with no project name: ask the user, then proceed

Create all output directories:

```bash
PROJECT_ROOT="/workspace/projects/<project-name>"

mkdir -p "$PROJECT_ROOT/docs"
mkdir -p "$PROJECT_ROOT/docs/assets"
mkdir -p "$PROJECT_ROOT/docs/assets/images"
mkdir -p "$PROJECT_ROOT/docs/assets/backgrounds"
mkdir -p "$PROJECT_ROOT/docs/assets/logos"
mkdir -p "$PROJECT_ROOT/docs/assets/references"
mkdir -p "$PROJECT_ROOT/docs/screenshots"
```

---

### Step 1 — Verify Playwright is available

```bash
node -e "require('playwright'); console.log('OK')" 2>/dev/null || echo "PLAYWRIGHT_MISSING"
```

If the output is `PLAYWRIGHT_MISSING`, stop and report: "Playwright not found in /workspace/node_modules. Ensure the Docker image was built with `npm install` at /workspace."

If OK, proceed.

---

### Step 2 — Run Playwright capture for the homepage

Run `capture.js` from `PROJECT_ROOT` so relative paths (`docs/screenshots/`, `docs/assets/`) resolve correctly:

```bash
cd "$PROJECT_ROOT" && node /workspace/.claude/skills/extract-brand-spec/capture.js "$URL" homepage
```

**Correct command (Docker-portable):**
```bash
URL="<url>"
PROJECT_ROOT="/workspace/projects/<project-name>"

cd "$PROJECT_ROOT" && node /workspace/.claude/skills/extract-brand-spec/capture.js "$URL" homepage
```

Expected files after this step:
- `$PROJECT_ROOT/docs/screenshots/homepage-full.png`
- `$PROJECT_ROOT/docs/screenshots/homepage-hero.png`
- `$PROJECT_ROOT/docs/screenshots/homepage-mobile.png`
- `$PROJECT_ROOT/docs/screenshots/homepage-section1.png` (may be skipped if no H2 found)
- `$PROJECT_ROOT/docs/computed-styles.json`
- `$PROJECT_ROOT/docs/assets/logos/` (any detected logos)
- `$PROJECT_ROOT/docs/assets/images/` (any detected images)
- `$PROJECT_ROOT/docs/assets/backgrounds/` (any CSS background images)

If `capture.js` exits with an error, report it and stop. At minimum, `homepage-full.png` and `computed-styles.json` must exist to proceed.

---

### Step 3 — Optionally capture up to 2 additional pages

Fetch the homepage content:

```
WebFetch: <URL>
```

Look at the nav links. Identify up to 2 pages that improve understanding of: product/service offering, pricing, trust/social proof, feature cards, or visual CTA patterns.

For each additional page (use its slug as prefix, e.g. `features`, `pricing`):

```bash
cd "$PROJECT_ROOT" && node /workspace/.claude/skills/extract-brand-spec/capture.js "<additional-url>" "<slug>"
```

Only capture additional pages if they add meaningful visual or content data. Skip if the homepage already gives sufficient detail.

---

### Step 4 — Read all captured data and produce a section color map

Read these files:

1. `$PROJECT_ROOT/docs/computed-styles.json`
2. List all files in `$PROJECT_ROOT/docs/assets/logos/` — note which logos were downloaded
3. List all files in `$PROJECT_ROOT/docs/assets/images/` — note which images were downloaded
4. List all files in `$PROJECT_ROOT/docs/assets/backgrounds/`

Visually inspect all screenshots:
1. `docs/screenshots/homepage-full.png` — full-page composition
2. `docs/screenshots/homepage-hero.png` — hero structure
3. `docs/screenshots/homepage-section1.png` — first content section
4. `docs/screenshots/homepage-mobile.png` — mobile layout

**From screenshots, produce a section color map before any code is written:**

```
nav:        near-black / white / brand-color  (#HEX)
hero:       near-black + texture? / white     (#HEX)
section-A:  white / light-gray / near-black   (#HEX)
section-B:  brand-primary (BRIGHT accent)     (#HEX)
...
footer:     near-black / white                (#HEX)
```

Record the exact section sequence. This map is the ground truth for all CSS background values.

**RGB → hex conversion rule:**
All values in `computed-styles.json` use `rgb(r, g, b)` format. Convert each to `#RRGGBB` before writing any output file. Example: `rgb(11, 142, 204)` → `#0B8ECC`.

---

### Step 5 — Generate `docs/design-tokens.json`

Read `computed-styles.json` and convert its data to the structured token format expected by `landing-ui-builder`.

Label values `"confirmed"` if extracted directly from computed DOM data, or `"inferred"` if derived from screenshots or approximation.

Write `$PROJECT_ROOT/docs/design-tokens.json`:

```json
{
  "source": "<URL>",
  "capturedAt": "<ISO date>",
  "colors": {
    "primary": "<hex — from computed.buttons[0].backgroundColor (CTA button)>",
    "navBackground": "<hex — from computed.navBackgroundHex>",
    "heroBackground": "<hex — from computed.heroBgConfirmed>",
    "sectionLight": "<hex — lightest section from allSectionBands>",
    "sectionBlue": "<hex — bright accent section background, or null>",
    "sectionNavy": "<hex — dark-alt navy section, or null>",
    "footerBackground": "<hex — from computed.footer.backgroundColor>",
    "textPrimary": "<hex — from computed.body.color>",
    "textSubtleOnDark": "<hex — if a confirmed muted text color on dark bg exists; else null>",
    "accent": "<hex — secondary highlight color if present; else null>"
  },
  "typography": {
    "fontHeading": "<family — from computed.fonts.googleFonts or computed.h1.fontFamily>",
    "fontBody": "<family — from computed.body.fontFamily>",
    "googleFontUrl": "<full @import URL if detected; else null>",
    "h1": {
      "confirmedPx": "<float — strip 'px' from computed.h1.fontSize>",
      "fontWeight": "<from computed.h1.fontWeight>",
      "lineHeight": "<from computed.h1.lineHeight>",
      "source": "confirmed"
    },
    "h2": {
      "confirmedPx": "<float — from sectionBackgrounds heading fontSize if available; else infer from h1>",
      "fontWeight": "600",
      "lineHeight": "1.2",
      "source": "inferred"
    },
    "body": {
      "confirmedPx": "<float — from computed.body.fontSize>",
      "lineHeight": "<from computed.body.lineHeight>",
      "source": "confirmed"
    }
  },
  "spacing": {
    "navHeightPx": "<int — from computed.navHeightPx>",
    "sectionYDesktop": "<paddingTop of a major section from sectionBackgrounds, e.g. '80px'>",
    "containerMaxWidth": "<maxWidth from computed.body or a main container, e.g. '1280px'>"
  },
  "radius": {
    "button": "<borderRadius from computed.buttons[0].borderRadius>",
    "card": "<inferred from visual — e.g. '8px'>",
    "badge": "<inferred — e.g. '24px' for pill badges>"
  },
  "navVsHeroMismatch": "<boolean from computed.navVsHeroMismatch>",
  "sectionColorMap": [
    {
      "name": "nav",
      "background": "<hex>",
      "textColor": "<hex>",
      "hasTexture": false
    },
    {
      "name": "hero",
      "background": "<hex — from computed.heroBgConfirmed>",
      "textColor": "<hex>",
      "hasTexture": "<boolean — true if computed.heroBgImage !== 'none'>"
    }
  ]
}
```

Add one entry to `sectionColorMap` for every section identified in the section color map from Step 4.

Do not write placeholder values — use `null` for anything that cannot be determined, and note it.

---

### Step 6 — Generate `docs/globals-template.css`

Write a CSS variables file pre-populated with confirmed token values from Step 5. `landing-ui-builder` copies this directly to `src/styles/globals.css`.

Write `$PROJECT_ROOT/docs/globals-template.css`:

```css
/* ── globals-template.css ───────────────────────────────────────── */
/* Generated by extract-brand-spec. Do not approximate confirmed values. */
/* landing-ui-builder uses this as src/styles/globals.css directly.    */

/* Only include @import if a Google Fonts URL was detected */
/* @import url('<googleFontUrl>'); */

:root {
  /* ── Colors ─────────────────────────────────────────────────── */
  --color-nav-bg:         <navBackground>;
  --color-hero-bg:        <heroBackground>;
  --color-primary:        <primary>;
  --color-section-light:  <sectionLight>;
  --color-footer-bg:      <footerBackground>;
  --color-text:           <textPrimary>;
  --color-white:          #FFFFFF;
  --color-dark:           <darkest confirmed background — heroBackground or navBackground>;

  /* Uncomment if navVsHeroMismatch is true (nav and hero have different backgrounds) */
  /* --color-nav-bg and --color-hero-bg are already separate above */

  /* Uncomment if textSubtleOnDark was confirmed */
  /* --color-subtle-dark: <textSubtleOnDark>; */

  /* Uncomment if accent color exists */
  /* --color-accent: <accent>; */

  /* Uncomment if a bright accent section exists */
  /* --color-section-blue: <sectionBlue>; */

  /* ── Typography ─────────────────────────────────────────────── */
  --font-heading:  '<fontHeading>', sans-serif;
  --font-body:     '<fontBody>', sans-serif;
  --font-hero:     <h1.confirmedPx>px;
  --font-h2:       <h2.confirmedPx>px;
  --font-body-sz:  <body.confirmedPx>px;

  /* ── Spacing ────────────────────────────────────────────────── */
  --nav-height:    <navHeightPx>px;
  --section-py:    <sectionYDesktop>;
  --container-max: <containerMaxWidth>;

  /* ── Radius ─────────────────────────────────────────────────── */
  --radius-btn:    <radius.button>;
  --radius-card:   <radius.card>;
  --radius-badge:  <radius.badge>;
}

/* ── Base resets ─────────────────────────────────────────────────── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: var(--font-body);
  font-size: var(--font-body-sz);
  color: var(--color-text);
  background-color: var(--color-dark);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}
```

Rules:
- Replace every `<...>` placeholder with the actual hex value from Step 5. No placeholders allowed in the final file.
- Only uncomment the `@import` line if a Google Fonts URL was confirmed in `computed.fonts.googleFonts`.
- Use hex values (`#RRGGBB`), not `rgb()` values.
- If `navVsHeroMismatch: true`, ensure both `--color-nav-bg` and `--color-hero-bg` are separate variables with their confirmed values.

---

### Step 7 — Generate `docs/brand-context.md`

Use the WebFetch result from Step 3 (re-fetch if needed) to analyze brand messaging:

Write `$PROJECT_ROOT/docs/brand-context.md`:

```markdown
# Brand Context

## Brand
- **Name**: [company/product name]
- **Domain**: [domain]
- **Tagline**: [main tagline if visible]

## Value Proposition
[1–3 sentences: what the product/service does and who it is for]

## Target Audience
[Who the site addresses: developers, enterprises, consumers, SMBs, etc.]

## Tone and Voice
[Formal / casual / technical / bold / minimal — with examples from the copy]

## Key Differentiators
- [differentiator 1]
- [differentiator 2]
- ...

## Social Proof Signals
[Client logos, testimonials, stats, partner mentions, certifications, awards]

## Section Structure (observed order)
1. [Section name] — [brief description]
2. ...

## CTA Language
- **Primary CTA**: "[exact wording]" — style: [filled / ghost / text-link]
- **Secondary CTA**: "[exact wording if present]"
- **Conversion goal**: [signup / contact / purchase / download / demo]

## Content Notes
[Additional observations: awards, pricing hints, testimonial style, feature emphasis]
```

---

### Step 8 — Generate `docs/site-map.md`

Write `$PROJECT_ROOT/docs/site-map.md`:

```markdown
# Site Map

## Navigation Links
- [Nav item 1]
- [Nav item 2]
- [CTA link if present in nav]

## Homepage Sections (in order)
1. **[Section name]** — [brief description: what content, background type]
2. ...

## Additional Pages Analyzed
- **[Page name]** (`[url]`): [why it was analyzed and what it adds]

## Footer
- **Columns**: [describe column structure]
- **Key links**: [most important footer links]
- **Social**: [platforms linked]
- **Legal**: [copyright text]
```

---

### Step 9 — Generate `docs/visual-reference-spec.md`

Document the visual design system based on screenshots, `computed-styles.json`, and page content:

Write `$PROJECT_ROOT/docs/visual-reference-spec.md`:

```markdown
# Visual Reference Spec

## Section Background Rhythm (top to bottom)
| Section | Background | Hex | Notes |
|---|---|---|---|
| nav | [near-black / white / brand] | #HEX | [sticky / transparent scroll] |
| hero | [near-black / white] | #HEX | [texture: yes/no] |
| [section] | [white / light-gray / brand-primary] | #HEX | |
| footer | [near-black / white] | #HEX | |

## Hero
- **Layout**: [centered / left-text + right-image / full-width overlay / split]
- **Background**: [solid color / texture type — dot-grid, line-grid, circuit-board]
- **Headline style**: [size feel, weight, any highlighted word or phrase]
- **CTA buttons**: [count: 1 or 2, primary style, secondary style]
- **Supporting visual**: [image / illustration / mockup / none]

## Typography
- **Heading font**: [name, source: Google Fonts / system]
- **Body font**: [name, source]
- **Heading scale feel**: [display/editorial / geometric / humanist]

## Color System
- **Primary**: [hex] — CTAs, highlights, icons
- **Dark background**: [hex] — nav, hero, footer
- **Light background**: [hex] — content sections
- **Accent**: [hex or 'not identified']

## Card Design
- **Style**: [flat / elevated / bordered / glass]
- **Radius**: [value or 'inferred: 8px']
- **Shadows**: [none / subtle / prominent]
- **Icon treatment**: [colored icon / white icon / SVG / numbered]

## CTA Buttons
- **Primary**: [fill color, text color, radius, size feel]
- **Secondary**: [ghost / outlined / text-link]
- **Shape**: [pill / rounded / square]

## Trust / Logo Strip
- **Background**: [dark / light]
- **Logo style**: [grayscale / white reversed / full color]
- **Count**: [approximate]

## Image Treatment
- **Hero image**: [present/absent — photo / illustration / mockup / screenshot]
- **Card images**: [present/absent — aspect ratio feel]
- **Background images**: [present/absent — full-section vs. small accent]

## Footer
- **Background**: [hex]
- **Density**: [minimal / standard / rich multi-column]
```

---

### Step 10 — Generate `docs/screenshot-manifest.md`

Document each captured screenshot based on visual inspection:

Write `$PROJECT_ROOT/docs/screenshot-manifest.md`:

```markdown
# Screenshot Manifest

## homepage-full.png
Full-page desktop screenshot at 1440px width.
Sections visible: [list all sections from nav to footer]
Use for: section order, background rhythm, overall layout density.

## homepage-hero.png
Hero viewport at 1440×900px.
Shows: [nav + hero section — describe headline, CTA, background, visual element]
Use for: hero layout, CTA placement, headline structure, background texture.

## homepage-section1.png
First H2 section below the hero.
Shows: [describe — trust bar / features / about / etc.]
Use for: card layout, logo treatment, grid composition.

## homepage-mobile.png
Full-page mobile at 375px width.
Shows: [full page responsive layout]
Use for: mobile section stacking, mobile nav, text scaling, image cropping.
```

Add additional entries for any extra page screenshots captured in Step 3.

---

### Step 11 — Generate `docs/builder-brief.md`

This is the most important output file. `landing-ui-builder` reads this first and uses it as the complete brief, superseding all other files.

Be thorough. This file must be complete enough that the builder does not need to read anything else.

Write `$PROJECT_ROOT/docs/builder-brief.md`:

```markdown
# Builder Brief

## Source
- **URL**: <url>
- **Brand**: <name>
- **Extraction date**: <date>

## Brand Summary
<2–3 sentences: what this company does, who it's for, what conversion the landing aims for>

## Audience and Tone
<1–2 sentences: target persona and brand voice>

---

## Section Plan

Implement these sections in this exact order with these exact background colors:

| # | Section | Background | CSS Variable | Notes |
|---|---|---|---|---|
| 1 | Navbar | `#HEX` | `--color-nav-bg` | sticky |
| 2 | Hero | `#HEX` | `--color-hero-bg` | texture: yes/no |
| 3 | [Section name] | `#HEX` | `--color-...` | |
... (all sections identified from screenshots)
| N | Footer | `#HEX` | `--color-footer-bg` | |

**Background color rules (DO NOT change these):**
- Values are confirmed from screenshots + computed-styles.json.
- [List any section using brand primary as full background: "The [section-name] section uses `#HEX` (primary color) as its full background. Use a dark-fill CTA button on it, not the primary-color button."]
- Nav vs hero: [same color → can share `--color-dark` / different → must use separate CSS variables]

---

## Hero Specification
- **Layout**: [centered / left-text + right-visual / full-width overlay / split]
- **Headline**: "<exact text or description of tone>"
- **Subheadline**: "<exact text or description>"
- **Primary CTA**: "<button text>"
- **Secondary CTA**: "<button text or 'none'>"
- **Background texture**: [none / dot-grid / line-grid / circuit-board / radial-glow-only]
- **Supporting visual**: [none / right-side image — describe / hero illustration]

---

## Design System
- **Primary color**: `#HEX` — buttons, highlights, brand accents
- **Heading font**: <name> — `--font-heading`
- **Body font**: <name> — `--font-body`
- **Google Fonts URL**: <url or 'not detected'>
- **Hero font size**: <px>
- **H2 font size**: <px>
- **Body font size**: <px>
- **Nav height**: <px> — use for hero `min-height: calc(100vh - <px>)`
- **Section vertical padding**: <value>
- **Container max-width**: <value>
- **Button radius**: <value>
- **Card radius**: <value>
- **Nav vs hero mismatch**: [yes — separate CSS variables / no — shared `--color-dark`]

---

## Available Assets

**Logos** (`docs/assets/logos/` → will be copied to `public/assets/logos/`):
- [filename] — [description: company logo / partner logo / etc.]
- (none downloaded — use brand-colored letter fallback)

**Images** (`docs/assets/images/` → `public/assets/images/`):
- [filename] — [description: hero photo / feature illustration / etc.]
- (none downloaded — use picsum placeholders)

**Backgrounds** (`docs/assets/backgrounds/` → `public/assets/backgrounds/`):
- [filename] — [which section it belongs to]
- (none downloaded)

---

## CTA Strategy
- **Primary CTA**: "<text>" — `background: var(--color-primary); color: #fff`
- **Secondary CTA**: "<text>" — ghost/outlined style
- **On brand-primary-background sections**: use dark fill button (`background: var(--color-dark); color: #fff`) — the primary color IS the background so the normal primary button is invisible

---

## Section Content Specs

### Navbar — `background: #HEX`
- **Logo**: [left-aligned / centered]
- **Links**: [list nav items]
- **CTA in nav**: [present: "<text>" / absent]

### Hero — `background: #HEX`
- **Layout**: [centered / split]
- **Eyebrow/badge**: [present: "<text>" / absent]
- **Headline**: "<text>"
- **Subtext**: "<text>"
- **Primary CTA**: "<text>"
- **Secondary CTA**: "<text or absent>"
- **Supporting content**: [stat chips / trust logos / feature bullets / image — describe]

### [Section name] — `background: #HEX`
- **Layout**: [single column centered / two-column split / N-column card grid]
- **Heading**: "<text>"
- **Content**: [describe: N cards with icon+title+body / logos strip / testimonials / etc.]
- **CTA**: [present: "<text>" / absent]

[Repeat for every section in the section plan]

---

## Typography Notes
- **Hero headline**: `<px>` / `font-weight: <weight>` / `color: white or dark`
- **Section headings**: `<px>` / `font-weight: <weight>`
- **Accent word in hero headline**: [yes → create `--color-highlight: #HEX` / no]
- **Subtext on dark sections**: [use `--color-subtle-dark: #HEX` / use `rgba(255,255,255,0.7)`]

---

## Image Handling Notes
[Instructions for using downloaded assets: which image goes in which section, aspect ratios, alt text guidance. If no assets, specify picsum seeds.]

---

## Known Limitations
[List anything that could not be extracted: failed asset downloads, approximated values, sections not fully visible in screenshots, etc.]
```

---

### Step 12 — Generate `docs/landing-source-report.md`

Write a human-readable summary for review:

Write `$PROJECT_ROOT/docs/landing-source-report.md`:

```markdown
# Landing Source Report

**Source**: <URL>
**Extracted**: <date>

## Summary
<3–5 sentence description of the site, its purpose, and visual character>

## Section Map
[Paste section plan table from builder-brief.md]

## Color Palette
| Role | Hex | Used in |
|---|---|---|
| Primary | #HEX | CTAs, brand accents |
| Nav background | #HEX | Nav |
| Hero background | #HEX | Hero |
| Light section | #HEX | Content sections |
| Footer | #HEX | Footer |

## Typography
- **Heading font**: <name>
- **Body font**: <name>
- **Hero size**: <px>
- **H2 size**: <px>

## Screenshots Captured
[List each .png file with a one-line description]

## Assets Downloaded
[List logos, images, backgrounds — filenames and approximate sizes]

## Fidelity Notes
[How close can the generated landing be to the source? What is well-captured vs. what must be approximated?]
```

---

## Validation step

After all files are generated, run:

```bash
PROJECT_ROOT="/workspace/projects/<project-name>"
MISSING=0

files=(
  "docs/builder-brief.md"
  "docs/globals-template.css"
  "docs/design-tokens.json"
  "docs/brand-context.md"
  "docs/site-map.md"
  "docs/visual-reference-spec.md"
  "docs/screenshot-manifest.md"
  "docs/landing-source-report.md"
  "docs/computed-styles.json"
)

for f in "${files[@]}"; do
  path="$PROJECT_ROOT/$f"
  if [ -s "$path" ]; then
    echo "OK   $f"
  else
    echo "FAIL $f — missing or empty"
    MISSING=$((MISSING + 1))
  fi
done

SC_COUNT=$(ls "$PROJECT_ROOT/docs/screenshots/"*.png 2>/dev/null | wc -l | tr -d ' ')
if [ "$SC_COUNT" -ge 2 ]; then
  echo "OK   screenshots ($SC_COUNT files)"
else
  echo "FAIL screenshots — only $SC_COUNT found (expected at least 2)"
  MISSING=$((MISSING + 1))
fi

python3 -m json.tool "$PROJECT_ROOT/docs/design-tokens.json" > /dev/null 2>&1 \
  && echo "OK   design-tokens.json valid JSON" \
  || { echo "FAIL design-tokens.json — invalid JSON"; MISSING=$((MISSING + 1)); }

echo ""
[ "$MISSING" -gt 0 ] \
  && echo "RESULT: $MISSING issue(s) — fix before handing off to landing-ui-builder" \
  || echo "RESULT: extraction complete — all files present"
```

If `computed-styles.json` is the only missing file (Playwright failed), treat it as a warning, not a fatal error — proceed in WebFetch-only mode and note the limitation in `builder-brief.md`.

All other files must be present before reporting the extraction as complete.

---

## Error handling

**Playwright fails to load the page** (timeout, network error):
1. Run `capture.js` once more
2. If it fails again, proceed without screenshots and `computed-styles.json`
3. Note in `builder-brief.md`: "Playwright capture failed — using WebFetch-only mode. Visual fidelity will be reduced."

**WebFetch returns no content or is blocked**:
1. Try the URL again
2. If still blocked, rely on Playwright capture data only
3. Note in `builder-brief.md`: "Page content could not be fetched — content sections may need manual adjustment"

**No assets downloaded**:
- Not fatal. Note in `builder-brief.md` Assets section: "No assets downloaded — landing-ui-builder will use picsum placeholders"
