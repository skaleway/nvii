# Real pages

Two screens are decorative and one pile of code is decorative. You chose to build settings and sync for real, which means new tables, and to delete what nothing reaches.

### 22. Settings that actually save · needs a decision
The settings page is two hundred and sixty four lines with six Save buttons that have no handlers, hardcoded values presented as your current configuration, a fake masked connection string you can focus and read, and a Team tab with a name field and an Invite button that does nothing. It also brands the product EnvSync in two places. Building it for real means new storage. You chose per project access over a team model, so the Team tab has nothing real to sit on.
**Done when:** every setting you can change here is stored and read back, the fake credential is gone, the wrong product name is gone, and the Team tab is either a real per project members view or removed.
- [ ] Design it (spec): `/solution-architect settings that actually save`

### 23. Sync page reads real device state · needs a decision
The sync page shows three invented stats (last synced two hours ago, remote storage Supabase, four changes split two and two) and a table of five fake projects with fake local, remote, and conflict counts. None of the buttons do anything. The web cannot see your local files, so you chose the honest route: the terminal reports its real state and the page reads those numbers.
**Done when:** the terminal reports local and remote change counts and a last synced time per device, the page shows those real numbers, and each row offers an action that does what it says.
- [ ] Design it (spec): `/solution-architect sync page reads real device state`

### 24. Dead code and dead controls sweep
Roughly five hundred lines nothing reaches: a sidebar with a shadcn demo user and mock navigation, an unused search index that queries every project in the database unscoped, five unused stores, four API clients pointing at routes that do not exist, a duplicate auth client, an upload handler with a hardcoded fake user, a file that reads email and password for a product that only signs in with GitHub, and a header bell with no notifications behind it. Every project is also labelled Development although no environment exists, and one dashboard stat can never be anything but zero.
**Done when:** nothing unreachable is left in the app, no control that looks live is dead, no fake credential or invented label is rendered, and the dashboard only shows stats that can change.
- [ ] Build it: `/feature-build dead code and dead controls sweep`

### 25. Marketing claims match the product
The front page promises team based access control, seamless conflict resolution, and synchronized updates. None of the three exist. Team access control was deferred, conflict resolution is what the sync page was faking, and synchronized updates means nothing user visible today.
**Done when:** every claim on the front page and in the docs matches something a user can actually do, or is cut.
- [ ] Build it: `/feature-build marketing claims match the product`