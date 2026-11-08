# Scope Plan Route: monorepo

Monorepo (workspaces config: `pnpm-workspace.yaml`, `turbo.json`, `nx.json`, `lerna.json`, `workspaces` in root `package.json`; or multiple manifests under `apps/*` / `packages/*`): plan per workspace, never mix apps:
- Each workspace: `docs/scope/<workspace>/` (`scope.md`, or `index.md` + epics if large). Repo wide planning (monorepo tooling, cross cutting infra, e.g. a shared design system in `packages/ui`): `docs/scope/_root/`.
- Top level `docs/scope/index.md` maps the monorepo: one line per workspace (and `_root`) linking its scope with a status rollup (features done / total); create or update whenever a workspace scope is added or its rollup changes.
- `/scope-plan web <idea>` plans the `web` app; bare `/scope-plan` on a monorepo asks which workspace(s) (or "repo wide") as a panel. Read that workspace's nested `AGENTS.md` for its stack/conventions; apps differ, don't assume one.
- Each feature's `Code area` points into its workspace (`apps/web/...`). Foundations are per workspace, except genuinely shared ones (monorepo tooling, a shared UI package), which live in `_root` and the apps depend on. A greenfield workspace (no code yet) follows the foundations first sequencing in `modes/plan-greenfield.md`, applied per workspace; an already built workspace enrolls per `modes/plan-brownfield.md`.
- Feature spanning workspaces: plan in `_root` (tag intent by workspace) or split into coordinated per workspace features; never bury cross app work in one app's scope.
