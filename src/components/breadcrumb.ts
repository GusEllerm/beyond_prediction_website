import { escapeHtml } from '../utils/dom';

export interface BreadcrumbItem {
  label: string;
  href?: string; // if omitted or undefined, this item is treated as the active page
}

/**
 * Renders a Bootstrap breadcrumb from an ordered list of items.
 * Intended to be used inside a page header above the H1.
 * The last item (or any item without href) is rendered as the active page.
 */
export function renderBreadcrumb(items: BreadcrumbItem[]): string {
  if (!items.length) {
    return '';
  }

  const itemsHtml = items
    .map((item, index) => {
      const isLast = index === items.length - 1 || !item.href;

      if (isLast) {
        return `
          <li class="breadcrumb-item active" aria-current="page">
            ${escapeHtml(item.label)}
          </li>
        `;
      }

      // At this point, item.href is guaranteed to be defined (checked by isLast)
      const href = item.href as string;
      return `
        <li class="breadcrumb-item">
          <a href="${escapeHtml(href)}">${escapeHtml(item.label)}</a>
        </li>
      `;
    })
    .join('');

  return `
    <nav aria-label="breadcrumb" class="bp-breadcrumb">
      <ol class="breadcrumb small mb-1">
        ${itemsHtml}
      </ol>
    </nav>
  `;
}

