# Truth

Seven places where nvii tells the user something that is not true. Each one is cheap to fix and expensive to leave, because a user who catches a lie stops trusting the whole product.

### A. Projects, versions, sharing, and analytics · existing
The web app for projects, version history, per member sharing, diffs, and analytics, all predating this workflow. code in `apps/web/app/(app)/projects/`

### 1. Login redirect lands on null · in-progress · GA
Signing in with GitHub sends the user to a 404 page whose address contains the word null. The login button builds its return address by decoding a query parameter that was never there, and an absent value becomes the text null.
**Done when:** signing in with GitHub, with or without a return path, lands on the app or on the page that was asked for, and a hand written return path cannot send the user off site.
- [x] Build it: `/feature-build login redirect lands on null`
- [x] Verify it: `/verify-release login redirect lands on null`
- [ ] Test it: `/test-engineer login redirect lands on null`
- [ ] Review it: `/peer-review login redirect lands on null`
- [ ] Document it: `/tech-writer login redirect lands on null`
code in `apps/web/lib/redirect.ts`, `apps/web/components/auth/auth-button.tsx`, `apps/web/proxy.ts`

### 2. Version actions claim success without acting
On a version page, rollback, tag, branch, delete, and export show a green success message and change nothing. On the versions list, the same buttons log to the console while the component still tells the user it worked.
**Done when:** every button on a version page either performs a real action against the server and the list refreshes to match, or is not offered.
- [x] Build it: `/feature-build version actions claim success without acting`
code in `apps/web/app/api/projects/[userId]/[projectId]/versions/[versionId]/route.ts` (DELETE), `.../[versionId]/rollback/route.ts`, `.../[versionId]/tags/route.ts`, `.../[versionId]/export/route.ts`, `apps/web/app/(app)/projects/[projectId]/versions/page.tsx`, `apps/web/app/(app)/projects/[projectId]/versions/[versionId]/page.tsx`

### 3. Environment variable edits are lost · in-progress
Editing a variable value in the web table changes it on screen only. The delete entry in the row menu has no handler at all, and the public toggle is a local flag that is never stored anywhere.
**Done when:** editing a value and deleting a variable both persist, survive a page reload, and land in a new version like a push from the command line does.
code in `apps/web/components/env-variable-table.tsx`, `apps/web/lib/api-client.ts`, `apps/web/app/(app)/projects/[projectId]/page.tsx`
- [x] Build it: `/feature-build environment variable edits are lost`

### 4. CLI invents version names and change counts · in-progress
Every `nvii push` and `nvii new` prints the literal text `Version created: v1.0.0` and `Added: 0 | Modified: 0 | Removed: 0`. The server already computes the real changes and sends them back, and the command throws them away.
**Done when:** a push prints the version the server created and the real added, modified, and removed counts, and an empty push says nothing changed instead of printing zeros.
- [x] Build it: `/feature-build CLI invents version names and change counts`
code in `packages/cli/src/commands/push.ts`, `packages/cli/src/commands/new.ts`, `apps/web/app/api/projects/[userId]/route.ts`

### 5. CLI failures report success to scripts
Every command catches a failed request, prints a friendly line, and exits 0. A script or a CI job cannot tell a failed push from a successful one.
**Done when:** any command that fails to do its job exits non zero with a message a script can read, and a success path never hides a failure.
- [x] Build it: `/feature-build CLI failures report success to scripts`
code in packages/cli/src/commands/push.ts, packages/cli/src/commands/pull.ts, packages/cli/src/commands/history.ts, packages/cli/src/commands/rollback.ts, packages/cli/src/commands/branch.ts, packages/cli/src/commands/tag.ts, packages/cli/src/commands/link.ts, packages/cli/src/commands/update.ts, packages/cli/src/commands/unlink.ts, packages/cli/src/commands/auth/logout.ts, packages/cli/src/commands/auth/whoami.ts, packages/cli/src/commands/generate.ts, packages/cli/src/commands/some.ts

### 6. Remove member always fails, member count ignores the owner
Removing a member calls a route that does not exist, so it always fails. The member count comes from the access table alone, so a project you own by yourself reads as zero members. The Admin badge is derived from ownership because no role is stored.
**Done when:** removing a member actually removes them and the count drops, the count includes the owner, and the badge reflects something stored rather than something guessed.
- [ ] Build it: `/feature-build remove member always fails, member count ignores the owner`

### 28. A stub decryption function shadows the real one · from spec 0001
`apps/web/lib/encryption.ts` exports a `decryptEnvValues` that only parses JSON, and it shadows the real AES implementation the same file re exports from `@nvii/env-helpers`. Every route that imports it through that path reports the encryption envelope as if it were the variables. That is why every project card reads "3 variables". Spec 0001 fixes the list path only.
**Done when:** no route returns the `{iv, content, authTag}` envelope as decrypted content, every card shows the real variable count, and content written before encryption still reads correctly.
- [ ] Build it: `/feature-build a stub decryption function shadows the real one`