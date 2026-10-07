import { describe, expect, it } from 'vitest';
import type { IssueSnapshot } from './issue-snapshot';
import { resolveViewState } from './issue-view-state';

function snapshotWith(issueCount: number): IssueSnapshot {
  return {
    generatedAt: '2026-10-07T00:00:00Z',
    repo: { owner: 'acme', name: 'repo' },
    issues: Array.from({ length: issueCount }, (_, i) => ({
      number: i + 1,
      title: `Issue ${i + 1}`,
      url: `https://github.com/acme/repo/issues/${i + 1}`,
      labels: [],
      author: 'octocat',
      createdAt: '2026-01-01T00:00:00Z',
    })),
  };
}

describe('resolveViewState', () => {
  it('returns placeholder when the fetch never ran', () => {
    expect(resolveViewState(null)).toBe('placeholder');
  });

  it('returns empty for a real fetch with zero issues, not placeholder', () => {
    expect(resolveViewState(snapshotWith(0))).toBe('empty');
  });

  it('returns list when issues exist', () => {
    expect(resolveViewState(snapshotWith(3))).toBe('list');
  });
});
