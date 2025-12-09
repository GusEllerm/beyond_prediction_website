# Partner Logos

Place partner logo images in this directory.

## File Naming

Use descriptive, lowercase filenames with hyphens, for example:
- `university-auckland.png`
- `mbie-logo.png`
- `partner-organization.png`

## Image Requirements

- **Format**: PNG, SVG, or JPG
- **Recommended size**: Approximately 220px × 120px (2× the display size for retina displays)
- **Display size**: Logos are displayed at 110px × 60px
- **Background**: Transparent or white background works best
- **Aspect ratio**: Flexible, but horizontal logos work best

## Usage

Reference logos in your partner data using the root-relative path:

```typescript
const partners: Partner[] = [
  {
    name: 'University of Auckland',
    url: 'https://www.auckland.ac.nz',
    logoSrc: '/logos/university-auckland.png'
  },
  // ... more partners
];
```

## Note

Files in the `public/` directory are served at the root path (`/`), so a file at `public/logos/logo.png` is accessed as `/logos/logo.png` in your code.

