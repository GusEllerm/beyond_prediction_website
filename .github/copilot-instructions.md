# Beyond Prediction Website - Copilot Agent Instructions

## Repository Overview

This is a modern TypeScript-based static website built with Vite and Bootstrap 5, designed for the Beyond Prediction research consortium. The site showcases research projects, publications, people, and annual reports. It's deployed to Nectar cloud VMs using Docker/nginx.

**Size**: ~3,500 lines of TypeScript code  
**Type**: Single-page application with multiple HTML entry points  
**Target Runtime**: Browser (ES2022), Node.js v20+ for development  
**Build Tool**: Vite 7.x  
**Framework**: TypeScript 5.9 (strict mode), Bootstrap 5.3

## Critical Build & Validation Instructions

### Prerequisites
- **Node.js**: v18 or higher (tested with v20.19.6)
- **npm**: 10+ (comes with Node.js)
- Docker (optional, for deployment)

### Essential Build Commands

**ALWAYS run these commands in this exact order after code changes:**

1. **Install dependencies** (required before first build or after package.json changes):
   ```bash
   npm install
   ```
   - Time: ~3-5 seconds
   - Must complete successfully before build/lint
   - Uses package-lock.json for reproducible builds

2. **TypeScript compilation + Production build**:
   ```bash
   npm run build
   ```
   - Time: ~1.5-2 seconds
   - Runs `tsc && vite build`
   - TypeScript must compile cleanly (no errors)
   - Outputs to `dist/` directory
   - Multi-page build via vite.config.ts rollupOptions (11 HTML entry points)
   - **CRITICAL**: Large chunk warning for publications.js (1.1MB) is EXPECTED - do not try to fix
   - Success: "✓ built in X.XXs" message

3. **Linting**:
   ```bash
   npm run lint
   ```
   - Time: ~10-15 seconds
   - Runs ESLint with TypeScript parser
   - **IMPORTANT**: Warnings are acceptable (max 10 allowed)
   - Errors must be fixed
   - Expect Prettier formatting warnings - these are acceptable
   - Exit code 0 or 1 with warnings is OK; exit code 2+ indicates errors

4. **Code formatting**:
   ```bash
   npm run format
   ```
   - Time: ~1-2 seconds
   - Auto-formats all TypeScript and CSS files
   - Uses Prettier with project config (.prettierrc)
   - Run before committing to reduce lint warnings

### Development Server Commands

**Dev server with HMR** (use for testing UI changes):
```bash
npm run dev
```
- Starts on http://localhost:5173 (or http://0.0.0.0:5173 in Docker)
- Ready in ~170ms
- Hot module replacement (HMR) enabled
- Runs until stopped (not a completion-based command)

**Preview production build**:
```bash
npm run preview
```
- Requires `npm run build` first
- Serves from `dist/` on http://localhost:4173
- Tests production build locally

### Script Commands (For Publications/Reports Workflows)

These are specialized data processing scripts - only use if explicitly working on publications/reports:

```bash
npm run update:publications    # Updates both OpenAlex and ORCID data
npm run update:openalex        # Fetches OpenAlex publication data
npm run update:orcid           # Fetches ORCID publication data
npm run enrich:authors         # Enriches publications with author metadata
npm run cross-reference        # Cross-references publications with people
npm run add:doi                # Interactive: adds publication by DOI
npm run convert:reports        # Converts Word reports to HTML (requires pandoc)
npm run fix:report-lists       # Fixes HTML list structures in reports
```

**Note**: These scripts use `tsx` to run TypeScript directly. Most require API access or external files.

### Docker Commands (Optional)

**Development** (with live reload):
```bash
docker compose up web-dev
```
- Runs on port 5173
- Installs dependencies on container start

**Production build & deploy**:
```bash
docker compose build web-prod
docker compose up web-prod
```
- Multi-stage build (Node.js build → nginx runtime)
- Runs on port 8080
- Uses nginx:1.27-alpine

## Project Structure

### Root Files
```
/
├── index.html                  # Main landing page (home)
├── about.html                  # About page entry point
├── people.html                 # People directory entry point  
├── person.html                 # Individual person page
├── project.html                # Project detail page
├── example.html                # Example/case study page
├── reports.html                # Annual reports listing
├── report.html                 # Individual report page
├── research-outputs.html       # Publications listing
├── search.html                 # Search page
├── forward-plan.html           # Future planning page
├── package.json                # Dependencies and scripts
├── tsconfig.json               # TypeScript config (strict mode)
├── tsconfig.scripts.json       # TypeScript config for scripts/
├── vite.config.ts              # Vite bundler config (11 entry points)
├── eslint.config.js            # ESLint config (flat config format)
├── .prettierrc                 # Prettier formatting rules
├── Dockerfile                  # Production Docker build
├── docker-compose.yml          # Dev and prod services
└── .github/
    └── workflows/              # CI/CD workflows (see below)
```

### Source Directory Structure
```
src/
├── main.ts                     # Entry point for index.html
├── about.ts                    # About page logic
├── people.ts                   # People listing logic
├── person.ts                   # Person detail page logic
├── project.ts                  # Project detail logic
├── example.ts                  # Example page logic
├── reports.ts                  # Reports listing logic
├── report.ts                   # Report detail logic
├── research-outputs.ts         # Publications page logic
├── search.ts                   # Search functionality
├── searchIndex.ts              # Search index builder
├── forward-plan.ts             # Forward plan page logic
├── styles.css                  # Global CSS (extends Bootstrap)
├── components/                 # Reusable UI components
│   ├── navbar.ts              # Navigation bar
│   ├── footer.ts              # Footer with partners
│   ├── hero.ts                # Hero section
│   ├── breadcrumb.ts          # Breadcrumb navigation
│   ├── personCard.ts          # Person card component
│   └── publicationCard.ts     # Publication card component
├── data/                      # Data files (TypeScript modules)
│   ├── people.ts              # People data (allPeople array)
│   ├── peopleByTheme.ts       # People grouped by theme
│   ├── researchProjects.ts    # Research projects data
│   ├── reports.ts             # Annual reports metadata
│   ├── publications.ts        # Publications aggregator
│   ├── partners.ts            # Partner organizations
│   ├── heroShowcases.ts       # Hero section content
│   ├── searchIndex.ts         # Pre-built search index
│   └── publications/          # Publications JSON files
│       ├── openalex/          # OpenAlex fetched publications
│       └── orcid/             # ORCID fetched publications
├── projects/                  # Project-specific extensions
│   ├── extensions.ts          # Type definitions
│   └── live-research-articles.ts  # Example extension
├── example/                   # Example-specific extensions
│   ├── extensions.ts          # Type definitions
│   └── resbaz-aotearoa.ts     # Example extension
└── utils/                     # Utility functions
    ├── dom.ts                 # DOM helpers (escapeHtml, etc.)
    ├── publications.ts        # Publication loading utilities
    └── authorMatching.ts      # Author-to-person matching logic
```

### Public Assets (Static Files)
```
public/
├── logos/                     # Partner logos (SVG/PNG)
├── photos/                    # People photos (WebP preferred)
├── showcase/                  # Hero showcase images
├── projects/                  # Project-specific images/PDFs
└── content/                   # Generated HTML content (reports)
```

### Scripts Directory
```
scripts/
├── update_openalex_publications.ts    # OpenAlex API integration
├── update_orcid_publications.ts       # ORCID API integration
├── enrich_publications_with_authors.ts # Add author metadata
├── cross_reference_publications_people.ts # Match authors to people
├── add_doi_publication.ts             # Add publication by DOI
├── convert_reports.sh                 # Bash: Word to HTML conversion
├── fix_html_lists.ts                  # Post-process report HTML
└── [other utility scripts]
```

### Generated Build Output
```
dist/
├── *.html                     # All HTML entry points
├── assets/                    # JS/CSS bundles (hashed filenames)
├── logos/                     # Copied from public/
├── photos/                    # Copied from public/
├── projects/                  # Copied from public/
├── showcase/                  # Copied from public/
└── content/                   # Copied from public/
```

## GitHub Workflows & CI/CD

### Workflow Files
1. **`.github/workflows/agent_test_pr.yml`**  
   - Trigger: Manual (workflow_dispatch)
   - Creates test issues for Copilot agent
   - Used for agent smoke testing

2. **`.github/workflows/drop_publications.yml`**  
   - Trigger: Push to `drops` branch, path `incoming/publications/**`
   - Auto-assigns Copilot agent to process new publications
   - Creates issue to describe dropped publication

3. **`.github/workflows/drop_reports.yml`**  
   - Trigger: Push to `drops` branch, path `incoming/reports/**`
   - Auto-assigns Copilot agent to process new reports
   - Creates issue to describe dropped report

4. **`.github/workflows/promote_drops_to_main.yml`**  
   - Trigger: Push to `drops` branch
   - Auto-creates PR from `drops` → `main`
   - Allows staged integration of agent work

### Branch Strategy
- **`main`**: Production branch
- **`drops`**: Staging branch for file drops (triggers agent workflows)
- **Feature branches**: `copilot/*` or descriptive names

## Configuration Files Deep Dive

### tsconfig.json (Main)
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "strict": true,              // CRITICAL: All strict checks enabled
    "noUnusedLocals": true,      // Catches unused variables
    "noUnusedParameters": true,  // Catches unused params
    "noEmit": true,              // Vite handles emit
    "moduleResolution": "bundler"
  }
}
```
**Key Points**:
- Strict mode: no implicit any, null checks enforced
- No emit: Vite handles bundling
- Bundler resolution: for Vite compatibility

### tsconfig.scripts.json
Extends main config but:
- `"noEmit": false` - Scripts need to emit
- `"moduleResolution": "node"` - For tsx runtime
- Includes only `scripts/**/*`

### vite.config.ts
```typescript
export default defineConfig({
  server: {
    host: '0.0.0.0',  // Docker compatibility
    port: 5173
  },
  build: {
    rollupOptions: {
      input: {
        main: './index.html',
        project: './project.html',
        // ... 9 more entry points
      }
    }
  }
});
```
**Critical**: 11 HTML entry points for multi-page SPA architecture

### eslint.config.js
- Flat config format (ESLint 9+)
- TypeScript ESLint recommended rules
- Prettier integration for formatting
- **Max warnings: 10** (in package.json lint script)
- Prettier warnings are tolerated

### .prettierrc
```json
{
  "semi": true,
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false
}
```

## Key Architectural Patterns

### Multi-Page SPA
- Each HTML file is an entry point (11 total)
- Shared components imported as modules
- Bootstrap CSS/JS bundled via npm (not CDN)
- Vite handles code-splitting and bundling

### Data Loading
- All data in `src/data/` as TypeScript modules
- Publications stored as JSON files, aggregated by `publications.ts`
- Type-safe: `Person`, `ResearchProject`, `PersonPublication` interfaces
- Search index pre-built at build time

### Extension System
- **Projects**: `src/projects/{slug}.ts` adds custom content to project pages
- **Examples**: `src/example/{slug}.ts` adds custom content to example pages
- Auto-discovered via `import.meta.glob`
- Export `mountProjectExtension` or `mountExampleExtension` function

### Publications System
- OpenAlex and ORCID as sources
- Author matching via ORCID ID (primary) or fuzzy name match (fallback)
- Cross-referencing system links publications to people
- See `src/data/publications/README_CROSS_REFERENCE.md` for details

## Common Issues & Solutions

### Issue: "Cannot find module" errors
**Solution**: Run `npm install` - node_modules may be missing

### Issue: TypeScript strict mode errors
**Solution**: All code must be strictly typed. Use type assertions carefully. Avoid `any`.

### Issue: Build fails with "no such file"
**Solution**: Check that HTML entry points exist in root directory

### Issue: Large chunk warning (publications.js ~1.1MB)
**Solution**: This is EXPECTED. Do not attempt to fix. Publications data is large.

### Issue: ESLint shows many Prettier warnings
**Solution**: Run `npm run format` to auto-fix. Warnings are acceptable (not errors).

### Issue: Docker build fails
**Solution**: Check Dockerfile uses Node 22-alpine (build stage) and nginx:1.27-alpine (runtime)

### Issue: Preview fails with "dist not found"
**Solution**: Run `npm run build` first to generate dist/

## Data File Conventions

### People Data (`src/data/people.ts`)
- Export `allPeople: Person[]`
- Each person has `slug` (unique ID), `name`, `email`, `orcidId` (optional)
- Photos: `/photos/{slug}.webp`

### Publications (`src/data/publications/`)
- **OpenAlex**: `openalex/{person-slug}.json`
- **ORCID**: `orcid/{person-slug}.json`
- Schema: `PersonPublication` interface with optional `authors` array

### Projects (`src/data/researchProjects.ts`)
- Export `researchProjects: ResearchProject[]`
- Each has `slug`, `title`, `shortDescription`, `keyQuestions`, `highlights`, `examples`
- Extensions: `src/projects/{slug}.ts` (optional)

## Testing & Validation Checklist

Before finalizing changes, ALWAYS:

1. ✅ Run `npm install` (if package.json changed)
2. ✅ Run `npm run build` - must succeed with exit code 0
3. ✅ Run `npm run lint` - exit code 0 or 1 (warnings OK, errors not OK)
4. ✅ Check that `dist/` directory contains all HTML files
5. ✅ If UI changes: Run `npm run dev` and manually verify in browser
6. ✅ If adding dependencies: Check package-lock.json is updated
7. ✅ If modifying TypeScript: Ensure strict type checks pass
8. ✅ If modifying data files: Ensure JSON structure matches interface definitions

## File Ignore Patterns

**Do NOT commit** (already in .gitignore):
- `node_modules/`
- `dist/` (build output)
- `.env*` (environment files)
- `*.log` (logs)
- `.DS_Store`, `Thumbs.db` (OS files)
- `documentation/` (excluded)
- `temp_*.json`, `publications_to_check.json` (temp files)

**DO commit**:
- `package-lock.json` (for reproducible builds)
- All source files in `src/`
- All data files in `src/data/`
- All public assets
- Configuration files

## Validation Commands Summary

```bash
# Full validation sequence (run in order):
npm install          # ~3-5s - Install/update dependencies
npm run build        # ~1.5-2s - TypeScript + Vite build (must succeed)
npm run lint         # ~10-15s - ESLint check (warnings OK, errors must fix)
npm run format       # ~1-2s - Auto-format code (optional, recommended)
```

**Expected timing**: Total ~15-25 seconds for full validation

## Important Notes

1. **Trust these instructions**: Only search/explore if information here is incomplete or incorrect.

2. **TypeScript strict mode**: All code must satisfy strict type checking. No implicit any, proper null handling required.

3. **Publications chunk size warning**: The 1.1MB publications.js warning is EXPECTED and acceptable. Do not attempt to fix via code-splitting.

4. **Bootstrap usage**: Bootstrap 5 is bundled via npm. Use Bootstrap classes for styling consistency.

5. **Prettier warnings**: Acceptable in lint output. Run `npm run format` to auto-fix formatting issues.

6. **Docker deployment**: Production uses multi-stage build (Node.js → nginx). Test locally with `docker compose up web-prod`.

7. **Extension system**: Project/example extensions are optional. Follow README files in `src/projects/` and `src/example/` for details.

8. **Scripts directory**: Only use scripts (e.g., `npm run update:openalex`) when explicitly working on publications/reports data. Most code changes don't need these.

9. **Multiple HTML entry points**: This is a multi-page SPA. Each HTML file in root is an entry point. Vite bundles them separately.

10. **Search functionality**: Uses pre-built index. Changes to data files may require rebuilding search index.

---

**Last Updated**: 2024-12-16  
**Version**: 1.0  
**Maintained by**: Beyond Prediction Team
