---
name: create-landing
description: Full pipeline orchestrator. Extracts brand from a URL, initializes a React project, and generates the landing page — in one command with automatic retry on failure.
argument-hint: "[url] [project-name]"
disable-model-invocation: true
allowed-tools: Bash, Read, Write, Edit, MultiEdit, Glob, Grep, WebFetch, WebSearch, Agent
---

# create-landing

Run the full landing page creation pipeline from a single command.

```
/create-landing https://stripe.com mi-proyecto
```

## Fixed paths

- Projects root: `/Users/fabianmartinezhoyos/repos`
- Skills root: `/Users/fabianmartinezhoyos/.claude/skills`
- Pipeline state: `<project-root>/docs/pipeline-state.json`

## Arguments

1. **First argument:** source URL to extract brand from
2. **Second argument:** project name (becomes the folder inside repos/)

If either argument is missing, ask for it before doing anything else.

## Retry rules

Every stage supports up to **2 retry attempts** before stopping.

After each stage attempt:
1. Run the validation block for that stage
2. If all validations pass → mark stage `done` in pipeline-state.json, proceed to next stage
3. If any validation fails → log the failure to pipeline-state.json, increment attempt count, retry the stage from the beginning
4. If attempt count reaches 2 with no success → stop immediately, report: which stage failed, which validation failed, and the last error message

**On retry**, re-read the stage's SKILL.md and re-execute all its steps from the top. Do not skip steps inside a stage.

## Pipeline state

At startup, check if `<project-root>/docs/pipeline-state.json` exists.

- If it does not exist → start from Stage 0 (pre-setup)
- If it exists, read the `stages` object:
  - Stage marked `done` → skip it, proceed to the next
  - Stage marked `failed` with `attempts >= 2` → stop, report the stored error, tell the user to fix it manually and delete the stage entry to retry
  - Stage marked `in_progress` or missing → run it

pipeline-state.json shape:
```json
{
  "url": "<provided-url>",
  "project": "<project-name>",
  "projectRoot": "/Users/fabianmartinezhoyos/repos/<project-name>",
  "stages": {
    "extraction": { "status": "done|failed|in_progress", "attempts": 0, "error": "" },
    "init":       { "status": "done|failed|in_progress", "attempts": 0, "error": "" },
    "build":      { "status": "done|failed|in_progress", "attempts": 0, "error": "" }
  }
}
```

Write this file after every stage attempt (pass or fail).

---

## Stage 0 — Pre-setup (no retry needed)

1. Resolve the project root:
   ```
   PROJECT_ROOT=/Users/fabianmartinezhoyos/repos/<project-name>
   ```
2. Create required directories:
   ```bash
   mkdir -p "$PROJECT_ROOT/docs/assets/images"
   mkdir -p "$PROJECT_ROOT/docs/assets/backgrounds"
   mkdir -p "$PROJECT_ROOT/docs/assets/logos"
   mkdir -p "$PROJECT_ROOT/docs/screenshots"
   ```
3. Write the initial `pipeline-state.json` if it does not already exist.
4. Print:
   ```
   Pipeline iniciado
   URL:     <url>
   Proyecto: <project-root>
   ```

---

## Stage 1 — Brand extraction

Mark stage `in_progress` in pipeline-state.json.

Read and execute all instructions in:
`/Users/fabianmartinezhoyos/.claude/skills/extract-brand-spec/SKILL.md`

**Critical override:** all `docs/` paths in that skill refer to `<project-root>/docs/`. Do not write to the current working directory.

After execution, run the validation block below. If validation fails, retry.

### Stage 1 validation

Run each check. If any fails, record the failure message and retry the stage:

```bash
# 1. builder-brief exists and has content
[ -s "$PROJECT_ROOT/docs/builder-brief.md" ] || echo "FAIL: builder-brief.md missing or empty"

# 2. globals-template.css exists and has content
[ -s "$PROJECT_ROOT/docs/globals-template.css" ] || echo "FAIL: globals-template.css missing or empty"

# 3. design-tokens.json is valid JSON
python3 -m json.tool "$PROJECT_ROOT/docs/design-tokens.json" > /dev/null 2>&1 || echo "FAIL: design-tokens.json invalid or missing"

# 4. computed-styles.json exists (Playwright ran successfully)
[ -f "$PROJECT_ROOT/docs/computed-styles.json" ] || echo "FAIL: computed-styles.json missing — Playwright capture failed"

# 5. At least one screenshot was captured
ls "$PROJECT_ROOT/docs/screenshots/"*.png > /dev/null 2>&1 || echo "FAIL: no screenshots captured"
```

If all 5 pass → mark stage `done`.
If any fail → log the failing check, increment attempts, retry.
If computed-styles.json is the only failure after 2 attempts → mark it as a warning (not fatal), proceed anyway. Screenshots are required.

---

## Stage 2 — Project init

Mark stage `in_progress` in pipeline-state.json.

Read and execute all instructions in:
`/Users/fabianmartinezhoyos/.claude/skills/init-project/SKILL.md`

Use `<project-name>` as the project name argument. The project must be created at:
`/Users/fabianmartinezhoyos/repos/<project-name>`

After execution, run the validation block below. If validation fails, retry.

### Stage 2 validation

```bash
# 1. package.json exists
[ -f "$PROJECT_ROOT/package.json" ] || echo "FAIL: package.json missing"

# 2. src/pages/Home.tsx exists
[ -f "$PROJECT_ROOT/src/pages/Home.tsx" ] || echo "FAIL: Home.tsx missing"

# 3. src/App.tsx exists
[ -f "$PROJECT_ROOT/src/App.tsx" ] || echo "FAIL: App.tsx missing"

# 4. src/main.tsx exists
[ -f "$PROJECT_ROOT/src/main.tsx" ] || echo "FAIL: main.tsx missing"

# 5. src/styles/globals.css exists
[ -f "$PROJECT_ROOT/src/styles/globals.css" ] || echo "FAIL: globals.css missing"

# 6. Required folder structure
[ -d "$PROJECT_ROOT/src/components/sections" ] || echo "FAIL: sections/ folder missing"
[ -d "$PROJECT_ROOT/src/components/ui" ] || echo "FAIL: ui/ folder missing"
[ -d "$PROJECT_ROOT/src/lib" ] || echo "FAIL: lib/ folder missing"

# 7. node_modules installed
[ -d "$PROJECT_ROOT/node_modules" ] || echo "FAIL: node_modules missing — npm install may have failed"
```

If all pass → mark stage `done`.
If any fail → log the failing check, increment attempts, retry.

---

## Stage 3 — Landing build

Mark stage `in_progress` in pipeline-state.json.

Read and execute all instructions in:
`/Users/fabianmartinezhoyos/.claude/skills/landing-ui-builder/SKILL.md`

Use `<project-name>` as the project argument. The builder reads its source material from `<project-root>/docs/`.

After execution, run the validation block below. If validation fails, retry.

### Stage 3 validation

```bash
# 1. At least 3 section components were generated
SECTION_COUNT=$(ls "$PROJECT_ROOT/src/components/sections/"*.tsx 2>/dev/null | wc -l)
[ "$SECTION_COUNT" -ge 3 ] || echo "FAIL: only $SECTION_COUNT section(s) generated — expected at least 3"

# 2. globals.css was populated (not the blank placeholder)
GLOBALS_LINES=$(wc -l < "$PROJECT_ROOT/src/styles/globals.css")
[ "$GLOBALS_LINES" -gt 20 ] || echo "FAIL: globals.css has only $GLOBALS_LINES lines — likely not populated"

# 3. Home.tsx imports at least 2 sections
IMPORT_COUNT=$(grep -c "^import" "$PROJECT_ROOT/src/pages/Home.tsx" 2>/dev/null || echo 0)
[ "$IMPORT_COUNT" -ge 2 ] || echo "FAIL: Home.tsx has only $IMPORT_COUNT imports"

# 4. Build passes
cd "$PROJECT_ROOT" && npm run build > /tmp/create-landing-build.log 2>&1
BUILD_EXIT=$?
[ "$BUILD_EXIT" -eq 0 ] || echo "FAIL: npm run build failed — see /tmp/create-landing-build.log"

# 5. dist/ was produced
[ -d "$PROJECT_ROOT/dist" ] || echo "FAIL: dist/ folder missing after build"
```

If all pass → mark stage `done`.
If build fails (check 4) → read /tmp/create-landing-build.log, fix the TypeScript/CSS errors directly in the affected files, then re-run validation (counts as the same attempt, not a new retry).
If still failing after fix → log and retry the full stage.

---

## Final report

After all stages complete successfully:

```
Pipeline completado
──────────────────────────────
URL analizada:   <url>
Proyecto:        <project-root>
Secciones:       <list of .tsx files in src/components/sections/>
Build:           limpio

Stages:
  ✓ Extracción    (<attempts> intento(s))
  ✓ Init          (<attempts> intento(s))
  ✓ Build         (<attempts> intento(s))

Siguiente paso:
  cd <project-root> && npm run dev
```

If the pipeline stopped due to a failed stage:

```
Pipeline detenido en Stage <N> — <stage-name>
──────────────────────────────
Validación fallida: <check that failed>
Error: <error message>
Intentos realizados: 2/2

Para reintentar desde este punto:
  Elimina el campo "<stage>" de docs/pipeline-state.json y corre /create-landing de nuevo.
```
