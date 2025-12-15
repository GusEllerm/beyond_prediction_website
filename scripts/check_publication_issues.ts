/* scripts/check_publication_issues.ts
 * 
 * This script checks for publications that:
 * 1. Don't have authors
 * 2. Have authors but none match anyone in people.ts
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { allPeople } from '../src/data/people.js';
import { getPublicationAuthors } from '../src/utils/authorMatching.js';
import type { PersonPublication } from '../src/data/publications.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface PublicationIssue {
  doi?: string;
  title: string;
  file: string;
  totalAuthors?: number;
  matchedAuthors?: number;
  authorNames?: string[];
}

const issues = {
  noAuthors: [] as PublicationIssue[],
  noMatchedAuthors: [] as PublicationIssue[],
};

const doiDir = path.join(__dirname, '..', 'src', 'data', 'publications', 'doi');
const files = fs.readdirSync(doiDir).filter((f) => f.endsWith('.json'));

for (const file of files) {
  const filePath = path.join(doiDir, file);
  const pub: PersonPublication = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  if (!pub.authors || pub.authors.length === 0) {
    issues.noAuthors.push({
      doi: pub.doi,
      title: pub.title || 'Untitled',
      file: file,
    });
  } else {
    const matchedAuthors = getPublicationAuthors(pub, allPeople);
    if (matchedAuthors.length === 0) {
      issues.noMatchedAuthors.push({
        doi: pub.doi,
        title: pub.title || 'Untitled',
        file: file,
        totalAuthors: pub.authors.length,
        matchedAuthors: 0,
        authorNames: pub.authors.map((a) => a.name),
      });
    }
  }
}

// Generate markdown report
const markdown = `# Publication Issues

This file lists publications that need attention:

## Publications Without Authors

These publications don't have any author information in their metadata:

${issues.noAuthors.length === 0 
  ? '*None*' 
  : issues.noAuthors.map((issue) => 
      `- **${issue.title}**${issue.doi ? ` (DOI: ${issue.doi})` : ''} - \`${issue.file}\``
    ).join('\n')
}

## Publications With Authors But None Matched

These publications have authors, but none of them match anyone in \`people.ts\`:

${issues.noMatchedAuthors.length === 0 
  ? '*None*' 
  : issues.noMatchedAuthors.map((issue) => 
      `- **${issue.title}**${issue.doi ? ` (DOI: ${issue.doi})` : ''}
  - File: \`${issue.file}\`
  - Total authors: ${issue.totalAuthors}
  - Matched authors: ${issue.matchedAuthors}
  - Author names: ${issue.authorNames?.join(', ') || 'N/A'}`
    ).join('\n\n')
}

---

*Generated automatically - do not edit manually*
*Total publications checked: ${files.length}*
*Publications with issues: ${issues.noAuthors.length + issues.noMatchedAuthors.length}*
`;

const issuesPath = path.join(__dirname, '..', 'src', 'data', 'publications', 'ISSUES.md');
fs.writeFileSync(issuesPath, markdown, 'utf-8');

console.log(`✓ Generated ISSUES.md`);
console.log(`  - Publications without authors: ${issues.noAuthors.length}`);
console.log(`  - Publications with unmatched authors: ${issues.noMatchedAuthors.length}`);
console.log(`  - Total publications checked: ${files.length}`);

