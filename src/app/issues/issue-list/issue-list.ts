import { Component, computed, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { issueSnapshot } from '../issues.data';
import { resolveViewState } from '../issue-view-state';
import { filterIssues } from '../issue-query';

@Component({
  selector: 'app-issue-list',
  imports: [DatePipe],
  styleUrl: './issue-list.css',
  templateUrl: './issue-list.html',
})
export class IssueList {
  protected readonly state = resolveViewState(issueSnapshot);
  protected readonly issues = issueSnapshot?.issues ?? [];
  protected readonly query = signal('');
  protected readonly visibleIssues = computed(() =>
    filterIssues(this.issues, this.query()),
  );

  protected onSearchInput(event: Event): void {
    const target = event.target;
    if (target instanceof HTMLInputElement) {
      this.query.set(target.value);
    }
  }
}
