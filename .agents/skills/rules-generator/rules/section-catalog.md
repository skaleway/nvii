# Section Catalog

> Defines the 15 required sections for the generated `RULES.md`, their content requirements, and per-language adaptations.

Each section in the generated `RULES.md` should start with a level-2 heading (`##`). Sections must appear in the order listed below.

---

## 1. Tech Stack & Framework

**Purpose**: Declare the primary language(s), runtime, framework, and major libraries.

| Signal needed | Source |
|---|---|
| Primary language | Source file extensions, lockfile type |
| Runtime | Toolchain version files (`.nvmrc`, `.python-version`, `go.mod` `go` directive) |
| Framework | Config files (`next.config`, `manage.py`, `Cargo.toml` dependencies) |
| Major libraries | `package.json` dependencies, `requirements.txt`, `Cargo.toml` |

**Per-language adaptations**:

| Language | Additional details to include |
|---|---|
| JavaScript/TypeScript | Node version, framework (Next.js, Express, etc.), bundler (webpack, Vite, Turbopack) |
| Python | Python version, web framework (Django, FastAPI, Flask), task runner (Celery) |
| Rust | Edition, major crate categories (web, DB, async runtime) |
| Go | Go version, major module dependencies |
| Generic | Language version, main build system |

**Output template**:

```markdown
## 1. Tech Stack & Framework

- Language: {language} {version} - detected from {source_file}
- Runtime: {runtime} - detected from {source_file}
- Framework: {framework} - configured in {source_file}
- Package manager: {manager} - lockfile at {lockfile_path}
- Key dependencies: {list of major deps with source_file}
```

---

## 2. Architecture & Directory Layout

**Purpose**: Document the top-level directory structure, route groups, module organization, and architectural patterns.

| Signal needed | Source |
|---|---|
| Top-level directory tree | `ls` output, index artifact |
| Route/URL structure | Route files, URL config |
| Module organization | `src/`, `app/`, `lib/`, `packages/` layout |
| Monorepo structure | Workspace config files |

**Per-language adaptations**:

| Language | Additional details to include |
|---|---|
| JavaScript/TypeScript | App Router route groups (if Next.js), `src/` vs root layout, route group purposes |
| Python | Django app structure, `urls.py` patterns |
| Rust | Cargo workspace members, crate dependency direction |
| Go | Internal vs pkg directory convention |
| Generic | Top-level dir responsibilities |

**Output template**:

```markdown
## 2. Architecture & Directory Layout

{top_level_tree_summary}

### Route Groups / Module Layout
{list of major directories and their purpose}

### Key Layout Rules
{rules about where code belongs, detected from patterns}
```

---

## 3. Data Flow

**Purpose**: Document how data moves through the system - from UI/entry point to persistence and back.

| Signal needed | Source |
|---|---|
| API call pattern | Hook files, service files, API client code |
| State management library | `package.json` deps, import analysis |
| Data layer pattern | Repository, service, direct DB access |
| Streaming/async patterns | WebSocket, Server-Sent Events, polling code |

**Per-language adaptations**:

| Language | Additional details to include |
|---|---|
| JavaScript/TypeScript | React Query hooks, Zustand stores, Redux slices, axios/fetch usage |
| Python | Django REST serializers, FastAPI dependency injection |
| Rust | Actor pattern, channels, async stream handling |
| Go | Handler → service → repository chain |
| Generic | Request/response flow diagram (text), middleware chain |

**Output template**:

```markdown
## 3. Data Flow

The canonical data flow is:

```
{entry_point} → {logic_layer} → {api_layer} → {persistence_layer}
```

{detailed description of each layer}
```

---

## 4. State Management & Caching

**Purpose**: Document client-side state and server-state caching strategy.

| Signal needed | Source |
|---|---|
| Query client config | Query provider files |
| Cache key structure | Key definition files |
| Client state stores | Store files (Redux, Zustand, Pinia, etc.) |
| Cache invalidation pattern | Mutation hooks, invalidation calls |

**Per-language adaptations**:

| Language | Additional details to include |
|---|---|
| JavaScript/TypeScript | TanStack Query config, Zustand persist middleware, key registry |
| Python | Django cache framework, Redis setup |
| Rust | Caching crates, memoization patterns |
| Go | sync.Map, custom cache implementations |
| Generic | Cache layers (in-memory, Redis, DB) |

**Output template**:

```markdown
## 4. State Management & Caching

- Server state: {library} - configured in {source_file} with staleTime={value}
- Client state: {library} - stores in {store_files}
- Cache keys: centralized in {key_file}
- Cache invalidation: {pattern_description}
```

---

## 5. Persistence / Database

**Purpose**: Document the database, ORM, migration strategy, and schema conventions.

| Signal needed | Source |
|---|---|
| Database type | ORM/driver config |
| ORM | Import analysis, config files |
| Migration tool | Migration directory, config |
| Schema source of truth | Schema definition files |
| Key models/entities | Schema or model files |

**Per-language adaptations**:

| Language | Additional details to include |
|---|---|
| JavaScript/TypeScript | Prisma schema location, migration commands |
| Python | Django models, Alembic migrations, SQLAlchemy |
| Rust | Diesel schema, sqlx migrations |
| Go | GORM models, sql-migrate |
| Generic | Table naming conventions, migration workflow |

**Output template**:

```markdown
## 5. Persistence / Database

- Database: {db_type} - configured in {source_file}
- ORM: {orm} - schema at {schema_file}
- Migrations: {tool} - directory at {migration_dir}
- Schema source of truth: {schema_file}
- Key models: {list with source line references}
- Migration command: {command}
```

---

## 6. API Layer

**Purpose**: Document the API structure, conventions, and contracts.

| Signal needed | Source |
|---|---|
| API route structure | Route directory listing |
| API pattern | REST/GraphQL/tRPC/gRPC detection |
| Request validation | Validation library usage |
| Response format | Response wrapper patterns |
| Error handling | Error middleware, error response format |

**Per-language adaptations**:

| Language | Additional details to include |
|---|---|
| JavaScript/TypeScript | Next.js route handlers, tRPC routers, GraphQL resolvers |
| Python | Django REST Framework viewsets, FastAPI routers |
| Rust | Axum handlers, Actix routes |
| Go | chi/gin/echo router patterns |
| Generic | Route prefix convention, auth middleware on routes |

**Output template**:

```markdown
## 6. API Layer

- Pattern: {REST/GraphQL/tRPC/gRPC}
- Route structure: {route_tree_summary}
- Validation: {tool} - {location}
- Response format: {description}
- Error handling: {description}
```

---

## 7. Authentication & Authorization

**Purpose**: Document how users authenticate and how access control works.

| Signal needed | Source |
|---|---|
| Auth library | Config/import analysis |
| Auth middleware | Middleware/guard files |
| Session strategy | JWT / session cookie / OAuth |
| Role/permission model | Role enums, permission checks |
| Auth route guards | Protected route patterns |

**Per-language adaptations**:

| Language | Additional details to include |
|---|---|
| JavaScript/TypeScript | NextAuth/Better Auth config, middleware.ts guards |
| Python | Django auth system, DRF permissions |
| Rust | Tower middleware auth layers |
| Go | Middleware chains, context-based auth |
| Generic | Auth provider, protected vs public routes |

**Output template**:

```markdown
## 7. Authentication & Authorization

- Auth library: {library} - configured in {source_file}
- Strategy: {session/JWT/OAuth}
- Middleware: {middleware_file} - guards {guarded_routes}
- Admin role: {admin_check_details}
- Rules: {auth_rules_from_index}
```

---

## 8. Testing

**Purpose**: Document the testing strategy, framework, and conventions.

| Signal needed | Source |
|---|---|
| Test framework | Config files, dev dependencies |
| Test location | `__tests__/`, `*.test.ts`, `tests/` conventions |
| Test commands | `package.json` scripts, `Makefile` |
| Coverage tool | Coverage config |
| CI test integration | CI config files |

**Per-language adaptations**:

| Language | Additional details to include |
|---|---|
| JavaScript/TypeScript | Vitest/Jest config, testing library usage |
| Python | pytest config, Django test runner |
| Rust | `#[cfg(test)]` module convention, integration tests in `tests/` |
| Go | `_test.go` convention, `go test` patterns |
| Generic | Test naming convention, mocking strategy |

**Output template**:

```markdown
## 8. Testing

- Framework: {framework} - configured in {config_file}
- Location: {test_location_convention}
- Commands: {test_commands}
- Coverage: {coverage_tool_and_target}
- Conventions: {naming_and_mocking_patterns}
```

---

## 9. Linting, Formatting & Code Quality

**Purpose**: Document code quality tools, rules, and conventions.

| Signal needed | Source |
|---|---|
| Linter | Config files |
| Formatter | Config files |
| Pre-commit hooks | Hook config |
| Editor config | `.editorconfig`, `.vscode/` settings |
| Quality gates | CI quality checks |

**Per-language adaptations**:

| Language | Additional details to include |
|---|---|
| JavaScript/TypeScript | Biome/ESLint config, Prettier config |
| Python | ruff/Flake8 config, Black config |
| Rust | rustfmt config, clippy config |
| Go | `gofmt` convention, golangci-lint config |
| Generic | Indentation, import organization rules |

**Output template**:

```markdown
## 9. Linting, Formatting & Code Quality

- Linter: {tool} - configured in {config_file}
- Formatter: {tool} - configured in {config_file}
- Pre-commit: {yes/no} - config at {config_file}
- Key rules: {notable_rule_highlights}
```

---

## 10. Package Manager & Dependencies

**Purpose**: Document the package manager, dependency management workflow, and workspace structure.

| Signal needed | Source |
|---|---|
| Package manager | Lockfile detection |
| Workspace/monorepo config | Workspace config files |
| Dependency sources | Registry config |
| Dependency audit | Audit/lockfile check tools |

**Per-language adaptations**:

| Language | Additional details to include |
|---|---|
| JavaScript/TypeScript | pnpm/npm/yarn, workspace config |
| Python | pip/poetry, virtual env convention, requirements files |
| Rust | Cargo, workspace members |
| Go | Go modules, vendor directory |
| Generic | Install command, add/remove command convention |

**Output template**:

```markdown
## 10. Package Manager & Dependencies

- Manager: {manager} - lockfile at {lockfile}
- Workspace: {monorepo/single_package} - config at {workspace_file}
- Install: `{install_command}`
- Add dependency: `{add_command}`
- Rules: {dependency_management_rules}
```

---

## 11. Build & Deploy

**Purpose**: Document the build process, deployment pipeline, and infrastructure.

| Signal needed | Source |
|---|---|
| Build tool | Build config files |
| CI/CD config | CI config file contents |
| Docker | Dockerfile, compose files |
| Platform/deployment target | Platform config (Vercel, AWS, Fly, etc.) |
| Environment-specific config | Config per environment |

**Per-language adaptations**:

| Language | Additional details to include |
|---|---|
| JavaScript/TypeScript | Build command, Vercel/Railway config |
| Python | Build tools (setuptools, poetry build), Docker layers |
| Rust | `cargo build --release`, cross-compilation targets |
| Go | `go build`, multi-stage Docker |
| Generic | Build command, artifact output, deploy steps |

**Output template**:

```markdown
## 11. Build & Deploy

- Build: `{build_command}` - configured in {source_file}
- CI/CD: {platform} - config at {ci_config_file}
- Docker: {docker_file_location}
- Deploy target: {platform}
- Rules: {build_deploy_rules}
```

---

## 12. Environment & Secrets

**Purpose**: Document environment variable management and secret handling conventions.

| Signal needed | Source |
|---|---|
| Env file pattern | `.env`, `.env.*` files, env loading code |
| Secret management | Vault, secret store, env var loading |
| Config loading library | dotenv, envconfig library |
| Example env file | `.env.example` existence and content hints |

**Per-language adaptations**:

| Language | Additional details to include |
|---|---|
| JavaScript/TypeScript | `dotenv`, `next-env`, Zod env schema |
| Python | `python-dotenv`, Django settings, pydantic-settings |
| Rust | `dotenvy`, `envy`, config crate |
| Go | `os.Getenv`, `caarlos0/env`, Viper config |
| Generic | Env file format, loading order, validation |

**Output template**:

```markdown
## 12. Environment & Secrets

- Env files: {env_file_patterns}
- Example file: {example_env_path}
- Loading: {loading_mechanism} - in {source_file}
- Validation: {validation_method} - in {source_file}
- Rules: {env_management_rules}
```

---

## 13. Known Drift & Gotchas

**Purpose**: Surface known inconsistencies, incomplete patterns, and foot-guns discovered during indexing.

| Signal needed | Source |
|---|---|
| Inconsistent patterns | Multiple competing approaches for same task |
| Stale/dead code | Unused routes, deprecated imports |
| Broken contracts | Mismatched API shapes, missing routes |
| Config drift | Misaligned configs |
| Incomplete features | Placeholder UIs, missing pages |
| Security gaps | Missing validation, webhook verification gaps |

**No per-language adaptations needed** - this section is entirely codebase-specific.

**Output template**:

```markdown
## 13. Known Drift & Gotchas

{bulleted list of each drift item, with source file citations}
```

---

## 14. Non-Negotiable Safety Rules

**Purpose**: Define hard rules that must not be violated when working on the codebase.

| Signal needed | Source |
|---|---|
| Secrets policy | `.env` presence, secret loading patterns |
| Auth enforcement | Protected routes, middleware guards |
| Data integrity | Cascade deletes, constraint patterns |
| Contract stability | Type sharing patterns, API response consistency |
| Code quality | Build/lint/test pre-merge gates |

**No per-language adaptations needed** - these are universal safety principles adapted to the detected patterns.

**Output template**:

```markdown
## 14. Non-Negotiable Safety Rules

{rule_list_inferred_from_codebase_patterns}
```

Default candidates (always include those that apply):

```markdown
- Do not commit secrets from `.env`. Use `.env.example` for documentation.
- Do not expose provider keys in client code.
- Do not change API response shapes without checking all consumers.
- Do not add protected pages without matching auth behavior in middleware and routes.
- Do not add cache mutations without invalidation strategy.
- Do not assume a missing file is intentionally absent; verify first.
```

---

## 15. Files to Read Before Large Changes

**Purpose**: List the key files an agent should read before making large changes.

**No per-language adaptations needed** - derived from the index artifact's key entry points.

**Output template**:

```markdown
## 15. Files to Read Before Large Changes

{numbered list of key files with their importance reason}
```
