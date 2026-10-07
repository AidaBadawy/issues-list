# Feature: Token and portability verification

**From build-plan:** feature 4
**Build attempt:** 1
**Status:** verified
**Branch:** `feature/token-and-portability-verification`

## Goal

Prove requirements 6 and 7 at the code level (build-plan feature 4): the
built bundle contains no token and no hardcoded owner, repository, or URL
anywhere, and the same code builds correctly for a different owner/repository
supplied only via environment. This feature is verification plus one
repeatable audit command, not an app change.

## In scope

- `scripts/verify-bundle.mjs` - a `verify:bundle` npm command that scans:
  - **The browser bundle** (`dist/issues-list/browser/`) for token-shaped
    strings: `ghp_`, `gho_`, `ghs_`, `ghr_`, `github_pat_`, a literal
    `GITHUB_TOKEN` identifier, and `Bearer <value>` headers - plus any
    extra literals passed as `--forbid <string>` arguments.
  - **Shipped app source** (`src/**/*.{ts,html,css}`, excluding the generated
    `src/app/issues/issues.data.ts` and all `*.spec.*` files) for the same
    token patterns, `github.com` URL literals, and the same `--forbid`
    extras.
  - Exits 0 with a short clean report, or exits 1 listing each forbidden
    match (file + line), with a clear message when the dist directory is
    missing (build first). Accepts an optional `--dist <path>` override
    (default `dist/issues-list/browser`) so tests can point it at fixtures.
    Ignores `node_modules`, the Angular `.angular/` cache, and `dist` itself
    when scanning source.
- `scripts/verify-bundle.spec.mjs` - vitest coverage for the matcher: token
  shapes detected, benign text and issue-data fixtures not flagged,
  `--forbid` extras honored.
- **Evidence runs** (recorded in this spec's Notes section):
  1. Baseline `npm run build` then `npm run verify:bundle` with
     `--forbid aidarus --forbid issues-list` (the current owner and repo
     names must appear nowhere in shipped code or bundle content).
  2. Portability: `GITHUB_REPOSITORY=portable-owner/portable-demo` rebuild
     exits 0 and passes the same audit with no code edits; record whether the
     two builds' bundle outputs are byte-identical (expected: yes, because
     the fetch is skipped outside Actions, so no env value can leak).
- `package.json` gains the `verify:bundle` script so feature 5's workflow
  can run the same audit in real CI (handoff noted, wiring itself is
  feature 5).

## Out of scope

- The deploy workflow and the real CI token (feature 5) - this feature can
  only prove the negative with a locally built bundle; the real
  `GITHUB_TOKEN` never exists on this machine.
- Changing `fetch-issues.mjs`, the snapshot module, or any app component -
  verification only; if a scan finds a real leak, stop and report it as a
  blocking finding instead of patching around it.
- README documentation (feature 8).

## Build loop

Build one small step at a time. `workflow.stepReview` is `feature`: one review
packet after all steps. `workflow.checkpointCommits` is `disabled`: no
checkpoint commits; `/complete` makes the final feature commit. Never accept a
review packet you have not read.

## Build steps

- [x] **Step 1 - `verify:bundle` audit script + tests** - Implement
  `scripts/verify-bundle.mjs` with exported matcher helpers and its vitest
  spec; wire `verify:bundle` into `package.json`. *Done when:* `npm test`
  runs the new specs green alongside the existing suites, and
  `node scripts/verify-bundle.mjs` exits 1 against a fixture directory
  containing a planted token and exits 0 against the current clean dist
  (or reports exactly what it finds).
- [x] **Step 2 - Baseline audit evidence** - Run the full build, then
  `npm run verify:bundle -- --forbid aidarus --forbid issues-list` against
  the real `dist/issues-list/browser/` and shipped source. *Done when:* the
  audit exits 0, or any match found is investigated and confirmed as a real
  (blocking) finding.
- [x] **Step 3 - Portability rebuild evidence** - Rebuild with
  `GITHUB_REPOSITORY=portable-owner/portable-demo`, confirm exit 0, rerun
  the audit (same forbid literals), and compare bundle bytes with the
  baseline build. *Done when:* build and audit both exit 0 with zero code
  changes between the two builds, and the byte comparison result is
  recorded.
- [x] **Step 4 - Full gate pass** - Run the complete local gate set once.
  *Done when:* `npm run lint`, `npm test`, and `npm run build` all exit 0
  on the feature branch in one pass.

## Files / areas

- `scripts/verify-bundle.mjs` - new
- `scripts/verify-bundle.spec.mjs` - new
- `package.json` - add `verify:bundle` script (one line)
- Evidence recorded in this spec's Notes; no `src/` changes expected

## Data / contracts

- Verification targets, per requirement 6: no `GITHUB_TOKEN`/PAT value or
  `Bearer` credential ever present in `dist/issues-list/browser/`; the token
  exists only as `process.env.GITHUB_TOKEN` read inside `scripts/`
  (build-time Node), never imported by app code.
- Per requirement 7: no literal owner name, `owner/repository` pair, or
  `github.com/...` URL in shipped app source outside generated/test data.
  The generated `issues.data.ts` is excluded from source scans by rule: in
  real CI it legitimately contains the current repository's issue URLs.
- `issue.url` values inside the bundle come exclusively from the generated
  snapshot at build time; the local placeholder contributes none.
- Portability contract (from feature 2): owner/repository enters the build
  only through `GITHUB_REPOSITORY` in the fetch script, which exits before
  reading it outside Actions - hence env-only builds must be byte-stable.
- `--forbid` literals are evidence inputs at the command line, never
  committed into `package.json` or app code.

## Testing

- Runner: `npm test` (gate declared in `AGENTS.md`).
- Logic in scope, shipped in Step 1: the audit matcher (token shapes,
  source URL rule, `--forbid` extras, benign fixtures not flagged).
- Evidence in Steps 2-3 is command output (exit codes, reports, hash
  comparison) recorded in Notes for the review packet; no browser needed.

## Evidence

- Step 1: `npm test` green - 5 Angular + 12 script tests (7 new matcher
  specs); planted-token fixture scan exited 1 with `path:line` output.
- Step 2: baseline `npm run build` + `npm run verify:bundle -- --forbid
  aidarus --forbid issues-list` exited 0: "clean: 4 dist file(s) and 13
  source file(s) scanned."
- Step 3: `GITHUB_REPOSITORY=portable-owner/portable-demo npm run build`
  exited 0 (fetch skipped outside Actions as designed); same audit exited
  0; `shasum -a 256` comparison of all 4 browser output files before/after:
  byte-identical.

## Notes for the AI

- No em dashes in generated content.
- The audit script is plain Node `.mjs`, follows the existing `scripts/`
  style (named exports for testability, no dependencies), and must be
  covered by ESLint cleanly (it is inside `lintFilePatterns`).
- Prefer scanning file text line by line and reporting `path:line` so any
  hit is actionable.
- Do not weaken existing patterns to force a green run; a true positive is
  a blocking finding, not a scan bug.


<!-- blueprint:completion {"schemaVersion":2,"specBytes":7146,"specSha256":"affb0faefff9d91630090070225e72b0f051ccb3ab6d8767cac3ccbb236ee0d4","branch":"refs/heads/feature/token-and-portability-verification","head":"8766522ec648894413131dcec1fa9fa100c38704","baseRef":"refs/heads/development","baseCommit":"8766522ec648894413131dcec1fa9fa100c38704","sourceTree":"3c32991c58a6420bbb3c9903fb4e1a2fe58921ba","landing":"local-merge","absentOptional":[]} -->
