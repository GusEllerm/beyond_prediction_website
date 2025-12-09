/**
 * Determines the active navigation link based on current pathname
 * @returns The active link identifier or null
 */
function getActiveLink(): string | null {
  const pathname = window.location.pathname;

  if (pathname === '/' || pathname === '/index.html') {
    return 'home';
  }
  if (pathname === '/about.html') {
    return 'about';
  }
  if (pathname === '/people.html' || pathname === '/person.html') {
    return 'people';
  }

  return null;
}

/**
 * Navbar component that renders a double-header layout with top navigation and brand/search bar
 * @param container - The container element to render the navbar into
 */
export function renderNavbar(container: HTMLElement): void {
  const activeLink = getActiveLink();

  const getNavLinkClass = (linkId: string): string => {
    return activeLink === linkId ? 'nav-link active' : 'nav-link';
  };

  const getNavLinkAria = (linkId: string): string => {
    return activeLink === linkId ? 'aria-current="page"' : '';
  };

  container.innerHTML = `
    <header class="bp-header">
      <nav class="navbar navbar-expand-lg navbar-light bp-navbar-bg border-bottom">
        <div class="container">
          <button
            class="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#bp-top-nav"
            aria-controls="bp-top-nav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="bp-top-nav">
            <ul class="navbar-nav me-auto mb-2 mb-lg-0">
              <li class="nav-item">
                <a class="${getNavLinkClass('home')}" href="/" ${getNavLinkAria('home')}>Home</a>
              </li>
              <li class="nav-item">
                <a class="${getNavLinkClass('about')}" href="/about.html" ${getNavLinkAria('about')}>About</a>
              </li>
              <li class="nav-item">
                <a class="${getNavLinkClass('people')}" href="/people.html" ${getNavLinkAria('people')}>People</a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      <div class="navbar navbar-light bp-navbar-bg">
        <div class="container d-flex flex-wrap align-items-center justify-content-between py-3">
          <a href="/" class="navbar-brand d-flex align-items-center mb-2 mb-lg-0 text-decoration-none">
            <span class="fw-semibold">Beyond Prediction</span>
          </a>
          <form class="col-12 col-lg-4 mb-2 mb-lg-0" role="search" id="bp-search-form">
            <input
              type="search"
              class="form-control"
              placeholder="Search research & projects..."
              aria-label="Search"
              id="bp-search-input"
            />
          </form>
        </div>
      </div>
    </header>
  `;

  // Attach search handler - redirects to search page with query
  const searchForm = container.querySelector<HTMLFormElement>('#bp-search-form');
  const searchInput = container.querySelector<HTMLInputElement>('#bp-search-input');

  if (searchForm && searchInput) {
    searchForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const query = searchInput.value.trim();

      if (!query) {
        return;
      }

      const searchUrl = `/search.html?q=${encodeURIComponent(query)}`;
      window.location.href = searchUrl;
    });
  }
}
