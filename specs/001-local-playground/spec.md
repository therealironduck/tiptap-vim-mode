# Feature Specification: Local Development Playground

**Feature Branch**: `001-local-playground`
**Created**: 2026-04-02
**Status**: Draft
**Input**: User description: "I want to have a local playground to test the extension. The base directory already exists. It should load a simple full screen tiptap editor with some example content and my extension loaded. It should also support HMR, - if I change something on the extension it should directly reflect in the playground without needing to manually recompile something"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Open Playground and See Working Editor (Priority: P1)

A developer opens the playground in their browser and sees a full-screen Tiptap editor pre-loaded with example content and the vim-mode extension already active.

**Why this priority**: This is the core deliverable — without a working editor, nothing else matters.

**Independent Test**: Can be fully tested by running the playground dev server and navigating to the local URL; the editor should fill the viewport and vim keybindings should be functional.

**Acceptance Scenarios**:

1. **Given** the developer starts the playground dev server, **When** they open the local URL in a browser, **Then** a full-screen Tiptap editor is displayed with sample content visible.
2. **Given** the editor is loaded, **When** the developer presses `Escape` to enter Normal mode or `i` to enter Insert mode, **Then** the mode indicator updates to reflect the current mode (e.g., `-- NORMAL --` or `-- INSERT --`), confirming the vim-mode extension is active.
3. **Given** the editor is loaded, **When** the viewport is resized, **Then** the editor continues to fill the full screen without overflow or scroll artifacts.

---

### User Story 2 - Live Reload on Extension Code Change (Priority: P2)

A developer edits the vim-mode extension source code and the playground browser tab updates automatically, reflecting the change without any manual rebuild or page refresh step.

**Why this priority**: HMR is the primary productivity feature that makes the playground useful during active development rather than just initial verification.

**Independent Test**: Can be fully tested by changing a behavior in the extension source (e.g., remapping a key), saving the file, and observing the browser tab update and the new behavior being active — all without running any manual command.

**Acceptance Scenarios**:

1. **Given** the playground dev server is running, **When** the developer saves a change to the extension source, **Then** the browser tab updates within a few seconds and reflects the change without a full manual reload.
2. **Given** a change is made to the extension, **When** the hot update is applied, **Then** any existing editor state (cursor position, content) is preserved where possible; if a full reload is necessary it happens automatically.
3. **Given** the extension source contains a syntax error, **When** the developer saves, **Then** an error is surfaced in the browser (overlay or console) without crashing the dev server.

---

### User Story 3 - Example Content Provides Meaningful Context (Priority: P3)

The pre-loaded editor content demonstrates a variety of text structures (headings, paragraphs, lists) so the developer can test vim navigation and editing across different content types.

**Why this priority**: Useful but secondary; the playground still has core value even with minimal placeholder content.

**Independent Test**: Can be tested independently by inspecting the initial editor content on load and verifying multiple content types are present.

**Acceptance Scenarios**:

1. **Given** the editor loads, **When** the developer inspects the initial content, **Then** at least headings, paragraphs, and a list are present.
2. **Given** the editor loads, **When** the developer uses vim navigation keys (`j`, `k`, `w`, `b`, etc.), **Then** the cursor moves through the varied content in a predictable vim-compatible manner.

---

### Edge Cases

- What happens when the dev server is started but no browser is open — the server should keep running without error.
- What happens when a circular dependency or module resolution error occurs in the extension — the error should be shown clearly without an infinite reload loop.
- What happens when the playground directory is missing a required dependency — the start command should fail with a clear, actionable error message.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The playground MUST display a Tiptap editor that occupies the full browser viewport with no visible overflow or unused space.
- **FR-008**: The playground MUST display a visible mode indicator that shows the current vim mode (e.g., `-- NORMAL --`, `-- INSERT --`) and updates immediately on every mode transition.
- **FR-002**: The playground MUST load the vim-mode extension from the local source (not a published package version), so edits to the extension source are reflected.
- **FR-003**: The playground MUST pre-populate the editor with example content containing at least headings, paragraphs, and a list.
- **FR-004**: The playground MUST support Hot Module Replacement (HMR) so that changes to the extension source are reflected in the browser automatically without a manual rebuild or reload command.
- **FR-005**: The playground MUST be startable with a single command from the project root (e.g., `bun run playground`).
- **FR-006**: The playground MUST surface build or runtime errors in the browser (via an error overlay or the browser console) without crashing the dev server.
- **FR-007**: The playground MUST NOT require separate manual compilation of the extension before starting.

### Key Entities

- **Playground App**: A minimal single-page application hosting the Tiptap editor, living in the `playground/` directory.
- **Extension Source**: The local `src/` directory of the vim-mode extension, consumed directly by the playground via the dev server's module resolution.
- **Example Content**: A static initial document provided to the editor on mount, demonstrating multiple content node types.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Developer can go from a fresh terminal to a working browser-based editor in a single command, in under 30 seconds on a modern machine.
- **SC-002**: A change to the extension source is reflected in the browser within 5 seconds of saving the file, with no manual intervention.
- **SC-003**: The editor fills 100% of the viewport height and width on both standard desktop and wide-screen resolutions.
- **SC-004**: The playground start command succeeds on a clean install (after dependency installation) without additional setup steps.

## Clarifications

### Session 2026-04-02

- Q: Should the playground display a visible mode indicator (e.g., `-- NORMAL --` / `-- INSERT --`) so the developer can verify mode transitions at a glance? → A: Yes — show a mode indicator bar that updates on every mode transition.

## Assumptions

- The `playground/` base directory already exists in the repository.
- The project uses `bun` as the package manager; the playground will also use `bun`.
- The developer runs the playground on their local machine; no remote/cloud deployment is in scope.
- Mobile browser support for the playground is out of scope — desktop browsers only.
- The playground is a development-only tool and will not be published or deployed.
- The existing `package.json` will be updated to add a `playground` script shortcut.
