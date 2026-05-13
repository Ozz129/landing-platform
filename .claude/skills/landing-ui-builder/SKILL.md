---
name: landing-ui-builder
description: Generate a visually striking, modern, responsive landing page inside an existing React project located under /workspace/projects using a structured extraction package, visual reference package, screenshots, docs folder sources, consolidated report, PDF, or topic.
argument-hint: "[project-name]"
disable-model-invocation: true
allowed-tools: Bash, Read, Write, Edit, MultiEdit, Glob, Grep
---

# landing-ui-builder

Generate a complete landing page with attractive UI and strong styling inside an already initialized React project.

This skill must work only inside projects located in:

`/workspace/projects`

## Required input

- `PROJECT_NAME`: exact name of the target project
- Optional structured extraction package
- Optional visual reference package
- Optional screenshot package
- Optional consolidated extraction report
- Optional PDF
- Topic if no structured extraction package, visual reference package, screenshot package, report, or PDF is provided
- Optional color palette
- Optional brand/style direction
- Optional audience, tone, or conversion goal

## Accepted source input models

This skill supports seven source modes:

### Mode 1 — Structured extraction package
Preferred when available.

Accepted files:
- `docs/brand-context.md`
- `docs/site-map.md`
- `docs/design-tokens.json`

When these files exist, treat them as the primary source of truth for:
- brand tone
- audience
- value proposition
- CTA style
- navigation cues
- section structure
- palette and typography hints
- layout direction
- trust signals
- differentiators
- placeholder guidance

### Mode 2 — Visual reference package
Accepted files:
- `docs/visual-reference-spec.md`
- `docs/assets/image-manifest.md`
- `docs/assets/style-reference.json`
- `docs/assets/background-manifest.md`
- `docs/assets/button-reference.md`
- `docs/assets/layout-reference.md`
- `docs/assets/images/`
- `docs/assets/backgrounds/`
- `docs/assets/logos/`

Use this as the primary source of truth for visual fidelity and asset direction.

It should influence:
- composition
- section contrast
- hero structure
- card design
- CTA appearance
- spacing rhythm
- image treatment
- logo and badge usage
- overall resemblance to the analyzed source

### Mode 3 — Screenshot package
Accepted files:
- `docs/screenshot-manifest.md`
- `docs/screenshots/`

Use screenshots as high-priority visual evidence for:
- real spacing
- section composition
- hero density
- CTA placement
- card proportions
- dark/light rhythm
- image prominence
- footer density
- relative visual scale

### Mode 4 — Consolidated Markdown extraction report
Accepted file:
- `docs/landing-source-report.md`

Use this as a human-readable summary of the extraction package.

### Mode 5 — Consolidated PDF extraction report
Accepted file:
- `docs/landing-source-report.pdf`

Use this as a portable readable brief when:
- the structured files are missing
- the Markdown report is missing
- or the user explicitly provides the PDF as the preferred source

### Mode 6 — PDF source
Use a PDF as the primary source of truth when no extraction package, visual reference package, screenshot package, or extraction report exists.

### Mode 7 — Topic-only generation
If none of the above exist, require a topic and generate a coherent landing draft from that topic.

## Source precedence rules

Apply source precedence in this order:

1. `docs/builder-brief.md` — read this first when present; it is a pre-synthesized brief that supersedes manual file-by-file synthesis
2. `docs/globals-template.css` — when present, use it as the base for `src/styles/globals.css` instead of generating tokens from scratch; confirmed values are already populated
3. `docs/computed-styles.json` — ground truth for all color, font, spacing, and layout values confirmed from live DOM
4. `docs/screenshots/` and `docs/screenshot-manifest.md` for composition and visual spacing evidence
5. `docs/design-tokens.json` for implementation-level style tokens
6. `docs/brand-context.md`
7. `docs/site-map.md`
8. `docs/assets/image-manifest.md`
9. `docs/landing-source-report.md`
10. `docs/landing-source-report.pdf`
11. General PDF source
12. Direct topic prompt

## Fixed project root

Use this absolute path as the only valid root for target projects:

`/workspace/projects`

## Project targeting rules

Before changing files:

1. Verify the target project exists inside:
   `/workspace/projects/<project-name>`
2. Inspect the project structure first
3. Work only inside the target project
4. Do not modify sibling projects
5. Do not work at the workspace root
6. Stop clearly if the target project does not exist
7. Never resolve the project path relative to the current working directory if that could target the wrong folder

## Path safety rules

- Always resolve the target project as:
  `/workspace/projects/<PROJECT_NAME>`
  where `<PROJECT_NAME>` is the exact name passed as the first argument to this skill
- Never use a relative path like `./<PROJECT_NAME>` or `projects/<PROJECT_NAME>`
- Never work inside another nested project by mistake
- If the current working directory is different from the project root, still use the fixed absolute path above
- The project name may be case-sensitive — use the exact name as provided (e.g., `Demo12123` not `demo12123`)

## Structured source inspection step

Before generating the landing, execute these steps **in order**:

1. Confirm the target project exists at the absolute path
2. Run the asset pipeline step — copy `docs/assets/` to `public/assets/`
3. Inspect the `docs/` directory and discover all files
4. **If `docs/builder-brief.md` exists — read it first.** It is a pre-synthesized brief that supersedes manual file-by-file synthesis. Use it as the primary working brief for the rest of generation.
5. **If `docs/globals-template.css` exists — copy it to `src/styles/globals.css` as the base CSS variables file.** Do not generate CSS tokens from scratch; confirmed values are already populated. Only extend or adjust what is needed.
6. **If `docs/computed-styles.json` exists — read it as ground truth** for all confirmed color, font, spacing, and layout values. Use `sectionLayouts` entries to inform CSS grid/flex structure per section. Use `fonts` to apply confirmed font families. Use `imageMetrics` for image sizing and aspect ratios.

**Short-circuit:** If all three files exist — `docs/builder-brief.md`, `docs/globals-template.css`, and `docs/computed-styles.json` — skip step 7 entirely. The builder-brief.md is already a complete synthesis; reading additional docs files adds tokens without improving generation quality. Continue with step 8 (screenshot analysis) as normal.

7. Read all remaining relevant source files in priority order
8. **Execute the Screenshot analysis protocol** — open every screenshot and produce the section color map
9. **Execute the Section background color mapping step** — record exact hex values per section
10. Build a working brief from the combined `docs/` sources, with the screenshot color map as ground truth for section backgrounds
11. Identify conflicts between screenshots and written docs — screenshots win for visual attributes
12. Plan section components based on the color map, not the written spec section rhythm
13. If no relevant docs sources exist, continue with PDF or topic flow

## Docs folder discovery rules

Before generating the landing, inspect the `docs/` directory inside the target project.

1. Use file discovery to list all files inside:
   `/workspace/projects/<project-name>/docs`
2. Read every relevant source file found in that directory.
3. Treat the following files as high priority when present — read in this order:
   - `docs/builder-brief.md` ← read first if present; pre-synthesized brief
   - `docs/globals-template.css` ← use as base for globals.css if present
   - `docs/computed-styles.json` ← confirmed DOM values; supersedes other files on color/typography/spacing
   - `docs/brand-context.md`
   - `docs/site-map.md`
   - `docs/design-tokens.json`
   - `docs/landing-source-report.md`
   - `docs/landing-source-report.pdf`
   - `docs/visual-reference-spec.md`
   - `docs/screenshot-manifest.md`
   - `docs/assets/image-manifest.md`
   - `docs/assets/background-manifest.md`
   - `docs/assets/implementation-reference.md`
4. Inspect whether these directories exist and contain usable visual assets:
   - `docs/assets/images/`
   - `docs/assets/backgrounds/`
   - `docs/assets/logos/`
   - `docs/screenshots/`
5. If additional relevant briefing files exist in `docs/`, read them too when they can improve:
   - tone
   - content hierarchy
   - section planning
   - CTA direction
   - design-system understanding
   - image placement
   - visual similarity
   - composition fidelity
6. Ignore irrelevant generated files that do not help landing generation.
7. Do not read outside the target project.

## Core goal

- Output: polished, premium, modern, conversion-oriented landing page — not a generic scaffold
- When visual packages exist: match source hierarchy, spacing, CTA emphasis, section contrast, card styling, image treatment, footer density

## Design priorities

The generated landing must prioritize:

- Strong visual hierarchy
- Premium spacing and section rhythm
- Clear headline structure
- High-contrast calls to action
- Modern card design
- Consistent radius, shadows, borders, and spacing
- Balanced use of color, gradients, highlights, and visual accents
- Clean responsive composition across mobile, tablet, and desktop
- Accessible contrast and semantic structure
- Modular editable code
- High visual fidelity when screenshots and reference packages exist

## Visual direction rules

When generating UI:

1. Avoid bland layouts
2. Avoid flat template-looking sections with weak hierarchy
3. Prefer bold hero sections with clear headline, supporting copy, CTA, and visual emphasis
4. Use layered backgrounds, soft gradients, subtle glows, section dividers, or elevated cards when appropriate
5. Create visual contrast between sections
6. Use tasteful decorative accents, not clutter
7. Favor a premium SaaS, hospitality, startup, editorial, or institutional aesthetic depending on the source
8. Make the page feel crafted, not auto-generated
9. When screenshots and visual reference packages exist, aim for the closest practical resemblance in:
   - layout rhythm
   - CTA placement
   - image usage
   - section ordering
   - card composition
   - spacing
   - content density
10. Do not blindly recreate every pixel; keep the code maintainable and editable

## Screenshot reference rules

When `docs/screenshots/` exists:
- inspect the available screenshots as high-priority visual references
- use them to understand section spacing, hierarchy, card density, CTA placement, and background contrast
- prefer screenshot evidence over broad visual assumptions

When `docs/screenshot-manifest.md` exists:
- use it to understand what each screenshot represents
- use it to map visual references to the generated landing sections
- use it to decide which parts of the source page must feel most similar

Use screenshots to capture:
- real section spacing
- relative text scale
- CTA placement
- card proportions
- layout grouping
- alignment
- dark/light section rhythm
- image prominence
- footer density

## Screenshot analysis protocol

When screenshots exist in `docs/screenshots/`, perform this analysis before generating any code:

1. Open and visually inspect every available screenshot
2. For each visible section band from top to bottom, document:
   - Background tone: near-black / dark navy / white-light / bright-accent-color
   - Layout type: single column centered / two column split / card grid / logo strip
   - Presence of background texture, pattern, or image behind the content
   - Text color (white, dark, or accent)
   - CTA presence and approximate color
3. Record the exact section sequence as a color map, for example:
   ```
   nav        → near-black
   hero       → near-black + texture
   section-2  → white/light
   section-3  → BRIGHT BLUE (primary color as full background)
   section-4  → white/light
   section-5  → near-black
   section-6  → BRIGHT BLUE (primary color as full background)
   footer     → near-black
   ```
4. Identify if ANY section uses the primary brand color (#primary) as a full-width background — this is a common pattern for methodology, CTA, or highlight sections
5. Identify if the hero has a visible texture or pattern: dot grid, line grid, circuit board traces, diagonal lines, particle field
6. Note any headline text that uses a different color from the CTA buttons (special one-off accent on a specific word or phrase)
7. Write this section color map in a comment at the top of your planning notes before generating components

## Screenshot vs. written spec conflict resolution

When visual attributes in screenshots **contradict** written docs (`visual-reference-spec.md`, `design-tokens.json`, `landing-source-spec.md`, etc.), apply these rules:

**Screenshots always win for:**
- Section background color (dark vs. white vs. bright accent)
- Whether a section uses the primary color as its full background
- Section ordering and relative height
- Hero texture or pattern presence
- Layout type (split column vs. single centered column)
- Number of CTA buttons visible in hero
- Whether client or tool logos appear on dark or light background

**Written docs win for:**
- Exact hex color values — screenshots cannot be color-sampled; use design-tokens.json for the precise value
- Typography scale (font sizes in px/rem)
- Exact padding and spacing values
- Border radius values
- Copy text and messaging
- Which logo is white reverse vs. full color

**Resolution process when conflict is detected:**

1. Screenshot shows bright blue section → check `design-tokens.json` for the nearest bright color → use `primary` or `accent` as the background
2. Screenshot shows white section but written spec says dark → use white
3. Screenshot shows single CTA button in hero but spec says two → use the count from the screenshot
4. Screenshot shows textured hero but spec says solid color → implement a CSS texture that approximates the screenshot pattern

Never override screenshot evidence with written spec for background colors and layout structure.

## Visual reference package rules

When these files exist, use them as high-priority visual guidance:
- `docs/visual-reference-spec.md`
- `docs/assets/image-manifest.md`
- `docs/assets/background-manifest.md`
- `docs/assets/implementation-reference.md`

If `docs/assets/images/`, `docs/assets/backgrounds/`, or `docs/assets/logos/` contain downloaded visual assets:
- prefer those assets over generic placeholders when they are relevant and safe to reuse for educational mockup purposes
- use the manifests to understand where each asset belongs

Use the visual reference package to make the generated landing feel as close as practical to the analyzed source in:
- composition
- hierarchy
- image treatment
- CTA styling
- section contrast
- card design
- background treatment
- trust/logo strip appearance

## computed-styles.json usage rules

When `docs/computed-styles.json` exists, apply these rules:

### Section layout extraction (`sectionLayouts`)

If `computed-styles.json` contains a `sectionLayouts` array, use each entry to inform the CSS grid or flex structure of the matching section component:

- `display: "grid"` + `gridTemplateColumns` → use `display: grid; grid-template-columns: <value>` in the section's CSS
- `display: "flex"` + `flexDirection` → use `display: flex; flex-direction: <value>`
- `gap` → use as `gap: <value>` on the grid/flex container
- `childCount` → confirms how many columns/items the section has (validates your grid template)

Example: if `sectionLayouts[2]` reports `{ gridTemplateColumns: "repeat(3, 1fr)", gap: "24px", childCount: 3 }`, the matching section component should use:
```css
.section__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}
```

### Font detection (`fonts`)

If `computed-styles.json` contains a `fonts` object:
- `googleFonts` — array of font family names confirmed via `<link>` tag scanning. Import these via `@import url(...)` in `globals.css` if not already imported.
- `fontFaces` — custom `@font-face` families. Document them as comments; do not attempt to re-host the font files.
- Apply confirmed font families to `--font-heading` and `--font-body` CSS variables.

### Image dimensions (`imageMetrics`)

If `computed-styles.json` contains an `imageMetrics` array, use `aspectRatio` values to set `aspect-ratio` on image containers — prevents layout shift and keeps proportions accurate to the source.

### navVsHeroMismatch flag

If `computed-styles.json` has `navVsHeroMismatch: true`, the nav and hero backgrounds are different colors. Create separate CSS variables for each — never share `var(--color-dark)` for both.

## CSS token injection rules

When `docs/design-tokens.json` exists, inject confirmed token values directly into `:root` as CSS custom properties — do not approximate or use `clamp()` for values that are marked as confirmed.

### Confirmed values → verbatim CSS variables

For each confirmed numeric value in `design-tokens.json`, write an exact CSS variable:

```css
:root {
  /* Colors — exact hex from design-tokens.json */
  --color-nav-bg:       <navBackground>;      /* e.g. #0B8ECC */
  --color-hero-bg:      <heroBackground>;     /* e.g. #07090C */
  --color-section-light: <sectionLight>;      /* e.g. #F6F8F9 */
  --color-section-blue: <sectionBlue>;        /* e.g. #0B8ECC */
  --color-section-navy: <sectionNavy>;        /* e.g. #0A2540 */
  --color-footer-bg:    <footerBackground>;   /* e.g. #1A1D22 */
  --color-subtle-dark:  <textSubtleOnDark>;   /* e.g. #B5D6E7 */

  /* Typography — confirmed px values, NOT clamp() */
  --font-hero:   <h1.confirmedPx>;            /* e.g. 67.2px */
  --font-h2:     <h2.confirmedPx>;            /* e.g. 37.8px */

  /* Spacing — confirmed values */
  --section-py:  <sectionYDesktop>;           /* e.g. 67.2px */
  --nav-height:  <navHeightPx>;               /* e.g. 84px */

  /* Radius */
  --radius-btn:      <radius.button>;         /* e.g. 4px */
  --radius-btn-pill: <radius.badge>;          /* e.g. 36px — for pill-shaped CTAs */
  --radius-card:     <radius.card>;           /* e.g. 10px */
}
```

### Rules

1. If a token value is labeled `confirmed` in `design-tokens.json`, use it **verbatim** — never replace it with an approximation.
2. Only use `clamp()` for values labeled `inferred` or `strongly inferred` and only when responsive scaling is needed.
3. When `navBackground` ≠ `heroBackground`, they **must** become separate CSS variables — never share `var(--color-dark)` for both.
4. When `navHeightPx` is available, use it for: nav `height`, hero `min-height: calc(100vh - <navHeightPx>)`, and mobile menu `top: <navHeightPx>`.
5. When `sectionColorMap` is present in `design-tokens.json`, each entry's `background` value becomes the section's CSS `background-color` — no exceptions.

## Style system rules

If a structured extraction package includes design tokens:
- Apply them consistently when they are clear and usable
- Use them for:
  - page background
  - text hierarchy
  - CTA buttons
  - badges
  - highlights
  - icons
  - cards
  - separators
  - section emphasis
- Preserve readability and contrast
- Derive neutrals and muted tones if needed
- If some token values are marked as inferred, use them carefully and refine them only when necessary for readability or cohesion

If a screenshot and visual reference package exist:
- prefer matching the visible source style as closely as practical
- prioritize matching:
  - hero composition
  - section contrast rhythm
  - CTA emphasis
  - card appearance
  - image sizing and cropping behavior
  - logo and trust strip treatment
  - button feel
  - footer density
- keep the implementation maintainable

If a color palette is provided directly:
- Apply it consistently
- Use it for:
  - page background
  - text hierarchy
  - CTA buttons
  - badges
  - highlights
  - icons
  - cards
  - separators
  - section emphasis
- Preserve readability and contrast
- Derive neutrals and muted tones if needed

If no palette is provided:
- Generate a polished default palette based on the topic
- Prefer a premium and modern feel over a bland neutral theme

## Typography rules

- Create strong heading contrast
- Use larger headline sizes for hero and section titles
- Keep supporting text readable and concise
- Maintain clear spacing between eyebrow, heading, paragraph, and CTA
- Avoid overly dense paragraphs
- Make section titles visually distinct
- If typography clues exist in the structured extraction package, use them as the primary direction
- If screenshot and visual reference packages exist, align the heading scale and density as closely as practical to the reference

## Section composition rules

The page may include, when relevant:

- Hero
- Trust bar or social proof
- Benefits or features
- Services or offering breakdown
- About or why choose us
- Process or how it works
- Testimonials
- FAQ
- CTA banner
- Footer

Not every landing needs every section.
Select sections according to source quality and conversion intent.

If a structured extraction package exists, let the recommended section structure strongly influence the final composition.

If a consolidated report exists, use it to reinforce the section order and the role of each section.

If a screenshot package exists, use it to shape how those sections are visually spaced and grouped.

If a visual reference package exists, use it to shape how those sections look and feel.

## Hero section requirements

The hero should be a focal point.

Prefer:
- eyebrow or badge
- powerful headline
- concise supporting paragraph
- one primary CTA
- optional secondary CTA
- optional stat cards, trust chips, or benefit bullets
- visual emphasis through layout, gradient, contrast, card, or mock composition

Avoid weak heroes with only centered text and no supporting visual structure unless the style direction explicitly asks for minimalism.

If the extraction package or consolidated report includes hero tone or CTA cues, use them.

If the screenshot or visual reference package includes hero composition clues, follow them closely.

## Hero background texture rules

When the hero screenshot shows a visible background pattern, texture, or grid:

### Step 0 — Solid color check (do this first)

Before choosing any texture, check whether the hero actually has one.

Look at the hero section in the screenshot. Ask: is there a visible repeating pattern, grid, or texture overlaid on the background color?

- **If NO visible texture**: implement the hero as a solid color only. Do NOT add `background-image` of any kind.
  ```css
  .hero {
    background-color: var(--color-hero-bg);
    /* No background-image */
  }
  ```
- Also check `sectionColorMap` in `design-tokens.json`: if the hero entry has `"hasTexture": false`, use solid color only.
- Do NOT add a dot-grid, line-grid, or radial glow just to make the hero look more "premium" — if the source is solid, the output must be solid.

Only proceed to Step 1–4 below if the hero screenshot shows a clearly visible repeating pattern or texture.

### Step 1 — Identify the texture type

Look at the hero and classify it:

- **Dot grid**: regular small dots at uniform spacing
- **Line grid**: fine horizontal + vertical lines forming a grid
- **Circuit board / diagonal traces**: interconnected lines including diagonal elements at 45°, nodes at intersections
- **Particle field**: scattered dots of varying size and opacity
- **Radial glow only**: no repeating pattern, just a soft light bloom from one direction

### Step 2 — Apply the matching CSS pattern

**Dot grid:**
```css
.hero {
  background-color: var(--color-dark);
  background-image: radial-gradient(circle, rgba(11, 142, 204, 0.15) 1px, transparent 1px);
  background-size: 24px 24px;
}
```

**Line grid with radial glow (most common for dark B2B heroes):**
```css
.hero {
  background-color: var(--color-dark);
  background-image:
    radial-gradient(ellipse 80% 70% at 65% 50%, rgba(11, 142, 204, 0.18) 0%, transparent 65%),
    linear-gradient(rgba(11, 142, 204, 0.07) 1px, transparent 1px),
    linear-gradient(90deg, rgba(11, 142, 204, 0.07) 1px, transparent 1px);
  background-size: 100% 100%, 40px 40px, 40px 40px;
}
```

**Circuit board / diagonal traces:**
```css
.hero {
  background-color: var(--color-dark);
  background-image:
    radial-gradient(ellipse 80% 70% at 65% 50%, rgba(11, 142, 204, 0.16) 0%, transparent 65%),
    linear-gradient(rgba(11, 142, 204, 0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(11, 142, 204, 0.06) 1px, transparent 1px),
    repeating-linear-gradient(
      -45deg,
      transparent,
      transparent 28px,
      rgba(11, 142, 204, 0.03) 28px,
      rgba(11, 142, 204, 0.03) 29px
    );
  background-size: 100%, 40px 40px, 40px 40px, 100%;
}
```

### Step 3 — Rules for texture colors

- Always use the page's primary brand color (from `design-tokens.json`) as the pattern color
- Extract the RGB components of the primary color for use in `rgba()` — e.g., `#0B8ECC` → `rgb(11, 142, 204)`
- Use low opacity for pattern lines: 0.04–0.08
- Use slightly higher opacity for the radial glow: 0.12–0.20
- The base is always the solid dark color (`background-color: var(--color-dark)`)
- Layer the radial glow toward the illustration side of the hero (right column if text is left)

### Step 4 — Accent text highlights in hero headlines

When the hero headline has a word or phrase highlighted in a color different from the CTA buttons:

- Check the design-tokens.json for a matching secondary accent (e.g., `accent`, `highlight`, or `secondary` token)
- If no token matches the visible color, create a CSS custom property: `--color-highlight`
- Derive its value from the screenshot's visible hue: for bright teal-green use approximately `#00C98A`; for amber use the `accent` token value
- Apply it via a `<span class="highlight">` inside the headline — never with inline styles
- Do not apply this highlight color to CTA buttons or other elements

## Hero subtext and subtle text color rules

When `design-tokens.json` has a `textSubtleOnDark` or `colors.textSubtleOnDark` token (e.g., `#B5D6E7`):

- Use it **directly** as the hero subheadline color — never replace it with `rgba(255,255,255,X)`
- Create a CSS variable: `--color-subtle-dark: <textSubtleOnDark value>`
- Apply it to `.hero__subhead` and any equivalent subtext on dark backgrounds

`rgba(255,255,255,0.72)` is a generic approximation. A confirmed `textSubtleOnDark` token means the source intentionally uses a tinted off-white (e.g., a blue-white `#B5D6E7`) — this is visible at a glance and must be preserved.

If no `textSubtleOnDark` token exists, using `rgba(255,255,255,0.7)` is acceptable.

## Premium UI patterns

Use these patterns when appropriate:

- gradient backgrounds
- glass or translucent panels used sparingly
- elevated cards with subtle borders
- feature grids with icon blocks
- trust badges
- stat highlights
- asymmetric layouts
- alternating section backgrounds
- soft shadow depth
- rounded containers
- visual emphasis blocks for testimonials or offers

Do not overuse effects.
Keep the page refined.

If the source reference package indicates a stricter institutional visual language, prefer restraint over flashy effects.

## Image handling rules

Always use real `<img>` elements. Never use emoji placeholder divs or colored divs as image substitutes.

When `docs/assets/images/`, `docs/assets/backgrounds/`, or `docs/assets/logos/` contain relevant downloaded visual assets:
- prefer using those assets in the generated landing when appropriate
- place them according to manifests and screenshot evidence
- preserve meaningful `alt` text
- keep file usage intentional and section-specific

When `docs/screenshots/` exists:
- use screenshots to validate image prominence, crop feel, and image placement strategy
- do not use screenshots as production UI images unless the user explicitly wants that
- use them as visual layout evidence

When downloaded assets do not exist or are incomplete:
- use source-aware placeholders guided by the manifests, screenshots, or visual reference package
- if no better source exists, use `https://picsum.photos/seed/{descriptive-seed}/{width}/{height}` as the `src`
- choose a descriptive seed that matches the content
- always include a meaningful `alt` attribute describing the subject
- add a comment: `{/* TODO: replace src with real photo */}`
- add `loading="lazy"` on images below the fold
- add `object-fit: cover` and explicit dimensions in CSS so layout does not shift

In CSS, image containers use:
```css
.component__img {
  width: 100%;
  aspect-ratio: 4/3;  /* or 16/9 depending on layout */
  object-fit: cover;
  display: block;
}
```

## Tool and partner icon rules

When a section uses tool logos, partner logos, or integration icons (e.g. AI tools grid, partner logos strip):

### Step 0 — Path convention (mandatory)

All tool and partner logos MUST be saved to and referenced from `/assets/logos/`, never `/assets/images/`:
- Save logo files to: `<project-root>/public/assets/logos/`
- Reference in components as: `/assets/logos/filename.svg`

This ensures the asset pipeline (`docs/assets/logos/` → `public/assets/logos/`) copies them correctly and that the pre-build verification step can find them.

### Step 1 — Check docs/assets/logos/ first

```bash
ls docs/assets/logos/
```

If a logo was downloaded, use it as `<img src="/assets/logos/filename.svg">` inside the icon container.

### Step 2 — If logo is NOT downloaded, use a brand-colored icon background

Never render a plain letter on a generic gray background. Instead:

1. Assign each tool/partner its known brand color (e.g. ChatGPT = `#74aa9c`, Gemini = `#4285F4`, Claude = `#CC785C`, Copilot = `#0078D4`, Shortcut = `#6E56CF`, Microsoft = `#0078D4`, Salesforce = `#00A1E0`)
2. Set the icon container's `background-color` to that brand color inline: `style={{ backgroundColor: '#74aa9c' }}`
3. Render the first letter of the tool name in white as the fallback label inside
4. This produces a visually distinct, recognizable grid instead of uniform gray placeholders

Example structure for a tool card icon with fallback:
```tsx
<div
  className="tools__icon"
  style={{ backgroundColor: tool.iconSrc ? 'transparent' : tool.brandColor }}
>
  {tool.iconSrc ? (
    <img src={tool.iconSrc} alt={`${tool.name} logo`} className="tools__icon-img" loading="lazy" />
  ) : (
    <span className="tools__icon-letter">{tool.name.charAt(0)}</span>
  )}
</div>
```

### Step 3 — Download well-known tool logos from curated CDN list

After generating the components but before the final build, run this download script. It validates each download (skips files < 500 bytes) and injects a fill color into colorless simple-icons SVGs:

```bash
LOGO_DIR="<project-root>/public/assets/logos"
mkdir -p "$LOGO_DIR"

# dl <url> <dest> [fill-color]
# Downloads, validates size > 500 bytes, injects fill into colorless SVGs
dl() {
  local url="$1" dest="$2" color="${3:-}"
  curl -sL --max-time 15 "$url" -o "$dest" 2>/dev/null
  local sz
  sz=$(wc -c < "$dest" 2>/dev/null | tr -d ' ')
  if [ "${sz:-0}" -lt 500 ]; then rm -f "$dest"; echo "SKIP (too small): $dest"; return 1; fi
  # Inject fill if SVG has none (simple-icons format delivers colorless SVGs)
  if [ -n "$color" ] && ! grep -q 'fill=' "$dest" 2>/dev/null; then
    sed -i '' "s|<svg |<svg fill=\"$color\" |" "$dest"
  fi
  echo "OK: $dest (${sz}b)"
}

# ── General Purpose LLMs ──────────────────────────────────────────────────────
dl "https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg"              "$LOGO_DIR/chatgpt.svg"
dl "https://upload.wikimedia.org/wikipedia/commons/8/8a/Google_Gemini_logo.svg"        "$LOGO_DIR/gemini.svg"
dl "https://cdn.simpleicons.org/anthropic"                                              "$LOGO_DIR/claude.svg"       "#CC785C"
dl "https://upload.wikimedia.org/wikipedia/commons/2/2a/Microsoft_365_Copilot_Icon.svg" "$LOGO_DIR/copilot.svg"
dl "https://cdn.simpleicons.org/meta"                                                   "$LOGO_DIR/meta.svg"         "#0668E1"
dl "https://cdn.simpleicons.org/mistral"                                                "$LOGO_DIR/mistral.svg"      "#FF7000"
dl "https://cdn.simpleicons.org/perplexity"                                             "$LOGO_DIR/perplexity.svg"   "#20808D"
dl "https://cdn.simpleicons.org/ollama"                                                 "$LOGO_DIR/ollama.svg"       "#000000"

# ── Workflow / Productivity ───────────────────────────────────────────────────
dl "https://upload.wikimedia.org/wikipedia/commons/d/d5/Slack_icon_2019.svg"          "$LOGO_DIR/slack.svg"
dl "https://cdn.simpleicons.org/notion"                                                "$LOGO_DIR/notion.svg"       "#000000"
dl "https://cdn.simpleicons.org/shortcut"                                              "$LOGO_DIR/shortcut.svg"     "#58B1E4"
dl "https://cdn.simpleicons.org/microsoftteams"                                        "$LOGO_DIR/teams.svg"        "#6264A7"
dl "https://cdn.simpleicons.org/zoom"                                                  "$LOGO_DIR/zoom.svg"         "#2D8CFF"
dl "https://cdn.simpleicons.org/asana"                                                 "$LOGO_DIR/asana.svg"        "#F06A6A"
dl "https://cdn.simpleicons.org/clickup"                                               "$LOGO_DIR/clickup.svg"      "#7B68EE"
dl "https://cdn.simpleicons.org/trello"                                                "$LOGO_DIR/trello.svg"       "#0052CC"
dl "https://cdn.simpleicons.org/airtable"                                              "$LOGO_DIR/airtable.svg"     "#18BFFF"

# ── Microsoft Office ──────────────────────────────────────────────────────────
dl "https://cdn.simpleicons.org/microsoftword"                                         "$LOGO_DIR/word.svg"         "#2B579A"
dl "https://cdn.simpleicons.org/microsoftexcel"                                        "$LOGO_DIR/excel.svg"        "#217346"
dl "https://cdn.simpleicons.org/microsoftpowerpoint"                                   "$LOGO_DIR/powerpoint.svg"   "#D24726"
dl "https://cdn.simpleicons.org/microsoftoutlook"                                      "$LOGO_DIR/outlook.svg"      "#0078D4"

# ── Dev / Design Tools ────────────────────────────────────────────────────────
dl "https://cdn.simpleicons.org/github"                                                "$LOGO_DIR/github.svg"       "#181717"
dl "https://cdn.simpleicons.org/gitlab"                                                "$LOGO_DIR/gitlab.svg"       "#FC6D26"
dl "https://cdn.simpleicons.org/figma"                                                 "$LOGO_DIR/figma.svg"        "#F24E1E"
dl "https://cdn.simpleicons.org/jira"                                                  "$LOGO_DIR/jira.svg"         "#0052CC"
dl "https://cdn.simpleicons.org/linear"                                                "$LOGO_DIR/linear.svg"       "#5E6AD2"
dl "https://cdn.simpleicons.org/cursor"                                                "$LOGO_DIR/cursor.svg"       "#000000"

# ── CRM / Sales / Marketing ───────────────────────────────────────────────────
dl "https://cdn.simpleicons.org/hubspot"                                               "$LOGO_DIR/hubspot.svg"      "#FF7A59"
dl "https://cdn.simpleicons.org/salesforce"                                            "$LOGO_DIR/salesforce.svg"   "#00A1E0"
dl "https://cdn.simpleicons.org/zendesk"                                               "$LOGO_DIR/zendesk.svg"      "#03363D"
dl "https://cdn.simpleicons.org/intercom"                                              "$LOGO_DIR/intercom.svg"     "#6AFDEF"

# ── Finance / Data ────────────────────────────────────────────────────────────
dl "https://cdn.simpleicons.org/bloomberg"                                             "$LOGO_DIR/bloomberg.svg"    "#000000"

echo "=== Downloaded logos ==="
ls -la "$LOGO_DIR/"
```

After running, use `ls "$LOGO_DIR/"` to confirm which logos are present. For each tool:
- If the file exists and size > 500 bytes → set `iconSrc: '/assets/logos/<filename>.svg'` in the component
- If download failed or file is too small → set `iconSrc: null` and use the brand-colored letter fallback (Step 2)

**Never hardcode an `iconSrc` path without first confirming the file exists.**

## Logo SVG filter rules

Downloaded logos fall into two distinct categories. Apply different CSS treatment based on category.

### How to identify the category

Open the SVG file and look at the first non-metadata element:

- **Wordmark logo**: starts with `<path>`, `<text>`, or `<g>` — no background fill. This is a pure text or icon mark.
- **Badge/icon logo**: starts with `<rect width="..." height="..."/>` or `<circle>` filling the entire viewBox. This is a square brand tile with its own background color.

Quick check via terminal:
```bash
head -3 /path/to/logo.svg
```
If you see `<rect width="60" height="60" fill="#XXXXXX"/>` → it is a badge logo.
If the first element is `<path d="..."/>` or `<g>` → it is a wordmark.

### CSS treatment by category

**Wordmark logos on dark section backgrounds:**
```css
.logo-img {
  filter: brightness(0) invert(1);
  opacity: 0.7;
}
```
This renders any colored wordmark as white against the dark background.

**Wordmark logos on white/light section backgrounds:**
```css
.logo-img {
  /* no filter — render in original brand color */
  opacity: 0.75;
}
```

**Badge/icon logos on dark section backgrounds:**
```css
.logo-img {
  width: 52px;
  height: 52px;
  object-fit: contain;
  border-radius: 10px;
  /* No filter — brand background color must remain visible */
}
```

**Badge/icon logos on white/light section backgrounds:**
```css
.logo-img {
  width: 52px;
  height: 52px;
  object-fit: contain;
  border-radius: 10px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.12);
}
```

**Never apply `brightness(0) invert(1)` to badge/icon logos** — this destroys the brand color background, typically rendering a solid white or solid black square.

## Asset pipeline step

When `docs/assets/` contains downloaded images, logos, or backgrounds, copy them to the project's `public/` directory so Vite can serve them as static assets:

```bash
mkdir -p <project-root>/public/assets/images
mkdir -p <project-root>/public/assets/logos
mkdir -p <project-root>/public/assets/backgrounds
cp <project-root>/docs/assets/images/* <project-root>/public/assets/images/ 2>/dev/null || true
cp <project-root>/docs/assets/logos/* <project-root>/public/assets/logos/ 2>/dev/null || true
cp <project-root>/docs/assets/backgrounds/* <project-root>/public/assets/backgrounds/ 2>/dev/null || true
```

Reference these assets in components using **absolute public paths**:
- `/assets/images/filename.jpg`
- `/assets/logos/filename.svg`
- `/assets/backgrounds/filename.jpg`

This approach works with both `vite dev` and `vite build` without any `vite.config.ts` changes.

Do not use relative paths like `../../docs/assets/...` in component imports — this is fragile and will break after build.

## CTA color on accent-background sections

When a section uses the primary brand color as its full background (e.g., a methodology section on brand blue), the normal primary-color CTA button becomes invisible against the same-color background.

**Rule: detect the section background color before choosing CTA colors.**

| Section background | Primary CTA style | Secondary CTA style |
|---|---|---|
| Dark (`#07090C` / `#161823`) | Brand primary fill, white text | Transparent, white border, white text |
| White / light (`#FFFFFF` / `#F5F6F8`) | Brand primary fill, white text | Transparent, primary border, primary text |
| Brand primary color (e.g., `#0B8ECC`) | **Dark fill** (`var(--color-dark)`), white text | **White fill** or transparent white border, dark text |
| Brand accent color (e.g., `#FFCD3B`) | **Dark fill**, dark text | Transparent, dark border, dark text |

**Implementation for primary-color sections:**
```css
/* Dark button on brand-blue background */
.accent-section .btn--primary {
  background-color: var(--color-dark);
  color: #FFFFFF;
  border-color: var(--color-dark);
}

.accent-section .btn--secondary {
  background-color: transparent;
  color: #FFFFFF;
  border-color: rgba(255, 255, 255, 0.5);
}
```

This rule applies to any section where `background-color` is set to `var(--color-primary)`.

## Section background color mapping step

Before writing any CSS, produce a section color map. Use the screenshots as evidence and the design-tokens.json for exact hex values:

1. From the full-page screenshot, count and label each section band (nav, hero, section-A, section-B, ...)
2. For each section, classify its background as: `near-black`, `dark-alt`, `white`, `light`, or `brand-primary`
3. Map `brand-primary` sections to the `primary` token hex value from `design-tokens.json`
4. Map `near-black` to `secondary` or `heroBackground` token
5. Write the map explicitly before starting to code, for example:
   ```
   nav:           #07090C  (near-black)
   hero:          #07090C  (near-black + circuit texture)
   challenge:     #FFFFFF  (white — confirmed from screenshot)
   methodology:   #0B8ECC  (brand-primary — BRIGHT BLUE in screenshot)
   role-tracks:   #F5F6F8  (light)
   tools:         #07090C  (near-black)
   cta:           #0B8ECC  (brand-primary — BRIGHT BLUE in screenshot)
   footer:        #07090C  (near-black)
   ```
6. This map becomes the ground truth for all section background CSS
7. Do not rely on the written `visual-reference-spec.md` section rhythm description if the screenshots contradict it

## Section background verification step

For each section in the `sectionColorMap` (from `design-tokens.json`), verify that its CSS file has the correct `background-color`:

1. Read each section's `.css` file
2. Find the root selector (e.g. `.hero`, `.methodology`, `.problem`, `.ai-tools`, `.footer`)
3. Confirm its `background-color` value matches the `sectionColorMap` entry
4. If it doesn't match — fix it immediately before proceeding

Common mismatches to check explicitly:
- Nav: must use `--color-nav-bg` (or the confirmed nav color), not `--color-dark` or `--color-hero-bg`
- Sections with brand-primary as background (e.g. methodology): must NOT be `var(--color-white)` or `var(--color-light)`
- Sections that are light gray: must NOT be `var(--color-dark-alt)` or any dark color
- Deep navy sections (e.g. AI tools): must use the confirmed navy token, not `var(--color-dark)`
- Footer: must use the confirmed footer token, not the same as the hero

Do not proceed to build until all section background colors are verified against the color map.

## Animation system

Add a lightweight scroll-reveal animation layer to the generated landing. No external libraries. Pure CSS keyframes + a single Intersection Observer hook.

### Step 1 — Create the animation hook

Write `src/lib/useScrollReveal.ts`:

```ts
import { useEffect, useRef } from 'react'

export function useScrollReveal(threshold = 0.15) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('revealed')
          observer.disconnect()
        }
      },
      { threshold }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])

  return ref
}
```

### Step 2 — Add animation keyframes to globals.css

Append this block at the end of `src/styles/globals.css`:

```css
/* ── Scroll reveal ─────────────────────────────── */
.reveal {
  opacity: 0;
  transform: translateY(28px);
  transition: opacity 0.55s ease, transform 0.55s ease;
}
.reveal.revealed {
  opacity: 1;
  transform: translateY(0);
}

/* Stagger children inside a revealed parent */
.reveal-group > * {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.45s ease, transform 0.45s ease;
}
.reveal-group.revealed > *:nth-child(1) { transition-delay: 0.05s; opacity: 1; transform: none; }
.reveal-group.revealed > *:nth-child(2) { transition-delay: 0.13s; opacity: 1; transform: none; }
.reveal-group.revealed > *:nth-child(3) { transition-delay: 0.21s; opacity: 1; transform: none; }
.reveal-group.revealed > *:nth-child(4) { transition-delay: 0.29s; opacity: 1; transform: none; }
.reveal-group.revealed > *:nth-child(5) { transition-delay: 0.37s; opacity: 1; transform: none; }
.reveal-group.revealed > *:nth-child(6) { transition-delay: 0.45s; opacity: 1; transform: none; }

/* Button hover */
.btn {
  transition: background-color 0.18s ease, border-color 0.18s ease,
              color 0.18s ease, transform 0.15s ease, box-shadow 0.18s ease;
}
.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.18);
}
.btn:active {
  transform: translateY(0);
}

/* Card hover */
.card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.14);
}
```

### Step 3 — Apply scroll reveal to section components

For every section **below the hero** (do NOT apply to `<Navbar>` or `<Hero>`):

1. Import the hook at the top of each section TSX:
   ```tsx
   import { useScrollReveal } from '../../lib/useScrollReveal'
   ```
2. Call the hook inside the component:
   ```tsx
   const sectionRef = useScrollReveal()
   ```
3. Attach `ref` and the `reveal` class to the section's root element:
   ```tsx
   <section ref={sectionRef as React.RefObject<HTMLElement>} className="features reveal">
   ```
4. For sections that contain a card grid or feature list, also add `reveal-group` to the grid container:
   ```tsx
   <div className="features__grid reveal-group">
     {cards.map(...)}
   </div>
   ```

### Animation rules

- **Hero**: no scroll reveal — it is above the fold and visible on load
- **Navbar**: no animation — must always be immediately visible
- **Footer**: apply `reveal` to the root element only — no `reveal-group` stagger
- **CTA banner sections**: apply `reveal` only — the single call-to-action should appear as one unit
- **Card grids / feature lists**: apply `reveal-group` to the grid container so cards stagger in
- **Testimonial sections**: apply `reveal-group` if there are 2+ testimonial cards; otherwise `reveal`
- **Trust/logo strips**: apply `reveal` to the container — logos should appear together, not staggered

### What NOT to animate

- Do not add animations to inline elements (`<span>`, `<a>`, `<strong>`)
- Do not animate images independently — they animate with their parent card
- Do not use `animation` or `@keyframes` for scroll reveal — only the `transition` + class-toggle approach above
- Do not install any animation library (framer-motion, GSAP, AOS, etc.)

### Reduced-motion support

Add this rule immediately after the scroll reveal block in `globals.css`:

```css
@media (prefers-reduced-motion: reduce) {
  .reveal, .reveal-group > * {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
```

## Pre-build asset verification step

After generating all components and before running the build, verify every `/assets/` reference in the source files resolves to a real file in `public/`:

```bash
PROJECT_ROOT="<project-root>"
MISSING=0

# Collect all /assets/ references from TSX and CSS files
grep -roh '"/assets/[^"]*"' "$PROJECT_ROOT/src" 2>/dev/null | tr -d '"' > /tmp/_asset_refs.txt
grep -roh "'/assets/[^']*'" "$PROJECT_ROOT/src" 2>/dev/null | tr -d "'" >> /tmp/_asset_refs.txt
grep -roh "url(/assets/[^)]*)" "$PROJECT_ROOT/src" 2>/dev/null | \
  sed "s|url(||;s|)||;s|'||g;s|\"||g" >> /tmp/_asset_refs.txt
sort -u /tmp/_asset_refs.txt | grep -v '^$' > /tmp/_asset_refs_uniq.txt

echo "=== Asset references in source ==="
cat /tmp/_asset_refs_uniq.txt

echo ""
echo "=== Verification ==="
while IFS= read -r ref; do
  [ -z "$ref" ] && continue
  local_path="$PROJECT_ROOT/public$ref"
  if [ -f "$local_path" ]; then
    sz=$(wc -c < "$local_path" | tr -d ' ')
    echo "  OK      $ref  (${sz}b)"
  else
    echo "  MISSING $ref"
    MISSING=$((MISSING + 1))
  fi
done < /tmp/_asset_refs_uniq.txt

echo ""
[ "$MISSING" -gt 0 ] && echo "RESULT: $MISSING missing asset(s) — fix before building" || echo "RESULT: all assets present"
```

For each MISSING file, apply the first resolution that works:
1. **Wrong path**: Check if the file exists at a nearby path (e.g., `/assets/logos/` vs `/assets/images/`) — fix the component reference to match the real location.
2. **Not copied**: Check `docs/assets/` — if the file is there, re-run the asset pipeline step to copy it to `public/`.
3. **Not downloaded**: If it is a tool logo, run the Step 3 download script for that specific tool.
4. **Unavailable**: Replace the broken `src` with `iconSrc: null` and use the brand-colored letter fallback — never leave a broken image reference in the final code.

Do not proceed to the build step until the missing count is 0.

## Build verification step

After generating all component files and applying the animation layer, verify before reporting completion:

1. Run `npm run build` (or the equivalent build command for the project)
2. Fix any TypeScript type errors or missing import errors immediately
3. Fix any CSS property errors if reported
4. Confirm the build exits with `✓ built in Xms` or equivalent success message
5. Do not report the landing as complete until the build is clean

If the project has a `dev` script, confirm `npm run dev` also starts without errors before reporting done.