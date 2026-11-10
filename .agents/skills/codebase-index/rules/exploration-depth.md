# Exploration Depth

**Purpose**: Define how deep to explore each part of the codebase - when to drill down to every function and when a directory summary is enough.

## 1. Depth Levels

| Level | Description | When to use |
|---|---|---|
| **catalog** | List every file in the directory with a one-line purpose. Read the first 20 lines of each file. | Directories with many small, similar files (e.g., utility modules, migration scripts, generated code). |
| **inspect** | Read every file in full. Trace all imports/exports. Document exported symbols, key functions, types. | Core modules, entry points, data models, API routes, main business logic. |
| **scan** | Read only the file headers, exports, and public API surface. Do not trace internal implementation. | Third-party wrappers, adapters, polyfills, type definition files (`.d.ts`), vendored dependencies. |
| **skip** | List the directory and note its purpose but do not read individual files. | Generated output directories (`dist/`, `build/`, `node_modules/`, `.git/`), dependency caches, IDE config. |

## 2. Default Depth by Target

| Codebase area | Default depth | Rationale |
|---|---|---|
| Entry points (main, app, index, CLI) | inspect | Understand how the application starts and routes. |
| Core domain modules | inspect | Business logic is where complexity lives. |
| Data models, schemas, types | inspect | Data shapes are referenced everywhere. |
| API routes, controllers, handlers | inspect | Every endpoint is a contract point. |
| Configuration files | inspect | Configs control behavior; missing one means missing understanding. |
| Tests | catalog | Test structure matters; individual test content can be sampled. |
| Utility / helper modules | catalog | Read enough to know what's available. |
| Migration scripts | catalog | Note what they do; skip full reading unless DB schema is in focus. |
| Build / CI config | scan | Note the system used and key scripts; don't trace every CI step. |
| Documentation files | catalog | Note topics covered; read in full only if relevant to the index. |
| Generated / vendored code | skip | Not author-intent code. |
| Lock files, binary files | skip | Not human-readable structure. |

## 3. Parallelization Threshold

If the codebase has more than 20 top-level directories or more than 500 files (excluding `skip`-level areas), spawn parallel sub-agents for Phases 2–5.

Each sub-agent should receive:

```
Objective: [phase name for this directory/module group]
Scope: [specific directories or modules]
Mode: read-only
Ownership: these files only
Output: structured findings in the format from `rules/artifact-format.md#section-format`
Stop condition: all files in scope cataloged at the required depth, or blocker documented
```

## 4. Depth Adjustment Rules

- If a file at `catalog` depth reveals unexpected complexity (e.g., a utility module that actually contains business logic), promote to `inspect`.
- If a file at `inspect` depth is clearly boilerplate (e.g., getter/setter wrappers), demote to `catalog`.
- When in doubt, use the deeper level. The skill's goal is completeness.

## 5. Stopping

Stop exploring a directory only when:

- Every file has been read at the assigned depth level.
- Files at `inspect` depth have had their imports traced.
- The directory's purpose, relation to other modules, and ownership (if discernible) are documented.
- Or a blocker is documented (permission denied, missing dependency, binary format).

Do not skip a directory because it "looks like it doesn't matter." If you can't determine the depth, use `inspect`.
