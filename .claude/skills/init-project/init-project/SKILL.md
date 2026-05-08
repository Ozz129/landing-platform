---
name: init-project
description: Initialize a clean React landing project scaffold inside /workspace/projects. Use this when a new base landing project needs to be created before generating content or sections.
argument-hint: "[project-name]"
disable-model-invocation: true
allowed-tools: Bash, Read, Write, Edit, MultiEdit, Glob, Grep
---

# Init Project

Initialize a clean React landing project inside `/workspace/projects`.

## Goal
- Create a new React + TypeScript landing project scaffold.
- All generated projects must live inside `/workspace/projects/`.
- Do not create projects at the workspace root.
- Do not create nested projects inside another generated project.

## Fixed root path
Use this absolute path as the only valid destination root:

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
8. Create a clean base structure oriented to future landing generation.

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
- `src/pages/Home.tsx`
- `src/App.tsx`
- `src/main.tsx`
- `src/styles/globals.css`

## Requirements
- Keep the app minimal and clean
- No final landing content yet
- No marketing copy yet
- Minimal placeholder page only
- Ensure the project is ready for the landing generation skill

## Path safety rules
- Always resolve the destination as:
  `/workspace/projects/<project-name>`
- Never use a relative path as the destination.
- Never create a project inside the current folder unless the current folder is exactly `/workspace/projects`.
- If the current working directory is already inside another generated project, still create the new project at the fixed absolute root.

## Output expectations
- A working React + TypeScript project inside `/workspace/projects/<project-name>`
- Brief summary of:
  - project path created
  - files created
  - files modified
  - commands run
  - anything relevant for the next landing-generation step