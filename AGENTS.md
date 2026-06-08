# Intake Bot Agent Notes

This project contains a Power Apps code app and exported Canvas app artifacts for the request intake copilot.

- Before continuing cross-machine work, read `docs/handoff/2026-06-08-intake-bot-context.md`.
- Treat `src/` as the React/TypeScript code app source.
- Treat `powerplatform/` as implementation notes for prompts, formulas, and Dataverse shape.
- Treat `canvas/` and `canvas-native/` as exported Canvas app artifacts; inspect them before changing Canvas formulas or screen structure.
- Use `npm.cmd` and `npx.cmd` on Windows when running Node or Power Platform commands.
- When using local RAG tools, apply the `mcp-local-rag` skill for query formulation and result interpretation.
- Keep transient workflow plans under `docs/plans/`; this path is intentionally ignored.
- Keep RAG databases and model caches outside the repo. Do not commit `lancedb/`, `models/`, `rag/db/`, or `rag/models/`.
