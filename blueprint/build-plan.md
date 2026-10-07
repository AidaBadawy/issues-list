# Build Plan

Features in rough build order. Each one is small enough to review and prove on
its own. The source of truth for scope is `TEST.md` (requirements 1–12 plus
optional extras).

Run `/feature` to spec the next unchecked item, or `/feature 2` to pick one.
Keep completed items checked and append new features as the project grows.
Do not renumber completed features; their archived specs refer to those IDs.

## Your features

- [x] 1. **Angular scaffold on current stable Angular** - Create the Angular app with the current stable version, minimal app shell (single issue-list page placeholder), lint and production build passing.
- [x] 2. **GitHub GraphQL issue fetch** - Build-time script/service that queries every open issue with cursor pagination (no cap — every open issue, even past 100), returning number, title, issue URL, labels, author, and opened date; sorted newest-first by opened date; reads the repo owner/name from the workflow environment (`GITHUB_REPOSITORY`), never hardcoded; uses only `GITHUB_TOKEN` from the environment; when no token is present (local dev), always skip the fetch and render a placeholder.
- [x] 3. **Issue list rendering + empty state** - Page renders each issue newest-first with number, title linked to GitHub, label chips, plain text author name (no avatars), and opened date; shows a clear "no open issues" message when the list is empty; untrusted issue text rendered as text only.
- [x] 4. **Token and portability verification** - Prove the built bundle contains no token and no hardcoded owner/repository/URL anywhere, and that the same code builds correctly for a different owner/repo name supplied only via environment.
- [x] 5. **Deploy workflow + GitHub Pages** - Workflow with `workflow_dispatch` and push-to-default-branch triggers that builds the site and deploys to GitHub Pages (official Pages actions, minimal permissions); README documents the required Settings → Pages → Source: GitHub Actions step and the accepted first-run failure.
- [x] 6. **Refresh-on-reload behavior** - Verify that after a redeploy a normal page reload shows the new issue list with no hard refresh, shipping the default Angular build as-is: no service workers, no custom cache headers, no caching middleware added.
- [x] 7. **Responsive, clean UI** - Polish the list for desktop and phone: readable single-column layout, label chips, clear typography, working on a small viewport; plus the user-approved additions: author avatars, client-side search/filter, inline SVG icons, dark mode via `prefers-color-scheme`, and a local Playwright browser-test harness (documented command, not CI).
- [ ] 8. **README** - Explains how the app works (build-time GraphQL fetch, snapshot semantics), how to deploy (fork/push, enable Pages, run workflow), and how to refresh the data.
- [ ] 9. **Automated tests** - Unit tests for the fetch/pagination logic (mocked GraphQL) and for rendering issues and the empty state; wired into a repeatable command.

## Requirement mapping (TEST.md → features)

Every numbered requirement and optional extra maps to at least one feature:

| # | Requirement (abridged) | Feature(s) |
|---|---|---|
| 1 | Current version of Angular | 1 |
| 2 | Issue data from GitHub GraphQL API | 2 |
| 3 | Show every open issue (>100 too) with number, title link, labels, author, opened date, as of last deploy | 2, 3 (snapshot semantics also 8) |
| 4 | Clear "no open issues" message | 3 |
| 5 | GitHub Actions workflow: push to default branch + manual "Run workflow" | 5 |
| 6 | Only the automatic GITHUB_TOKEN; no PATs/secrets; token never in the deployed site | 2, 4, 5 |
| 7 | Nothing hardcoded to one account/repository | 2, 4 |
| 8 | README explaining app + deploy | 5, 8 |
| 9 | Evaluator can clone and push to their own public repo | 4, 5 (end-to-end proof in 8) |
| 10 | Pages enabled with Source: GitHub Actions (documented; evaluator action) | 5, 8 |
| 11 | Manual workflow run, then open the site | 5 |
| 12 | Create/close issues, rerun workflow, list updates | 2, 5 |
| E1 | Automated tests | 9 |
| E2 | Redeploy visible on normal reload, no hard refresh | 6 |
| E3 | Clean UI that works on a phone | 7 |

## Risks

- **GITHUB_TOKEN scope for GraphQL:** the auto token must be able to read
  issues via GraphQL. Mitigated by declaring explicit minimal workflow
  `permissions` (`contents: read`, `issues: read`, `pages: write`,
  `id-token: write`); confirmed during feature 2/5 rather than assumed.
- **Pagination cost:** repos with many hundreds/thousands of open issues mean
  many GraphQL round trips; risk of hitting rate limits or workflow timeout.
  Decision: every open issue must be included (no cap, per requirement 3), so
  mitigation is efficient pagination (batched selections where the API
  allows) and relying on the workflow's default timeout; verified with a
  large issue count during feature 9's pagination tests.
- **Stale HTML caching:** "fresh on a normal reload" depends on GitHub
  Pages/CDN caching behavior we don't fully control. Decision: ship the
  default Angular build with no service workers and no custom cache headers;
  feature 6 verifies the default behavior actually refreshes on a normal
  reload. If verification fails, it becomes a blocker to resolve, not a
  silent defect.
- **"Current Angular" drifts:** the version that is current at implementation
  time may differ from the evaluator's assumptions; we take latest stable at
  build time and pin it in `package.json`.
- **Local development without a token:** local builds always skip the fetch
  and render a placeholder (decision below); this cannot weaken
  requirement 6 because no token is ever read outside Actions.
- **Untrusted issue content:** titles/labels/author names rendered into the
  page; XSS risk if ever bound as HTML. Angular's default sanitization
  helps, but feature 3 verifies text-only rendering.
- **Workflow failure before Pages is enabled:** explicitly accepted by the
  brief; README must say so so it isn't mistaken for a defect.

## Assumptions

- Static site only: no backend, no database, no server-side runtime — the
  issue list is a build-time snapshot ("as of last deploy" per requirement 3).
- The deployed repository and site are public.
- One repository per deployment; owner and repo name come from
  `GITHUB_REPOSITORY` in the workflow.
- `GITHUB_TOKEN` is sufficient (with explicit permissions) to read the
  current repository's issues through the GraphQL API.
- The evaluator performs the manual steps (push to their account, enable
  Pages, press Run workflow); the code only has to make those steps work
  without edits.
- Testing tooling is opt-in per the Blueprint (`/tests`); we use Angular's
  default runner rather than adding a new one.

## Decisions (previously open questions — resolved)

1. **Local dev fetch:** always skip fetching and render a placeholder.
2. **Cache freshness:** no custom cache headers, no service workers — ship
   the default Angular build and verify reload freshness (feature 6).
3. **Sort order:** newest first by opened date.
4. **Author display:** plain text login name always rendered; show an avatar
   when the API supplies `authorAvatarUrl`, text-only otherwise (revised for
   feature 7; previously "no avatars").
5. **Issue cap:** none — include every open issue, even if there are more
   than 100.

There are no remaining open questions.
