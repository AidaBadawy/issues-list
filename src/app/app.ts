import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { IssueList } from './issues/issue-list/issue-list';

@Component({
  imports: [RouterOutlet, IssueList],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {}
