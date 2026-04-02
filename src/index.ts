import { Extension } from "@tiptap/core";
import type { Editor } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";

export type Mode = "NORMAL" | "INSERT";

// Not exported: PluginKey is an internal detail. Consumers use getVimMode() instead.
const vimModePluginKey = new PluginKey<Mode>("vimMode");

/**
 * Returns the current vim mode from the given editor instance.
 * Defaults to INSERT when the plugin state is not yet initialised.
 */
export function getVimMode(editor: Editor): Mode {
  return vimModePluginKey.getState(editor.state) ?? "INSERT";
}

const VimMode = Extension.create({
  name: "vimMode",

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: vimModePluginKey,
        state: {
          init: () => "INSERT" as Mode,
          apply(tr, mode) {
            const next = tr.getMeta(vimModePluginKey) as Mode | undefined;
            return next ?? mode;
          },
        },
        props: {
          handleKeyDown(view, event) {
            const mode = vimModePluginKey.getState(view.state) ?? "INSERT";

            if (event.key === "Escape") {
              view.dispatch(view.state.tr.setMeta(vimModePluginKey, "NORMAL"));
              return true;
            }

            if (mode === "NORMAL" && event.key === "i") {
              view.dispatch(view.state.tr.setMeta(vimModePluginKey, "INSERT"));
              return true;
            }

            if (mode === "NORMAL") {
              // Deviation from Vim: most motions not yet implemented.
              // Block all other keypresses in Normal mode to prevent
              // unintended document edits until motion support is added.
              return true;
            }

            return false;
          },
        },
      }),
    ];
  },
});

export { VimMode };
export default VimMode;
