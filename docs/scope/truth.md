# Truth

Six places where nvii tells the user something that is not true. Each one is cheap to fix and expensive to leave, because a user who catches a lie stops trusting the whole product.

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
- [ ] Build it: `/feature-build version actions claim success without acting`

### 3. Environment variable edits are lost
Editing a variable value in the web table changes it on screen only. The delete entry in the row menu has no handler at all, and the public toggle is a local flag that is never stored anywhere.
**Done when:** editing a value and deleting a variable both persist, survive a page reload, and land in a new version like a push from the command line does.
- [ ] Build it: `/feature-build environment variable edits are lost`

### 4. CLI invents version names and change counts
Every `nvii push` and `nvii new` prints the literal text `Version created: v1.0.0` and `Added: 0 | Modified: 0 | Removed: 0`. The server already computes the real changes and sends them back, and the command throws them away.
**Done when:** a push prints the version the server created and the real added, modified, and removed counts, and an empty push says nothing changed instead of printing zeros.
- [ ] Build it: `/feature-build CLI invents version names and change counts`

### 5. CLI failures report success to scripts
Every command catches a failed request, prints a friendly line, and exits 0. A script or a CI job cannot tell a failed push from a successful one.
**Done when:** any command that fails to do its job exits non zero with a message a script can read, and a success path never hides a failure.
- [ ] Build it: `/feature-build CLI failures report success to scripts`

### 6. Remove member always fails, member count ignores the owner
Removing a member calls a route that does not exist, so it always fails. The member count comes from the access table alone, so a project you own by yourself reads as zero members. The Admin badge is derived from ownership because no role is stored.
**Done when:** removing a member actually removes them and the count drops, the count includes the owner, and the badge reflects something stored rather than something guessed.
- [ ] Build it: `/feature-build remove member always fails, member count ignores the owner`