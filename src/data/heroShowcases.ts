export type HeroShowcaseKind = 'image' | 'iframe' | 'video' | 'html';

export interface HeroShowcase {
  id: string; // stable key, e.g. 'livepublication'
  title: string; // short label for the slide
  summary: string; // 1–2 line explanation
  kind: HeroShowcaseKind;

  // Image slide
  imageUrl?: string;
  imageAlt?: string;

  // Iframe slide
  iframeSrc?: string;

  // Video slide
  videoSrc?: string;

  // Fully custom HTML fragment (for advanced layouts)
  html?: string;

  ctaLabel?: string;
  ctaHref?: string;
}

export const heroShowcases: HeroShowcase[] = [
  {
    id: 'scitrue',
    title: 'SciTrue',
    summary: 'Scientific fact-checking and trustworthy AI.',
    kind: 'iframe',
    iframeSrc: 'https://www.youtube.com/embed/XhoHqCoyz3s?si=PsxiRWpPQevi8yjx',
  },
  {
    id: 'livepublication',
    title: 'LivePublication',
    summary: 'Publications linked to running workflows and reproducible containers.',
    kind: 'iframe',
    iframeSrc: 'https://www.youtube.com/embed/pqhcBD1745E?si=O9IEyNnJoUfl3BoX',
    ctaHref: '/project.html?project=live-research-articles',
  },
  {
    id: 'echology',
    title: 'Echology and Evolution',
    summary: 'Studying sex differences in genetic recombination helps explain how genomes evolve and guides modern conservation of threatened species.',
    kind: 'image',
    imageUrl: '/showcase/hehe.png', // placeholder
  },
  {
    id: 'stencila',
    title: 'AI for research literature',
    summary: 'Exploring state of the art publication mediums for science.',
    kind: 'image',
    imageUrl: '/showcase/stencila.png',
    imageAlt: 'Stencila logo',
  },
];

