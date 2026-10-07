# Feature: Automated tests

**From build-plan:** feature 9
**Build attempt:** 1
**Status:** verified
**Branch:** `feature/automated-tests`

## Goal

Close the remaining test-plan gap by adding focused Angular component coverage
for rendered issue rows and the empty state, while retaining the existing mocked
GraphQL pagination and mapper coverage in the repeatable `npm test` command.

## In scope

1. **Issue-list rendering tests** - Add an `issue-list.spec.ts` suite that
   renders the standalone component with controlled in-memory data and proves a
   populated issue displays its number, title link, label, author, and opened
   date metadata.
2. **Empty-state rendering test** - In the same suite, prove a fetched empty
   snapshot displays "No open issues." and does not render the search box or an
   issue list.
3. **Repeatable test evidence** - Run the existing lint, unit/script test,
   build, bundle-audit, and browser-smoke commands. Do not add a new test runner,
   CI job, dependency, or production test seam.

## Out of scope

- Changing pagination, fetch behavior, production component behavior, browser
  tests, or GitHub Actions.
- Adding component tests for every visual detail, search case, avatar state, or
  placeholder state already covered by focused logic or browser tests.
- Adding coverage reporting, mocks for GitHub's live API, or another testing
  framework.

## Build loop

Continuous Mode implements this spec without step-review pauses. Checkpoint
commits are disabled; the feature gets one local feature commit and one local
development-branch squash commit after verification.

## Build steps

- [x] **Step 1 - Add populated-list component coverage** - Create the
  issue-list Angular spec using controlled in-memory issues and assert the
  rendered row's required content and GitHub link. *Done when:* `npm test`
  runs the new spec and proves a row renders number, title, label, author, and
  date metadata.
- [x] **Step 2 - Add empty-state component coverage** - Render the component
  with a fetched empty snapshot state and assert its distinct empty message and
  absence of list/search controls. *Done when:* the focused test passes without
  modifying production source.
- [x] **Step 3 - Run full verification** - Run the established local checks,
  including the browser smoke test. *Done when:* lint, tests, build,
  bundle audit, and browser smoke all pass.

## Files / areas

- `src/app/issues/issue-list/issue-list.spec.ts` - focused Angular rendering
  coverage.
- Not touched: production source, scripts, package dependencies, workflow, and
  browser-test configuration.

## Data / contracts

- Tests use only in-memory issue fixtures and never contact GitHub.
- Existing `scripts/issues-lib.spec.mjs` remains the mocked GraphQL
  pagination and mapper test suite.
- Issue rendering remains text-bound through Angular; the test verifies visible
  content and link attributes, not implementation-only fields.

## Testing

- `npm test` is the required unit and script-test command.
- Final evidence also includes `npm run lint`, `npm run build`,
  `npm run verify:bundle`, and `npm run test:browser`.

## Notes for the AI

- No em dashes in generated content.
- Keep tests deterministic and adjacent to the component.
- Do not use `any`, network access, or time-dependent assertions.


<!-- blueprint:completion {"schemaVersion":2,"specBytes":3335,"specSha256":"bf2bdea22448926391aa03f9f3bb6085195de0faa77c5196a307a8ea24a52687","branch":"refs/heads/feature/automated-tests","head":"c21be5161db5671e27b24ee0f337199ce5d18f59","baseRef":"refs/heads/development","baseCommit":"c21be5161db5671e27b24ee0f337199ce5d18f59","sourceTree":"363edbb92f1826be0d886338756ead050c69c69b","landing":"local-merge","absentOptional":[]} -->

