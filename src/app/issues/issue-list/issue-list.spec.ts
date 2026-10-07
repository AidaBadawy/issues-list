import { TestBed } from '@angular/core/testing';
import type { Issue } from '../issue-snapshot';
import type { IssueViewState } from '../issue-view-state';
import { IssueList } from './issue-list';

interface TestableIssueList {
  state: IssueViewState;
  issues: Issue[];
}

const ISSUE: Issue = {
  number: 42,
  title: 'Improve issue rendering',
  url: 'https://example.invalid/issues/42',
  labels: [{ name: 'documentation', color: '0075ca' }],
  author: 'octocat',
  createdAt: '2026-01-01T00:00:00Z',
};

function render(state: IssueViewState, issues: Issue[]): HTMLElement {
  const fixture = TestBed.createComponent(IssueList);
  const component = fixture.componentInstance as unknown as TestableIssueList;
  component.state = state;
  component.issues = issues;
  fixture.detectChanges();
  return fixture.nativeElement as HTMLElement;
}

describe('IssueList', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IssueList],
    }).compileComponents();
  });

  it('renders a fetched issue with its required details', () => {
    const compiled = render('list', [ISSUE]);

    expect(compiled.querySelector('.issue-number')?.textContent).toContain('#42');
    expect(compiled.querySelector('.issue-title')?.textContent).toContain(ISSUE.title);
    expect(compiled.querySelector<HTMLAnchorElement>('.issue-title')?.href).toBe(ISSUE.url);
    expect(compiled.querySelector('.label-chip')?.textContent).toContain('documentation');
    expect(compiled.querySelector('.issue-meta')?.textContent).toContain('octocat');
    expect(compiled.querySelector('time')?.getAttribute('datetime')).toBe(ISSUE.createdAt);
  });

  it('renders the distinct empty state without list controls', () => {
    const compiled = render('empty', []);

    expect(compiled.querySelector('.message')?.textContent).toContain('No open issues.');
    expect(compiled.querySelector('.issue-list')).toBeNull();
    expect(compiled.querySelector('.search-input')).toBeNull();
  });
});
