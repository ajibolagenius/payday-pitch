@AGENTS.md

## Large files

- All AI agents, regardless of provider or tool, must never read `docs/research/fresh-product-brand-mobile-research.md` whole (943 lines, about 31k tokens). Grep it for what you need, or read only the lines you need with `offset` and `limit`.
- All agents must check for large-file guidance before reading a document and follow any specified limits.
- When working with a large document, retrieve only the relevant excerpts using search or targeted line ranges; do not load the entire document.
