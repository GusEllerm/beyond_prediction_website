/**
 * Project partners database
 * This acts as the data source for partner logos displayed in the site footer.
 * 
 * To add a new partner:
 * 1. Add the logo image to `public/logos/` directory
 * 2. Add a new object to this array with:
 *    - name: The partner's display name (required)
 *    - url: Optional URL to link to the partner's website
 *    - logoSrc: Path to logo image (e.g., '/logos/partner-name.png')
 */
import type { Partner } from '../components/footer';

export const partners: Partner[] = [
  {
    name: 'University of Auckland',
    url: 'https://www.auckland.ac.nz/en.html',
    logoSrc: '/logos/university_of_auckland.svg',
  },
  { name: 'Partner One' },
  { name: 'Partner Two' },
  { name: 'Partner Three' },
  { name: 'Partner Four' },
  { name: 'Partner Five' },
];

