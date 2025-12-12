import type { ExampleExtensionMount } from './extensions';

// Data types and constants
type DestinationCategory =
  | 'uni'
  | 'cri'
  | 'indep'
  | 'govt'
  | 'business'
  | 'vocational'
  | 'overseas'
  | 'other';

interface DestinationData {
  year: number;
  category: DestinationCategory;
  count: number;
}

const destinationData: DestinationData[] = [
  // 2022
  { year: 2022, category: 'uni', count: 821 },
  { year: 2022, category: 'cri', count: 79 },
  { year: 2022, category: 'other', count: 124 + 455 },

  // 2023
  { year: 2023, category: 'uni', count: 994 },
  { year: 2023, category: 'cri', count: 115 },
  { year: 2023, category: 'other', count: 236 + 117 },

  // 2024
  { year: 2024, category: 'uni', count: 787 },
  { year: 2024, category: 'cri', count: 173 },
  { year: 2024, category: 'indep', count: 16 },
  { year: 2024, category: 'govt', count: 84 },
  { year: 2024, category: 'business', count: 18 },
  { year: 2024, category: 'vocational', count: 36 },
  { year: 2024, category: 'overseas', count: 86 },
  { year: 2024, category: 'other', count: 71 + 183 },

  // 2025
  { year: 2025, category: 'uni', count: 1259 },
  { year: 2025, category: 'cri', count: 178 },
  { year: 2025, category: 'indep', count: 30 },
  { year: 2025, category: 'govt', count: 122 },
  { year: 2025, category: 'business', count: 33 },
  { year: 2025, category: 'vocational', count: 84 },
  { year: 2025, category: 'overseas', count: 154 },
  { year: 2025, category: 'other', count: 189 + 148 },
];

const categoryOrder: DestinationCategory[] = [
  'uni',
  'cri',
  'indep',
  'govt',
  'business',
  'vocational',
  'overseas',
  'other',
];

const categoryLabels: Record<DestinationCategory, string> = {
  uni: 'University',
  cri: 'Crown Research Institute',
  indep: 'Independent',
  govt: 'Government',
  business: 'Business',
  vocational: 'Vocational / Training',
  overseas: 'Overseas',
  other: 'Other / Unknown',
};

const categoryColors: Record<DestinationCategory, string> = {
  uni: '#0d6efd', // blue
  cri: '#198754', // green
  indep: '#6f42c1', // purple
  govt: '#0dcaf0', // cyan
  business: '#fd7e14', // orange
  vocational: '#20c997', // teal
  overseas: '#6c757d', // gray
  other: '#adb5bd', // light gray
};

// Helper functions
function getYearTotals(data: DestinationData[]): Map<number, number> {
  const totals = new Map<number, number>();
  for (const item of data) {
    const current = totals.get(item.year) || 0;
    totals.set(item.year, current + item.count);
  }
  return totals;
}

function getCategoryCountsForYear(
  data: DestinationData[],
  year: number
): Map<DestinationCategory, number> {
  const counts = new Map<DestinationCategory, number>();
  for (const item of data) {
    if (item.year === year) {
      counts.set(item.category, item.count);
    }
  }
  return counts;
}


// Chart rendering function
function renderDestinationChart(container: HTMLElement): void {
  const years = [2022, 2023, 2024, 2025];
  const yearTotals = getYearTotals(destinationData);
  const maxTotal = Math.max(...Array.from(yearTotals.values()));
  const maxY = Math.ceil(maxTotal / 500) * 500; // Round up to nearest 500

  // Chart dimensions
  const margin = { top: 24, right: 24, bottom: 48, left: 48 };
  const chartWidth = 800;
  const chartHeight = 400;
  const legendHeight = 120; // Space for legend below chart
  const totalHeight = chartHeight + legendHeight; // Total SVG height including legend
  const innerWidth = chartWidth - margin.left - margin.right;
  const innerHeight = chartHeight - margin.top - margin.bottom;
  const barWidth = (innerWidth / years.length) * 0.6;
  const barSpacing = innerWidth / years.length;

  // Create tooltip
  const tooltip = document.createElement('div');
  tooltip.className = 'destination-tooltip';
  tooltip.style.position = 'absolute';
  tooltip.style.pointerEvents = 'none';
  tooltip.style.visibility = 'hidden';
  container.style.position = 'relative';
  container.appendChild(tooltip);

  // Add tooltip styles if not already present
  if (!document.getElementById('destination-tooltip-styles')) {
    const style = document.createElement('style');
    style.id = 'destination-tooltip-styles';
    style.textContent = `
      .destination-tooltip {
        background: #fff;
        border: 1px solid rgba(0, 0, 0, 0.15);
        border-radius: 0.25rem;
        padding: 0.25rem 0.5rem;
        font-size: 0.8rem;
        box-shadow: 0 0.25rem 0.5rem rgba(0, 0, 0, 0.1);
        z-index: 10;
        white-space: nowrap;
      }
    `;
    document.head.appendChild(style);
  }

  // Create SVG
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${chartWidth} ${totalHeight}`);
  svg.setAttribute('role', 'img');
  svg.style.width = '100%';
  svg.style.maxHeight = '520px';
  svg.style.display = 'block';

  // Add title and description for accessibility
  const titleId = 'destination-chart-title';
  const descId = 'destination-chart-desc';
  const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
  title.setAttribute('id', titleId);
  title.textContent =
    'ResBaz Aotearoa participants by institution type (absolute counts, 2022–2025)';
  svg.appendChild(title);

  const desc = document.createElementNS('http://www.w3.org/2000/svg', 'desc');
  desc.setAttribute('id', descId);
  desc.textContent =
    'Stacked bar chart showing the number of ResBaz Aotearoa participants by destination institution type for each year from 2022 to 2025. Categories include University, Crown Research Institute, Independent, Government, Business, Vocational/Training, Overseas, and Other/Unknown.';
  svg.appendChild(desc);

  svg.setAttribute('aria-labelledby', `${titleId} ${descId}`);

  // Create group for chart content
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.setAttribute('transform', `translate(${margin.left},${margin.top})`);
  svg.appendChild(g);

  // Y-axis scale
  const yScale = (value: number): number => {
    return innerHeight - (value / maxY) * innerHeight;
  };

  // Y-axis grid lines and labels
  const yTicks = [0, 500, 1000, 1500, 2000].filter((tick) => tick <= maxY);
  for (const tick of yTicks) {
    const y = yScale(tick);

    // Grid line
    const gridLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    gridLine.setAttribute('x1', '0');
    gridLine.setAttribute('y1', String(y));
    gridLine.setAttribute('x2', String(innerWidth));
    gridLine.setAttribute('y2', String(y));
    gridLine.setAttribute('stroke', '#e0e0e0');
    gridLine.setAttribute('stroke-width', '1');
    g.appendChild(gridLine);

    // Y-axis label
    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.setAttribute('x', '-10');
    label.setAttribute('y', String(y + 4));
    label.setAttribute('text-anchor', 'end');
    label.setAttribute('font-size', '12');
    label.setAttribute('fill', '#666');
    label.textContent = String(tick);
    g.appendChild(label);
  }

  // Y-axis line
  const yAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  yAxis.setAttribute('x1', '0');
  yAxis.setAttribute('y1', '0');
  yAxis.setAttribute('x2', '0');
  yAxis.setAttribute('y2', String(innerHeight));
  yAxis.setAttribute('stroke', '#333');
  yAxis.setAttribute('stroke-width', '2');
  g.appendChild(yAxis);

  // Store references to all segments and legend items for hover effects
  const allSegments: SVGRectElement[] = [];
  const legendItems = new Map<DestinationCategory, { swatch: SVGRectElement; label: SVGTextElement }>();
  const trendPoints: Array<{ x: number; y: number; year: number; total: number }> = [];

  // Render bars for each year
  years.forEach((year, yearIndex) => {
    const x = yearIndex * barSpacing + (barSpacing - barWidth) / 2;
    const categoryCounts = getCategoryCountsForYear(destinationData, year);
    let stackedOffset = 0;

    // Stack categories in order
    for (const category of categoryOrder) {
      const count = categoryCounts.get(category) || 0;
      if (count > 0) {
        const height = (count / maxY) * innerHeight;
        const y = innerHeight - (stackedOffset / maxY) * innerHeight - height;
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', String(x));
        rect.setAttribute('y', String(y));
        rect.setAttribute('width', String(barWidth));
        rect.setAttribute('height', String(height));
        rect.setAttribute('fill', categoryColors[category]);
        rect.setAttribute('stroke', '#fff');
        rect.setAttribute('stroke-width', '1');
        rect.setAttribute('data-year', String(year));
        rect.setAttribute('data-category', category);
        rect.setAttribute('data-count', String(count));
        rect.style.cursor = 'pointer';
        rect.style.transition = 'opacity 0.2s';

        allSegments.push(rect);

        // Hover interaction
        rect.addEventListener('mouseenter', (e: MouseEvent) => {
          const target = e.target as SVGRectElement;
          const hoverYear = parseInt(target.getAttribute('data-year') || '0', 10);
          const hoverCategory = target.getAttribute('data-category') as DestinationCategory;
          const hoverCount = parseInt(target.getAttribute('data-count') || '0', 10);
          const hoverTotal = yearTotals.get(hoverYear) || 0;

          // Highlight this segment
          target.style.opacity = '1';
          target.setAttribute('stroke-width', '2');
          target.setAttribute('stroke', '#000');

          // Dim other segments in the same bar
          allSegments.forEach((seg) => {
            if (
              seg.getAttribute('data-year') === String(hoverYear) &&
              seg !== target
            ) {
              seg.style.opacity = '0.4';
            }
          });

          // Highlight legend
          const legendItem = legendItems.get(hoverCategory);
          if (legendItem) {
            legendItem.label.setAttribute('font-weight', '700');
            legendItem.swatch.setAttribute('stroke-width', '2');
            legendItem.swatch.setAttribute('stroke', '#000');
          }

          // Show tooltip
          tooltip.innerHTML = `
            <strong>${hoverYear}</strong> – ${categoryLabels[hoverCategory]}: 
            <strong>${hoverCount.toLocaleString()}</strong> participant${hoverCount !== 1 ? 's' : ''} 
            (total ${hoverTotal.toLocaleString()})
          `;
          tooltip.style.visibility = 'visible';
        });

        rect.addEventListener('mousemove', (e: MouseEvent) => {
          const rectBounds = container.getBoundingClientRect();
          tooltip.style.left = `${e.clientX - rectBounds.left + 10}px`;
          tooltip.style.top = `${e.clientY - rectBounds.top + 10}px`;
        });

        rect.addEventListener('mouseleave', () => {
          // Reset all segments
          allSegments.forEach((seg) => {
            seg.style.opacity = '1';
            seg.setAttribute('stroke-width', '1');
            seg.setAttribute('stroke', '#fff');
          });

          // Reset legend
          legendItems.forEach((item) => {
            item.label.setAttribute('font-weight', '400');
            item.swatch.setAttribute('stroke-width', '1');
            item.swatch.setAttribute('stroke', '#333');
          });

          // Hide tooltip
          tooltip.style.visibility = 'hidden';
        });

        g.appendChild(rect);
        stackedOffset += count;
      }
    }

    // Store trend point (top of bar = total for year)
    const yearTotal = yearTotals.get(year) || 0;
    const trendX = yearIndex * barSpacing + barSpacing / 2;
    const trendY = yScale(yearTotal);
    trendPoints.push({ x: trendX, y: trendY, year, total: yearTotal });

    // X-axis label (year)
    const yearLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    yearLabel.setAttribute('x', String(yearIndex * barSpacing + barSpacing / 2));
    yearLabel.setAttribute('y', String(innerHeight + 25));
    yearLabel.setAttribute('text-anchor', 'middle');
    yearLabel.setAttribute('font-size', '14');
    yearLabel.setAttribute('font-weight', '500');
    yearLabel.setAttribute('fill', '#333');
    yearLabel.textContent = String(year);
    g.appendChild(yearLabel);
  });

  // Draw trend line (connect the tops of bars)
  if (trendPoints.length > 1) {
    const trendLine = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    let pathData = `M ${trendPoints[0].x} ${trendPoints[0].y}`;
    for (let i = 1; i < trendPoints.length; i++) {
      pathData += ` L ${trendPoints[i].x} ${trendPoints[i].y}`;
    }
    trendLine.setAttribute('d', pathData);
    trendLine.setAttribute('fill', 'none');
    trendLine.setAttribute('stroke', '#dc3545'); // Bootstrap danger/red color
    trendLine.setAttribute('stroke-width', '3');
    trendLine.setAttribute('stroke-dasharray', '5,5');
    trendLine.setAttribute('opacity', '0.8');
    trendLine.style.pointerEvents = 'none';
    g.appendChild(trendLine);

    // Add data points (circles) at each year's total
    trendPoints.forEach((point) => {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', String(point.x));
      circle.setAttribute('cy', String(point.y));
      circle.setAttribute('r', '5');
      circle.setAttribute('fill', '#dc3545');
      circle.setAttribute('stroke', '#fff');
      circle.setAttribute('stroke-width', '2');
      circle.setAttribute('data-year', String(point.year));
      circle.setAttribute('data-total', String(point.total));
      circle.style.cursor = 'pointer';

      // Hover interaction for trend points
      circle.addEventListener('mouseenter', (e: MouseEvent) => {
        const target = e.target as SVGCircleElement;
        const hoverYear = parseInt(target.getAttribute('data-year') || '0', 10);
        const hoverTotal = parseInt(target.getAttribute('data-total') || '0', 10);

        // Highlight trend line and points
        trendLine.setAttribute('stroke-width', '4');
        trendLine.setAttribute('opacity', '1');
        trendPoints.forEach((p) => {
          const c = g.querySelector(`circle[data-year="${p.year}"]`) as SVGCircleElement;
          if (c) {
            c.setAttribute('r', '6');
            c.setAttribute('stroke-width', '3');
          }
        });

        // Show tooltip
        tooltip.innerHTML = `
          <strong>${hoverYear}</strong> – Total: 
          <strong>${hoverTotal.toLocaleString()}</strong> participant${hoverTotal !== 1 ? 's' : ''}
        `;
        tooltip.style.visibility = 'visible';
      });

      circle.addEventListener('mousemove', (e: MouseEvent) => {
        const rectBounds = container.getBoundingClientRect();
        tooltip.style.left = `${e.clientX - rectBounds.left + 10}px`;
        tooltip.style.top = `${e.clientY - rectBounds.top + 10}px`;
      });

      circle.addEventListener('mouseleave', () => {
        // Reset trend line and points
        trendLine.setAttribute('stroke-width', '3');
        trendLine.setAttribute('opacity', '0.8');
        trendPoints.forEach((p) => {
          const c = g.querySelector(`circle[data-year="${p.year}"]`) as SVGCircleElement;
          if (c) {
            c.setAttribute('r', '5');
            c.setAttribute('stroke-width', '2');
          }
        });
        tooltip.style.visibility = 'hidden';
      });

      g.appendChild(circle);
    });
  }

  // X-axis line
  const xAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  xAxis.setAttribute('x1', '0');
  xAxis.setAttribute('y1', String(innerHeight));
  xAxis.setAttribute('x2', String(innerWidth));
  xAxis.setAttribute('y2', String(innerHeight));
  xAxis.setAttribute('stroke', '#333');
  xAxis.setAttribute('stroke-width', '2');
  g.appendChild(xAxis);

  // Legend (below chart)
  const legendStartY = innerHeight + 60;
  const legendX = 0;
  const legendItemHeight = 20;
  const legendSwatchSize = 12;
  const legendTextGap = 8;
  const legendRowGap = 8; // Increased gap between rows
  const itemsPerRow = 4; // Number of items per row
  const estimatedItemWidth = 180; // Estimated width per item (swatch + gap + text)

  // Get categories that appear in data
  const categoriesInData = new Set<DestinationCategory>();
  destinationData.forEach((item) => categoriesInData.add(item.category));

  // Add trend line to legend first
  const trendLegendY = legendStartY;
  const trendLineLegend = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  trendLineLegend.setAttribute('x1', String(legendX));
  trendLineLegend.setAttribute('y1', String(trendLegendY + legendSwatchSize / 2));
  trendLineLegend.setAttribute('x2', String(legendX + 20));
  trendLineLegend.setAttribute('y2', String(trendLegendY + legendSwatchSize / 2));
  trendLineLegend.setAttribute('stroke', '#dc3545');
  trendLineLegend.setAttribute('stroke-width', '3');
  trendLineLegend.setAttribute('stroke-dasharray', '5,5');
  trendLineLegend.setAttribute('opacity', '0.8');
  g.appendChild(trendLineLegend);

  const trendLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  trendLabel.setAttribute('x', String(legendX + 20 + legendTextGap));
  trendLabel.setAttribute('y', String(trendLegendY + legendSwatchSize - 2));
  trendLabel.setAttribute('font-size', '12');
  trendLabel.setAttribute('fill', '#333');
  trendLabel.setAttribute('font-weight', '500');
  trendLabel.textContent = 'Total trend';
  g.appendChild(trendLabel);

  // Render category legend items in a grid
  const categoryItems: DestinationCategory[] = [];
  for (const category of categoryOrder) {
    if (categoriesInData.has(category)) {
      categoryItems.push(category);
    }
  }

  categoryItems.forEach((category, index) => {
    const row = Math.floor(index / itemsPerRow);
    const col = index % itemsPerRow;
    const x = legendX + col * estimatedItemWidth;
    const y = legendStartY + (row + 1) * (legendItemHeight + legendRowGap);

    // Color swatch
    const swatch = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    swatch.setAttribute('x', String(x));
    swatch.setAttribute('y', String(y));
    swatch.setAttribute('width', String(legendSwatchSize));
    swatch.setAttribute('height', String(legendSwatchSize));
    swatch.setAttribute('fill', categoryColors[category]);
    swatch.setAttribute('stroke', '#333');
    swatch.setAttribute('stroke-width', '1');
    swatch.style.cursor = 'pointer';
    g.appendChild(swatch);

    // Label
    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.setAttribute('x', String(x + legendSwatchSize + legendTextGap));
    label.setAttribute('y', String(y + legendSwatchSize - 2));
    label.setAttribute('font-size', '12');
    label.setAttribute('fill', '#333');
    label.setAttribute('font-weight', '400');
    label.textContent = categoryLabels[category];
    label.style.cursor = 'pointer';
    g.appendChild(label);

    legendItems.set(category, { swatch, label });

    // Legend hover interaction
    const handleLegendEnter = () => {
      const hoverCategory = category;
      allSegments.forEach((seg) => {
        if (seg.getAttribute('data-category') === hoverCategory) {
          seg.style.opacity = '1';
          seg.setAttribute('stroke-width', '2');
          seg.setAttribute('stroke', '#000');
        } else {
          seg.style.opacity = '0.4';
        }
      });
      swatch.setAttribute('stroke-width', '2');
      swatch.setAttribute('stroke', '#000');
      label.setAttribute('font-weight', '700');
    };

    const handleLegendLeave = () => {
      allSegments.forEach((seg) => {
        seg.style.opacity = '1';
        seg.setAttribute('stroke-width', '1');
        seg.setAttribute('stroke', '#fff');
      });
      swatch.setAttribute('stroke-width', '1');
      swatch.setAttribute('stroke', '#333');
      label.setAttribute('font-weight', '400');
    };

    swatch.addEventListener('mouseenter', handleLegendEnter);
    swatch.addEventListener('mouseleave', handleLegendLeave);
    label.addEventListener('mouseenter', handleLegendEnter);
    label.addEventListener('mouseleave', handleLegendLeave);
  });

  container.appendChild(svg);
}

export const mountExampleExtension: ExampleExtensionMount = (root, _project, _example) => {
  root.innerHTML = `
    <section class="mb-5">
      <p class="text-muted">
        The Research Bazaar (ResBaz) is a global community promoting digital literacy at the centre of modern research. Every year, ResBaz events are held across the globe to equip the research community with practical digital skills to do their research better, faster, and smarter. ResBaz is an event unlike any academic conference. Research Bazaar Aotearoa is a free online digital research skills workshop series. It is open to everyone within the Aotearoa research community. We take an inclusive approach, and define the research community as everyone who applies digital skills to research. This includes researchers, research students, research support, technicians, librarians, research communicators, volunpeers, archivists, citizen scientists, and more. ResBaz Aotearoa is a collaboration between the University of Auckland, Victoria University of Wellington, University of Otago, Plant & Food Research, University of Waikato, and the <a href="https://www.mbie.govt.nz/science-and-technology/science-and-innovation/funding-information-and-opportunities/investment-funds/strategic-science-investment-fund/ssif-funded-programmes" target="_blank" rel="noopener noreferrer" class="text-decoration-none">Beyond Prediction: Explanatory and Transparent Data Science Programme</a>. Instructors are based at a variety of Aotearoa research institutions and companies, and they volunteer to teach at ResBaz. We wouldn't be able to do it without them and we appreciate their willingness to share their knowledge.
      </p>
    </section>
    
    <section class="mb-5">
      <h3 class="h4">ResBaz Aotearoa participants by institution type (2022–2025)</h3>
      <p class="text-muted">
        This chart summarises how ResBaz Aotearoa participants are distributed across the Aotearoa research community –
        including universities, Crown Research Institutes, government, business, vocational providers, and other
        organisations. 
      </p>
      <div id="destination-chart" class="mt-3"></div>
    </section>
  `;

  // Render the chart
  const container = root.querySelector<HTMLDivElement>('#destination-chart');
  if (container) {
    renderDestinationChart(container);
  }
};

