import type { ResearchProject } from '../data/researchProjects';

/**
 * Type for project extension mount functions
 * Each project extension file should export a function matching this signature
 */
export type ProjectExtensionMount = (root: HTMLElement, project: ResearchProject) => void;
