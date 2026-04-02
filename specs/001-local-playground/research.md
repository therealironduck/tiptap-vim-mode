# Research: Local Development Playground

**Feature**: 001-local-playground
**Date**: 2026-04-02

---

## Decision 1: HMR strategy — how to watch local extension source without a separate Rollup watcher

**Decision**: Use a Vite `resolve.alias` in `vite.config.ts` to point a module name (e.g., `@tiptap-vim-mode`) directly at the extension's TypeScript entry point (`../src/index.ts`). Vite processes and caches the aliased module itself, so any save to a file under `src/` triggers Vite's built-in HMR pipeline automatically.

**Rationale**: This is the canonical Vite pattern for in-repo development of libraries. It requires zero changes to the extension's own Rollup config, zero new processes, and zero manual steps. Vite's module graph tracks all transitive imports, so even internal helper files in `src/` that haven't been extracted yet will hot-reload correctly.

**Alternatives considered**:

- `bun run dev` (Rollup watch) in parallel with the Vite dev server: rejected because it requires two terminals, adds latency (Rollup write → Vite picks up dist file), and can race. Also defeats the spec requirement for a single command.
- `bun link` / `npm link` workspace symlink: rejected because it still compiles to `dist/` first and requires a separate watch process.
- Vite `optimizeDeps.exclude` + source alias: same as chosen approach; `exclude` is only needed if the aliased module is pre-bundled unnecessarily, which can be added if issues arise but is not required upfront.

---

## Decision 2: Tiptap dependency scope — where to install Tiptap in the playground

**Decision**: Install `@tiptap/core`, `@tiptap/pm`, and `@tiptap/starter-kit` as `devDependencies` in `playground/package.json` only, not in the root `package.json`. The root already lists them as `devDependencies` (for building the extension) and as `peerDependencies` (for consumers). The playground is its own private package and should own its deps.

**Rationale**: Keeps the root manifest clean. The playground is `"private": true` and never published. Installing in `playground/package.json` mirrors how a real consumer would set up their project, which makes the playground a realistic integration test.

**Alternatives considered**:

- Hoist Tiptap to root `devDependencies` and rely on bun's hoisting: works but conflates the extension's build-time deps with the playground's runtime deps, making the root manifest harder to read.
- Use bun workspaces with a shared `packages/tiptap` phantom package: over-engineered for a two-package repo.

---

## Decision 3: Tiptap editor instantiation — framework choice for the playground

**Decision**: Use Tiptap's vanilla JS API (`new Editor({ element, extensions, content })`) with no frontend framework. The playground's existing scaffold is already framework-free (plain TypeScript + Vite).

**Rationale**: Introducing Vue, React, or Svelte would require additional dependencies, a different tsconfig, and JSX/SFC transforms — none of which belong in a minimal integration harness. Tiptap's core API works perfectly well without a framework and is actually closer to how the extension internals behave (ProseMirror-first).

**Alternatives considered**:

- Vue 3 + `@tiptap/vue-3`: familiar to some developers but adds `vue` as a dep and changes the component model significantly.
- React + `@tiptap/react`: same objection; also requires JSX transform in Vite config.

---

## Decision 4: Example content format

**Decision**: Provide example content as a Tiptap HTML string passed to the `content` option at editor instantiation. Include: an `<h1>` title, an `<h2>` subtitle, two `<p>` paragraphs, and an `<ul>` with three `<li>` items.

**Rationale**: HTML strings are the simplest portable format — no JSON schema knowledge required, easy to edit, and Tiptap parses them natively. ProseMirror JSON would be more precise but harder to read and modify at a glance.

**Alternatives considered**:

- ProseMirror JSON document: more explicit about node types but verbose for a simple example.
- Markdown string + a markdown extension: adds another dependency; overkill for static content.

---

## Decision 5: Root convenience script

**Decision**: Add `"playground": "cd playground && bun run dev"` to the root `package.json` scripts. The developer runs `bun run playground` from the repo root and gets the Vite dev server.

**Rationale**: Satisfies the spec requirement (FR-005) for a single command from the project root. Simple shell cd is portable and has no bun-specific workspace overhead.

**Alternatives considered**:

- bun workspaces with `bun run --filter playground dev`: works but requires converting the repo to a workspace setup, which is a larger change than needed.
- A shell script `playground.sh`: unnecessary indirection for a one-liner.

---

## Resolved Clarifications

None — the spec contained no `[NEEDS CLARIFICATION]` markers. All decisions above were derived from the existing project conventions (Vite already in playground, bun as package manager, plain TypeScript, constitution rules).
