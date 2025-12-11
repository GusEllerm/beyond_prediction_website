/**
 * Showcase type for example features
 */
export type ExampleShowcaseKind = 'image' | 'iframe' | 'video' | 'html';

/**
 * Project example interface for showcasing specific examples or case studies
 */
export interface ProjectExample {
  slug: string; // unique, URL-safe identifier for the example (lowercase, hyphen-separated)
  title: string;
  description: string; // general description of the example
  shortDescription?: string; // optional shorter description for use in example cards on project pages (overrides description)
  
  // Showcase feature (primary visual/interactive element)
  showcaseKind?: ExampleShowcaseKind;
  showcaseSource?: string; // URL for iframe/image/video, or HTML string for html kind
  showcaseDescription?: string; // description specific to the showcase feature
  
  // Associated publications (OpenAlex work IDs)
  publicationIds?: string[]; // e.g. ["https://openalex.org/W12345", "https://openalex.org/W67890"]
}

/**
 * Unified research project interface
 * This is the single source of truth for all research projects.
 * Used for both card views (home page) and detail pages.
 *
 * To add a new research project:
 * 1. Add a new ResearchProject entry to the researchProjects array below
 * 2. Fill in the required fields (slug, title, shortDescription)
 * 3. Optionally add keyQuestions, highlights, examples, and extraSections for richer content
 * 4. Optionally add metadata fields like authors, researchers, tags, imageUrl, publicationDate
 */
export interface ResearchProject {
  slug: string; // unique, URL-safe identifier for the project (lowercase, hyphen-separated)
  title: string;
  shortDescription: string; // used on cards and the top of the detail page
  longDescription?: string; // optional longer description for the detail page
  heroImageUrl?: string;
  // Detail page content
  keyQuestions?: string[];
  highlights?: string[];
  examples?: ProjectExample[];
  extraSections?: {
    heading: string;
    body: string;
  }[];
  // Optional metadata (previously only on ResearchCard)
  authors?: string[];
  researchers?: string[];
  tags?: string[];
  imageUrl?: string;
  publicationDate?: string;
  [key: string]: unknown; // Allow additional fields for future expansion
}

// Legacy type alias for backward compatibility during migration
export type ResearchProjectDetail = ResearchProject;

/**
 * Research projects database
 * This is the single source of truth for all research projects.
 * Used for both card views (home page) and detail pages.
 */
export const researchProjects: ResearchProject[] = [
  {
    slug: 'live-research-articles',
    title: 'Live Research Articles (LivePublication)',
    shortDescription:
      'Transform static papers into live, reproducible research objects that stay linked to their data, code, and workflows.',
    longDescription:
      'Traditional research publications are static snapshots that quickly become disconnected from evolving code, data, and computational environments. LivePublication introduces a framework where research papers remain "live"—automatically updating as new data arrives, code improves, or methods evolve. This creates a bridge between traditional scholarly publishing and modern computational workflows, ensuring reproducibility and long-term utility of research outputs.',
    keyQuestions: [
      'How can we keep papers in sync with code and data?',
      "What does 'liveness' mean in scholarly publishing?",
      'How do we maintain version control and citation stability?',
      'Can we bridge traditional publishing workflows with computational research?',
    ],
    highlights: [
      'Prototype LivePublication framework',
      'Integration with CWL workflows and containers',
      'Automatic data pipeline integration',
      'Version-controlled research artifacts',
    ],
    examples: [
      {
        slug: 'early-proof-of-concept',
        title: 'Early Proof of Concept',
        description:
          'An early demonstration of the LivePublication framework showcasing how static research papers can be transformed into living documents that update automatically as new data and code become available.',
        showcaseKind: 'iframe',
        showcaseSource: 'https://livepublication.github.io/LP_Pub_LID/',
        showcaseDescription:
          'An early example of LivePublication demonstrating live, updating components and generative content for computationally driven sciences.',
        publicationIds: [
          'https://openalex.org/W4387005217', // LivePublication: The Science Creates and Updates the Publication
          'https://openalex.org/W4414260950', // GIScience in the era of Artificial Intelligence
          'https://openalex.org/W4398184796', // Faithful Reasoning over Scientific Claims
        ],
      },
      {
        slug: 'new-zealand-coastal-dynamics',
        title: 'New Zealand Coastal Dynamics',
        description:
          'A live research article tracking coastal changes in New Zealand, with visualizations and analyses that update automatically as new satellite and monitoring data arrives.',
        showcaseKind: 'iframe',
        showcaseSource: 'https://coastsat.livepublication.org/#6/-42.000/172.000',
        showcaseDescription:
          'A live article that updates automatically as new satellite data arrives, with interactive visualizations.',
        // publicationIds: [], // Add publication IDs here when available
      },
    ],
  },
  {
    slug: 'trustworthy-explainable-ai',
    title: 'Trustworthy & Explainable AI for Science',
    shortDescription:
      'Develop AI methods that detect hallucinations, expose their reasoning, and make model decisions auditable in scientific contexts.',
    longDescription:
      'As AI models become integral to scientific discovery, ensuring their trustworthiness and explainability is critical. This project focuses on developing methods to detect when AI systems produce hallucinations or unreliable outputs, expose the reasoning behind AI decisions, and create auditable workflows that scientists can validate and trust.',
    keyQuestions: [
      'How can we detect AI hallucinations in scientific contexts?',
      'What makes AI reasoning transparent and auditable?',
      'How do we build trust in AI-assisted scientific workflows?',
      'Can we create standardized protocols for AI explainability in research?',
    ],
    highlights: [
      'Hallucination detection frameworks',
      'Explainable AI tools for scientific use',
      'Audit trail generation for AI decisions',
      'Integration with scientific publishing workflows',
    ],
    examples: [
      {
        slug: 'hallucination-detection-demo',
        title: 'Hallucination Detection Demo',
        description:
          'A case study demonstrating AI summarization of scientific articles with automatic detection of fabricated or unreliable claims.',
      },
      {
        slug: 'explainable-model-decisions',
        title: 'Explainable Model Decisions',
        description:
          'Tools that reveal the reasoning chain behind AI predictions, showing which features and data points influenced the final decision.',
      },
    ],
  },
  {
    slug: 'ai-research-literature',
    title: 'AI for Research Literature & Dynamic Documents',
    shortDescription:
      'Use AI-native document structures, knowledge graphs, and auto-updating reports to turn the research literature into a queryable, living resource.',
    longDescription:
      'Research literature is currently fragmented across static papers, making it difficult to discover connections, track evolution of ideas, and synthesize knowledge. This project develops AI-native document structures, knowledge graphs, and dynamic reporting systems that transform literature into an interconnected, queryable resource that updates automatically as new research emerges.',
    keyQuestions: [
      'How can we structure research documents for AI-native processing?',
      'What role do knowledge graphs play in scientific literature?',
      'How can reports update automatically as new research appears?',
      'Can we create queryable, interconnected research knowledge bases?',
    ],
    highlights: [
      'AI-native document structures',
      'Knowledge graph construction from literature',
      'Automated report generation and updates',
      'Semantic search and discovery tools',
    ],
    examples: [
      {
        slug: 'literature-knowledge-graph',
        title: 'Literature Knowledge Graph',
        description:
          'A knowledge graph automatically constructed from research papers, enabling discovery of connections between papers, methods, and findings.',
      },
      {
        slug: 'dynamic-review-generation',
        title: 'Dynamic Review Generation',
        description:
          'An automatically updating literature review that incorporates new papers as they are published, maintaining currentness without manual updates.',
      },
    ],
  },
  {
    slug: 'genomics-data-science',
    title: 'Genomics Data Science & Evolutionary Inference',
    shortDescription:
      'Build Bayesian and phylogenetic methods that unlock new insights from genomic data—from single-cell tumours to human evolution.',
    longDescription:
      'Genomic data holds immense potential for understanding disease, evolution, and biological diversity. This project develops advanced Bayesian and phylogenetic methods that can handle the complexity and scale of modern genomic datasets, enabling insights from single-cell cancer genomics to large-scale evolutionary studies.',
    keyQuestions: [
      'How can we infer evolutionary relationships from genomic data?',
      'What methods work best for single-cell genomic analysis?',
      'How do we handle uncertainty in phylogenetic inference?',
      'Can we integrate multiple types of genomic evidence?',
    ],
    highlights: [
      'Bayesian phylogenetic inference methods',
      'Single-cell genomic analysis tools',
      'Evolutionary relationship reconstruction',
      'Uncertainty quantification in genomic analyses',
    ],
    examples: [
      {
        slug: 'tumor-evolution-analysis',
        title: 'Tumor Evolution Analysis',
        description:
          'Using single-cell genomic data to reconstruct the evolutionary history of tumors and identify key mutation events.',
      },
      {
        slug: 'human-population-genomics',
        title: 'Human Population Genomics',
        description:
          'Large-scale analysis of human genomic diversity to understand migration patterns and population structure.',
      },
    ],
  },
  {
    slug: 'biodiversity-ecology-biosecurity',
    // Note: This project covers both evolutionary_ecological_genomics and infectious_disease_phylodynamics themes
    // People assigned to either theme will be shown on this project page
    title: 'Biodiversity, Ecology & Biosecurity Modelling',
    shortDescription:
      "Model adaptation, resilience, and invasion risk in species that matter for Aotearoa's ecosystems and biosecurity.",
    longDescription:
      "Aotearoa New Zealand's unique ecosystems face threats from invasive species, climate change, and habitat loss. This project develops models that predict species adaptation, ecosystem resilience, and invasion risk, providing tools for conservation and biosecurity management.",
    keyQuestions: [
      'How can we predict which species will become invasive?',
      'What factors determine ecosystem resilience?',
      'How do species adapt to changing environments?',
      'What models best inform biosecurity decisions?',
    ],
    highlights: [
      'Invasion risk prediction models',
      'Ecosystem resilience frameworks',
      'Species adaptation modeling',
      'Biosecurity decision support tools',
    ],
    examples: [
      {
        slug: 'host-microbiome-environmental-change',
        title: 'Modelling Host–Microbiome Responses to Environmental Change',
        publicationIds: [
          'https://openalex.org/W4414057662',
        ],
        showcaseKind: 'image',
        showcaseSource: 'projects/biodiversity-ecology-biosecurity/microbe-fitness.webp',
        showcaseDescription:
          'This figure maps how well hosts and microbes are doing at the end of the simulation across different combinations of vertical transmission (along one axis) and the number of microbial generations per host generation (along the other), under several types of changing environments. Each panel is a heatmap: warm colours show high fitness, cool colours low fitness. In the microbe panels, when there are few microbial generations, high vertical transmission clearly maximises microbial fitness, but the corresponding host panels show that those same parameter values give poor host fitness—evidence of a trade-off. As you move up to many microbial generations per host, the patterns in the host and microbe heatmaps start to align: a band of parameter space appears where both host and microbe fitness are high, especially in environments that change in a correlated way over time.',
        description:
          'This research uses agent-based models to explore how hosts and their microbiomes (“holobionts”) evolve together in changing environments. The results show that rapid microbial evolution can transform a host–microbe conflict into a mutual benefit. When microbes experience only a few generations per host generation, increasing vertical transmission tends to favour microbial fitness at the expense of host fitness, or vice versa. But when microbes undergo many generations within a single host lifetime, they can quickly adapt to shifting environmental conditions in ways that maintain or improve both microbial and host fitness, especially in environments that change in predictable (autocorrelated) ways.',
        shortDescription:
          'This research uses agent-based models to explore how hosts and their microbiomes (“holobionts”) evolve together in changing environments.'
      },
      {
        slug: 'hihi-conservation-genomics',
        title: 'Genomic Tools for Conservation of the Hihi (Stitchbird)',
        publicationIds: [
          'https://openalex.org/W4413110717',
          'https://openalex.org/W4401246348',
        ],
        shortDescription:
          'This research develops and applies cutting-edge genomic methods to support conservation of the threatened hihi, an endemic New Zealand forest bird.',
        description:
          'This project develops and applies cutting-edge genomic methods to support conservation of the threatened hihi, an endemic New Zealand forest bird. High-density linkage maps reveal how recombination differs between males and females across the genome, improving our understanding of the species’ adaptive potential and evolutionary constraints. In parallel, we test genotype imputation strategies in this small, low-diversity population, showing that accurate genomic data can be obtained from modest sample sizes and sequencing budgets. Together, these tools help managers and researchers model genetic diversity, inbreeding, and long-term viability in threatened bird populations.',
        showcaseKind: 'image',
        showcaseSource: 'projects/biodiversity-ecology-biosecurity/hihi-conservation.webp',
        showcaseDescription:
          'This figure shows the first genome-wide genetic map for the hihi. Each vertical bar represents one chromosome, with coloured bands marking how frequently recombination occurs along its length: cooler colours indicate regions where recombination is rare, while warmer colours highlight recombination “hotspots.” Together, these maps reveal that smaller chromosomes tend to have higher recombination rates and that recombination is very unevenly distributed within and between chromosomes. The inset locates the study population on Tiritiri Matangi Island and links the genetic work back to a real, endangered New Zealand bird.',

      },
      {
        slug: 'invasive-species-genomic-survey-design',
        title: 'Genomic Survey Design for Invasive Species and Biosecurity',
        shortDescription:
          'This project evaluates how different population-genomic approaches change the stories we tell about adaptation in invasive species.',
        description:
          'This project evaluates how different population-genomic approaches change the stories we tell about adaptation in invasive species. Using the invasive common myna as a case study, we compare signals of selection obtained from reduced-representation (RADseq) and whole-genome sequencing datasets. The work shows that key adaptive regions can be missed in low-density datasets and that artefacts like allelic dropout can create false signals of selection. These findings provide practical guidance for designing genomic surveys that reliably detect adaptation in invasive and biosecurity-relevant species.',
      },
    ],
  },  
  {
    slug: 'maori-genomics-data-sovereignty',
    title: 'Māori Genomics & Data Sovereignty',
    shortDescription:
      'Co-develop genomic tools and population models that support Māori health, equity, and tino rangatiratanga over data.',
    longDescription:
      'This project works in partnership with Māori communities to develop genomic tools and population models that support health equity while respecting tino rangatiratanga (self-determination) over data. It emphasizes community-led research, data sovereignty principles, and culturally appropriate methods.',
    keyQuestions: [
      'How can genomic research support Māori health equity?',
      "What does tino rangatiratanga mean in data contexts?",
      'How do we ensure community leadership in genomic research?',
      'What are culturally appropriate methods for population genomics?',
    ],
    highlights: [
      'Community-led research frameworks',
      'Data sovereignty protocols',
      'Culturally appropriate genomic methods',
      'Māori health equity tools',
    ],
    examples: [
      {
        slug: 'community-data-governance-model',
        title: 'Community Data Governance Model',
        description:
          'A framework for genomic research that centers community control over data collection, use, and sharing.',
      },
      {
        slug: 'health-equity-analysis-tools',
        title: 'Health Equity Analysis Tools',
        description:
          'Genomic tools designed to address health disparities while respecting cultural protocols and community needs.',
      },
    ],
  },
  {
    slug: 'digital-research-skills',
    title: 'Digital Research Skills & Communities',
    shortDescription:
      'Grow national capability through ResBaz, Carpentries, and open training in data, coding, and reproducible research.',
    longDescription:
      'Building a strong research community requires accessible training and skill development. This project supports national capability through organizations like Research Bazaar (ResBaz) and The Carpentries, providing open, community-driven training in data science, coding, and reproducible research practices.',
    keyQuestions: [
      'How can we make research training more accessible?',
      'What skills are most important for modern research?',
      'How do we build sustainable training communities?',
      'What role do open educational resources play?',
    ],
    highlights: [
      'Research Bazaar (ResBaz) events and workshops',
      'Carpentries instructor training and workshops',
      'Open educational materials development',
      'Community-driven skill sharing',
    ],
    examples: [
      {
        slug: 'resbaz-aotearoa',
        title: 'ResBaz Aotearoa',
        description:
          'Annual community conference bringing together researchers, developers, and data scientists to share skills and build networks.',
      },
      {
        slug: 'carpentries-workshops',
        title: 'Carpentries Workshops',
        description:
          'Regular workshops teaching foundational coding and data science skills to researchers across disciplines.',
      },
    ],
  },
];

/**
 * Helper function to find a project by slug
 * @param slug - The project slug to search for
 * @returns The matching ResearchProject or null if not found
 */
export function findProjectDetail(
  slug: string | null
): ResearchProject | null {
  if (!slug) return null;
  return (
    researchProjects.find((project) => project.slug === slug) ?? null
  );
}

/**
 * Lookup map for projects by slug
 * Note: Both 'biodiversity-ecology-biosecurity' and 'infectious-disease-phylodynamics' map to the same project
 * since they share the same project page (biodiversity-ecology-biosecurity)
 */
const biodiversityProject = researchProjects.find((p) => p.slug === 'biodiversity-ecology-biosecurity') ?? null;

export const projectsBySlug: Record<string, ResearchProject | null> = {
  'live-research-articles': researchProjects.find((p) => p.slug === 'live-research-articles') ?? null,
  'trustworthy-explainable-ai': researchProjects.find((p) => p.slug === 'trustworthy-explainable-ai') ?? null,
  'genomics-data-science': researchProjects.find((p) => p.slug === 'genomics-data-science') ?? null,
  'biodiversity-ecology-biosecurity': biodiversityProject,
  'infectious-disease-phylodynamics': biodiversityProject, // Maps to biodiversity-ecology-biosecurity project
  'maori-genomics-data-sovereignty': researchProjects.find((p) => p.slug === 'maori-genomics-data-sovereignty') ?? null,
  'digital-research-skills': researchProjects.find((p) => p.slug === 'digital-research-skills') ?? null,
};

// Legacy export alias for backward compatibility during migration
export const researchProjectDetails = researchProjects;

