/* scripts/update_openalex_publications.ts */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { allPeople, type Person } from '../src/data/people.js';
import type {
  PersonPublication,
  PersonPublicationsSnapshot,
} from '../src/data/publications.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Basic rate limiting / politeness
const OPENALEX_BASE_URL = 'https://api.openalex.org';
const MAX_WORKS_PER_PERSON = 30;

// Optional: set your email here to be polite to OpenAlex
const CONTACT_EMAIL = process.env.OPENALEX_CONTACT_EMAIL ?? '';

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchJson(url: string): Promise<any> {
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

  return response.json();
}

async function fetchWorksForPerson(
  person: Person
): Promise<PersonPublication[]> {
  if (!person.orcidId) return [];

  const orcid = person.orcidId;
  // Filter works by authorships.author.orcid, sorted by publication_year desc
  // OpenAlex expects the full ORCID URL format
  const orcidUrl = `https://orcid.org/${orcid}`;
  const url = `${OPENALEX_BASE_URL}/works?filter=authorships.author.orcid:${encodeURIComponent(
    orcidUrl
  )}&per-page=${MAX_WORKS_PER_PERSON}&sort=publication_year:desc`;

  const data = await fetchJson(url);

  const results = Array.isArray(data.results) ? data.results : [];

  const works: PersonPublication[] = results.map((w: any) => {
    const id: string = w.id ?? '';

    const title: string = w.title ?? w.display_name ?? 'Untitled work';

    const year: number | undefined =
      typeof w.publication_year === 'number' ? w.publication_year : undefined;

    // Try to extract venue/source
    const venue: string | undefined =
      w.primary_location?.source?.display_name ??
      w.primary_location?.host_venue?.display_name ??
      undefined;

    // Try to extract DOI
    const doi: string | undefined = w.doi ?? undefined;

    // Best open access URL (if any)
    const openAccessUrl: string | undefined =
      w.open_access?.oa_url ??
      w.primary_location?.landing_page_url ??
      w.primary_location?.pdf_url ??
      undefined;

    return {
      id,
      title,
      year,
      venue,
      doi,
      openAccessUrl,
    };
  });

  return works;
}

async function main(): Promise<void> {
  const outputDir = path.join(__dirname, '..', 'src', 'data', 'publications', 'openalex');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const peopleWithOrcid = allPeople.filter((p) => p.orcidId);

  console.log(
    `Found ${peopleWithOrcid.length} people with ORCID. Fetching OpenAlex works...`
  );

  for (const person of peopleWithOrcid) {
    try {
      console.log(`→ Fetching works for ${person.name} (${person.orcidId})`);

      const works = await fetchWorksForPerson(person);

      const snapshot: PersonPublicationsSnapshot = {
        slug: person.slug,
        orcidId: person.orcidId,
        updatedAt: new Date().toISOString(),
        works,
      };

      const outPath = path.join(outputDir, `${person.slug}.json`);
      fs.writeFileSync(outPath, JSON.stringify(snapshot, null, 2), 'utf-8');

      console.log(`   Saved ${works.length} works to ${outPath}`);
    } catch (error) {
      console.error(`   Error fetching works for ${person.name}:`, error);
    }

    // Small delay between requests to be polite
    await delay(1000);
  }

  console.log('Done updating OpenAlex publication snapshots.');
}

main().catch((error) => {
  console.error('Fatal error in update_openalex_publications:', error);
  process.exit(1);
});

