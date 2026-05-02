# Research: HJKL Normal Mode Movement

**Feature**: 002-hjkl-normal-mode-movement  
**Date**: 2026-05-02

## Decision 1: ProseMirror Position Navigation for h/l (horizontal)

**Decision**: Use `ResolvedPos.pos` arithmetic bounded by `$pos.start()` / `$pos.end()` of the innermost block node, then create a `TextSelection` at the new position.

**Rationale**: ProseMirror exposes `state.selection.$anchor` which carries the current resolved position. `$anchor.start(depth)` returns the start position of the node at the given depth, and `$anchor.end(depth)` returns the end. For a cursor inside a paragraph, `depth = $anchor.depth` gives the paragraph's content bounds. Moving `pos - 1` or `pos + 1` within those bounds is safe and correct without any external helpers.

**Key API**: `TextSelection.create(doc, pos)`, `doc.resolve(pos)`, `$pos.start()`, `$pos.end()`, `$pos.depth`.

**Alternatives considered**:

- `prosemirror-commands` `moveLeft`/`moveRight` — these work but wrap across line boundaries in some cases and are not pure horizontal motion. Rejected: wrong semantics and would add an indirect dependency.
- Manual DOM cursor APIs — rejected per Constitution V (no DOM manipulation).

---

## Decision 2: ProseMirror Position Navigation for j/k (vertical / block traversal)

**Decision**: Use `$pos.after(1)` to get the position immediately after the current top-level block, then resolve that position to enter the next block. Use `$pos.before(1)` similarly for the previous block. Clamp the column offset to the destination block's text length.

**Rationale**: ProseMirror block nodes at depth 1 (direct children of the document node) correspond to paragraphs, headings, list items, etc. `$pos.after(1)` returns the position right after the closing token of the depth-1 ancestor, which is also the opening token of the next depth-1 block. Resolving `after(1) + 1` puts the cursor at the start of the next block.

**Column clamping**: Track `col = $anchor.pos - $anchor.start()` (0-based offset within the current block's content). In the destination block, the valid range is `[blockStart, blockStart + blockContent.size]` where `blockContent.size` excludes the last valid character position (`blockContent.size - 1` is the last character). Clamp `col` to `[0, blockContent.size - 1]`.

**Empty block handling**: If the destination block has `content.size === 0`, place cursor at `blockStart` (column 0) — exactly mirrors Vim behavior where an empty line has cursor at column 0.

**Soft-wrap deviation**: A single paragraph that visually wraps across multiple rows is treated as one block. `j`/`k` skip the entire paragraph. This is documented as a deviation in `README.md` (Vim `gj`/`gk` for visual-line movement is out of scope).

**Key API**: `$pos.after(depth)`, `$pos.before(depth)`, `$pos.depth`, `$pos.start()`, `$pos.node(depth).content.size`.

**Alternatives considered**:

- Tracking a "desired column" in plugin state (like real Vim does for sticky column) — rejected for now as it adds state complexity beyond this feature's scope. Column clamping (clamp-to-shorter-line) is sufficient and correct per the spec.
- Visual line navigation via DOM `getBoundingClientRect` — rejected per Constitution V.

---

## Decision 3: Key Dispatch Table Design

**Decision**: Define a `Record<string, (view: EditorView) => boolean>` constant in `src/motions/hjkl.ts` mapping key names (`"h"`, `"j"`, `"k"`, `"l"`, `"ArrowLeft"`, `"ArrowRight"`, `"ArrowUp"`, `"ArrowDown"`) to motion handler functions. The plugin's `handleKeyDown` looks up `event.key` in this table and calls the handler.

**Rationale**: Eight keys share the same lookup pattern — above the three-instance threshold in Constitution II. A static object literal is the minimal idiomatic solution. It requires no registration mechanism, no interface, no class hierarchy. Adding a new motion key later is a one-line addition to the table. No abstraction layer beyond a plain object is introduced.

**Future extensibility**: The user's request to "allow us later to extend more motions" is satisfied by the `src/motions/` directory layout. New motion files (`word.ts`, `linebounds.ts`, etc.) export handler functions; `index.ts` imports and merges them into the dispatch table with `{ ...hjklMotions, ...wordMotions }`. This requires no architectural changes.

**Alternatives considered**:

- A motion registration API (e.g., `VimMode.registerMotion(key, fn)`) — rejected per Constitution II as premature generalization; no concrete use case for dynamic registration exists today.
- Inline `if/else` chain — rejected because 8 branches inline would exceed ~200 line guideline and be harder to read than a table.

---

## Decision 4: Module Boundary

**Decision**: `src/motions/hjkl.ts` exports named functions (`moveLeft`, `moveRight`, `moveDown`, `moveUp`) and a pre-built `hjklMotions` dispatch table. `src/index.ts` imports `hjklMotions` and uses it in `handleKeyDown`. No motion internals are re-exported from `src/index.ts`.

**Rationale**: Keeps the public API surface minimal. Internal motion functions are not part of the consumer contract and can be refactored freely.
