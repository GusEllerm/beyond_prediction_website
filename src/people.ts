// Import Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css';

// Import Bootstrap JS (for navbar toggle and other interactive components)
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

// Import custom styles
import './styles.css';

// Import components
import { renderNavbar } from './components/navbar';
import { renderFooter } from './components/footer';

// Import data
import { partners } from './data/partners';
import {
  principalInvestigators,
  coInvestigators,
  industryPartners,
  postDocs,
  type Person,
} from './data/people';

const navbarContainer = document.querySelector<HTMLElement>('#navbar');
const app = document.querySelector<HTMLElement>('#app');
const footerContainer = document.querySelector<HTMLElement>('#footer');

if (!navbarContainer || !app || !footerContainer) {
  throw new Error('Layout containers not found on People page');
}

renderNavbar(navbarContainer);
footerContainer.innerHTML = renderFooter(partners);

/**
 * Escapes HTML special characters to prevent XSS
 * @param text - Text to escape
 * @returns Escaped HTML string
 */
function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Renders a section of people as Bootstrap cards
 * @param heading - Section heading
 * @param people - Array of people to render
 * @returns HTML string for the section
 */
function renderPeopleSection(heading: string, people: Person[]): string {
  if (!people.length) {
    return '';
  }

  const cards = people
    .map((person) => {
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
    })
    .join('');

  return `
    <section class="mb-5">
      <h2 class="h3 mb-3">${escapeHtml(heading)}</h2>
      <div class="row g-4">
        ${cards}
      </div>
    </section>
  `;
}

const peopleHtml = `
  <div class="container py-5">
    <header class="mb-5">
      <h1 class="mb-3">Our People</h1>
      <p class="text-muted">
        Beyond Prediction brings together researchers, industry partners, and postdoctoral fellows across Aotearoa New Zealand.
        This page will be expanded with full profiles as the programme develops.
      </p>
    </header>

    ${renderPeopleSection('Principal Investigators', principalInvestigators)}
    ${renderPeopleSection('Co-Investigators', coInvestigators)}
    ${renderPeopleSection('Industry Partners', industryPartners)}
    ${renderPeopleSection('Post-Docs', postDocs)}
  </div>
`;

app.innerHTML = peopleHtml;

