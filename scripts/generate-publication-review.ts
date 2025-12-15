#!/usr/bin/env tsx

/**
 * Script to generate publication review JSON files for manual curation.
 * 
 * This script:
 * 1. Collects all publications from OpenAlex, ORCID, and DOI sources
 * 2. Deduplicates by DOI
 * 3. Creates batched JSON files for manual review
 * 4. Creates a themes JSON file for reference
 * 
 * Run with: npm run generate:review (add to package.json) or: npx tsx scripts/generate-publication-review.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { researchProjects } from '../src/data/researchProjects';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Types for review records
type PublicationReviewRecord = {
  doi: string;
  title: string;
  authors: string[];
  year?: number;
  venue?: string;
  themeIds: string[];
  notes: string;
};

type PublicationTheme = {
  id: string;
  title: string;
  shortDescription: string;
};

/**
 * Normalizes a DOI string to a canonical format (just the DOI part, no protocol)
 */
function normalizeDoi(doi: string | undefined): string | null {
  if (!doi) return null;
  
  // Remove protocol and domain prefixes
  let normalized = doi
    .replace(/^https?:\/\/(dx\.)?doi\.org\//i, '')
    .replace(/^doi:/i, '')
    .trim();
  
  return normalized || null;
}

/**
 * Gets author names as a simple string array from a publication
 */
function extractAuthorNames(publication: any): string[] {
  if (!publication.authors || !Array.isArray(publication.authors)) {
    return [];
  }
  
  return publication.authors.map((author: any) => {
    if (typeof author === 'string') {
      return author;
    }
    if (author.name) {
      return author.name;
    }
    return '';
  }).filter((name: string) => name.length > 0);
}

/**
 * Determines if a publication record is "better" than another (for deduplication)
 */
function isBetterRecord(a: any, b: any): boolean {
  // Prefer records with title
  if (a.title && !b.title) return true;
  if (!a.title && b.title) return false;
  
  // Prefer records with authors
  const aAuthors = extractAuthorNames(a);
  const bAuthors = extractAuthorNames(b);
  if (aAuthors.length > 0 && bAuthors.length === 0) return true;
  if (aAuthors.length === 0 && bAuthors.length > 0) return false;
  
  // Prefer records with venue/year
  if ((a.venue || a.year) && !(b.venue || b.year)) return true;
  if (!(a.venue || a.year) && (b.venue || b.year)) return false;
  
  return false;
}

/**
 * Converts a publication to a review record
 */
function publicationToReviewRecord(pub: any): PublicationReviewRecord | null {
  const normalizedDoi = normalizeDoi(pub.doi);
  
  if (!normalizedDoi) {
    // Skip publications without DOI
    return null;
  }
  
  if (!pub.title || pub.title.trim().length === 0) {
    // Skip publications without title
    return null;
  }
  
  const authors = extractAuthorNames(pub);
  
  return {
    doi: normalizedDoi,
    title: pub.title.trim(),
    authors: authors,
    year: pub.year,
    venue: pub.venue?.trim() || undefined,
    themeIds: [],
    notes: '',
  };
}

/**
 * Recursively get all JSON files in a directory
 */
function getAllJsonFiles(dir: string): string[] {
  const files: string[] = [];
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...getAllJsonFiles(fullPath));
      } else if (entry.isFile() && entry.name.endsWith('.json')) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    // Directory doesn't exist or can't be read
  }
  return files;
}

/**
 * Main function to generate review files
 */
async function main() {
  const projectRoot = path.join(__dirname, '..');
  const dataDir = path.join(projectRoot, 'src', 'data');
  const reviewDir = path.join(dataDir, 'publication-review');
  
  // Create review directory if it doesn't exist
  if (!fs.existsSync(reviewDir)) {
    fs.mkdirSync(reviewDir, { recursive: true });
  }
  
  console.log('Collecting publications...');
  
  // Collect all publications from different sources
  const publicationsByDoi = new Map<string, any>();
  
  // 1. Load OpenAlex snapshots
  const openAlexDir = path.join(dataDir, 'publications', 'openalex');
  const openAlexFiles = getAllJsonFiles(openAlexDir);
  console.log(`Found ${openAlexFiles.length} OpenAlex snapshot files`);
  for (const file of openAlexFiles) {
    const content = JSON.parse(fs.readFileSync(file, 'utf-8'));
    if (content.works && Array.isArray(content.works)) {
      for (const work of content.works) {
        const normalizedDoi = normalizeDoi(work.doi);
        if (normalizedDoi) {
          const existing = publicationsByDoi.get(normalizedDoi);
          if (!existing || isBetterRecord(work, existing)) {
            publicationsByDoi.set(normalizedDoi, work);
          }
        }
      }
    }
  }
  
  // 2. Load ORCID snapshots
  const orcidDir = path.join(dataDir, 'publications', 'orcid');
  const orcidFiles = getAllJsonFiles(orcidDir);
  console.log(`Found ${orcidFiles.length} ORCID snapshot files`);
  for (const file of orcidFiles) {
    const content = JSON.parse(fs.readFileSync(file, 'utf-8'));
    if (content.works && Array.isArray(content.works)) {
      for (const work of content.works) {
        const normalizedDoi = normalizeDoi(work.doi);
        if (normalizedDoi) {
          const existing = publicationsByDoi.get(normalizedDoi);
          if (!existing || isBetterRecord(work, existing)) {
            publicationsByDoi.set(normalizedDoi, work);
          }
        }
      }
    }
  }
  
  // 3. Load DOI-based publications
  const doiDir = path.join(dataDir, 'publications', 'doi');
  const doiFiles = getAllJsonFiles(doiDir);
  console.log(`Found ${doiFiles.length} DOI publication files`);
  for (const file of doiFiles) {
    const content = JSON.parse(fs.readFileSync(file, 'utf-8'));
    // DOI files have a single publication as the default export
    const pub = content.default || content;
    const normalizedDoi = normalizeDoi(pub.doi);
    if (normalizedDoi) {
      const existing = publicationsByDoi.get(normalizedDoi);
      if (!existing || isBetterRecord(pub, existing)) {
        publicationsByDoi.set(normalizedDoi, pub);
      }
    }
  }
  
  console.log(`Found ${publicationsByDoi.size} unique publications with DOI`);
  
  // Convert to review records and filter out invalid ones
  const reviewRecords: PublicationReviewRecord[] = [];
  for (const pub of publicationsByDoi.values()) {
    const record = publicationToReviewRecord(pub);
    if (record) {
      reviewRecords.push(record);
    }
  }
  
  console.log(`Created ${reviewRecords.length} review records`);
  
  // Sort by year (descending), then title (ascending)
  reviewRecords.sort((a, b) => {
    if (a.year && b.year && a.year !== b.year) {
      return b.year - a.year;
    }
    if (a.year && !b.year) return -1;
    if (!a.year && b.year) return 1;
    return a.title.localeCompare(b.title, undefined, { sensitivity: 'base' });
  });
  
  // Create batches
  const BATCH_SIZE = 10;
  const batches: PublicationReviewRecord[][] = [];
  for (let i = 0; i < reviewRecords.length; i += BATCH_SIZE) {
    batches.push(reviewRecords.slice(i, i + BATCH_SIZE));
  }
  
  console.log(`Created ${batches.length} batches`);
  
  // Write batch files
  for (let i = 0; i < batches.length; i++) {
    const batchNum = String(i + 1).padStart(2, '0');
    const batchFile = path.join(reviewDir, `publications_batch_${batchNum}.json`);
    fs.writeFileSync(
      batchFile,
      JSON.stringify(batches[i], null, 2) + '\n',
      'utf-8'
    );
    console.log(`Wrote ${batchFile} (${batches[i].length} publications)`);
  }
  
  // Create index file
  const index: Record<string, Omit<PublicationReviewRecord, 'themeIds' | 'notes'>> = {};
  for (const record of reviewRecords) {
    index[record.doi] = {
      doi: record.doi,
      title: record.title,
      authors: record.authors,
      year: record.year,
      venue: record.venue,
    };
  }
  
  const indexFile = path.join(reviewDir, 'publications_index_by_doi.json');
  fs.writeFileSync(
    indexFile,
    JSON.stringify(index, null, 2) + '\n',
    'utf-8'
  );
  console.log(`Wrote ${indexFile}`);
  
  // Create themes file
  const themes: PublicationTheme[] = researchProjects.map((project) => ({
    id: project.slug,
    title: project.title,
    shortDescription: project.shortDescription || '',
  }));
  
  const themesFile = path.join(reviewDir, 'themes_for_publications.json');
  fs.writeFileSync(
    themesFile,
    JSON.stringify(themes, null, 2) + '\n',
    'utf-8'
  );
  console.log(`Wrote ${themesFile} (${themes.length} themes)`);
  
  console.log('\nDone! Review files generated in src/data/publication-review/');
}

// Run the script
main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
