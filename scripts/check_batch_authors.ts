/* scripts/check_batch_authors.ts
 *
 * This script checks publications from a batch JSON file against OpenAlex
 * to verify if author lists are complete.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { PublicationAuthor } from '../src/data/publications.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// OpenAlex API configuration
const OPENALEX_BASE_URL = 'https://api.openalex.org';
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

interface BatchPublication {
  doi: string;
  title: string;
  authors?: string[];
  year?: number;
  venue?: string;
  themeIds?: string[];
  notes?: string;
}

interface AuthorComparison {
  doi: string;
  title: string;
  jsonAuthors: number;
  openalexAuthors: number;
  missingAuthors: string[];
  jsonAuthorNames: string[];
  openalexAuthorNames: string[];
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Normalizes a DOI from various formats to a clean format
 */
function normalizeDoi(doi: string): string {
  return doi
    .replace(/^https?:\/\/(dx\.)?doi\.org\//i, '')
    .replace(/^doi:/i, '')
    .trim();
}

/**
 * Normalizes author names for comparison (lowercase, remove extra spaces)
 */
function normalizeAuthorName(name: string): string {
  return name.toLowerCase().replace(/\s+/g, ' ').trim();
}

/**
 * Fetches full author list from OpenAlex by DOI
 */
async function fetchAuthorsFromOpenAlex(doi: string): Promise<PublicationAuthor[] | null> {
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
        return null; // Publication not found
      }
      throw new Error(`OpenAlex API error: ${response.status} ${response.statusText}`);
    }

    const work = await response.json();

    if (!work.authorships || !Array.isArray(work.authorships)) {
      return [];
    }

    const authors: PublicationAuthor[] = work.authorships.map(
      (authorship: OpenAlexAuthorship, index: number) => {
        const author = authorship.author;
        const name = author?.display_name ?? authorship.raw_author_name ?? 'Unknown Author';

        let orcidId: string | undefined;
        if (author?.orcid) {
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

    return authors;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`  Error fetching ${doi}:`, errorMessage);
    return null;
  }
}

/**
 * Compares author lists and finds missing authors
 */
function compareAuthors(
  jsonAuthors: string[],
  openalexAuthors: PublicationAuthor[]
): {
  missingInJson: string[];
  jsonNormalized: string[];
  openalexNormalized: string[];
} {
  const jsonNormalized = jsonAuthors.map(normalizeAuthorName);
  const openalexNormalized = openalexAuthors.map((a) => normalizeAuthorName(a.name));

  // Find authors in OpenAlex that are not in JSON
  const missingInJson: string[] = [];
  for (const oaAuthor of openalexAuthors) {
    const normalized = normalizeAuthorName(oaAuthor.name);
    if (
      !jsonNormalized.some(
        (json) => json === normalized || json.includes(normalized) || normalized.includes(json)
      )
    ) {
      missingInJson.push(oaAuthor.name);
    }
  }

  return {
    missingInJson,
    jsonNormalized,
    openalexNormalized,
  };
}

/**
 * Main function
 */
async function main(): Promise<void> {
  const batchFileArg = process.argv[2];

  if (!batchFileArg) {
    console.error('Usage: tsx scripts/check_batch_authors.ts <batch-json-file>');
    console.error('');
    console.error('Example:');
    console.error(
      '  tsx scripts/check_batch_authors.ts src/data/publication-review/publications_batch_07.json'
    );
    process.exit(1);
  }

  const batchFilePath = path.isAbsolute(batchFileArg)
    ? batchFileArg
    : path.join(__dirname, '..', batchFileArg);

  if (!fs.existsSync(batchFilePath)) {
    console.error(`Error: File not found: ${batchFilePath}`);
    process.exit(1);
  }

  console.log(`Loading batch file: ${batchFilePath}\n`);

  const batchContent = fs.readFileSync(batchFilePath, 'utf-8');
  const batchPublications: BatchPublication[] = JSON.parse(batchContent);

  console.log(`Found ${batchPublications.length} publications to check\n`);

  const comparisons: AuthorComparison[] = [];
  const errors: Array<{ doi: string; title: string; error: string }> = [];

  for (let i = 0; i < batchPublications.length; i++) {
    const pub = batchPublications[i];
    const doi = normalizeDoi(pub.doi);

    console.log(
      `[${i + 1}/${batchPublications.length}] Checking: ${pub.title.substring(0, 60)}...`
    );

    const jsonAuthors = pub.authors || [];
    const openalexAuthors = await fetchAuthorsFromOpenAlex(doi);

    // Small delay to be polite to OpenAlex API
    await delay(300);

    if (openalexAuthors === null) {
      errors.push({
        doi: pub.doi,
        title: pub.title,
        error: 'Not found in OpenAlex',
      });
      console.log(`  ⚠️  Not found in OpenAlex\n`);
      continue;
    }

    if (openalexAuthors.length === 0) {
      errors.push({
        doi: pub.doi,
        title: pub.title,
        error: 'No authors found in OpenAlex',
      });
      console.log(`  ⚠️  No authors in OpenAlex\n`);
      continue;
    }

    const comparison = compareAuthors(jsonAuthors, openalexAuthors);

    if (comparison.missingInJson.length > 0) {
      comparisons.push({
        doi: pub.doi,
        title: pub.title,
        jsonAuthors: jsonAuthors.length,
        openalexAuthors: openalexAuthors.length,
        missingAuthors: comparison.missingInJson,
        jsonAuthorNames: jsonAuthors,
        openalexAuthorNames: openalexAuthors.map((a) => a.name),
      });

      console.log(`  ❌ Missing ${comparison.missingInJson.length} author(s):`);
      comparison.missingInJson.forEach((name) => {
        console.log(`     - ${name}`);
      });
      console.log(
        `  JSON: ${jsonAuthors.length} authors | OpenAlex: ${openalexAuthors.length} authors\n`
      );
    } else if (jsonAuthors.length < openalexAuthors.length) {
      console.log(
        `  ✅ All JSON authors found, but OpenAlex has more (${openalexAuthors.length} vs ${jsonAuthors.length})\n`
      );
    } else {
      console.log(`  ✅ Author lists match (${jsonAuthors.length} authors)\n`);
    }
  }

  // Generate summary report
  console.log('\n' + '='.repeat(80));
  console.log('SUMMARY');
  console.log('='.repeat(80));
  console.log(`Total publications checked: ${batchPublications.length}`);
  console.log(`Publications with missing authors: ${comparisons.length}`);
  console.log(`Publications with errors: ${errors.length}`);
  console.log(
    `Publications with complete author lists: ${batchPublications.length - comparisons.length - errors.length}`
  );

  if (comparisons.length > 0) {
    console.log('\n' + '='.repeat(80));
    console.log('PUBLICATIONS WITH MISSING AUTHORS');
    console.log('='.repeat(80));
    for (const comp of comparisons) {
      console.log(`\n${comp.title}`);
      console.log(`DOI: ${comp.doi}`);
      console.log(`JSON authors: ${comp.jsonAuthors} | OpenAlex authors: ${comp.openalexAuthors}`);
      console.log(`Missing authors:`);
      comp.missingAuthors.forEach((name) => {
        console.log(`  - ${name}`);
      });
    }
  }

  if (errors.length > 0) {
    console.log('\n' + '='.repeat(80));
    console.log('PUBLICATIONS WITH ERRORS');
    console.log('='.repeat(80));
    for (const err of errors) {
      console.log(`\n${err.title}`);
      console.log(`DOI: ${err.doi}`);
      console.log(`Error: ${err.error}`);
    }
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
