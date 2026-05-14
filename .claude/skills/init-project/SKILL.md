---
name: init-project
description: Initialize a clean React landing project scaffold inside the shared workspace projects folder. Use this when a new base landing project needs to be created before generating content or sections.
argument-hint: "[project-name]"
disable-model-invocation: true
allowed-tools: Bash, Read, Write, Edit, MultiEdit, Glob, Grep
---

# Init Project

Initialize a clean React landing project inside the portable workspace projects directory.

## Goal
- Create a new React + TypeScript landing project scaffold.
- All generated projects must live inside `/workspace/projects/`.
- Do not create projects at the workspace root.
- Do not create nested projects inside another generated project.

## Fixed root path

Use this portable container path as the only valid destination root:

`/workspace/projects`

## Execution rules

1. Inspect the workspace first.
2. Ensure `/workspace/projects` exists. Create it if missing.
3. Ask for or infer the project name.
4. Create the new app only inside:
   `/workspace/projects/<project-name>`
5. Never create a project relative to the current working directory if that would place it inside another project.
6. If `/workspace/projects/<project-name>` already exists, do not overwrite important files blindly.
7. Prefer Vite + React + TypeScript unless the workspace already follows another convention.
8. After scaffolding, run `npm install` inside the project directory. This is required — do not skip it.
9. Create a clean base structure oriented to future landing generation.

## Required structure inside the new project

- `src/`
- `src/components/`
- `src/components/sections/`
- `src/components/ui/`
- `src/pages/`
- `src/assets/`
- `src/styles/`
- `src/lib/`

## Base files to create or update

- `vite.config.ts`
- `src/pages/Home.tsx`
- `src/App.tsx`
- `src/main.tsx`
- `src/styles/globals.css`

## Required vite.config.ts content

Always write this exact `vite.config.ts`. The `server.host: '0.0.0.0'` is required for the dev server to be accessible outside the Docker container:

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
})
```

Do not omit `host: '0.0.0.0'`. Without it, `npm run dev` only listens on localhost inside the container and is unreachable from the host machine.

## npm install requirement

After the Vite scaffold is created, run:

```bash
cd /workspace/projects/<project-name> && npm install
```

This must complete successfully before the skill reports done. The `create-landing` pipeline validates that `node_modules/` exists — if `npm install` was not run, the pipeline fails at Stage 2 validation.

## Required placeholder file content

Write these exact files. `landing-ui-builder` will overwrite them — the only requirement is that they compile cleanly.

**`src/styles/globals.css`** — empty shell that the builder populates:
```css
/* populated by landing-ui-builder */
```

**`src/pages/Home.tsx`** — blank page that imports globals and renders nothing yet:
```tsx
import '../styles/globals.css'

export default function Home() {
  return <></>
}
```

**`src/App.tsx`** — routes straight to Home:
```tsx
import Home from './pages/Home'

export default function App() {
  return <Home />
}
```

**`src/main.tsx`** — standard Vite entry point:
```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
```

## Requirements

- Keep the app minimal and clean
- No final landing content yet
- No marketing copy yet
- Placeholder files must compile without errors
- Ensure the project is ready for the landing generation skill

## Path safety rules

- Always resolve the destination as:
  `/workspace/projects/<project-name>`
- Never use a relative path as the destination.
- Never create a project inside the current folder unless the current folder is exactly `/workspace/projects`.
- If the current working directory is already inside another generated project, still create the new project at the fixed portable root.

## Output expectations

- A working React + TypeScript project inside `/workspace/projects/<project-name>`
- Brief summary of:
  - project path created
  - files created
  - files modified
  - commands run
  - anything relevant for the next landing-generation step