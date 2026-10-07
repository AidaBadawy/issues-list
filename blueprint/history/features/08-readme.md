# Feature: README

**From build-plan:** feature 8
**Build attempt:** 1
**Status:** verified
**Branch:** `feature/readme`

## Goal

Replace the Angular CLI starter README with an accurate, concise guide to the
static issues-list application: its build-time GitHub GraphQL snapshot, local
placeholder behavior, local commands, GitHub Pages deployment, and data refresh
flow.

## In scope

1. **Application and snapshot guide** - Explain that the Angular site renders a
   build-time snapshot of every open issue, newest first, and that the snapshot
   is refreshed only during the GitHub Actions build. Explain that local builds
   intentionally skip the fetch and keep the committed placeholder, so no token
   is needed or stored locally.
2. **Local development and verification commands** - Document `npm install`,
   `npm start`, `npm run build`, `npm test`, `npm run lint`,
   `npm run verify:bundle`, and the fixture-based `npm run test:browser`.
   State that the browser command is local and not part of CI.
3. **Deployment and refresh guide** - Document GitHub Pages setup (Settings ->
   Pages -> Source: GitHub Actions), the workflow's automatic `GITHUB_TOKEN`,
   and the accepted first-run Pages caveat. State the established release flow:
   work integrates through `development`, then a merge or push to `main`
   triggers deployment. Explain manual `workflow_dispatch` as the way to
   refresh the list after issue changes without a code change.

## Out of scope

- Changing the GitHub Actions workflow, deployment branch, app behavior, or
  package scripts.
- Publishing, pushing, enabling Pages, running the remote workflow, or
  documenting repository-specific credentials or URLs.
- Adding generated screenshots, badges, contribution policy, or Angular CLI
  scaffolding instructions that are not relevant to this app.

## Build loop

Continuous Mode implements this spec without step-review pauses. Checkpoint
commits are disabled; the feature gets one local feature commit and one local
development-branch squash commit after verification.

## Build steps

- [x] **Step 1 - Write the app and local workflow guide** - Replace the starter
  README with app-specific overview, snapshot semantics, local placeholder
  behavior, and the exact supported commands. *Done when:* the README names
  every documented package command accurately and contains no stale Angular CLI
  scaffold instructions.
- [x] **Step 2 - Document deployment and refresh** - Add the Pages setup,
  main-branch release trigger, first-run caveat, automatic-token policy, and
  manual refresh path. *Done when:* the README's deployment steps agree with
  `.github/workflows/deploy.yml` and do not ask readers to configure a PAT or
  repository secret.
- [x] **Step 3 - Verify documentation against the project** - Check the README
  against package scripts, workflow, and fetch behavior, then run the local
  lint, test, build, and bundle-audit commands. *Done when:* every documented
  command exists and all four checks pass.

## Files / areas

- `README.md` - complete application, development, deployment, and refresh
  guide.
- Not touched: `.github/workflows/deploy.yml`, `package.json`, app source,
  tests, and deployment configuration.

## Data / contracts

- The deployed page is a static snapshot generated at build time, not a
  runtime GitHub API client.
- `GITHUB_TOKEN` is supplied automatically in Actions; neither a personal
  access token nor a repository secret is needed.
- This repository's release policy is `development` integration followed by
  merge or push to `main`; the workflow's `main` push trigger deploys.
- Manual workflow runs refresh data after issue changes without code edits.

## Testing

- Documentation feature, no new logic tests.
- Verify the README claims against `package.json`,
  `.github/workflows/deploy.yml`, and `scripts/fetch-issues.mjs`.
- Run `npm run lint`, `CI=true npm test`, `npm run build`, and
  `npm run verify:bundle`; browser tests are not required because no UI
  behavior changes.

## Notes for the AI

- No em dashes in generated content.
- Keep instructions repository-neutral except for the intentional
  `development` to `main` release flow.
- Do not claim a remote deployment was performed.


<!-- blueprint:completion {"schemaVersion":2,"specBytes":4248,"specSha256":"7aab4adcdced1f1e7c377b40a283e1d89d406827349c8bc5f57ce2040bebf93b","branch":"refs/heads/feature/readme","head":"72af4d55a45fea58447565457e45e15455063dc3","baseRef":"refs/heads/development","baseCommit":"72af4d55a45fea58447565457e45e15455063dc3","sourceTree":"af52a0fe0fc574c331ee5cbbc7aaa6f32d050901","landing":"local-merge","absentOptional":[]} -->

