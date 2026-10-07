# Project Plan

## 1. Problem - What problem are we solving?

Build a static website that displays the open issues of whichever GitHub
repository deploys it. The list is fetched from the GitHub GraphQL API at
deploy time and baked into the site, so visitors see the issues exactly as
they were when the site was last deployed.

The project doubles as a portability/automation exercise: the same code must
deploy into any GitHub repository with no code edits, no personal tokens, and
no repository secrets — only the automatic `GITHUB_TOKEN` that GitHub Actions
hands every workflow run.

The full acceptance brief (requirements 1–12 plus optional extras) is
`TEST.md`; that file is the source of truth for what "done" means.

## 2. Users - Who is this for?

- The evaluator who will clone the repo, push it to their own account, enable
  GitHub Pages, run the workflow, and check the list (the exact procedure in
  `TEST.md` requirements 9–12).
- Any visitor who opens the deployed site, on desktop or phone, and wants to
  scan a repository's open issues without a GitHub login.

## 3. Features - What does the MVP need?

- Angular app using the current stable Angular version.
- Build-time fetch of every open issue from the GitHub GraphQL API (paginated
  past 100), including number, title (linked to GitHub), labels, author, and
  opened date.
- Clear "no open issues" empty state.
- Deploy workflow: GitHub Actions on push to the default branch and via the
  manual "Run workflow" button, deploying to GitHub Pages.
- Credential hygiene: only the ephemeral `GITHUB_TOKEN`, never in the built
  site, no secrets, no PATs.
- Repo portability: owner/name/URLs derived at runtime from the workflow
  environment, nothing account-specific hardcoded.
- README covering how the app works and how to deploy it.
- Optional extras: automated tests; fresh list on a normal reload after
  redeploy; clean responsive UI.

## 4. Data - What are we storing?

Nothing server-side. There is no database, backend, or user data.

- At build time the workflow queries open issues and stores the result as a
  static data file bundled into the built site (a build artifact, not storage).
- The deployed site is fully static HTML/CSS/JS plus that snapshot.
- No cookies, no analytics, no personal data.

## 5. Tech - What stack are we using?

- **Framework:** current stable Angular (plain Angular, no SSR required —
  static output is the point).
- **Data:** GitHub GraphQL API (v4), queried once per deploy with the
  workflow-provided `GITHUB_TOKEN`.
- **Build/deploy:** GitHub Actions workflow → GitHub Pages (Source: GitHub
  Actions). Static hosting only.
- **Testing:** a unit test runner wired into Angular's default tooling
  (Karma/Jasmine or the current Angular CLI default), plus whatever the `/tests`
  skill adds. Exact runner confirmed at implementation time.
- No database, no server runtime, no third-party services.

## 6. Monetize - How will this make money?

It doesn't. This is a technical exercise/evaluation deliverable with no
monetization plan.

## 7. UI/UX - How should this look and feel?

- A single page: heading (repository name), then a clean, readable list of
  open issues.
- Each row: issue number, title (hyperlinked to the issue on GitHub), label
  chips, plain text author name (no avatars), and opened date — sorted
  newest first by opened date.
- Empty state: an obvious message such as "No open issues."
- Clean, uncluttered styling that works on a phone (single column, readable
  tap targets) as well as desktop. No framework-heavy design system needed;
  simple CSS is fine.
- No login, no chrome beyond the list.

## 8. Deployment - Where and how will this ship?

- **Host:** GitHub Pages on whichever repository deploys the code, using
  "Settings → Pages → Source: GitHub Actions" (the evaluator turns this on;
  our README documents it).
- **Trigger:** GitHub Actions workflow that runs (a) on every push to the
  default branch and (b) on `workflow_dispatch` ("Run workflow" button) so the
  issue list refreshes without code changes.
- **Build:** Angular production build during the workflow; the issue fetch
  happens as part of the build using `GITHUB_TOKEN`.
- **Permissions:** workflow declares only what it needs (e.g. `contents: read`,
  `issues: read`, `pages: write`, `id-token: write` for the Pages deploy).
- **Env vars:** only `GITHUB_TOKEN` (auto-provided) and workflow-provided
  context like `GITHUB_REPOSITORY`. No repository secrets, no PATs.
- **Output:** static files deployed with the official Pages deploy actions.
- **Database/workers/cron/health checks:** none — static site.
- **First-run caveat (accepted by the brief):** the push-triggered run may
  fail before Pages is enabled; the manual run afterwards must succeed.

## 9. Usage model and constraints (optional)

- Internet-facing, read-only, public repository and public site.
- Tiny scale: one repo's open issues, a handful of visitors. No availability
  or compliance requirements.
- Trusted users; the only "untrusted input" is issue content (titles, label
  names, author names) rendered in the page — treat it as text, never as HTML.
- Single repository per deployment; multi-repo support is explicitly out of
  scope.
- Explicit non-goals: no filters/search, no closed issues, no comments, no
  auth, no write operations, no server, no analytics.
