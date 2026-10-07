import type { Issue } from './issue-snapshot';

export function filterIssues(issues: Issue[], query: string): Issue[] {
  const needle = query.trim().toLowerCase();
  if (needle === '') {
    return issues;
  }
  return issues.filter((issue) => matchesIssue(issue, needle));
}

function matchesIssue(issue: Issue, needle: string): boolean {
  if (issue.title.toLowerCase().includes(needle)) {
    return true;
  }
  if (String(issue.number).includes(needle)) {
    return true;
  }
  if (issue.author != null && issue.author.toLowerCase().includes(needle)) {
    return true;
  }
  return issue.labels.some((label) => label.name.toLowerCase().includes(needle));
}
