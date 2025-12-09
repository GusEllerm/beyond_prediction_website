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
  orcidId?: string; // ORCID identifier, e.g. "0000-0001-7209-8156"
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
    orcidId: '0000-0001-7209-8156',
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
    photoUrl: '/photos/alexei-drummond.png',
    orcidId: '0000-0003-4454-2576',
  },
  {
    slug: 'ben-adams',
    name: 'Ben Adams',
    title: 'Co-Principal Investigator',
    affiliation: 'University of Canterbury',
    roleLabel: 'Co-PI',
    photoUrl: '/photos/ben-adams.jpeg',
    email: 'benjamin.adams@canterbury.ac.nz',
    orcidId: '0000-0002-1657-9809',
  },
  {
    slug: 'paul-gardner',
    name: 'Paul Gardner',
    title: 'Co-Principal Investigator',
    affiliation: 'University of Otago',
    roleLabel: 'Co-PI',
    photoUrl: '/photos/paul-gardner.jpg',
    email: 'paul.gardner@otago.ac.nz',
    orcidId: '0000-0002-7808-1213',
  },
  {
    slug: 'phillip-wilcox',
    name: 'Phillip Wilcox',
    title: 'Co-Investigator',
    affiliation: 'University of Otago',
    roleLabel: 'Co-Investigator',
    photoUrl: '/photos/phillip-wilcox.png',
    email: 'phillip.wilcox@otago.ac.nz',
    orcidId: '0000-0001-8485-6962',
  },
  {
    slug: 'lara-greaves',
    name: 'Lara Greaves',
    title: 'Co-Investigator',
    affiliation: 'University of Auckland',
    roleLabel: 'Co-Investigator',
    photoUrl: '/photos/lara-greaves.jpg',
    email: 'lara.greaves@auckland.ac.nz',
    orcidId: '0000-0003-0537-7125',
  },
  {
    slug: 'alex-gavryushkin',
    name: 'Alex Gavryushkin',
    title: 'Co-Investigator',
    affiliation: 'University of Canterbury',
    roleLabel: 'Co-Investigator',
    photoUrl: '/photos/alex-gavryushkin.png',
    email: 'alex@biods.org',
    orcidId: '0000-0001-6299-8249',
  },
  {
    slug: 'sebastian-link',
    name: 'Sebastian Link',
    title: 'Co-Investigator',
    affiliation: 'University of Auckland',
    roleLabel: 'Co-Investigator',
    photoUrl: '/photos/sebastian-link.png',
    email: 's.link@auckland.ac.nz',
    orcidId: '0000-0002-1816-2863',
  },
  {
    slug: 'michael-witbrock',
    name: 'Michael Witbrock',
    title: 'Co-Investigator',
    affiliation: 'University of Auckland',
    roleLabel: 'Co-Investigator',
    photoUrl: '/photos/michael-witbrock.png',
    email: 'm.witbrock@auckland.ac.nz',
    orcidId: '0000-0002-7554-0971',
  },
  {
    slug: 'michael-black',
    name: 'Michael Black',
    title: 'Co-Investigator',
    affiliation: 'University of Otago',
    roleLabel: 'Co-Investigator',
    photoUrl: '/photos/michael-black.webp',
    email: 'mik.black@otago.ac.nz',
    orcidId: '0000-0003-1174-6054',
  },
  {
    slug: 'david-bryant',
    name: 'David Bryant',
    title: 'Co-Investigator',
    affiliation: 'University of Otago',
    roleLabel: 'Co-Investigator',
    photoUrl: '/photos/david-bryant.png',
    email: 'david.bryant@otago.ac.nz',
    orcidId: '0000-0003-1963-5535',
  },
  {
    slug: 'nigel-french',
    name: 'Nigel French',
    title: 'Co-Investigator',
    affiliation: 'Massey University',
    roleLabel: 'Co-Investigator',
    photoUrl: '/photos/nigel-french.png',
    email: 'N.P.French@massey.ac.nz',
    orcidId: '0000-0002-6334-0657',
  },
  {
    slug: 'anna-santure',
    name: 'Anna Santure',
    title: 'Co-Investigator',
    affiliation: 'University of Auckland',
    roleLabel: 'Co-Investigator',
    photoUrl: '/photos/anna-santure.jpg',
    email: 'a.santure@auckland.ac.nz',
    orcidId: '0000-0001-8965-1042',
  },
  {
    slug: 'marti-anderson',
    name: 'Marti Anderson',
    title: 'Co-Investigator',
    affiliation: 'Massey University',
    roleLabel: 'Co-Investigator',
    photoUrl: '/photos/marti-anderson.jpg',
    email: 'M.J.Anderson@massey.ac.nz',
    orcidId: '0000-0002-4018-4049',
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
    photoUrl: '/photos/nokome-bentley.jpeg',
    email: 'nokome@stenci.la',
    orcidId: '0000-0003-1608-7967',
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
    photoUrl: '/photos/neset-tan.webp',
    email: 'neset.tan@auckland.ac.nz',
    orcidId: '0000-0001-6201-7295',
  },
  {
    slug: 'jo-klawitter',
    name: 'Jo Klawitter',
    title: 'Postdoctoral Researcher',
    affiliation: 'University of Auckland',
    roleLabel: 'Post-Doc',
    photoUrl: '/photos/jo-klawitter.jpg',
    email: 'jo.klawitter@auckland.ac.nz',
    orcidId: '0000-0001-8917-5269',
  },
  {
    slug: 'gus-ellerm',
    name: 'Gus Ellerm',
    title: 'Postdoctoral Researcher',
    affiliation: 'University of Auckland',
    roleLabel: 'Post-Doc',
    email: 'gus.ellerm@auckland.ac.nz',
    orcidId: '0000-0001-8260-231X',
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

