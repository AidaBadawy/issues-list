# Issues List

A static Angular site that publishes a repository's open GitHub issues. The
site has no runtime backend or GitHub API calls: each deployment creates a
snapshot, and visitors see that snapshot until the next deployment.

## How it works

During the GitHub Actions build, the project queries GitHub's GraphQL API for
every open issue in the repository. It writes the newest-first result into the
application before the production bundle is built. The page renders each issue's
number, title, labels, author, opened date, and, when available, decorative
author avatar.

The workflow receives `GITHUB_TOKEN` and `GITHUB_REPOSITORY` automatically
from GitHub Actions. No personal access token, repository secret, or
repository-specific source edit is required. The token is used only while
building and is not included in the deployed bundle.

Local commands intentionally do not fetch GitHub data. Outside GitHub Actions,
the fetch step preserves the committed placeholder snapshot, so local
development and builds work without a token.

## Local development

Install dependencies once:

```bash
npm install
```

Start the local development server:

```bash
npm start
```

Open [http://localhost:4200](http://localhost:4200). It shows the placeholder
snapshot unless you use the dedicated fixture configuration below.

## Checks

Run the project checks from the repository root:

| Command | Purpose |
| --- | --- |
| `npm run lint` | Lint the Angular application. |
| `npm test` | Run Angular unit tests and build-script tests. |
| `npm run build` | Create the production bundle. |
| `npm run verify:bundle` | Confirm the built bundle contains no token or repository-specific values. |
| `npm run test:browser` | Run the local Playwright smoke test against fixture data. |

The browser smoke test checks fixture rendering, search, dark mode, and a phone
viewport. It is a local check and is not part of the GitHub Actions workflow.

## Deploy to GitHub Pages

The release flow is:

1. Integrate work on `development`.
2. Merge or push the approved release to `main`.
3. The push to `main` runs the GitHub Pages workflow automatically.

Before the first deployment, open the repository's **Settings**, choose
**Pages**, and set **Source** to **GitHub Actions**. Then push or merge to
`main`, or use the **Actions** tab to select the deployment workflow and press
**Run workflow**.

The first push-triggered workflow can fail before Pages has been enabled. That
is expected: enable the Pages source, then run the workflow again manually.
When it succeeds, GitHub Pages publishes the static site at the URL GitHub shows
for the repository.

## Refresh the issue list

The issue list changes only when the workflow builds a new snapshot. After
creating, editing, opening, or closing issues, open the **Actions** tab and run
the deployment workflow with **Run workflow**. No code change is needed.

To confirm a refresh locally without GitHub data, start the fixture configuration
instead:

```bash
npm start -- --configuration=fixture
```

The fixture is only for local UI checks. It is excluded from the normal
production build and deployment.
