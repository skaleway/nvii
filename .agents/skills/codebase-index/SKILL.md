---
name: codebase-index
description: "Use this skill when an agent needs to thoroughly index and understand every part of a codebase before working on it. Guides a depth-first, systematic inventory of all files, modules, dependencies, data flow, tests, configuration, and infrastructure. Produces a comprehensive codebase index artifact. Do not use for code review, bug diagnosis, module design, or general teaching."
compatibility: Works with any language or framework. Uses read, glob, and grep tools for exploration; no destructive operations.
---

@rules/exploration-depth.md
@rules/artifact-format.md
@rules/verification.md

# Codebase Index

> Index a codebase so thoroughly that nothing is left unknown.

Invoke this skill when you are dropped into an unfamiliar codebase and need to understand **every part of it** before making changes. It drives a structured, depth-first exploration that leaves no file, module, config, test, or data flow unexamined.

The output is a **codebase index artifact** - a durable reference the agent (and human) can consult for all future work.

<output_language>

All user-facing output (index artifact, summaries, reports, questions) defaults to English. Preserve source code identifiers, CLI commands, file paths, and config keys in their original form.

</output_language>

<purpose>

- Give agents a complete, verifiable mental model of an unfamiliar codebase.
- Ensure no file, directory, import, config, test, or data flow is overlooked.
- Produce a durable index artifact that survives across sessions.
- Document unknowns and human-clarification needs alongside findings.

</purpose>

<routing_rule>

Use `codebase-index` when the primary goal is **thoroughly understanding an existing codebase** - all of it, not just one module or one diff.

Do **not** use when:

- reviewing changes in a PR or branch (use `review`)
- diagnosing a specific bug (use `diagnosing-bugs`)
- designing a new module or interface (use `codebase-design`)
- teaching a concept or skill (use `teach`)

</routing_rule>

<instruction_contract>

| Field          | Contract                                                                                                                              |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Intent         | Agent builds a complete, verifiable mental model of the entire codebase.                                                              |
| Trigger        | User asks to index, onboard to, inventory, or exhaustively understand a codebase.                                                     |
| Scope          | Reading and synthesis only - the agent may read any file but must not edit, delete, or write outside the output artifact path.        |
| Authority      | Project-level docs (README, AGENTS.md, CONTRIBUTING.md) outrank generic archetype patterns in `references/`.                          |
| Evidence       | Every claim in the index artifact must cite its source file and line range.                                                           |
| Tools          | Read, Glob, Grep, and Task (for parallel module exploration). No edit, write, or destructive tools.                                   |
| Output         | A markdown index artifact at a path the agent can reference.                                                                          |
| Verification   | Run the verification checklist in `rules/verification.md` before marking done.                                                        |
| Stop condition | Artifact passes verification, or a documented blocker prevents further exploration (missing deps, permission denied, user interrupt). |

</instruction_contract>

<activation_examples>

Positive requests:

- "Index this codebase so I understand every part of it."
- "Give me a complete onboarding to this project, leave nothing out."
- "I need to fully comprehend this codebase before I make any changes."
- "Walk me through every module, every config, and every test in this project."
- "Explore this repo exhaustively and tell me everything about it."

Negative requests:

- "Review the changes in my PR." → use `review`
- "Find the bug causing this crash." → use `diagnosing-bugs`

Boundary requests:

- "Explain the architecture of this project." → if user wants a high-level overview, ask whether they need the full index or just the big picture. Full index → trigger; overview only → route to quick explanation.
- "Tell me about the main module." → if they want one module, do a focused deep-dive on that module rather than the whole codebase; if they want context around it, trigger the full index.

</activation_examples>

<trigger_conditions>

| Situation                                                                  | Mode              |
| -------------------------------------------------------------------------- | ----------------- |
| Agent has just entered an unfamiliar codebase and needs full understanding | full-index        |
| User explicitly asks for codebase onboarding/indexing                      | full-index        |
| User asks about a single module with explicit scope limit                  | focused-deep-dive |
| User asks for high-level overview only                                     | boundary-handoff  |

</trigger_conditions>

<workflow>

| Phase | Task                                                                                                               | Output                                                                                                      |
| ----- | ------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| 1     | **Surface Scan** - README, package.json, directory tree, language/framework detection, project type classification | Project identity card: name, language, framework, build system, repo structure (monorepo vs single package) |
| 2     | **Config & Entry Points** - build configs, environment files, routing, CLI entry points, main/index files          | Config inventory and entry-point map                                                                        |
| 3     | **Dependency Map** - trace internal module dependency graph (import/require chains), audit external dependencies   | Internal module dependency map + external dependency audit                                                  |
| 4     | **Domain & Data Flow** - key entities, data models, API contracts, state management, cross-module data flow        | Domain model map and data flow description                                                                  |
| 5     | **Testing & Infra** - test framework, test patterns, CI/CD config, deployment, Docker, infra-as-code               | Test strategy summary and infra inventory                                                                   |
| 6     | **Synthesis** - produce the index artifact, run the completeness check, flag unknowns for human                    | Final codebase index artifact                                                                               |

Phases 2–5 can run as parallel sub-agents when the codebase is large (see `rules/exploration-depth.md` for thresholds).

After Phase 6, the agent must run the **completeness backstop**: trace every import/require chain discovered in Phase 3 and verify each referenced file was explored. Any untouched file must be added to the index before completion.

### Next-file read order

1. `rules/exploration-depth.md` - before starting Phase 1, to set depth expectations
2. `rules/artifact-format.md` - before Phase 6, to shape the output
3. `rules/verification.md` - before declaring completion
4. `references/codebase-archetypes.md` - during Phase 1 if the project type is unclear

</workflow>

<required>

| Category     | Required                                                                  |
| ------------ | ------------------------------------------------------------------------- |
| Completeness | Every directory, file, config, test, and script must be cataloged.        |
| Traceability | Every claim cites its source file and line range.                         |
| Depth        | Follow `rules/exploration-depth.md` - do not stop at surface inspection.  |
| Artifact     | Produce a structured index artifact following `rules/artifact-format.md`. |
| Verification | Run `rules/verification.md` checklist before marking done.                |
| Unknowns     | Document unresolved questions and areas needing human input.              |

</required>

<forbidden>

| Category              | Avoid                                                                                   |
| --------------------- | --------------------------------------------------------------------------------------- |
| Edits                 | Do not modify any source file. Read-only mode.                                          |
| Omissions             | Do not skip files because they look "unimportant" - every file gets cataloged.          |
| Guesswork             | If a file's purpose is unclear, say so rather than guessing.                            |
| Over-abstraction      | Summarize groups of files, but also list every file individually in the index.          |
| Run-time side effects | No `npm install`, `composer install`, `docker build`, or other side-effecting commands. |

</forbidden>

<validation>

Must-pass thresholds:

- [ ] All top-level directories are listed and summarized.
- [ ] Every config file is identified (build, CI/CD, env, lint, editor, deploy).
- [ ] Every entry point is identified and traced.
- [ ] Internal dependency graph is complete: every import/require resolved.
- [ ] Test structure is documented (framework, location, naming convention).
- [ ] External dependencies are audited (package managers, registries, lock files).
- [ ] Index artifact covers all required sections from `rules/artifact-format.md`.
- [ ] Completeness backstop ran: no import references an unexplored file.
- [ ] Unknowns and human-clarification items are listed separately.
- [ ] Verification checklist from `rules/verification.md` is passed.

</validation>
