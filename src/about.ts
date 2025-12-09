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

const navbarContainer = document.querySelector<HTMLElement>('#navbar');
const app = document.querySelector<HTMLElement>('#app');
const footerContainer = document.querySelector<HTMLElement>('#footer');

if (!navbarContainer || !app || !footerContainer) {
  throw new Error('Layout containers not found on About page');
}

renderNavbar(navbarContainer);
footerContainer.innerHTML = renderFooter(partners);

const aboutHtml = `
  <div class="container py-5">
    <div class="row">
      <div class="col-lg-10 col-xl-8">
        <h1 class="mb-4">About Beyond Prediction</h1>
        <p class="lead">
          Beyond Prediction: Explanatory and Transparent Data Science is a seven-year national research programme designed to develop deep data science methods that connect data to meaning, causality and explanation, rather than just prediction.
        </p>
        <p>
          Its objectives are to create robust, transparent and reusable analytical tools and workflows that can be validated, maintained and explained automatically, and to embed these in "live" data science environments and journals so that analyses and publications can update as data and methods change.
        </p>
        <p>
          The programme aims to unlock the value of Aotearoa New Zealand's existing digital data assets in high-impact domains such as cancer and infectious disease, biodiversity and ecology, and human genomics, while explicitly advancing Vision Mātauranga through Māori-led data and genomics work.
        </p>
        <p>
          Alongside the research, Beyond Prediction is committed to lifting national capability by training researchers at scale, building communities of practice, and ensuring that modern data science methods can be applied in governance, industry, science and healthcare in a defensible and trustworthy way.
        </p>
      </div>
    </div>
  </div>
`;

app.innerHTML = aboutHtml;

