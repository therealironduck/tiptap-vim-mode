import type { Editor } from "@tiptap/core";
import { getVimMode, type Mode } from "@tiptap-vim-mode";

export function formatMode(mode: Mode): string {
  return `-- ${mode} --`;
}

export function updateModeIndicator(editor: Editor, element: HTMLElement): void {
  const mode = getVimMode(editor);
  element.textContent = formatMode(mode);
}
