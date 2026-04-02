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
<p>Edit this document freely in Insert mode, then switch to Normal mode to test vim key handling. More motions will be added as the extension grows.</p>
<ul>
  <li>Escape — enter Normal mode</li>
  <li>i — enter Insert mode (from Normal)</li>
  <li>More motions coming soon</li>
</ul>
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
