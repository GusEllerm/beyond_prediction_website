import type { Person } from '../data/people';
import { escapeHtml } from '../utils/dom';

/**
 * Renders a person card for use in grids (People page, search results, etc.)
 * @param person - The person object to render
 * @returns HTML string for the person card
 */
export function renderPersonCard(person: Person): string {
  const href = person.slug
    ? `/person.html?person=${encodeURIComponent(person.slug)}`
    : '#';

  const photoHtml = person.photoUrl
    ? `
      <div class="col-auto">
        <img 
          src="${escapeHtml(person.photoUrl)}" 
          alt="${escapeHtml(person.name)}" 
          class="person-card-photo rounded"
          style="width: 80px; height: 80px; object-fit: cover;"
        />
      </div>
    `
    : '';

  const contentColumnClass = person.photoUrl ? 'col' : 'col-12';

  return `
    <div class="col-md-4 col-lg-3">
      <a href="${href}" class="text-decoration-none text-reset d-block h-100">
        <div class="card h-100">
          <div class="card-body">
            <div class="row g-2 align-items-start">
              <div class="${contentColumnClass}">
                <h3 class="h5 card-title mb-1">${escapeHtml(person.name)}</h3>
                ${
                  person.title
                    ? `<p class="card-subtitle text-muted mb-1">${escapeHtml(person.title)}</p>`
                    : ''
                }
                ${
                  person.affiliation
                    ? `<p class="card-text mb-2"><small>${escapeHtml(person.affiliation)}</small></p>`
                    : ''
                }
                ${
                  person.bioShort
                    ? `<p class="card-text"><small>${escapeHtml(person.bioShort)}</small></p>`
                    : ''
                }
              </div>
              ${photoHtml}
            </div>
          </div>
        </div>
      </a>
    </div>
  `;
}

