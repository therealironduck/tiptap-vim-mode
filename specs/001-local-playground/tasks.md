---
description: "Task list for Local Development Playground implementation"
---

# Tasks: Local Development Playground

**Input**: Design documents from `/specs/001-local-playground/`
**Prerequisites**: plan.md, spec.md, research.md, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)

## Path Conventions

Single project layout — playground lives at `playground/`, extension source at `src/`.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install dependencies and wire the playground to the local extension source.

- [x] T001 [P] Add Tiptap dependencies (`@tiptap/core`, `@tiptap/pm`, `@tiptap/starter-kit`) to `playground/package.json` and run `bun install` inside `playground/`
- [x] T002 [P] Add `"playground": "cd playground && bun run dev"` script to root `package.json`
- [x] T003 [P] Create `playground/vite.config.ts` with a `resolve.alias` mapping `@tiptap-vim-mode` → `../src/index.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Replace the Vite scaffold entry point with a bare-bones editor mount so all user stories have a working canvas to build on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T004 Replace `playground/src/main.ts` with a minimal Tiptap editor bootstrap: select the existing `#editor` element with `document.querySelector('#editor')`, instantiate `new Editor({ element, extensions: [StarterKit, VimMode], content: '' })`, import `VimMode` from `@tiptap-vim-mode`
- [x] T005 [P] Replace `playground/src/style.css` with full-screen editor styles: `html, body { margin: 0; height: 100%; }`, `#editor { width: 100vw; height: 100vh; overflow-y: auto; }`
- [x] T006 [P] Update `playground/index.html`: set title to `tiptap-vim-mode playground`, replace scaffold body content with `<div id="editor"></div>` as the sole body child (the static element that `main.ts` selects)

**Checkpoint**: `bun run playground` starts successfully and renders a blank, full-screen editor with no scaffold UI remaining.

---

## Phase 3: User Story 1 — Open Playground and See Working Editor (Priority: P1) 🎯 MVP

**Goal**: Developer opens the playground and immediately sees a full-screen editor with example content, the vim-mode extension active, and a mode indicator reflecting the current mode.

**Independent Test**: Run `bun run playground`, open the browser, confirm the editor fills the viewport, example content is visible, and the mode indicator shows `-- NORMAL --` on load.

### Implementation for User Story 1

- [x] T007 [US1] Add example content string (heading, two paragraphs, bullet list) as the `content` option in `playground/src/main.ts`
- [x] T008 [P] [US1] Create `playground/src/mode-indicator.ts`: a helper that reads current vim mode from editor state and returns the display string (`-- NORMAL --`, `-- INSERT --`, etc.)
- [x] T009 [US1] Add a `<div id="mode-indicator">` element to `playground/index.html` (positioned fixed, bottom-left) and wire it to the `mode-indicator.ts` helper via an editor `onTransaction` callback in `playground/src/main.ts`
- [x] T010 [US1] Add mode indicator styles to `playground/src/style.css`: fixed positioning, monospace font, visible against both light and dark backgrounds

**Checkpoint**: User Story 1 fully functional — full-screen editor with example content, mode indicator updates on `Escape` / `i` keypresses.

---

## Phase 4: User Story 2 — Live Reload on Extension Code Change (Priority: P2)

**Goal**: Saving a change to any file under `src/` causes the playground browser tab to update automatically within 5 seconds, without a manual command.

**Independent Test**: Change a behavior in `src/index.ts` (e.g., add a `console.log`), save, and observe the browser update within 5 seconds — no manual reload needed.

### Implementation for User Story 2

- [x] T011 [US2] Verify the Vite alias in `playground/vite.config.ts` resolves `@tiptap-vim-mode` to the TypeScript source (not `dist/`) by checking the Vite module graph in the browser DevTools Network panel after startup
- [x] T012 [US2] Add `optimizeDeps: { exclude: ['@tiptap-vim-mode'] }` to `playground/vite.config.ts` to prevent Vite from pre-bundling the local extension, ensuring HMR picks up source changes immediately
- [x] T013 [US2] Smoke-test HMR end-to-end: add a temporary `console.log('HMR works')` to `src/index.ts`, save, confirm browser console updates within 5 seconds without a full reload (per SC-002), then remove the log

**Checkpoint**: User Story 2 fully functional — any `src/` change hot-reloads in the browser automatically.

---

## Phase 5: User Story 3 — Example Content Provides Meaningful Context (Priority: P3)

**Goal**: The pre-loaded content covers enough node types (headings, paragraphs, lists) that the developer can exercise vim navigation across varied structures without adding content manually.

**Independent Test**: Load the playground and verify that `j`/`k` navigation moves through at least 3 distinct content types in Normal mode.

### Implementation for User Story 3

- [x] T014 [US3] Expand the example content in `playground/src/main.ts` to include: one `<h1>`, one `<h2>`, two `<p>` paragraphs with multi-word sentences, and a `<ul>` with at least 3 `<li>` items — ensuring enough lines exist to exercise `j`/`k`/`w`/`b` motions meaningfully

**Checkpoint**: User Story 3 fully functional — developer can navigate through varied content types using vim motions immediately on load.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final integration validation and documentation.

- [x] T015 [P] Verify `bun run playground` succeeds from a cold start (no `dist/` present, no prior playground node_modules) — confirm FR-007 compliance
- [x] T016 [P] Verify the error overlay is visible when a syntax error is introduced to `src/index.ts` and the dev server continues running — confirm FR-006 compliance
- [x] T017 Follow the steps in `specs/001-local-playground/quickstart.md` from a fresh terminal and confirm all steps complete successfully

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 completion — BLOCKS all user stories
- **User Stories (Phases 3–5)**: All depend on Foundational completion; can proceed sequentially P1 → P2 → P3
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Depends on Foundational — no dependency on US2 or US3
- **User Story 2 (P2)**: Depends on Foundational — HMR config is independent of US1 content
- **User Story 3 (P3)**: Depends on US1 T007 (content field must exist to expand)

### Within Each User Story

- T008 and T009 in US1 are ordered: helper before wiring
- T011 must precede T012 (verify before optimizing)
- Models before services rule: N/A (no data models in this feature)

### Parallel Opportunities

- T001, T002, T003 (Phase 1) can all run in parallel
- T005, T006 (Phase 2) can run in parallel after T004
- T008 (US1 mode indicator helper) is marked [P] and can be authored while T007 is being tested
- T015, T016 (Polish) can run in parallel

---

## Parallel Example: Phase 1

```bash
# All three setup tasks can run simultaneously:
Task T001: Add Tiptap deps to playground/package.json + bun install
Task T002: Add playground script to root package.json
Task T003: Create playground/vite.config.ts with alias
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001–T003)
2. Complete Phase 2: Foundational (T004–T006)
3. Complete Phase 3: User Story 1 (T007–T010)
4. **STOP and VALIDATE**: Full-screen editor + example content + mode indicator all working
5. Proceed to US2 and US3 for HMR and content polish

### Incremental Delivery

1. Setup + Foundational → blank full-screen editor boots
2. US1 → editor with content and mode indicator (MVP)
3. US2 → HMR confirmed working end-to-end
4. US3 → rich example content for thorough vim testing
5. Polish → cold-start and error-overlay validation

---

## Notes

- [P] tasks = different files, no blocking dependencies between them
- [Story] label maps each task to a specific user story for traceability
- No test framework configured — verification is manual via browser
- No `dist/` pre-build required; Vite alias resolves TypeScript source directly
- Commit after each checkpoint to keep progress recoverable
