# Feature: GitHub GraphQL issue fetch

**From build-plan:** feature 2
**Build attempt:** 1
**Status:** verified
**Branch:** `feature/github-graphql-issue-fetch`

## Goal

Deliver the build-time data layer (requirements 2, 3, and part of 6/7): a
script that queries every open issue from the GitHub GraphQL API when the app
builds in GitHub Actions, writes a typed snapshot module the app imports, and
skips cleanly to a placeholder when running locally with no workflow context.

## In scope

- `src/app/issues/issue-snapshot.ts` - committed TypeScript contract:
  `IssueSnapshot`, `Issue`, `Label`.
- `src/app/issues/issues.data.ts` - committed placeholder data module
  (`issueSnapshot: IssueSnapshot | null = null`) that the fetch overwrites in
  CI.
- `scripts/issues-lib.mjs` - pure, testable logic: GraphQL query construction,
  response mapping, cursor pagination driver with an injectable fetch
  function.
- `scripts/fetch-issues.mjs` - thin runner: reads environment, calls the
  library, writes `issues.data.ts` on success, exits non-zero on fetch errors,
  skips with a message when not running in GitHub Actions.
- Fetch behavior: every open issue (paginated at 100 per request, no cap),
  fields number, title, url, labels, author login, opened date; server-side
  sort newest first (`CREATED_AT DESC`); owner/name from `GITHUB_REPOSITORY`;
  auth only from `GITHUB_TOKEN`.
- Skip behavior: outside GitHub Actions (`GITHUB_ACTIONS !== "true"`), always
  skip fetching, leave the committed placeholder in place, exit 0.
- Unit tests for the pure logic (query builder, mapper, pagination with
  mocked fetch), wired so `npm test` runs them alongside the existing suite.
- Lint coverage for the new `scripts/` files (`lintFilePatterns` plus an
  `eslint.config.js` block for `*.mjs`).
- `prebuild` wiring in `package.json` so `npm run build` runs the fetch
  (and therefore the skip path locally, real fetch in the workflow).

## Out of scope

- Rendering issues, empty state, or consuming the snapshot in a component
  (feature 3).
- The GitHub Actions workflow itself (feature 5) - this feature only makes
  `npm run build` do the right thing when the workflow later runs it.
- README documentation (feature 8), UI/styling (feature 7), expanded test
  coverage beyond this feature's logic (feature 9).
- Issue-count caps (decided: none), avatar fetching (decided: plain text),
  closed issues, comments.
- `tsconfig` changes - the generated data module is TS, not JSON, so
  `resolveJsonModule` stays off.

## Build loop

Build one small step at a time. `workflow.stepReview` is `feature`: one review
packet after all steps. `workflow.checkpointCommits` is `disabled`: no
checkpoint commits; `/complete` makes the final feature commit. Never accept a
review packet you have not read.

## Build steps

- [x] **Step 1 - Data contract and placeholder module** - Add
  `src/app/issues/issue-snapshot.ts` with the `IssueSnapshot`/`Issue`/`Label`
  types and `src/app/issues/issues.data.ts` exporting `issueSnapshot: Issue
  Snapshot | null = null`. *Done when:* `npm run build` and `npm test` still
  pass with the new files type-checked.
- [x] **Step 2 - Fetch library and runner script** - Add
  `scripts/issues-lib.mjs` (buildIssuesQuery, mapSnapshot, paginateIssues with
  injected fetch) and `scripts/fetch-issues.mjs` (env gate: fetch only when
  `GITHUB_ACTIONS=true` and `GITHUB_TOKEN` present; fail loudly if
  `GITHUB_ACTIONS=true` but the token or `GITHUB_REPOSITORY` is missing; on
  success write `issues.data.ts`; otherwise leave it untouched and log the
  skip). Extend lint config to cover `scripts/**/*.mjs`. *Done when:* running
  `node scripts/fetch-issues.mjs` locally prints the skip message, exits 0,
  and leaves `issues.data.ts` byte-identical; `npm run lint` passes and now
  includes the scripts files.
- [x] **Step 3 - Logic tests wired into `npm test`** - Add
  `scripts/issues-lib.spec.mjs` covering: query construction (open states,
  page size 100, newest-first order, cursor variables), mapping (all fields,
  label name/color, `author: null` for a deleted author), and pagination
  (three mocked pages merge in order and stop when `hasNextPage` is false,
  proving >100 issues survive). Change the `test` script to run both suites.
  *Done when:* `npm test` runs the existing Angular suite plus the new scripts
  suite, all green.
- [x] **Step 4 - Build integration** - Add `"prebuild": "node
  scripts/fetch-issues.mjs"` to `package.json`. *Done when:* `npm run build`
  locally runs the fetch script's skip path, exits 0, leaves the working tree
  clean, and the output bundle still builds.
- [x] **Step 5 - Full gate pass** - Run the complete local gate set once.
  *Done when:* `npm run lint`, `npm test`, and `npm run build` all exit 0 on
  the feature branch in one pass.

## Files / areas

- `src/app/issues/issue-snapshot.ts` - new, committed type contract
- `src/app/issues/issues.data.ts` - new, committed placeholder, overwritten by
  CI
- `scripts/issues-lib.mjs`, `scripts/fetch-issues.mjs` - new
- `scripts/issues-lib.spec.mjs` - new
- `package.json` - `prebuild` and `test` scripts
- `angular.json` - `lintFilePatterns` gains `scripts/**/*.mjs`
- `eslint.config.js` - block for `scripts/**/*.mjs`

## Data / contracts

`src/app/issues/issue-snapshot.ts` is the frozen shape feature 3 consumes:

- `IssueSnapshot`
  - `generatedAt` (ISO-8601 string) - fetch time; defines "as of last deploy"
  - `repo` (`{ owner: string; name: string }`) - split from
    `GITHUB_REPOSITORY`; never hardcoded
  - `issues` (Issue[]) - all open issues, newest first by `createdAt`
- `Issue`
  - `number` (number)
  - `title` (string) - untrusted text; render as text only
  - `url` (string) - taken from the API's `url` field (the canonical issue
    URL; equivalent to, and more reliable than, constructing it from
    owner/name/number - recorded deviation from the overview's parenthetical)
  - `labels` (Label[]) - fetched `labels(first: 100)` per issue; more than
    100 labels on one issue is not a case we support (recorded assumption)
  - `author` (`string | null`) - login, `null` when the author is deleted or
    anonymous; feature 3 decides how to render `null` (recorded refinement of
    the overview's `string`)
  - `createdAt` (ISO-8601 string) - opened date, the sort key
- `Label`
  - `name` (string)
  - `color` (string, optional) - hex without `#`, as returned by the API

Module lifecycle and error behavior:

- `issues.data.ts` exports `issueSnapshot: IssueSnapshot | null`. `null` means
  the fetch never ran (local placeholder); `[]` in `issues` means a real fetch
  found no open issues. Feature 3 must treat these differently: `null` shows
  the placeholder, `[]` shows requirement 4's "no open issues" message.
- The committed placeholder ships until a fetch succeeds; the runner only
  rewrites the file after a fully successful paginated fetch, so a mid-fetch
  failure can never leave partial data.
- `GITHUB_ACTIONS=true` without `GITHUB_TOKEN` or `GITHUB_REPOSITORY`, a
  non-2xx response, a GraphQL `errors` array, or a transport failure each
  print a clear message and exit non-zero (build fails loudly - never a
  successful-looking placeholder in CI).
- Outside Actions: log skip, exit 0, file untouched.

## Testing

- Runner: `npm test` (gate declared in `AGENTS.md`). The scripts suite runs
  through the already-installed Vitest binary; `ng test` keeps covering
  `src/**`.
- Logic in scope, tests ship in the same step (Step 3): query construction,
  response mapping, pagination driver - all with an injected/mocked fetch, no
  network in tests.
- Not tested here (per scope rule): the runner's shell behavior (env gate,
  file write, exit codes) is proven by Step 2's observed local run plus the
  Step 4 build run; component rendering stays with feature 3.

## Notes for the AI

- No em dashes in generated content.
- `scripts/*.mjs` is plain Node ESM (global `fetch`, Node 18+); do not import
  it from `src/` or add dependencies.
- The fetch never runs in the browser: no token, no GraphQL client in the
  app bundle (requirement 6).
- Keep the runner thin; all logic that can be wrong goes in `issues-lib.mjs`
  behind an injectable fetch seam.
- Feature 3 will import `issueSnapshot` from `src/app/issues/issues.data.ts`
  and must distinguish `null` from `[]` as recorded above.
- Do not commit a CI-populated `issues.data.ts`: the committed form is the
  `null` placeholder; local runs must leave the tree clean.


<!-- blueprint:completion {"schemaVersion":2,"specBytes":8502,"specSha256":"29e07ec4c9741531a0cf31f12a3f6aad756692ce5d923214d301c315dae99dcd","branch":"refs/heads/feature/github-graphql-issue-fetch","head":"86b9835979cba50b5e2c65a391fe1ae62d605ef8","baseRef":"refs/heads/development","baseCommit":"86b9835979cba50b5e2c65a391fe1ae62d605ef8","sourceTree":"fe55fb25991b7c01da395b18a18b7d6109048b13","landing":"local-merge","absentOptional":[]} -->
