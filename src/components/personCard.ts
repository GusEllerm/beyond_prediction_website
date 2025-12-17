import type { Person } from '../data/people';
import { escapeHtml } from '../utils/dom';

/**
 * Renders a person card for use in grids (People page, search results, etc.)
 * @param person - The person object to render
 * @returns HTML string for the person card
 */
export function renderPersonCard(person: Person): string {
  const href = person.slug ? `/person.html?person=${encodeURIComponent(person.slug)}` : '#';

  const photoHtml = person.photoUrl
    ? `
      <div class="bp-person-photo-wrapper">
        <img 
          src="${escapeHtml(person.photoUrl)}" 
          alt="${escapeHtml(person.name)}" 
          class="bp-person-photo rounded"
        />
      </div>
    `
    : '';

  return `
    <div class="col-md-6 col-lg-4 col-xl-3">
      <a href="${href}" class="text-decoration-none text-reset d-block h-100">
        <div class="card h-100 bp-person-card">
          <div class="card-body d-flex flex-column">
            <div class="d-flex align-items-start justify-content-between gap-3 bp-person-card-header">
              <div class="bp-person-text flex-grow-1">
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
              </div>
              ${photoHtml}
            </div>
            ${
              person.bioShort
                ? `<p class="card-text mt-2"><small>${escapeHtml(person.bioShort)}</small></p>`
                : ''
            }
          </div>
        </div>
      </a>
    </div>
  `;
}
