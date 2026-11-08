# Codebase Signals

> How to read a codebase index artifact and extract the signal map needed for RULES.md generation.

## 1. Reading the Index Artifact

The `codebase-index` skill produces a structured markdown artifact with sections like:
- "Stack And Runtime"
- "App Router Topology" or "Architecture"
- "Client Data Layer" / "State Management"
- "Backend Route Inventory" / "API Layer"
- "Persistence Model"
- "Integrations And Utilities"
- "Runtime Findings And Drift"
- "Config And Secrets Posture"
- "Recommended Reading Order"

Not all sections will have the same names - the index artifact's section names depend on the detected project type.

## 2. Signal Extraction Guide

Scan the index artifact for each signal. Where the artifact doesn't have an explicit section, infer from content.

### 2.1 Language / Runtime

Look in the index artifact's **Stack And Runtime** section or equivalent.

| Signal | Where to find it |
|---|---|
| Primary language | First sentence of stack section: "Language: X" or "Framework: X in Y" |
| Runtime version | Version strings following language names, `.nvmrc`, `.python-version` references |
| Package manager | "Package manager: X - lockfile at Y" or mention in stack section |

**Fallback detection** (if index doesn't state explicitly):
- `package.json` + `pnpm-lock.yaml` → Node.js + pnpm
- `package.json` + `package-lock.json` → Node.js + npm
- `pyproject.toml` + `poetry.lock` → Python + Poetry
- `Cargo.toml` + `Cargo.lock` → Rust + Cargo
- `go.mod` + `go.sum` → Go + Go modules
- `requirements.txt` + no lockfile → Python + pip

### 2.2 Framework

Found in the index artifact's **Stack And Runtime** section.

| Signal | Where to find it |
|---|---|
| Framework name | "Framework: X" statement |
| Framework config | Config file references (e.g., `next.config.ts`, `manage.py`) |
| Version | Version string following framework name |

**Fallback detection**: Scan config file names and import patterns:
- `next.config.*` → Next.js
- `nuxt.config.*` → Nuxt
- `vite.config.*` → Vite (build tool, possibly framework-agnostic)
- `manage.py` → Django
- `main.py` with `FastAPI()` → FastAPI
- `Cargo.toml` with `axum`/`actix-web` → Axum/Actix
- `main.go` with `gin`/`chi` → Gin/Chi

### 2.3 Architecture

Found in the index artifact's **App Router Topology**, **Architecture**, **Directory Layout**, or equivalent section.

| Signal | Where to find it |
|---|---|
| Top-level dirs | Directory tree listing |
| Route groups | "Route Groups" subsection with bullet list |
| Module layout | "Global Shell", "Pages", "Components" subsections |

**Extract**: A bullet list of top-level directories and their purposes. Note any route-group convention (Next.js App Router `(group)`, Django `urls.py`, Go `cmd/` `internal/`).

### 2.4 Data Flow

Found in the index artifact's **Client Data Layer**, **State Management**, or **Data Flow** section.

| Signal | Where to find it |
|---|---|
| API call pattern | "Shared API Helper vs Direct Fetch" or equivalent |
| State library | Library names in stack section or data layer |
| Data layer pattern | "Hook Ownership" table or equivalent |

**Extract**:
- The canonical data flow chain (e.g., "UI → Hook → API → DB")
- Whether there's a centralized API client
- Whether hooks are centralized in a barrel file

### 2.5 Persistence

Found in the index artifact's **Persistence Model**, **Database**, or equivalent section.

| Signal | Where to find it |
|---|---|
| Database type | Mention in persistence section or connection string hints |
| ORM | "Prisma", "SQLAlchemy", "Diesel", "GORM" mention |
| Schema source | Path to schema file |
| Migrations | Migration directory path |
| Model count | "N models, M enums" or similar |

**Extract**:
- ORM name and schema location
- Migration tool and command
- Key model/entity names
- Schema source-of-truth convention

### 2.6 API Layer

Found in the index artifact's **Backend Route Inventory** or **API Layer** section.

| Signal | Where to find it |
|---|---|
| Route structure | Route directory listing |
| API pattern | REST/GraphQL/tRPC mention |
| Validation | Zod/Pydantic/serde mention in route handlers |
| Response format | Common response wrapper pattern |
| Error handling | Error middleware description |

**Extract**:
- Route prefix conventions
- Common patterns (auth checks, validation, pagination)
- Whether routes are centralized or co-located

### 2.7 Authentication

Found in the index artifact's **Auth / Session**, **Auth**, or **Integrations** section.

| Signal | Where to find it |
|---|---|
| Auth library | "Better Auth", "NextAuth", "Django auth", etc. |
| Strategy | Session / JWT / OAuth mention |
| Middleware | Middleware file path |
| Guard pattern | Auth server-side check pattern |
| Admin role | Admin role/guard details |

**Extract**:
- Auth library and config file
- Session strategy (cookie, JWT, OAuth)
- How protected routes work
- Admin protection pattern

### 2.8 Testing

Found in the index artifact's **Testing** section.

| Signal | Where to find it |
|---|---|
| Framework | "Vitest", "Jest", "pytest", "cargo test" mention |
| Location | Test directory pattern |
| Commands | Test command strings |
| Coverage | Coverage tool mention |
| Convention | Naming convention, mocking strategy |

**Extract**: verbatim from index artifact.

### 2.9 Linting / Formatting

Found in the index artifact's **Config** section or mentioned throughout.

| Signal | Where to find it |
|---|---|
| Linter | Config file mentions (`.eslintrc`, `biome.json`, `.flake8`, `rustfmt.toml`) |
| Formatter | Config file mentions |
| Pre-commit hooks | Hook config file |
| Editor config | `.editorconfig`, `.vscode/settings.json` |

### 2.10 Package Manager

Found in the index artifact's **Stack**, **Config**, or **Dependencies** section.

| Signal | Where to find it |
|---|---|
| Manager | Lockfile reference, workspace config |
| Workspace | Workspace file reference |
| Registry | Registry config (`.npmrc`, `~/.pip/pip.conf`) |

**Extract**: manager name, install command, workspace/monorepo status.

### 2.11 Build / Deploy

Found in the index artifact's **Build**, **CI/CD**, or **Infra** section.

| Signal | Where to find it |
|---|---|
| Build command | Build script reference |
| CI/CD | CI config file contents summary |
| Docker | Dockerfile/compose file presence |
| Deploy target | Platform mention (Vercel, AWS, Fly, Docker) |
| Environment config | Config per environment files |

### 2.12 Environment

Found in the index artifact's **Config And Secrets Posture** or equivalent section.

| Signal | Where to find it |
|---|---|
| Env files | `.env`, `.env.*` file listing |
| Example file | `.env.example` existence |
| Loading | Env loading code reference |
| Validation | Env validation code reference |
| Secrets guidelines | Safety rules about env |

### 2.13 Known Drift

Found in the index artifact's **Runtime Findings And Drift** or equivalent section.

| Signal | Where to find it |
|---|---|
| API contract drift | Mismatched route shapes |
| Dead code | Unused routes, deprecated patterns |
| Incomplete patterns | Missing pages, placeholder data |
| Security gaps | Missing validation, webhook gaps |
| Config drift | Misconfigured or duplicated settings |

## 3. Signal Map Output Format

Store the extracted signals in a structured format like this:

```yaml
language: "TypeScript"
runtime: "Node.js 22"
framework: "Next.js 16 (App Router)"
package_manager: "pnpm"
arch:
  type: "monorepo" | "single_package"
  top_dirs:
    - dir: "app/"
      purpose: "Application routes"
    - dir: "lib/"
      purpose: "Shared utilities"
    - dir: "hooks/"
      purpose: "React Query hooks"
  route_groups:
    - group: "app/(marketing)"
      purpose: "Public marketing pages"
data_flow: "page/component → hook → API client → API route → DB"
state_management:
  server_state: "TanStack Query"
  client_state: "Zustand"
  cache_keys: "lib/query-keys.ts"
persistence:
  orm: "Prisma"
  schema: "prisma/schema.prisma"
  db: "PostgreSQL"
  migration: "pnpm db:migrate"
api_layer:
  pattern: "REST"
  structure: "app/api/* route handlers"
  validation: "Zod in route files"
auth:
  library: "Better Auth"
  strategy: "session cookies + OAuth"
  middleware: "proxy.ts (Arcjet + redirects)"
testing:
  framework: "Vitest"
  location: "co-located with source"
  commands: ["pnpm test"]
linting:
  linter: "Biome 2.2.0"
  formatter: "Biome"
  rules: "recommended + Next.js + React domain rules"
build_deploy:
  build: "pnpm build"
  ci: "not configured"
  docker: false
  platform: "not detected"
env:
  files: [".env"]
  example: ".env.example"
  loading: "Next.js built-in"
  validation: "not detected"
drift:
  - "api-client.ts only covers note operations, rest uses raw fetch"
  - "middleware uses 'redirect', sign-in reads 'callbackUrl' (param mismatch)"
key_files:
  - "app/layout.tsx: global root shell"
  - "lib/query-keys.ts: cache key registry"
  - "prisma/schema.prisma: schema source of truth"
```

This format makes it easy to fill the section-catalog templates.

## 4. What If a Signal Is Missing?

For each missing signal:

1. Check whether the index artifact mentions it under a different section name.
2. If still missing, set the signal to `"Not detected - verify manually"`.
3. Do not guess or hallucinate values.
4. Note the missing signal in the validation report as a caveat.
