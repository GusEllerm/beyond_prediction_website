import type { ExampleExtensionMount } from './extensions';

export const mountExampleExtension: ExampleExtensionMount = (root, _project, _example) => {
  root.innerHTML = `
    <section class="mb-5">
      <div class="mb-4">
        <p class="text-muted">
          ResBaz (Research Bazaar) is a digital research skills festival designed to boost the computational and data capabilities of the research community. It exists because modern scholarship increasingly depends on digital tools and workflows, yet PhD students and early-career researchers often have limited formal opportunities to learn these skills. ResBaz responds to this gap by offering accessible, practical training that builds digital literacy, dexterity, and capacity for collaboration across disciplines.
        </p>
      </div>
      
      <div class="mb-4">
        <p class="text-muted">
          The festival runs as a series of regional events hosted around the world, with the University of Auckland coordinating ResBaz Aotearoa since 2016. Since 2020 it has operated online across Aotearoa, remaining free and open to anyone in the New Zealand research community. Participants can "pick and mix" from a timetable of workshops taught by experts. In 2022, ResBaz Aotearoa offered 46 sessions, attracted 5,075 session registrations from 1,486 individuals, with 85% of attendees based in New Zealand but representing 55 countries overall, and about 70% attending ResBaz for the first time.
        </p>
      </div>
      
      <div class="mt-4">
        <p class="text-muted">
          The programme covers a broad range of topics, with a strong emphasis on data science and foundational computational skills. This includes Carpentries-style workshops on spreadsheets, data cleaning, R, Python, Git, command line, and newer offerings in machine learning and deep learning. Participant feedback highlights the diversity and practicality of sessions, the value of learning tools researchers are "supposed to know" but rarely get time to learn, and the welcoming, low-pressure environment that reassures attendees they don't need to know everything to be successful researchers.
        </p>
      </div>
    </section>
  `;
};

