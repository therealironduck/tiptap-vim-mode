# Quickstart: Local Development Playground

## Prerequisites

- `bun` installed
- Dependencies installed in both the repo root and the playground:
  ```bash
  bun install
  cd playground && bun install
  ```

## Start the playground

From the **repo root**:

```bash
bun run playground
```

This starts the Vite dev server inside `playground/` and opens (or prints) the local URL (typically `http://localhost:5173`).

## What you'll see

A full-screen Tiptap editor with example content (headings, paragraphs, a bullet list). The vim-mode extension is active — try pressing `Escape` to enter Normal mode, then `i` to return to Insert mode.

## Hot reload

Edit any file under `src/` (the extension source). The browser updates automatically within a few seconds. No manual rebuild needed.

## Useful dev commands (from `playground/`)

| Command           | Purpose                                                        |
| ----------------- | -------------------------------------------------------------- |
| `bun run dev`     | Start Vite dev server (same as `bun run playground` from root) |
| `bun run build`   | Production build of the playground (not normally needed)       |
| `bun run preview` | Serve the production build locally                             |

## How the alias works

`playground/vite.config.ts` maps `@tiptap-vim-mode` → `../src/index.ts`. The playground imports the extension as:

```ts
import VimMode from "@tiptap-vim-mode";
```

Vite resolves this directly to the TypeScript source, bypassing the Rollup `dist/` output entirely.
