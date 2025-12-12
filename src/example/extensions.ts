import type { ResearchProject, ProjectExample } from '../data/researchProjects';

/**
 * Type for example extension mount functions
 * Each example extension file should export a function matching this signature
 */
export type ExampleExtensionMount = (
  root: HTMLElement,
  project: ResearchProject,
  example: ProjectExample
) => void;

