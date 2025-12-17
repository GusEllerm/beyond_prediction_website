/* scripts/enrich_publications_with_authors.ts
 *
 * This script enriches publication data with author information from OpenAlex API.
 * It fetches full work details for publications that have OpenAlex IDs and extracts
 * author information, then updates the publication files.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { allPeople } from '../src/data/people.js';
import type {
  PersonPublication,
  PublicationAuthor,
  PersonPublicationsSnapshot,
} from '../src/data/publications.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Basic rate limiting / politeness
const OPENALEX_BASE_URL = 'https://api.openalex.org';

// Optional: set your email here to be polite to OpenAlex
const CONTACT_EMAIL = process.env.OPENALEX_CONTACT_EMAIL ?? '';

interface OpenAlexAuthor {
  id?: string;
  display_name?: string;
  orcid?: string;
}

interface OpenAlexAuthorship {
  author: OpenAlexAuthor | null;
  raw_author_name?: string;
}

interface OpenAlexWork {
  authorships?: OpenAlexAuthorship[];
  [key: string]: unknown;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchJson(url: string): Promise<OpenAlexWork> {
  const fullUrl = CONTACT_EMAIL
    ? `${url}${url.includes('?') ? '&' : '?'}mailto=${encodeURIComponent(CONTACT_EMAIL)}`
    : url;

  const response = await fetch(fullUrl, {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`OpenAlex error ${response.status} for ${fullUrl}`);
  }

  return response.json() as Promise<OpenAlexWork>;
}

/**
 * Extracts OpenAlex work ID from various formats
 */
function extractOpenAlexId(idOrUrl: string): string | null {
  // Handle OpenAlex URLs
  if (idOrUrl.startsWith('https://openalex.org/')) {
    return idOrUrl;
  }
  // Handle just the ID part (e.g., "W12345")
  if (idOrUrl.startsWith('W') && /^W\d+$/.test(idOrUrl)) {
    return `https://openalex.org/${idOrUrl}`;
  }
  return null;
}

/**
 * Fetches full work details from OpenAlex API including authors
 */
async function fetchWorkWithAuthors(
  workId: string
): Promise<{ authors: PublicationAuthor[] } | null> {
  const openAlexId = extractOpenAlexId(workId);
  if (!openAlexId) {
    return null;
  }

  try {
    // Fetch work with authorships data
    // OpenAlex API: use /works/{id} endpoint, authorships are included by default
    const workIdPart = openAlexId.replace('https://openalex.org/', '');
    const url = `${OPENALEX_BASE_URL}/works/${workIdPart}`;
    const work = await fetchJson(url);

    if (!work.authorships || !Array.isArray(work.authorships)) {
      return { authors: [] };
    }

    const authors: PublicationAuthor[] = work.authorships.map(
      (authorship: OpenAlexAuthorship, index: number) => {
        const author = authorship.author;
        const name = author?.display_name ?? authorship.raw_author_name ?? 'Unknown Author';

        // Extract ORCID ID if available
        let orcidId: string | undefined;
        if (author?.orcid) {
          // OpenAlex returns ORCID as full URL, extract just the ID
          const orcidMatch = author.orcid.match(/orcid\.org\/(\d{4}-\d{4}-\d{4}-\d{4})/);
          if (orcidMatch) {
            orcidId = orcidMatch[1];
          }
        }

        return {
          name,
          orcidId,
          openAlexId: author?.id,
          position: index + 1,
        };
      }
    );

    return { authors };
  } catch (error: unknown) {
    // Check if it's an HTML response (rate limiting or error page)
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('<!doctype') || errorMessage.includes('Unexpected token')) {
      console.error(
        `  OpenAlex returned HTML instead of JSON for ${workId} (likely rate limited or invalid ID)`
      );
      return null;
    }
    console.error(`  Error fetching work ${workId}:`, errorMessage);
    return null;
  }
}

/**
 * Enriches a single publication with author data
 */
async function enrichPublication(publication: PersonPublication): Promise<PersonPublication> {
  // If already has authors, skip
  if (publication.authors && publication.authors.length > 0) {
    return publication;
  }

  // Only enrich if we have an OpenAlex ID
  if (!publication.id || !publication.id.includes('openalex.org')) {
    return publication;
  }

  console.log(`  Enriching: ${publication.title.substring(0, 60)}...`);
  const authorData = await fetchWorkWithAuthors(publication.id);

  if (authorData && authorData.authors.length > 0) {
    return {
      ...publication,
      authors: authorData.authors,
    };
  }

  return publication;
}

/**
 * Enriches publications in an ORCID snapshot with the snapshot owner as author
 */
function enrichOrcidSnapshot(
  snapshot: PersonPublicationsSnapshot,
  personSlug: string,
  orcidId?: string
): void {
  if (!snapshot.works || !Array.isArray(snapshot.works)) {
    return;
  }

  // Find the person in the people data
  const person = allPeople.find((p) => p.slug === personSlug);
  const authorName = person?.name || personSlug;

  for (const work of snapshot.works) {
    // If work doesn't have authors, add the snapshot owner as an author
    if (!work.authors || work.authors.length === 0) {
      work.authors = [
        {
          name: authorName,
          orcidId: orcidId,
          position: 1, // We don't know the actual position, so default to 1
        },
      ];
    } else {
      // If authors exist, check if snapshot owner is already in the list
      const hasOwner = work.authors.some((a: PublicationAuthor) => a.orcidId === orcidId);
      if (!hasOwner && orcidId) {
        // Add snapshot owner if not already present
        work.authors.push({
          name: authorName,
          orcidId: orcidId,
          position: work.authors.length + 1,
        });
      }
    }
  }
}

/**
 * Processes all publications in a directory
 */
async function processPublicationsInDirectory(
  dirPath: string,
  isSnapshot: boolean = false,
  isOrcid: boolean = false
): Promise<void> {
  const files = fs.readdirSync(dirPath).filter((f) => f.endsWith('.json'));

  for (const file of files) {
    const filePath = path.join(dirPath, file);
    console.log(`\nProcessing ${file}...`);

    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(content);

      if (isSnapshot) {
        // Handle snapshot files (openalex/*.json, orcid/*.json)
        if (data.works && Array.isArray(data.works)) {
          // For ORCID snapshots, enrich with snapshot owner as author
          if (isOrcid && data.slug && data.orcidId) {
            enrichOrcidSnapshot(data, data.slug, data.orcidId);
          }

          const enrichedWorks: PersonPublication[] = [];
          for (const work of data.works) {
            // Only fetch from OpenAlex if it's an OpenAlex work and doesn't have authors
            if (work.id?.includes('openalex.org') && (!work.authors || work.authors.length === 0)) {
              const enriched = await enrichPublication(work);
              enrichedWorks.push(enriched);
              // Small delay between API calls
              await delay(300); // Increased delay to avoid rate limiting
            } else {
              enrichedWorks.push(work);
            }
          }
          data.works = enrichedWorks;
          fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
          console.log(`  Updated ${enrichedWorks.length} works`);
        }
      } else {
        // Handle individual publication files (doi/*.json)
        const enriched = await enrichPublication(data);
        fs.writeFileSync(filePath, JSON.stringify(enriched, null, 2), 'utf-8');
        console.log(`  Updated publication`);
        await delay(300); // Increased delay
      }
    } catch (error) {
      console.error(`  Error processing ${file}:`, error);
    }
  }
}

async function main(): Promise<void> {
  const baseDir = path.join(__dirname, '..', 'src', 'data', 'publications');

  console.log('Enriching publications with author information...\n');

  // Process OpenAlex snapshots
  const openAlexDir = path.join(baseDir, 'openalex');
  if (fs.existsSync(openAlexDir)) {
    console.log('Processing OpenAlex snapshots...');
    await processPublicationsInDirectory(openAlexDir, true);
  }

  // Process ORCID snapshots
  const orcidDir = path.join(baseDir, 'orcid');
  if (fs.existsSync(orcidDir)) {
    console.log('\nProcessing ORCID snapshots...');
    await processPublicationsInDirectory(orcidDir, true, true);
  }

  // Process individual DOI publications
  const doiDir = path.join(baseDir, 'doi');
  if (fs.existsSync(doiDir)) {
    console.log('\nProcessing DOI publications...');
    await processPublicationsInDirectory(doiDir, false);
  }

  console.log('\nDone enriching publications with authors.');
}

main().catch((error) => {
  console.error('Fatal error in enrich_publications_with_authors:', error);
  process.exit(1);
});
