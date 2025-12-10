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
export interface PersonBioSource {
  label: string;
  url: string;
}

export type PublicationSource = 'openalex' | 'orcid';

export interface Person {
  slug: string; // unique, URL-safe identifier per person
  name: string;
  title?: string;
  affiliation?: string;
  roleLabel?: string; // e.g. "PI", "Co-I", "Industry Partner", "Post-Doc"
  bioShort?: string; // short blurb for cards
  bioLong?: string; // longer bio for detail page
  bio?: string; // biography
  bioSources?: PersonBioSource[]; // sources for biography
  email?: string;
  website?: string;
  photoUrl?: string; // Path to photo in public/photos/ (e.g., '/photos/mark-gahegan.jpg')
  orcidId?: string; // ORCID identifier, e.g. "0000-0001-7209-8156"
  publicationSource?: PublicationSource; // default: 'openalex' if not set
  tags?: string[];
  themeSlugs?: string[]; // Research theme slugs (project slugs) this person works on
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
    themeSlugs: [
      'live-research-articles',
      'trustworthy-explainable-ai',
      'biodiversity-ecology-biosecurity',
      'digital-research-skills',
    ],
    bio: "Professor Mark Gahegan is Director of the Centre for eResearch at Waipapa Taumata Rau, The University of Auckland. His work spans geographic information science, spatial data analysis, and the design of eResearch infrastructures that help researchers manage, analyse and share complex, data-intensive workflows. Mark has led a range of national and international initiatives around AI, research data platforms, and digital research tools, and brings long-standing experience in building interdisciplinary collaborations between computer science, the geosciences and the wider research community.",
    bioSources: [
      {
        label: 'University of Auckland – AI in Research (Centre for eResearch)',
        url: 'https://research-hub.auckland.ac.nz/subhub/ai-in-research',
      },
      {
        label: 'ResearchGate – Mark Gahegan profile',
        url: 'https://www.researchgate.net/profile/Mark-Gahegan',
      },
    ],
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
    themeSlugs: [
      'genomics-data-science',
      'biodiversity-ecology-biosecurity',
    ],
    bio: "Professor Alexei Drummond is an evolutionary biologist and computational phylogeneticist at Waipapa Taumata Rau, The University of Auckland. He is widely known for co-developing the BEAST software platform and for pioneering Bayesian methods for inferring evolutionary histories and molecular clocks. Alexei holds a James Cook Research Fellowship from Royal Society Te Apārangi and leads research that integrates genomics, statistics and computation to understand how populations and pathogens evolve through time, expertise that underpins the project's phylogenetic and modelling components.",
    bioSources: [
      {
        label: 'Te Ao Mārama – University of Auckland profile',
        url: 'https://www.teaomarama.auckland.ac.nz/alexei-drummond/',
      },
      {
        label: 'Royal Society Te Apārangi – James Cook Research Fellowship (Alexei Drummond)',
        url: 'https://www.royalsociety.org.nz/what-we-do/funds-and-opportunities/james-cook-research-fellowship/james-cook-research-fellowships-recipients/alexei-drummond/',
      },
    ],
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
    publicationSource: 'orcid',
    themeSlugs: [
      'live-research-articles',
      'trustworthy-explainable-ai',
      'digital-research-skills',
    ],
    bio: "Associate Professor Ben Adams is a geospatial data scientist in the Department of Computer Science and Software Engineering at the University of Canterbury. His research focuses on geographic information science, spatial data infrastructures and the design of systems that make complex environmental and urban data more usable. Ben has led and contributed to projects spanning spatial knowledge graphs, geospatial semantics and reproducible spatial analysis, and he contributes to the project by connecting novel publication workflows with real-world, spatially rich research data.",
    bioSources: [
      {
        label: 'University of Canterbury – Research profile (Ben Adams)',
        url: 'https://researchprofile.canterbury.ac.nz/Researcher.aspx?Researcherid=1809321',
      },
      {
        label: 'GeoKea group page (Ben Adams)',
        url: 'https://darwinzer0.github.io/geokea/',
      },
    ],
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
    publicationSource: 'orcid',
    themeSlugs: [
      'genomics-data-science',
      'biodiversity-ecology-biosecurity',
    ],
    bio: "Associate Professor Paul Gardner is a bioinformatician at the University of Otago whose research centres on RNA biology, comparative genomics and the development of computational methods for analysing high-throughput sequencing data. He has contributed to widely used RNA databases and tools, and works at the interface of molecular biology, statistics and computer science. Paul's experience in building and maintaining research software and data resources informs the project's approach to sustainable, reproducible computational pipelines.",
    bioSources: [
      {
        label: 'ORCID – Paul Gardner',
        url: 'https://orcid.org/0000-0002-7808-1213',
      },
      {
        label: 'University of Otago – Gardner group / research profile',
        url: 'https://www.otago.ac.nz/biochemistry/people/profile/index.html?id=2036',
      },
    ],
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
    themeSlugs: [
      'genomics-data-science',
      'biodiversity-ecology-biosecurity',
      'maori-genomics-data-sovereignty',
    ],
    bio: "Associate Professor Phillip Wilcox (Ngāti Rakaipaaka, Ngāti Kahungunu ki te Wairoa, Rongomaiwahine) is a quantitative geneticist in the Department of Mathematics and Statistics at the University of Otago. His research spans applied genomics, statistical genetics and Māori bioethics, with a strong focus on developing frameworks that align genomic research with mātauranga Māori and tikanga. Phillip's expertise in indigenous genomics and responsible data use helps ensure that the project's methods for handling and sharing genomic information are both statistically robust and culturally grounded.",
    bioSources: [
      {
        label: 'University of Otago – Associate Professor Phillip Wilcox',
        url: 'https://www.otago.ac.nz/maths-and-stats/people/associate-professor-phillip-wilcox',
      },
      {
        label: 'Maurice Wilkins Centre – Phillip Wilcox profile',
        url: 'https://www.mauricewilkinscentre.org.nz/about-us/our-people/te-amorangi-leadership-group/associate-professor-phillip-wilcox/',
      },
      {
        label: 'MEA – Genomics & tikanga interview with Dr Phillip Wilcox',
        url: 'https://www.mea.nz/korero/genomics-tikanga-dr-phillip-wilcox-on-indigenous-ethics-precision-medicine',
      },
    ],
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
    publicationSource: 'orcid',
    themeSlugs: ['maori-genomics-data-sovereignty'],
    bio: "Associate Professor Lara Greaves (Ngāpuhi, Pākehā, Tararā) is a political scientist whose work sits at the intersection of psychology, Māori politics and public policy. She holds roles at Te Herenga Waka—Victoria University of Wellington and Waipapa Taumata Rau, The University of Auckland, and is a Rutherford Discovery Fellow. Lara's research examines Māori political attitudes, participation and representation, and she is a regular commentator on Aotearoa New Zealand politics. She brings to the project deep expertise in survey design, civic engagement and the politics of data and representation.",
    bioSources: [
      {
        label: 'Victoria University of Wellington – Staff profile (Lara Greaves)',
        url: 'https://people.wgtn.ac.nz/lara.greaves',
      },
      {
        label: 'Royal Society Te Apārangi – Rutherford Discovery Fellowship (Lara Greaves)',
        url: 'https://www.royalsociety.org.nz/what-we-do/funds-and-opportunities/rutherford-discovery-fellowships/rutherford-discovery-fellowship-recipients/lara-greaves/',
      },
    ],
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
    publicationSource: 'orcid',
    themeSlugs: [
      'genomics-data-science',
      'biodiversity-ecology-biosecurity',
    ],
    bio: "Associate Professor Alex Gavryushkin is a data scientist whose research lies in computational genomics, algorithm design and mathematical biology. Based at the University of Canterbury, he leads the Biological Data Science lab and holds a Rutherford Discovery Fellowship. Alex's work focuses on scalable algorithms for molecular sequence data and on modelling complex evolutionary and biosecurity scenarios, making his expertise central to the project's goals around rigorous, high-dimension statistical modelling and efficient analysis pipelines.",
    bioSources: [
      {
        label: 'University of Canterbury – News on biosecurity algorithms (Alex Gavryushkin)',
        url: 'https://www.canterbury.ac.nz/news-and-events/news/2023/developing-new-algorithms-to-manage-biosecurity-threats',
      },
      {
        label: 'Royal Society Te Apārangi – Rutherford Discovery Fellowship (Alex Gavryushkin)',
        url: 'https://www.royalsociety.org.nz/what-we-do/funds-and-opportunities/rutherford-discovery-fellowships/rutherford-discovery-fellowship-recipients/alex-gavryushkin/',
      },
    ],
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
    publicationSource: 'orcid',
    themeSlugs: ['trustworthy-explainable-ai'],
    bio: "Professor Sebastian Link is a computer scientist at Waipapa Taumata Rau, The University of Auckland, whose research covers data management, database theory and information quality. His work on dependencies, schemas and data modelling underpins reliable, high-integrity information systems. Sebastian has contributed to both theoretical and applied aspects of data engineering, and in this project he lends expertise in formalising data structures, ensuring that research outputs and provenance records remain consistent, queryable and robust over time.",
    bioSources: [
      {
        label: 'University of Auckland – Sebastian Link profile',
        url: 'https://profiles.auckland.ac.nz/s-link',
      },
      {
        label: 'University of Auckland – Sebastian Link research outputs',
        url: 'https://profiles.auckland.ac.nz/s-link/publications',
      },
    ],
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
    publicationSource: 'orcid',
    themeSlugs: ['trustworthy-explainable-ai'],
    bio: "Professor Michael Witbrock is an artificial intelligence researcher in the School of Computer Science at Waipapa Taumata Rau, The University of Auckland, where he leads the Strong AI Lab and co-directs the NAO Institute for Natural, Artificial and Organisational Intelligence. A Carnegie Mellon–trained computer scientist and former Cycorp and IBM Watson researcher, he works on reasoning, natural language understanding and AI for social good. Michael also advises government on AI policy. His experience in large-scale AI systems and responsible innovation informs the project's approach to intelligent, trustworthy research infrastructures.",
    bioSources: [
      {
        label: 'University of Auckland – Michael Witbrock profile',
        url: 'https://profiles.auckland.ac.nz/m-witbrock',
      },
      {
        label: 'Aotearoa AI – Michael Witbrock biography',
        url: 'https://aotearoaai.nz/michael-witbrock/',
      },
      {
        label: 'University of Auckland news – AI expert Witbrock tapped for government advice',
        url: 'https://www.auckland.ac.nz/en/news/2025/07/01/university-expert-witbrock-tapped-by-government-for-ai-advice-.html',
      },
    ],
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
    publicationSource: 'orcid',
    themeSlugs: ['genomics-data-science'],
    bio: "Professor Michael (Mik) Black is a biostatistician at the University of Otago whose research focuses on statistical genomics and the development of methods for analysing high-dimensional genomic data, especially in cancer and other human diseases. He co-leads the Genomics Aotearoa Bioinformatics Capability project and works extensively with collaborative, cross-disciplinary teams. Mik's experience in designing robust statistical pipelines and integrating diverse datasets supports the project's emphasis on reproducible, scalable analysis of genomic and biomedical information.",
    bioSources: [
      {
        label: 'University of Otago news – Promotion to professor for statistical genomics specialist',
        url: 'https://www.otago.ac.nz/news/newsroom/promotion-to-professor-for-statistical-genomics-specialist',
      },
      {
        label: 'NeSI / Genomics Aotearoa – Collaborative investment article (Dr Michael Black)',
        url: 'https://www.nesi.org.nz/news/2021/06/21-million-collaborative-investment-responds-growth-demand-and-scale-national-research',
      },
    ],
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
    publicationSource: 'orcid',
    themeSlugs: [
      'genomics-data-science',
      'biodiversity-ecology-biosecurity',
    ],
    bio: "Professor David Bryant is an applied mathematician in the Department of Mathematics and Statistics at the University of Otago. His research sits at the interface of mathematics, statistics and evolutionary biology, with contributions to phylogenetics, Bayesian statistics and the development of new models for evolutionary processes. David's work on tree- and network-based methods for evolutionary inference informs the project's mathematical foundations and helps ensure that its analytical tools for complex biological data are rigorous and well-grounded.",
    bioSources: [
      {
        label: 'University of Otago – Professor David Bryant profile',
        url: 'https://www.otago.ac.nz/maths-and-stats/people/professor-david-bryant',
      },
      {
        label: 'David Bryant personal page',
        url: 'https://www.maths.otago.ac.nz/~dbryant/',
      },
    ],
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
    publicationSource: 'orcid',
    themeSlugs: ['biodiversity-ecology-biosecurity'],
    bio: "Distinguished Professor Nigel French CNZM, FRSNZ is an infectious disease epidemiologist at Massey University. He has led major initiatives such as Te Niwha, the Infectious Diseases Research Platform, and the New Zealand Food Safety Science and Research Centre, and is internationally recognised for work on foodborne and zoonotic diseases. Nigel's expertise in one-health approaches, quantitative risk assessment and national research platforms contributes to the project's focus on robust, real-world applications of data-intensive science.",
    bioSources: [
      {
        label: 'Massey University – Distinguished Professor Nigel French profile',
        url: 'https://www.massey.ac.nz/massey/expertise/profile.cfm?stref=219830',
      },
      {
        label: 'One Health Aotearoa – Professor Nigel French',
        url: 'https://onehealth.org.nz/our-people/professor-nigel-french/',
      },
    ],
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
    themeSlugs: ['biodiversity-ecology-biosecurity'],
    bio: "Associate Professor Anna Santure is a geneticist in the School of Biological Sciences at Waipapa Taumata Rau, The University of Auckland. Her research uses genomic, ecological and environmental data to understand how wild populations respond and adapt to rapid environmental change, including work on threatened taonga species and invasive species. Anna is a principal investigator with Te Pūnaha Matatini, and brings to the project expertise in evolutionary genomics, conservation genetics and the integration of complex biological datasets into reproducible analytical workflows.",
    bioSources: [
      {
        label: 'Te Pūnaha Matatini – Anna Santure profile',
        url: 'https://www.tepunahamatatini.ac.nz/our-people/anna-santure',
      },
      {
        label: 'Santure group – People page',
        url: 'https://asanture.wordpress.com/people/',
      },
    ],
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
    publicationSource: 'orcid',
    themeSlugs: ['biodiversity-ecology-biosecurity'],
    bio: "Distinguished Professor Marti J. Anderson is an ecological statistician whose work bridges marine ecology, biodiversity and advanced statistical methods. Based at the New Zealand Institute for Advanced Study at Massey University and director of the research and software company PRIMER-e, she is renowned for developing multivariate techniques such as PERMANOVA and for contributions to experimental design and community ecology. Marti's experience translating cutting-edge statistical methods into usable software informs the project's aim of making sophisticated analytics accessible and reproducible for domain scientists.",
    bioSources: [
      {
        label: 'Wikipedia – Marti Anderson (statistician)',
        url: 'https://en.wikipedia.org/wiki/Marti_Anderson_(statistician)',
      },
      {
        label: 'NZIAS – Marti Anderson CV',
        url: 'https://www.nzias.ac.nz/docs/martianderson/martianderson_cv.pdf',
      },
      {
        label: 'PRIMER-e – Consulting (Marti Anderson)',
        url: 'https://www.primer-e.com/consulting',
      },
    ],
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
    themeSlugs: [
      'live-research-articles'
    ],
    bio: "Nokome Bentley is a marine scientist and data scientist, and the founder of Stencila, an open-source platform for reproducible, data-driven documents. He has more than two decades of experience in fisheries science and environmental data analysis, and works as a principal data scientist with Dragonfly Data Science. Nokome's recent work explores how generative AI can support transparent and provenance-aware scientific writing. He contributes to the project through his expertise in reproducible research tooling, open science and software engineering for scientific publishing.",
    bioSources: [
      {
        label: 'Dragonfly Data Science – Nokome Bentley profile',
        url: 'https://www.dragonfly.co.nz/people/bentley-nokome.html',
      },
      {
        label: 'opensource.com – Nokome Bentley author page',
        url: 'https://opensource.com/users/nokome',
      },
      {
        label: 'eLife Labs – Stencila: an office suite for reproducible research',
        url: 'https://elifesciences.org/labs/c496b8bb/stencila-an-office-suite-for-reproducible-research',
      },
    ],
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
    themeSlugs: ['trustworthy-explainable-ai'],
    bio: "Dr Neşet (Neset) Tan is a researcher in the Strong AI Lab at Waipapa Taumata Rau, The University of Auckland. With a background in mathematics and experience across academia and industry, his work focuses on natural language processing and the automation of data-science workflows. Neset contributes to the project by investigating how modern AI techniques can support live, interpretable research pipelines and by helping to bridge between statistical computing, software engineering and large-scale machine-learning systems.",
    bioSources: [
      {
        label: 'University of Auckland – Neset Tan profile',
        url: 'https://profiles.auckland.ac.nz/neset-tan',
      },
      {
        label: 'Machine Learning Group – Members (includes Neset Tan)',
        url: 'https://ml.auckland.ac.nz/members/',
      },
      {
        label: 'AI.ac.nz – SAIL members (includes Neşet Tan)',
        url: 'https://www.ai.ac.nz/sail/members/',
      },
    ],
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
    publicationSource: 'orcid',
    themeSlugs: ['biodiversity-ecology-biosecurity'],
    bio: "Dr Jonathan (Jo) Klawitter is a researcher in phylogenetic theory and algorithms whose work focuses on tree- and network-based models of evolutionary history. He has developed new results on rearrangement operations and distances on phylogenetic networks, and more recently on credible sets for Bayesian phylogenetic tree topology distributions and methods for visualising geophylogenies. Jo's expertise in discrete mathematics, algorithm design and computational phylogenetics strengthens the project's capability to represent, analyse and visualise complex evolutionary scenarios within live, updateable research outputs.",
    bioSources: [
      {
        label: 'Theory and Applications of Graphs – Rearrangement operations on unrooted phylogenetic networks',
        url: 'https://digitalcommons.georgiasouthern.edu/tag/vol6/iss2/6',
      },
      {
        label: 'arXiv – Credible Sets of Phylogenetic Tree Topology Distributions',
        url: 'https://arxiv.org/abs/2505.14532',
      },
      {
        label: 'Journal of Graph Algorithms and Applications – Visualizing Geophylogenies',
        url: 'https://jgaa.info/index.php/jgaa/article/view/2975/3000',
      },
    ],
  },
  {
    slug: 'gus-ellerm',
    name: 'Gus Ellerm',
    title: 'Postdoctoral Researcher',
    affiliation: 'University of Auckland',
    roleLabel: 'Post-Doc',
    email: 'gus.ellerm@auckland.ac.nz',
    orcidId: '0000-0001-8260-231X',
    photoUrl: '/photos/gus-ellerm.png',
    themeSlugs: [
      'live-research-articles',
    ],
    bio: 'Augustus (Gus) Ellerm is a computer scientist whose research centres on research workflows, provenance and live scientific publications. Based at the University of Canterbury, he is lead author of the "Enabling LivePublication" and "LivePublication: The Science Workflow Creates and Updates the Publication" papers, which prototype systems where computational workflows directly drive and update scientific articles. Gus\'s work on integrating workflow systems, provenance standards and publication technologies underpins this project\'s vision of dynamic, reproducible and machine-actionable research outputs.',
    bioSources: [
      {
        label: 'IEEE e-Science 2022 – Enabling LivePublication',
        url: 'https://www.computer.org/csdl/proceedings-article/e-science/2022/612400a419/1J6ht6w9Sa4',
      },
      {
        label: 'IEEE e-Science 2023 – LivePublication: The Science Workflow Creates and Updates the Publication',
        url: 'https://dblp.org/rec/conf/eScience/EllermGA23.html',
      },
      {
        label: 'eResearch NZ talk – From Static to Dynamic: LivePublication and the quest for reproducible living articles',
        url: 'https://eresearchnz.figshare.com/articles/presentation/From_Static_to_Dynamic_LivePublication_and_the_quest_for_reproducible_living_articles/28561049',
      },
    ],
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
