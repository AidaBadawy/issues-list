import type { IssueSnapshot } from './issue-snapshot';

export const issueSnapshot: IssueSnapshot = {
  generatedAt: '2026-10-07T00:00:00Z',
  repo: { owner: 'octo-org', name: 'demo-project' },
  issues: [
    {
      number: 42,
      title: 'Dark mode support for the issue list',
      url: 'https://example.invalid/octo-org/demo-project/issues/42',
      labels: [
        { name: 'enhancement', color: 'a2eeef' },
        { name: 'ui', color: '5319e7' },
      ],
      author: 'octocat',
      authorAvatarUrl: 'https://avatars.githubusercontent.com/u/583231?v=96',
      createdAt: '2026-10-01T12:00:00Z',
    },
    {
      number: 37,
      title:
        'Add a search box so visitors can find a long-titled issue without scrolling the whole list',
      url: 'https://example.invalid/octo-org/demo-project/issues/37',
      labels: [{ name: 'needs docs' }, { name: 'documentation', color: '0075ca' }],
      author: 'hubot',
      createdAt: '2026-09-20T09:30:00Z',
    },
    {
      number: 23,
      title: 'Label chips clip on narrow screens',
      url: 'https://example.invalid/octo-org/demo-project/issues/23',
      labels: [{ name: 'bug', color: 'd73a4a' }],
      author: null,
      authorAvatarUrl: null,
      createdAt: '2026-09-10T18:45:00Z',
    },
    {
      number: 12,
      title: 'Update dependency pins across the repo',
      url: 'https://example.invalid/octo-org/demo-project/issues/12',
      labels: [],
      author: 'octocat',
      authorAvatarUrl: 'https://avatars.githubusercontent.com/u/583231?v=96',
      createdAt: '2026-08-28T07:15:00Z',
    },
  ],
};
