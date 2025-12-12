# Publication-People Cross-Reference System

This document explains the cross-referencing system that links publications with their authors (people).

## Overview

The system enriches publication metadata with author information and provides utilities to match authors to people in the `people.ts` file. This enables:

- Finding which people authored which publications
- Finding which publications a person authored
- Displaying author information on publication pages
- Generating reports on publication-author relationships

## Components

### 1. Updated Data Model

The `PersonPublication` interface in `src/data/publications.ts` now includes an optional `authors` field:

```typescript
export interface PublicationAuthor {
  name: string;              // Display name of the author
  orcidId?: string;          // ORCID ID if available
  openAlexId?: string;       // OpenAlex author ID if available
  position?: number;         // Author position (1-based)
}

export interface PersonPublication {
  // ... existing fields ...
  authors?: PublicationAuthor[];  // List of authors
}
```

### 2. Enrichment Script

**Script**: `scripts/enrich_publications_with_authors.ts`

This script fetches author information from the OpenAlex API and enriches existing publication files.

**Usage**:
```bash
# Set your email for OpenAlex API (optional but recommended)
export OPENALEX_CONTACT_EMAIL="your-email@example.com"

# Run the enrichment script
npm run tsx scripts/enrich_publications_with_authors.ts
```

**What it does**:
- Scans all publication files in `src/data/publications/`
- For publications with OpenAlex IDs, fetches full work details including authorships
- Extracts author names, ORCID IDs, and OpenAlex author IDs
- Updates publication files with author information
- Includes rate limiting to be polite to the OpenAlex API

**Note**: This script will skip publications that already have author data, so it's safe to run multiple times.

### 3. Author Matching Utilities

**File**: `src/utils/authorMatching.ts`

Provides functions to match publication authors to people:

- `matchAuthorToPerson(author, people)` - Matches a single author to a person (tries ORCID first, then name)
- `getPublicationAuthors(publication, people)` - Gets all people who authored a publication
- `getPersonPublications(person, allPublications)` - Gets all publications for a person
- `createPublicationToAuthorsMap(publications, people)` - Creates a map of publication IDs to their authors
- `createPersonToPublicationsMap(publications, people)` - Creates a map of people to their publications

**Matching Strategy**:
1. **ORCID Match** (most reliable): If both author and person have ORCID IDs, match by exact ORCID ID
2. **Name Match** (fuzzy): Normalizes names and matches using:
   - Exact normalized match
   - Substring match with last name verification
   - Last name + first initial match (handles abbreviated first names)

### 4. Cross-Reference Report Script

**Script**: `scripts/cross_reference_publications_people.ts`

Generates a comprehensive report showing:
- Summary statistics (total publications, matched authors, etc.)
- Publications by project with their matched authors
- People and their matched publications
- Publications without matched authors

**Usage**:
```bash
npm run tsx scripts/cross_reference_publications_people.ts
```

This will generate a report file: `publication-people-cross-reference-report.txt`

## Workflow

### Initial Setup

1. **Enrich publications with author data**:
   ```bash
   npm run tsx scripts/enrich_publications_with_authors.ts
   ```
   This may take a while as it makes API calls to OpenAlex. The script includes rate limiting.

2. **Generate cross-reference report**:
   ```bash
   npm run tsx scripts/cross_reference_publications_people.ts
   ```
   Review the report to see how well authors are being matched.

### Using in Code

```typescript
import { getPublicationAuthors, getPersonPublications } from './utils/authorMatching';
import { allPeople } from './data/people';
import type { PersonPublication } from './data/publications';

// Get authors for a publication
const publication: PersonPublication = /* ... */;
const authors = getPublicationAuthors(publication, allPeople);

// Get publications for a person
const person = allPeople.find(p => p.slug === 'mark-gahegan');
if (person) {
  const publications = getPersonPublications(person, allPublications);
}
```

## Matching Quality

The matching quality depends on:

1. **Author metadata availability**: Publications need to have author information (run enrichment script first)
2. **ORCID IDs**: Most reliable matching method. Ensure people in `people.ts` have ORCID IDs when available
3. **Name consistency**: Name matching works best when names are consistent between publications and people data

## Limitations

- Publications without OpenAlex IDs cannot be automatically enriched (they need manual author data)
- Name matching may have false positives/negatives, especially for common names
- ORCID matching is most reliable but requires both author and person to have ORCID IDs

## Future Enhancements

Potential improvements:
- Manual override/curation for unmatched publications
- Integration with ORCID API for additional author data
- Display author information on publication pages
- Filter publications by author on project pages
- Author co-occurrence analysis

