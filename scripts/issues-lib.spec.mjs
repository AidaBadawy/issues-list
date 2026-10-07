import { describe, expect, it } from 'vitest';
import { PAGE_SIZE, buildIssuesQuery, mapIssue, paginateIssues } from './issues-lib.mjs';

function makeNode(overrides = {}) {
  return {
    number: 1,
    title: 'First',
    url: 'https://github.com/acme/repo/issues/1',
    labels: { nodes: [{ name: 'bug', color: 'd73a4a' }] },
    author: { login: 'octocat' },
    createdAt: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

function makePage(nodes, { hasNextPage, endCursor }) {
  return {
    data: {
      repository: {
        issues: { nodes, pageInfo: { hasNextPage, endCursor } },
      },
    },
  };
}

describe('buildIssuesQuery', () => {
  it('requests open issues, page size 100, newest first, with a cursor variable', () => {
    const query = buildIssuesQuery();
    expect(query).toContain('states: OPEN');
    expect(query).toContain(`first: ${PAGE_SIZE}`);
    expect(PAGE_SIZE).toBe(100);
    expect(query).toContain('direction: DESC');
    expect(query).toContain('$cursor: String');
  });
});

describe('mapIssue', () => {
  it('maps every field the app needs', () => {
    const mapped = mapIssue(makeNode());
    expect(mapped).toEqual({
      number: 1,
      title: 'First',
      url: 'https://github.com/acme/repo/issues/1',
      labels: [{ name: 'bug', color: 'd73a4a' }],
      author: 'octocat',
      createdAt: '2026-01-01T00:00:00Z',
    });
  });

  it('keeps labels without a color and drops missing labels', () => {
    expect(mapIssue(makeNode({ labels: { nodes: [{ name: 'docs' }] } })).labels).toEqual([
      { name: 'docs' },
    ]);
    expect(mapIssue(makeNode({ labels: null })).labels).toEqual([]);
  });

  it('maps a deleted or anonymous author to null', () => {
    expect(mapIssue(makeNode({ author: null })).author).toBeNull();
  });
});

describe('paginateIssues', () => {
  it('merges every page in order until hasNextPage is false, with no cap', async () => {
    const pages = [
      makePage(
        Array.from({ length: 100 }, (_, i) => makeNode({ number: 100 - i })),
        { hasNextPage: true, endCursor: 'cursor-1' },
      ),
      makePage(
        Array.from({ length: 100 }, (_, i) => makeNode({ number: 200 - i })),
        { hasNextPage: true, endCursor: 'cursor-2' },
      ),
      makePage([makeNode({ number: 201 })], { hasNextPage: false, endCursor: null }),
    ];
    const seenVariables = [];
    let call = 0;
    const fetchGraphQL = async (query, variables) => {
      expect(query).toContain('FetchOpenIssues');
      seenVariables.push(variables);
      return pages[call++].data;
    };

    const issues = await paginateIssues({ fetchGraphQL, owner: 'acme', name: 'repo' });

    expect(issues).toHaveLength(201);
    expect(issues[0].number).toBe(100);
    expect(issues[100].number).toBe(200);
    expect(issues[200].number).toBe(201);
    expect(seenVariables).toEqual([
      { owner: 'acme', name: 'repo', cursor: null },
      { owner: 'acme', name: 'repo', cursor: 'cursor-1' },
      { owner: 'acme', name: 'repo', cursor: 'cursor-2' },
    ]);
    expect(call).toBe(3);
  });

  it('throws when the repository is missing', async () => {
    const fetchGraphQL = async () => ({ data: { repository: null } });
    await expect(
      paginateIssues({ fetchGraphQL, owner: 'acme', name: 'gone' }),
    ).rejects.toThrow('acme/gone');
  });
});
