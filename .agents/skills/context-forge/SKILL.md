---
name: context-forge
description: "Run /context-forge when a codebase needs enforceable working rules for AI agents. Invokes /codebase-audit for evidence, extracts architecture, data flow, auth, testing and deploy signals, then writes the rules section into AGENTS.md (canonical) instead of a separate RULES.md. Fresh generate or regenerate only, never incremental edits."
compatibility: "Any language or framework. Agent agnostic: Claude Code, OpenCode, Codex, Copilot, Antigravity/Gemini. Uses file tools plus subagents where available; only writes the rules target plus a backup."
allowed-tools: Bash, Read, Grep, Glob, Write, Edit, Agent
---

## Output style (plain words, no dashes, no hyphens)

<!-- OUTPUT-STYLE:START -->
Write everything this skill produces, files and messages alike, in plain simple language. Talk to the reader as `you`, warm and direct like a colleague, and present every step as a recommendation they may run or skip, never an order. Keep technical terms that carry real meaning; explain each in plain words. Never use a dash or a hyphen as punctuation: no em dash, no en dash, and no hyphenated compounds. Write `read only`, not `read-only`. Say it in simple words, or reword the sentence. Code, file paths, command flags, and values other skills match on keep their hyphens. Use short sentences, commas, or parentheses. Clear beats clever.
<!-- OUTPUT-STYLE:END -->

## What this skill does

Turns codebase evidence into enforceable agent rules. Slim successor to the legacy `rules-generator`: same 13 signal map and 15 section catalog (reused in `rules/`), but the output target is the canonical `AGENTS.md` rules section so every harness (Claude, OpenCode, Codex, Copilot, Antigravity) reads it. Only creates a standalone `RULES.md` when the engineer explicitly asks for a separate file.

- Fresh generate (no rules yet) or regenerate (stale rules). Incremental single rule edits are out of scope; edit the file directly.
- Depends on the `/codebase-audit` skill for evidence. Never invents beyond the index; missing signals are marked `Not detected, verify manually`.
- Writes only the rules target plus a `.bak` backup. Never leaks secrets or env values. Every substantive claim cites its source file.

## Dependencies

Run the `/codebase-audit` skill for the index artifact first (or reuse a fresh one). Shared references live in this skill's `rules/` folder: `codebase-signals.md` (13 signal extraction guide) and `section-catalog.md` (15 section templates with per language adaptations). `references/example-rules.md` is tone only, not normative.

## Portability (any OS, any agent)

Any Agent Skills client on macOS, Linux, or Windows. `git` is the only required CLI; other snippets are POSIX reference. No subagent support means run the index inline. Resolve bundled files to absolute paths.

## Execution

### Step 1: Scope

Ask target codebase path (default: current directory) plus output target (default: the nearest `AGENTS.md` rules section; only use `RULES.md` on explicit request). On overwrite, copy the existing file to `.bak` and confirm unless `--force`.

### Step 2: Index

Run the `/codebase-audit` skill (read only) and read its artifact into context. Wait for its verification pass before continuing.

### Step 3: Analyze

Follow `rules/codebase-signals.md`. Extract the 13 signals (language and runtime, framework, architecture, data flow, persistence, API, auth, testing, lint and format, package manager, build and deploy, env, drift) plus key entry points. Store as a YAML signal map.

### Step 4: Generate

For each of the 15 sections build from the signal map per `rules/section-catalog.md`: per claim citations, per language adaptation, no secrets, no invention. Surface drift in the Known Drift section and hard safety rules in the Non-Negotiable section.

### Step 5: Validate

Run the checks: 15 sections present, at least 1 cited claim per section, at least 12 of 13 signals or documented gaps, no unevidenced framework claims, no secrets, no out of target paths, drift propagated, overwrite policy honored.

### Step 6: Finalize

Write the rules target, print the verification report (target, output, backup plus checks and caveats). Point to `/state-sync` for future maintenance; this skill never maintains rules after the change.
