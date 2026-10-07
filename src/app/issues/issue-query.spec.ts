import { describe, expect, it } from 'vitest';
import { filterIssues } from './issue-query';
import type { Issue } from './issue-snapshot';

function makeIssue(overrides: Partial<Issue> = {}): Issue {
  return {
    number: 1,
    title: 'Fix login bug',
    url: 'https://example.invalid/issues/1',
    labels: [
      { name: 'bug', color: 'd73a4a' },
      { name: 'needs docs' },
    ],
    author: 'octocat',
    createdAt: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

function makeIssues(): Issue[] {
  return [
    makeIssue(),
    makeIssue({
      number: 21,
      title: 'Add dark mode',
      labels: [{ name: 'enhancement', color: 'a2eeef' }],
      author: 'hubot',
    }),
    makeIssue({
      number: 7,
      title: 'Update README',
      labels: [{ name: 'documentation', color: '0075ca' }],
      author: null,
    }),
  ];
}

describe('filterIssues', () => {
  it('returns every issue for an empty query', () => {
    const issues = makeIssues();
    expect(filterIssues(issues, '')).toEqual(issues);
  });

  it('treats a whitespace-only query as empty', () => {
    const issues = makeIssues();
    expect(filterIssues(issues, '   ')).toEqual(issues);
  });

  it('matches the title case-insensitively', () => {
    const result = filterIssues(makeIssues(), 'DARK MODE');
    expect(result.map((issue) => issue.number)).toEqual([21]);
  });

  it('matches the issue number as text', () => {
    const result = filterIssues(makeIssues(), '7');
    expect(result.map((issue) => issue.number)).toEqual([7]);
  });

  it('matches author names and skips issues with no author', () => {
    expect(filterIssues(makeIssues(), 'hubot').map((i) => i.number)).toEqual([21]);
    expect(filterIssues(makeIssues(), 'octocat').map((i) => i.number)).toEqual([1]);
    expect(filterIssues(makeIssues(), 'deleted').map((i) => i.number)).toEqual([]);
  });

  it('matches label names', () => {
    const result = filterIssues(makeIssues(), 'needs docs');
    expect(result.map((issue) => issue.number)).toEqual([1]);
  });

  it('returns an empty list when nothing matches', () => {
    expect(filterIssues(makeIssues(), 'zzz-no-match')).toEqual([]);
  });
});
