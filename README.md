# IssuesList

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 22.2.2.

## How it works

The site is a static Angular build. During `npm run build`, a prebuild
script queries the repository's open issues through the GitHub GraphQL API
and writes them into `src/app/issues/issues.data.ts` as a snapshot. The
page then renders that snapshot: every open issue, newest first, with its
number, a link to the issue, its labels, its author, and the date it was
opened.

The fetch only runs inside GitHub Actions (where the automatic
`GITHUB_TOKEN` and `GITHUB_REPOSITORY` are available). Local builds always
skip it and show a placeholder instead, so no token is ever stored or
committed.

## Deploying

The site deploys to GitHub Pages with the workflow in
`.github/workflows/deploy.yml`.

1. Push this repository to GitHub (fork or new public repository).
2. In the repository Settings -> Pages, set **Source** to **GitHub
   Actions**.
3. Push to the `main` branch, or open the **Actions** tab and press **Run
   workflow**. The workflow lints, tests, builds (fetching the issues),
   audits the bundle, and deploys.

Notes:

- The very first run, triggered by your push, may fail because Pages is
  not enabled yet. That is expected: enable the Pages source as in step 2,
  then run the workflow again from the Actions tab.
- To refresh the issue list without changing any code, create or close an
  issue and press **Run workflow** again.
- The only credential used is the `GITHUB_TOKEN` that GitHub Actions
  provides automatically. No personal access tokens or repository secrets
  are required.

The deployed site is available at `https://<owner>.github.io/<repository>/`
once the run succeeds.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
