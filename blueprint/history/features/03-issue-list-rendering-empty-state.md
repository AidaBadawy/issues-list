# Feature: Issue list rendering + empty state

**From build-plan:** feature 3
**Build attempt:** 1
**Status:** verified
**Branch:** `feature/issue-list-rendering-empty-state`

## Goal

Turn the placeholder shell into the real page (requirements 3 and 4): render
every open issue from the built-in snapshot with number, linked title, label
chips, plain text author, and opened date, newest first - with a distinct,
clear message when a real fetch found zero open issues.

## In scope

- `src/app/issues/issue-view-state.ts` - pure resolver mapping the snapshot
  to exactly one of three view states: `placeholder` (snapshot is `null`),
  `empty` (real fetch, zero issues), `list` (issues present).
- `src/app/issues/issue-list/` component (`issue-list.ts/.html/.css`) that
  renders the three states:
  - **List:** each issue shows its number (`#N`), its title as a link to
    `issue.url`, its labels as chips, its author as plain text, and its opened
    date (`DatePipe`, `mediumDate`). Items are `<li>` inside a `<ul>`.
  - **Empty:** the clear requirement-4 message "No open issues."
  - **Placeholder:** "Issue data is not available in this build." (the local
    `null` case - never shown for a real empty fetch).
- `src/app/app.html` hosts `<app-issue-list />`; the "Open issues" heading
  moves into the component so all three states share it. Existing
  `app.spec.ts` keeps passing (heading text unchanged).
- Minimal component CSS for readable rows and chips (feature 7 owns full UI
  polish).
- Unit tests for the view-state resolver (the logic gate).

## Out of scope

- Fetching data (feature 2, already built), the workflow (feature 5).
- Full responsive/UI polish (feature 7) - only baseline readable styles here.
- Avatars (decided against), sorting logic (data arrives newest-first),
  closed issues, filters, search.
- Browser-test harness (opt-in via `/tests browser`, not configured).

## Build loop

Build one small step at a time. `workflow.stepReview` is `feature`: one review
packet after all steps. `workflow.checkpointCommits` is `disabled`: no
checkpoint commits; `/complete` makes the final feature commit. Never accept a
review packet you have not read.

## Build steps

- [x] **Step 1 - View-state resolver + tests** - Add
  `issue-view-state.ts` with `resolveViewState(snapshot: IssueSnapshot |
  null): 'placeholder' | 'empty' | 'list'` and its spec covering all three
  cases, especially `null` vs `[]`. *Done when:* `npm test` runs the new
  specs green alongside the existing suites.
- [x] **Step 2 - IssueList component for all three states** - Build the
  component and template rendering list, empty, and placeholder states as
  specified; host it from `app.html`; baseline row/chip styles; date via
  `DatePipe`; all issue text bound as interpolation only (no
  `innerHTML`/`bypassSecurityTrust`). *Done when:* `npm run build` and
  `npm test` pass, and `app.spec.ts` still asserts the "Open issues"
  heading.
- [x] **Step 3 - Full gate pass** - Run the complete local gate set once.
  *Done when:* `npm run lint`, `npm test`, and `npm run build` all exit 0 on
  the feature branch in one pass.

## Files / areas

- `src/app/issues/issue-view-state.ts` + `issue-view-state.spec.ts` - new
- `src/app/issues/issue-list/issue-list.{ts,html,css}` - new component
- `src/app/app.html` - host `<app-issue-list />`
- `src/app/app.spec.ts` - only if the heading assertion needs adjusting
  (expected: unchanged)

## Data / contracts

- Consumes `issueSnapshot` from `src/app/issues/issues.data.ts`, typed
  `IssueSnapshot | null` (frozen in feature 2). The `null` vs `[]` split is
  the whole point of the resolver: `null` is the local placeholder, `[]` is
  requirement 4's "no open issues".
- Rendering contract per issue (from the `Issue` type):
  - `number` shown as `#N`, not linked (the title carries the link)
  - `title` bound as text; the anchor's `href` is `issue.url` (API-provided),
    opened with `target="_blank"` and `rel="noopener"`
  - `labels[]` rendered as chips: label `name` as text; `color` used only as
    a chip accent (border), never as text background, so arbitrary API colors
    cannot destroy text contrast
  - `author`: plain text; `null` renders as "deleted user"
    (recorded display decision for deleted/anonymous authors)
  - `createdAt` formatted with Angular `DatePipe` (`mediumDate`)
- Order: render `issues` exactly as supplied (already newest-first from
  feature 2's server-side `CREATED_AT DESC`); no client-side re-sort
  (recorded decision).
- Trusted rendering rule: Angular interpolation binds all issue-derived
  strings as text; no attribute that executes or navigates to a
  `javascript:` URL is ever built from issue data (`href` uses only the API's
  `url` field).

## Testing

- Runner: `npm test` (gate declared in `AGENTS.md`).
- Logic in scope, shipped in Step 1: the view-state resolver (the three-way
  classification, including the two look-alike "no issues" inputs `null` and
  `[]`).
- Component rendering is UI: verified by the build plus the surviving
  `app.spec.ts` heading assertion, per the scope rule (no browser runner is
  configured; `/check` can add live evidence later if requested).
- Feature 3's done-when states (list vs empty vs placeholder in a browser)
  are proven by code review + tests here; a live screenshot check is only
  possible if the user starts the dev server or a browser harness is added.

## Notes for the AI

- No em dashes in generated content.
- Standalone component, signals, `@if`/`@for` control flow, PascalCase class,
  `app-` kebab selector (coding standards).
- Do not import anything from `scripts/`; the app only reads
  `issues.data.ts`.
- Keep the component dumb: it classifies and displays, it never fetches or
  sorts.
- Baseline styles only; resist building the design system (feature 7).


<!-- blueprint:completion {"schemaVersion":2,"specBytes":5832,"specSha256":"37fca23009e89e491dfefd3a06cee190ae87e82cefdaebcaa3ef7957f53dd743","branch":"refs/heads/feature/issue-list-rendering-empty-state","head":"0523ebaa53c99d6237c54de0ba7d2d5e849e3b11","baseRef":"refs/heads/development","baseCommit":"0523ebaa53c99d6237c54de0ba7d2d5e849e3b11","sourceTree":"c4e90ffd85a7f24e529fb3fca0ee5d3d6502c6f4","landing":"local-merge","absentOptional":[]} -->
