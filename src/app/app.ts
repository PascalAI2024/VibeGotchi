import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import { GithubService } from './github.service';
import { PetEngineService } from './pet-engine.service';
import { GitHubUser, PetState, TechBadge } from './models';
import { LandingComponent } from './landing/landing.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { MatIconModule } from '@angular/material/icon';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  standalone: true,
  imports: [LandingComponent, DashboardComponent, MatIconModule],
  template: `
    <main class="min-h-screen bg-slate-950 text-slate-200 selection:bg-emerald-500/30 overflow-y-auto overflow-x-hidden relative pb-20">
      <!-- Background Mesh -->
      <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black z-0 pointer-events-none fixed"></div>
      
      <!-- Content Layer -->
      <div class="relative z-10 w-full min-h-screen">
        @if (isLoading()) {
           <div class="min-h-screen flex flex-col items-center justify-center">
              <mat-icon class="animate-spin text-emerald-400 text-4xl w-10 h-10 mb-4">sync</mat-icon>
              <div class="font-mono text-slate-400">Interfacing with GitHub...</div>
           </div>
        } @else if (currentUser() && currentState()) {
          <app-dashboard 
            [user]="currentUser()!" 
            [state]="currentState()!"
            (logout)="reset()">
          </app-dashboard>
        } @else {
          <app-landing 
             [isLoading]="isLoading()" 
             [errorMsg]="errorMsg()"
             [demoStates]="demoStates"
             (connect)="handleConnect($event)"
             (authFinish)="handleAuthFinish($event)"
             (enhancedAuthFinish)="handleEnhancedAuthFinish($event)"
             (demo)="handleDemo($event)">
          </app-landing>
        }
      </div>
    </main>
  `,
})
export class App {
  private github = inject(GithubService);
  private engine = inject(PetEngineService);

  currentUser = signal<GitHubUser | null>(null);
  currentState = signal<PetState | null>(null);
  isLoading = signal(false);
  errorMsg = signal('');
  demoStates: PetState[] = [
    this.demoState({
      stage: 'Egg',
      health: 92,
      mood: 'Happy',
      posture: 'Stand',
      level: 1,
      xp: 45,
      xpToNextLevel: 100,
      daysSinceLastCommit: 0,
      commitStreak: 1,
      recentCommitsCount: 3,
      topLanguage: 'TypeScript',
      lastCommitMessage: 'chore: hatch the repo',
      techBadges: this.demoTechBadges([
        ['TypeScript', 1],
        ['HTML', 1],
      ])
    }),
    this.demoState({
      stage: 'Baby',
      health: 100,
      mood: 'Ecstatic',
      posture: 'Stand',
      level: 2,
      xp: 125,
      xpToNextLevel: 180,
      daysSinceLastCommit: 0,
      commitStreak: 3,
      recentCommitsCount: 9,
      topLanguage: 'TypeScript',
      lastCommitMessage: 'feat: add snack-based motivation',
      techBadges: this.demoTechBadges([
        ['TypeScript', 3],
        ['CSS', 2],
        ['JavaScript', 1],
      ])
    }),
    this.demoState({
      stage: 'Teen',
      health: 78,
      mood: 'Happy',
      posture: 'Stand',
      level: 4,
      xp: 360,
      xpToNextLevel: 500,
      daysSinceLastCommit: 1,
      commitStreak: 6,
      recentCommitsCount: 18,
      topLanguage: 'TypeScript',
      lastCommitMessage: 'fix: stop the pet judging my branch names',
      techBadges: this.demoTechBadges([
        ['TypeScript', 5],
        ['Python', 3],
        ['CSS', 3],
        ['JavaScript', 2],
      ])
    }),
    this.demoState({
      stage: 'Adult',
      health: 63,
      mood: 'Neutral',
      posture: 'Stand',
      level: 7,
      xp: 980,
      xpToNextLevel: 1280,
      daysSinceLastCommit: 2,
      commitStreak: 12,
      recentCommitsCount: 42,
      topLanguage: 'TypeScript',
      lastCommitMessage: 'refactor: make evolution less dramatic',
      techBadges: this.demoTechBadges([
        ['TypeScript', 10],
        ['Python', 7],
        ['JavaScript', 5],
        ['Shell', 3],
      ])
    }),
    this.demoState({
      stage: 'Elder',
      health: 100,
      mood: 'Ecstatic',
      posture: 'Sit',
      level: 12,
      xp: 2900,
      xpToNextLevel: 3380,
      daysSinceLastCommit: 0,
      commitStreak: 30,
      recentCommitsCount: 100,
      topLanguage: 'TypeScript',
      lastCommitMessage: 'release: attain questionable wisdom',
      techBadges: this.demoTechBadges([
        ['TypeScript', 24],
        ['Python', 14],
        ['JavaScript', 11],
        ['Go', 6],
        ['Shell', 5],
      ])
    })
  ];

  async handleConnect(username: string) {
    this.isLoading.set(true);
    this.errorMsg.set('');
    try {
      // Clear token when doing public lookup
      this.github.setToken('');
      
      const user = await this.github.getUser(username);
      if (!user) {
         this.errorMsg.set('User not found or GitHub API rate limited.');
         this.reset();
         return;
      }
      
      const [events, repos] = await Promise.all([
        this.github.getUserEvents(username),
        this.github.getRepositories(username),
      ]);
      const state = this.engine.calculateState(events, repos);
      
      this.currentUser.set(user);
      this.currentState.set(state);
      this.scrollToTop();
    } catch (e) {
      console.error(e);
      this.errorMsg.set('An error occurred while connecting. Please try again.');
    } finally {
      this.isLoading.set(false);
    }
  }

  async handleAuthFinish(token: string) {
    this.isLoading.set(true);
    this.errorMsg.set('');
    try {
      this.github.setToken(token);
      
      const user = await this.github.getUser(); // Fetches authenticated user
      if (!user) {
         this.errorMsg.set('Failed to fetch authenticated user.');
         this.reset();
         return;
      }
      
      const [contributionSummary, repos] = await Promise.all([
        this.github.getAuthenticatedContributionSummary(),
        this.github.getRepositories(),
      ]);
      const enrichedRepos = await this.github.enrichRepositoriesWithPackageTech(repos);
      const state = contributionSummary
        ? this.engine.calculateStateFromContributionSummary(contributionSummary, enrichedRepos)
        : this.engine.calculateState(await this.github.getUserEvents(user.login), enrichedRepos);
      
      this.currentUser.set(user);
      this.currentState.set(state);
      this.scrollToTop();
    } catch (e) {
      console.error(e);
      this.errorMsg.set('An error occurred during authentication. Please try again.');
    } finally {
      this.isLoading.set(false);
    }
  }

  async handleEnhancedAuthFinish(token: string) {
    this.isLoading.set(true);
    this.errorMsg.set('');
    try {
      this.github.setToken(token);

      const user = await this.github.getUser();
      if (!user) {
        this.errorMsg.set('Failed to fetch authenticated user.');
        this.reset();
        return;
      }

      const [contributionSummary, repos] = await Promise.all([
        this.github.getAuthenticatedContributionSummary(),
        this.github.getRepositories(),
      ]);
      const enrichedRepos = await this.github.enrichRepositoriesWithPackageTech(repos);
      const state = contributionSummary
        ? this.engine.calculateStateFromContributionSummary(contributionSummary, enrichedRepos)
        : this.engine.calculateState(await this.github.getUserEvents(user.login), enrichedRepos);

      this.currentUser.set(user);
      this.currentState.set({
        ...state,
        activitySource: 'Enhanced read-only GitHub App repo access',
      });
      this.scrollToTop();
    } catch (e) {
      console.error(e);
      this.errorMsg.set('Enhanced repo read failed. Install the GitHub App on selected repos, then try again.');
    } finally {
      this.isLoading.set(false);
    }
  }

  handleDemo(state: PetState) {
    this.errorMsg.set('');
    this.currentUser.set({
      login: 'demo-coder',
      name: 'Demo Coder',
      avatar_url: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png',
      html_url: 'https://github.com',
      public_repos: 42
    });
    this.currentState.set(state);
    this.scrollToTop();
  }

  reset() {
    this.currentUser.set(null);
    this.currentState.set(null);
    this.scrollToTop();
  }

  private scrollToTop() {
    if (typeof window === 'undefined') {
      return;
    }

    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    });
  }

  private demoTechBadges(entries: [string, number][]): TechBadge[] {
    return entries.map(([tech, repoCount]) => {
      const iconSlug = this.demoIconSlug(tech);
      const iconUrl = iconSlug ? `https://cdn.simpleicons.org/${iconSlug}?viewbox=auto` : null;

      if (repoCount >= 20) return { tech, repoCount, iconSlug, iconUrl, level: 5, tier: 'Legend' };
      if (repoCount >= 10) return { tech, repoCount, iconSlug, iconUrl, level: 4, tier: 'Platinum' };
      if (repoCount >= 5) return { tech, repoCount, iconSlug, iconUrl, level: 3, tier: 'Gold' };
      if (repoCount >= 3) return { tech, repoCount, iconSlug, iconUrl, level: 2, tier: 'Silver' };
      return { tech, repoCount, iconSlug, iconUrl, level: 1, tier: 'Bronze' };
    });
  }

  private demoIconSlug(tech: string): string | null {
    const slugMap: Record<string, string> = {
      Angular: 'angular',
      CSS: 'css',
      Go: 'go',
      HTML: 'html5',
      JavaScript: 'javascript',
      Python: 'python',
      React: 'react',
      Rust: 'rust',
      Shell: 'gnubash',
      TypeScript: 'typescript',
    };

    return slugMap[tech] || null;
  }

  private demoState(state: Omit<PetState, 'achievements' | 'scoreBreakdown' | 'personalityLine'>): PetState {
    const badgeXp = state.techBadges.reduce((sum, badge) => sum + badge.level * 25, 0);
    return this.engine.enrichState({
      ...state,
      achievements: [],
      personalityLine: '',
      scoreBreakdown: [
        { label: 'Demo activity', value: Math.max(0, state.xp - badgeXp) },
        { label: 'Tech badges', value: badgeXp },
      ],
    });
  }
}
