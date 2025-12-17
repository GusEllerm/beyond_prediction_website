#!/usr/bin/env tsx
/**
 * Script to create publication JSON files from metadata using alternative APIs
 * Falls back to manual metadata entry if APIs don't have the publication
 */

import { writeFileSync } from 'fs';
import { join } from 'path';

interface PublicationMetadata {
  title: string;
  authors: string[];
  year: number;
  venue: string;
  doi?: string;
  openAlexId?: string;
}

interface PublicationRecord {
  id?: string;
  title: string;
  year: number;
  venue: string;
  doi?: string;
  openAccessUrl?: string;
}

const PUBLICATIONS_DIR = join(process.cwd(), 'src/data/publications/doi');

/**
 * Try to find publication via CrossRef API
 */
async function searchCrossRef(
  title: string,
  _author?: string,
  year?: number
): Promise<PublicationRecord | null> {
  try {
    const query = `title:"${title}"${year ? `+year:${year}` : ''}`;
    const url = `https://api.crossref.org/works?query=${encodeURIComponent(query)}&rows=5`;

    const response = await fetch(url);
    if (!response.ok) return null;

    const data = (await response.json()) as {
      message?: {
        items?: Array<{
          title?: string[];
          DOI?: string;
          published?: { 'date-parts'?: number[][] };
          'container-title'?: string[];
          publisher?: string;
        }>;
      };
    };
    if (!data.message?.items || data.message.items.length === 0) return null;

    // Try to find best match
    const items = data.message.items;
    for (const item of items) {
      if (
        item.title &&
        item.title[0]?.toLowerCase().includes(title.toLowerCase().substring(0, 20))
      ) {
        const doi = item.DOI;
        if (!doi) continue;
        return {
          id: `https://openalex.org/W${doi.replace(/[^a-zA-Z0-9]/g, '')}`, // Generate a placeholder ID
          title: item.title[0],
          year: item.published?.['date-parts']?.[0]?.[0] || year || new Date().getFullYear(),
          venue: item['container-title']?.[0] || item['publisher'] || 'Unknown',
          doi: doi ? `https://doi.org/${doi}` : undefined,
          openAccessUrl: doi ? `https://doi.org/${doi}` : undefined,
        };
      }
    }
  } catch (error) {
    console.error('CrossRef API error:', error);
  }
  return null;
}

/**
 * Try to find publication via Semantic Scholar API
 */
async function searchSemanticScholar(
  title: string,
  author?: string,
  year?: number
): Promise<PublicationRecord | null> {
  try {
    const query = `${title}${author ? ` ${author.split(',')[0].trim()}` : ''}`;
    const url = `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(query)}&limit=5&fields=title,year,venue,authors,externalIds`;

    const response = await fetch(url);
    if (!response.ok) return null;

    const data = (await response.json()) as {
      data?: Array<{
        title?: string;
        year?: number;
        venue?: string;
        paperId?: string;
        externalIds?: { DOI?: string };
      }>;
    };
    if (!data.data || data.data.length === 0) return null;

    // Try to find best match
    for (const paper of data.data) {
      if (paper.title && paper.title.toLowerCase().includes(title.toLowerCase().substring(0, 20))) {
        const doi = paper.externalIds?.DOI;
        return {
          id: paper.paperId ? `https://openalex.org/W${paper.paperId}` : undefined,
          title: paper.title,
          year: paper.year || year || new Date().getFullYear(),
          venue: paper.venue || 'Unknown',
          doi: doi ? `https://doi.org/${doi}` : undefined,
          openAccessUrl: doi ? `https://doi.org/${doi}` : undefined,
        };
      }
    }
  } catch (error) {
    console.error('Semantic Scholar API error:', error);
  }
  return null;
}

/**
 * Create publication JSON file from metadata
 */
function createPublicationFile(
  metadata: PublicationMetadata,
  foundRecord?: PublicationRecord
): void {
  // Use found record if available, otherwise use metadata
  const record: PublicationRecord = foundRecord || {
    title: metadata.title,
    year: metadata.year,
    venue: metadata.venue,
    doi: metadata.doi,
    openAccessUrl: metadata.doi,
  };

  // Generate a filename from DOI or title
  let filename: string;
  if (record.doi) {
    filename =
      record.doi.replace(/^https?:\/\/(dx\.)?doi\.org\//i, '').replace(/[^a-zA-Z0-9]/g, '-') +
      '.json';
  } else {
    filename =
      record.title
        .toLowerCase()
        .replace(/[^a-zA-Z0-9\s]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 50) + `.json`;
  }

  const filepath = join(PUBLICATIONS_DIR, filename);

  // Remove the generated ID if we don't have a real one
  if (record.id && record.id.includes('placeholder')) {
    delete record.id;
  }

  writeFileSync(filepath, JSON.stringify(record, null, 2) + '\n');
  console.log(`✓ Created: ${filename}`);
  console.log(`  Title: ${record.title}`);
  console.log(`  Year: ${record.year}`);
  console.log(`  Venue: ${record.venue}`);
  if (record.doi) console.log(`  DOI: ${record.doi}`);
  console.log('');
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(
      'Usage: tsx create_publication_from_metadata.ts <publication-id> [title] [authors] [year] [venue] [doi]'
    );
    console.log('\nOr provide JSON metadata:');
    console.log(
      '  tsx create_publication_from_metadata.ts --json \'{"title":"...","authors":["..."],"year":2021,"venue":"..."}\''
    );
    process.exit(1);
  }

  // Define the publications we need
  const publications: Record<string, PublicationMetadata> = {
    pub10: {
      title:
        'MEWMA charts when parameters are estimated with applications in gene expression and bimetal thermostat monitoring',
      authors: ['Adegoke, N.A.', 'Smith, A.N.H.', 'Anderson, M.J.', 'Pawley, M.D.M.'],
      year: 2021,
      venue: 'Journal of Statistical Computation and Simulation',
    },
    pub38: {
      title: 'Learning to match product codes',
      authors: ['Excell, Y.', 'Link, S.'],
      year: 2022,
      venue:
        'Proceedings of the 35th ACM International Conference on Industrial, Engineering and Other Applications of Applied Intelligent Systems (IEA/AIE) 2022',
    },
    pub39: {
      title:
        'An explainability analysis of a sentiment prediction task using a transformer-based attention filter',
      authors: [
        'Neset Tan',
        'Joshua Bensemann',
        'Diana Benavides-Prado',
        'Yang Chen',
        'Mark Gahegan',
        'Lia Lee',
        'Alex Yuxuan Peng',
        'Patricia Riddle',
        'Michael Witbrock',
      ],
      year: 2021,
      venue: 'Proceedings of the Ninth Annual Conference on Advances in Cognitive Systems',
    },
    pub40: {
      title:
        'Inbreeding load in a small and managed population: two decades of Hihi/Stitchbird genomics',
      authors: ['Tan, H.Z.'],
      year: 2025,
      venue: 'Genetics Society of Australasia Conference, Auckland',
    },
    pub97: {
      title:
        'An explainability analysis of a sentiment prediction task using a transformer-based attention filter',
      authors: [
        'Neset Tan',
        'Joshua Bensemann',
        'Diana Benavides-Prado',
        'Yang Chen',
        'Mark Gahegan',
        'Lia Lee',
        'Alex Yuxuan Peng',
        'Patricia Riddle',
        'Michael Witbrock',
      ],
      year: 2021,
      venue: 'Proceedings of the Ninth Annual Conference on Advances in Cognitive Systems',
    },
  };

  const pubId = args[0];
  const metadata = publications[pubId];

  if (!metadata) {
    console.error(`Unknown publication ID: ${pubId}`);
    console.error('Available IDs: pub10, pub38, pub39');
    process.exit(1);
  }

  console.log(`Searching for metadata for ${pubId}: "${metadata.title}"\n`);

  // Try CrossRef first
  console.log('Trying CrossRef API...');
  const crossrefResult = await searchCrossRef(metadata.title, metadata.authors[0], metadata.year);
  if (crossrefResult) {
    console.log('✓ Found via CrossRef');
    createPublicationFile(metadata, crossrefResult);
    return;
  }

  // Try Semantic Scholar
  console.log('Trying Semantic Scholar API...');
  const ssResult = await searchSemanticScholar(metadata.title, metadata.authors[0], metadata.year);
  if (ssResult) {
    console.log('✓ Found via Semantic Scholar');
    createPublicationFile(metadata, ssResult);
    return;
  }

  // If not found, create from metadata
  console.log('⚠️  Not found in APIs, creating from provided metadata');
  createPublicationFile(metadata);
}

main().catch(console.error);
