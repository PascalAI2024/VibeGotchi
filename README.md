# VibeGotchi

A GitHub-powered virtual pet that evolves with your commit activity.

VibeGotchi reads recent public GitHub events, turns pushes and streaks into XP, and renders a tiny judgmental companion with five stages: Egg, Baby, Teen, Adult, and Elder. The app also includes an evolution demo, so visitors can preview the full lifecycle without pretending they commit every day. Civilised.

## Features

- Public GitHub username lookup with no login required
- Optional GitHub OAuth login for higher API rate limits
- Evolution demo for all pet stages
- Animated SVG pet states and posture controls
- Static GitHub Pages deployment
- Optional Cloudflare Worker OAuth proxy for free authenticated login

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
- Optional auth proxy: deploy `workers/github-oauth-worker.js` to Cloudflare Workers, then point the Pages app at it.

### Create the GitHub OAuth App

In GitHub, create an OAuth app with:

- Homepage URL: `https://pascalai2024.github.io/VibeGotchi/`
- Authorization callback URL: `https://YOUR-WORKER-DOMAIN.workers.dev/auth/callback`

Set these Worker secrets:

```bash
wrangler secret put GITHUB_CLIENT_ID
wrangler secret put GITHUB_CLIENT_SECRET
```

Then add a GitHub repository variable named `AUTH_API_BASE_URL`:

```text
https://YOUR-WORKER-DOMAIN.workers.dev
```

The Pages workflow writes that value into `public/config.json` at build time.

For local SSR testing, copy `.env.example` to `.env` and run the built server after `npm run build`.

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
npm run build:pages  # Static build for GitHub Pages
npm run lint         # ESLint
npm test             # Unit tests
```

## License

MIT
