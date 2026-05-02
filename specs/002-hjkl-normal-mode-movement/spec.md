# Feature Specification: HJKL Normal Mode Movement

**Feature Branch**: `002-hjkl-normal-mode-movement`  
**Created**: 2026-05-02  
**Status**: Draft  
**Input**: User description: "As the first motions I want to support classic HJKL movement while in normal mode. It should behave exactly like VIM. For now, we can skip the numbering (like 10j) or something. For the sake of support, lets also support arrow keys (both should work the same)"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Horizontal Character Movement (Priority: P1)

A user in normal mode presses `h` or `l` (or the left/right arrow keys) to move the cursor one character left or right within the current line.

**Why this priority**: This is the most fundamental horizontal navigation in Vim and delivers immediate value as soon as normal mode is activated. Without it, users cannot navigate at all.

**Independent Test**: Can be fully tested by entering normal mode, pressing `h`/`l` or left/right arrow keys, and verifying the cursor moves exactly one character in the expected direction.

**Acceptance Scenarios**:

1. **Given** the editor is in normal mode and the cursor is in the middle of a line, **When** the user presses `h`, **Then** the cursor moves one character to the left.
2. **Given** the editor is in normal mode and the cursor is in the middle of a line, **When** the user presses `l`, **Then** the cursor moves one character to the right.
3. **Given** the editor is in normal mode, **When** the user presses the left arrow key, **Then** the cursor moves one character to the left (identical to `h`).
4. **Given** the editor is in normal mode, **When** the user presses the right arrow key, **Then** the cursor moves one character to the right (identical to `l`).
5. **Given** the editor is in normal mode and the cursor is at the beginning of a line, **When** the user presses `h` or the left arrow key, **Then** the cursor does not move.
6. **Given** the editor is in normal mode and the cursor is at the last character of a line, **When** the user presses `l` or the right arrow key, **Then** the cursor does not move past the last character.

---

### User Story 2 - Vertical Line Movement (Priority: P2)

A user in normal mode presses `j` or `k` (or the down/up arrow keys) to move the cursor down or up one line.

**Why this priority**: Vertical navigation completes the basic two-axis movement set. Without it, users are confined to a single line and cannot navigate any real document.

**Independent Test**: Can be fully tested by entering normal mode in a multi-line document, pressing `j`/`k` or up/down arrow keys, and verifying the cursor lands on the correct line.

**Acceptance Scenarios**:

1. **Given** the editor is in normal mode and there is a block/paragraph node below the cursor, **When** the user presses `j`, **Then** the cursor moves to the same column in the next block node (clamped if shorter).
2. **Given** the editor is in normal mode and there is a block/paragraph node above the cursor, **When** the user presses `k`, **Then** the cursor moves to the same column in the previous block node (clamped if shorter).
3. **Given** the editor is in normal mode, **When** the user presses the down arrow key, **Then** the cursor moves to the next block node (identical to `j`).
4. **Given** the editor is in normal mode, **When** the user presses the up arrow key, **Then** the cursor moves to the previous block node (identical to `k`).
5. **Given** the editor is in normal mode and the cursor is in the first block node, **When** the user presses `k` or the up arrow key, **Then** the cursor does not move.
6. **Given** the editor is in normal mode and the cursor is in the last block node, **When** the user presses `j` or the down arrow key, **Then** the cursor does not move.
7. **Given** the editor is in normal mode and the cursor column exceeds the length of the destination block node, **When** the user presses `j` or `k`, **Then** the cursor lands at the last character of that shorter block node.
8. **Given** a paragraph wraps across multiple visual rows, **When** the user presses `j`, **Then** the cursor jumps to the next block node entirely (not to the next visual row within the same paragraph).

---

### Edge Cases

- When the cursor is in an empty block node, `h` and `l` are no-ops (cursor stays at column 0). Pressing `j`/`k` from an empty block still navigates to the adjacent block node normally.
- When a line contains only a single character, `l` is a no-op (cursor is already on the last character); `h` moves left only if the cursor is not at column 0.
- HJKL keys in insert mode type characters as normal — they do not trigger any motion.
- When the cursor is at the very first position in the document (first block, column 0), `h` and `k` are no-ops.
- When the cursor is at the very last position in the document (last block, last character), `l` and `j` are no-ops.
- Vertical movement clamps the cursor column to the last valid character of the destination block node when that node is shorter.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The extension MUST intercept `h`, `j`, `k`, and `l` key presses exclusively when the editor is in normal mode.
- **FR-002**: The extension MUST intercept left, right, up, and down arrow key presses exclusively when the editor is in normal mode.
- **FR-003**: Pressing `h` or the left arrow key in normal mode MUST move the cursor exactly one character to the left on the current line.
- **FR-004**: Pressing `l` or the right arrow key in normal mode MUST move the cursor exactly one character to the right on the current line.
- **FR-005**: Pressing `j` or the down arrow key in normal mode MUST move the cursor to the same column position in the next block/paragraph node.
- **FR-006**: Pressing `k` or the up arrow key in normal mode MUST move the cursor to the same column position in the previous block/paragraph node.
- **FR-007**: Horizontal movement (`h`/`l`) MUST NOT wrap to adjacent lines — it is bounded by the current line's start and end.
- **FR-008**: Vertical movement (`j`/`k`) MUST clamp the cursor column to the last valid character of the destination line when the destination line is shorter than the current column position.
- **FR-009**: Arrow keys and HJKL keys MUST produce their default text-input behavior when the editor is in any mode other than normal mode (e.g., insert mode).
- **FR-010**: Count-prefixed motions (e.g., `10j`, `3l`) are explicitly out of scope for this feature.
- **FR-011**: When the cursor is inside an empty block node, pressing `h` or `l` MUST be a no-op — the cursor stays at column 0.

### Key Entities

- **Normal Mode**: The editor state in which key presses are interpreted as commands (motions, operators) rather than text input.
- **Cursor Position**: The current caret location within the document, described by line index and column index.
- **Line Boundary**: The valid range of column positions within a single line; horizontal movement must stay within this range.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: All four HJKL keys and their corresponding arrow keys move the cursor in the correct direction on every press in normal mode, with zero incorrect movements.
- **SC-002**: No key press causes the cursor to move outside the valid document bounds or wrap across line boundaries.
- **SC-003**: HJKL keys produce normal text input (not cursor movement) when the editor is in insert mode, with no regressions to default editor behavior.
- **SC-004**: Cursor movement is visually instantaneous — users perceive no lag between key press and cursor repositioning.
- **SC-005**: Arrow keys in normal mode produce identical cursor outcomes to their HJKL counterparts across all tested scenarios.

## Clarifications

### Session 2026-05-02

- Q: Should `j`/`k` move by visual screen row or by block/paragraph node? → A: Block/paragraph node (matches standard Vim `j`/`k` behavior).
- Q: What should `h` and `l` do when the cursor is in an empty block node? → A: Both are no-ops; cursor stays at column 0. Exact Vim behavior.

## Assumptions

- The extension already has an established mechanism to track and switch between editor modes (at minimum normal mode and insert mode); this feature adds motion handling on top of that existing mode state.
- "Behave exactly like VIM" is scoped to standard Vim motion rules for these keys: `h`/`l` are line-bounded (no wrapping), `j`/`k` clamp columns on shorter lines, and cursor rests on characters (not after the last character as in insert mode).
- Count prefixes (e.g., `5j`) are intentionally deferred to a future iteration.
- A "line" is a block/paragraph node boundary in the document model. Soft-wrapped visual rows within a single paragraph are not treated as separate lines; `j`/`k` skip the entire paragraph. Visual-line movement (`gj`/`gk`) is out of scope.
- The feature targets desktop keyboard input; mobile/touch input is out of scope.
