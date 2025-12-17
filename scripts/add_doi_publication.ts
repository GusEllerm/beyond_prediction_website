/* scripts/add_doi_publication.ts */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { PersonPublication } from '../src/data/publications.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// OpenAlex API configuration
const OPENALEX_BASE_URL = 'https://api.openalex.org';
const CONTACT_EMAIL = process.env.OPENALEX_CONTACT_EMAIL ?? '';

/**
 * Normalizes a DOI from various formats to a clean format
 * Handles formats like:
 * - http://dx.doi.org/10.13140/RG.2.2.34953.97123
 * - https://doi.org/10.13140/RG.2.2.34953.97123
 * - doi:10.13140/RG.2.2.34953.97123
 * - 10.13140/RG.2.2.34953.97123
 */
function normalizeDoi(doi: string): string {
  // Remove URL prefixes
  const cleanDoi = doi
    .replace(/^https?:\/\/(dx\.)?doi\.org\//i, '')
    .replace(/^doi:/i, '')
    .trim();

  return cleanDoi;
}

/**
 * Fetches publication data from OpenAlex by DOI
 */
async function fetchPublicationByDoi(doi: string): Promise<PersonPublication | null> {
  const cleanDoi = normalizeDoi(doi);
  const doiUrl = `https://doi.org/${cleanDoi}`;

  const url = `${OPENALEX_BASE_URL}/works/${encodeURIComponent(doiUrl)}${CONTACT_EMAIL ? `?mailto=${encodeURIComponent(CONTACT_EMAIL)}` : ''}`;

  try {
    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Publication not found in OpenAlex for DOI: ${cleanDoi}`);
      }
      throw new Error(`OpenAlex API error: ${response.status} ${response.statusText}`);
    }

    const work = await response.json();

    const id: string = work.id ?? '';

    const title: string = work.title ?? work.display_name ?? 'Untitled work';

    const year: number | undefined =
      typeof work.publication_year === 'number' ? work.publication_year : undefined;

    // Try to extract venue/source
    const venue: string | undefined =
      work.primary_location?.source?.display_name ??
      work.primary_location?.host_venue?.display_name ??
      undefined;

    // Extract DOI (normalize to clean format)
    const doiValue: string | undefined = work.doi ? normalizeDoi(work.doi) : cleanDoi;

    // Best open access URL (if any)
    const openAccessUrl: string | undefined =
      work.open_access?.oa_url ??
      work.primary_location?.landing_page_url ??
      (doiValue ? `https://doi.org/${doiValue}` : undefined);

    return {
      id,
      title,
      year,
      venue,
      doi: doiValue,
      openAccessUrl,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Unknown error fetching publication: ${String(error)}`);
  }
}

/**
 * Generates a filename-safe slug from DOI
 */
function doiToSlug(doi: string): string {
  const cleanDoi = normalizeDoi(doi);
  // Replace slashes and special characters with hyphens
  return cleanDoi.replace(/[/:.]/g, '-').toLowerCase();
}

/**
 * Main function
 */
async function main(): Promise<void> {
  const doiArg = process.argv[2];

  if (!doiArg) {
    console.error('Usage: tsx scripts/add_doi_publication.ts <doi>');
    console.error('');
    console.error('Examples:');
    console.error(
      '  tsx scripts/add_doi_publication.ts http://dx.doi.org/10.13140/RG.2.2.34953.97123'
    );
    console.error('  tsx scripts/add_doi_publication.ts 10.13140/RG.2.2.34953.97123');
    process.exit(1);
  }

  const outputDir = path.join(__dirname, '..', 'src', 'data', 'publications', 'doi');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  try {
    console.log(`Fetching publication data for DOI: ${doiArg}`);

    const publication = await fetchPublicationByDoi(doiArg);

    if (!publication) {
      console.error('Failed to fetch publication data');
      process.exit(1);
    }

    console.log(`\nFound publication:`);
    console.log(`  Title: ${publication.title}`);
    console.log(`  Year: ${publication.year ?? 'N/A'}`);
    console.log(`  Venue: ${publication.venue ?? 'N/A'}`);
    console.log(`  DOI: ${publication.doi ?? 'N/A'}`);
    console.log(`  OpenAlex ID: ${publication.id}`);

    // Save as JSON file using DOI slug as filename
    const slug = doiToSlug(doiArg);
    const outPath = path.join(outputDir, `${slug}.json`);

    fs.writeFileSync(outPath, JSON.stringify(publication, null, 2), 'utf-8');

    console.log(`\n✓ Saved publication to: ${outPath}`);
    console.log(
      `\nTo use this publication in an example, add its OpenAlex ID to the example's publicationIds:`
    );
    console.log(`  publicationIds: ['${publication.id}']`);
    console.log(`\nOr if you want to use the DOI directly, you can also use:`);
    console.log(`  publicationIds: ['https://doi.org/${publication.doi}']`);
  } catch (error) {
    console.error('\nError:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
