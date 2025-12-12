import type { ExampleExtensionMount } from './extensions';

export const mountExampleExtension: ExampleExtensionMount = (root, _project, _example) => {
  root.innerHTML = `
    <section class="mb-5">
      <p class="text-muted">
        The Research Bazaar (ResBaz) is a global community promoting digital literacy at the centre of modern research. Every year, ResBaz events are held across the globe to equip the research community with practical digital skills to do their research better, faster, and smarter. ResBaz is an event unlike any academic conference. Research Bazaar Aotearoa is a free online digital research skills workshop series. It is open to everyone within the Aotearoa research community. We take an inclusive approach, and define the research community as everyone who applies digital skills to research. This includes researchers, research students, research support, technicians, librarians, research communicators, volunpeers, archivists, citizen scientists, and more. ResBaz Aotearoa is a collaboration between the University of Auckland, Victoria University of Wellington, University of Otago, Plant & Food Research, University of Waikato, and the <a href="https://www.mbie.govt.nz/science-and-technology/science-and-innovation/funding-information-and-opportunities/investment-funds/strategic-science-investment-fund/ssif-funded-programmes" target="_blank" rel="noopener noreferrer" class="text-decoration-none">Beyond Prediction: Explanatory and Transparent Data Science Programme</a>. Instructors are based at a variety of Aotearoa research institutions and companies, and they volunteer to teach at ResBaz. We wouldn't be able to do it without them and we appreciate their willingness to share their knowledge.
      </p>
    </section>
  `;
};

