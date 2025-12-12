/* scripts/cross_reference_publications_people.ts
 * 
 * This script demonstrates the cross-referencing of publications with people.
 * It loads all publications, matches authors to people, and generates a report.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { allPeople, type Person } from '../src/data/people.js';
import { researchProjects } from '../src/data/researchProjects.js';
import type { PersonPublication, PersonPublicationsSnapshot } from '../src/data/publications.js';
import {
  getPublicationAuthors,
  createPublicationToAuthorsMap,
  createPersonToPublicationsMap,
} from '../src/utils/authorMatching.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Loads all publications from the data directory
 */
function loadAllPublications(): PersonPublication[] {
  const allPublications: PersonPublication[] = [];
  const seenIds = new Set<string>();
  const baseDir = path.join(__dirname, '..', 'src', 'data', 'publications');

  // Load OpenAlex snapshots
  const openAlexDir = path.join(baseDir, 'openalex');
  if (fs.existsSync(openAlexDir)) {
    const files = fs.readdirSync(openAlexDir).filter((f) => f.endsWith('.json'));
    for (const file of files) {
      try {
        const content = fs.readFileSync(path.join(openAlexDir, file), 'utf-8');
        const snapshot: PersonPublicationsSnapshot = JSON.parse(content);
        if (snapshot.works) {
          for (const work of snapshot.works) {
            if (work.id && !seenIds.has(work.id)) {
              allPublications.push(work);
              seenIds.add(work.id);
            }
          }
        }
      } catch (error) {
        console.error(`Error loading ${file}:`, error);
      }
    }
  }

  // Load ORCID snapshots
  const orcidDir = path.join(baseDir, 'orcid');
  if (fs.existsSync(orcidDir)) {
    const files = fs.readdirSync(orcidDir).filter((f) => f.endsWith('.json'));
    for (const file of files) {
      try {
        const content = fs.readFileSync(path.join(orcidDir, file), 'utf-8');
        const snapshot: PersonPublicationsSnapshot = JSON.parse(content);
        if (snapshot.works) {
          for (const work of snapshot.works) {
            if (work.id && !seenIds.has(work.id)) {
              allPublications.push(work);
              seenIds.add(work.id);
            }
          }
        }
      } catch (error) {
        console.error(`Error loading ${file}:`, error);
      }
    }
  }

  // Load DOI publications
  const doiDir = path.join(baseDir, 'doi');
  if (fs.existsSync(doiDir)) {
    const files = fs.readdirSync(doiDir).filter((f) => f.endsWith('.json'));
    for (const file of files) {
      try {
        const content = fs.readFileSync(path.join(doiDir, file), 'utf-8');
        const publication: PersonPublication = JSON.parse(content);
        if (publication.id && !seenIds.has(publication.id)) {
          allPublications.push(publication);
          seenIds.add(publication.id);
        } else if (publication.doi) {
          // Also check by DOI
          const doiKey = publication.doi.startsWith('http')
            ? publication.doi
            : `https://doi.org/${publication.doi}`;
          if (!seenIds.has(doiKey)) {
            allPublications.push(publication);
            seenIds.add(doiKey);
          }
        }
      } catch (error) {
        console.error(`Error loading ${file}:`, error);
      }
    }
  }

  return allPublications;
}

/**
 * Generates a cross-reference report
 */
function generateReport(
  publications: PersonPublication[],
  pubToAuthors: Map<string, Person[]>,
  personToPubs: Map<string, PersonPublication[]>
): string {
  const lines: string[] = [];

  lines.push('='.repeat(80));
  lines.push('PUBLICATION-PEOPLE CROSS-REFERENCE REPORT');
  lines.push('='.repeat(80));
  lines.push('');

  // Summary statistics
  const pubsWithAuthors = Array.from(pubToAuthors.keys()).length;
  const peopleWithPubs = Array.from(personToPubs.keys()).length;
  const totalMatches = Array.from(pubToAuthors.values()).reduce(
    (sum, authors) => sum + authors.length,
    0
  );

  lines.push('SUMMARY');
  lines.push('-'.repeat(80));
  lines.push(`Total publications analyzed: ${publications.length}`);
  lines.push(`Publications with matched authors: ${pubsWithAuthors}`);
  lines.push(`People with matched publications: ${peopleWithPubs}`);
  lines.push(`Total author-publication matches: ${totalMatches}`);
  lines.push('');

  // Publications by project
  lines.push('PUBLICATIONS BY PROJECT');
  lines.push('-'.repeat(80));
  for (const project of researchProjects) {
    if (!project.publicationIds || project.publicationIds.length === 0) continue;

    const projectPubs = project.publicationIds
      .map((id) => publications.find((p) => p.id === id))
      .filter((p): p is PersonPublication => p !== undefined);

    const pubsWithMatchedAuthors = projectPubs.filter((p) =>
      pubToAuthors.has(p.id)
    );

    lines.push(`\n${project.title} (${project.slug})`);
    lines.push(`  Total publications: ${projectPubs.length}`);
    lines.push(`  Publications with matched authors: ${pubsWithMatchedAuthors.length}`);

    if (pubsWithMatchedAuthors.length > 0) {
      for (const pub of pubsWithMatchedAuthors.slice(0, 5)) {
        const authors = pubToAuthors.get(pub.id) || [];
        const authorNames = authors.map((a) => a.name).join(', ');
        lines.push(`    - ${pub.title.substring(0, 60)}...`);
        lines.push(`      Authors: ${authorNames || 'None matched'}`);
      }
      if (pubsWithMatchedAuthors.length > 5) {
        lines.push(`    ... and ${pubsWithMatchedAuthors.length - 5} more`);
      }
    }
  }
  lines.push('');

  // People and their publications
  lines.push('PEOPLE AND THEIR PUBLICATIONS');
  lines.push('-'.repeat(80));
  for (const person of allPeople) {
    const personPubs = personToPubs.get(person.slug) || [];
    if (personPubs.length === 0) continue;

    lines.push(`\n${person.name} (${person.slug})`);
    lines.push(`  Role: ${person.roleLabel || 'N/A'}`);
    lines.push(`  ORCID: ${person.orcidId || 'N/A'}`);
    lines.push(`  Matched publications: ${personPubs.length}`);

    // Group by project
    const pubsByProject = new Map<string, PersonPublication[]>();
    for (const pub of personPubs) {
      for (const project of researchProjects) {
        if (project.publicationIds?.includes(pub.id)) {
          const existing = pubsByProject.get(project.slug) || [];
          existing.push(pub);
          pubsByProject.set(project.slug, existing);
          break;
        }
      }
    }

    if (pubsByProject.size > 0) {
      lines.push('  Publications by project:');
      for (const [projectSlug, pubs] of pubsByProject.entries()) {
        const project = researchProjects.find((p) => p.slug === projectSlug);
        lines.push(`    ${project?.title || projectSlug}: ${pubs.length} publication(s)`);
      }
    }
  }
  lines.push('');

  // Publications without matched authors
  lines.push('PUBLICATIONS WITHOUT MATCHED AUTHORS');
  lines.push('-'.repeat(80));
  const pubsWithoutAuthors = publications.filter(
    (p) => !pubToAuthors.has(p.id) || (pubToAuthors.get(p.id)?.length || 0) === 0
  );

  if (pubsWithoutAuthors.length > 0) {
    lines.push(`Found ${pubsWithoutAuthors.length} publications without matched authors:`);
    for (const pub of pubsWithoutAuthors.slice(0, 20)) {
      const hasAuthors = pub.authors && pub.authors.length > 0;
      const authorInfo = hasAuthors
        ? ` (has ${pub.authors?.length} author(s) in metadata but none matched)`
        : ' (no author metadata)';
      lines.push(`  - ${pub.title.substring(0, 70)}...${authorInfo}`);
    }
    if (pubsWithoutAuthors.length > 20) {
      lines.push(`  ... and ${pubsWithoutAuthors.length - 20} more`);
    }
  } else {
    lines.push('All publications have at least one matched author!');
  }
  lines.push('');

  lines.push('='.repeat(80));
  lines.push('End of report');
  lines.push('='.repeat(80));

  return lines.join('\n');
}

async function main(): Promise<void> {
  console.log('Loading publications and people...\n');

  // Load all publications
  const publications = loadAllPublications();
  console.log(`Loaded ${publications.length} publications`);

  // Create mappings
  console.log('Creating cross-reference mappings...');
  const pubToAuthors = createPublicationToAuthorsMap(publications, allPeople);
  const personToPubs = createPersonToPublicationsMap(publications, allPeople);

  console.log(`Found ${pubToAuthors.size} publications with matched authors`);
  console.log(`Found ${personToPubs.size} people with matched publications`);

  // Generate report
  console.log('\nGenerating report...');
  const report = generateReport(publications, pubToAuthors, personToPubs);

  // Save report
  const reportPath = path.join(__dirname, '..', 'publication-people-cross-reference-report.txt');
  fs.writeFileSync(reportPath, report, 'utf-8');
  console.log(`\nReport saved to: ${reportPath}`);

  // Also print summary to console
  console.log('\n' + '='.repeat(80));
  console.log('SUMMARY');
  console.log('='.repeat(80));
  console.log(`Total publications: ${publications.length}`);
  console.log(`Publications with matched authors: ${pubToAuthors.size}`);
  console.log(`People with matched publications: ${personToPubs.size}`);
  console.log(
    `Total matches: ${Array.from(pubToAuthors.values()).reduce((sum, authors) => sum + authors.length, 0)}`
  );
}

main().catch((error) => {
  console.error('Fatal error in cross_reference_publications_people:', error);
  process.exit(1);
});

