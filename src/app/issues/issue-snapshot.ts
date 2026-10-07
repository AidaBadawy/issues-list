export interface Label {
  name: string;
  color?: string;
}

export interface Issue {
  number: number;
  title: string;
  url: string;
  labels: Label[];
  author: string | null;
  authorAvatarUrl?: string | null;
  createdAt: string;
}

export interface IssueSnapshot {
  generatedAt: string;
  repo: { owner: string; name: string };
  issues: Issue[];
}
