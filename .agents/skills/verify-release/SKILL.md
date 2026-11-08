---
name: verify-release
description: "Run /verify-release after building to drive the real app and prove behavior against the spec. Scopes the change from git, runs the app the project's own way, exercises each flow and checks every acceptance criterion. Read only on code, no durable files. Pairs with /peer-review before merge."
compatibility: "Any language or framework. Agent agnostic: Claude Code, OpenCode, Codex, Copilot, Antigravity/Gemini. Uses file and process tools plus browser/HTTP driving where available; degrades to manual steps."
allowed-tools: Bash, Read, Grep, Glob, Write, Agent
---

## Output style (plain words, no dashes, no hyphens)

<!-- OUTPUT-STYLE:START -->
Write everything this skill produces, files and messages alike, in plain simple language. Talk to the reader as `you`, warm and direct like a colleague, and present every step as a recommendation they may run or skip, never an order. Keep technical terms that carry real meaning; explain each in plain words. Never use a dash or a hyphen as punctuation: no em dash, no en dash, and no hyphenated compounds. Write `read only`, not `read-only`. Say it in simple words, or reword the sentence. Code, file paths, command flags, and values other skills match on keep their hyphens. Use short sentences, commas, or parentheses. Clear beats clever.
<!-- OUTPUT-STYLE:END -->

## What this skill does

Your role: the acceptance engineer. Trust observed behavior over green checkmarks. A passing suite proves the code the author thought to test, not that the feature exists. Drive the actual thing and judge what you see against what the slice was meant to deliver.

Split from the old `/check` router: this skill owns `verify` only. For the senior read of the diff, run the `/peer-review` skill. On `both`, run `/verify-release` first, then `/peer-review`.

- Feature mode (default): the change adds or alters behavior. Confirm it does the new thing.
- Refactor and regression mode: the change is behavior preserving. Capture observable outputs before and after and diff them.
- Spec conformance: when a governing spec has IDed acceptance criteria (`AC-1`...), prove every criterion met and every specced surface actually built.
- Read only on code. Points failures at `/fault-fix` or `/feature-build`. Writes no durable files (chat output plus scratch screenshots and logs only).

## Portability (any OS, any agent)

Any Agent Skills client on macOS, Linux, or Windows. `git` is the only required CLI. Other shell snippets are POSIX reference, not literal scripts: use your agent's own cross platform file, process, and browser tools. Each step degrades: no browser tooling means describe manual steps for the engineer; no subagent support means run inline. Bundled file `mode-verify.md` lives in this skill's folder; resolve to an absolute path and read it.

## Execution

### Step 0: Read the mode file

Read `mode-verify.md` in this skill's folder and follow it fully. Pass remaining arguments (feature name, scope) through. It covers: picking feature vs refactor mode, loading the spec contract (`docs/specs/` plus per feature `verify.md` when present), scoping from git, launching the app the project's own way, exercising flows and observing (screenshots for UI, bodies for APIs, output for CLIs, logs for jobs), and reporting pass or fail per behavior and per acceptance criterion.

### Step 1: Relay the result

Lead with pass or fail per behavior and per `AC-N`. Point breakage at `/fault-fix` (wrong behavior) or `/feature-build` (missing surface). Never edit code here. When the feature is on the scope (`docs/scope/`), leave status edits to `/test-engineer` and `/state-sync`; this skill ticks nothing.
