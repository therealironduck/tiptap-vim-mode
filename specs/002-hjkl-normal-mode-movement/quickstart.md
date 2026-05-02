# Quickstart: HJKL Normal Mode Movement

**Feature**: 002-hjkl-normal-mode-movement  
**Date**: 2026-05-02

## What this adds

After this feature, users can navigate with HJKL keys (and arrow keys) while in normal mode:

- `h` / `←` — move one character left
- `l` / `→` — move one character right
- `j` / `↓` — move to the next paragraph/block
- `k` / `↑` — move to the previous paragraph/block

## Usage (no change to consumer API)

```typescript
import { Editor } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import VimMode from "@therealironduck/tiptap-vim-mode";

const editor = new Editor({
  element: document.querySelector("#editor"),
  extensions: [StarterKit, VimMode],
  content: "<p>Hello world</p>",
});

// Press Escape → enters Normal mode
// Press h/j/k/l or arrow keys → cursor moves
// Press i → returns to Insert mode
```

## Manual verification (playground)

```bash
bun run playground
# Opens http://localhost:5173
```

1. Click into the editor (Insert mode active by default).
2. Press `Escape` — mode indicator shows `NORMAL`.
3. Press `h`, `j`, `k`, `l` and verify cursor moves correctly.
4. Press arrow keys — verify identical behavior to HJKL.
5. Press `i` — return to Insert mode and verify HJKL types characters normally.

## Known deviation from standard Vim

`j`/`k` move by **block/paragraph node**, not by visual screen row. A long paragraph that wraps visually is treated as a single unit — pressing `j` skips the entire paragraph. This matches Vim's `j`/`k` behavior in plain-text terminals but differs from `gj`/`gk` (visual-line movement, not yet implemented).
