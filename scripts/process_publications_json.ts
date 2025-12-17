/* scripts/process_publications_json.ts */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface PublicationInput {
  id: string;
  type: string;
  authors: string;
  year: number;
  title: string;
  venue: string;
  volume: string | null;
  issue: string | null;
  pages: string | null;
  doi: string | null;
  projects: string[];
}

interface PublicationsData {
  publications: PublicationInput[];
}

// Normalize DOI to filename format
function doiToSlug(doi: string): string {
  return doi
    .replace(/^https?:\/\/(dx\.)?doi\.org\//i, '')
    .replace(/^doi:/i, '')
    .replace(/[/:.]/g, '-')
    .toLowerCase()
    .trim();
}

// Check if publication file exists
function publicationExists(doi: string): boolean {
  const slug = doiToSlug(doi);
  const filePath = path.join(__dirname, '..', 'src', 'data', 'publications', 'doi', `${slug}.json`);
  return fs.existsSync(filePath);
}

// Get publication ID from existing file
function getPublicationIdFromFile(doi: string): string | null {
  const slug = doiToSlug(doi);
  const filePath = path.join(__dirname, '..', 'src', 'data', 'publications', 'doi', `${slug}.json`);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const pub = JSON.parse(content);
    return pub.id || null;
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return null;
  }
}

// Try to find DOI using OpenAlex API by title and year
async function findDoiByTitle(title: string, year: number): Promise<string | null> {
  const encodedTitle = encodeURIComponent(title);
  const url = `https://api.openalex.org/works?search=${encodedTitle}&filter=publication_year:${year}&per-page=1`;

  try {
    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) return null;

    const data = (await response.json()) as {
      results?: Array<{
        title?: string;
        doi?: string;
      }>;
    };
    if (data.results && data.results.length > 0) {
      const work = data.results[0];
      // Check if title is similar (fuzzy match)
      const resultTitle = (work.title || '').toLowerCase();
      const searchTitle = title.toLowerCase();
      if (
        resultTitle.includes(searchTitle.substring(0, 30)) ||
        searchTitle.includes(resultTitle.substring(0, 30))
      ) {
        if (work.doi) {
          const cleanDoi = work.doi.replace(/^https?:\/\/(dx\.)?doi\.org\//i, '');
          return `https://doi.org/${cleanDoi}`;
        }
      }
    }
  } catch (error) {
    console.error(`Error searching for DOI: ${error}`);
  }

  return null;
}

// Map project slugs - some map to the same project
const PROJECT_SLUG_MAP: Record<string, string> = {
  'infectious-disease-phylodynamics': 'biodiversity-ecology-biosecurity',
};

async function main(): Promise<void> {
  // Read the JSON file from stdin or a file path
  const jsonPath = process.argv[2];
  if (!jsonPath) {
    console.error('Usage: tsx scripts/process_publications_json.ts <path-to-json-file>');
    process.exit(1);
  }

  const jsonContent = fs.readFileSync(jsonPath, 'utf-8');
  const data: PublicationsData = JSON.parse(jsonContent);

  console.log(`Processing ${data.publications.length} publications...\n`);

  const results = {
    found: [] as string[],
    added: [] as string[],
    foundDois: [] as Array<{ id: string; title: string; foundDoi: string }>,
    linked: [] as Array<{ id: string; project: string; pubId: string }>,
    errors: [] as Array<{ id: string; title: string; error: string }>,
  };

  for (const pub of data.publications) {
    console.log(`\nProcessing: ${pub.title}`);
    console.log(`  Projects: ${pub.projects.join(', ')}`);

    let doi = pub.doi;
    let pubId: string | null = null;

    // Step 1: Handle DOI
    if (!doi) {
      console.log(`  No DOI provided, searching...`);
      const foundDoi = await findDoiByTitle(pub.title, pub.year);
      if (foundDoi) {
        doi = foundDoi;
        results.foundDois.push({ id: pub.id, title: pub.title, foundDoi: doi });
        console.log(`  ✓ Found DOI: ${doi}`);
      } else {
        console.log(`  ✗ Could not find DOI`);
        results.errors.push({ id: pub.id, title: pub.title, error: 'No DOI found or provided' });
        continue;
      }
    }

    // Step 2: Check if publication exists
    if (doi && publicationExists(doi)) {
      console.log(`  ✓ Publication already exists`);
      pubId = getPublicationIdFromFile(doi);
      results.found.push(pub.id);
    } else if (doi) {
      // Step 3: Add publication using script
      console.log(`  Adding publication with DOI: ${doi}`);
      try {
        execSync(`npm run add:doi -- "${doi}"`, {
          stdio: 'inherit',
          cwd: path.join(__dirname, '..'),
        });
        pubId = getPublicationIdFromFile(doi);
        results.added.push(pub.id);
        console.log(`  ✓ Added publication`);
      } catch (error) {
        console.error(`  ✗ Failed to add publication:`, error);
        results.errors.push({ id: pub.id, title: pub.title, error: `Failed to add: ${error}` });
        continue;
      }
    }

    if (!pubId) {
      console.log(`  ⚠️  Could not get publication ID`);
      continue;
    }

    // Step 4: Link to projects
    const researchProjectsPath = path.join(__dirname, '..', 'src', 'data', 'researchProjects.ts');
    let projectsContent = fs.readFileSync(researchProjectsPath, 'utf-8');

    // Normalize project slugs (handle mappings)
    const normalizedProjects = pub.projects.map((slug) => PROJECT_SLUG_MAP[slug] || slug);
    const uniqueProjects = [...new Set(normalizedProjects)];

    for (const projectSlug of uniqueProjects) {
      // Find the project in the file
      const projectMatch = projectsContent.match(
        new RegExp(`slug:\\s*['"]${projectSlug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`, 's')
      );

      if (!projectMatch) {
        console.log(`  ⚠️  Project "${projectSlug}" not found in researchProjects.ts`);
        continue;
      }

      // Check if publication ID is already in the project's publicationIds
      const projectStart = projectMatch.index!;
      const projectEnd = projectsContent.indexOf('\n  },', projectStart);
      const projectSection = projectsContent.substring(
        projectStart,
        projectEnd !== -1 ? projectEnd : undefined
      );

      const publicationId = pubId.startsWith('https://') ? pubId : `https://openalex.org/${pubId}`;

      if (projectSection.includes(publicationId)) {
        console.log(`  ✓ Already linked to ${projectSlug}`);
      } else {
        // Add to publicationIds array
        const pubIdsMatch = projectSection.match(/publicationIds:\s*\[([^\]]*)\]/s);
        if (pubIdsMatch) {
          // Append to existing array
          const existingIds = pubIdsMatch[1].trim();
          const newIds = existingIds
            ? `${existingIds}\n      '${publicationId}',`
            : `\n      '${publicationId}',`;
          projectsContent = projectsContent.replace(
            pubIdsMatch[0],
            `publicationIds: [${newIds}\n    ]`
          );
          console.log(`  ✓ Linked to ${projectSlug}`);
          results.linked.push({ id: pub.id, project: projectSlug, pubId: publicationId });
        } else {
          // Add new publicationIds array
          const insertPos = projectSection.lastIndexOf('\n  },');
          if (insertPos !== -1) {
            const beforeComma = projectSection.substring(0, insertPos);
            const newSection =
              beforeComma + `,\n    publicationIds: [\n      '${publicationId}',\n    ],\n  },`;
            projectsContent = projectsContent.replace(projectSection, newSection);
            console.log(`  ✓ Added publicationIds array to ${projectSlug}`);
            results.linked.push({ id: pub.id, project: projectSlug, pubId: publicationId });
          }
        }
      }
    }

    // Write back the updated researchProjects.ts
    fs.writeFileSync(researchProjectsPath, projectsContent, 'utf-8');
  }

  // Summary
  console.log('\n\n=== SUMMARY ===\n');
  console.log(`Found existing: ${results.found.length}`);
  console.log(`Added new: ${results.added.length}`);
  console.log(`Found DOIs: ${results.foundDois.length}`);
  if (results.foundDois.length > 0) {
    console.log('\nDOIs found:');
    for (const item of results.foundDois) {
      console.log(`  ${item.id}: ${item.foundDoi}`);
    }
  }
  console.log(`Linked to projects: ${results.linked.length}`);
  console.log(`Errors: ${results.errors.length}`);
  if (results.errors.length > 0) {
    console.log('\nErrors:');
    for (const error of results.errors) {
      console.log(`  ${error.id} (${error.title}): ${error.error}`);
    }
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
