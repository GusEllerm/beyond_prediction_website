import { allPeople } from './people';
import type { Person } from './people';

/**
 * Gets all people working on a specific theme (project)
 * @param projectSlug - The project slug to get people for
 * @returns Array of people working on the theme
 */
export function getPeopleForTheme(projectSlug: string): Person[] {
  return allPeople.filter((person) => person.themeSlugs?.includes(projectSlug));
}
