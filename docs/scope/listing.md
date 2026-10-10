# At scale

nvii hands back every project a user can see, all at once, on the web and in the terminal, with no way to search. Twenty projects is already awkward. Twenty thousand would be unusable.

### 7. Paginated and searchable project list · needs a decision
Both project list routes return every row with no limit, no total, and no way to filter. The web route cannot even read query parameters because its handler takes no request. Every project is decrypted on the way out, so cost grows with the number of projects a user owns.
**Done when:** the list route takes a limit, an offset or cursor, and a search term, returns a total alongside the rows, and stops decrypting every project just to draw a picker.
- [ ] Design it (spec): `/solution-architect paginated and searchable project list`

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