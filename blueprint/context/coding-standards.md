# Coding Standards

> Conventions for this project. Keep this file matched to the real stack:
> Angular + TypeScript + plain CSS, static build, GitHub Actions deploy.
> If the stack changes, retune this file in the same change.

## TypeScript

- Strict mode enabled (tsconfig strict flags stay on)
- No `any` types - use proper typing or `unknown`
- Define interfaces/types for API responses and data models
- Use type inference where obvious, explicit types where helpful

## Angular

- Standalone components only (no `NgModules`); the CLI default since v19
- One component per file, one job per component; small presentational
  components, logic in services or plain functions
- Signals for component state and inputs; avoid manual
  `ChangeDetectorRef` and RxJS subscriptions for plain state
- Use the built-in control flow (`@if`, `@for`, `@defer`) in templates, not
  `*ngIf`/`*ngFor`
- `OnPush` change detection where a component does not need default
- Do not fetch data in templates; component logic owns data acquisition
- Keep the app fully static: no server-side rendering, no server APIs, no
  runtime credentials

## File Organization

- Components: `src/app/<feature>/<name>.{ts,html,css,spec.ts}` (Angular CLI
  naming, no `.component` suffix)
- Services and pure logic: `src/app/<feature>/<name>.service.ts` or
  `src/app/<feature>/<name>.ts`
- Build-time scripts (issue fetch): `scripts/` at the repo root
- Global styles: `src/styles.css`; component styles live next to the component

## Naming

- Classes: PascalCase (`IssueList`, `App`)
- Files: kebab-case matching the primary class (`issue-list.ts`)
- Selectors: `app-` prefix, kebab-case (`app-issue-list`), enforced by lint
- Signals and members: camelCase; constants: SCREAMING_SNAKE_CASE
- Templates and styles: match the component file base name

## Styling

- Plain CSS only: component stylesheets plus `src/styles.css`; no CSS
  framework, no CSS-in-JS
- Mobile-first responsive rules; the list must work on a phone (project
  requirement)
- No inline styles in templates; use bindings or classes
- Do not hardcode colors that only work in one theme; prefer sensible
  defaults that read well in light and dark

## Data Fetching

- All GitHub GraphQL access happens once at build time in the deploy
  workflow, never in the browser at runtime
- The only credential is the workflow-provided `GITHUB_TOKEN`; never write
  it into source, config, committed files, or the built bundle
- Repo owner/name come from the workflow environment
  (`GITHUB_REPOSITORY`), never hardcoded
- Local builds with no token skip the fetch and render a placeholder; they
  must never prompt for or require a token
- Treat all issue content (titles, labels, author names) as untrusted text;
  bind it as text, never as HTML

## Error Handling

- A failed issue fetch must fail the build loudly with a clear message; never
  render a successful-looking empty list when the fetch failed
- The genuinely empty state ("no open issues") is distinct from a fetch
  failure
- Surface unexpected script errors to the workflow log; do not swallow them

## Testing

The blueprint installs no test runner; testing is opt-in at the project level,
because the overlay can't know your stack. Adding unit testing is an explicit
setup task the AI can do through the normal workflow, either as a build-plan
item or with `/tests`. The setup should choose the stack-native runner, wire
the scripts or commands, add a small example test, and update the Commands
section of `AGENTS.md`.

This project's runner is Vitest through `ng test`, with spec files next to
their sources (`*.spec.ts`).

When `AGENTS.md` declares a `Verify` command, treat it as the umbrella automated
gate. It combines only the checks this project actually has, in this order when
available: typecheck, tests, then build. The command does not enable an absent
test runner or replace focused evidence. It gives local work and optional CI one
exact command to run. `/ci` owns Verify and CI setup. `/tests` adds the real test
command to Verify when it already exists, but never creates CI only because
testing was configured.

**The opt-in switch is one signal: a `test` command in the Commands section of
`AGENTS.md`.** Declare one and **tests become a gate for logic-bearing steps**,
not an optional extra; leave it out and the loop verifies logic with the evidence
it already uses (run it, a screenshot, the build). Adding the runner is itself a
deliberate step, never a silent mid-step install. This is the single definition
of the switch; the skills and `ai-interaction.md` only point back here.

- **What to test (the scope rule):** pure logic where a wrong answer is possible -
  parsers, formatters, validators, id/slug builders, build-time fetch
  transformations. These have assertable inputs and outputs and real edge cases
  (empty, missing, malformed).
- **What not to test:** UI components and integration-level surfaces (render or
  export routes, anything driving a real browser or external service). Verify those
  with a screenshot and the build, not brittle unit tests.
- **The gate (when a runner is configured):** a build step that adds in-scope logic
  must ship a passing test in the same reviewable diff. The project's test command
  must be green before the step is approved, before any checkpoint commit, and
  before `/complete` merges. UI and integration-only steps are exempt and ride on
  screenshot plus build evidence.
- **When it's named:** the `/feature` spec's Testing section predicts the coverage,
  `/implement` writes the test with the step, and if a step surfaces logic the spec
  didn't foresee, add a focused test then.
- An empty suite should fail, not pass, so "no tests ran" never looks like "passed".
- Test files live next to source files (for example `issue-list.spec.ts`).
- Run them via the project's test command (see Commands in `AGENTS.md`), not a
  hardcoded tool name.

## Browser Verification

For UI and integration behavior, prefer real browser evidence over reading the
code and assuming it works.

- Browser automation is separately opt-in through `/tests browser`. That setup
  reuses a compatible runner or prefers Playwright for supported projects, then
  documents the exact command as `Browser tests` in `AGENTS.md`.
- When `Browser tests` is declared, add focused coverage for stable behavioral
  done-whens when it is proportionate, and run the documented command during
  `/check`. Do not assume it proves visual fidelity, real authenticated-profile
  behavior, browser chrome, or any claim the test does not observe.
- If no Browser tests command is declared, do not add a runner silently in the
  middle of an unrelated feature. Use the available dev server, browser
  screenshots, build output, API output, or manual evidence instead.
- Browser tests are not part of the default Verify command or CI unless the user
  separately chooses that slower gate.
- Browser evidence is especially important for flows that click, type, submit,
  navigate, download files, render complex layouts, or depend on client-side
  state.

## Code Quality

- No commented-out code unless specified
- No unused imports or variables
- Keep functions under 50 lines when possible
- `npm run lint` must pass on every change

## Comments

Write code that explains itself; comment only what the code cannot say.
Over-commenting is a common AI tell, so resist it.

- Comment the **why**, not the **what**. Delete any comment that restates the code.
- No banner/header blocks, section dividers, or step-by-step narration of obvious
  code. A file does not need a comment announcing each region.
- A comment earns its place only when it captures something the code can't: a
  non-obvious decision, a gotcha or workaround, why a value is what it is, or a
  link to a spec or issue.
- Prefer self-documenting names and small functions over explanatory comments.
- Keep doc comments minimal: a one-line purpose on an exported type or function is
  plenty; don't write JSDoc that just repeats the signature.
- When in doubt, leave the comment out.

## Writing

- No em dashes (U+2014) in generated content: docs, comments, commit messages,
  READMEs, specs. They read as AI-generated.
- Use a hyphen for `term - description` separators; rephrase prose with commas,
  parentheses, or a colon. Avoid en dashes and the ellipsis character too.
