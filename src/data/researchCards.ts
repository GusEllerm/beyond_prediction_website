/**
 * Research card configuration interface
 * Extensible for future fields like longDescription, authors, researchers, etc.
 */
export interface ResearchCard {
  title: string;
  description: string;
  href: string;
  // Future extensible fields (optional for now)
  longDescription?: string;
  authors?: string[];
  researchers?: string[];
  tags?: string[];
  imageUrl?: string;
  publicationDate?: string;
  [key: string]: unknown; // Allow additional fields for future expansion
}

/**
 * Research cards database
 * This acts as the data source for research theme cards displayed on the site.
 */
export const researchCards: ResearchCard[] = [
  {
    title: 'Live Research Articles (LivePublication)',
    description:
      'Transform static papers into live, reproducible research objects that stay linked to their data, code, and workflows.',
    href: '#',
  },
  {
    title: 'Trustworthy & Explainable AI for Science',
    description:
      'Develop AI methods that detect hallucinations, expose their reasoning, and make model decisions auditable in scientific contexts.',
    href: '#',
  },
  {
    title: 'AI for Research Literature & Dynamic Documents',
    description:
      'Use AI-native document structures, knowledge graphs, and auto-updating reports to turn the research literature into a queryable, living resource.',
    href: '#',
  },
  {
    title: 'Genomics Data Science & Evolutionary Inference',
    description:
      'Build Bayesian and phylogenetic methods that unlock new insights from genomic data—from single-cell tumours to human evolution.',
    href: '#',
  },
  {
    title: 'Biodiversity, Ecology & Biosecurity Modelling',
    description:
      "Model adaptation, resilience, and invasion risk in species that matter for Aotearoa's ecosystems and biosecurity.",
    href: '#',
  },
  {
    title: 'Māori Genomics & Data Sovereignty',
    description:
      'Co-develop genomic tools and population models that support Māori health, equity, and tino rangatiratanga over data.',
    href: '#',
  },
  {
    title: 'Digital Research Skills & Communities',
    description:
      'Grow national capability through ResBaz, Carpentries, and open training in data, coding, and reproducible research.',
    href: '#',
  },
];

