# Contributing

Thanks for considering a contribution to VibeGotchi.

## Development Setup

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Before Opening a PR

Run:

```bash
npm run lint
npm run typecheck:functions
CF_PAGES=1 npm run build:pages
```

## Project Areas

| Area | Files |
| --- | --- |
| Pet scoring | `src/app/pet-engine.service.ts` |
| GitHub API reads | `src/app/github.service.ts` |
| Dashboard UI | `src/app/dashboard/dashboard.component.ts` |
| Landing/demo UI | `src/app/landing/landing.component.ts` |
| OAuth Functions | `functions/` |
| Docs | `docs/` |

## Contribution Ideas

- New achievements
- Better badge tiers
- Additional demo profiles
- Share-card designs
- Tests for scoring edge cases
- Documentation improvements

## Security Rules

Do not commit secrets. Do not request broader GitHub OAuth scopes unless the feature truly requires it and the README/security docs are updated.
