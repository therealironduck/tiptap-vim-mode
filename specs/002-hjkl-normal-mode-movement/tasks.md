# Tasks: HJKL Normal Mode Movement

**Input**: Design documents from `/specs/002-hjkl-normal-mode-movement/`  
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/ ✓

**Tests**: No test framework configured — manual verification via `playground/` (per constitution).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the `src/motions/` concern directory and define the `Motion` type and empty dispatch table. No production behavior changes in this phase.

- [x] T001 Create `src/motions/hjkl.ts` with: `Motion` type alias (`(view: EditorView) => boolean`), four stub functions (`moveLeft`, `moveRight`, `moveDown`, `moveUp` — each immediately returning `true`), and an exported `hjklMotions` constant typed as `Record<string, Motion>` with all eight key entries wired to their stubs (`"h"`, `"ArrowLeft"`, `"l"`, `"ArrowRight"`, `"j"`, `"ArrowDown"`, `"k"`, `"ArrowUp"`)

**Checkpoint**: `src/motions/hjkl.ts` compiles cleanly; `bun run build` passes.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Refactor `src/index.ts` to use the dispatch table. This replaces the current blanket NORMAL-mode block with a key-lookup pattern. **Must be complete before any motion can be tested.**

**⚠️ CRITICAL**: No motion work can be verified until this phase is complete.

- [x] T002 Refactor `src/index.ts` — in `handleKeyDown`, after the Escape and `i` key checks, replace the `if (mode === "NORMAL") { return true; }` catch-all with: import `hjklMotions` from `./motions/hjkl`, look up `event.key` in `hjklMotions`, and if a handler is found call it and return its result; keep the final catch-all `return true` to block all other normal-mode keys

**Checkpoint**: `bun run build` passes. Pressing `h`/`j`/`k`/`l` in normal mode no longer types characters (stubs intercept them), but cursor does not move yet.

---

## Phase 3: User Story 1 — Horizontal Character Movement (Priority: P1) 🎯 MVP

**Goal**: `h`/`ArrowLeft` and `l`/`ArrowRight` move the cursor exactly one character left or right within the current block node, with correct boundary handling.

**Independent Test**: Enter normal mode in playground, press `h`/`l`/`←`/`→`, verify cursor moves one character per press; verify no movement at block boundaries; verify HJKL types characters in insert mode.

### Implementation for User Story 1

- [x] T003 [US1] Implement `moveLeft(view)` in `src/motions/hjkl.ts` — resolve `state.selection.$anchor`; if `$anchor.pos > $anchor.start()` dispatch `TextSelection.create(doc, $anchor.pos - 1)`; return `true` in all cases (boundary no-op still consumes the key)
- [x] T004 [US1] Implement `moveRight(view)` in `src/motions/hjkl.ts` — resolve `state.selection.$anchor`; if `$anchor.pos < $anchor.end() - 1` dispatch `TextSelection.create(doc, $anchor.pos + 1)`; return `true` in all cases; note: `$anchor.end()` is the position after the last character token, so `end() - 1` is the last valid cursor position
- [x] T005 [US1] Verify `hjklMotions` in `src/motions/hjkl.ts` maps `"h"` and `"ArrowLeft"` to `moveLeft`, and `"l"` and `"ArrowRight"` to `moveRight` (update from stubs to real functions)

**Checkpoint**: In playground normal mode, `h`/`←` and `l`/`→` move the cursor one character per press. Cursor does not wrap at line boundaries. Empty blocks: `h`/`l` do nothing. Insert mode: keys type characters normally.

---

## Phase 4: User Story 2 — Vertical Line Movement (Priority: P2)

**Goal**: `j`/`ArrowDown` and `k`/`ArrowUp` move the cursor to the same column in the next/previous block/paragraph node, with column clamping and correct boundary handling.

**Independent Test**: Enter normal mode in a multi-paragraph playground document, press `j`/`k`/`↑`/`↓`, verify cursor jumps between block nodes; verify column clamping on shorter blocks; verify no movement at first/last block.

### Implementation for User Story 2

- [x] T006 [US2] Implement `moveDown(view)` in `src/motions/hjkl.ts`:
  1. Resolve `$anchor = state.selection.$anchor`
  2. Compute `col = $anchor.pos - $anchor.start()` (0-based column within current block)
  3. Get `afterCurrentBlock = $anchor.after(1)` — position immediately after the depth-1 ancestor's closing token
  4. If `afterCurrentBlock >= doc.content.size` return `true` (no-op: already at last block)
  5. Resolve `$next = doc.resolve(afterCurrentBlock + 1)` — enters the next block
  6. Compute `destSize = $next.node().content.size`; `destCol = destSize === 0 ? 0 : Math.min(col, destSize - 1)`
  7. Dispatch `TextSelection.create(doc, $next.start() + destCol)`; return `true`
- [x] T007 [US2] Implement `moveUp(view)` in `src/motions/hjkl.ts`:
  1. Resolve `$anchor = state.selection.$anchor`
  2. Compute `col = $anchor.pos - $anchor.start()`
  3. Get `beforeCurrentBlock = $anchor.before(1)` — position immediately before the depth-1 ancestor's opening token
  4. If `beforeCurrentBlock <= 0` return `true` (no-op: already at first block)
  5. Resolve `$prev = doc.resolve(beforeCurrentBlock - 1)` — enters the previous block
  6. Compute `destSize = $prev.node().content.size`; `destCol = destSize === 0 ? 0 : Math.min(col, destSize - 1)`
  7. Dispatch `TextSelection.create(doc, $prev.start() + destCol)`; return `true`
- [x] T008 [US2] Verify `hjklMotions` in `src/motions/hjkl.ts` maps `"j"` and `"ArrowDown"` to `moveDown`, and `"k"` and `"ArrowUp"` to `moveUp` (update from stubs to real functions)

**Checkpoint**: In playground normal mode, `j`/`↓` and `k`/`↑` move between paragraphs. Column is preserved or clamped. No movement at document edges. Soft-wrapped paragraphs are skipped as a single unit.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: README update (required by constitution IV in same PR), playground content update, and final CI gate verification.

- [x] T009 [P] Update `README.md` — add a "Supported Motions" section with a table listing all 8 key bindings (h/j/k/l + arrow equivalents), their behavior, and an explicit deviation note: "`j`/`k` move by block/paragraph node, not by visual screen row (use `gj`/`gk` for visual-line movement — not yet implemented)"
- [x] T010 [P] Update `playground/src/main.ts` — revise `exampleContent` to list all supported HJKL motions and arrow key equivalents in the navigation reference, replacing the "More motions coming soon" placeholder
- [x] T011 Run `bun run lint && bun run fmt:check && bun run build` from repo root and fix any lint, format, or compilation errors in `src/index.ts` and `src/motions/hjkl.ts`
- [ ] T012 Manual verification in playground (`bun run playground`) — test all 8 acceptance scenarios from spec.md: horizontal movement, vertical movement, boundary no-ops, empty block no-ops, insert-mode passthrough, soft-wrap skip

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on T001 — blocks all story verification
- **User Story 1 (Phase 3)**: Depends on T002 — T003 → T004 → T005 (sequential, same file)
- **User Story 2 (Phase 4)**: Depends on T005 completion (US1 wiring done) — T006 → T007 → T008 (sequential, same file)
- **Polish (Phase 5)**: Depends on T008 — T009 and T010 can run in parallel with each other

### User Story Dependencies

- **US1 (P1)**: Starts after Phase 2 — no dependency on US2
- **US2 (P2)**: Starts after US1 motion wiring (T005) since both stories modify `src/motions/hjkl.ts`

### Parallel Opportunities

- T009 and T010 (Polish) can run in parallel — different files (`README.md` vs `playground/src/main.ts`)
- T003 and T004 are logically independent functions but are in the same file — implement sequentially to avoid conflicts

---

## Parallel Example: Polish Phase

```bash
# T009 and T010 can be launched together:
Task: "Update README.md with supported-motions table"
Task: "Update playground/src/main.ts navigation reference content"
```

---

## Implementation Strategy

### MVP (User Story 1 Only)

1. Complete Phase 1: Setup (T001)
2. Complete Phase 2: Foundational (T002)
3. Complete Phase 3: User Story 1 (T003–T005)
4. **STOP and VALIDATE**: `h`/`l`/`←`/`→` work in normal mode
5. Polish T009 + T010 + T011 + T012 — required for any merge per constitution IV

### Full Delivery

1. T001 → T002 → T003 → T004 → T005 → **US1 checkpoint**
2. T006 → T007 → T008 → **US2 checkpoint**
3. T009 ‖ T010 → T011 → T012 → **ready to merge**

---

## Notes

- `$anchor.after(1)` and `$anchor.before(1)` navigate at depth 1 (top-level block nodes, direct children of the document). If the cursor is inside a nested structure (e.g., a list item), the motion will jump by the outermost block. This is acceptable for the current scope.
- `TextSelection.create` from `@tiptap/pm/state` handles collapsed selections (cursor, not range). Import as: `import { TextSelection } from "@tiptap/pm/state"`.
- `EditorView` import for the `Motion` type: `import type { EditorView } from "@tiptap/pm/view"`.
- All imports must be from `@tiptap/pm/*` (peer dep), never from `prosemirror-*` directly.
- Constitution IV: `README.md` update (T009) is **mandatory in the same PR** as the motion implementation.
