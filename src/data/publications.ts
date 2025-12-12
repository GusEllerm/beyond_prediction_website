/**
 * Publication data model for OpenAlex snapshots
 */

/**
 * Author information from a publication
 */
export interface PublicationAuthor {
  name: string; // Display name of the author
  orcidId?: string; // ORCID ID if available (e.g., "0000-0001-7209-8156")
  openAlexId?: string; // OpenAlex author ID if available
  position?: number; // Author position in the author list (1-based)
}

export interface PersonPublication {
  id: string; // OpenAlex work ID URI, e.g. "https://openalex.org/W12345"
  title: string;
  year?: number;
  venue?: string; // journal / conference / source name
  doi?: string;
  openAccessUrl?: string; // best available public URL, if any
  authors?: PublicationAuthor[]; // List of authors for this publication
}

export interface PersonPublicationsSnapshot {
  slug: string; // matches Person.slug
  orcidId?: string; // matches Person.orcidId
  updatedAt: string; // ISO timestamp when the snapshot was generated
  works: PersonPublication[];
}

