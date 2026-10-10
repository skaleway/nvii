# Finish the commands

Ten problems in the command line. Some commands never work at all, one prints your secrets to the screen, and one leaves them in the system keychain after you log out.

### B. CLI sign in, push, pull, link, branches, history, rollback · existing
The working command line surface, predating this workflow. code in `packages/cli/src/commands/`

### 12. `nvii update` cannot work
The command asks for a route that does not exist, so the lookup lands on the version route with the word latest as an id and always returns not found. It is step four of the README quickstart. It also reads the login file before checking whether you are logged in, so a logged out user gets a raw file error instead of a helpful message, and the heading it prints lists no variables.
**Done when:** `nvii update` restores remote variables to the working folder, tells you which ones changed, and gives a helpful message when you are not logged in.
- [ ] Design it (spec): `/solution-architect nvii update cannot work`

### 13. `nvii tag` and `nvii tags` have no server route · needs a decision
The version tag table and model exist and the web has a client for them, but there is no route behind either. Creating a tag gets a method not allowed and listing them gets a not found. The same applies to the web tag client, and to the web client for version rollback and export. You chose to build this for real.
**Done when:** tags can be created and listed from the command line and from the web against a real route, and the documented version flag works.
- [ ] Design it (spec): `/solution-architect nvii tag and nvii tags have no server route`

### 14. `nvii merge` is an empty function · needs a decision
The whole body is an empty try block. It accepts a source and a target, does nothing, and exits 0. It is the only command with no implementation at all. You chose to build this for real.
**Done when:** merging two versions produces a real merged version on the server, reports what it merged and what it could not, and fails loudly when the merge is impossible.
- [ ] Design it (spec): `/solution-architect nvii merge is an empty function`

### 15. `nvii logout` leaves secrets in the keychain · GA
Logging out deletes the config file but never deletes the token and key from the system keychain, so they survive logout. The friendly not logged in branch is unreachable because reading the config throws instead of returning empty, so a logged out logout shows a raw file error and exits 1.
**Done when:** after logout there is nothing readable in the keychain, the config file is gone, and logging out when not logged in says so and exits cleanly.
- [ ] Build it: `/feature-build nvii logout leaves secrets in the keychain`

### 16. `nvii whoami` is silent when logged out
The command throws away the result of its only check, so logged out it prints nothing and exits 0. It never asks the server, so an expired or revoked session still reports you as signed in.
**Done when:** `nvii whoami` says who you are when signed in, says you are not signed in and exits non zero when not, and warns when the server rejects the session.
- [ ] Build it: `/feature-build nvii whoami is silent when logged out`

### 17. A failed login silently cancels the command
Nine commands call login when they find no session and then return without continuing. `nvii link` while logged out signs you in, prints authentication successful, and exits without linking anything. A login that succeeds inside a command also kills the command outright.
**Done when:** a command that needs a session logs you in and then carries on to do its job, and nothing exits early without doing what you asked.
- [ ] Build it: `/feature-build a failed login silently cancels the command`

### 18. `nvii pull` can restore the wrong version
Both pull and push sort versions by hour of the day rather than by date, and the server fills its version array in whatever order decryption finishes, so pull can restore an older version than the current one. The summary afterwards diffs the result against itself, so it always says no changes detected.
**Done when:** pull always restores the newest version, names it, and reports the real differences between what you had and what you now have.
- [ ] Build it: `/feature-build nvii pull can restore the wrong version`

### 19. `nvii test` prints plaintext secrets · GA
The command described as verifying encryption encrypts then decrypts the variables, never compares the two results, so a broken round trip still passes. It prints both the encrypted and the decrypted values to the screen, which puts your secrets into scrollback and into CI logs.
**Done when:** the command compares input to output and fails loudly on a mismatch, and never prints a secret value at all.
- [ ] Build it: `/feature-build nvii test prints plaintext secrets`

### 20. Documented flags do nothing
The guides advertise a version flag for both branch and tag that the command never declares, so it is silently ignored. The global flags for verbose, quiet, config, and no colour are declared, shown in help, and read nowhere, so quiet cannot even silence the banner that prints on every invocation including help. A branch can show as active on several branches at once because switching never clears the previous one.
**Done when:** every flag in help does what it says, quiet really is quiet, and exactly one branch reads as active.
- [ ] Build it: `/feature-build documented flags do nothing`

### 21. `nvii generate` ignores the format flag
The documented output formats of env, json, and yaml are ignored whenever an output path is given, because the output path branch is taken first and writes env style content into a file named json. A branch switch also never clears the previous active branch, and a dead check on the push response can never run and names an environment variable that appears nowhere else.
**Done when:** the output file matches the format you asked for, and the dead branches and unused checks are gone.
- [ ] Build it: `/feature-build nvii generate ignores the format flag`