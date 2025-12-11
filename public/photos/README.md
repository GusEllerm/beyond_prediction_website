# People Photos

This directory contains photos for people profiles.

## Naming Convention

Photos should be named using the person's slug (from `src/data/people.ts`), with WebP extension for best performance:
- `mark-gahegan.webp`
- `alexei-drummond.webp`
- `nokome-bentley.webp`
etc.

## Supported Formats

- **`.webp`** (preferred - best compression and performance)
- `.jpg` / `.jpeg` (will be converted to WebP)
- `.png` (will be converted to WebP)

## Usage

Photos are automatically loaded if the `photoUrl` field in `src/data/people.ts` is set to `/photos/<slug>.<ext>`.

Example:
```typescript
{
  slug: 'mark-gahegan',
  photoUrl: '/photos/mark-gahegan.webp',
  // ...
}
```

