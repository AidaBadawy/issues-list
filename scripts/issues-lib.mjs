export const GITHUB_GRAPHQL_URL = 'https://api.github.com/graphql';
export const PAGE_SIZE = 100;

export function buildIssuesQuery() {
  return `query FetchOpenIssues($owner: String!, $name: String!, $cursor: String) {
  repository(owner: $owner, name: $name) {
    issues(
      first: ${PAGE_SIZE}
      after: $cursor
      states: OPEN
      orderBy: { field: CREATED_AT, direction: DESC }
    ) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        number
        title
        url
        labels(first: 100) {
          nodes {
            name
            color
          }
        }
        author {
          login
        }
        createdAt
      }
    }
  }
}`;
}

export function mapIssue(node) {
  const labels = (node.labels?.nodes ?? []).map((label) =>
    label.color != null ? { name: label.name, color: label.color } : { name: label.name },
  );
  return {
    number: node.number,
    title: node.title,
    url: node.url,
    labels,
    author: node.author?.login ?? null,
    createdAt: node.createdAt,
  };
}

export async function paginateIssues({ fetchGraphQL, owner, name }) {
  const issues = [];
  let cursor = null;
  for (;;) {
    const data = await fetchGraphQL(buildIssuesQuery(), { owner, name, cursor });
    const repository = data?.repository;
    if (!repository) {
      throw new Error(`Repository ${owner}/${name} not found or not accessible`);
    }
    const connection = repository.issues;
    for (const node of connection.nodes ?? []) {
      issues.push(mapIssue(node));
    }
    if (!connection.pageInfo?.hasNextPage) {
      return issues;
    }
    cursor = connection.pageInfo.endCursor;
  }
}
