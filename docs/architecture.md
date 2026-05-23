# Architecture

VibeGotchi is an Angular 21 app with Cloudflare Pages Functions for the GitHub OAuth pieces that cannot live safely in a static browser bundle.

## System Schematic

```mermaid
flowchart TB
  subgraph Browser
    A[Landing Component]
    B[Dashboard Component]
    C[GithubService]
    D[PetEngineService]
  end

  subgraph Cloudflare Pages
    E[Static Angular Assets]
    F["/api/auth/url"]
    G["/auth/callback"]
    H[Encrypted Env Secret: GITHUB_CLIENT_SECRET]
  end

  subgraph GitHub
    I[OAuth Authorize]
    J[OAuth Token Exchange]
    K[REST API: user and public events]
    L[GraphQL API: contribution calendar]
  end

  A --> C
  C --> K
  C --> L
  A --> F
  F --> I
  I --> G
  G --> J
  H --> G
  C --> D
  D --> B
```

## Runtime Modes

```mermaid
flowchart LR
  UserChoice{Visitor action}
  UserChoice -->|Demo card| DemoState[Use built-in PetState]
  UserChoice -->|Public lookup| Events[Fetch recent public events]
  UserChoice -->|GitHub login| Contributions[Fetch read-only contribution calendar]

  DemoState --> Engine[Pet engine]
  Events --> Engine
  Contributions --> Engine
  Engine --> View[Dashboard pet state]
  View --> Share[Canvas share card]
```

## Data Sources

Public lookup uses:

- `GET https://api.github.com/users/{username}`
- `GET https://api.github.com/users/{username}/events?per_page=100`

Authenticated login uses:

- `GET https://api.github.com/user`
- `POST https://api.github.com/graphql`
- `viewer.contributionsCollection`

The authenticated path is better for real history because the public events feed is recent and limited. The GraphQL contribution calendar gives a year-level contribution view using read-only OAuth.

## Pet Scoring

```mermaid
flowchart TD
  Activity[GitHub activity] --> Totals[Contributions, commits, active days]
  Totals --> XP[XP]
  Totals --> Streak[Streak]
  Totals --> Recency[Days since last contribution]
  Activity --> Repos[Public owned repos]
  Repos --> Languages[Primary language counts]
  Languages --> Badges[Tech badges]
  XP --> Level[Level]
  Level --> Stage[Egg/Baby/Teen/Adult/Elder]
  Recency --> Health[Health]
  Streak --> Mood[Mood]
  Health --> Mood
```

The scoring logic lives in `src/app/pet-engine.service.ts`.

Dashboard presentation lives in `src/app/dashboard/dashboard.component.ts` and includes achievements, score breakdowns, tech badges, pet readouts, and the canvas-generated share card.

## Tech Badge Ranking

```mermaid
flowchart LR
  Repos[Public owned repos] --> Filter[Ignore forks and empty languages]
  Filter --> Count[Count repos by primary language]
  Count --> Rank{Repo count}
  Rank -->|1-2| Bronze[Level 1 Bronze]
  Rank -->|3-4| Silver[Level 2 Silver]
  Rank -->|5-9| Gold[Level 3 Gold]
  Rank -->|10-19| Platinum[Level 4 Platinum]
  Rank -->|20+| Legend[Level 5 Legend]
```

This is deliberately based on repository language metadata rather than source-file inspection. It keeps the app read-only and avoids requesting private repository permissions.
