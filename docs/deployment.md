# Deployment Runbook

VibeGotchi is deployed from GitHub to Cloudflare Pages and GitHub Pages.

## Production URLs

- Cloudflare Pages: https://vibegotchi.pages.dev
- GitHub Pages: https://pascalai2024.github.io/VibeGotchi/
- Repository: https://github.com/PascalAI2024/VibeGotchi

## Cloudflare Pages

Cloudflare Pages is the primary production deployment because it supports Pages Functions.

Settings:

```text
Project name: vibegotchi
Git repository: PascalAI2024/VibeGotchi
Production branch: main
Build command: npm run build:pages
Build output directory: dist/app/browser
Root directory: /
Node version: 22
```

Environment variables:

```text
GITHUB_CLIENT_ID      Plaintext is acceptable
GITHUB_CLIENT_SECRET  Cloudflare Secret only
GITHUB_APP_CLIENT_ID  Plaintext is acceptable; optional enhanced mode
GITHUB_APP_CLIENT_SECRET Cloudflare Secret only; optional enhanced mode
NODE_VERSION          22
```

After changing environment variables or secrets, retry the latest deployment so Pages Functions pick up the new runtime values.

## GitHub OAuth App

OAuth app settings:

```text
Homepage URL: https://vibegotchi.pages.dev/
Authorization callback URL: https://vibegotchi.pages.dev/auth/callback
Requested scope: read:user
```

Do not request classic OAuth `repo` scope. Use the GitHub App enhanced mode for selected read-only repo access.

## GitHub App Enhanced Mode

Enhanced mode is optional. It lets users install VibeGotchi on selected personal or organization repositories so the app can read repo metadata and package manifests without write access.

GitHub App settings:

```text
Homepage URL: https://vibegotchi.pages.dev/
Callback URL: https://vibegotchi.pages.dev/github-app/callback
Expire user authorization tokens: enabled
Request user authorization during installation: enabled
```

Repository permissions:

```text
Metadata: Read-only
Contents: Read-only
```

Do not request write permissions, administration, issues, pull requests, workflows, deployments, or secrets. Users should install the app only on repositories they want VibeGotchi to score.

## GitHub Pages

GitHub Pages is static-only. It supports public lookup and demo mode. It cannot safely exchange OAuth codes because it cannot store a client secret.

The workflow is `.github/workflows/pages.yml`.

Repository settings:

```text
Pages source: GitHub Actions
Actions: enabled
```

## Build Selector

`scripts/build-pages.mjs` picks the correct Angular build:

```mermaid
flowchart LR
  Build[npm run build:pages] --> HasCF{CF_PAGES set?}
  HasCF -->|yes| Cloudflare[ng build --configuration cloudflare]
  HasCF -->|no| GitHubPages[ng build --configuration pages]
  Cloudflare --> RootBase[base href /]
  GitHubPages --> RepoBase[base href /VibeGotchi/]
```

## Verification Commands

```bash
npm run lint
npm run typecheck:functions
CF_PAGES=1 npm run build:pages
curl -s https://vibegotchi.pages.dev/ | rg '<base href="/"'
curl -s -o /dev/null -w '%{http_code}\n' 'https://vibegotchi.pages.dev/api/auth/url?origin=https%3A%2F%2Fvibegotchi.pages.dev'
curl -s -o /dev/null -w '%{http_code}\n' 'https://vibegotchi.pages.dev/api/github-app/url?origin=https%3A%2F%2Fvibegotchi.pages.dev'
```

Expected auth URL status: `200`.
