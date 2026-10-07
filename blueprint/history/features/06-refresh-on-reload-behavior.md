# Feature: Refresh-on-reload behavior

**From build-plan:** feature 6
**Build attempt:** 1
**Status:** verified
**Branch:** `feature/refresh-on-reload-behavior`

## Goal

Verify optional extra E2 (build-plan feature 6): after a redeploy, a
normal page reload shows the new issue list with no hard refresh - while
shipping the default Angular build exactly as-is: no service workers, no
custom cache headers, no caching middleware added.

## In scope

- **Static verification (build output + repo):**
  - Confirm the built `dist/issues-list/browser/` contains no service
    worker artifacts (`ngsw.json`, `ngsw-worker.js`, `sw.js`) and that
    `angular.json`/`package.json` carry no `serviceWorker` configuration.
  - Confirm no caching machinery exists anywhere in the repo: no
    `headers`/`_headers`/`_redirects` files, no cache-control settings in
    the workflow, no caching middleware or HTTP config of any kind. The
    only headers involved are GitHub Pages' own defaults.
  - Document the actual response headers of the live e2e site
    (`https://aidabadawy.github.io/issues-list-e2e/`): `Cache-Control`,
    `ETag`, `Last-Modified` for `index.html` and for the current hashed
    JS bundle.
- **Live redeploy-freshness test (e2e site):**
  1. Capture pre-redeploy state: `index.html` `ETag`/`Last-Modified`,
     current `main-*.js` hash, `generatedAt`.
  2. Create a new issue (#4) and trigger `workflow_dispatch`; wait for
     the run to succeed.
  3. Fresh fetch of `index.html` (no caching): must reference a new
     `main-*.js` hash whose bundle contains issue #4.
  4. **Normal-reload simulation:** re-request `index.html` with the
     pre-redeploy validators (`If-None-Match` + `If-Modified-Since` and
     `Cache-Control: max-age=0`, as browsers do on reload); must return
     200 with the updated HTML, not 304 with stale content. A browser
     following that HTML then loads the new bundle - the definition of
     "no hard refresh needed".
  5. Record all hashes, validators, and status codes as Evidence.
- **Full gate pass** (lint, tests, build, audit) as with every feature.

## Out of scope

- Changing any code, config, or the workflow: this feature verifies the
  decision-2 status quo. If the live test shows stale content on a
  normal reload, that is a **blocking finding** (the build plan says so
  explicitly), not something to patch around in this feature.
- A scripted real-browser test: no browser harness is configured
  (`/tests browser` remains opt-in). The conditional-request test in
  step 4 exercises the exact HTTP semantics a browser reload performs;
  the manual eyeball check remains available at the live URL.
- Cache behavior of `origin` (we do not control GitHub Pages' CDN
  internals beyond what the live test observes).

## Build loop

Build one small step at a time. `workflow.stepReview` is `feature`: one
review packet after all steps. `workflow.checkpointCommits` is `disabled`:
no checkpoint commits; `/complete` makes the final feature commit. Never
accept a review packet you have not read.

## Build steps

- [x] **Step 1 - Static verification** - Grep the repo and built output
  for service workers, caching config, and custom headers; capture live
  response headers for HTML and the hashed bundle. *Done when:* every
  check comes back negative for caching machinery, and the header values
  are recorded.
- [x] **Step 2 - Live redeploy-freshness test** - Execute the five-point
  in-scope checklist against the e2e site, including the conditional
  reload simulation. *Done when:* the post-redeploy HTML shows a new
  bundle hash containing the new issue, and the conditional request
  returns 200 with updated content; all values recorded as Evidence.
- [x] **Step 3 - Full gate pass** - Run the complete local gate set once.
  *Done when:* `npm run lint`, `npm test`, `npm run build`, and
  `npm run verify:bundle` all exit 0 on the feature branch in one pass.

## Files / areas

- No file changes expected beyond this spec (verification feature).
- Evidence recorded here before `/complete`.

## Data / contracts

- Decision 2 (build plan): no service workers, no custom cache headers -
  the default Angular build and Pages defaults only. Any observed cache
  machinery means the decision was violated somewhere.
- `index.html` is the entry document; its `main-*.js` reference is
  content-hashed, so a fresh HTML always yields fresh assets. Freshness
  therefore reduces to: does a normal reload pick up updated HTML?
- Pages default headers observed pre-test: `cache-control: max-age=600`
  on HTML, plus `ETag`/`Last-Modified`. Hashed assets are immutable by
  name but share Pages' header policy.
- The e2e site (`AidaBadawy/issues-list-e2e`) is the test fixture; its
  workflow and deploy path are identical to what the evaluator runs.

## Testing

- Runner: `npm test` (gate declared in `AGENTS.md`).
- Logic in scope, shipped: none - verification only, no new code.
- Evidence for the review packet: header captures, hash/validator
  transitions, HTTP status codes from the conditional request, and the
  final gate results.

## Evidence

- **Static (Step 1):** no `ngsw*`/`sw.js`/webmanifest files in
  `dist/issues-list/browser/`; no `serviceWorker` key in `angular.json`
  (0 matches); no `cache-control`/`_headers`/`_redirects`/`max-age`
  config anywhere in tracked files outside this spec; the workflow's only
  `cache` reference is `setup-node`'s npm download cache (build speed,
  not site delivery).
- **Live headers (pre-test):** `index.html` - `cache-control:
  max-age=600`, `etag: "6ac644ae-1b8"`, `last-modified: Wed, 07 Oct 2026
  13:10:06 GMT`; hashed bundle `main-CHN3HFC6.js` - `application/javascript`,
  `cache-control: max-age=600`, `etag: "6ac644af-3575b"`. All are GitHub
  Pages defaults; none are ours.
- **Redeploy test (Step 2):** pre-state `main-CHN3HFC6.js`,
  `generatedAt 13:09:16Z`, validators above. Issue #4 created; manual run
  **37627853337** succeeded.
  - Fresh fetch: `index.html` now references **`main-SEVT26VT.js`**,
    whose bundle contains "Fourth issue for reload freshness test" and
    `generatedAt 13:22:00Z`.
  - Normal-reload simulation (conditional request with the OLD
    `If-None-Match: "6ac644ae-1b8"`, `If-Modified-Since: 13:10:06 GMT`,
    `Cache-Control: max-age=0`): returned **HTTP 200** with HTML pointing
    at the NEW hash (not 304/stale). New validators: `etag:
    "6ac64789-1b8"`, `last-modified: 13:22:17 GMT`.
  - Conclusion: a browser holding the pre-redeploy page and performing a
    normal reload receives the updated list with no hard refresh.
    Remaining nuance: Pages' own `max-age=600` can serve cached HTML for
    a *fresh navigation* (address-bar visit) for up to 10 minutes; the
    reload path required by E2 revalidates and is proven fresh above.
    This is Pages' default policy, unmodified by this project.

## Notes for the AI

- No em dashes in generated content.
- Do not add cache-busting query strings to test URLs; the point is to
  exercise exactly what a browser would request.
- Between steps, wait for the workflow run to report success before
  fetching; polling too early measures our patience, not GitHub Pages.
- If Step 2 observes stale HTML on the simulated reload (304 with old
  content or old hash served), stop, record it as a blocking finding in
  `blueprint/context/findings.md`, and do not mark the step done.


<!-- blueprint:completion {"schemaVersion":2,"specBytes":7408,"specSha256":"e2fa99b204a5e114b6c2da245bfa4160c3ed73aa45aa5b6d60af285ca1e82f52","branch":"refs/heads/feature/refresh-on-reload-behavior","head":"fc693e78e2af7a4a1283028fb80b512f3ff1c1c4","baseRef":"refs/heads/development","baseCommit":"fc693e78e2af7a4a1283028fb80b512f3ff1c1c4","sourceTree":"4a84d1ef3894874eef8eda5ef56421430a4357ed","landing":"local-merge","absentOptional":[]} -->
