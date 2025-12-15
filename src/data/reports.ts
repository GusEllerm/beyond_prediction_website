/**
 * Annual report data model
 */
export interface AnnualReport {
  slug: string; // e.g. "2020-2021"
  fromYear: number; // e.g. 2020
  toYear: number; // e.g. 2021
  title: string; // e.g. "Annual Report 2020–2021"
  summary?: string; // 1–2 sentence description for timeline / detail intro
  htmlPartialPath?: string; // path to HTML partial with full content
  pdfPath?: string; // optional: path to PDF asset when available
  docxPath?: string; // optional: path to DOCX asset when available
}

/**
 * Annual reports database
 */
export const reports: AnnualReport[] = [
  {
    slug: '2022-2023',
    fromYear: 2022,
    toYear: 2023,
    title: 'Annual Report 2022–2023',
    summary: 'In 2022–2023 Beyond Prediction achieved significant progress in four key areas: phylogenetic analysis linking genomics to disease, ecological modelling of endangered species, live science publishing that embeds experiments in research articles, and AI tools for validating scientific claims. The programme developed new methods and open-source software, strengthened collaborations with ESR and Genomics Aotearoa, and sponsored ResBaz 2022, training hundreds of researchers in data science skills.',
    htmlPartialPath: '/content/reports/2022-2023.html',
    docxPath: '/content/reports/2022-2023.docx',
  },
  {
    slug: '2023-2024',
    fromYear: 2023,
    toYear: 2024,
    title: 'Annual Report 2023–2024',
    summary: 'In 2023–2024 Beyond Prediction consolidated earlier advances into tools that make science more transparent and actionable, deploying a retrieval-augmented AI system and web interface for checking the evidence behind scientific claims, and an RO-Crate-based provenance model that lets research articles "write themselves" from distributed workflows. A genomic digital twin of the taonga hihi species now supports conservation decisions under climate change, while ResBaz 2024 and strengthened partnerships with ESR, Genomics Aotearoa and international institutes broadened the programme\'s impact.',
    htmlPartialPath: '/content/reports/2023-2024.html',
    docxPath: '/content/reports/2023-2024.docx',
  },
  {
    slug: '2024-2025',
    fromYear: 2024,
    toYear: 2025,
    title: 'Annual Report 2024–2025',
    summary: 'In 2024–2025 Beyond Prediction delivered new methods for linking genomes to disease risk, models to understand how threatened and invasive species respond to environmental change, and a flagship LivePublication case study that turns static papers into updatable, data-driven research objects. The programme also strengthened New Zealand’s AI capability through shared tools, open datasets, and training that connects researchers, government, and iwi partners.',
    htmlPartialPath: '/content/reports/2024-2025.html',
  },
];

/**
 * Helper function to find a report by slug
 * @param slug - The report slug to search for
 * @returns The matching AnnualReport or undefined if not found
 */
export function getReportBySlug(slug: string): AnnualReport | undefined {
  return reports.find((r) => r.slug === slug);
}

/**
 * Gets the latest report by year
 * @returns The latest AnnualReport or undefined if no reports exist
 */
export function getLatestReport(): AnnualReport | undefined {
  if (!reports.length) return undefined;

  return [...reports].sort((a, b) => {
    // Prefer sorting by toYear, fall back to fromYear
    const aYear = a.toYear ?? a.fromYear;
    const bYear = b.toYear ?? b.fromYear;
    return bYear - aYear;
  })[0];
}

/**
 * Gets the DOCX path for a report, deriving it from htmlPartialPath if not explicitly set
 * @param report - The annual report
 * @returns The DOCX path or undefined if not available
 */
export function getReportDocxPath(report: AnnualReport): string | undefined {
  if (report.docxPath) return report.docxPath;
  if (!report.htmlPartialPath) return undefined;

  if (report.htmlPartialPath.endsWith('.html')) {
    return report.htmlPartialPath.replace(/\.html$/, '.docx');
  }

  return undefined;
}

/**
 * Forward plan data model
 */
export interface ForwardPlan {
  slug: string;
  title: string;
  htmlPartialPath: string;
  docxPath: string;
  fromYear: number;
  toYear: number;
}

/**
 * Current forward plan
 */
export const currentForwardPlan: ForwardPlan = {
  slug: '2025-2026',
  title: 'Beyond Prediction SSIF Forward-Looking Plan 2025–2026',
  htmlPartialPath: '/content/forward-plan/2025-2026.html',
  docxPath: '/content/forward-plan/2025-2026.docx',
  fromYear: 2025,
  toYear: 2026,
};

