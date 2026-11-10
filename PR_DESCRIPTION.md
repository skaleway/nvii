## Title

fix(web): remove member actually removes, count includes owner, badge shows stored role

## Body

### What this changes

Removing a project member always failed, the member count ignored the owner, and the Admin badge was guessed rather than stored. This fixes all three in the project sharing UI.

### The problems

1. **Remove member always failed.** `projectAccessApi.remove` called `DELETE /api/projects/{userIdToRemove}/{projectId}/access/{userIdToRemove}`, a route that does not exist, so every removal returned an error.
2. **Member count ignored the owner.** The access list returned only rows from the `project_access` join table, so a project owned by a single user read as zero members.
3. **Admin badge was derived, not stored.** The badge showed `Admin` for the project owner because no role was persisted on the membership.

### The fix

- `projectAccessApi.remove` now calls the existing `DELETE /api/projects/{actorUserId}/{projectId}/access` route, passing the acting user's id and the member to remove. The route already requires the actor to be the project owner before revoking access.
- The access `GET` route appends the project owner to the access list, so the member count includes the owner and the owner appears in the member avatars.
- Added a `role` column (default `COLLABORATOR`) to the `ProjectAccess` model and pushed it to the database. Inviting a member now stores `COLLABORATOR`. Each member row shows its stored role badge, and the owner shows `Admin` based on the stored `project.userId` rather than a guess.

### Done when (from the spec)

- [x] removing a member actually removes them and the count drops
- [x] the count includes the owner
- [x] the badge reflects something stored rather than something guessed

### Files changed

- `apps/web/app/api/projects/[userId]/[projectId]/access/route.ts` — GET includes owner; POST stores `COLLABORATOR`
- `apps/web/lib/api-client.ts` — fixed remove route, added `actorUserId`, added `role` to `ProjectAccess` type
- `apps/web/components/projects-provider.tsx` — passes the acting user's id to remove
- `apps/web/components/project-access-manager.tsx` — shows stored role badge; renamed remove param to `memberId`
- `packages/database/prisma/schema.prisma` — added `role` to `ProjectAccess`
- `docs/scope/index.md` — feature 6 status `planned` → `in-progress`
- `docs/scope/truth.md` — Build it ticked, milestones added, code pointer filled

### Verification

- TypeScript typecheck of the changed files: clean.
- `next build --webpack` compiles successfully (the separate TS build step fails only on a pre-existing unrelated error in `rollback/route.ts:97`).
- Database: `prisma db push` and `prisma generate` ran clean against the local Postgres (port 5489).

This branch is based on `origin/main` and contains only this fix. Ready for review.
