# 0001. Paginate and search the project list

**Date**: 2026-10-10
**Status**: Proposed

## Summary

Both project list routes hand back every project a user can see, all at once, with no way to search. This spec gives them a limit, an offset, and a search term, and adds a total so a caller knows how many pages exist. It also bounds the per row inspection the web route does, so cost stops growing with the size of an account. It deliberately leaves the environment variable counts alone: those are broken in a separate way, and scope item 28 owns them. The web page and the terminal picker get their search box and page controls in scope items 8 and 10. This spec is the contract those two will sit on.

## Context

Two routes list projects. `apps/web/app/api/projects/route.ts:9` takes no request argument, so it cannot read a query string at all. `apps/web/app/api/projects/[userId]/route.ts:8` receives a request and ignores it, and applies no ordering at all, so its row order is whatever the database happens to return. Neither bounds the result set. Neither returns a count. A user with twenty thousand projects pays for all twenty thousand on every list call, and on the web every one of those rows is decrypted and inspected before it leaves the server.

The forces shaping any fix are these. The web app already has a query string layer at `apps/web/nuqs_config/index.ts:10` that parses `page`, `limit` with a default of 30, and `search` from the address bar, and nothing uses it except a single read of `redirect` in `apps/web/components/auth/auth-button.tsx:14`. That layer is page based, which means someone has to translate a page number into an offset somewhere. The stack is Prisma 7 on Postgres, where the only index on Project is `@@unique([userId, name])` at `packages/database/prisma/schema.prisma:106`. There is no trigram extension, no full text setup, and no migrations folder, because the repo works by running `prisma db push`. zod is a dependency at `apps/web/package.json:58` but no route handler validates its input with it, so the only existing pattern is ad hoc guards such as `Number(searchParams.get("limit"))` at `.../versions/route.ts:16`.

One thing surfaced while reading this code that changes what the list path may assume about content. There are three functions called `decryptEnvValues` and they are not the same function. `apps/web/lib/encryption.ts:23` only parses JSON. `packages/env-helpers/src/helpers/index.ts:300` decrypts each value separately with AES-256-CBC, one `iv:ciphertext` hex string per variable. `packages/env-helpers/src/helpers/encrypt.ts:57` decrypts a single AES-256-GCM envelope of shape `{iv, content, authTag}`. The line that decides which one you get is `packages/env-helpers/src/helpers/index.ts:12`, a star re export of `encrypt.ts`: a function declared locally in a module beats a star re export, so `import { decryptEnvValues } from "@nvii/env-helpers"` resolves to the per value one at line 300. The GCM function is unreachable through the package barrel, and the package exports map lists only `.`, so there is no deep import either. Verified at runtime against the built package.

What is actually stored follows from that. `packages/cli/src/commands/new.ts:73` sends `encryptEnvValues(...)` from the barrel, which is the per value function, so `Project.content` is a record like `{DATABASE_URL: "ivhex:cipherhex"}`, not a GCM envelope.

That matters because the list route is the only caller of the JSON parsing stub. The stub happens to produce a correct `totalElem`, because parsing the record and counting its keys is the same as counting the variables. What it cannot produce is a meaningful `totalEmpty`: an encrypted string is never empty, so `totalEmpty` is always 0 and every card reads `status: valid`. The versions route and the single project route are unaffected, because they decrypt through `apps/web/lib/actions/decrypt.ts`, which reaches the correct per value function. So the defect is narrow and specific: status is always valid. This spec leaves that exactly as it is and scope item 28 owns it.

Second, the CLI route has an open hole the pagination work brushes straight past: `POST /api/projects/{userId}` creates the project and its access row under the `userId` in the path while authenticating only the caller, so any authenticated user can plant a project in any account. That is pre existing and not opened here, but the identical check this feature adds to GET belongs on POST too, and it costs three lines.

Response envelopes are already inconsistent. The web list route returns a bare array at `route.ts:68`, the CLI route returns raw Prisma rows at `[userId]/route.ts:55`, and the rest of the API uses the `{data, success}` shape from `apps/web/lib/response.ts:3`. Whatever is chosen has to serve two callers with different needs: the web grid, which shows a count of environment variables per card, and the terminal picker, which wants names only and pays for latency the moment it runs.

If this is not decided, scope items 8 and 10 have nothing to build against, and the first version of search as you type will fetch an entire account on every keystroke.

## Requirements

**User stories**:

- As someone with more projects than fit on a screen, I want the list to arrive a page at a time so that opening the app stays fast however many projects I have.
- As someone with more projects than fit on a screen, I want to search by project name or by who owns it so that I can find one without scrolling.
- As someone who knows how many projects they have, I want the list to report a total so that page numbers and a last page are possible.
- As a person using the terminal, I want the same list contract on the CLI route so that the picker in scope item 10 can page and search the same way the web does.

**Acceptance criteria** (the contract):

- **AC-1**: Both `GET /api/projects` and `GET /api/projects/{userId}` accept `limit`, `offset`, and `search`, and apply all three.
- **AC-2**: With no parameters, both routes return the newest 30 rows from the start. With no `search`, the search filter is not applied.
- **AC-3**: Both routes return an object with exactly four fields: `items`, `total`, `limit`, and `offset`. `total` counts every row the caller can see under the same search filter, with neither limit nor offset applied.
- **AC-4**: `items` and `total` are read inside one database transaction, so a project created or deleted during the request cannot make the two disagree.
- **AC-5**: `search` matches a case insensitive substring (Prisma translates this to `ILIKE`) anywhere in the project name, the project owner's name, or the project owner's email.
- **AC-6**: A missing, empty, or whitespace only `search` is ignored and the plain list is returned.
- **AC-7**: Rows come back newest first by created date, with project id breaking any tie, giving a deterministic order of `[{ createdAt: desc }, { id: desc }]`. The id tiebreaker is required, because a bulk insert in one transaction gives every row the same timestamp. The order is not stable across concurrent writes: a project created while a reader is paging shifts later pages by one, and a reader may see the same row twice. Callers treat `total` as approximate for that reason.
- **AC-8**: A `limit` that is not a number, is below 1, or is above 100; an `offset` that is not a number or is below 0; or a `search` longer than 100 characters returns 400 with the standard error body from `apps/web/lib/response.ts:7`.
- **AC-9**: An `offset` past the last page returns an empty `items` array with the true `total`. It is not a 404, and the route does not silently walk back to an earlier page.
- **AC-10**: The web route inspects only the rows on the requested page, never the rows it left behind.
- **AC-11**: On the web route each row's `content` is replaced by `totalElem` and `totalEmpty`, computed by the same `decryptEnvValues` from `apps/web/lib/encryption.ts:23` and the same `analyzeContent` as today. This spec changes only how many rows that runs over, never how it works. `totalEmpty` stays unreliable, always 0, and `status` stays `valid` on every project, because that fix depends on changing the decryption path and belongs to scope item 28. On the CLI route the raw `content` column is returned untouched, exactly as today.
- **AC-12**: Both routes return the projects the caller owns plus the projects shared with the caller, and nothing else, regardless of the search term.
- **AC-13**: `GET` and `POST` on `/api/projects/{userId}` return 403 when the `userId` path segment is not the authenticated caller's id. On POST this closes a hole that already exists: the handler at `[userId]/route.ts:125` creates the project and its access row under the path `userId` while authenticating only the caller, so any authenticated user can plant a project in another account today.
- **AC-14**: A parameter repeated in the query string resolves to its first value rather than being treated as an array. Each parameter is read with `URLSearchParams.get`, never through `Object.fromEntries`, which would silently return the last value instead.
- **AC-15**: The web api client, `nvii link`, `nvii link --token`, and `nvii unlink` are all updated so that no command stops working and no page shows an error. The projects page gains one line reading "Showing N of M", built from the fields already returned. It gains no search box, no page controls, and no other new behaviour; those belong to scope item 8.
- **AC-16**: Each distinct search term is an independent request that the caller can cancel, and no server side state is kept between terms, so a caller is free to debounce without asking the server for anything. Concretely: the api client takes an `AbortSignal` and forwards it to `fetch`, the react query function passes the signal it is handed, and the projects query key carries page, limit, and search.
- **AC-17**: Percent and underscore in the search term are escaped before the query runs, so they match literally. Without this, `search=%` is an ILIKE wildcard and returns the caller's entire visible set.
- **AC-18**: `nvii link --token <id>` writes the project config straight from the token and makes no list call at all. It must work for a project on any page, not only the first.

## Options considered

### Option 1: Offset plus a total, one shared query

One module owns the visibility filter, the search filter, the ordering, the paging, and the count. Both route handlers call it and then format the rows for their own caller.

**Pros**:
- The visibility and search filters exist once, so the two routes cannot drift apart on what a user can see.
- A total is available, which is what makes page numbers and a last page possible.
- Matches the page based nuqs layer already in the repo, so the address bar page number needs one small translation and nothing else changes.

**Cons**:
- Offset paging skips rows as the table grows, so deep pages get slower. Fine at the scale this repo is at, wrong for a very large table.
- Offset plus total means two queries per request rather than one.

### Option 2: Cursor paging with no total

Rows carry an opaque cursor and the client walks forward.

**Pros**:
- Page cost does not grow with depth, because the database seeks rather than counting past rows.
- Insertions and deletions at the head of the list do not make a page shift under the reader.

**Cons**:
- No total, so no page numbers and no last page. The nuqs layer is built around a page number and would have to be rewritten.
- The caller has to hold and pass cursors, which is more state for a picker and a grid that both already think in pages.
- Requires a stable tiebreaker column and a strictly ordered sort, which adds a constraint every future edit to the sort must respect.

### Option 3: Offset plus a total, two independent queries

Each route keeps its own `findMany` and grows its own filter.

**Pros**:
- No new module, so the diff is smaller and each route reads on its own.

**Cons**:
- The visibility filter and the search filter get written twice, and the two copies will drift. That drift is a security bug waiting to happen, not a style complaint.
- The owner name and email search has to be rebuilt in both places, including the relation filter and its join.

### Option 4: A bare array with the total in a response header

Rows stay exactly what they are today and the count rides in a custom header.

**Pros**:
- Every existing caller keeps working untouched, so no call site changes.

**Cons**:
- The two things a caller needs are split across two channels, which is easy to lose in a cache and awkward to read in a browser.
- Leaves the envelope inconsistent with the rest of the API, which is the thing that made this hard to scope in the first place.
- Hides the contract from anyone reading the route.

## Decision

**Chosen option**: Option 1: Offset plus a total, one shared query

A single list module owns visibility, search, ordering, paging, and the count; both list routes call it and format its rows for their own caller, returning `{ items, total, limit, offset }` with `limit` defaulting to 30 and capped at 100, `offset` defaulting to 0, and `search` matching a case insensitive substring of the project name or the owner's name or email.

## Rationale

The scope asks for a total, and a total is the whole reason offset wins here. Page numbers, a last page, and the page based layer already sitting in `apps/web/nuqs_config/index.ts` all need a count; a cursor design would have had to rewrite that layer and hand every caller cursor state they do not otherwise need. Two thousand projects is not a table where offset skipping hurts, and if it ever is, the fix is local to the shared module because the seam is already there.

The single shared module is what keeps Option 3's failure mode from happening. Today the two routes already disagree, in that one orders by created date and the other does not order at all. Duplicating a filter that also spans a relation into User, to reach the owner's name and email, doubles the number of places a mistake can hide a project someone should not see.

Keeping the per row inspection bounded by the page, rather than storing env counts in new columns, is the right trade at this stage. Pagination is what actually caps the cost, and adding a denormalized count column means every write path has to keep it true or the cards lie. A column that drifts is a worse bug than inspecting thirty rows.

## Feature design

**Data model sketch**: no change. No migration, no new column, no new entity.

| Entity | Key | Fields this feature touches | Relationships |
|---|---|---|---|
| Project | `id`, cuid | reads `name` for search, `createdAt` for the sort, `content` on the web route only and only for rows on the page | belongs to `User` via `userId` · has many `ProjectAccess` · has many `EnvVersion` · unique on `[userId, name]` |
| ProjectAccess | `[projectId, userId]` | unchanged, used only to decide visibility | links one Project to one User |
| User | `id` | reads `name` and `email` for the search, `id` as the decryption key | owns projects, and appears through ProjectAccess |

**State transitions**: none. This is a read only change.

**API surface**:

| Endpoint | Method | Key inputs | Key outputs | Auth | Key errors |
|---|---|---|---|---|---|
| `/api/projects` | GET | `limit` int, optional, 1 to 100, default 30 · `offset` int, optional, 0 or more, default 0 · `search` string, optional, 100 characters max | `items` array of project rows · `total` int · `limit` int · `offset` int | better auth session | 400, 401 |
| `/api/projects/{userId}` | GET | the same three, plus `userId` path segment | the same four fields, rows keep their raw `content` | CLI headers or web session; the path `userId` must equal the caller's id | 400, 401, 403 |
| `/api/projects/{userId}` | POST | unchanged, body as today, plus the 403 path check from **AC-13** | unchanged | unchanged, plus the path `userId` must equal the caller's id | 400, 401, 403 |
| `/api/projects/{userId}/{projectId}` | GET | unchanged, plus `summary=1`, a new additive branch | unchanged, plus a `summary=1` branch returning `{ project: { id, name } }` with no version query and no decrypt. Used by `nvii unlink`. | CLI headers or web session, owner or share check already in place | unchanged |

The four field object replaces the bare array both list routes return today. Every call site is in this repository and is updated in the same change.

**Value sourcing**:

| Action | Value produced or displayed | Source |
|---|---|---|
| List projects, either route | which rows are visible | derived from the caller: session user id from `auth.api.getSession` on the web route, or `validateCliAuth` headers on the CLI route, combined with the `userId` path segment |
| | the filter, written in exactly this shape | `where: { AND: [ { OR: [ { userId: callerId }, { ProjectAccess: { some: { userId: callerId } } } ] }, { OR: [ { name: { contains: term, mode: "insensitive" } }, { user: { name: { contains: term, mode: "insensitive" } } }, { user: { email: { contains: term, mode: "insensitive" } } } ] } ] }`. The two ORs sit under one AND, never as siblings: two OR keys on the same object is the same key twice, so the second silently replaces the first. |
| | which fields each row carries | a `select: Prisma.ProjectSelect` argument passed through by the shared module. The web route passes `route.ts:29` to `47` verbatim; the CLI route passes `[userId]/route.ts:44` to `52` verbatim. |
| | the rows themselves | `db.project.findMany` inside the shared module, with the filter above, `take: limit`, `skip: offset`, and `orderBy: [{ createdAt: desc }, { id: desc }]` |
| | `total` | `db.project.count` with the identical filter and neither `take` nor `skip`, read in the same transaction as the rows |
| | the form of that transaction | the array form `db.$transaction([findMany, count])`: one round trip and one snapshot, matching `[projectId]/route.ts:39`. The interactive `fn` form issues two sequential queries at two different snapshots. |
| | `limit`, `offset`, `search` as raw input | `new URL(request.url).searchParams.get(name)` once per parameter, then fed to zod. `Object.fromEntries` is not used anywhere on this path, because it returns the last value of a repeated parameter and would break **AC-14**. |
| | `limit` echoed back | the `limit` query parameter after zod defaults and the cap of 100 |
| | `offset` echoed back | the `offset` query parameter, zero when absent |
| | which projects a term matches | the `search` parameter, trimmed, compared case insensitively against `Project.name`, `User.name`, and `User.email` through the `user` relation, after `%`, `_`, and `\` are escaped with `term.replace(/([\\%_])/g, "\\$1")` |
| | `totalElem` and `totalEmpty`, web route only | `analyzeContent` from `apps/web/lib/objects.ts` over the row's `content`, passed through `decryptEnvValues` from `apps/web/lib/encryption.ts:23` as it is today. That function only parses JSON, which yields a correct `totalElem` because the stored record has one key per variable. It yields a `totalEmpty` of 0 always, which is why `status` is always `valid`. Left as is; scope item 28 owns the fix. |
| | `content`, CLI route only | the raw `Project.content` column, untouched |
| | who the caller is, CLI route | the `X-Auth-Code`, `X-User-Id`, and `X-Device-Id` headers, or a web session, resolved to one `user` exactly as `[userId]/route.ts:23` to `32` already does |
| | who the caller must be | that already resolved `user`. The check reads `if (userId !== user.id) return ErrorResponse(..., 403)` against the resolved user, not against the headers alone, because the route also accepts a web session. |
| `nvii link` with no token | the picker rows | `response.data.items` over axios, with `response.data.total` for the page arithmetic. The empty state branches on `total === 0` with no search term, against `items.length === 0` with one, which is what makes the terminal picker able to say "nothing matches" rather than "you have no projects". |
| `nvii link --token` | the linked project id | the `--token` argument itself. No request is made. |
| `nvii unlink` | the project's id and name | `GET /api/projects/{userId}/{projectId}?summary=1`, which resolves `Project.id` and `Project.name`, enforces owner or share access, and runs no version query and no decrypt |
| web page addressing | the page number | the address bar, through the existing `nuqs_config` layer; the client converts page and limit into an offset in one helper |
| the projects page | the "Showing N of M" line | `items.length` and `total`, both fields the route already returns |

**Key invariants**:

- The visibility filter and the search filter are built once and handed to both the `findMany` and the `count`. They are never written twice.
- The two filters are combined as `AND: [ { OR: [visibility] }, { OR: [search] } ]`. Two OR keys on the same object is the same key written twice, and the second one replaces the first. This is the single easiest way to ship a privacy bug in this feature, because the resulting query looks plausible and returns rows.
- No project outside the caller's owned plus shared set is returned or counted, whatever the search term.
- The search filter can only narrow the result. It can never widen it, because it is a sibling inside an AND and not a top level key.
- `limit` is always between 1 and 100 inclusive by the time it reaches Prisma. There is no path where a caller's value passes through unchecked.
- The web route inspects at most `limit` rows. The CLI route never inspects content at all.
- Percent, underscore, and backslash in a search term are escaped before the query runs, so a term can never widen into a wildcard match.
- Every rejection uses the `ErrorResponse` envelope, so a 400 from these routes looks like a 400 from the rest of the API.
- `search` is never logged, never stored, and never written to the database.

**Security model**:

- The web route accepts a better auth session only, unchanged. It does not accept CLI headers.
- The CLI route accepts CLI headers or a web session, unchanged, and gains one check on both GET and POST: the `userId` path segment must equal the resolved caller's id, otherwise 403. On GET, without that check any authenticated user could put another user's id in the path and read that user's project list. On POST, the same check closes a hole that is already open today: the handler creates the project under the path `userId` while authenticating only the caller.
- Search runs inside an AND with the visibility filter, so it cannot become a way around it.
- The `summary=1` branch on the detail route runs no version query and no decrypt. The full branch at `[projectId]/route.ts:58` fetches every version and decrypts the project, which would put plaintext environment secrets into a terminal just so `nvii unlink` could print a project name. The summary branch is what stops that.
- The search term is transient input. It is not PII, it is not stored, and it triggers no audit record.
- No compliance scope is triggered. This feature stores, reads, and writes nothing new about anyone.
- No rate limiting is added here. The repo has no limiter anywhere, and adding one to a single route would be a new pattern with no precedent to copy. This must land before search as you type ships; see Follow up.

**Configuration required**: none. No new environment variables, credentials, or flags.

**Critical test scenarios** (each maps to an acceptance criterion):

- Happy path: a signed in user with 95 projects calls `/api/projects?limit=30&offset=60` and gets 30 rows with `total` 95, `limit` 30, and `offset` 60, newest first. Verifies **AC-1**, **AC-2**, **AC-3**, **AC-7**.
- Count agrees with rows: a project created by another request during a slow list call does not produce a `total` that disagrees with the page. Verifies **AC-4**.
- Search by name: `?search=prod` matches `Production API` regardless of case. Verifies **AC-5**.
- Search by owner: `?search=colleague@example.com` returns the projects that colleague owns or that are shared from them. Verifies **AC-5**.
- Wildcards are literal: `?search=%` and `?search=_` match only projects whose name literally contains those characters, never the caller's whole visible set. Verifies **AC-17**.
- Blank term: `?search=%20%20` behaves exactly like no term at all. Verifies **AC-6**.
- Bounded inspection: with 500 projects, a request for 30 rows runs `analyzeContent` on 30 rows, not 500. Verifies **AC-10**.
- Counts are unchanged: a project holding 7 environment variables still comes back with `totalElem` 7 after this change. Verifies **AC-11**.
- Failure case: `?limit=abc`, `?limit=0`, `?limit=101`, `?offset=-1`, or a `search` of 101 characters each returns 400 in the standard error body. Verifies **AC-8**.
- Past the end: with 10 projects, `?offset=500` returns an empty `items` array and `total` 10. Verifies **AC-9**.
- Repeated parameter: `?limit=5&limit=100` is read as `limit=5`. Verifies **AC-14**.
- Auth and permission: an unauthenticated call to either route returns 401. A CLI caller whose headers do not match the `userId` in the path returns 403 on both GET and POST. A user searching for a term that matches only another user's private project gets empty `items` **and** `total` 0, which is the case that fails if the two OR filters are written as siblings instead of under an AND. Verifies **AC-12**, **AC-13**.
- CLI round trip: `nvii link` lists and `nvii unlink` confirms against a project on the second page, with neither command downloading the whole account. `nvii link --token` links a project on page two without issuing a list request at all. Verifies **AC-15**, **AC-18**.
- Cancellation: navigating away mid search aborts the request in flight, and no state from the abandoned term leaks into the next one. Verifies **AC-16**.

## Build plan

Ordered as a Tracer Bullet: stand one thin thread from the database through a route to a real caller first, then widen it. Each slice is shippable on its own and leaves the app working.

1. Write the zod query schema and the extraction that feeds it: read `limit`, `offset`, and `search` once each with `new URL(request.url).searchParams.get`, trim the term, treat a missing or whitespace only term as no search, escape `%`, `_`, and `\`, apply the defaults of 30 and 0, the bounds of 1 to 100 and 0 or more, and the 100 character cap. Satisfies **AC-6**, **AC-8**, **AC-14**, **AC-17**.
2. Write the shared list module: it takes a viewer id, a limit, an offset, a search term, and a `select`, builds `AND: [ { OR: [visibility] }, { OR: [search] } ]` once, and reads rows and count through the array form of `$transaction` with `orderBy: [{ createdAt: desc }, { id: desc }]`, `take`, and `skip`. Satisfies **AC-3**, **AC-4**, **AC-5**, **AC-7**, **AC-12**.
3. Wire `GET /api/projects` to the module, passing `route.ts:29` to `47` verbatim as the `select`, then format each row exactly as today: `decryptEnvValues` from `@/lib/encryption` followed by `analyzeContent`. Update `apps/web/lib/api-client.ts` to read `items`, `total`, `limit`, and `offset`. Satisfies **AC-1**, **AC-2**, **AC-9**, **AC-10**, **AC-11**, **AC-15**.
4. Move `GET /api/projects/{userId}` onto the same module with its own `select` from `[userId]/route.ts:44` to `52` and a lean row formatter that leaves `content` alone. Update the `nvii link` call site to read `response.data.items` and branch its empty state on `total`. Satisfies **AC-1**, **AC-2**, **AC-11**, **AC-15**.
5. Add the ownership check to GET and POST on the CLI route, comparing the `userId` path segment against the already resolved caller and answering 403 in the standard error body. Satisfies **AC-13**.
6. Make `nvii link --token` write the project config straight from the token, with no list request, and have the picker request `limit=100` explicitly. Satisfies **AC-18**, **AC-15**.
7. Add a `summary=1` branch to `GET /api/projects/{userId}/{projectId}` returning `{ project: { id, name } }` with no version query and no decrypt, and point `nvii unlink` at it. Satisfies **AC-15**.
8. Add the page number to offset helper, fold `page`, `limit`, and `search` into the projects query key in `apps/web/components/projects-provider.tsx`, thread an `AbortSignal` through the api client into `fetch`, and add the "Showing N of M" line to the projects page. Settle whether `staleTime: Infinity` with `gcTime: 500` stays as it is. Satisfies **AC-2**, **AC-15**, **AC-16**.

No migration. No schema change, so nothing in this plan touches the database structure.

## Consequences

**Positive**:
- Cost of a list call stops growing with the size of an account. Both the row count and the per row inspection are bounded by `limit`.
- The search term has one meaning on both routes, so a picker and a grid cannot disagree about what a user sees.
- The CLI route stops being a way to download an entire account, which it effectively was for `nvii link` and `nvii unlink`.
- Adding a search index later is a change inside the shared module and touches no route.

**Negative / tradeoffs**:
- Both list routes break their response shape. Every caller in this repo is updated in the same change, but any external script written against `GET /api/projects` will stop working with no deprecation window.
- The web pages change what a user sees. The projects page shows 30 rows instead of all of them, and the dashboard's valid, missing, and invalid counts become counts for the current page while the surrounding copy reads "across all projects". This spec adds the "Showing N of M" line to the projects page but does not fix the dashboard copy, which belongs to scope item 8.
- The environment variable counts are untouched, which means the card status stays `valid` on every project and stays a lie. This spec bounds that work, it does not fix it. Scope item 28 does.
- `POST /api/projects/{userId}` starts answering 403 where it used to answer 200. Any flow that relied on creating a project under a userId other than the caller's stops working. That flow should not have worked.
- Offset paging gets slower the deeper the page goes, because the database counts past the skipped rows. At this scale it does not matter; at a much larger table it would, and the fix is a cursor design inside the shared module.
- Two queries per list request instead of one, since the total is a separate count inside the same transaction.
- The owner's name and email search adds a relation filter through User to every list call, and because the term matches anywhere in the name, Postgres cannot use `@@unique([userId, name])` for that branch and hash joins `users` per row. Fine at a couple of thousand rows, which is the argument for the deferred trigram index.
- `search` by owner name means typing your own name returns every project you own. That is deliberate and easy to explain, but it will surprise someone the first time.

**Neutral**:
- The web page and the terminal picker gain no search box and no page controls from this spec. Item 8 and item 10 own those, along with the debounce.
- The `decryptEnvValues` stub in `apps/web/lib/encryption.ts:23` is still the only thing this route uses, and this route is still its only caller. It stays exactly as it is. Once the pagination build lands the stub has no callers at all, so it can be deleted and the file's star re export will then resolve `decryptEnvValues` to the GCM function at `packages/env-helpers/src/helpers/encrypt.ts:57`. Whoever does that must first check what that changes for the CLI, which imports the same package. Scope item 28 owns that decision.
- The `summary=1` branch on the detail route is additive. The existing full response is untouched, so nothing else has to change to accommodate it.
- No tests come with this spec. The repo has no test runner installed. The Beta workflow runs the test stage after the build.

## Follow-up

- [ ] Debounce belongs to the caller, not to the route. Item 8 and item 10 must debounce the search term before sending it and cancel the request in flight. This spec only guarantees that each term is an independent cancellable request.
- [ ] Add rate limiting to the list routes before search as you type ships. The follow up in scope item 8 should not build the debounced search box without it.
- [ ] Add a trigram index on the project name and on the owner relation once the project table grows. Prisma cannot express it, so it needs hand written SQL, which means deciding whether this repo starts a migrations folder or keeps using `prisma db push`. This is not hypothetical: a leading wildcard ILIKE across a join is the query this spec introduces.
- [ ] Add a composite index on `[userId, createdAt]` so the owned projects branch of the visibility filter does not sort in memory. Same open question about migrations.
- [ ] Resolve the shadowing `decryptEnvValues` stub in `apps/web/lib/encryption.ts:23` against the real implementation for every remaining caller. This spec only fixes the list path; the single project route and the versions route still import the stub through it.
- [ ] `apps/web/types/project.ts:39` declares a `slug` on Project that no column backs. Search is on `name` only, so anyone who assumes slug is searchable will be wrong.
- [ ] The dashboard counts at `apps/web/app/page.tsx:25` to `27` become per page counts under this spec while their copy still reads "across all projects". Scope item 8 should fix the copy or change the fetch.
- [ ] This repository has no `AGENTS.md`. The API layer conventions settled here, especially that list routes validate their input with zod, combine filters under an AND, and return the error envelope, have nowhere recorded. An audit would give them a home.

## Migration plan

**Strategy**: no migration needed.

There is no schema change and no data transformation. The response shape changes for both list routes, but every caller lives in this repository and is updated in the same change, so the whole thing is one commit.

**Phases**:
1. Ship the new routes and the updated call sites together.

**Rollback**: revert the commit. Both routes return the old bare array again and every call site goes back with them, because nothing outside this repository depends on the shape. This is the reason the call sites are in this spec rather than left to items 8 and 10.

**Risks**: a consumer outside this repository calling `GET /api/projects` will break on deploy with no warning. Nothing in the repo suggests one exists, and the scope lists none. Two smaller ones: `POST /api/projects/{userId}` starts returning 403 for a path userId that does not match the caller, and the env counts on project cards change value. Both are deliberate, and both are noted in Consequences.
