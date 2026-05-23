# VibeGotchi

A GitHub-powered virtual pet that evolves with your commit activity.

VibeGotchi reads recent public GitHub events, turns pushes and streaks into XP, and renders a tiny judgmental companion with five stages: Egg, Baby, Teen, Adult, and Elder. The app also includes an evolution demo, so visitors can preview the full lifecycle without pretending they commit every day. Civilised.

## Features

- Public GitHub username lookup with no login required
- Optional GitHub OAuth login for higher API rate limits
- Evolution demo for all pet stages
- Animated SVG pet states and posture controls
- Static GitHub Pages deployment
- Cloudflare Pages deployment with same-origin OAuth Functions

## Local Development

Prerequisites: Node.js 22 and npm.

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## GitHub Login

GitHub Pages cannot exchange OAuth codes because it cannot keep a client secret. The repo therefore ships two modes:

- Static Pages app: public lookup and demo work immediately.
- Cloudflare Pages app: deploy from GitHub and use the included `functions/` routes for same-origin OAuth.

### Create the GitHub OAuth App

In GitHub, create an OAuth app with:

- Homepage URL: `https://vibegotchi.pages.dev/`
- Authorization callback URL: `https://vibegotchi.pages.dev/auth/callback`

Set `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` in Cloudflare Pages environment variables.

For local SSR testing, copy `.env.example` to `.env` and run the built server after `npm run build`.

## Deploy on Cloudflare Pages

Create a Cloudflare Pages project connected to `PascalAI2024/VibeGotchi`.

Build settings:

```text
Framework preset: None
Build command: npm run build:pages
Build output directory: dist/app/browser
Root directory: /
Node version: 22
```

`npm run build:pages` automatically selects the Cloudflare root-path build when `CF_PAGES` is present. GitHub Actions uses the same command but keeps the `/VibeGotchi/` base path required by GitHub Pages.

The included `functions/` directory is deployed by Cloudflare Pages and handles:

- `/api/auth/url`
- `/auth/callback`

## Deploy on GitHub Pages

The included workflow deploys on pushes to `main`.

Repository settings required:

- Pages source: GitHub Actions
- Actions enabled
- Optional repository variable: `AUTH_API_BASE_URL`

## Scripts

```bash
npm run dev          # Angular dev server
npm run build        # Production build with SSR output
npm run build:pages  # Static Pages build; auto-detects Cloudflare vs GitHub Pages
npm run build:cloudflare # Static root-path build for Cloudflare Pages
npm run lint         # ESLint
npm test             # Unit tests
```

## License

MIT
