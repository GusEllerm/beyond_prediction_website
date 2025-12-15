/* scripts/apply_publication_mapping.ts */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { PersonPublication } from '../src/data/publications.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MAPPING_FILE = path.join(__dirname, '..', 'src', 'data', 'publication-review', 'publication_mapping.json');
const RESEARCH_PROJECTS_FILE = path.join(__dirname, '..', 'src', 'data', 'researchProjects.ts');
const PUBLICATIONS_DOI_DIR = path.join(__dirname, '..', 'src', 'data', 'publications', 'doi');
const PUBLICATIONS_OPENALEX_DIR = path.join(__dirname, '..', 'src', 'data', 'publications', 'openalex');
const PUBLICATIONS_ORCID_DIR = path.join(__dirname, '..', 'src', 'data', 'publications', 'orcid');

type PublicationMapping = {
  doi: string;
  themeIds: string[];
  notes?: string;
};

/**
 * Normalize DOI to various formats for matching
 */
function normalizeDoi(doi: string): string {
  return doi.replace(/^https?:\/\/(dx\.)?doi\.org\//i, '').replace(/^doi:/i, '').trim();
}

/**
 * Load the publication mapping JSON
 */
function loadMapping(): PublicationMapping[] {
  const content = fs.readFileSync(MAPPING_FILE, 'utf-8');
  return JSON.parse(content);
}

/**
 * Load all publications and create a lookup by DOI
 */
function loadPublicationLookup(): Map<string, PersonPublication> {
  const lookup = new Map<string, PersonPublication>();

  // Load from DOI directory
  if (fs.existsSync(PUBLICATIONS_DOI_DIR)) {
    const files = fs.readdirSync(PUBLICATIONS_DOI_DIR).filter((f) => f.endsWith('.json'));
    for (const file of files) {
      try {
        const content = fs.readFileSync(path.join(PUBLICATIONS_DOI_DIR, file), 'utf-8');
        const pub: PersonPublication = JSON.parse(content);
        
        // Index by DOI
        if (pub.doi) {
          const normalized = normalizeDoi(pub.doi);
          lookup.set(normalized, pub);
          lookup.set(`https://doi.org/${normalized}`, pub);
          lookup.set(`http://dx.doi.org/${normalized}`, pub);
        }
        // Index by ID
        if (pub.id) {
          lookup.set(pub.id, pub);
        }
      } catch (error) {
        console.error(`Error reading ${file}:`, error);
      }
    }
  }

  // Load from OpenAlex snapshots
  if (fs.existsSync(PUBLICATIONS_OPENALEX_DIR)) {
    const files = fs.readdirSync(PUBLICATIONS_OPENALEX_DIR).filter((f) => f.endsWith('.json'));
    for (const file of files) {
      try {
        const content = fs.readFileSync(path.join(PUBLICATIONS_OPENALEX_DIR, file), 'utf-8');
        const snapshot: { works: PersonPublication[] } = JSON.parse(content);
        if (snapshot?.works) {
          for (const work of snapshot.works) {
            if (work.doi) {
              const normalized = normalizeDoi(work.doi);
              if (!lookup.has(normalized)) {
                lookup.set(normalized, work);
                lookup.set(`https://doi.org/${normalized}`, work);
              }
            }
            if (work.id) {
              if (!lookup.has(work.id)) {
                lookup.set(work.id, work);
              }
            }
          }
        }
      } catch (error) {
        console.error(`Error reading ${file}:`, error);
      }
    }
  }

  return lookup;
}

/**
 * Map DOIs to publicationIds using the publication lookup
 */
function mapDoisToPublicationIds(mapping: PublicationMapping[]): Map<string, string[]> {
  // Group by themeId
  const themeToPublicationIds = new Map<string, Set<string>>();
  const publicationLookup = loadPublicationLookup();

  for (const entry of mapping) {
    // If no themeIds, assign to 'unassigned-publications'
    const themeIds = entry.themeIds.length === 0 ? ['unassigned-publications'] : entry.themeIds;

    // Try to find the publication by DOI
    const normalizedDoi = normalizeDoi(entry.doi);
    let publicationId: string | undefined;

    // Try various DOI formats
    const doiVariants = [
      normalizedDoi,
      `https://doi.org/${normalizedDoi}`,
      `http://dx.doi.org/${normalizedDoi}`,
      entry.doi, // original format
    ];

    for (const doiVariant of doiVariants) {
      const pub = publicationLookup.get(doiVariant);
      if (pub) {
        // Prefer OpenAlex ID, fallback to DOI URL, then custom ID
        if (pub.id) {
          publicationId = pub.id;
        } else if (pub.doi) {
          publicationId = `https://doi.org/${normalizeDoi(pub.doi)}`;
        }
        break;
      }
    }

    // If not found, use the DOI itself (might be a custom ID or not yet in the system)
    if (!publicationId) {
      publicationId = entry.doi.startsWith('http') ? entry.doi : `https://doi.org/${entry.doi}`;
    }

    // Add this publication to each theme it belongs to
    for (const themeId of themeIds) {
      if (!themeToPublicationIds.has(themeId)) {
        themeToPublicationIds.set(themeId, new Set());
      }
      themeToPublicationIds.get(themeId)!.add(publicationId);
    }
  }

  // Convert Sets to arrays
  const result = new Map<string, string[]>();
  for (const [themeId, pubIds] of themeToPublicationIds.entries()) {
    result.set(themeId, Array.from(pubIds).sort());
  }

  return result;
}

/**
 * Read researchProjects.ts and add publicationIds arrays to projects
 */
function applyMappingToResearchProjects(themeToPublicationIds: Map<string, string[]>): void {
  let content = fs.readFileSync(RESEARCH_PROJECTS_FILE, 'utf-8');

  // For each theme, find the corresponding project and add publicationIds
  for (const [themeId, publicationIds] of themeToPublicationIds.entries()) {
    // Match theme ID to project slug
    const projectSlug = themeId;

    // Find the project block - look for the slug line
    const slugPattern = new RegExp(`slug:\\s*['"]${projectSlug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`, 'g');
    const slugMatch = content.match(slugPattern);
    
    if (!slugMatch || slugMatch.length === 0) {
      console.warn(`Could not find project with slug: ${projectSlug}`);
      continue;
    }

    // Find the position after the slug line
    const slugPos = content.indexOf(slugMatch[0]);
    if (slugPos === -1) continue;

    // Find the opening brace of this project object
    let projectStart = slugPos;
    for (let i = slugPos; i >= 0; i--) {
      if (content[i] === '{') {
        projectStart = i;
        break;
      }
    }

    // Find the closing brace of this project object
    let braceCount = 0;
    let projectEnd = -1;
    
    for (let i = projectStart; i < content.length; i++) {
      const char = content[i];
      if (char === '{') {
        braceCount++;
      } else if (char === '}') {
        braceCount--;
        if (braceCount === 0) {
          projectEnd = i;
          break;
        }
      }
    }

    if (projectEnd === -1) {
      console.warn(`Could not find closing brace for project: ${projectSlug}`);
      continue;
    }

    const projectContent = content.substring(projectStart, projectEnd + 1);

    // Check if publicationIds already exists in this project
    if (projectContent.includes('publicationIds:')) {
      // Replace existing publicationIds - find the array pattern
      const pubIdsPattern = /publicationIds:\s*\[[\s\S]*?\]/;
      const indent = '    '; // 4 spaces
      const replacement = `publicationIds: [\n${indent}  ${publicationIds.map(id => `'${id.replace(/'/g, "\\'")}'`).join(`,\n${indent}  `)},\n${indent}]`;
      
      const updatedProject = projectContent.replace(pubIdsPattern, replacement);
      content = content.substring(0, projectStart) + updatedProject + content.substring(projectEnd + 1);
    } else {
      // Add publicationIds before the closing brace
      // Find where to insert - before the closing brace, after examples array if it exists
      let insertPos = projectEnd;
      
      // Try to insert after examples array if it exists
      const examplesMatch = projectContent.match(/examples:\s*\[[\s\S]*?\],?\s*$/);
      if (examplesMatch && examplesMatch.index !== undefined) {
        insertPos = projectStart + examplesMatch.index + examplesMatch[0].length;
      } else {
        // Otherwise, insert before the closing brace
        insertPos = projectEnd;
      }

      const indent = '    '; // 4 spaces
      const pubIdsBlock = `,\n${indent}publicationIds: [\n${indent}  ${publicationIds.map(id => `'${id.replace(/'/g, "\\'")}'`).join(`,\n${indent}  `)},\n${indent}]`;
      content = content.substring(0, insertPos) + pubIdsBlock + content.substring(insertPos);
    }
  }

  fs.writeFileSync(RESEARCH_PROJECTS_FILE, content, 'utf-8');
}

/**
 * Main function
 */
function main(): void {
  console.log('Loading publication mapping...');
  const mapping = loadMapping();
  console.log(`Loaded ${mapping.length} publication mappings`);

  console.log('\nMapping DOIs to publicationIds...');
  const themeToPublicationIds = mapDoisToPublicationIds(mapping);
  
  console.log('\nTheme to publication counts:');
  for (const [themeId, pubIds] of themeToPublicationIds.entries()) {
    console.log(`  ${themeId}: ${pubIds.length} publications`);
  }

  console.log('\nApplying mapping to researchProjects.ts...');
  applyMappingToResearchProjects(themeToPublicationIds);
  
  console.log('\nDone! ✓');
}

main();
