import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import { GithubService } from './github.service';
import { PetEngineService } from './pet-engine.service';
import { GitHubUser, PetState } from './models';
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
    {
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
      lastCommitMessage: 'chore: hatch the repo'
    },
    {
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
      lastCommitMessage: 'feat: add snack-based motivation'
    },
    {
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
      lastCommitMessage: 'fix: stop the pet judging my branch names'
    },
    {
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
      lastCommitMessage: 'refactor: make evolution less dramatic'
    },
    {
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
      lastCommitMessage: 'release: attain questionable wisdom'
    }
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
      
      const events = await this.github.getUserEvents(username);
      const state = this.engine.calculateState(events);
      
      this.currentUser.set(user);
      this.currentState.set(state);
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
      
      const contributionSummary = await this.github.getAuthenticatedContributionSummary();
      const state = contributionSummary
        ? this.engine.calculateStateFromContributionSummary(contributionSummary)
        : this.engine.calculateState(await this.github.getUserEvents(user.login));
      
      this.currentUser.set(user);
      this.currentState.set(state);
    } catch (e) {
      console.error(e);
      this.errorMsg.set('An error occurred during authentication. Please try again.');
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
  }

  reset() {
    this.currentUser.set(null);
    this.currentState.set(null);
  }
}
