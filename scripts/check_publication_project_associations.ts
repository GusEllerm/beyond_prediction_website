#!/usr/bin/env tsx
/**
 * Script to check if publications are correctly associated with their projects
 */

import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { researchProjects } from '../src/data/researchProjects';
import type { PersonPublication } from '../src/data/publications';

interface Publication {
  id: string;
  title: string | null;
  doi?: string | null;
  authors: string;
  venue: string;
  year?: number | null;
  projects?: string[];
}

interface PublicationWithProjects extends Publication {
  expectedProjects: string[];
  currentProjects: string[];
  openAlexId?: string;
}

// Project theme mapping based on content analysis
const projectMapping: Record<string, string[]> = {
  // Infectious disease phylodynamics
  'pub55': ['infectious-disease-phylodynamics'], // LinguaPhylo
  'pub76': ['infectious-disease-phylodynamics'], // Online Bayesian Analysis with BEAST 2
  
  // Genomics data science
  'pub56': ['genomics-data-science'], // Accounting for errors in data improves divergence time estimates
  'pub57': ['genomics-data-science', 'digital-research-skills'], // Sustained software development
  'pub75': ['genomics-data-science'], // SNVformer
  'pub77': ['genomics-data-science'], // Tuberous sclerosis complex
  
  // Biodiversity ecology biosecurity
  'pub58': ['biodiversity-ecology-biosecurity'], // Non-linear models of species
  'pub59': ['biodiversity-ecology-biosecurity'], // Conceptual models of ecological drivers
  'pub60': ['infectious-disease-phylodynamics', 'biodiversity-ecology-biosecurity'], // Campylobacter jejuni
  'pub61': ['biodiversity-ecology-biosecurity'], // Shallow-water scavengers
  'pub62': ['biodiversity-ecology-biosecurity'], // Estimation of multivariate dependence
  'pub63': ['biodiversity-ecology-biosecurity'], // Introduction: in appreciation of K. Robert Clarke
  'pub64': ['biodiversity-ecology-biosecurity'], // The use of taxonomic relationships
  'pub65': ['biodiversity-ecology-biosecurity'], // Functional beta diversity of New Zealand fishes
  'pub66': ['biodiversity-ecology-biosecurity'], // Microbiome and environment
  'pub67': ['biodiversity-ecology-biosecurity'], // High functional diversity in deep-sea fish
  'pub68': ['biodiversity-ecology-biosecurity'], // Fish and flows
  'pub69': ['digital-research-skills'], // MEWMA charts
  'pub70': ['biodiversity-ecology-biosecurity'], // Genetic variance in fitness
  'pub71': ['biodiversity-ecology-biosecurity'], // Finding the adaptive needles
  'pub72': ['biodiversity-ecology-biosecurity'], // Who are you? A framework to identify
  'pub73': ['biodiversity-ecology-biosecurity'], // Genomic data of different resolutions
  
  // Live research articles
  'pub74': ['live-research-articles'], // Enabling LivePublication
  
  // Trustworthy explainable AI
  'pub78': ['trustworthy-explainable-ai'], // Discovery of Cross Joins
  'pub79': ['trustworthy-explainable-ai'], // Possible Keys and Functional Dependencies
  'pub80': ['trustworthy-explainable-ai'], // Analogical Proportions
  'pub81': ['trustworthy-explainable-ai'], // Object Normal Form
  'pub82': ['trustworthy-explainable-ai', 'digital-research-skills'], // Learning to match product codes
  'pub97': ['trustworthy-explainable-ai'], // An explainability analysis
  
  // Infectious disease phylodynamics (public health/infectious disease)
  'pub83': ['infectious-disease-phylodynamics'], // Spread of Nontyphoidal Salmonella
  'pub84': ['infectious-disease-phylodynamics'], // Genomic epidemiology of Delta SARS-CoV-2
  'pub85': ['infectious-disease-phylodynamics'], // Sensitivity of RT-PCR tests for SARS-CoV-2
  'pub86': ['infectious-disease-phylodynamics'], // Genomic Evidence of In-Flight Transmission of SARS-CoV-2
  'pub87': ['infectious-disease-phylodynamics'], // Whole-genome sequencing Staphylococcus aureus
  'pub88': ['infectious-disease-phylodynamics'], // Combining mutation and horizontal gene transfer
  'pub89': ['infectious-disease-phylodynamics'], // Microbial diversity in water and animal faeces
  'pub90': ['infectious-disease-phylodynamics'], // COVID-19 vaccine strategies
  'pub91': ['infectious-disease-phylodynamics'], // Source attributed case-control study of campylobacteriosis
  'pub92': ['infectious-disease-phylodynamics'], // Using multiple data sources to explore disease transmission
  'pub93': ['infectious-disease-phylodynamics'], // Use of Genomics to Track Coronavirus Disease Outbreaks
  'pub94': ['infectious-disease-phylodynamics'], // Creating symptom-based criteria for diagnostic testing
  'pub95': ['infectious-disease-phylodynamics'], // Real-Time Genomics for Tracking SARS-CoV-2 Border Incursions
  'pub96': ['infectious-disease-phylodynamics'], // Investigating the meat pathway as a source of human nontyphoidal Salmonella
};

function normalizeDoi(doi: string | null | undefined): string | null {
  if (!doi) return null;
  // Remove common prefixes and version suffixes
  return doi.replace(/^https?:\/\/(dx\.)?doi\.org\//i, '').replace(/v\d+$/i, '').trim();
}

function loadPublicationLookup(): Map<string, PersonPublication> {
  const lookup = new Map<string, PersonPublication>();
  const publicationsDir = join(process.cwd(), 'src/data/publications');
  
  // Load DOI-based publications
  try {
    const doiDir = join(publicationsDir, 'doi');
    const doiFiles = readdirSync(doiDir).filter(f => f.endsWith('.json'));
    for (const file of doiFiles) {
      const content = readFileSync(join(doiDir, file), 'utf-8');
      const pub = JSON.parse(content) as PersonPublication;
      if (pub.id) lookup.set(pub.id, pub);
      if (pub.doi) {
        const doiUrl = pub.doi.startsWith('http') ? pub.doi : `https://doi.org/${pub.doi}`;
        lookup.set(doiUrl, pub);
        lookup.set(pub.doi.replace(/^https?:\/\/(dx\.)?doi\.org\//i, ''), pub);
      }
    }
  } catch (e) {
    // Directory might not exist
  }
  
  // Load OpenAlex snapshots
  try {
    const openAlexDir = join(publicationsDir, 'openalex');
    const openAlexFiles = readdirSync(openAlexDir).filter(f => f.endsWith('.json'));
    for (const file of openAlexFiles) {
      const content = readFileSync(join(openAlexDir, file), 'utf-8');
      const snapshot = JSON.parse(content) as { works?: PersonPublication[] };
      if (snapshot.works) {
        for (const work of snapshot.works) {
          if (work.id) lookup.set(work.id, work);
          if (work.doi) {
            const doiUrl = work.doi.startsWith('http') ? work.doi : `https://doi.org/${work.doi}`;
            lookup.set(doiUrl, work);
          }
        }
      }
    }
  } catch (e) {
    // Directory might not exist
  }
  
  return lookup;
}

function getCurrentProjects(openAlexId: string | undefined, doi: string | null, lookup: Map<string, PersonPublication>): string[] {
  const currentProjects: string[] = [];
  
  if (!openAlexId && !doi) return currentProjects;
  
  const pub = openAlexId ? lookup.get(openAlexId) : (doi ? lookup.get(`https://doi.org/${doi}`) || lookup.get(doi) : null);
  
  if (!pub) return currentProjects;
  
  // Check which projects have this publication
  for (const project of researchProjects) {
    if (project.publicationIds) {
      for (const pubId of project.publicationIds) {
        const pubFromProject = lookup.get(pubId);
        if (pubFromProject && pubFromProject.id === pub.id) {
          currentProjects.push(project.slug);
          break;
        }
      }
    }
  }
  
  return currentProjects;
}

function main() {
  const jsonPath = process.argv[2];
  if (!jsonPath) {
    console.error('Usage: tsx check_publication_project_associations.ts <publications_json_file>');
    process.exit(1);
  }

  const jsonContent = readFileSync(jsonPath, 'utf-8');
  const data = JSON.parse(jsonContent) as { publications: Publication[] };

  const lookup = loadPublicationLookup();
  const results: PublicationWithProjects[] = [];
  
  console.log('Checking publication-project associations...\n');
  
  for (const pub of data.publications) {
    const normalizedDoi = normalizeDoi(pub.doi);
    let openAlexId: string | undefined;
    
    // Try to find the publication by DOI
    if (normalizedDoi) {
      const foundPub = lookup.get(`https://doi.org/${normalizedDoi}`) || 
                       lookup.get(`http://dx.doi.org/${normalizedDoi}`) ||
                       lookup.get(normalizedDoi);
      if (foundPub) {
        openAlexId = foundPub.id;
      }
    }
    
    // Use projects from JSON if provided, otherwise use mapping
    const expectedProjects = pub.projects && pub.projects.length > 0 
      ? pub.projects 
      : (projectMapping[pub.id] || []);
    const currentProjects = getCurrentProjects(openAlexId, normalizedDoi, lookup);
    
    results.push({
      ...pub,
      expectedProjects,
      currentProjects,
      openAlexId,
    });
  }
  
  // Report results
  console.log('=== ASSOCIATION CHECK RESULTS ===\n');
  
  let correctCount = 0;
  let missingCount = 0;
  let incorrectCount = 0;
  let notFoundCount = 0;
  
  for (const result of results) {
    if (!result.openAlexId) {
      console.log(`❓ ${result.id}: "${result.title}"`);
      console.log(`   Status: NOT FOUND IN SYSTEM (DOI: ${result.doi || 'none'})`);
      console.log(`   Expected: ${result.expectedProjects.join(', ') || 'none specified'}`);
      notFoundCount++;
      console.log('');
      continue;
    }
    
    const expectedSet = new Set(result.expectedProjects);
    const currentSet = new Set(result.currentProjects);
    
    const missing = result.expectedProjects.filter(p => !currentSet.has(p));
    const extra = result.currentProjects.filter(p => !expectedSet.has(p));
    
    if (missing.length === 0 && extra.length === 0 && result.expectedProjects.length > 0) {
      console.log(`✅ ${result.id}: "${result.title}"`);
      console.log(`   Correctly linked to: ${result.currentProjects.join(', ')}`);
      correctCount++;
    } else if (result.expectedProjects.length === 0 && result.currentProjects.length === 0) {
      console.log(`⚠️  ${result.id}: "${result.title}"`);
      console.log(`   Status: No expected projects specified, not linked to any project`);
      console.log(`   OpenAlex ID: ${result.openAlexId}`);
    } else {
      console.log(`❌ ${result.id}: "${result.title}"`);
      console.log(`   OpenAlex ID: ${result.openAlexId}`);
      if (missing.length > 0) {
        console.log(`   ⚠️  MISSING from: ${missing.join(', ')}`);
        missingCount++;
      }
      if (extra.length > 0) {
        console.log(`   ⚠️  INCORRECTLY linked to: ${extra.join(', ')}`);
        incorrectCount++;
      }
      if (result.currentProjects.length > 0) {
        console.log(`   Currently linked to: ${result.currentProjects.join(', ')}`);
      }
    }
    console.log('');
  }
  
  console.log('\n=== SUMMARY ===');
  console.log(`✅ Correctly associated: ${correctCount}`);
  console.log(`⚠️  Missing associations: ${missingCount}`);
  console.log(`⚠️  Incorrect associations: ${incorrectCount}`);
  console.log(`❓ Not found in system: ${notFoundCount}`);
  console.log(`📊 Total checked: ${results.length}`);
}

main();

