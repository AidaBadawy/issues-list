import { describe, expect, it } from 'vitest';
import {
  TOKEN_PATTERNS,
  findMatches,
  forbidPattern,
  isScannableSource,
} from './verify-bundle.mjs';

describe('findMatches', () => {
  it('flags token-shaped strings', () => {
    const text = 'const a = "ghp_abcdefghijklmnopqrstuvwx";\nconst b = 1;';
    const matches = findMatches(text, TOKEN_PATTERNS);
    expect(matches).toHaveLength(1);
    expect(matches[0].line).toBe(1);
    expect(matches[0].name).toBe('ghp_ token');
  });

  it('flags fine-grained PATs, GITHUB_TOKEN, and bearer credentials', () => {
    expect(findMatches('github_pat_1234567890abcdefghij', TOKEN_PATTERNS)).toHaveLength(1);
    expect(findMatches('read process.env.GITHUB_TOKEN', TOKEN_PATTERNS)).toHaveLength(1);
    expect(findMatches('Authorization: Bearer abcdefghijklmnop', TOKEN_PATTERNS)).toHaveLength(1);
  });

  it('does not flag benign issue content', () => {
    const text = [
      'const title = "Login fails with 500";',
      'const author = "octocat";',
      'const url = issue.url;',
    ].join('\n');
    expect(findMatches(text, TOKEN_PATTERNS)).toHaveLength(0);
  });

  it('does not flag short or bare Bearer-like text', () => {
    expect(findMatches('Authorization: Bearer abc', TOKEN_PATTERNS)).toHaveLength(0);
  });
});

describe('forbidPattern', () => {
  it('matches the literal regardless of regex metacharacters', () => {
    const matches = findMatches('owner = "aidarus"', [forbidPattern('aidarus')]);
    expect(matches).toHaveLength(1);
    expect(findMatches('owner = "octocat"', [forbidPattern('aidarus')])).toHaveLength(0);
  });
});

describe('isScannableSource', () => {
  it('excludes generated data and specs but scans shipped source', () => {
    expect(isScannableSource('src/app/issues/issues.data.ts')).toBe(false);
    expect(isScannableSource('src/app/app.spec.ts')).toBe(false);
    expect(isScannableSource('src/app/issues/issue-view-state.spec.ts')).toBe(false);
    expect(isScannableSource('src/app/app.ts')).toBe(true);
    expect(isScannableSource('src/app/issues/issue-list/issue-list.html')).toBe(true);
  });
});
