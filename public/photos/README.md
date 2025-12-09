# People Photos

This directory contains photos for people profiles.

## Naming Convention

Photos should be named using the person's slug (from `src/data/people.ts`), with common image extensions:
- `mark-gahegan.jpg`
- `alexei-drummond.png`
- `nokome-bentley.jpg`
etc.

## Supported Formats

- `.jpg` / `.jpeg`
- `.png`
- `.webp`

## Usage

Photos are automatically loaded if the `photoUrl` field in `src/data/people.ts` is set to `/photos/<slug>.<ext>`.

Example:
```typescript
{
  slug: 'mark-gahegan',
  photoUrl: '/photos/mark-gahegan.jpg',
  // ...
}
```

