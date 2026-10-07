import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const IGNORED_DIRS = new Set(['node_modules', '.angular', 'dist', '.git']);

export const TOKEN_PATTERNS = [
  { name: 'ghp_ token', regex: /\bghp_[A-Za-z0-9]{20,}/ },
  { name: 'gho_ token', regex: /\bgho_[A-Za-z0-9]{20,}/ },
  { name: 'ghs_ token', regex: /\bghs_[A-Za-z0-9]{20,}/ },
  { name: 'ghr_ token', regex: /\bghr_[A-Za-z0-9]{20,}/ },
  { name: 'fine-grained PAT', regex: /\bgithub_pat_[A-Za-z0-9_]{20,}/ },
  { name: 'GITHUB_TOKEN identifier', regex: /\bGITHUB_TOKEN\b/ },
  {
    name: 'bearer credential',
    regex: /\bBearer\s+[A-Za-z0-9._~+/=-]{16,}/,
  },
];

export const SOURCE_URL_PATTERN = {
  name: 'github.com URL literal',
  regex: /github\.com\/[A-Za-z0-9._-]+\/[A-Za-z0-9._-]+/,
};

export function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function forbidPattern(literal) {
  return { name: `forbidden literal "${literal}"`, regex: new RegExp(escapeRegExp(literal)) };
}

export function isScannableSource(path) {
  return !path.endsWith('issues.data.ts') && !path.includes('.spec.');
}

export function findMatches(text, patterns) {
  const matches = [];
  const lines = text.split('\n');
  for (const [index, line] of lines.entries()) {
    for (const pattern of patterns) {
      if (pattern.regex.test(line)) {
        matches.push({ line: index + 1, name: pattern.name, excerpt: line.trim().slice(0, 120) });
      }
    }
  }
  return matches;
}

export function walkFiles(root) {
  const files = [];
  const stack = [root];
  while (stack.length > 0) {
    const dir = stack.pop();
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        if (!IGNORED_DIRS.has(entry.name)) {
          stack.push(full);
        }
      } else if (entry.isFile()) {
        files.push(full);
      }
    }
  }
  return files.sort();
}

function parseArgs(argv) {
  let distPath = 'dist/issues-list/browser';
  let srcPath = 'src';
  const forbids = [];
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--dist' && argv[i + 1]) {
      distPath = argv[i + 1];
      i += 1;
    } else if (argv[i] === '--src' && argv[i + 1]) {
      srcPath = argv[i + 1];
      i += 1;
    } else if (argv[i] === '--forbid' && argv[i + 1]) {
      forbids.push(argv[i + 1]);
      i += 1;
    } else {
      console.error(`[verify-bundle] Unknown argument: ${argv[i]}`);
      process.exit(2);
    }
  }
  return { distPath, srcPath, forbids };
}

function report(label, files, patterns) {
  let total = 0;
  for (const file of files) {
    const matches = findMatches(readFileSync(file, 'utf8'), patterns);
    for (const match of matches) {
      total += 1;
      console.error(`[verify-bundle] ${label} ${file}:${match.line} [${match.name}] ${match.excerpt}`);
    }
  }
  return total;
}

function main() {
  const { distPath, srcPath, forbids } = parseArgs(process.argv.slice(2));
  if (!existsSync(distPath)) {
    console.error(`[verify-bundle] Dist directory not found: ${distPath}. Run the build first.`);
    process.exit(1);
  }

  const extraPatterns = forbids.map(forbidPattern);
  const distPatterns = [...TOKEN_PATTERNS, ...extraPatterns];
  const sourcePatterns = [...TOKEN_PATTERNS, SOURCE_URL_PATTERN, ...extraPatterns];

  const distFiles = walkFiles(distPath).filter((file) => !file.endsWith('.map'));
  const sourceFiles = walkFiles(srcPath).filter(isScannableSource);

  const found =
    report('dist', distFiles, distPatterns) + report('source', sourceFiles, sourcePatterns);
  if (found > 0) {
    console.error(`[verify-bundle] FAILED: ${found} forbidden match(es).`);
    process.exit(1);
  }
  console.log(
    `[verify-bundle] clean: ${distFiles.length} dist file(s) and ${sourceFiles.length} source file(s) scanned.`,
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
