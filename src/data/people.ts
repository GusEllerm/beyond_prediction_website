/**
 * Person interface for people data
 * Extensible for future fields like email, photo, bio, etc.
 * 
 * To add a photo:
 * 1. Place the photo file in `public/photos/` directory
 * 2. Name it using the person's slug (e.g., `mark-gahegan.jpg`)
 * 3. Set `photoUrl: '/photos/mark-gahegan.jpg'` in the person object
 * 4. Supported formats: .jpg, .jpeg, .png, .webp
 */
export interface Person {
  slug: string; // unique, URL-safe identifier per person
  name: string;
  title?: string;
  affiliation?: string;
  roleLabel?: string; // e.g. "PI", "Co-I", "Industry Partner", "Post-Doc"
  bioShort?: string; // short blurb for cards
  bioLong?: string; // longer bio for detail page
  email?: string;
  website?: string;
  photoUrl?: string; // Path to photo in public/photos/ (e.g., '/photos/mark-gahegan.jpg')
  tags?: string[];
  [key: string]: unknown; // Allow additional fields for future expansion
}

/**
 * People section interface
 */
export interface PeopleSection {
  id: string;
  heading: string;
  description?: string;
  people: Person[];
}

/**
 * Principal Investigators
 */
export const principalInvestigators: Person[] = [
  {
    slug: 'mark-gahegan',
    name: 'Mark Gahegan',
    title: 'Principal Investigator',
    affiliation: 'University of Auckland',
    roleLabel: 'Principal Investigator',
    email: 'm.gahegan@auckland.ac.nz',
    photoUrl: '/photos/mark-gahegan.jpeg',
  },
];

/**
 * Co-Investigators
 */
export const coInvestigators: Person[] = [
  {
    slug: 'alexei-drummond',
    name: 'Alexei Drummond',
    title: 'Co-Principal Investigator',
    affiliation: 'University of Auckland',
    roleLabel: 'Co-PI',
    email: 'alexei@cs.auckland.ac.nz',
  },
  {
    slug: 'ben-adams',
    name: 'Ben Adams',
    title: 'Co-Principal Investigator',
    affiliation: 'University of Canterbury',
    roleLabel: 'Co-PI',
    email: 'benjamin.adams@canterbury.ac.nz',
  },
  {
    slug: 'paul-gardner',
    name: 'Paul Gardner',
    title: 'Co-Principal Investigator',
    affiliation: 'University of Otago',
    roleLabel: 'Co-PI',
    email: 'paul.gardner@otago.ac.nz',
  },
  {
    slug: 'phillip-wilcox',
    name: 'Phillip Wilcox',
    title: 'Co-Investigator',
    affiliation: 'University of Otago',
    roleLabel: 'Co-Investigator',
    email: 'phillip.wilcox@otago.ac.nz',
  },
  {
    slug: 'lara-greaves',
    name: 'Lara Greaves',
    title: 'Co-Investigator',
    affiliation: 'University of Auckland',
    roleLabel: 'Co-Investigator',
    email: 'lara.greaves@auckland.ac.nz',
  },
  {
    slug: 'alex-gavryushkin',
    name: 'Alex Gavryushkin',
    title: 'Co-Investigator',
    affiliation: 'BioDS',
    roleLabel: 'Co-Investigator',
    email: 'alex@biods.org',
  },
  {
    slug: 'sebastian-link',
    name: 'Sebastian Link',
    title: 'Co-Investigator',
    affiliation: 'University of Auckland',
    roleLabel: 'Co-Investigator',
    email: 's.link@auckland.ac.nz',
  },
  {
    slug: 'michael-witbrock',
    name: 'Michael Witbrock',
    title: 'Co-Investigator',
    affiliation: 'University of Auckland',
    roleLabel: 'Co-Investigator',
    email: 'm.witbrock@auckland.ac.nz',
  },
  {
    slug: 'michael-black',
    name: 'Michael Black',
    title: 'Co-Investigator',
    affiliation: 'University of Otago',
    roleLabel: 'Co-Investigator',
    email: 'mik.black@otago.ac.nz',
  },
  {
    slug: 'david-bryant',
    name: 'David Bryant',
    title: 'Co-Investigator',
    affiliation: 'University of Otago',
    roleLabel: 'Co-Investigator',
    email: 'david.bryant@otago.ac.nz',
  },
  {
    slug: 'nigel-french',
    name: 'Nigel French',
    title: 'Co-Investigator',
    affiliation: 'Massey University',
    roleLabel: 'Co-Investigator',
    email: 'N.P.French@massey.ac.nz',
  },
  {
    slug: 'anna-santure',
    name: 'Anna Santure',
    title: 'Co-Investigator',
    affiliation: 'University of Auckland',
    roleLabel: 'Co-Investigator',
    email: 'a.santure@auckland.ac.nz',
  },
  {
    slug: 'marti-anderson',
    name: 'Marti Anderson',
    title: 'Co-Investigator',
    affiliation: 'Massey University',
    roleLabel: 'Co-Investigator',
    email: 'M.J.Anderson@massey.ac.nz',
  },
];

/**
 * Industry Partners
 */
export const industryPartners: Person[] = [
  {
    slug: 'nokome-bentley',
    name: 'Nokome Bentley',
    title: 'Industry Collaborator',
    affiliation: 'Stencila',
    roleLabel: 'Industry Partner',
    email: 'nokome@stenci.la',
  },
];

/**
 * Post-Docs
 */
export const postDocs: Person[] = [
  {
    slug: 'neset-tan',
    name: 'Neset Tan',
    title: 'Postdoctoral Researcher',
    affiliation: 'University of Auckland',
    roleLabel: 'Post-Doc',
    email: 'neset.tan@auckland.ac.nz',
  },
  {
    slug: 'jo-klawitter',
    name: 'Jo Klawitter',
    title: 'Postdoctoral Researcher',
    affiliation: 'University of Auckland',
    roleLabel: 'Post-Doc',
    email: 'jo.klawitter@auckland.ac.nz',
  },
  {
    slug: 'gus-ellerm',
    name: 'Gus Ellerm',
    title: 'Postdoctoral Researcher',
    affiliation: 'University of Auckland',
    roleLabel: 'Post-Doc',
    email: 'gus.ellerm@auckland.ac.nz',
  },
];

/**
 * Flattened list of all people for reuse (e.g. in search or detail pages)
 */
export const allPeople: Person[] = [
  ...principalInvestigators,
  ...coInvestigators,
  ...industryPartners,
  ...postDocs,
];

