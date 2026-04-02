<!--
SYNC IMPACT REPORT
==================
Version change: 1.0.0 → 1.1.0

Modified principles:
  - IV. Vim Fidelity — added mandatory README.md documentation requirement for all supported
    motions and deviations

Added sections: None

Removed sections: None

Templates requiring updates:
  - .specify/templates/plan-template.md ✅ (no structural changes required)
  - .specify/templates/spec-template.md ✅ (no structural changes required)
  - .specify/templates/tasks-template.md ✅ (no structural changes required)

Follow-up TODOs: None.
-->

# tiptap-vim-mode Constitution

## Core Principles

### I. Minimal Dependencies

This extension MUST introduce zero runtime dependencies beyond the required peer dependencies
(`@tiptap/core` and `@tiptap/pm`). Every candidate dependency MUST be evaluated against the
question: "Can this be implemented directly with ProseMirror primitives in under 50 lines?"
If yes, it MUST be implemented directly. External packages for utilities, key-handling helpers,
or state machines are prohibited unless the alternative is demonstrably unreasonable.

**Rationale**: The extension ships inside consumers' bundles. Dependency bloat is a hidden tax
on every downstream project. Keeping the dependency surface minimal also reduces supply-chain
risk and simplifies upgrades.

### II. Simplicity Over Abstraction

Code MUST solve the problem at hand. Abstractions are only introduced when the same pattern
appears in three or more distinct locations. Premature generalization (strategy objects,
plugin registries, event buses) is prohibited. YAGNI applies strictly: no "future-proof"
hooks or extension points unless a concrete use case exists today.

**Rationale**: Vim emulation has a naturally large surface area. Without a hard simplicity
constraint, the codebase will expand to mirror the complexity of a full Vim implementation.
The goal is useful Vim-like motions, not a full Vim clone.

### III. Structured Modularity

The extension MUST NOT live in a single monolithic file, nor be fragmented into dozens of
micro-modules. Source files SHOULD be organized by concern (e.g., `motions/`, `operators/`,
`modes/`). A single file MUST NOT exceed ~200 lines of logic; if it does, it is a signal to
split by concern. Public API surface is exported only from `src/index.ts`.

**Rationale**: One giant file becomes unmaintainable; over-splitting creates indirection for
no benefit. A concern-based directory layout makes it easy to find, test, and extend specific
Vim behaviors without wading through unrelated code.

### IV. Vim Fidelity

Implemented motions and operators MUST behave consistently with standard Vim semantics. When
a behavior deviates from Vim (e.g., due to editor constraints), the deviation MUST be
documented in a code comment at the implementation site. Partial implementations are
acceptable; silent mismatches are not. Modal state (Normal / Insert / Visual) MUST be
explicit and predictable.

Every supported motion or operator MUST be listed in `README.md` with its keybinding and a
brief description. Any deviation from standard Vim behavior MUST be called out explicitly in
that listing. New motions MUST update `README.md` in the same PR that adds the implementation.

**Rationale**: Users adopting this extension expect muscle memory to transfer from Vim. Silent
semantic drift erodes trust and creates bugs that are hard to reproduce. Keeping the README
as the authoritative motion reference lets consumers know exactly what is and isn't supported
without reading source code.

### V. Extension-First Design

All functionality MUST be implemented as a proper Tiptap extension using `Extension.create()`
and ProseMirror APIs (`EditorState`, `Transaction`, `Plugin`). Direct DOM manipulation or
monkey-patching of Tiptap internals is prohibited. State MUST live in ProseMirror plugin
state or the extension's own managed state — not in module-level variables.

**Rationale**: Tiptap's extension model and ProseMirror's immutable state machine provide
correct collaborative-editing semantics and lifecycle management. Bypassing them creates
subtle bugs with undo, collaboration, and SSR.

## Technology Constraints

- **Language**: TypeScript (strict mode)
- **Package manager**: `bun`
- **Build**: Rollup → `dist/` (ESM + CJS + `.d.ts` declarations)
- **Peer dependencies**: `@tiptap/core`, `@tiptap/pm` — consumers MUST install these
- **Lint**: oxlint (`bun run lint` / `bun run lint:fix`)
- **Format**: oxfmt (`bun run fmt` / `bun run fmt:check`)
- **Tests**: No framework configured yet — manual verification via the `playground/` app
- **CI gates**: lint, format check, and build MUST pass on every PR

## Development Workflow

- Conventional commits are enforced on PRs (allowed types: `feat`, `fix`, `chore`, `docs`,
  `refactor`, `style`, `test`, `build`, `ci`, `perf`, `revert`)
- All non-trivial changes MUST be developed on a feature branch and merged via PR
- The `playground/` Vite app serves as the manual integration harness; new motions MUST be
  manually verified there before merging
- Breaking changes to the public API MUST bump the package major version
- Any PR adding or changing a motion MUST update the supported-motions table in `README.md`,
  including explicit notation of any deviation from standard Vim semantics

## Governance

This constitution supersedes all other informal practices. Amendments require:

1. A PR modifying `.specify/memory/constitution.md` with a version bump per semver rules:
   - **MAJOR**: principle removal or backward-incompatible redefinition
   - **MINOR**: new principle or materially expanded guidance
   - **PATCH**: clarification, wording fix, typo
2. Updated Sync Impact Report embedded as an HTML comment at the top of the file
3. Propagation review of all templates listed in the Sync Impact Report

All PRs and code reviews MUST verify compliance with the principles above. Complexity
violations require a documented justification entry in the plan's Complexity Tracking table
before the PR may be merged.

**Version**: 1.1.0 | **Ratified**: 2026-04-02 | **Last Amended**: 2026-04-02
