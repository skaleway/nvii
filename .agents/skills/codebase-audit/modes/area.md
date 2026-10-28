# Audit Mode: area scan (Phase 3)

Trigger: a path or area name was given (e.g. `/codebase-audit src/auth`).

Pre-flight additionally:
1. Check the area path exists. If not: stop immediately, tell the engineer "Path `<area>` not found. Check the path and try again.", and do nothing further.
2. Root `AGENTS.md` (the canonical file): missing, with no legacy CLAUDE.md to migrate → run the whole-repo scan (`modes/whole-repo.md`) fully first (write root AGENTS.md + CLAUDE.md pointer), then continue with the area scan. Only a legacy root `CLAUDE.md` → run the legacy migration first. Exists → proceed directly.
3. Check if `<area>/AGENTS.md` exists; note present or missing.

The main thread writes the area's `AGENTS.md` itself, following the AREA phase in `agent-prompt.md`. Reading the area is the expensive part: for a large area, offload it to a read only `scout` subagent on the cheapest model (Claude Code: `haiku`, not inheriting the session model) that returns a compact map, then write from it; a small area, read directly. Read `agent-prompt.md` at write time. The inputs to apply: `PHASE=area`, `AREA=<path>`, root AGENTS.md path, area AGENTS.md path or MISSING. Add the nested pointer line to root `AGENTS.md` via the Edit tool; do not create root again. The AREA phase produces its `Root gaps flagged` output for you to handle below.

After writing, handle the `Root gaps flagged` section:
- `ROOT_GAPS: none` → relay the full report, done.
- Gaps exist → ask (one option marked recommended, the picker adds a free text custom slot last): Question: "I found things in `<area>` not reflected in root AGENTS.md. What should I do?" Option 1: `Add them now (recommended)`, description: "I'll apply the additions immediately". Option 2: `Show me the diff`, description: "Print exactly what would change; I'll apply it manually". Option 3: `Skip for now`, description: "Leave root AGENTS.md as is".
- On `Add them now`: locate the `ROOT_GAPS:` block and extract each line starting with `- ` (each holds the exact markdown to insert and the target section, `target section: ## <section>`). Apply one Edit call per gap into root `AGENTS.md`. Do not paraphrase.
- On `Show me the diff`: print each addition as a fenced markdown block with the target section labelled. Do not write.
- On `Skip for now`: do nothing.

Relay the full report after the choice is applied.
