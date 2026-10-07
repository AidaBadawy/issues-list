# Notes

## Approach
The site is a static Angular app. A build-time script queries GitHub's
GraphQL API for every open issue (cursor pagination, no cap), and the
result is baked into the page. A GitHub Actions workflow builds and deploys
it to Pages on every push to the default branch and on manual "Run workflow".
The repo owner/name comes from `GITHUB_REPOSITORY`, and the only credential
is the automatic `GITHUB_TOKEN`, so nothing is hardcoded and no token is
shipped in the bundle. The list is deliberately a snapshot "as of last
deploy": closing an issue only shows up after the next run.

## How I worked: AI Blueprint

I built this with [AI Blueprint](https://ai-blueprint.dev/), an open-source,
spec-driven workflow framework for AI coding tools. I chose it because the
brief is a strict checklist, and I wanted every decision, scope boundary and
piece of proof to be written down instead of living in a chat I could lose.

**Plan first, in files.** Before any code, I wrote the requirements into
`TEST.md` and had a build plan (`build-plan.md`) broken into nine small
features. Each feature maps back to the numbered requirements, and the plan
also records risks (token scope for GraphQL, pagination cost, stale caching,
untrusted issue text) and the decisions I resolved up front (newest-first,
plain-text authors, no issue cap, no fetch in local dev). The agent worked
from these files, not from memory.

**One feature at a time, with review gates.** Each feature went through the
same loop:
1. `/feature` wrote a spec, and I approved it before any code existed.
2. `/implement` built it in small reviewable steps.
3. `/check` verified the spec's "done-when" conditions with evidence.
4. `/complete` archived the spec and ticked the feature off in the plan.

Features 1 to 5 (scaffold, GraphQL fetch, rendering and empty state,
token/portability verification, deploy workflow) are done, and the rest
are tracked in the plan.

**Why it suited this brief.**
- *Requirement traceability:* the plan's mapping table links every
  requirement (1-12 plus the three extras) to the feature that satisfies
  it, so nothing in the brief can be silently dropped.
- *Security as its own feature:* proving that the built bundle contains no
  token and no hardcoded owner/repo (feature 4) was a dedicated, checked
  step, not an assumption.
- *Decisions were recorded:* open questions were resolved in writing, so
  they weren't re-argued or quietly reversed later.
- *Durable state:* the plan, specs and archive live in the repo as
  markdown, so work could resume cleanly in a fresh session.

**Where I stayed in control.** The AI never decided scope. I approved each
spec, and I treated its summaries of the requirements as claims to verify
against the source text (see the next section for what that caught).

## What the AI got wrong and how I caught it
- **Wrong requirement cited.** When I asked what happens if an issue is
  closed, the AI cited requirement 7 for the "no token in the browser"
  rule. It's requirement 6. I caught it by checking the numbered
  requirements in the brief.
- **Designed the UI with mock data without my approval.** When improving 
  the UI I noticed various mock data. Also without validation it opted 
  to not remove them after using.
- **Assumed `main` as the branch.** It said "push to main," but the brief
  says the default branch and nothing may be hardcoded, so the workflow
  must not assume `main`.
- **Doubted the snapshot behavior.** I briefly wondered whether needing a
  redeploy after closing an issue was a bug. Checking requirements 3, 5
  and 12 showed it is the specified behavior.

Lesson: AI summaries of the spec sound confident but drift in the details,
so I verified claims against the source text instead of trusting them.

## What I'd improve with more time
- Add an optional scheduled rebuild so the list refreshes without anyone
  pressing a button (allowed by the brief, but unnecessary for it).
- Test pagination against a repo with thousands of open issues to check
  rate limits and workflow time.
- Show how fresh the data is, e.g. a "last updated" timestamp on the page.
- Document the cache-freshness check for normal reloads after a redeploy
  in more detail.