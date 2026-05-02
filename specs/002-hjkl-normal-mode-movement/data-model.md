# Data Model: HJKL Normal Mode Movement

**Feature**: 002-hjkl-normal-mode-movement  
**Date**: 2026-05-02

## Entities

### `Mode` (existing, unchanged)

```typescript
type Mode = "NORMAL" | "INSERT";
```

Plugin state type. Lives in ProseMirror plugin state keyed by `vimModePluginKey`. No changes in this feature.

---

### `Motion` (new, internal)

```typescript
type Motion = (view: EditorView) => boolean;
```

A function that attempts to move the cursor. Returns `true` if the motion was handled (prevents default browser behavior), `false` if the motion was a no-op (e.g., cursor already at boundary) — in which case `false` still prevents default to avoid unintended text insertion, but no transaction is dispatched.

**Note**: Returning `true` from ProseMirror's `handleKeyDown` always prevents the default browser action. The return value here controls whether a transaction is dispatched, not whether the event is consumed. All motions in normal mode consume the key event regardless.

---

### `NormalModeKeyMap` (new, internal)

```typescript
type NormalModeKeyMap = Record<string, Motion>;
```

A static plain-object mapping from `KeyboardEvent.key` strings to `Motion` handlers. Defined once in `src/motions/hjkl.ts`. Extended in future motion files and merged in `src/index.ts`.

**Current entries**:

| Key            | Motion      | Vim equivalent |
| -------------- | ----------- | -------------- |
| `"h"`          | `moveLeft`  | `h`            |
| `"ArrowLeft"`  | `moveLeft`  | `h`            |
| `"l"`          | `moveRight` | `l`            |
| `"ArrowRight"` | `moveRight` | `l`            |
| `"j"`          | `moveDown`  | `j`            |
| `"ArrowDown"`  | `moveDown`  | `j`            |
| `"k"`          | `moveUp`    | `k`            |
| `"ArrowUp"`    | `moveUp`    | `k`            |

---

## State Transitions

No new plugin state is introduced. The existing `Mode` state (`NORMAL`/`INSERT`) governs whether the key map is consulted. Motion handlers are only invoked when mode is `NORMAL`.

```
NORMAL mode + key in NormalModeKeyMap → dispatch motion transaction (or no-op) → stay in NORMAL
NORMAL mode + key NOT in NormalModeKeyMap → block key (existing behavior) → stay in NORMAL
INSERT mode → key map not consulted → browser/Tiptap default behavior
```

## Validation Rules

- Motion handlers MUST NOT be called when mode is `INSERT`.
- `moveLeft` MUST NOT move the cursor before `$anchor.start()` (block start).
- `moveRight` MUST NOT move the cursor past `$anchor.end() - 1` (last character position).
- `moveDown`/`moveUp` MUST clamp column offset to `[0, destBlock.content.size - 1]` (or 0 for empty blocks).
- All motion handlers MUST return `true` to prevent default browser key behavior in normal mode.
