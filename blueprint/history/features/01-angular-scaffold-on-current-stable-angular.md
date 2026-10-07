# Feature: Angular scaffold on current stable Angular

**From build-plan:** feature 1
**Build attempt:** 1
**Status:** verified
**Branch:** `feature/angular-scaffold-on-current-stable-angular`

## Goal

Leave the repository with a working, lint-clean, production-buildable Angular
app on the current stable Angular version (requirement 1), replacing the CLI's
default welcome page with a minimal issue-list placeholder shell that later
features build on.

The scaffold itself already exists and is committed (`init project`,
Angular 22.2.x, `npm run build` green as of specing). This feature finishes it:
app shell, a working `npm run lint` (declared in `AGENTS.md` but not yet
wired), and all gates green on the feature branch.

## In scope

- Replace the default CLI welcome template in `src/app/app.html` (and
  associated styles in `src/app/app.css`) with a minimal placeholder shell:
  page heading for the issue list plus placeholder body marking where the list
  will render. Single route `/`, keep the existing router setup.
- Update `src/app/app.spec.ts` so the existing Vitest suite matches and passes
  against the new shell.
- Wire lint: add the official `angular-eslint` schematics to the project and a
  `"lint": "ng lint"` script so the `npm run lint` command declared in
  `AGENTS.md` exists and passes clean.
- Confirm `npm run build` produces the production bundle on the feature branch.

## Out of scope

- Fetching issue data, rendering real issues, empty state (features 2 and 3).
- UI polish and responsive styling (feature 7).
- README rewrite (feature 8), deploy workflow (feature 5), test-suite
  expansion (feature 9).
- Any Angular version change beyond what the committed scaffold already uses
  (it is current stable: 22.2.x).
- AGENTS.md is in scope only for the user-directed Step 4 (Commands section
  retune); the rest of AGENTS.md stays untouched.

## Build loop

Build one small step at a time. `workflow.stepReview` is `feature`: one review
packet after all steps. `workflow.checkpointCommits` is `disabled`: no
checkpoint commits; `/complete` makes the final feature commit. Never accept a
review packet you have not read.

## Build steps

- [x] **Step 1 - Minimal issue-list app shell** - Replace the CLI welcome
  template and styles with a minimal placeholder shell (page `h1` naming the
  issue list, placeholder text for the list area), keep `/` as the only route,
  and update `app.spec.ts` expectations to match. *Done when:* `npm test`
  passes and `npm run build` succeeds, with `ng serve` rendering the
  placeholder heading instead of the CLI welcome page.
- [x] **Step 2 - Lint tooling wired** - Add `angular-eslint` via its official
  Angular schematic (ESLint config plus `ng lint` target in `angular.json`)
  and add the `"lint": "ng lint"` script to `package.json`, fixing any findings
  it reports in `src/`. *Done when:* `npm run lint` exits 0 with no errors.
- [x] **Step 3 - Full gate pass on the branch** - Run the complete local gate
  set once and record results. *Done when:* `npm run lint`, `npm test`, and
  `npm run build` all exit 0 on the feature branch in one pass.
- [x] **Step 4 - Blueprint docs retuned for Angular (user-directed)** - Rewrite
  `blueprint/context/coding-standards.md` from the shipped Next.js/React/
  Prisma/Tailwind/Clerk defaults to this project's Angular stack, and fix the
  `AGENTS.md` Commands section (real Angular commands, remove the shipped
  "For a standard Next.js project" sentence). *Done when:* no Next.js, React,
  Prisma, Tailwind, or Clerk references remain in project-owned docs
  (`AGENTS.md`, `blueprint/context/*.md`), and `npm run lint`, `npm test`,
  `npm run build` still exit 0 (docs-only diff).

## Files / areas

- `src/app/app.html`, `src/app/app.css`, `src/app/app.ts` - shell content
- `src/app/app.spec.ts` - updated expectations
- `src/app/app.routes.ts` - unchanged single empty route (verified, not
  modified)
- `package.json` - `lint` script
- `angular.json`, ESLint config files - added by the `angular-eslint`
  schematic
- `blueprint/context/coding-standards.md` - retuned to the Angular stack
  (Step 4)
- `AGENTS.md` - Commands section only (Step 4)

## Data / contracts

- None yet. No persistence, no external API, no auth. Feature 2 introduces the
  `IssueSnapshot`/`Issue`/`Label` shape documented in the project overview.

## Testing

- Runner: `npm test` (Angular CLI + Vitest, already configured). The test
  command is not yet declared in `AGENTS.md`'s Commands section, so tests are
  evidence here, not a configured gate; feature 9 formalizes coverage.
- No logic-bearing code in this feature, so no new logic tests are required by
  the scope rule. The existing `app.spec.ts` must be kept green with updated
  expectations (it asserts the old `Hello, issues-list` welcome text).
- Evidence per step: command exit codes; screenshot or dev-server observation
  of the placeholder shell for Step 1.

## Notes for the AI

- Angular is already at 22.2.x and committed; do not re-scaffold the app.
- No em dashes in generated content (specs, comments, README).
- Coding standards: `coding-standards.md` is retuned to Angular in Step 4
  (user-directed); follow its generic sections (TypeScript strictness, no
  `any`, no commented-out code, no unused imports, comment the why not the
  what).
- Keep the shell deliberately bare: real issue rendering belongs to feature 3
  and styling to feature 7. No design system, no new dependencies beyond what
  the `angular-eslint` schematic adds.
- `.prettierrc` already exists; the schematic must not fight it (it detects
  Prettier automatically).


<!-- blueprint:completion {"schemaVersion":2,"specBytes":5626,"specSha256":"4a74e505f3c60fb05efe6017d8071b01d8a2c38662c03e146afc875ad12cc006","branch":"refs/heads/feature/angular-scaffold-on-current-stable-angular","head":"5af3ededc9bf5fd98ccf5f720c09504833b6c280","baseRef":"refs/heads/main","baseCommit":"5af3ededc9bf5fd98ccf5f720c09504833b6c280","sourceTree":"4a4b44eb3c973af0ae97e41bcc33352be892a99c","landing":"local-merge","absentOptional":[]} -->
