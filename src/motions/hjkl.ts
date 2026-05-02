import { TextSelection } from "@tiptap/pm/state";
import type { Node, ResolvedPos } from "@tiptap/pm/model";
import type { EditorView } from "@tiptap/pm/view";
import { Motion } from "../types/motion";

// Returns the depth of the "line block" to navigate by.
// For a cursor in a top-level paragraph, that's depth 1.
// For a cursor in a list item's paragraph, that's depth 2 (the listItem level).
// Rule: find the innermost textblock and navigate at its parent depth, but never below depth 1.
function getNavDepth($anchor: ResolvedPos): number {
  for (let d = $anchor.depth; d >= 1; d--) {
    if ($anchor.node(d).isTextblock) {
      return d === 1 ? 1 : d - 1;
    }
  }
  return 1;
}

// Find the first textblock at or after fromPos and return the resolved cursor position within it.
function findNextTextblock(doc: Node, fromPos: number, col: number): number | null {
  let found: number | null = null;
  doc.nodesBetween(fromPos, doc.content.size, (node, pos) => {
    if (found !== null) return false;
    if (node.isTextblock) {
      const destCol = node.content.size === 0 ? 0 : Math.min(col, node.content.size - 1);
      found = pos + 1 + destCol;
      return false;
    }
    return true;
  });
  return found;
}

// Find the last textblock before toPos and return the resolved cursor position within it.
function findPrevTextblock(doc: Node, toPos: number, col: number): number | null {
  let found: number | null = null;
  doc.nodesBetween(0, toPos, (node, pos) => {
    if (node.isTextblock) {
      const destCol = node.content.size === 0 ? 0 : Math.min(col, node.content.size - 1);
      found = pos + 1 + destCol;
    }
    return true;
  });
  return found;
}

function moveHorizontal(view: EditorView, delta: -1 | 1): boolean {
  const { state } = view;
  const { $anchor } = state.selection;
  const canMove = delta < 0 ? $anchor.pos > $anchor.start() : $anchor.pos < $anchor.end() - 1;
  if (canMove) {
    view.dispatch(state.tr.setSelection(TextSelection.create(state.doc, $anchor.pos + delta)));
  }
  return true;
}

function moveVertical(view: EditorView, delta: -1 | 1): boolean {
  const { state } = view;
  const { doc } = state;
  const { $anchor } = state.selection;
  const col = $anchor.pos - $anchor.start();
  const navDepth = getNavDepth($anchor);

  let destPos: number | null;
  if (delta > 0) {
    const afterCurrentBlock = $anchor.after(navDepth);
    if (afterCurrentBlock >= doc.content.size) return true;
    destPos = findNextTextblock(doc, afterCurrentBlock, col);
  } else {
    const beforeCurrentBlock = $anchor.before(navDepth);
    if (beforeCurrentBlock <= 0) return true;
    destPos = findPrevTextblock(doc, beforeCurrentBlock, col);
  }

  if (destPos === null) return true;
  view.dispatch(state.tr.setSelection(TextSelection.create(doc, destPos)));
  return true;
}

export const hjklMotions: Record<string, Motion> = {
  h: (view) => moveHorizontal(view, -1),
  ArrowLeft: (view) => moveHorizontal(view, -1),
  l: (view) => moveHorizontal(view, 1),
  ArrowRight: (view) => moveHorizontal(view, 1),
  j: (view) => moveVertical(view, 1),
  ArrowDown: (view) => moveVertical(view, 1),
  k: (view) => moveVertical(view, -1),
  ArrowUp: (view) => moveVertical(view, -1),
};
