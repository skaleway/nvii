# Index Artifact Format

**Purpose**: Define the required structure of the codebase index artifact so every index is complete and consistent.

## 1. Required Sections

Every index artifact must include these sections in order:

### 1.1 Project Identity Card

| Field | Description |
|---|---|
| Project name | From README or package.json |
| Primary language | Detected from file extensions and build system |
| Framework(s) | Web framework, UI library, test framework, etc. |
| Build system | npm, pip, cargo, gradle, make, etc. |
| Package manager | npm, pip, yarn, cargo, go modules, etc. |
| Repo structure | Monorepo / single package / multi-repo |
| Line count | `find . -name '*.ext' | xargs wc -l` by language |
| File count | Total non-generated, non-vendored files |

### 1.2 Top-Level Directory Map

```
project-root/
├── src/                # source code
│   ├── core/           # business logic (inspect)
│   ├── api/            # HTTP handlers (inspect)
│   └── utils/          # utilities (catalog)
├── tests/              # test suite (catalog)
├── config/             # configuration (inspect)
├── docs/               # documentation (catalog)
└── scripts/            # build/deploy scripts (catalog)
```

Each entry shows the directory name, one-line purpose, and the exploration depth level used.

### 1.3 Entry Points

List every way the application can be started or invoked:

- CLI entry points (bin scripts, CLI commands)
- HTTP endpoints (routes, methods, handlers)
- Background jobs / workers / cron
- Exported library API surface
- Test entry points

For each entry point, document: file path, how it's invoked, what it does at a high level.

### 1.4 Configuration Inventory

Every config file, grouped by purpose:

| Purpose | Files |
|---|---|
| Build | tsconfig.json, webpack.config.js, Cargo.toml |
| Environment | .env, .env.example, config/*.yml |
| CI/CD | .github/workflows/*.yml, Jenkinsfile, Dockerfile |
| Lint/Format | .eslintrc, .prettierrc, rustfmt.toml |
| Editor | .editorconfig, .vscode/* |
| Deploy | docker-compose.yml, k8s/*, Terraform/* |

For each file, note: path, format (JSON/YAML/TOML/INI), and key settings relevant to understanding the project.

### 1.5 Module Dependency Map

List every module (directory containing code) and its dependencies:

```
Module: src/core/payments
Depends on: src/core/users, src/utils/validation
Used by: src/api/payments, src/workers/billing
```

For the full dependency graph, prefer a text-based tree or bullet list rather than ASCII diagrams.

### 1.6 Domain Model

Key entities, data structures, and their relationships:

```
User:
  - id: UUID
  - name: string
  - email: string
  - references: Account[], Order[]
  - defined in: src/core/users/model.ts

Account:
  - id: UUID
  - balance: Decimal
  - owner: User
  - defined in: src/core/accounts/model.ts
```

Include database tables, API request/response schemas, and internal data types.

### 1.7 External Dependency Audit

| Package | Version | Purpose | Used by |
|---|---|---|---|
| express | ^4.18 | HTTP framework | src/api/ |
| zod | ^3.22 | Validation | src/core/*, src/api/* |

Group by runtime vs dev dependency. Note any deprecated or unmaintained packages.

### 1.8 Test Strategy

| Aspect | Detail |
|---|---|
| Framework | jest, pytest, cargo test, etc. |
| Location | tests/, src/**/*.test.ts |
| Naming convention | *.test.ts, *.spec.ts, test_*.py |
| Coverage targets | Any thresholds in config |
| CI integration | Which tests run in CI |
| Test types | Unit, integration, e2e, snapshot |

### 1.9 Infrastructure Summary

- CI/CD pipeline: platform (GitHub Actions, GitLab CI, Jenkins) and stages
- Deployment: Docker, serverless, k8s, manual
- Hosting / cloud provider
- Monitoring / logging (if detectable)
- Any infrastructure-as-code files

### 1.10 Unknowns & Human Questions

List anything that was unclear, required judgment, or needs a human to confirm:

- "The purpose of `src/lib/legacy/` is unclear - looks like old migrations but no documentation."
- "The `.env.production` file is gitignored; values are unknown."
- "The `sendEmail` function in `src/core/notifications.ts` is called but never imported - possibly dead code."
- "CI/CD config references a `DEPLOY_KEY` secret; no further context found."

## 2. Section Format

Each section should follow this structure:

```markdown
### N. Section Title

**Summary**: One paragraph overview.

**Files examined**: [list of file paths explored]

**Findings**:
- Key point 1 (source: `path/to/file.ts:12-45`)
- Key point 2 (source: `path/to/file.ts:80-120`)

**Depth**: inspect / catalog / scan / skip
```

## 3. Output Path

The index artifact should be written to a path the agent and user can reference. Default to `CODEBASE_INDEX.md` in the project root if no path is specified. If the project root is not writable, write to the agent's session context and inform the user.

## 4. Updating

If the skill is invoked again on the same codebase, the agent should:
1. Read the existing `CODEBASE_INDEX.md`.
2. Note the git HEAD SHA at the time of the last index.
3. Diff against the current HEAD.
4. Update only the changed sections, preserving the rest.
5. Bump the "last indexed" timestamp.
