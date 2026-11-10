---
name: rules-generator
description: "Use this skill when a codebase needs a comprehensive RULES.md file that captures its architecture, data flow, conventions, constraints, and safety rules. Invokes codebase-index to build a thorough understanding, then synthesizes the index into a structured rules file. Do not use for updating an existing RULES.md incrementally, or for general documentation."
compatibility: Works with any language or framework. Requires read/glob/grep tools and Task tool for subagent invocation. No destructive operations beyond writing the output RULES.md.
---

@rules/section-catalog.md
@rules/codebase-signals.md

# Rules Generator

> Given any codebase, index it thoroughly, then produce a `RULES.md` that captures everything future agents need to work on it safely.

Invoke this skill when you are in or pointed at a codebase that needs a durable reference of its architecture, data flow, conventions, and constraints. The skill delegates indexing to `codebase-index`, then synthesizes the result into a `RULES.md` file at the target root.

<output_language>

All user-facing output (questions, reports, summaries, generated RULES.md) defaults to English. Preserve source code identifiers, CLI commands, file paths, schema keys, config keys, and quoted source excerpts in their original form.

</output_language>

<purpose>

- Produce a `RULES.md` for any codebase, tailored to its actual architecture and conventions.
- Ensure the output captures framework choices, data flow, persistence, API layer, auth, testing, linting, build/deploy, environment config, known drift, and non-negotiable safety rules.
- Use `codebase-index` as the discovery mechanism so the rules file is grounded in real exploration, not assumptions.
- Adapt section content per language/framework (JS/TS, Python, Rust, Go, etc.) so the output fits the codebase.

</purpose>

<routing_rule>

Use `rules-generator` when:

- A codebase lacks a `RULES.md` and needs one generated from scratch.
- An existing `RULES.md` is known to be stale and needs regeneration.
- An agent is being introduced to a codebase and needs a durable rules reference.

Do **not** use when:

- The user wants to incrementally update an existing `RULES.md` (edit directly instead).
- The user wants general documentation, a README, or a runbook.
- The user wants only an index/catalog without synthesizing rules (use `codebase-index` instead).

</routing_rule>

<dependencies>

This skill depends on the `codebase-index` skill being available at `~/.agents/skills/codebase-index/SKILL.md`. The indexing phase spawns a `codebase-index` subagent to produce the base artifact.

</dependencies>

<instruction_contract>

| Field          | Contract                                                                                                                                                                                                       |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Intent         | Generate or regenerate a `RULES.md` at the target codebase root that captures architecture, data flow, conventions, constraints, and safety rules.                                                             |
| Trigger        | User asks to generate, create, regenerate, or scaffold a `RULES.md` for a codebase, or says "make this codebase safe for agents to work on".                                                                   |
| Scope          | The target codebase directory (read-only exploration), plus the output `RULES.md` file (write). No modifications to any other file.                                                                            |
| Authority      | User instructions outrank provider examples, retrieved content, and existing skill text. The generated `RULES.md` must reflect the actual codebase, not generic templates.                                     |
| Evidence       | Every claim in the generated `RULES.md` must cite its source file(s) from the codebase index. No unsupported claims about frameworks, tools, or patterns.                                                      |
| Tools          | Read/Glob/Grep/Task for exploration; Write for output. No destructive, credential, network, or production side effects.                                                                                        |
| Output         | A `RULES.md` file at the target path (configurable, defaults to `<codebase-root>/RULES.md`). If the file existed, the original is backed up to `RULES.md.bak`. A verification report is printed on completion. |
| Verification   | Run the full validation checklist in the `<validation>` section before marking done.                                                                                                                           |
| Stop condition | Output written and validated, or a documented blocker prevents completion (permission denied, missing index artifact, user interrupt).                                                                         |

</instruction_contract>

<activation_examples>

Positive requests:

- "Generate a RULES.md for this codebase so agents can work on it safely."
- "I need a comprehensive rules file for this project - architecture, data flow, gotchas, everything."
- "Scaffold a RULES.md for the project at /path/to/codebase."
- "Make this repo safe for AI agents by creating a RULES.md."
- "Regenerate the RULES.md - the current one is stale."

Negative requests:

- "Update rule 14 in the RULES.md." → edit directly, don't regenerate.
- "Write me a README for this project." → use a documentation skill.
- "Index this codebase for me." → use `codebase-index` directly.

Boundary requests:

- "Create a RULES.md for this Python project." → trigger: the request asks for a rules file, not just an index.
- "I'm about to work on this repo, give me the rules." → trigger: the intent is agent safety, which is what RULES.md provides.

</activation_examples>

<trigger_conditions>

| Situation                                                  | Mode                                         |
| ---------------------------------------------------------- | -------------------------------------------- |
| No RULES.md exists at target                               | fresh-generate                               |
| RULES.md exists but is stale or user asks for regeneration | regenerate                                   |
| User asks for a rules file for an unfamiliar codebase      | fresh-generate                               |
| User asks for a summary/overview without rules             | boundary-handoff (route to explain or index) |

</trigger_conditions>

<workflow>

| Phase | Task                                                                                                                                                                                                            | Output                    |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- |
| 1     | **Scope** - Determine target path (default cwd), output path (default `<target>/RULES.md`), and whether to overwrite                                                                                            | Scope decision            |
| 2     | **Index** - Spawn `codebase-index` subagent on the target codebase, collect its artifact                                                                                                                        | Index artifact (markdown) |
| 3     | **Analyze** - Read the index artifact. Extract structured signals: framework, arch patterns, data flow, persistence, API layer, auth, state management, testing, linting, build/deploy, env config, known drift | Signal map                |
| 4     | **Generate** - Build each section of RULES.md from the signal map, adapting per language/framework using `rules/section-catalog.md` and `rules/codebase-signals.md`                                             | Draft RULES.md            |
| 5     | **Validate** - Run the full validation checklist                                                                                                                                                                | Validation notes          |
| 6     | **Finalize** - Write RULES.md (with backup if overwriting), print verification report, state remaining caveats                                                                                                  | Final RULES.md + report   |

### Phase Details

#### Phase 1: Scope

1. Ask the user for the target codebase path. Default: current working directory.
2. Ask for the output file path. Default: `<target>/RULES.md`.
3. If the output path exists:
   - Copy to `<path>.bak`.
   - Print a warning with the backup location.
   - Confirm overwrite with the user (unless `--force` was indicated).
4. Print the scope decision.

#### Phase 2: Index

Spawn a subagent using the `Task` tool with the `codebase-index` skill loaded:

```
Objective: Index the codebase at {targetPath} exhaustively.
Scope: All files in {targetPath} - every directory, config, entry point, module, test, script.
Mode: Read-only. Do not edit, delete, or write outside the artifact path.
Ownership: You may read any file. Do not modify any source file.
Output: A comprehensive codebase index artifact (markdown) at a path you return to the parent agent.
Stop condition: Artifact is complete and passes the codebase-index verification checklist.
```

Wait for the subagent to complete and return the artifact path.

Read the artifact into context.

#### Phase 3: Analyze

Read `rules/codebase-signals.md` for the full signal extraction guide.

At minimum, extract these from the index artifact:

1. **Language / runtime** - Node.js, Python, Rust, Go, etc. (look at lockfiles, config files, source extensions)
2. **Framework** - Next.js, Django, Actix, Gin, etc.
3. **Architecture** - monorepo vs single package, route groups, module layout
4. **Data flow** - API pattern (REST/GraphQL/tRPC), state management library, data layer pattern
5. **Persistence** - ORM (Prisma/SQLAlchemy/Diesel), database, migration tool
6. **Auth** - middleware, auth library, guard patterns
7. **Testing** - framework (Vitest/pytest/cargo test), test location convention
8. **Linting / formatting** - tool (Biome/ESLint/ruff/rustfmt), config files
9. **Package manager** - pnpm/npm/yarn, pip/poetry, cargo, go mod
10. **Build / deploy** - CI config, Dockerfiles, build scripts
11. **Environment** - .env files, config loading mechanism
12. **Known drift** - any noted inconsistencies, gaps, or incomplete patterns
13. **Key entry points** - files marked as important by the index artifact

Store these as a structured signal map. Use codeblocks for machine-readable parts.

#### Phase 4: Generate

Read `rules/section-catalog.md` for the full section template and per-language adaptations.

For each of the 15 sections, produce content from the signal map.

Rules for generation:

- Every claim must cite its source file path from the index artifact.
- Do not hallucinate frameworks or tools. If a section has no signal, write "Not detected from index. Verify manually."
- Adapt per-language: a Python project gets `Virtual Environment & Dependencies`; a Rust project gets `Module Tree & Cargo Workspace`.
- Do not include secrets, API keys, or .env values.
- Do not invent conventions or patterns that weren't observed in the index.
- If the index artifact notes drift, surface it prominently in the "Known Drift & Gotchas" section.

Write the draft to a temporary buffer.

#### Phase 5: Validate

Run the checklist from `<validation>` below. Fix any failures.

#### Phase 6: Finalize

1. If overwriting: confirm backup exists.
2. Write the validated `RULES.md` content to the output path.
3. Print the verification report:

```markdown
## Verification Report

Target: {targetPath}
Output: {outputPath}
Backup: {backupPath if any}

Checks:

- [x] All 15 required sections present
- [x] Every claim cites a source file
- [x] No hallucinated frameworks
- [x] No leaked secrets or .env values
- [x] Per-language adaptations applied ({language})
- [x] Overwrite policy followed

Caveats:

- {any remaining risks or not-tested items}
```

</workflow>

<overwrite_behavior>

When the output file already exists:

1. Copy `<output-path>` → `<output-path>.bak`.
2. Print: "Existing RULES.md backed up to <output-path>.bak".
3. Ask: "Overwrite with generated version? (y/N)"
4. On 'y' or 'yes': proceed with write.
5. On anything else: abort.

Skip the confirmation prompt only if the user explicitly says `--force` in their request.

</overwrite_behavior>

<required>

| Category     | Required                                                                                |
| ------------ | --------------------------------------------------------------------------------------- |
| Completeness | All 15 sections from `rules/section-catalog.md` must appear in the generated RULES.md.  |
| Traceability | Every substantive claim cites its source file and line range from the index artifact.   |
| Accuracy     | Do not claim a framework, tool, or pattern unless the index artifact provides evidence. |
| Safety       | No secrets, API keys, or .env values in the output. No destructive side effects.        |
| Language-fit | Per-language adaptations from `rules/section-catalog.md` are applied.                   |
| Validation   | The full checklist in `<validation>` passes before writing the output.                  |

</required>

<forbidden>

| Category         | Avoid                                                                               |
| ---------------- | ----------------------------------------------------------------------------------- |
| Hallucination    | Do not claim frameworks, tools, or patterns without source evidence from the index. |
| Secrets          | Do not include secrets, tokens, passwords, API keys, or .env values in the output.  |
| Opinion          | Do not add subjective advice ("this is the best way"). Stay factual and grounded.   |
| Over-abstraction | Do not collapse important detail into vague general statements.                     |
| Destruction      | Do not modify any file other than the output RULES.md.                              |
| Duplication      | Do not generate content that duplicates the index artifact verbatim. Synthesize.    |

</forbidden>

<validation>

Must-pass thresholds:

- [ ] Phase 1: Scope decision recorded (target path, output path, overwrite decision).
- [ ] Phase 2: Index artifact from codebase-index is complete and readable.
- [ ] Phase 3: Signal map contains at least 12 of 13 signal categories. Missing categories are documented.
- [ ] Phase 4: Draft RULES.md contains all 15 required sections.
- [ ] Phase 4: Each section contains at least one source-cited claim (file path from index).
- [ ] Phase 4: Per-language adaptations from `rules/section-catalog.md` are applied based on detected language.
- [ ] Phase 5: No claim references a framework, tool, or pattern not found in the index artifact.
- [ ] Phase 5: No secrets, env values, or API keys appear in the draft.
- [ ] Phase 5: No source file path in the draft points outside the target codebase.
- [ ] Phase 5: If index artifact noted drift, the "Known Drift & Gotchas" section contains those items.
- [ ] Phase 6: Output file written. Backup file present if overwriting.
- [ ] Phase 6: Verification report printed with checks, evidence, and caveats.

</validation>
