# Issues List - Project Overview

<!-- blueprint:source-hash 8aa05794d34f5b86a999fdb6218d66f90d0746272b91cb36f3bd4886092d0502 -->

> A static site that shows a repository's open issues exactly as they were when
> the site was last deployed, fetched from the GitHub GraphQL API at build time
> and deployed to GitHub Pages by GitHub Actions.

## Problem

There is no lightweight, credential-clean way to publish a repository's open
issues as a plain website. This project builds one that deploys into any
GitHub repository with zero code edits: the only credential is the automatic
`GITHUB_TOKEN`, nothing is tied to one account, and the list refreshes by
re-running a workflow rather than changing code. The acceptance brief is
`TEST.md` (requirements 1–12 plus optional extras) and is the source of truth
for "done".

## Users

- **Evaluator** - clones/pushes to their own account, enables GitHub Pages,
  runs the workflow, and checks the list per `TEST.md` steps 9–12. Needs every
  step to work without editing code or settings beyond enabling Pages.
- **Visitor** - opens the public site (desktop or phone) and scans open issues
  without a GitHub login. Anonymous, read-only.

## Usage model

- Internet-facing, read-only, public repo and public site; tiny scale (one
  repo's open issues, a handful of visitors). No availability/compliance
  requirements.
- Trusted users; the only untrusted input is issue content (titles, labels,
  author names) - rendered as text only, never HTML.
- Single repository per deployment. Non-goals: no filters/search, no closed
  issues, no comments, no auth, no writes, no server, no analytics.

## Features

Build-plan order; spec each via `/feature`.

1. **Angular scaffold on current stable Angular** - app shell, lint and
   production build passing. *(Headline foundation - requirement 1.)*
2. **GitHub GraphQL issue fetch** - build-time cursor pagination over every
   open issue (no cap, past 100), owner/repo from `GITHUB_REPOSITORY`, token
   from environment only, newest-first by opened date; local builds skip the
   fetch and render a placeholder.
3. **Issue list rendering + empty state** - number, title linked to GitHub,
   label chips, plain text author (no avatars), opened date; clear "no open
   issues" message; untrusted text rendered as text.
4. **Token and portability verification** - built bundle contains no token and
   no hardcoded owner/repo/URL; builds correctly for a different repo supplied
   only via environment.
5. **Deploy workflow + GitHub Pages** - `workflow_dispatch` + push-to-default
   branch triggers, official Pages actions, minimal permissions; README covers
   the Pages source setting and accepted first-run failure.
6. **Refresh-on-reload behavior** - default Angular build only (no service
   workers, no custom cache headers); verify a normal reload shows the
   redeployed list.
7. **Responsive, clean UI** - readable single-column layout, label chips,
   working on a small viewport.
8. **README** - how the app works (snapshot semantics), how to deploy, how to
   refresh data.
9. **Automated tests** - fetch/pagination (mocked GraphQL), issue rendering,
   empty state, in a repeatable command.

Requirement mapping (1–12 + extras → features) lives in `build-plan.md`.
Resolved decisions (local placeholder, default caching, newest-first order,
plain-text authors, no issue cap) are recorded there too.

## Data model

No database or server. One build-time artifact bundled into the static site:

### IssueSnapshot

- `generatedAt` (ISO-8601 string) - when the fetch ran; defines "as of last
  deploy"
- `repo` (`{ owner: string, name: string }`) - from `GITHUB_REPOSITORY`, never
  hardcoded
- `issues` (Issue[]) - all open issues, sorted newest first by `createdAt`

### Issue

- `number` (number) - issue number
- `title` (string) - plain text; also used to build the GitHub link
- `url` (string) - canonical GitHub issue URL (constructed from owner/name +
  number)
- `labels` (Label[]) - related to the parent snapshot
- `author` (string) - plain text login; no avatar URL fetched or rendered
- `createdAt` (ISO-8601 string) - opened date; the sort key

### Label

- `name` (string) - plain text
- `color` (string, optional) - chip color if available; display-only

> Feature 3 depends on these exact field names; fetch (2) and render (3) share
> this shape. Local dev replaces `issues` with an empty/placeholder payload -
> it never fetches.

## Tech stack

- **Angular (current stable)** - the whole app; static output, no SSR.
- **GitHub GraphQL API (v4)** - single build-time query per deploy.
- **`GITHUB_TOKEN` (auto-provided)** - the only credential; never in the bundle.
- **GitHub Actions + GitHub Pages** - build, fetch, deploy.
- **Angular's default test runner** - unit tests (runner confirmed at `/tests`).

## Monetization

Not in v1 - technical exercise, no revenue plan.

## UI/UX

- `/` - single page: repository heading, then the issue list (number, title
  link, label chips, plain text author, opened date; newest first). Empty
  state: clear "No open issues." message. Clean, uncluttered, phone-friendly.

## Deployment

- **Host:** GitHub Pages, Source: GitHub Actions (evaluator enables it;
  README documents it).
- **Triggers:** push to default branch + `workflow_dispatch` ("Run workflow").
- **Build:** Angular production build in-workflow; issue fetch happens during
  the build.
- **Permissions:** minimal explicit set (`contents: read`, `issues: read`,
  `pages: write`, `id-token: write`).
- **Env vars:** `GITHUB_TOKEN` (automatic), `GITHUB_REPOSITORY` (context). No
  repository secrets, no PATs.
- **Output:** static files via official Pages deploy actions. No database,
  workers, cron, or health checks.
- **Accepted caveat:** the first push-triggered run may fail before Pages is
  enabled; the manual run afterwards must succeed.

## Open questions

None - all prior open questions are resolved and recorded in
`build-plan.md` § "Decisions".
