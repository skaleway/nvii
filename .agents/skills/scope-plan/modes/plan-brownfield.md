# Scope Plan Route: brownfield

Brownfield: read root `AGENTS.md` (and any existing scope) to plan the next slice on top:
1. Enroll already built features for context, from `AGENTS.md` (nested area docs map to existing areas) + a light code scan, each with a `Code area` pointer. Large repo: offload the scan to a read only subagent (on Claude Code the `scout` subagent type, which is read only and pins a fast, low cost model; else set the model explicitly to a fast, low cost tier, not inherited; `Read`/`Grep`/`Glob`) returning a compact map, don't read the tree inline. Assess completeness honestly from the code, don't stamp everything done: complete and shipped → `existing` (distinct from `done`); partially built → `in-progress` (so `/feature-build` can resume). Never mark a half built feature `existing`.
2. Plan the next slice as `planned` rows; don't plan `existing` features again. No root `AGENTS.md`: note in the report that `/codebase-audit` should run first for real context.

Run again (scope exists): read the union, don't duplicate or fragment:
- Read the whole scope (single file, or `index.md` + every epic file); all features at any status (`planned`, `in-progress`, `done`, `existing`, `dropped`) are the dedup baseline.
- Never add back a feature present at any status; request overlaps an existing `planned` row → extend it (sharpen intent/seeds).
- Reconcile drift: shipped work or specs no row covers get enrolled (completed as `existing`/`done`, unfinished as `in-progress`); note as "drift enrolled".
- Report: counts already there / new / drift, files written. Full reconcile after shipping → prefer replan mode.
