# Public API Contract: HJKL Normal Mode Movement

**Feature**: 002-hjkl-normal-mode-movement  
**Date**: 2026-05-02

## Overview

This feature adds no new exports to the library's public API. The public surface remains:

```typescript
export { VimMode }; // default and named export — the Tiptap Extension
export { getVimMode }; // helper: returns current Mode from an Editor instance
export type { Mode }; // "NORMAL" | "INSERT"
```

All motion logic is internal to the extension. Consumers do not register or configure motions directly.

## Behavioral Contract (consumer-observable)

### Key handling in NORMAL mode

When the extension is active and the editor is in NORMAL mode, the following keys move the cursor and are **consumed** (default browser behavior suppressed):

| Key                | Behavior                                                  | Vim parity |
| ------------------ | --------------------------------------------------------- | ---------- |
| `h` / `ArrowLeft`  | Move cursor one character left within the current block   | Exact      |
| `l` / `ArrowRight` | Move cursor one character right within the current block  | Exact      |
| `j` / `ArrowDown`  | Move cursor to the same column in the next block node     | Partial\*  |
| `k` / `ArrowUp`    | Move cursor to the same column in the previous block node | Partial\*  |

\*Deviation: In a rich-text editor, `j`/`k` move by block/paragraph node, not by visual screen row. Soft-wrapped lines within a single paragraph are skipped entirely. Vim users who need visual-line movement should note that `gj`/`gk` (visual-line navigation) is not yet implemented.

### Boundary behavior

- `h` at column 0 of a block: no-op (cursor does not wrap to the previous block).
- `l` at the last character of a block: no-op (cursor does not wrap to the next block).
- `k` at the first block node: no-op.
- `j` at the last block node: no-op.
- `h`/`l` on an empty block: no-op (cursor stays at column 0).
- `j`/`k` to a shorter destination block: cursor clamped to the last character of that block.
- `j`/`k` to or from an empty block: cursor placed at column 0.

### Key handling in INSERT mode

All eight keys (`h`, `j`, `k`, `l`, `ArrowLeft`, `ArrowRight`, `ArrowUp`, `ArrowDown`) behave exactly as they would without the extension — standard browser/Tiptap behavior is not modified.

## Stability

Internal types (`Motion`, `NormalModeKeyMap`) are not exported and may change without a semver bump. The public API (`VimMode`, `getVimMode`, `Mode`) follows semver; no changes in this feature.
