# Example Extensions

This directory contains extension modules for individual examples. Extensions allow you to add custom content to example pages beyond what's provided in the standard example data structure.

## How It Works

Each extension file should export a `mountExampleExtension` function that matches the `ExampleExtensionMount` type signature. The function receives:
- `root`: The HTMLElement where the extension should mount its content
- `project`: The `ResearchProject` object for the project containing this example
- `example`: The `ProjectExample` object for the example being extended

## File Naming Convention

Extension files should be named to match the example they extend. Two patterns are supported:

1. **Example-only pattern**: `{example-slug}.ts` - Matches any example with that slug across all projects
   - Example: `my-example.ts` matches example slug `my-example`

2. **Project-specific pattern**: `{project-slug}-{example-slug}.ts` - Matches a specific example in a specific project
   - Example: `live-research-articles-demo.ts` matches example slug `demo` in project `live-research-articles`

The project-specific pattern takes precedence if both patterns match.

## Example Extension

```typescript
import type { ExampleExtensionMount } from './extensions';

export const mountExampleExtension: ExampleExtensionMount = (root, project, example) => {
  root.innerHTML = `
    <section class="mb-5">
      <h2 class="h4 mb-3">Additional Content</h2>
      <p>This content is specific to the ${example.title} example in ${project.title}.</p>
      <!-- Your custom HTML here -->
    </section>
  `;
};
```

## Usage

1. Create a new `.ts` file in this directory following the naming convention above
2. Export a `mountExampleExtension` function with the signature from `extensions.ts`
3. The extension will automatically be discovered and mounted when the corresponding example page loads

