# Feature: Responsive, clean UI

**From build-plan:** feature 7
**Build attempt:** 1
**Status:** verified
**Branch:** `feature/responsive-clean-ui`

## Goal

Deliver build-plan feature 7 with the additions the user approved for this
build: polish the issue list for desktop and phone (readable single-column
layout, clear label chips, clear typography, working on a small viewport)
and add author avatars, client-side search/filter, inline SVG icons, dark
mode via `prefers-color-scheme`, and a local Playwright browser-test
harness. The feature ships as plain CSS plus Angular signals; the only new
dependency is the Playwright test runner (dev-only, local).

## In scope

1. **Plan + overview bookkeeping** - rewrite build-plan Decision 4 (avatars
   are now in scope, marked revised for feature 7), extend the feature 7
   checklist line to name the five additions, update the overview's Features,
   data-model, and UI/UX passages (including the new optional
   `authorAvatarUrl` field), and recompute the `blueprint:source-hash`
   marker with the established fingerprint (sha256 of project-plan bytes,
   `0x00`, build-plan bytes with `- [x]` normalized to `- [ ]`).
2. **Avatar data contract (additive)** - GraphQL query fetches
   `avatarUrl(size: 96)` inside the existing `author { login }` selection;
   `mapIssue` emits `authorAvatarUrl: node.author?.avatarUrl ?? null`; the
   `Issue` interface gains optional `authorAvatarUrl?: string | null`;
   `scripts/issues-lib.spec.mjs` gains assertions for the new field.
3. **Design tokens + dark mode + global type** - `src/styles.css` defines
   CSS custom properties on `:root` (background, surface, text, muted,
   link, border, chip background, row hover, focus ring) with a
   `@media (prefers-color-scheme: dark)` override block and
   `color-scheme: light dark`; system font stack, comfortable line-height,
   light background from first paint. `src/app/app.css` gets responsive
   page padding (smaller on phones, roomier on desktop) inside the
   existing single-column measure.
4. **List polish + icons + avatars + responsive layout** -
   `issue-list.html` groups number, title, and chips into one `.issue-main`
   row (they never split); `.issue-meta` carries author, opened date, and a
   20x20 circular avatar (`alt=""`, `loading="lazy"`, rendered only when
   `authorAvatarUrl` is present, text-only when absent or author is null).
   Desktop: meta right-aligned on the same row, hairline-separated rows
   with the list closed top and bottom. At `max-width: 40rem` meta drops
   beneath the title row, padding shrinks, long titles wrap
   (`overflow-wrap: anywhere`), chips wrap. Pill chips with the API label
   color on the border only; tabular numerals for issue numbers;
   muted-but-accessible secondary text; visible `:focus-visible` ring;
   row hover only under `@media (hover: hover)`, no animation. Inline SVG
   icons (external-link after issue titles, magnifier in the search field)
   using `currentColor` with `aria-hidden="true"`.
5. **Search / filter** - `issue-list.ts` gains `query = signal('')` and a
   computed filtered list over a pure `filterIssues(issues, query)` helper
   in `src/app/issues/issue-query.ts` (case-insensitive match across
   title, number, label names, and author; empty query returns all). A
   labeled input (`aria-label` + placeholder "Search issues", `(input)`
   handler narrowing `Event` to `HTMLInputElement`, no `$any`) renders only
   in the active-list branch. When a query is active and matches nothing,
   show "No issues match your search."; the existing "No open issues." and
   placeholder messages stay unreachable by search logic. Query is
   in-memory only (no persistence, no network).
6. **Fixture configuration + browser harness** - new
   `src/app/issues/issues.fixture.ts` (sample issues with labels and
   avatar URLs, `example.invalid` issue URLs, neutral owner names so the
   audit stays clean) wired through an explicit `fixture` build
   configuration (`fileReplacements`) plus matching serve configuration in
   `angular.json`. Playwright harness per the `/tests browser` skill:
   `@playwright/test` dev dependency + local Chromium (both require user
   approval at install time), `playwright.config.ts` with
   `webServer: npm start -- --configuration=fixture` on port 4200, one
   smoke test in `e2e/smoke.spec.ts` covering: fixture list renders rows,
   search input filters row count, `colorScheme: 'dark'` emulation changes
   the computed background, and a 360px viewport has no horizontal
   overflow; `test:browser` script in `package.json`; `Browser tests:
   npm run test:browser` bullet in `AGENTS.md` Commands; test artifacts
   gitignored.
7. **Full gate pass** - one clean pass of the complete local gate set plus
   browser tests and the user's eyeball review on the fixture server.

## Out of scope

- Scheduled/cron refresh of the data (user declined for this build).
- Closed-issue views, pagination, result caps (plan: every open issue, one
  page, newest first).
- Downloadable custom fonts or icon fonts (system fonts; icons are inline
  SVG), CSS frameworks, Sass, CSS-in-JS.
- Adding browser tests to the deploy workflow, `verify`, or any CI (the
  `/tests browser` skill forbids the slower gate without a separate
  request).
- Sorting or multi-field filter UI beyond the single search box.
- Any fetch behavior change beyond the additive `avatarUrl` field; the
  workflow, token handling, and gating stay untouched.

## Build loop

Build one small step at a time. `workflow.stepReview` is `feature`: one
review packet after all steps. `workflow.checkpointCommits` is `disabled`:
no checkpoint commits; `/complete` makes the final feature commit. Never
accept a review packet you have not read. The plan/overview edits in step 1
are part of this feature and land with its commit.

## Build steps

- [x] **Step 1 - Plan + overview updates** - Rewrite build-plan Decision 4
  (revised for feature 7: avatars render when `authorAvatarUrl` is
  present, null authors stay text-only), extend the feature 7 checklist
  line to name avatars, search/filter, inline SVG icons, dark mode, and the
  browser-test harness; update overview Features (around line 48), data
  model (author line gains `authorAvatarUrl`), and UI/UX (around line 116);
  recompute and rewrite the source-hash marker. *Done when:* an independent
  recompute of the fingerprint equals the marker byte-for-byte, and a grep
  of overview/build-plan shows no stale "no avatars" claim outside the
  historical feature 3 checklist line.
- [x] **Step 2 - Avatar data contract** - Add `avatarUrl(size: 96)` to the
  query, emit `authorAvatarUrl` in `mapIssue`, add the optional interface
  field, extend `makeNode` and assertions in `issues-lib.spec.mjs`
  (present avatar, null author). *Done when:* `npm test` is green (scripts
  + app suites) and `npm run build` compiles without touching any
  consumer beyond the type.
- [x] **Step 3 - Design tokens + dark mode + global type** - Token
  definitions with light/dark sets and `color-scheme: light dark` in
  `styles.css`; system font stack; responsive shell padding in `app.css`.
  *Done when:* `npm run lint`, `npm test`, and `npm run build` pass, and
  both color schemes are defined (grep shows `:root` and
  `prefers-color-scheme` blocks).
- [x] **Step 4 - List structure, polish, icons, avatars** - Implement the
  `.issue-main` grouping, desktop/phone layouts, chips, focus/hover rules,
  external-link icon, and avatar rendering; existing bindings and message
  strings unchanged, untrusted text still bound as text. *Done when:*
  `npm run lint`, `npm test`, and `npm run build` pass, and a read-through
  confirms: stacked meta at `<= 40rem`, wrapping title/chips, avatar only
  behind an `@if (issue.authorAvatarUrl)`, no inline styles beyond the
  existing label color binding, no CSS comments.
- [x] **Step 5 - Search / filter** - Add `issue-query.ts` with
  `filterIssues` plus its spec (title/number/label/author match,
  case-insensitivity, empty query returns all, no-match returns empty),
  wire the signal state and input into the component, distinct no-match
  message. *Done when:* `npm test` green including the new filter tests,
  `npm run lint` and `npm run build` pass, and the template shows no
  `$any` usage and renders the input only in the active-list branch.
- [x] **Step 6 - Fixture configuration + browser harness** - Create
  `issues.fixture.ts`, add the `fixture` build/serve configurations, install
  `@playwright/test` + Chromium (request user approval first), add
  `playwright.config.ts`, `e2e/smoke.spec.ts`, `test:browser` script, the
  `AGENTS.md` Browser tests bullet, and gitignore entries. *Done when:*
  `npm run test:browser` exits 0 with the smoke test green, plain
  `npm start` still renders the placeholder (decision 1 intact), and
  `npm run verify:bundle` stays clean with the fixture present but excluded
  from default builds.
- [x] **Step 7 - Full gate pass + evidence** - Run the complete gate set
  in one pass and hand the eyeball checklist to the user. *Done when:*
  `npm run lint`, `CI=true npm test`, `npm run build`,
  `npm run verify:bundle`, and `npm run test:browser` all exit 0 in one
  sequence, and the user reports the fixture walk-through (desktop +
  ~360px, light + dark, search on/off) in the review packet.

## Files / areas

- `blueprint/build-plan.md` - Decision 4 rewrite, feature 7 line
- `blueprint/context/project-overview.md` - Features/data-model/UI-UX
  passages + source-hash marker
- `scripts/issues-lib.mjs` - query `avatarUrl(size: 96)`, mapper field
- `scripts/issues-lib.spec.mjs` - mapper assertions
- `src/app/issues/issue-snapshot.ts` - optional `authorAvatarUrl`
- `src/styles.css` - tokens, dark mode, global typography
- `src/app/app.css` - responsive shell padding
- `src/app/issues/issue-list/issue-list.{ts,html,css}` - structure,
  polish, icons, avatar, search state and input
- `src/app/issues/issue-query.ts` + `issue-query.spec.ts` - filter logic
- `src/app/issues/issues.fixture.ts` - fixture snapshot (fixture config
  only)
- `angular.json` - `fixture` build + serve configurations
- `playwright.config.ts`, `e2e/smoke.spec.ts` - browser harness
- `package.json` - `test:browser` script, `@playwright/test` devDep
- `.gitignore` - Playwright artifacts
- `AGENTS.md` - `Browser tests: npm run test:browser`
- Not touched: `.github/workflows/`, `scripts/fetch-issues.mjs`,
  `scripts/verify-bundle.mjs`, `issue-view-state.ts`, shipped skill files

## Data / contracts

- `Issue` gains only an optional field: `authorAvatarUrl?: string | null`.
  `author: string | null`, labels, number, title, url, createdAt are
  unchanged. Existing fixtures and archives stay valid.
- Mapper rule: `authorAvatarUrl` mirrors author presence (null when the
  author is null); never invents URLs. Fetch remains build-time only,
  `GITHUB_TOKEN` gating and `null` vs `[]` snapshot semantics untouched.
- Rendering contract from feature 3 preserved: same elements and
  bindings, strings "No open issues.", placeholder text, `#N`, author
  fallback "deleted user", `DatePipe` format, heading "Open issues".
  New string added: "No issues match your search." (search-active only).
- Avatar trust rule: `avatarUrl` comes from the GitHub API and is bound
  via property binding (`[src]`), fixed 20x20 with `alt=""`; it is
  decorative because the author name is rendered as text. No token, no
  user-controlled URL construction, no PII beyond the public login already
  rendered. Avatar images load at view time from
  `avatars.githubusercontent.com` (public, unauthenticated).
- Decision 4 (revised): avatars render when available; text-only fallback
  otherwise. Decision 1 holds: plain `npm start` never loads fixture data.
- Search is client-side over the in-memory snapshot only; the query is
  never persisted or sent anywhere.
- Accessibility: text contrast at or above WCAG AA, visible keyboard
  focus, list semantics (`ul`/`li`) preserved, search input labeled, icons
  `aria-hidden`, viewport meta already present.
- Budgets: `anyComponentStyle` error cap 8kB (component CSS is under 1kB
  today); initial bundle unaffected (fixture excluded from default builds;
  Playwright is dev-only).

## Testing

- Runner: `npm test` (`ng test` + `vitest run scripts`), declared in
  `AGENTS.md`; it is a hard gate for every step.
- Logic in scope ships tests in the same step: mapper `authorAvatarUrl`
  assertions (step 2) and `filterIssues` unit tests (step 5: case-insensitive
  title/number/label/author match, empty or whitespace-only query (trimmed)
  returns all, no-match returns empty).
- Component rendering and browser flows are exempt from unit tests (scope
  rule) and get browser + eyeball evidence instead.
- Browser tests: `npm run test:browser` (declared in `AGENTS.md` from step
  6) - one Playwright smoke test against the fixture server proving list
  render, search filtering, dark-scheme background change, and 360px
  no-overflow. Not part of `verify` or CI.
- UI evidence: user eyeball at `npm start -- --configuration=fixture`:
  desktop + ~360px phone emulation, light + dark, search off/on, avatars
  present, recorded in the review packet.

## Notes for the AI

- No em dashes (U+2014) anywhere in generated content, including specs,
  comments, and commit messages.
- No comments in CSS; class names and this spec carry the intent. Minimal
  TS comments (why only).
- Signals for component state (no RxJS for plain state), no `any`, no
  `$any` in templates; standalone components; built-in control flow only.
- Plain `npm start` must keep rendering the placeholder - fixture data is
  reachable only via `--configuration=fixture`.
- The deploy workflow, fetch script, and audit script stay untouched;
  `npm run verify:bundle` must remain clean throughout (fixture uses
  `example.invalid` URLs and neutral names on purpose).
- Playwright installs (`npm i -D @playwright/test`, `npx playwright
  install chromium`) require the user's approval through the normal
  approval flow before running.
- If a feature 3 assertion fails after restructuring, fix the markup, not
  the test; those assertions encode requirement contracts.
- Landing stays local-merge into `development`; never push `origin`
  without an explicit ask.
