---
name: extract-brand-spec
description: Analyze a public website and generate a high-fidelity extraction package with content, styles, images, screenshots, computed CSS, and visual references for landing-ui-builder.
argument-hint: "[url]"
disable-model-invocation: true
allowed-tools: Bash, Read, Write, Edit, MultiEdit, Glob, Grep, WebFetch, WebSearch, Agent
---

# extract-brand-spec

Analyze the provided website and generate a high-fidelity extraction package intended to help `landing-ui-builder` recreate a landing page that is as visually close as practical to the original reference.

This skill is portable and must run inside the Docker workspace.

## Portable paths

- Workspace root: `/workspace`
- Skills root: `/workspace/.claude/skills`
- Capture script: `.claude/skills/extract-brand-spec/capture.js`
- Output folder: `docs/`

Do not use:
- `/Users/fabianmartinezhoyos/...`
- `~/.claude/...`
- `~/.npm/...`

## Primary goal

Produce a package that helps `landing-ui-builder` recreate a landing page that feels as close as practical to the source website in:

- hero composition
- section rhythm
- palette
- backgrounds
- imagery
- button styling
- card styling
- badges
- borders
- shadows
- logo/trust strips
- layout density
- CTA emphasis
- overall tone and finish

## Scope

Always analyze:

1. the homepage
2. up to 2 additional highly relevant internal pages if needed to improve visual fidelity

Prefer pages that improve understanding of:

- hero patterns
- product or offer cards
- trust sections
- pricing or enrollment patterns
- visual CTA patterns
- section backgrounds
- image usage

Do not crawl the full site.
Do not waste effort on legal pages, blog archives, or irrelevant support pages.

## Output directories

Create these directories if they do not exist:

- `docs/`
- `docs/assets/`
- `docs/assets/images/`
- `docs/assets/backgrounds/`
- `docs/assets/logos/`
- `docs/assets/references/`
- `docs/screenshots/`

Use:

```bash
mkdir -p docs/assets/images
mkdir -p docs/assets/backgrounds
mkdir -p docs/assets/logos
mkdir -p docs/assets/references
mkdir -p docs/screenshots
