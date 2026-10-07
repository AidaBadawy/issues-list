import type { IssueSnapshot } from './issue-snapshot';

export type IssueViewState = 'placeholder' | 'empty' | 'list';

export function resolveViewState(snapshot: IssueSnapshot | null): IssueViewState {
  if (snapshot === null) {
    return 'placeholder';
  }
  return snapshot.issues.length === 0 ? 'empty' : 'list';
}
