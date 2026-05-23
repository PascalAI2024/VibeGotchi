# Roadmap

VibeGotchi is already usable as a competition demo. These are the most practical next improvements.

## High Impact

- Server-side GitHub API proxy so browser never receives the OAuth access token.
- More demo personas: New Coder, Weekend Hacker, Startup Founder, Open Source Maintainer.
- Activity timeline strip with contribution-day hover states.
- More share-card themes.
- Achievement unlock animations.

## Scoring Improvements

- Framework detection from public package manifests where available.
- Repository topic badges.
- Separate private contribution count callout without implying repo access.
- Weighted recency model so old activity matters less than current work.

## Design Polish

- Dedicated screenshot workflow for README images.
- Animated loading states for GitHub API fetches.
- Better mobile dashboard hierarchy.
- Empty states for users with no public repositories.

## Engineering

- Unit tests for `PetEngineService`.
- Browser smoke test for the demo card and share card.
- CI job for lint, build, and function typecheck.
- Optional server-side token storage in Cloudflare KV or Durable Objects.
