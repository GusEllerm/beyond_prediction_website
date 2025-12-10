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
    slug: '2020-2021',
    fromYear: 2020,
    toYear: 2021,
    title: 'Annual Report 2020–2021',
    summary: 'Placeholder summary for the 2020–2021 Beyond Prediction annual report.',
    htmlPartialPath: '/content/reports/2020-2021.html',
  },
  {
    slug: '2021-2022',
    fromYear: 2021,
    toYear: 2022,
    title: 'Annual Report 2021–2022',
    summary: 'Placeholder summary for the 2021–2022 Beyond Prediction annual report.',
    htmlPartialPath: '/content/reports/2021-2022.html',
  },
  {
    slug: '2022-2023',
    fromYear: 2022,
    toYear: 2023,
    title: 'Annual Report 2022–2023',
    summary: 'Placeholder summary for the 2022–2023 Beyond Prediction annual report.',
    htmlPartialPath: '/content/reports/2022-2023.html',
  },
  {
    slug: '2023-2024',
    fromYear: 2023,
    toYear: 2024,
    title: 'Annual Report 2023–2024',
    summary: 'Placeholder summary for the 2023–2024 Beyond Prediction annual report.',
    htmlPartialPath: '/content/reports/2023-2024.html',
  },
  {
    slug: '2024-2025',
    fromYear: 2024,
    toYear: 2025,
    title: 'Annual Report 2024–2025',
    summary: 'Beyond Prediction is a national data science and AI programme making research more trustworthy and useful for Aotearoa. In 2024–2025 it delivered new methods for linking genomes to disease risk, models to understand how threatened and invasive species respond to environmental change, and a flagship LivePublication case study that turns static papers into updatable, data-driven research objects. The programme also strengthened New Zealand’s AI capability through shared tools, open datasets, and training that connects researchers, government, and iwi partners.',
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

