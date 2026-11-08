# At scale

nvii hands back every project a user can see, all at once, on the web and in the terminal, with no way to search. Twenty projects is already awkward. Twenty thousand would be unusable.

### 7. Paginated and searchable project list · in-progress
Both project list routes return every row with no limit, no total, and no way to filter. The web route cannot even read query parameters because its handler takes no request. Every project is decrypted on the way out, so cost grows with the number of projects a user owns.
**Done when:** the list route takes a limit, an offset or cursor, and a search term, returns a total alongside the rows, and stops decrypting every project just to draw a picker.

spec [0001](../specs/_root/0001-paginated-and-searchable-project-list.md)

- [x] Design it (spec): `/solution-architect paginated and searchable project list`
- [ ] Build it: `/feature-build 7. Paginated and searchable project list`
  - [ ] Thin thread: query parsing, the shared list module with paging and a total, the web route on it, and the web client reading the new shape (spec tasks 1 to 3)
  - [ ] The CLI list route on the same module, with its own lean rows and the `nvii link` call site (spec task 4)
  - [ ] Ownership check on the CLI list and create routes, answering 403 on a path userId that is not the caller (spec task 5)
  - [ ] CLI commands made paging proof: `--token` links without a list request, unlink reads the summary branch (spec tasks 6 and 7)
  - [ ] Page number to offset helper, cancellable requests, and a "Showing N of M" line on the projects page (spec task 8)
- [ ] Verify it: `/verify-release 7. Paginated and searchable project list`
- [ ] Test it: `/test-engineer 7. Paginated and searchable project list`

### 8. Search and pagination on the web projects page · needs a decision
The projects page renders every project into a plain grid with no search, no paging, and no filter. The search box in the header accepts typing and discards it. The empty state links to a create page that does not exist, so the main call to action is a 404. A paging and search setup is already written in the query string layer and never used.
**Done when:** the projects page searches as you type with the term in the address bar, pages through results, offers a working header search, and its empty state opens the create dialog that already exists.
- [ ] Design it (spec): `/solution-architect search and pagination on the web projects page`

### 9. Version list is silently cut at thirty
The versions route applies a limit of thirty and the web never sends one, so a project with more history silently shows a truncated list with no indication that more exists. The version detail route also leaves out the two fields that decide whether a version is the current one, so the current version badge never renders and rollback and delete are offered on the version that is already live.
**Done when:** the versions list pages or says how much history exists, and the current version is marked correctly with rollback and delete hidden on it.
- [ ] Design it (spec): `/solution-architect version list is silently cut at thirty`

### 10. Terminal picker search and paging · needs a decision
`nvii link` pulls the whole project list and renders it in a plain list prompt with no filter and no paging. You chose to filter as you type and load the next page as you reach the end, which feels the same at twenty projects and at twenty thousand. A search capable prompt is already a dependency and never used.
**Done when:** typing in the picker filters the list as you go, the next page loads without a command, and a large account never renders thousands of rows at once.
- [ ] Design it (spec): `/solution-architect terminal picker search and paging`

### 11. Shared indication in the terminal picker
A project someone shared with you looks identical to your own in the terminal, and the web card has already solved this with a Shared by badge. You chose to group the picker into your own projects and shared with you, each shared row naming its owner.
**Done when:** the picker shows two labelled groups, a shared row says who shared it, and the terminal reads the same way the web card already does.
- [ ] Design it (spec): `/solution-architect shared indication in the terminal picker`

### 26. Rate limit the project list routes · needs a decision · from spec 0001
Nothing in the API limits a request today, so search as you type will put one unindexed query per keystroke per open tab against the database. Spec 0001 defers this deliberately because the repo has no limiter anywhere and adding one to a single route would be a pattern with no precedent.
**Done when:** a caller who exceeds a per user limit on the list routes gets a clear 429 with a retry hint, the normal list call is never blocked, and search as you type cannot be used to hammer the database.
- [ ] Design it (spec): `/solution-architect rate limit the project list routes`

### 27. Index the project list for search · needs a decision · from spec 0001
The search spec adds a case insensitive substring match across a join, which Postgres cannot serve from `@@unique([userId, name])`. Fine at a couple of thousand rows, wrong at a hundred thousand. Prisma cannot express a trigram index, so this is also the decision about whether the repo starts a migrations folder or keeps running `prisma db push`.
**Done when:** searching twenty thousand projects returns in the same time as searching twenty, and the schema the indexes live in is versioned alongside the code rather than existing only in the database.
- [ ] Design it (spec): `/solution-architect index the project list for search`