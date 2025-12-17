/**
 * Showcase type for example features
 */
export type ExampleShowcaseKind = 'image' | 'iframe' | 'video' | 'html' | 'pdf';

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
  showcaseSource?: string; // URL for iframe/image/video/pdf, or HTML string for html kind
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
 * 3. Optionally add keyQuestions, examples, and extraSections for richer content
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
  examples?: ProjectExample[];
  extraSections?: {
    heading: string;
    body: string;
  }[];
  // Associated publications (OpenAlex work IDs or DOIs)
  publicationIds?: string[]; // e.g. ["https://openalex.org/W12345", "https://openalex.org/W67890"]
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
    examples: [
      {
        slug: 'live-publication-poster',
        title: 'Live Publication Poster',
        shortDescription:
          'A poster demonstrating the LivePublication framework and its applications to scientific research.',
        description:
          'LivePublication is a prototype that treats a research article as part of a live computational system rather than a static PDF. It connects an experiment infrastructure (running workflows on Sentinel-2 satellite data), an interface that collects results and provenance, and a web-based “LivePaper” that updates its figures and text as new computations are run. The poster shows how this approach supports reproducibility, transparency, and ongoing data-driven updates to the publication.',
        showcaseKind: 'pdf',
        showcaseSource: 'projects/live-research-articles/livepub-early-poster.pdf',
        publicationIds: [
          'https://openalex.org/W4312933824',
          'https://openalex.org/W4387005217',
          'https://openalex.org/W6922639269',
          'https://openalex.org/W6977410951',
          'https://openalex.org/W7076806724',
        ],
      },
      {
        slug: 'early-proof-of-concept',
        title: 'Early Proof of Concept',
        shortDescription:
          'An early demonstration of the LivePublication framework showcasing how static research papers can be transformed into living documents that update automatically as new data and code become available.',
        description:
          'This paper presents LivePublication, a framework that turns a research article into the front-end of a running scientific workflow rather than a static report. It integrates distributed workflows (via Globus) with RO-Crate research object containers so that each execution step produces rich artefacts that can be woven into a live, updating publication. A language-identification case study demonstrates how this approach supports liveness, reproducibility, and reuse by automatically regenerating figures, metrics, and method descriptions as new runs are executed.',
        showcaseKind: 'iframe',
        showcaseSource: 'https://livepublication.github.io/LP_Pub_LID/',
        showcaseDescription:
          'This LivePublication webpage is a simple site hosted on the orchestration node that turns the latest workflow outputs into a readable article using standard web technologies (HTML, CSS, and a lightweight backend hooked into Globus Flows). After each workflow run, the system writes a new RO-Crate artefact describing the execution; an adaptor on the server reindexes these artefacts and updates linked figures, tables, and datasets in the page. Parts of the text (such as the methodology section) are generated automatically from the workflow execution plan using a language model, so rerunning the flow can refresh both the visuals and sections of the narrative to reflect the most recent computation.',
        publicationIds: ['https://openalex.org/W4387005217', 'https://openalex.org/W4312933824'],
      },
      {
        slug: 'new-zealand-coastal-dynamics',
        title: 'New Zealand Coastal Dynamics',
        shortDescription:
          'A live research article tracking coastal changes in New Zealand, with visualizations and analyses that update automatically as new satellite and monitoring data arrives.',
        description:
          'CoastSat is an automated coastline monitoring project that uses the CoastSat Toolkit—an open-source Python library built on Google Earth Engine with Landsat and Sentinel-2 imagery—to track shoreline change along transects in New Zealand and Sardinia, updating its datasets on a regular schedule. In this case study, LivePublication is layered on top of the existing CoastSat system without modifying its codebase or runtime environment, by observing version-controlled artefacts and published Zenodo releases. CoastSat’s evolving workflows and outputs are modelled as an interface.crate (a standards-based RO-Crate that captures data, processes, and results), which is then wrapped by two headless publication.crates: one that generates concise, per-transect micropublications and another that produces aggregated shoreline-level research articles. These publication crates are integrated directly into CoastSat’s Leaflet map interface, allowing users to click on transects or shorelines and request on-demand, data-driven articles that explain trends, data quality, and provenance, effectively transforming a static dashboard into a live, narrative-driven publication surface.',
        showcaseKind: 'iframe',
        showcaseSource: 'https://coastsat.livepublication.org/#6/-42.000/172.000',
        showcaseDescription:
          'This site features LivePublication, an interactive tool that allows you to generate and view shoreline publications on demand. When you click a transect, LivePublication processes the latest shoreline data and presents a downloadable, publication-ready report directly in your browser. This integration provides real-time access to up-to-date shoreline analyses, making it easy to explore, share, and cite coastal changes for any monitored site. To use LivePublication, click the "Enable LivePublications" button in the toolbar. Then, click on any transect to generate a live shoreline publication for that site. Note: As this is a demonstration of how LivePublications may be generated live, they may take up to 1:30s to complete.',
      },
    ],
    publicationIds: [
      'https://openalex.org/W4312933824',
      'https://openalex.org/W4387005217',
      'https://openalex.org/W6947900292',
      'https://openalex.org/W6977410951', // pub47: From Static to Dynamic
      'https://openalex.org/W7076806724', // pub48: Reproducibility in GIScience
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
    publicationIds: [
      'https://openalex.org/W4386566686',
      'https://openalex.org/W4398184796',
      'https://openalex.org/W4415345243',
      'https://openalex.org/W4417093091',
      'https://openalex.org/W6947900292',
      'https://openalex.org/Wa8a048b862cf84a78e0a3f2e8ca8979b7c70ddb7',
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
    publicationIds: ['https://openalex.org/W4312933824', 'https://openalex.org/W4387005217'],
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
    publicationIds: [
      'https://doi.org/10.1111/1755-0998.1386',
      'https://doi.org/10.6084/m9.figshare.28537430.v1',
      'https://openalex.org/W3092360857',
      'https://openalex.org/W3097588841',
      'https://openalex.org/W3107086932',
      'https://openalex.org/W3111342687',
      'https://openalex.org/W3118433720',
      'https://openalex.org/W3119861525',
      'https://openalex.org/W3128309744',
      'https://openalex.org/W3157591309',
      'https://openalex.org/W3162777509',
      'https://openalex.org/W3178740768',
      'https://openalex.org/W3182965360',
      'https://openalex.org/W3195146959',
      'https://openalex.org/W3199267134',
      'https://openalex.org/W3206538607',
      'https://openalex.org/W4200104417',
      'https://openalex.org/W4220756870',
      'https://openalex.org/W4220972070',
      'https://openalex.org/W4229065791',
      'https://openalex.org/W4281561633',
      'https://openalex.org/W4283322370',
      'https://openalex.org/W4285011406',
      'https://openalex.org/W4285041148',
      'https://openalex.org/W4306964200',
      'https://openalex.org/W4310948020',
      'https://openalex.org/W4313270436',
      'https://openalex.org/W4376118065',
      'https://openalex.org/W4377019116',
      'https://openalex.org/W4383046536',
      'https://openalex.org/W4384663383',
      'https://openalex.org/W4385800882',
      'https://openalex.org/W4392348463',
      'https://openalex.org/W4401246348',
      'https://openalex.org/W4402911717',
      'https://openalex.org/W4406958237',
      'https://openalex.org/W4407402889',
      'https://openalex.org/W4411205819',
      'https://openalex.org/W4413110717',
      'https://openalex.org/W6930048546',
      'inbreeding-load-hihi-genomics-2025',
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
    examples: [
      {
        slug: 'host-microbiome-environmental-change',
        title: 'Modelling Host–Microbiome Responses to Environmental Change',
        publicationIds: [
          'https://openalex.org/W3048524266',
          'https://openalex.org/W3097983343',
          'https://openalex.org/W3136519070',
          'https://openalex.org/W3164335725',
          'https://openalex.org/W3172075717',
          'https://openalex.org/W3175859783',
          'https://openalex.org/W3178740768',
          'https://openalex.org/W3181472207',
          'https://openalex.org/W3182747289',
          'https://openalex.org/W3193475000',
          'https://openalex.org/W3194504126',
          'https://openalex.org/W3203862906',
          'https://openalex.org/W3209038930',
          'https://openalex.org/W3213354154',
          'https://openalex.org/W4220972070',
          'https://openalex.org/W4232122850',
          'https://openalex.org/W4281561633',
          'https://openalex.org/W4287378331',
          'https://openalex.org/W4307009264',
          'https://openalex.org/W4366245332',
          'https://openalex.org/W4401246348',
          'https://openalex.org/W4404328254',
          'https://openalex.org/W4414057662',
          'inbreeding-load-hihi-genomics-2025',
        ],
        showcaseKind: 'image',
        showcaseSource: 'projects/biodiversity-ecology-biosecurity/microbe-fitness.webp',
        showcaseDescription:
          'This figure maps how well hosts and microbes are doing at the end of the simulation across different combinations of vertical transmission (along one axis) and the number of microbial generations per host generation (along the other), under several types of changing environments. Each panel is a heatmap: warm colours show high fitness, cool colours low fitness. In the microbe panels, when there are few microbial generations, high vertical transmission clearly maximises microbial fitness, but the corresponding host panels show that those same parameter values give poor host fitness—evidence of a trade-off. As you move up to many microbial generations per host, the patterns in the host and microbe heatmaps start to align: a band of parameter space appears where both host and microbe fitness are high, especially in environments that change in a correlated way over time.',
        description:
          'This research uses agent-based models to explore how hosts and their microbiomes (“holobionts”) evolve together in changing environments. The results show that rapid microbial evolution can transform a host–microbe conflict into a mutual benefit. When microbes experience only a few generations per host generation, increasing vertical transmission tends to favour microbial fitness at the expense of host fitness, or vice versa. But when microbes undergo many generations within a single host lifetime, they can quickly adapt to shifting environmental conditions in ways that maintain or improve both microbial and host fitness, especially in environments that change in predictable (autocorrelated) ways.',
        shortDescription:
          'This research uses agent-based models to explore how hosts and their microbiomes (“holobionts”) evolve together in changing environments.',
      },
      {
        slug: 'hihi-conservation-genomics',
        title: 'Genomic Tools for Conservation of the Hihi (Stitchbird)',
        publicationIds: ['https://openalex.org/W4413110717', 'https://openalex.org/W4401246348'],
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
    publicationIds: [
      'https://openalex.org/W4220972070',
      'https://openalex.org/W4200104417',
      'https://openalex.org/W3178740768',
      'https://openalex.org/W4413110717',
      'https://openalex.org/W4306964200', // 10.1101/2022.10.20.512852
      // Biodiversity and ecology publications
      'https://openalex.org/W3213354154', // pub60: Campylobacter transmission
      'https://openalex.org/W3164335725', // pub61: Shallow-water scavengers
      'https://openalex.org/W3212357511', // pub62: Estimation of multivariate dependence
      'https://openalex.org/W3181472207', // pub67: High functional diversity in deep-sea fish
      'https://openalex.org/W3182747289', // pub68: Fish and flows
      'https://openalex.org/W4281561633', // pub70: Genetic variance in fitness
      'https://openalex.org/W4404328254', // pub41: Joint consideration of selection and microbial generation count
      'https://openalex.org/W4307009264', // pub58: Non-linear models of species' responses
      'https://openalex.org/W4366245332', // pub59: Conceptual models of ecological drivers
      'inbreeding-load-hihi-genomics-2025', // pub40: Inbreeding load in a small and managed population (conference, no DOI)
      'https://doi.org/10.6084/m9.figshare.28537430.v1', // pub52: What drives bioinformatic tool accuracy?
      // Publications from infectious-disease-phylodynamics theme (same project page)
      'https://openalex.org/W4384663383',
      'https://openalex.org/W4407402889',
      'https://openalex.org/W4390761281',
      'https://openalex.org/W4383046536',
      'https://openalex.org/W4402911717',
      'https://openalex.org/W6930048546',
      // Infectious disease publications
      'https://openalex.org/W4229065791', // pub76: Online Bayesian Analysis with BEAST 2
      'https://openalex.org/W3203862906', // pub83: Spread of Nontyphoidal Salmonella
      'https://openalex.org/W3111342687', // Genomic epidemiology reveals transmission patterns and dynamics of SARS-CoV-2 in Aotearoa New Zealand
      'https://openalex.org/W3195146959', // 10.3201/eid2709.211097
      'https://openalex.org/W3157591309', // 10.3201/eid2705.204579
      'https://openalex.org/W3193475000', // 10.1016/j.lanwpc.2021.100256
      'https://openalex.org/W3119861525', // 10.3201/eid2703.204714
      'https://openalex.org/W3032167546', // 10.1111/tgis.12660
      'https://openalex.org/W3024728639', // 10.1016/j.apgeog.2020.102363
      'https://openalex.org/W3182747289', // 10.1002/aqc.3636
      'https://openalex.org/W4285041148', // pub84: Genomic epidemiology of Delta SARS-CoV-2
      'https://openalex.org/W4287378331', // pub85: Sensitivity of RT-PCR tests for SARS-CoV-2
      'https://openalex.org/W3119861525', // pub86: Genomic Evidence of In-Flight Transmission
      'https://openalex.org/W3206538607', // pub87: Whole-genome sequencing Staphylococcus aureus
      'https://openalex.org/W3175859783', // pub88: Combining mutation and horizontal gene transfer
      'https://openalex.org/W3097588841', // pub89: Microbial diversity in water and animal faeces
      'https://openalex.org/W3136519070', // pub92: Using multiple data sources to explore disease transmission
      'https://openalex.org/W3157591309', // pub93: Use of Genomics to Track Coronavirus Disease
      'https://openalex.org/W3209038930', // pub94: Creating symptom-based criteria
      'https://openalex.org/W3195146959', // pub95: Real-Time Genomics for Tracking SARS-CoV-2
      'https://openalex.org/W3048524266', // pub96: Investigating the meat pathway Salmonella
      'https://openalex.org/W3097983343', // pub91: Source attributed case-control study campylobacteriosis
      'https://openalex.org/W3193475000', // pub90: COVID-19 vaccine strategies
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
      'What does tino rangatiratanga mean in data contexts?',
      'How do we ensure community leadership in genomic research?',
      'What are culturally appropriate methods for population genomics?',
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
    publicationIds: [
      'https://doi.org/10.1111/1755-0998.1386',
      'https://openalex.org/W4391652876',
      'https://openalex.org/W4392026818',
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
    examples: [
      {
        slug: 'resbaz-aotearoa',
        title: 'ResBaz Aotearoa',
        shortDescription:
          'ResBaz (Research Bazaar) is a digital research skills festival designed to boost the computational and data capabilities of the research community.',
        description:
          'ResBaz (Research Bazaar) is a digital research skills festival designed to boost the computational and data capabilities of the research community. It exists because modern scholarship increasingly depends on digital tools and workflows, yet PhD students and early-career researchers often have limited formal opportunities to learn these skills. ResBaz responds to this gap by offering accessible, practical training that builds digital literacy, dexterity, and capacity for collaboration across disciplines.',
        showcaseKind: `iframe`,
        showcaseSource: `https://resbaz.auckland.ac.nz/schedule/`,
        showcaseDescription:
          'The ResBaz Aotearoa 2025 schedule presents a week-long programme of online digital research skills training. The timetable highlights practical workshops on foundational computational skills (such as R, Python, command line and version control), data management and cleaning, qualitative and survey tools, spatial and statistical analysis, and the use of cloud and high-performance computing infrastructure. It also includes sessions on research communication and impact, open and reproducible science practices, and the responsible use of emerging technologies such as AI in research workflows.',
      },
      {
        slug: 'carpentries-workshops',
        title: 'Carpentries Workshops',
        description:
          'Regular workshops teaching foundational coding and data science skills to researchers across disciplines.',
      },
    ],
    publicationIds: [
      'https://openalex.org/W4220756870', // pub57: Sustained software development
      'https://openalex.org/W1010800094965520201806279', // pub10: MEWMA charts when parameters are estimated
      'https://openalex.org/W4293450833', // pub82: Learning to match product codes
      'https://openalex.org/W4406958237', // pub50: A bioinformatician, computer scientist, and geneticist...
      'https://openalex.org/W6966124972', // pub44: LIPIcs GIScience 2025
      'https://doi.org/10.6084/m9.figshare.28537430.v1', // pub52: What drives bioinformatic tool accuracy?
    ],
  },
  {
    slug: 'unassigned-publications',
    title: 'Unassigned Publications',
    shortDescription:
      'Publications from Beyond Prediction that are not currently assigned to a specific research theme.',
    publicationIds: [
      'https://openalex.org/W1010800094965520201806279',
      'https://openalex.org/W3024728639',
      'https://openalex.org/W3030383065',
      'https://openalex.org/W3032167546',
      'https://openalex.org/W3047394343',
      'https://openalex.org/W3095528690',
      'https://openalex.org/W3119157347',
      'https://openalex.org/W3134064579',
      'https://openalex.org/W3149499593',
      'https://openalex.org/W3168935107',
      'https://openalex.org/W3173860497',
      'https://openalex.org/W3176577330',
      'https://openalex.org/W3177130241',
      'https://openalex.org/W3183283998',
      'https://openalex.org/W3193473889',
      'https://openalex.org/W3208651955',
      'https://openalex.org/W3212357511',
      'https://openalex.org/W4246831200',
      'https://openalex.org/W4286544107',
      'https://openalex.org/W4293450833',
      'https://openalex.org/W4313003561',
      'https://openalex.org/W4317436319',
      'https://openalex.org/W4317951605',
      'https://openalex.org/W4353099637',
      'https://openalex.org/W4375948223',
      'https://openalex.org/W4380433121',
      'https://openalex.org/W4385402620',
      'https://openalex.org/W4390761281',
      'https://openalex.org/W4393147354',
      'https://openalex.org/W4399164394',
      'https://openalex.org/W4400910552',
      'https://openalex.org/W4407251498',
      'https://openalex.org/W4414260950',
      'https://openalex.org/W6966124972',
    ],
  },
];

/**
 * Helper function to find a project by slug
 * @param slug - The project slug to search for
 * @returns The matching ResearchProject or null if not found
 */
export function findProjectDetail(slug: string | null): ResearchProject | null {
  if (!slug) return null;
  return researchProjects.find((project) => project.slug === slug) ?? null;
}

/**
 * Lookup map for projects by slug
 * Note: Both 'biodiversity-ecology-biosecurity' and 'infectious-disease-phylodynamics' map to the same project
 * since they share the same project page (biodiversity-ecology-biosecurity)
 */
const biodiversityProject =
  researchProjects.find((p) => p.slug === 'biodiversity-ecology-biosecurity') ?? null;

export const projectsBySlug: Record<string, ResearchProject | null> = {
  'live-research-articles':
    researchProjects.find((p) => p.slug === 'live-research-articles') ?? null,
  'trustworthy-explainable-ai':
    researchProjects.find((p) => p.slug === 'trustworthy-explainable-ai') ?? null,
  'genomics-data-science': researchProjects.find((p) => p.slug === 'genomics-data-science') ?? null,
  'biodiversity-ecology-biosecurity': biodiversityProject,
  'infectious-disease-phylodynamics': biodiversityProject, // Maps to biodiversity-ecology-biosecurity project
  'maori-genomics-data-sovereignty':
    researchProjects.find((p) => p.slug === 'maori-genomics-data-sovereignty') ?? null,
  'digital-research-skills':
    researchProjects.find((p) => p.slug === 'digital-research-skills') ?? null,
};

// Legacy export alias for backward compatibility during migration
export const researchProjectDetails = researchProjects;
