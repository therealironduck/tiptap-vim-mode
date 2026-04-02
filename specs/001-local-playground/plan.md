# Implementation Plan: Local Development Playground

**Branch**: `001-local-playground` | **Date**: 2026-04-02 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-local-playground/spec.md`

## Summary

Replace the default Vite scaffold in `playground/` with a minimal full-screen Tiptap editor that loads the local vim-mode extension directly from `src/` via a Vite path alias — giving the developer instant HMR feedback on extension changes without any manual compilation step. A root-level `bun run playground` script ties it together.

## Technical Context

**Language/Version**: TypeScript (strict mode, ESNext target)
**Primary Dependencies**: Vite (playground dev server + HMR), Tiptap (`@tiptap/core`, `@tiptap/pm`, `@tiptap/starter-kit`), local vim-mode extension via Vite alias
**Storage**: N/A — playground holds no persistent state
**Testing**: Manual verification in browser (no automated test framework yet)
**Target Platform**: Desktop browser (localhost dev server)
**Project Type**: Development playground (internal tooling, not published)
**Performance Goals**: HMR update reflected in browser within 5 seconds of save
**Constraints**: Zero changes to the main extension build (Rollup); playground uses Vite only; no new runtime dependencies added to the extension itself
**Scale/Scope**: Single developer, local machine only

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle                       | Status | Notes                                                                                      |
| ------------------------------- | ------ | ------------------------------------------------------------------------------------------ |
| I. Minimal Dependencies         | PASS   | Playground is dev-only; Tiptap peer deps already present; no new runtime deps on extension |
| II. Simplicity Over Abstraction | PASS   | Playground is a single entry point with no extra abstractions                              |
| III. Structured Modularity      | PASS   | Playground lives in `playground/`, extension source stays in `src/`                        |
| IV. Vim Fidelity                | PASS   | Playground is the manual verification harness called out in the constitution               |
| V. Extension-First Design       | PASS   | No changes to extension internals; playground is purely a consumer                         |

All gates pass. No complexity violations.

## Project Structure

### Documentation (this feature)

```text
specs/001-local-playground/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
playground/
├── index.html                 # Entry HTML (update title)
├── package.json               # Add @tiptap/core, @tiptap/pm, @tiptap/starter-kit deps
├── tsconfig.json              # Existing (no changes needed)
├── vite.config.ts             # NEW: Vite config with alias for local extension source
└── src/
    ├── main.ts                # Replace scaffold with Tiptap editor bootstrap
    └── style.css              # Replace scaffold styles with full-screen editor styles

src/                           # Extension source (read-only from playground perspective)
└── index.ts                   # Imported by playground via Vite alias

package.json                   # Root: add "playground" script
```

**Structure Decision**: Single project (Option 1). The playground is a subdirectory consuming the extension source via a Vite alias — no monorepo workspace setup required. The alias (`@tiptap-vim-mode` → `../src/index.ts`) is resolved at Vite dev-server time, so HMR works automatically on any `src/` change.

## Complexity Tracking

> No violations to document.
