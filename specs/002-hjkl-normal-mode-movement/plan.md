# Implementation Plan: HJKL Normal Mode Movement

**Branch**: `002-hjkl-normal-mode-movement` | **Date**: 2026-05-02 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/002-hjkl-normal-mode-movement/spec.md`

## Summary

Add HJKL + arrow key cursor motions in Vim normal mode, using ProseMirror position arithmetic to move the cursor left/right by character within a block node and up/down by block/paragraph node. The implementation splits the current monolithic `src/index.ts` into a concern-based layout (`src/motions/hjkl.ts`) and wires motion handlers through a static key dispatch table inside the existing ProseMirror plugin. No new runtime dependencies are introduced. `README.md` is updated with the supported-motions table per the constitution.

## Technical Context

**Language/Version**: TypeScript (strict mode) — `typescript ^6.0.2`  
**Primary Dependencies**: `@tiptap/core ^3.21.0`, `@tiptap/pm ^3.21.0` (peer deps only — no new additions)  
**Storage**: N/A  
**Testing**: No framework — manual verification via `playground/` Vite app (`bun run playground`)  
**Target Platform**: ESM + CJS library; consumed in browser runtimes  
**Project Type**: Library  
**Performance Goals**: Key-to-cursor-move latency imperceptible to the user (single ProseMirror transaction per keypress)  
**Constraints**: Zero additional runtime dependencies; each source file ≤ ~200 lines of logic; all state in ProseMirror plugin state  
**Scale/Scope**: Single-user editor extension; no concurrency concerns

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle                       | Status             | Notes                                                                                                                                                                           |
| ------------------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| I. Minimal Dependencies         | PASS               | All navigation implemented with ProseMirror primitives (`ResolvedPos`, `TextSelection`). No new packages.                                                                       |
| II. Simplicity Over Abstraction | PASS               | Static key dispatch table (`Record<string, Motion>`) handles 8 keys. This is direct and solves the problem at hand. No strategy objects, registries, or event buses.            |
| III. Structured Modularity      | PASS               | `src/motions/hjkl.ts` introduced for concern separation. `src/index.ts` stays thin. No file will exceed ~200 lines.                                                             |
| IV. Vim Fidelity                | PASS (with action) | Motions follow standard Vim semantics. One deviation documented: `j`/`k` move by block/paragraph node (not visual line). `README.md` update required — planned in this feature. |
| V. Extension-First Design       | PASS               | All changes stay inside the existing ProseMirror `Plugin`. No DOM manipulation.                                                                                                 |

**Post-design re-check**: All gates remain PASS. The dispatch table in `index.ts` stays well under 200 lines and introduces no new abstraction layers.

## Project Structure

### Documentation (this feature)

```text
specs/002-hjkl-normal-mode-movement/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── public-api.md    # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks — not created here)
```

### Source Code (repository root)

```text
src/
├── index.ts             # Public API surface: VimMode, getVimMode, Mode (refactored to use dispatch)
└── motions/
    └── hjkl.ts          # Motion handlers: moveLeft, moveRight, moveDown, moveUp

README.md                # Updated: supported-motions table + deviation note for j/k
playground/src/main.ts   # Updated: navigation reference content
```

**Structure Decision**: Single-project layout. `src/motions/` is introduced as the first concern-based sub-directory per Constitution III. Future motions (`w`, `b`, `0`, `$`, operators) will follow the same pattern. All exports remain gated through `src/index.ts`.

## Complexity Tracking

No constitution violations — complexity tracking not required.
