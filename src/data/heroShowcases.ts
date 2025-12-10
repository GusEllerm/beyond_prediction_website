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
    id: 'genomics',
    title: 'Genomics and phylogenies',
    summary: 'Interactive evolutionary trees and uncertainty visualisations.',
    kind: 'video',
    videoSrc: '/assets/hero-genomics-placeholder.mp4', // placeholder
  },
  {
    id: 'custom-html',
    title: 'AI for research literature',
    summary: 'Turning static papers into queryable, living documents.',
    kind: 'html',
    html: `
      <div class="ratio ratio-16x9 d-flex align-items-center justify-content-center bg-light rounded">
        <div class="text-center px-3">
          <p class="mb-1 fw-semibold">AI for research literature</p>
          <p class="mb-0 small text-muted">Prototype view of a dynamic literature graph (placeholder).</p>
        </div>
      </div>
    `,
    ctaLabel: 'Learn more',
    ctaHref: '/project.html?project=ai-research-literature',
  },
];

