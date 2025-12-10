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
    summary: 'Placeholder summary for the 2024–2025 Beyond Prediction annual report.',
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

