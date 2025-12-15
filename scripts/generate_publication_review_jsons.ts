/* scripts/generate_publication_review_jsons.ts */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { PersonPublication } from '../src/data/publications.js';
import { researchProjects } from '../src/data/researchProjects.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REVIEW_DIR = path.join(__dirname, '..', 'src', 'data', 'publication-review');
const BATCH_SIZE = 10;

type PublicationReviewRecord = {
  doi: string;
  title: string;
  authors: string[];
  year?: number;
  venue?: string;
  themeIds?: string[];
  notes?: string;
};

type PublicationTheme = {
  id: string;
  title: string;
  shortDescription: string;
};

/**
 * Normalize DOI to a stable string format for use as a key
 */
function normalizeDoi(doi: string | undefined): string | null {
  if (!doi) return null;
  // Remove protocol prefixes and normalize
  return doi
    .replace(/^https?:\/\/(dx\.)?doi\.org\//i, '')
    .replace(/^doi:/i, '')
    .trim();
}

/**
 * Load all publications from DOI directory, OpenAlex snapshots, and ORCID snapshots
 */
function loadAllPublications(): Map<string, PersonPublication> {
  const publications = new Map<string, PersonPublication>();

  // Load from DOI directory (individual publication files)
  const doiDir = path.join(__dirname, '..', 'src', 'data', 'publications', 'doi');
  if (fs.existsSync(doiDir)) {
    const files = fs.readdirSync(doiDir).filter((f) => f.endsWith('.json'));
    for (const file of files) {
      const filePath = path.join(doiDir, file);
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const pub: PersonPublication = JSON.parse(content);

        // Index by OpenAlex ID if available
        if (pub.id) {
          if (!publications.has(pub.id)) {
            publications.set(pub.id, pub);
          }
        }

        // Index by DOI in various formats
        if (pub.doi) {
          const normalizedDoi = normalizeDoi(pub.doi);
          if (normalizedDoi) {
            // Index by normalized DOI
            const doiUrl = `https://doi.org/${normalizedDoi}`;
            if (!publications.has(doiUrl)) {
              publications.set(doiUrl, pub);
            }
            // Also index by http://dx.doi.org format
            const dxDoiUrl = `http://dx.doi.org/${normalizedDoi}`;
            if (!publications.has(dxDoiUrl)) {
              publications.set(dxDoiUrl, pub);
            }
          }
        }
      } catch (error) {
        console.error(`Error reading ${filePath}:`, error);
      }
    }
  }

  // Load from OpenAlex snapshots
  const openAlexDir = path.join(__dirname, '..', 'src', 'data', 'publications', 'openalex');
  if (fs.existsSync(openAlexDir)) {
    const files = fs.readdirSync(openAlexDir).filter((f) => f.endsWith('.json'));
    for (const file of files) {
      const filePath = path.join(openAlexDir, file);
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const snapshot: { works: PersonPublication[] } = JSON.parse(content);
        if (snapshot?.works) {
          for (const work of snapshot.works) {
            // Index by OpenAlex ID
            if (work.id && !publications.has(work.id)) {
              publications.set(work.id, work);
            }
            // Index by DOI
            if (work.doi) {
              const normalizedDoi = normalizeDoi(work.doi);
              if (normalizedDoi) {
                const doiUrl = `https://doi.org/${normalizedDoi}`;
                if (!publications.has(doiUrl)) {
                  publications.set(doiUrl, work);
                }
                const dxDoiUrl = `http://dx.doi.org/${normalizedDoi}`;
                if (!publications.has(dxDoiUrl)) {
                  publications.set(dxDoiUrl, work);
                }
              }
            }
          }
        }
      } catch (error) {
        console.error(`Error reading ${filePath}:`, error);
      }
    }
  }

  // Load from ORCID snapshots
  const orcidDir = path.join(__dirname, '..', 'src', 'data', 'publications', 'orcid');
  if (fs.existsSync(orcidDir)) {
    const files = fs.readdirSync(orcidDir).filter((f) => f.endsWith('.json'));
    for (const file of files) {
      const filePath = path.join(orcidDir, file);
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const snapshot: { works: PersonPublication[] } = JSON.parse(content);
        if (snapshot?.works) {
          for (const work of snapshot.works) {
            // Only add if not already in map (DOI and OpenAlex take precedence)
            if (work.id && !publications.has(work.id)) {
              publications.set(work.id, work);
            }
            // Index by DOI if not already indexed
            if (work.doi) {
              const normalizedDoi = normalizeDoi(work.doi);
              if (normalizedDoi) {
                const doiUrl = `https://doi.org/${normalizedDoi}`;
                if (!publications.has(doiUrl)) {
                  publications.set(doiUrl, work);
                }
              }
            }
          }
        }
      } catch (error) {
        console.error(`Error reading ${filePath}:`, error);
      }
    }
  }

  return publications;
}

/**
 * Extract all publication IDs from researchProjects (both from projects and examples)
 */
function extractPublicationIds(): Set<string> {
  const publicationIds = new Set<string>();

  for (const project of researchProjects) {
    // Add publications from project level
    if (project.publicationIds) {
      for (const id of project.publicationIds) {
        publicationIds.add(id);
      }
    }

    // Add publications from examples
    if (project.examples) {
      for (const example of project.examples) {
        if (example.publicationIds) {
          for (const id of example.publicationIds) {
            publicationIds.add(id);
          }
        }
      }
    }
  }

  return publicationIds;
}

/**
 * Convert a PersonPublication to a PublicationReviewRecord
 */
function convertToReviewRecord(
  pub: PersonPublication,
  originalId: string
): PublicationReviewRecord {
  // Extract author names
  const authors = pub.authors
    ? pub.authors.map((a) => a.name).filter((n) => n && n.trim())
    : [];

  // Get DOI - prefer from pub.doi, otherwise try to extract from originalId
  let doi: string;
  if (pub.doi) {
    const normalized = normalizeDoi(pub.doi);
    doi = normalized || pub.doi;
  } else if (originalId.startsWith('https://doi.org/') || originalId.startsWith('http://dx.doi.org/')) {
    const normalized = normalizeDoi(originalId);
    doi = normalized || originalId;
  } else if (originalId.startsWith('https://openalex.org/')) {
    // For OpenAlex-only publications, use the ID as DOI
    // Extract the W... part or use the full URL
    doi = originalId;
  } else {
    // Custom ID - use as-is
    doi = originalId;
  }

  return {
    doi,
    title: pub.title || '',
    authors,
    year: pub.year,
    venue: pub.venue,
    themeIds: [],
    notes: '',
  };
}

/**
 * Collect all publications that match the publicationIds from researchProjects
 */
function collectPublicationsForReview(): PublicationReviewRecord[] {
  const allPublications = loadAllPublications();
  const publicationIds = extractPublicationIds();

  const reviewRecords = new Map<string, PublicationReviewRecord>();

  console.log(`\nFound ${publicationIds.size} unique publication IDs in researchProjects.ts`);

  for (const id of publicationIds) {
    const pub = allPublications.get(id);
    if (pub) {
      const reviewRecord = convertToReviewRecord(pub, id);
      const doiKey = reviewRecord.doi;

      // Avoid duplicates - prefer records with more complete data
      const existing = reviewRecords.get(doiKey);
      if (!existing) {
        reviewRecords.set(doiKey, reviewRecord);
      } else {
        // Prefer the one with more complete data
        const existingCompleteness =
          (existing.title ? 1 : 0) +
          (existing.authors.length > 0 ? 1 : 0) +
          (existing.year ? 1 : 0) +
          (existing.venue ? 1 : 0);
        const newCompleteness =
          (reviewRecord.title ? 1 : 0) +
          (reviewRecord.authors.length > 0 ? 1 : 0) +
          (reviewRecord.year ? 1 : 0) +
          (reviewRecord.venue ? 1 : 0);

        if (newCompleteness > existingCompleteness) {
          reviewRecords.set(doiKey, reviewRecord);
        }
      }
    } else {
      console.warn(`  ⚠️  Could not find publication: ${id}`);
    }
  }

  // Convert to array and sort
  const allReviewRecords: PublicationReviewRecord[] = Array.from(reviewRecords.values()).sort(
    (a, b) => {
      // Sort by year desc, then title asc
      if (a.year && b.year && a.year !== b.year) {
        return b.year - a.year;
      }
      if (a.year && !b.year) return -1;
      if (!a.year && b.year) return 1;
      return a.title.localeCompare(b.title, undefined, { sensitivity: 'base' });
    }
  );

  console.log(`Successfully collected ${allReviewRecords.length} publications for review\n`);

  return allReviewRecords;
}

/**
 * Write publications in batches
 */
function writeBatches(publications: PublicationReviewRecord[]): void {
  const batches: PublicationReviewRecord[][] = [];
  for (let i = 0; i < publications.length; i += BATCH_SIZE) {
    batches.push(publications.slice(i, i + BATCH_SIZE));
  }

  console.log(`Writing ${batches.length} batch files...`);

  // Remove old batch files
  if (fs.existsSync(REVIEW_DIR)) {
    const existingFiles = fs.readdirSync(REVIEW_DIR).filter((f) =>
      f.match(/^publications_batch_\d+\.json$/)
    );
    for (const file of existingFiles) {
      fs.unlinkSync(path.join(REVIEW_DIR, file));
    }
  }

  // Write new batch files
  for (let i = 0; i < batches.length; i++) {
    const batchNumber = String(i + 1).padStart(2, '0');
    const filename = `publications_batch_${batchNumber}.json`;
    const filePath = path.join(REVIEW_DIR, filename);

    fs.writeFileSync(filePath, JSON.stringify(batches[i], null, 2) + '\n', 'utf-8');
    console.log(`  ✓ ${filename} (${batches[i].length} publications)`);
  }
}

/**
 * Write the index file by DOI
 */
function writeIndex(publications: PublicationReviewRecord[]): void {
  const index: Record<
    string,
    { title: string; authors: string[]; year?: number; venue?: string }
  > = {};

  for (const pub of publications) {
    index[pub.doi] = {
      title: pub.title,
      authors: pub.authors,
      year: pub.year,
      venue: pub.venue,
    };
  }

  const indexPath = path.join(REVIEW_DIR, 'publications_index_by_doi.json');
  fs.writeFileSync(indexPath, JSON.stringify(index, null, 2) + '\n', 'utf-8');
  console.log(`  ✓ publications_index_by_doi.json (${Object.keys(index).length} publications)\n`);
}

/**
 * Generate themes JSON from researchProjects
 */
function generateThemesJson(): void {
  const themes: PublicationTheme[] = researchProjects.map((project) => ({
    id: project.slug,
    title: project.title,
    shortDescription: project.shortDescription || '',
  }));

  const themesPath = path.join(REVIEW_DIR, 'themes_for_publications.json');
  fs.writeFileSync(themesPath, JSON.stringify(themes, null, 2) + '\n', 'utf-8');
  console.log(`  ✓ themes_for_publications.json (${themes.length} themes)\n`);
}

/**
 * Main function
 */
function main(): void {
  console.log('Generating publication review JSON files...\n');

  // Ensure review directory exists
  if (!fs.existsSync(REVIEW_DIR)) {
    fs.mkdirSync(REVIEW_DIR, { recursive: true });
  }

  // Collect all publications
  const publications = collectPublicationsForReview();

  // Write batches
  writeBatches(publications);

  // Write index
  writeIndex(publications);

  // Write themes
  generateThemesJson();

  console.log('Done! ✓\n');
}

main();
