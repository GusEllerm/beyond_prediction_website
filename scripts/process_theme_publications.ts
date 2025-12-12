/* scripts/process_theme_publications.ts */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Normalize DOI to filename format
function doiToSlug(doi: string): string {
  return doi
    .replace(/^https?:\/\/(dx\.)?doi\.org\//i, '')
    .replace(/^doi:/i, '')
    .replace(/[\/\:\.]/g, '-')
    .toLowerCase()
    .trim();
}

// Check if publication file exists
function publicationExists(doi: string): boolean {
  const slug = doiToSlug(doi);
  const filePath = path.join(__dirname, '..', 'src', 'data', 'publications', 'doi', `${slug}.json`);
  return fs.existsSync(filePath);
}

// Publications by theme
const themePublications: Record<string, Array<{ name: string; doi: string | null }>> = {
  'live-research-articles': [
    { name: 'Enabling LivePublication', doi: 'https://doi.org/10.1109/eScience55777.2022.00067' },
    { name: 'LivePublication: The Science Workflow Creates and Updates the Publication', doi: 'https://doi.org/10.1109/e-Science58273.2023.10254857' },
    { name: 'From Reproducible to Explainable GIScience', doi: 'https://doi.org/10.4230/LIPIcs.GIScience.2023.32' },
    { name: 'From Static to Dynamic: LivePublication and the quest for reproducible, living articles', doi: 'https://doi.org/10.6084/m9.figshare.28561049' },
    { name: 'Reproducibility in GIScience: How We Can Leverage Reproducibility to Enliven Research Articles', doi: 'https://doi.org/10.5281/zenodo.16899666' },
  ],
  'trustworthy-explainable-ai': [
    { name: 'Multi2Claim: Generating Scientific Claims from Multi-Choice Questions for Scientific Fact-Checking', doi: 'https://doi.org/10.18653/v1/2023.eacl-main.194' },
    { name: 'Faithful Reasoning over Scientific Claims', doi: 'https://doi.org/10.1609/aaaiss.v3i1.31209' },
    { name: 'Meta-inverse reinforcement learning for mean field games via probabilistic context variables', doi: 'https://doi.org/10.1609/aaai.v38i10.29021' },
    { name: 'KEA Explain: Explanations of Hallucinations using Graph Kernel Analysis', doi: 'https://doi.org/10.48550/arXiv.2507.03847' },
    { name: 'Distilled Circuits: A Mechanistic Study of Internal Restructuring in Knowledge Distillation', doi: 'https://doi.org/10.48550/arXiv.2505.10822' },
    { name: 'Discovery of Cross Joins', doi: 'https://doi.org/10.1109/TKDE.2022.3192842' },
    { name: 'Possible Keys and Functional Dependencies', doi: 'https://doi.org/10.1007/s13740-021-00135-w' },
    { name: 'Boyce-Codd and Third Normal Form for Property Graphs: Foundations, Achievements and Normalization', doi: 'https://doi.org/10.1007/s00778-025-00902-2' },
    { name: 'Mixed Covers of Keys and Functional Dependencies for Maintaining the Integrity of Data Under Updates', doi: 'https://doi.org/10.14778/3654621.3654626' },
    { name: 'Entity-Relationship Profiling', doi: 'https://doi.org/10.1109/ICDE60146.2024.00411' },
    { name: 'GIScience in the era of AI: A research agenda towards autonomous GIS', doi: 'https://doi.org/10.1080/19475683.2025.2552161' },
  ],
  'genomics-data-science': [
    { name: 'Accounting for errors in data improves divergence time estimates in single-cell cancer evolution', doi: 'https://doi.org/10.1093/molbev/msac143' },
    { name: 'SNVformer: An Attention-based Deep Neural Network for GWAS Data', doi: 'https://doi.org/10.1101/2022.07.07.499217' },
    { name: 'Tuberous sclerosis complex: a complex case', doi: 'https://doi.org/10.1101/mcs.a006182' },
    { name: 'Construction of relatedness matrices in autopolyploid populations using low-depth high-throughput sequencing data', doi: 'https://doi.org/10.1007/s00122-024-04568-2' },
    { name: 'Flawed machine-learning confounds coding sequence annotation', doi: 'https://doi.org/10.1101/2024.05.16.594598' },
    { name: 'A bioinformatician, computer scientist, and geneticist lead bioinformatic tool development—which one is better?', doi: 'https://doi.org/10.1093/bioadv/vbaf011' },
    { name: 'Evaluating computational tools for protein-coding sequence detection: Are they up to the task?', doi: 'https://doi.org/10.1261/rna.080416.125' },
  ],
  'biodiversity-ecology-biosecurity': [
    { name: 'Finding the adaptive needles in a population-structured haystack: A case study in a New Zealand mollusc', doi: 'https://doi.org/10.1111/1365-2656.13692' },
    { name: 'Who are you? A framework to identify and report genetic sample mix-ups', doi: 'https://doi.org/10.1111/1755-0998.13575' },
    { name: 'Genomic data of different resolutions reveal consistent inbreeding estimates but contrasting homozygosity landscapes for the threatened Aotearoa New Zealand hihi', doi: 'https://doi.org/10.1111/mec.16068' },
    { name: 'High Imputation Accuracy Can Be Achieved Using a Small Reference Panel in a Natural Population With Low Genetic Diversity', doi: 'https://doi.org/10.1111/1755-0998.70024' },
  ],
  'infectious-disease-phylodynamics': [
    { name: 'LinguaPhylo: a probabilistic model specification language for reproducible phylogenetic analyses', doi: 'https://doi.org/10.1371/journal.pcbi.1011226' },
    { name: 'Online Bayesian Analysis with BEAST 2', doi: 'https://doi.org/10.1101/2022.05.03.490538' },
    { name: 'Accurate Bayesian phylogenetic point estimation using a tree distribution parameterized by clade probabilities', doi: 'https://doi.org/10.1371/journal.pcbi.1012789' },
    { name: 'Tree Drawings with Columns', doi: 'https://doi.org/10.1007/978-3-031-49272-3_14' },
    { name: 'Visualizing Geophylogenies – Internal and External Labelling with Phylogenetic Tree Constraints', doi: 'https://doi.org/10.4230/LIPIcs.GIScience.2023.5' },
    { name: 'Skeletons in the Forest: Using Entropy-Based Rogue Detection on Bayesian Phylogenetic Tree Distributions', doi: 'https://doi.org/10.1101/2024.09.25.615070' },
    { name: 'Credible Sets of Phylogenetic Tree Topology Distributions', doi: 'https://doi.org/10.48550/arXiv.2505.14532' },
  ],
  'maori-genomics-data-sovereignty': [
    { name: 'Advancing diagnosis and research for rare genetic diseases in Indigenous peoples', doi: 'https://doi.org/10.1038/s41588-023-01642-1' },
    { name: 'Identifying Māori perspectives on gene editing in Aotearoa New Zealand', doi: 'https://doi.org/10.1038/s42003-024-05896-1' },
  ],
  'digital-research-skills': [],
};

async function main(): Promise<void> {
  console.log('Processing theme publications...\n');
  
  const missingDOIs: string[] = [];
  const existingDOIs: Record<string, string[]> = {};
  
  // Check each theme's publications
  for (const [theme, publications] of Object.entries(themePublications)) {
    console.log(`\n=== ${theme} ===`);
    existingDOIs[theme] = [];
    
    for (const pub of publications) {
      if (!pub.doi) {
        console.log(`  ⏭️  Skipping "${pub.name}" (no DOI)`);
        continue;
      }
      
      if (publicationExists(pub.doi)) {
        console.log(`  ✓ Found: ${pub.doi}`);
        existingDOIs[theme].push(pub.doi);
      } else {
        console.log(`  ✗ Missing: ${pub.doi}`);
        missingDOIs.push(pub.doi);
      }
    }
  }
  
  // Add missing publications
  if (missingDOIs.length > 0) {
    console.log(`\n\nAdding ${missingDOIs.length} missing publications...\n`);
    for (const doi of missingDOIs) {
      try {
        console.log(`Adding: ${doi}`);
        execSync(`npm run add:doi -- "${doi}"`, { 
          stdio: 'inherit',
          cwd: path.join(__dirname, '..')
        });
        console.log(`✓ Added: ${doi}\n`);
      } catch (error) {
        console.error(`✗ Failed to add ${doi}:`, error);
      }
    }
  } else {
    console.log('\n\nAll publications already exist!');
  }
  
  // Generate publication IDs for each theme
  console.log('\n\n=== Publication IDs by Theme ===\n');
  for (const [theme, dois] of Object.entries(existingDOIs)) {
    if (dois.length === 0) continue;
    console.log(`${theme}:`);
    console.log(`  publicationIds: [`);
    for (const doi of dois) {
      console.log(`    '${doi}',`);
    }
    console.log(`  ],\n`);
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

