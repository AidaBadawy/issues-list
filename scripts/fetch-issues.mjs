import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { GITHUB_GRAPHQL_URL, paginateIssues } from './issues-lib.mjs';

const DATA_MODULE_PATH = fileURLToPath(
  new URL('../src/app/issues/issues.data.ts', import.meta.url),
);

function fail(message) {
  console.error(`[fetch-issues] ${message}`);
  process.exit(1);
}

function createFetchGraphQL(token) {
  return async function fetchGraphQL(query, variables) {
    const response = await fetch(GITHUB_GRAPHQL_URL, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
        'content-type': 'application/json',
        'x-github-api-version': '2022-11-28',
      },
      body: JSON.stringify({ query, variables }),
    });
    if (!response.ok) {
      fail(`GitHub GraphQL API responded with HTTP ${response.status}`);
    }
    const payload = await response.json();
    if (payload.errors?.length) {
      fail(
        `GitHub GraphQL API returned errors: ${payload.errors
          .map((error) => error.message)
          .join('; ')}`,
      );
    }
    return payload.data;
  };
}

async function main() {
  if (process.env.GITHUB_ACTIONS !== 'true') {
    console.log(
      '[fetch-issues] Not running in GitHub Actions; skipping issue fetch and keeping the committed placeholder.',
    );
    return;
  }

  const token = process.env.GITHUB_TOKEN;
  const repository = process.env.GITHUB_REPOSITORY;
  if (!token) {
    fail('GITHUB_TOKEN is missing; the issue fetch cannot run.');
  }
  if (!repository || !repository.includes('/')) {
    fail('GITHUB_REPOSITORY is missing or malformed; expected "owner/name".');
  }
  const [owner, name] = repository.split('/');

  const issues = await paginateIssues({
    fetchGraphQL: createFetchGraphQL(token),
    owner,
    name,
  }).catch((error) => fail(error.message));

  const snapshot = {
    generatedAt: new Date().toISOString(),
    repo: { owner, name },
    issues,
  };
  const moduleSource = `import type { IssueSnapshot } from './issue-snapshot';

export const issueSnapshot: IssueSnapshot | null = ${JSON.stringify(snapshot, null, 2)};
`;
  writeFileSync(DATA_MODULE_PATH, moduleSource);
  console.log(
    `[fetch-issues] Wrote ${issues.length} open issue(s) for ${owner}/${name}.`,
  );
}

await main();
