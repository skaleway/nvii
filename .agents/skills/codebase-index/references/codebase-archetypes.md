# Codebase Archetypes

**Purpose**: Common exploration patterns for different project types. Use this during Phase 1 (Surface Scan) to guide what to look for.

## Web Application (Node/React/Next.js)

**Look for**:
- `pages/` or `app/` directory (Next.js routing)
- `src/routes/` or `src/controllers/` (Express/Fastify)
- `components/`, `hooks/`, `providers/` (React)
- `middleware/` or `middlewares/`
- API client layer (`src/api/`, `src/services/`)
- State management (`store/`, `state/`, `reducers/`, `atoms/`)
- Database access (`prisma/`, `drizzle/`, `models/`, `repositories/`)
- Authentication (`auth/`, `session/`, `passport/`, `next-auth/`)
- Environment variables and `.env` files

**Configs to expect**: `next.config.js`, `tailwind.config.js`, `postcss.config.js`, `tsconfig.json`, `package.json`

## Web Application (Python/Django/FastAPI)

**Look for**:
- Django: `urls.py`, `views.py`, `models.py`, `serializers.py`, `admin.py`, `settings.py`
- FastAPI: `main.py`, `routers/`, `schemas/`, `dependencies/`, `database.py`
- Flask: `app.py`, `blueprints/`, `models.py`
- `migrations/` or `alembic/` for DB migrations
- `tests/` or `conftest.py`
- `requirements.txt`, `pyproject.toml`, `setup.py`, `Pipfile`

**Configs to expect**: `pyproject.toml`, `setup.cfg`, `.flake8`, `pytest.ini`, `Dockerfile`

## Library / Package

**Look for**:
- Public API surface: `index.ts`, `__init__.py`, `lib.rs`, `main.go`
- Type definitions: `.d.ts` files, `typings/`, `types/`
- Entry point in `package.json` (`main`, `module`, `types`, `exports`)
- Build output config: `tsconfig.json` outDir, `setup.py` packages
- README examples - these are the "interface" the library exposes
- Test files showing usage patterns

**Configs to expect**: `package.json`, `tsconfig.json`, `.npmignore`, `LICENSE`

## Monorepo

**Look for**:
- Workspace config: `package.json#workspaces`, `pnpm-workspace.yaml`, `Cargo.toml#workspace`, `lerna.json`, `turbo.json`, `nx.json`
- `packages/`, `apps/`, `libs/`, `modules/` directories
- Shared configs at root level (`tsconfig.base.json`, `.eslintrc.js`)
- Tooling: Turborepo, Nx, Lerna, Yarn workspaces, pnpm workspaces
- Internal package dependencies (`@company/package-name`)

**Index each package/app individually** following the same phases, then produce a cross-package dependency map.

## CLI Tool

**Look for**:
- Entry point: `bin/` directory, `package.json#bin`, `console_scripts` in setup.py
- Argument parsing: `commander`, `yargs`, `click`, `argparse`, `clap`
- Command hierarchy: subcommands, flags, positional args
- Configuration loading: `.config/`, `~/.config/`, environment variables
- Output formatting: stdout/stderr handling, color output, progress bars
- Error handling: exit codes, error messages

**Configs to expect**: None or minimal - CLI tools often have no project-level config.

## Docker / Infrastructure Project

**Look for**:
- `Dockerfile`, `docker-compose.yml`, `docker-compose.override.yml`
- `k8s/`, `kubernetes/`, `helm/` directories
- `terraform/`, `pulumi/`, `cdk/` directories
- `.github/workflows/`, `.gitlab-ci.yml`, `Jenkinsfile`
- `Makefile`, `Taskfile.yml`, `Justfile`
- `.env`, `.env.example`, `.env.*` files
- Service mesh / ingress configs (nginx, traefik, envoy)
- Monitoring configs (prometheus, grafana, datadog)

**Focus**: Infrastructure is connective tissue - trace every service name, port, volume, and secret reference back to the application code it serves.

## When Archetypes Overlap

If the codebase matches multiple archetypes (e.g., a monorepo containing a web app and a CLI tool), index each archetype area separately and then build a cross-area map showing how they connect.
