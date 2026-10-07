# Feature: Deploy workflow + GitHub Pages

**From build-plan:** feature 5
**Build attempt:** 1
**Status:** verified
**Branch:** `feature/deploy-workflow-github-pages`

## Goal

Satisfy requirements 5, 10, and 11 (build-plan feature 5): a GitHub Actions
workflow that builds and deploys the site to GitHub Pages, triggering on
every push to the default branch and manually from "Run workflow", using
only the automatic `GITHUB_TOKEN` with minimal explicit permissions and the
official Pages actions - plus the README deploy instructions the evaluator
needs (Settings -> Pages -> Source: GitHub Actions, and the accepted
first-run failure).

## In scope

- `.github/workflows/deploy.yml` - one workflow, two jobs (official Pages
  starter shape):
  - **Triggers:** `push` to `main` and `workflow_dispatch`.
    (Recorded decision: the default-branch name must be a literal in
    GitHub Actions; `main` is the default branch GitHub assigns to the
    evaluator's new public repository and matches this project's landing
    plan to `main`.)
  - **Permissions (workflow level, explicit minimal set):** `contents: read`,
    `issues: read`, `pages: write`, `id-token: write`. Declaring any
    permissions block resets everything unspecified to `none`, so
    `issues: read` must be explicit for the GraphQL fetch.
  - **`build` job:** checkout -> `setup-node` (Node 22, npm cache) ->
    `npm ci` -> `npm run lint` -> `npm test` -> `configure-pages` (id
    `pages`) -> `npm run build -- --base-href "${{ steps.pages.outputs.base_path }}/"` ->
    `npm run verify:bundle` (feature 4's handoff: the real token exists in
    this environment, so this is where the token-leak audit proves itself)
    -> `upload-pages-artifact` with `path: dist/issues-list/browser`.
    The dynamic base href is required: project Pages sites are served under
    `/<repository-name>/`, and the repository name must come from the
    workflow context (`configure-pages` output), never from code (requirement
    7). The `prebuild` fetch runs during `npm run build` as before:
    `GITHUB_ACTIONS=true`, `GITHUB_TOKEN`, and `GITHUB_REPOSITORY` are all
    provided automatically.
  - **`deploy` job:** `needs: build`, official `deploy-pages` action,
    `environment: github-pages` with the deployment URL output, and
    workflow-level `concurrency: { group: pages, cancel-in-progress: false }`.
  - Action majors pinned to stable releases: `checkout@v4`,
    `setup-node@v4`, `configure-pages@v5`, `upload-pages-artifact@v3`,
    `deploy-pages@v4`.
  - No secrets, no PATs, no `pull_request` trigger, no extra jobs.
- **README:** add a "Deploying" section (keeping the Angular scaffold
  sections for feature 8 to rewrite) covering: fork/push to your own public
  repo; Settings -> Pages -> Source: GitHub Actions; push or "Run workflow"
  to build and deploy; the list refreshes by running the workflow again
  with no code changes; and the explicitly accepted caveat that the very
  first push-triggered run fails until Pages is enabled (per TEST.md).
- **Verification (local):** PyYAML syntax parse of the workflow file;
  every command the workflow runs is one already proven by
  this project's local gates; a step-by-step contract review against the
  in-scope list above.
- **Verification (end-to-end, disposable repo):** prove the whole chain
  against GitHub for real, on the empty public repository
  `AidaBadawy/issues-list-e2e` (remote name `e2e`), mirroring TEST.md steps
  9-12:
  1. Push the feature-branch content as `main` (becomes the default branch
     of the empty repo) - proves the push trigger fires.
  2. Create two test issues, one with a label - real data to display.
  3. Enable Pages: Settings -> Pages -> Source: GitHub Actions (via API).
  4. Watch the workflow run(s) with `gh run watch` - proves the fetch
     writes real issues with the automatic `GITHUB_TOKEN` (carried GraphQL
     permission risk), `verify:bundle` passes with the real token present,
     and the Pages deploy succeeds (re-running the failed first run or
     `workflow_dispatch` after enabling Pages covers the accepted
     first-run caveat).
  5. Fetch the deployed site - issues render, base href `/<repo>/` is
     correct, page HTML contains no token.
  6. Refresh check (requirement 12): create another issue, run the
     workflow manually, confirm the new issue appears with no code
     changes.
  Evidence recorded in the spec's Evidence section before `/complete`.

## Out of scope

- Actually pushing to `origin` (`AidaBadawy/issues-list`) - the real
  project repository is untouched by this feature; the disposable `e2e`
  repository is the only push target. Deleting the disposable repository
  afterwards is the user's call.
- The full README rewrite (feature 8), reload-freshness verification
  (feature 6), and CI additions beyond this deploy workflow (none exist
  yet; `/ci` remains available if desired later).
- Changing app code, the fetch script, or `verify:bundle` - except the
  import guard added to `verify-bundle.mjs` when the E2E run exposed that
  its top-level `main()` executed during `vitest` import (fatal on a
  fresh runner with no `dist/`; locally masked). Recorded in Evidence.

## Build loop

Build one small step at a time. `workflow.stepReview` is `feature`: one review
packet after all steps. `workflow.checkpointCommits` is `disabled`: no
checkpoint commits; `/complete` makes the final feature commit. Never accept a
review packet you have not read.

## Build steps

- [x] **Step 1 - Workflow file** - Write `.github/workflows/deploy.yml`
  exactly to the contract above. *Done when:* `python3` PyYAML parses the
  file without error, and a contract checklist (triggers, permissions, job
  order, artifact path, no secrets) is confirmed against the In scope list.
- [x] **Step 2 - README deploy section** - Add the "Deploying" section with
  the Pages source step, refresh-via-Rerun instructions, and the accepted
  first-run failure note. *Done when:* the section exists and every command
  or menu path it names matches TEST.md steps 9-12 wording.
- [x] **Step 4 - Disposable-repo end-to-end** - Execute the six-point
  E2E checklist in In scope against `AidaBadawy/issues-list-e2e` using the
  `e2e` remote and `gh`. *Done when:* the workflow run is green (fetch
  wrote issues, audit clean, deploy succeeded), the deployed page shows
  the test issues with correct base href and no token in HTML, and a
  manual rerun after a new issue makes it appear on the site; every
  result recorded as Evidence.
- [x] **Step 5 - Full gate pass + command rehearsal** - Run the complete
  local gate set, confirming each is exactly what the workflow will run,
  including a `npm run build -- --base-href /rehearsal-repo/` build to
  prove the dynamic base-href flag works with `prebuild`. *Done when:*
  `npm run lint`, `npm test`, `npm run build`,
  `npm run build -- --base-href /rehearsal-repo/`, and
  `npm run verify:bundle` all exit 0 on the feature branch in one pass.

## Files / areas

- `.github/workflows/deploy.yml` - new (new `.github/` directory)
- `README.md` - add one section, keep existing scaffold content
- No `src/` or `scripts/` changes expected

## Data / contracts

- Artifact path contract: `dist/issues-list/browser` (confirmed in feature
  4's audit: 4 files scanned there) - the workflow's `upload-pages-artifact`
  must point at exactly this directory or Pages deploys nothing.
- Env contract (from feature 2): fetch reads only `GITHUB_TOKEN` and
  `GITHUB_REPOSITORY`; Actions supplies `GITHUB_ACTIONS=true`, which is the
  gate that turns the fetch on. No workflow-level `env:` entries are needed
  for these.
- Permission contract (from `build-plan.md` Risks): the auto token reading
  issues via GraphQL with `issues: read` declared is confirmed by this
  feature's first real run; if GraphQL ever refuses, that is a blocking
  finding for the user's TEST.md pass, recorded here as the known risk
  carried from the plan.
- Cache contract: decision 2 - no service workers or custom cache headers;
  the workflow adds no caching configuration beyond npm's `setup-node`
  cache, which affects build speed only, not Pages delivery.
- Base-href contract: `configure-pages` output `base_path` (for example
  `/my-repo`) is passed to the build as `--base-href <base_path>/`; local
  builds keep the default `/`, so no source file embeds a repository
  name.

## Testing

- Runner: `npm test` (gate declared in `AGENTS.md`).
- Verification is PyYAML syntax parse + contract review + rehearsing the
  workflow's commands locally (the existing gate set), then the
  disposable-repo E2E in Step 4. No new test runner or YAML linter is
  added to the project.
- E2E prerequisite (user-side): `gh` authenticated (`gh auth login` or
  `GH_TOKEN`) with `repo` + `workflow` scopes; git push access to the
  `e2e` remote.
- Evidence for the review packet: workflow parse output, README section
  text, the final gate results, and the E2E run/site/refresh results.

## Evidence

E2E on `AidaBadawy/issues-list-e2e` (remote `e2e`, default branch `main`,
site `https://aidabadawy.github.io/issues-list-e2e/`), all results from
real GitHub runs:

- **Run 37624886496** (push trigger, `ce5f0d3`) - FAILED at Test:
  `verify-bundle.mjs` ran `main()` at import time, so vitest executed a
  full audit on a fresh runner without `dist/` and hit `process.exit(1)`.
  Locally masked because `dist/` always exists. Fixed with a
  direct-execution guard; re-verified for all three cases (no dist ->
  tests green; CLI without dist -> exit 1; CLI with dist -> exit 0).
- **Run 37625130895** (push trigger, `cb6b35e`) - FAILED at Build:
  `GITHUB_TOKEN is missing` - Actions does not inject the token as an env
  var automatically; it lives in the `${{ github.token }}` context. Fixed
  by adding `env: GITHUB_TOKEN: ${{ github.token }}` to the Build step
  (still the automatic token; no secrets or PATs).
- **Run 37625393060** (push trigger, `07d305e`) - SUCCESS, zero failed
  steps. Lint, test (17 tests), Configure Pages, Build, Audit bundle, and
  Deploy all green. Log proof: `[fetch-issues] Wrote 2 open issue(s) for
  AidaBadawy/issues-list-e2e` (automatic token, GraphQL `issues: read`
  confirmed - the plan's carried risk resolved) and `[verify-bundle]
  clean: 4 dist file(s) and 13 source file(s)` with the real token
  present in the environment.
- **Deployed site checks:** `<base href="/issues-list-e2e/"` (dynamic base
  href works); bundle contains issue titles, `bug` label, author
  `AidaBadawy`, `createdAt` dates, and issue URLs pointing at
  `AidaBadawy/issues-list-e2e` (portable - nothing from `origin`); zero
  matches for `ghp_`, `github_pat_`, or `GITHUB_TOKEN` in HTML and JS.
- **Refresh (requirement 12):** issue #3 created, then `workflow_dispatch`
  run **37625763445** succeeded; redeployed bundle (new hash
  `main-TFV3XJAB.js`, `generatedAt 13:05:35Z`) contains all three issues -
  list updated with zero code changes.
- Local gates after the fixes: lint 0, 17 tests 0, build 0, audit clean,
  base-href rehearsal (`/rehearsal-repo/`) verified in HTML.

## Notes for the AI

- No em dashes in generated content.
- Workflow YAML must be strict about indentation; prefer the official
  GitHub Pages starter layout over inventing a structure.
- README stays accurate to this codebase: commands are `npm` scripts
  (`npm run build` triggers the fetch), and "Run workflow" is the refresh
  mechanism.
- Do not add `workflow_run`, schedules, or branch filters beyond `main`;
  requirement 5 names exactly two triggers.
- If a gate fails while preparing this feature, stop and report rather
  than weakening the workflow.


<!-- blueprint:completion {"schemaVersion":2,"specBytes":11676,"specSha256":"07e121e06817206ab578952b565e24d350031e1780ee039590edf0910ebf5618","branch":"refs/heads/feature/deploy-workflow-github-pages","head":"07d305e1b33052c718f57260299031fc16f7e021","baseRef":"refs/heads/development","baseCommit":"ed6bec90d3ebc50b4cb65d0c06825d29d7c01d09","sourceTree":"ea85e995ff55c8e701760f1f416ad54359a6b1d7","landing":"local-merge","absentOptional":[]} -->
