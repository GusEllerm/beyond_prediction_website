/* scripts/update_orcid_publications.ts */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { allPeople } from '../src/data/people.js';
import type { PersonPublication, PersonPublicationsSnapshot } from '../src/data/publications.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ORCID API configuration
const ORCID_API_BASE = process.env.ORCID_API_BASE ?? 'https://pub.orcid.org/v3.0';
const ORCID_PUBLIC_TOKEN = process.env.ORCID_PUBLIC_TOKEN;

interface OrcidWorkSummary {
  'put-code'?: number;
  path?: string;
  title?: {
    title?: { value?: string };
  };
  'external-ids'?: {
    'external-id'?: Array<{
      'external-id-type'?: string;
      'external-id-value'?: string;
    }>;
  };
  'publication-date'?: {
    year?: { value?: string };
  };
  'journal-title'?: { value?: string };
}

interface OrcidWorkGroup {
  'work-summary'?: OrcidWorkSummary[];
}

interface OrcidWorksResponse {
  group?: OrcidWorkGroup[];
  [key: string]: unknown;
}

// Basic rate limiting / politeness
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchOrcidWorks(orcidId: string): Promise<OrcidWorksResponse> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  if (ORCID_PUBLIC_TOKEN) {
    headers.Authorization = `Bearer ${ORCID_PUBLIC_TOKEN}`;
  } else {
    console.warn(
      `Warning: No ORCID_PUBLIC_TOKEN set. Making unauthenticated request for ${orcidId}.`
    );
  }

  const url = `${ORCID_API_BASE}/${orcidId}/works`;

  const response = await fetch(url, { headers });

  if (!response.ok) {
    throw new Error(`ORCID API error for ${orcidId}: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

function mapOrcidWorksToPublicationWorks(
  orcidId: string,
  json: OrcidWorksResponse
): PersonPublication[] {
  const groups = json.group ?? [];
  const works: PersonPublication[] = [];

  for (const group of groups) {
    const summaries = group['work-summary'] ?? [];

    for (const summary of summaries) {
      const putCode = summary['put-code'];

      const title =
        summary.title?.title?.value ?? summary.title?.subtitle?.value ?? 'Untitled work';

      const yearStr = summary['publication-date']?.year?.value;
      const year = yearStr ? Number.parseInt(yearStr, 10) : undefined;

      const venue = summary['journal-title']?.value;

      let doi: string | undefined;
      let openAccessUrl: string | undefined;

      const externalIds = summary['external-ids']?.['external-id'] ?? [];

      for (const ext of externalIds) {
        const type = (ext['external-id-type'] ?? '').toLowerCase();
        if (type === 'doi') {
          const value = String(ext['external-id-value'] ?? '').trim();
          if (value) {
            // Normalize DOI - remove any existing URL prefix to get canonical DOI
            const doiValue = value.replace(/^https?:\/\/doi\.org\//i, '');
            doi = doiValue;
            // Always create the DOI URL for openAccessUrl
            openAccessUrl = `https://doi.org/${doiValue}`;
            break;
          }
        }
      }

      works.push({
        id: `orcid:${orcidId}/work/${putCode}`,
        title,
        year: Number.isFinite(year) ? year : undefined,
        venue,
        doi,
        openAccessUrl,
      });
    }
  }

  return works;
}

async function main(): Promise<void> {
  const outputDir = path.join(__dirname, '..', 'src', 'data', 'publications', 'orcid');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Filter to people who have ORCID and want ORCID as their source
  const targets = allPeople.filter((p) => p.orcidId && p.publicationSource === 'orcid');

  console.log(
    `Found ${targets.length} people with ORCID as publication source. Fetching ORCID works...`
  );

  for (const person of targets) {
    try {
      console.log(`→ Fetching works for ${person.name} (${person.orcidId})`);

      const json = await fetchOrcidWorks(person.orcidId!);
      const works = mapOrcidWorksToPublicationWorks(person.orcidId!, json);

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

  console.log('Done updating ORCID publication snapshots.');
}

main().catch((error) => {
  console.error('Fatal error in update_orcid_publications:', error);
  process.exit(1);
});
