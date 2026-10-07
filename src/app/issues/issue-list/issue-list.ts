import { Component } from '@angular/core';
import { DatePipe } from '@angular/common';
import { issueSnapshot } from '../issues.data';
import { resolveViewState } from '../issue-view-state';

@Component({
  selector: 'app-issue-list',
  imports: [DatePipe],
  styleUrl: './issue-list.css',
  templateUrl: './issue-list.html',
})
export class IssueList {
  protected readonly state = resolveViewState(issueSnapshot);
  protected readonly issues = issueSnapshot?.issues ?? [];
}
