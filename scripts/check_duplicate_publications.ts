/* scripts/check_duplicate_publications.ts
 *
 * This script checks for duplicate publications by:
 * 1. Same OpenAlex ID
 * 2. Same DOI
 * 3. Same normalized title
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface Publication {
  id?: string;
  doi?: string;
  title?: string;
  file: string;
}

interface DuplicateGroup {
  reason: string;
  value: string;
  files: string[];
  publications: Publication[];
}

/**
 * Normalizes a title for comparison (lowercase, trim, normalize whitespace)
 */
function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s]/g, ''); // Remove punctuation for fuzzy matching
}

/**
 * Normalizes a DOI for comparison
 */
function normalizeDOI(doi: string | undefined): string | null {
  if (!doi) return null;
  return doi.toLowerCase().trim();
}

/**
 * Normalizes an OpenAlex ID for comparison
 */
function normalizeOpenAlexId(id: string | undefined): string | null {
  if (!id) return null;
  return id.toLowerCase().trim();
}

const doiDir = path.join(__dirname, '..', 'src', 'data', 'publications', 'doi');
const files = fs.readdirSync(doiDir).filter((f) => f.endsWith('.json'));

const publications: Publication[] = [];

// Load all publications
for (const file of files) {
  const filePath = path.join(doiDir, file);
  try {
    const pub = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    publications.push({
      id: pub.id,
      doi: pub.doi,
      title: pub.title,
      file: file,
    });
  } catch (error) {
    console.error(`Error reading ${file}:`, error);
  }
}

const duplicates: DuplicateGroup[] = [];
const seenOpenAlexIds = new Map<string, Publication[]>();
const seenDOIs = new Map<string, Publication[]>();
const seenTitles = new Map<string, Publication[]>();

// Group by OpenAlex ID
for (const pub of publications) {
  const normalizedId = normalizeOpenAlexId(pub.id);
  if (normalizedId) {
    if (!seenOpenAlexIds.has(normalizedId)) {
      seenOpenAlexIds.set(normalizedId, []);
    }
    seenOpenAlexIds.get(normalizedId)!.push(pub);
  }
}

// Group by DOI
for (const pub of publications) {
  const normalizedDOI = normalizeDOI(pub.doi);
  if (normalizedDOI) {
    if (!seenDOIs.has(normalizedDOI)) {
      seenDOIs.set(normalizedDOI, []);
    }
    seenDOIs.get(normalizedDOI)!.push(pub);
  }
}

// Group by normalized title
for (const pub of publications) {
  if (pub.title) {
    const normalizedTitle = normalizeTitle(pub.title);
    if (normalizedTitle.length > 10) {
      // Only check titles with meaningful length
      if (!seenTitles.has(normalizedTitle)) {
        seenTitles.set(normalizedTitle, []);
      }
      seenTitles.get(normalizedTitle)!.push(pub);
    }
  }
}

// Find duplicates by OpenAlex ID
for (const [id, pubs] of seenOpenAlexIds.entries()) {
  if (pubs.length > 1) {
    duplicates.push({
      reason: 'Same OpenAlex ID',
      value: id,
      files: pubs.map((p) => p.file),
      publications: pubs,
    });
  }
}

// Find duplicates by DOI
for (const [doi, pubs] of seenDOIs.entries()) {
  if (pubs.length > 1) {
    // Check if this isn't already reported as an OpenAlex ID duplicate
    const isAlreadyReported = duplicates.some(
      (d) => d.reason === 'Same OpenAlex ID' && d.publications.some((p) => pubs.includes(p))
    );
    if (!isAlreadyReported) {
      duplicates.push({
        reason: 'Same DOI',
        value: doi,
        files: pubs.map((p) => p.file),
        publications: pubs,
      });
    }
  }
}

// Find duplicates by title
for (const [title, pubs] of seenTitles.entries()) {
  if (pubs.length > 1) {
    // Check if this isn't already reported
    const isAlreadyReported = duplicates.some((d) => d.publications.some((p) => pubs.includes(p)));
    if (!isAlreadyReported) {
      duplicates.push({
        reason: 'Same Title',
        value: pubs[0].title || title,
        files: pubs.map((p) => p.file),
        publications: pubs,
      });
    }
  }
}

// Read existing ISSUES.md
const issuesPath = path.join(__dirname, '..', 'src', 'data', 'publications', 'ISSUES.md');
let existingContent = '';
if (fs.existsSync(issuesPath)) {
  existingContent = fs.readFileSync(issuesPath, 'utf-8');
}

// Generate duplicates section
const duplicatesMarkdown =
  duplicates.length === 0
    ? '*None*'
    : duplicates
        .map((group) => {
          const filesList = group.publications
            .map((pub) => {
              const details: string[] = [];
              if (pub.doi) {
                // Check if it's a preprint
                const isPreprint =
                  pub.doi.includes('10.1101') || pub.doi.includes('10.48550/arxiv');
                if (isPreprint) details.push(`DOI: ${pub.doi} (preprint)`);
                else details.push(`DOI: ${pub.doi}`);
              }
              if (pub.id) details.push(`OpenAlex: ${pub.id}`);
              return `- \`${pub.file}\`${details.length > 0 ? ` (${details.join(', ')})` : ''}`;
            })
            .join('\n');

          // Check if this is a preprint vs published version
          const hasPreprint = group.publications.some(
            (p) => p.doi && (p.doi.includes('10.1101') || p.doi.includes('10.48550/arxiv'))
          );
          const note = hasPreprint
            ? '\n*Note: This appears to be a preprint and published version of the same work.*'
            : '';

          return `### ${group.reason}: ${group.value}

Files:
${filesList}
${note}

Publications:
${group.publications.map((pub) => `- **${pub.title || 'Untitled'}**`).join('\n')}
`;
        })
        .join('\n---\n\n');

// Generate new ISSUES.md content
// Remove existing duplicate section if it exists, then add new one
let markdown = existingContent.trim();
if (markdown.includes('## Duplicate Publications')) {
  // Remove everything from "## Duplicate Publications" to the end
  const duplicateIndex = markdown.indexOf('## Duplicate Publications');
  if (duplicateIndex !== -1) {
    markdown = markdown.substring(0, duplicateIndex).trim();
  }
}

// Add the duplicates section
if (markdown && !markdown.endsWith('\n')) {
  markdown += '\n\n';
} else if (markdown) {
  markdown += '\n';
}

markdown += `## Duplicate Publications

These publications appear to be duplicates (same semantic meaning):

${duplicatesMarkdown}

---

*Generated automatically - do not edit manually*
*Total publications checked: ${files.length}*
*Duplicate groups found: ${duplicates.length}*
`;

fs.writeFileSync(issuesPath, markdown, 'utf-8');

console.log(`✓ Updated ISSUES.md with duplicate publications`);
console.log(`  - Duplicate groups found: ${duplicates.length}`);
console.log(`  - Total publications checked: ${files.length}`);

if (duplicates.length > 0) {
  console.log('\nDuplicate groups:');
  for (const group of duplicates) {
    console.log(`  - ${group.reason}: ${group.value} (${group.files.length} files)`);
  }
}
