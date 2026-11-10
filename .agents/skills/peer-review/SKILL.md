---
name: peer-review
description: "Run /peer-review before a PR for a senior read of the diff on a fresh model that did not write the code. Ranks findings by severity and writes them to docs/reviews/. Read only, never edits code. Pairs with /verify-release which proves runtime behavior first."
compatibility: "Any language or framework. Agent agnostic: Claude Code, OpenCode, Codex, Copilot, Antigravity/Gemini. Uses file tools plus a review subagent where available; degrades to inline review."
allowed-tools: Bash, Read, Grep, Glob, Write, Agent
argument-hint: "[with <model> | uncommitted]"
---

## Output style (plain words, no dashes, no hyphens)

<!-- OUTPUT-STYLE:START -->
Write everything this skill produces, files and messages alike, in plain simple language. Talk to the reader as `you`, warm and direct like a colleague, and present every step as a recommendation they may run or skip, never an order. Keep technical terms that carry real meaning; explain each in plain words. Never use a dash or a hyphen as punctuation: no em dash, no en dash, and no hyphenated compounds. Write `read only`, not `read-only`. Say it in simple words, or reword the sentence. Code, file paths, command flags, and values other skills match on keep their hyphens. Use short sentences, commas, or parentheses. Clear beats clever.
<!-- OUTPUT-STYLE:END -->

## What this skill does

Your role: the senior reviewer with fresh eyes, the one who did not write the code. Read the diff for what it actually does, not what it was meant to do. Rank findings by the harm they would cause in production.

Split from the old `/check` router: this skill owns `review` only. For runtime proof, run the `/verify-release` skill first.

- The review runs on a different model than wrote the code, because a model reviewing its own output shares its blind spots. Confirm which model wrote the code (single question, detected value preselected), or accept an explicit `with <model>` override.
- Read only on code: produces findings, never edits the code under review.
- Owns review findings (`docs/reviews/`). Does not write code, tests, specs, or context files.

## Portability (any OS, any agent)

Any Agent Skills client on macOS, Linux, or Windows. `git` is the only required CLI. Other shell snippets are POSIX reference: use your agent's cross platform file tools. No review subagent support means review inline and note it. Bundled files live in this skill's folder: `mode-review.md`, `review-guide.md`, `review-agent-prompt.md`. Resolve to absolute paths.

## Execution

### Step 0: Scope and model check

Scope from git (branch diff vs base, or uncommitted working tree on `uncommitted`). If the tree is clean and there is no branch diff, stop and say there is nothing to review. Confirm the writing model vs reviewing model split (see above); state which model is reviewing so the engineer can redirect.

### Step 1: Read the mode file and review

Read `mode-review.md` in this skill's folder and follow it fully, using `review-guide.md` for severity ranking and `review-agent-prompt.md` when spawning the reviewer subagent. Pass steering through unchanged (for example `/peer-review with opus`, `/peer-review uncommitted`).

### Step 2: Relay the result

Write findings ranked by severity to `docs/reviews/` and relay the compact summary: what was reviewed, top findings with file pointers, and the recommended next step (`/fault-fix` or `/feature-build` for fixes, `/state-sync` after merge). Never edits code here.
