import Reveal from "../reveal.js/dist/reveal.esm.js";
import RevealHighlight from "../reveal.js/plugin/highlight/highlight.esm.js";
import RevealMarkdown from "../reveal.js/plugin/markdown/markdown.esm.js";
import RevealNotes from "../reveal.js/plugin/notes/notes.esm.js";

window.Reveal = Reveal;

// More info about initialization & config:
// - https://revealjs.com/initialization/
// - https://revealjs.com/config/
Reveal.initialize({
  hash: true,
  width: 1366,
  height: 768,
  margin: 0.05,
  plugins: [RevealMarkdown, RevealHighlight, RevealNotes],
});
