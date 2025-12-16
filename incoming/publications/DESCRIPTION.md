# Publication Description

## File: example_pub_record.txt

### Publication Details

**Title:** LivePublication: The Science Workflow Creates and Updates the Publication

**Format:** BibTeX citation entry

**Type:** Conference Proceedings Paper (@inproceedings)

**BibTeX Key:** ellerm2023livepublication

### Bibliographic Information

- **Authors:** 
  - Augustus Ellerm (Lead author)
  - Mark Gahegan
  - Benjamin Adams

- **Venue:** 2023 IEEE 19th International Conference on e-Science (e-Science)
- **Pages:** 1--10
- **Year:** 2023
- **Publisher/Organization:** IEEE

### Publication Summary

This publication describes the LivePublication system, a novel approach where the science workflow directly creates and updates the publication. This represents a paradigm shift from traditional static scientific publications to dynamic, workflow-driven documents that can be automatically updated as the underlying research progresses.

### Authors' Affiliations

- **Augustus (Gus) Ellerm:** Postdoctoral Researcher at University of Auckland, specialist in research workflows, provenance and live scientific publications. Lead author of the LivePublication paper series.
- **Mark Gahegan:** ORCID: 0000-0001-7209-8156, OpenAlex ID: https://openalex.org/A5069438601
- **Benjamin Adams:** ORCID: 0000-0002-1657-9809, OpenAlex ID: https://openalex.org/A5009482088

### Status in Repository

This publication **already exists** in the repository system at:
`src/data/publications/doi/10-1109-e-science58273-2023-10254857.json`

The existing JSON record includes:
- **OpenAlex ID:** https://openalex.org/W4387005217
- **DOI:** 10.1109/e-science58273.2023.10254857
- **Open Access URL:** https://doi.org/10.1109/e-science58273.2023.10254857
- **Full author metadata** with OpenAlex IDs and ORCID identifiers

### Related Publications

This publication is part of a series on LivePublication:
1. "Enabling LivePublication" (2022) - IEEE e-Science 2022
2. "LivePublication: The Science Workflow Creates and Updates the Publication" (2023) - IEEE e-Science 2023 (**this publication**)
3. "From Static to Dynamic: LivePublication and the quest for reproducible, living articles" - eResearch NZ presentation

### Research Themes

This publication is associated with the following research themes in the Beyond Prediction project:
- Live Research Articles
- AI Research Literature

### Notes

The BibTeX format in the dropped file is a standard citation export format. The repository uses a JSON-based publication storage system with enriched metadata including:
- OpenAlex identifiers
- ORCID identifiers for authors
- Open access URLs
- Author position information
- Structured author metadata

To add new publications in the future, use the repository's built-in scripts:
- `npm run add:doi <doi>` - Add a publication by DOI using the OpenAlex API
- `tsx scripts/create_publication_from_metadata.ts` - Create publication from manual metadata
