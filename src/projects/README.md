# Project Extensions

This directory contains per-project extension files that add custom content and functionality to specific research project detail pages.

## Overview

The project extension system allows you to add unique, custom elements (iframes, videos, interactive widgets, etc.) to individual project pages without modifying the generic project template. Each extension file corresponds to a specific project by matching the project's `slug`.

## How It Works

1. **Automatic Discovery**: The system automatically discovers all `.ts` files in this directory using Vite's `import.meta.glob`.

2. **Slug-Based Matching**: Each extension file is matched to a project by filename. The filename must match the project's `slug` from `src/data/researchProjects.ts`.

3. **Mount Function**: Each extension file exports a `mountProjectExtension` function that receives:
   - `root`: An `HTMLElement` where the extension should render
   - `project`: The full `ResearchProjectDetail` object for the project

4. **Rendering**: Extensions are automatically mounted after the main project content is rendered, appearing at the bottom of the project page.

## Creating a New Extension

### Step 1: Identify the Project Slug

Find the project's `slug` in `src/data/researchProjects.ts`. For example:
- `live-research-articles`
- `trustworthy-explainable-ai`
- `biodiversity-ecology-biosecurity`

### Step 2: Create the Extension File

Create a new TypeScript file named after the project slug:

```typescript
// src/projects/your-project-slug.ts
import type { ProjectExtensionMount } from './extensions';

export const mountProjectExtension: ProjectExtensionMount = (root, project) => {
  // Your custom content here
  root.innerHTML = `
    <section>
      <h2 class="h4 mb-3">Custom Section</h2>
      <p>This is specific to ${project.title}</p>
      <!-- Add your custom HTML, iframes, videos, etc. -->
    </section>
  `;
};
```

### Step 3: File Naming Convention

- **Filename must match the project slug exactly**
- Use kebab-case (e.g., `trustworthy-explainable-ai.ts`)
- File extension must be `.ts`

**Examples:**
- Project slug: `live-research-articles` → File: `live-research-articles.ts`
- Project slug: `trustworthy-explainable-ai` → File: `trustworthy-explainable-ai.ts`

## Extension Function Signature

```typescript
export const mountProjectExtension: ProjectExtensionMount = (
  root: HTMLElement,
  project: ResearchProjectDetail
) => {
  // Your implementation
};
```

**Parameters:**
- `root`: The DOM element where your extension should render. This is a `<section>` with `id="project-extension-root"` that appears at the bottom of the project page.
- `project`: The complete project data object, including `slug`, `title`, `shortDescription`, `keyQuestions`, `highlights`, `examples`, etc.

## Example Extensions

### Example 1: Embedding an Iframe

```typescript
import type { ProjectExtensionMount } from './extensions';

export const mountProjectExtension: ProjectExtensionMount = (root, project) => {
  root.innerHTML = `
    <section>
      <h2 class="h4 mb-3">Live Demo</h2>
      <div class="ratio ratio-16x9 mb-3">
        <iframe
          src="https://example.com/demo"
          title="${project.title} demo"
          loading="lazy"
          allowfullscreen
        ></iframe>
      </div>
    </section>
  `;
};
```

### Example 2: Custom Interactive Widget

```typescript
import type { ProjectExtensionMount } from './extensions';

export const mountProjectExtension: ProjectExtensionMount = (root, project) => {
  root.innerHTML = `
    <section>
      <h2 class="h4 mb-3">Interactive Tool</h2>
      <div id="custom-widget"></div>
    </section>
  `;
  
  // You can also add event listeners, initialize libraries, etc.
  const widget = root.querySelector('#custom-widget');
  if (widget) {
    // Initialize your widget here
  }
};
```

### Example 3: Using Project Data

```typescript
import type { ProjectExtensionMount } from './extensions';

export const mountProjectExtension: ProjectExtensionMount = (root, project) => {
  const hasExamples = project.examples && project.examples.length > 0;
  
  root.innerHTML = `
    <section>
      <h2 class="h4 mb-3">Project-Specific Content</h2>
      <p>This extension is for: <strong>${project.title}</strong></p>
      ${hasExamples ? `<p>This project has ${project.examples.length} examples.</p>` : ''}
    </section>
  `;
};
```

## Best Practices

1. **HTML Escaping**: When using project data in HTML, use the `escapeHtml` function from `src/project.ts` or manually escape user content to prevent XSS vulnerabilities.

2. **Bootstrap Classes**: Use Bootstrap 5 classes for consistent styling (the project uses Bootstrap 5).

3. **Accessibility**: Ensure your custom content is accessible:
   - Use semantic HTML
   - Include proper ARIA labels where needed
   - Ensure keyboard navigation works

4. **Performance**: 
   - Use `loading="lazy"` for iframes and images
   - Avoid blocking the main thread with heavy computations
   - Consider lazy-loading large libraries

5. **Error Handling**: Handle cases where the DOM might not be ready or elements might not exist.

## Files in This Directory

- `extensions.ts`: Type definitions for the extension system
- `live-research-articles.ts`: Example extension for the "Live Research Articles" project
- `*.ts`: Other project-specific extensions (one per project slug)

## Troubleshooting

**Extension not appearing?**
- Check that the filename exactly matches the project slug
- Ensure the file exports `mountProjectExtension` (not a different name)
- Check the browser console for errors
- Verify the project slug in `src/data/researchProjects.ts`

**TypeScript errors?**
- Ensure you import `ProjectExtensionMount` from `./extensions`
- Check that your function signature matches the type exactly

**Extension renders but looks wrong?**
- Check that you're using Bootstrap classes correctly
- Ensure your HTML is properly structured
- Use browser dev tools to inspect the rendered DOM

## Notes

- Extensions are **optional**: Projects without extension files render normally
- Extensions appear **after** all standard project content (questions, highlights, examples, etc.)
- The extension root element has the class `mt-5` for spacing
- Extensions are loaded eagerly (not lazy-loaded) for simplicity

