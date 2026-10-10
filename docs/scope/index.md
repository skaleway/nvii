# Scope: nvii

nvii keeps environment variables out of a git repository and out of a chat window. A developer links a folder to a project on nvii, pushes and pulls encrypted versions from the command line, and reads the same history on the web.

**Build approach:** Tracer Bullet (fix one lie all the way through, end to end, before starting the next, so nothing claims to work that does not).
**Workflow:** Beta (after `/feature-build`, run `/verify-release`, then `/test-engineer`). The project default level of rigor. `/solution-architect` is the recommended first stop for a feature with a real decision, but skippable when you already know the build. Any feature can carry its own tag (e.g. `· GA`) to do more or less.

_These are recommendations to keep your build orderly, not requirements. Skip anything that does not fit: if you already know how to build a feature, use `/feature-build` and skip `/solution-architect`. You decide when a feature is `done`._

## At a glance

| # | Feature | Phase | Status |
|---|---------|-------|--------|
| 1 | Login redirect lands on null · GA | Truth | in-progress |
| 2 | Version actions claim success without acting | Truth | planned |
| 3 | Environment variable edits are lost | Truth | planned |
| 4 | CLI invents version names and change counts | Truth | planned |
| 5 | CLI failures report success to scripts | Truth | planned |
| 6 | Remove member always fails, member count ignores the owner | Truth | planned |
| 7 | Paginated and searchable project list · needs a decision | At scale | planned |
| 8 | Search and pagination on the web projects page · needs a decision | At scale | planned |
| 9 | Version list is silently cut at thirty | At scale | planned |
| 10 | Terminal picker search and paging · needs a decision | At scale | planned |
| 11 | Shared indication in the terminal picker | At scale | planned |
| 12 | `nvii update` cannot work | Finish the commands | planned |
| 13 | `nvii tag` and `nvii tags` have no server route · needs a decision | Finish the commands | planned |
| 14 | `nvii merge` is an empty function · needs a decision | Finish the commands | planned |
| 15 | `nvii logout` leaves secrets in the keychain · GA | Finish the commands | planned |
| 16 | `nvii whoami` is silent when logged out | Finish the commands | planned |
| 17 | A failed login silently cancels the command | Finish the commands | planned |
| 18 | `nvii pull` can restore the wrong version | Finish the commands | planned |
| 19 | `nvii test` prints plaintext secrets · GA | Finish the commands | planned |
| 20 | Documented flags do nothing | Finish the commands | planned |
| 21 | `nvii generate` ignores the format flag | Finish the commands | planned |
| 22 | Settings that actually save · needs a decision | Real pages | planned |
| 23 | Sync page reads real device state · needs a decision | Real pages | planned |
| 24 | Dead code and dead controls sweep | Real pages | planned |
| 25 | Marketing claims match the product | Real pages | planned |

### Epic rollups

- **Truth** ([truth.md](truth.md)) · 6 features, 5 planned, 1 in progress · six places where nvii shows a user something untrue. Build this phase first.
- **At scale** ([listing.md](listing.md)) · 5 features, all planned · pagination, search, and shared indication on the web and in the terminal.
- **Finish the commands** ([commands.md](commands.md)) · 10 features, all planned · commands that are empty, wired to routes that do not exist, or dangerous.
- **Real pages** ([pages.md](pages.md)) · 4 features, all planned · settings and sync get real data, and the false promises come out of the code.

## On the scope before this pass

`existing` means it predates this workflow, so `/feature-build` and `/state-sync` leave it alone. Each is enrolled in its epic file for context.

- Projects and versions, web: `existing`
- Project sharing per member: `existing`
- Version analytics and diffs: `existing`
- CLI sign in, push, pull, link, branches, history, rollback: `existing`
- Web dashboard status cards: `in-progress`, one stat can never move (feature 24 covers it)

## Deferred

Out of scope for the current build pass, kept so the plan stays honest.

- **Teams and organizations**: a team table, a switcher, invites, roles · needs a decision · you chose per project access for now
- **Environments**: dev, staging, prod as a first class idea · needs a decision · you chose to drop the fake badge instead (feature 24)
- **Roles beyond owner or collaborator**: viewer and editor with real enforcement on every route · needs a decision
- **Browser reading of your local env file**: puts the encryption key in the client · needs a decision
- **Version export** to a file: the button is there, the route is not
- **Notifications**: the bell in the header does nothing and there is no notification model
- **CLI pointing at a local backend**: the base address is hardcoded to production
- **Removing the committed integrity secret**: the local config tamper check is not a security boundary today

## Legend

**The decision box.** Every feature carries exactly one, the sub-task whose label ends with `(spec)`. Its wording varies (`Design it (spec)` normally, `Decide the stack (spec)` on Stack & architecture), so skills locate it by that `(spec)` suffix, never by an exact label. Every other box is an execution box and `/solution-architect` never ticks one.

**Feature lifecycle**: the scope updates as a feature moves; each row is what it shows and who sets it:

| State | Set by | The feature shows |
|-------|--------|-------------------|
| `planned` · needs a decision | `/scope-plan` | one box: `Design it (spec): /solution-architect <feature>` |
| `in-progress` (designed) | **`/solution-architect` at spec capture** | `Design it` ticked; spec linked; `Build it: /feature-build <feature>` + **2 to 5 milestones**; the tier's closing boxes (`Verify it` Alpha+, `Test it` Beta+, `Review it` + `Document it` GA); any surfaced follow-up enrolled |
| `in-progress` (building) | `/feature-build` | milestone sub-boxes tick one by one; code pointer filled |
| `in-progress` (verified) | `/verify-release` | `Build it` + milestones ticked; `Verify it` ticked |
| `done` | **you, when you decide it is** (any skill sets it when you say so); `/state-sync` reconciles | boxes you ran ticked, skipped ones marked skipped; the tier's last stage (`Prototype` → after `/feature-build`; `Alpha` → after `/verify-release`; `Beta`/`GA` → after `/test-engineer`) is the suggested point to call it done; `/state-sync` captures conventions |

- **Next step** = the first unticked box (always a command or a tracked milestone).
- **needs a decision** = run `/solution-architect` first; otherwise straight to `/feature-build` (or `/codebase-audit` for standards & tooling). The tag drops once the spec is captured.
- **Atomic build tasks live in the spec's `## Build plan`, not here**: the scope carries only the milestone rollup.
- **Status** `planned` → `in-progress` → `done`, plus `existing` (before the workflow) and `dropped` (de-scoped, kept for history).
- **Approach tag** beside a heading (e.g. `· Facade`) overrides the project default for that feature; no tag = inherits it.
- **Workflow tier tag** beside a heading (e.g. `· GA`, `· Prototype`) sets that one feature's rigor above or below the project default; no tag inherits the default. It decides the feature's check boxes and each skill's next suggestion.
- **Workflow** (header line) is the project default, what runs after `/feature-build`: **Prototype** = nothing (trust develop's own build time self check); **Alpha** = `/verify-release`; **Beta** = `/verify-release` then `/test-engineer`; **GA** = adds a fresh model `/peer-review` then `/tech-writer`. A feature built on an unratified decision (an `Assumed` spec) stays flagged, but that never blocks `done`.
- **Pointer line** (`spec <n> · code in <path>`): the spec link added by `/solution-architect`, the code path by `/feature-build`.