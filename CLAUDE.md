# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Use `bun` as the package manager for all operations.

```bash
bun run build        # Clean and build (Rollup → dist/)
bun run dev          # Watch mode build
bun run lint         # Lint with oxlint
bun run lint:fix     # Auto-fix lint issues
bun run fmt          # Format with oxfmt
bun run fmt:check    # Check formatting (used in CI)
```

There is no test framework configured yet.

## Architecture

This is a [Tiptap](https://tiptap.dev/) editor extension that adds Vim keybinding support. It is in early development and not production-ready.

**Key relationships:**

- The extension is built on `@tiptap/core` (`Extension.create()`), which wraps ProseMirror under the hood
- `@tiptap/core` and `@tiptap/pm` are **peer dependencies** — consumers must install them
- Rollup builds to both ESM (`dist/index.js`) and CJS (`dist/index.cjs.js`) with TypeScript declarations

**Entry point:** `src/index.ts` — all extension logic lives here currently.

**Build output:** `dist/` (gitignored) — produced by `rollup -c` using `rollup.config.js`, which reads externals automatically from `package.json`.

## Conventions

- Conventional commits are enforced on PRs (see `.commit-me.json` for allowed types: `feat`, `fix`, `chore`, `docs`, `refactor`, `style`, `test`, `build`, `ci`, `perf`, `revert`)
- CI runs lint, format check, and build on every PR
