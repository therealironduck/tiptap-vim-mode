import "./style.css";
import { Editor } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import VimMode from "@tiptap-vim-mode";
import { updateModeIndicator } from "./mode-indicator.ts";

const editorElement = document.querySelector<HTMLDivElement>("#editor")!;
const indicatorElement = document.querySelector<HTMLDivElement>("#mode-indicator")!;

const exampleContent = `
<h1>Vim Mode Extension Playground</h1>
<h2>Navigation Reference</h2>
<p>Press <strong>Escape</strong> to enter Normal mode. Press <strong>i</strong> to return to Insert mode. The status bar below shows your current mode.</p>
<p>Edit this document freely in Insert mode, then switch to Normal mode to test vim key handling.</p>
<ul>
  <li>Escape — enter Normal mode</li>
  <li>i — enter Insert mode (from Normal)</li>
  <li>h / ← — move cursor one character left</li>
  <li>l / → — move cursor one character right</li>
  <li>j / ↓ — move cursor to next block/paragraph</li>
  <li>k / ↑ — move cursor to previous block/paragraph</li>
</ul>
<p>This is a second paragraph for testing vertical movement. Try pressing j/k in normal mode to jump between paragraphs.</p>
<p>And a third paragraph — column position is preserved (or clamped if the target line is shorter).</p>
`;

const editor = new Editor({
  element: editorElement,
  extensions: [StarterKit, VimMode],
  content: exampleContent,
  onTransaction({ editor: e }) {
    updateModeIndicator(e, indicatorElement);
  },
});

updateModeIndicator(editor, indicatorElement);
