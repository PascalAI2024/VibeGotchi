import { Component, Output, EventEmitter, signal, Input, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { PetComponent } from '../pet/pet.component';
import { PetState } from '../models';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [FormsModule, MatIconModule, PetComponent],
  template: `
    <div class="min-h-screen w-full max-w-full overflow-x-hidden px-5 py-8 sm:px-6 lg:px-8 landing-shell">
      <div class="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <section class="grid items-center gap-8 pt-8 lg:min-h-[760px] lg:grid-cols-[0.9fr_1.1fr] lg:pt-0">
          <div class="animate-fade-in-up text-left">
            <div class="mb-4 flex flex-wrap items-center gap-2">
              <div class="inline-flex items-center gap-2 rounded-full border border-lime-400/40 bg-lime-400/10 px-3 py-1 text-[11px] font-mono uppercase tracking-wider text-lime-200 shadow-[0_0_24px_rgba(163,230,53,0.18)]">
                <mat-icon class="text-[15px] w-[15px] h-[15px]">verified_user</mat-icon>
                Read-only GitHub scoring
              </div>
              <a
                href="https://github.com/PascalAI2024/VibeGotchi"
                target="_blank"
                rel="noreferrer"
                class="inline-flex items-center gap-1 rounded-full border border-fuchsia-400/30 bg-fuchsia-500/10 px-3 py-1 text-[11px] font-mono uppercase tracking-wider text-fuchsia-200 transition-colors hover:border-fuchsia-300 hover:text-white"
              >
                <mat-icon class="text-[14px] w-[14px] h-[14px]">code</mat-icon>
                GitHub project
              </a>
            </div>

            <h1 class="mb-4 max-w-xl text-5xl font-sans font-extrabold leading-[0.95] text-transparent bg-clip-text bg-gradient-to-br from-lime-300 via-emerald-300 to-fuchsia-400 drop-shadow-[0_0_18px_rgba(163,230,53,0.28)] sm:text-7xl lg:text-8xl">
              VIBE GOTCHI
            </h1>
            <p class="max-w-xl text-base leading-7 text-slate-400 sm:text-lg">
              A virtual pet that turns GitHub activity into evolution stages, tech badges, achievements, and a shareable score card.
            </p>

            <div class="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <div class="rounded-lg border border-lime-400/20 bg-slate-900/70 px-3 py-2 shadow-[inset_0_0_18px_rgba(163,230,53,0.05)]">
                <div class="text-[10px] font-mono uppercase tracking-wider text-lime-300/70">Connect</div>
                <div class="text-sm font-bold text-slate-100">GitHub</div>
              </div>
              <div class="rounded-lg border border-cyan-400/20 bg-slate-900/70 px-3 py-2 shadow-[inset_0_0_18px_rgba(34,211,238,0.05)]">
                <div class="text-[10px] font-mono uppercase tracking-wider text-cyan-300/70">Score</div>
                <div class="text-sm font-bold text-slate-100">Activity</div>
              </div>
              <div class="rounded-lg border border-fuchsia-400/20 bg-slate-900/70 px-3 py-2 shadow-[inset_0_0_18px_rgba(217,70,239,0.05)]">
                <div class="text-[10px] font-mono uppercase tracking-wider text-fuchsia-300/70">Evolve</div>
                <div class="text-sm font-bold text-slate-100">Pet</div>
              </div>
              <div class="rounded-lg border border-emerald-400/20 bg-slate-900/70 px-3 py-2 shadow-[inset_0_0_18px_rgba(52,211,153,0.05)]">
                <div class="text-[10px] font-mono uppercase tracking-wider text-emerald-300/70">Share</div>
                <div class="text-sm font-bold text-slate-100">Card</div>
              </div>
            </div>

            <div class="mt-7 max-w-xl rounded-lg border border-lime-400/20 bg-slate-950/75 p-4 shadow-2xl shadow-black/30">
              <button
                (click)="handleLogin()"
                [disabled]="isLoading || isAuthUnavailable()"
                class="group relative mb-4 flex w-full items-center justify-center gap-2 overflow-hidden rounded-lg border border-lime-400/40 bg-lime-400/10 py-4 font-bold uppercase tracking-widest text-lime-200 transition-all hover:border-lime-300 hover:bg-lime-400/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <div class="absolute inset-0 bg-gradient-to-r from-lime-400/0 via-lime-400/10 to-lime-400/0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                @if (isLoading) {
                  <mat-icon class="animate-spin relative z-10 w-[20px] h-[20px] text-[20px]">sync</mat-icon>
                  <span class="relative z-10">Authenticating...</span>
                } @else if (authApiBaseUrl() === undefined) {
                  <mat-icon class="animate-spin relative z-10 w-[20px] h-[20px] text-[20px]">sync</mat-icon>
                  <span class="relative z-10">Preparing GitHub Login...</span>
                } @else if (authApiBaseUrl() === null) {
                  <mat-icon class="relative z-10 w-[20px] h-[20px] text-[20px]">lock</mat-icon>
                  <span class="relative z-10">Login Not Configured</span>
                } @else {
                  <mat-icon class="relative z-10 w-[20px] h-[20px] text-[20px]">login</mat-icon>
                  <span class="relative z-10">Login with GitHub</span>
                }
              </button>

              <div class="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] font-mono uppercase tracking-wider text-slate-500">
                <span class="inline-flex items-center gap-1">
                  <mat-icon class="text-[14px] w-[14px] h-[14px] text-emerald-400">lock_open</mat-icon>
                  No repo scope
                </span>
                <span class="inline-flex items-center gap-1">
                  <mat-icon class="text-[14px] w-[14px] h-[14px] text-emerald-400">edit_off</mat-icon>
                  No writes
                </span>
                <span class="inline-flex items-center gap-1">
                  <mat-icon class="text-[14px] w-[14px] h-[14px] text-emerald-400">visibility</mat-icon>
                  Public lookup
                </span>
              </div>

              <button
                type="button"
                (click)="handleEnhancedLogin()"
                [disabled]="isLoading || enhancedAuthAvailable() !== true"
                class="mb-4 flex w-full items-center justify-center gap-2 rounded-lg border border-fuchsia-400/30 bg-fuchsia-500/10 py-3 text-sm font-bold uppercase tracking-widest text-fuchsia-100 transition-all hover:border-fuchsia-300 hover:bg-fuchsia-500/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <mat-icon class="text-[18px] w-[18px] h-[18px]">admin_panel_settings</mat-icon>
                @if (enhancedAuthAvailable() === undefined) {
                  Checking enhanced repo read
                } @else if (enhancedAuthAvailable()) {
                  Enhanced repo read
                } @else {
                  Enhanced repo read setup pending
                }
              </button>

              <form (ngSubmit)="onSubmit()" class="grid gap-3 sm:grid-cols-[1fr_auto]">
                <div class="relative group">
                  <div class="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                    <mat-icon>code</mat-icon>
                  </div>
                  <input
                    type="text"
                    name="username"
                    [ngModel]="username()"
                    (ngModelChange)="username.set($event)"
                    placeholder="GitHub username"
                    required
                    autocomplete="off"
                    class="h-12 w-full rounded-lg border border-slate-700/70 bg-slate-900/80 py-3 pl-12 pr-4 font-mono text-slate-100 placeholder:text-slate-600 shadow-inner transition-all focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                  >
                </div>

                <button
                  type="submit"
                  [disabled]="!username() || isLoading"
                  class="group relative flex h-12 items-center justify-center gap-2 overflow-hidden rounded-lg border border-cyan-400/30 bg-cyan-500/10 px-5 font-bold uppercase tracking-widest text-cyan-200 transition-all hover:border-cyan-300 hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <div class="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/10 to-cyan-500/0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                  @if (isLoading) {
                    <mat-icon class="animate-spin relative z-10 w-[20px] h-[20px] text-[20px]">sync</mat-icon>
                    <span class="relative z-10">Syncing</span>
                  } @else {
                    <mat-icon class="relative z-10 w-[20px] h-[20px] text-[20px]">search</mat-icon>
                    <span class="relative z-10">Lookup</span>
                  }
                </button>
              </form>
              @if (errorMsg) {
                <p class="mt-4 flex items-center gap-1 text-sm font-mono text-red-400">
                  <mat-icon class="text-[16px] w-[16px] h-[16px]">error_outline</mat-icon>
                  {{errorMsg}}
                </p>
              }
            </div>
          </div>

          <div class="animate-fade-in-up lg:pt-10" style="animation-delay: 120ms;">
            <div class="relative overflow-hidden rounded-2xl border border-lime-400/25 bg-slate-950 shadow-[0_0_60px_rgba(163,230,53,0.12)]">
              <div class="absolute inset-0 border-2 border-fuchsia-400/10 pointer-events-none"></div>
              <img
                src="vibegotchi-hero.png"
                alt="VibeGotchi neon virtual pet hero"
                class="block aspect-[16/9] w-full object-cover"
                loading="eager"
                fetchpriority="high"
              />
            </div>
          </div>
        </section>

        <section class="w-full animate-fade-in-up pb-12" style="animation-delay: 220ms;">
          <div class="mb-5 flex items-end justify-between gap-4 text-left">
            <div>
              <h2 class="text-lg font-bold text-slate-100 md:text-xl">Evolution demo</h2>
              <p class="max-w-3xl text-sm font-mono text-slate-500">Preview every stage instantly. The Elder card is the judge-friendly path with badges, achievements, and score breakdown already unlocked.</p>
            </div>
            <mat-icon class="hidden text-emerald-400 sm:block">auto_awesome</mat-icon>
          </div>

          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            @for (demoState of demoStates; track demoState.stage) {
              <button
                type="button"
                (click)="demo.emit(demoState)"
                class="group text-left bg-slate-900/70 hover:bg-slate-800/80 border border-slate-800 hover:border-lime-400/60 rounded-lg p-3 transition-all shadow-lg"
                [class.border-lime-400]="demoState.stage === 'Elder'"
                [class.bg-lime-400/10]="demoState.stage === 'Elder'"
              >
                <div class="h-28 flex items-center justify-center overflow-hidden rounded-md bg-slate-950/40">
                  <div class="w-32 scale-75 group-hover:scale-[0.8] transition-transform">
                    <app-pet [state]="demoState" [interactive]="false"></app-pet>
                  </div>
                </div>
                <div class="mt-2 flex items-center justify-between gap-2">
                  <div>
                    <div class="text-sm font-bold text-slate-100">{{demoState.stage}}</div>
                    <div class="text-xs font-mono text-slate-500">Lvl {{demoState.level}} · {{demoState.mood}}</div>
                  </div>
                  <mat-icon class="text-[18px] w-[18px] h-[18px] text-slate-500 group-hover:text-lime-300">play_arrow</mat-icon>
                </div>
              </button>
            }
          </div>
        </section>
      </div>
    </div>
  `,
  styles: [`
    .landing-shell {
      background:
        linear-gradient(90deg, rgba(163, 230, 53, 0.08) 0 1px, transparent 1px 80px),
        linear-gradient(180deg, rgba(217, 70, 239, 0.06) 0 1px, transparent 1px 80px);
      background-size: 80px 80px;
    }
    @keyframes fade-in-up {
      0% { opacity: 0; transform: translateY(20px); }
      100% { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in-up {
      animation: fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      opacity: 0;
    }
    @keyframes shimmer {
      100% { transform: translateX(100%); }
    }
  `]
})
export class LandingComponent implements OnInit, OnDestroy {
  username = signal('');
  authApiBaseUrl = signal<string | null | undefined>(undefined);
  enhancedAuthAvailable = signal<boolean | undefined>(undefined);
  @Input() isLoading = false;
  @Input() errorMsg = '';
  @Input({ required: true }) demoStates: PetState[] = [];
  
  @Output() connect = new EventEmitter<string>();
  @Output() authFinish = new EventEmitter<string>();
  @Output() enhancedAuthFinish = new EventEmitter<string>();
  @Output() demo = new EventEmitter<PetState>();

  private messageListener = (event: MessageEvent) => {
    const allowedOrigin = this.getAllowedMessageOrigin();
    if (allowedOrigin && event.origin !== allowedOrigin) {
      return;
    }
    if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
      this.authFinish.emit(event.data.token);
    }
    if (event.data?.type === 'GITHUB_APP_AUTH_SUCCESS') {
      this.enhancedAuthFinish.emit(event.data.token);
    }
  };

  ngOnInit() {
    if (typeof window === 'undefined') {
      return;
    }
    window.addEventListener('message', this.messageListener);
    void this.loadRuntimeConfig();
  }

  ngOnDestroy() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('message', this.messageListener);
    }
  }

  async handleLogin() {
    try {
      const authApiBaseUrl = this.authApiBaseUrl();
      if (authApiBaseUrl === null) {
        throw new Error('GitHub login is not configured for this deployment.');
      }

      const endpoint = `${authApiBaseUrl || ''}/api/auth/url?origin=${encodeURIComponent(window.location.origin)}`;
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error('Failed to get auth URL');
      }
      const { url } = await response.json();

      const authWindow = window.open(
        url,
        'oauth_popup',
        'width=600,height=700'
      );

      if (!authWindow) {
        alert('Please allow popups for this site to connect your GitHub account.');
      }
    } catch (error) {
      console.error('OAuth error:', error);
    }
  }

  async handleEnhancedLogin() {
    try {
      const authApiBaseUrl = this.authApiBaseUrl();
      if (authApiBaseUrl === null || this.enhancedAuthAvailable() !== true) {
        throw new Error('GitHub App auth is not configured for this deployment.');
      }

      const endpoint = `${authApiBaseUrl || ''}/api/github-app/url?origin=${encodeURIComponent(window.location.origin)}`;
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error('GitHub App auth is not configured yet.');
      }
      const { url } = await response.json();

      const authWindow = window.open(
        url,
        'github_app_popup',
        'width=700,height=780'
      );

      if (!authWindow) {
        alert('Please allow popups for this site to connect read-only repos.');
      }
    } catch (error) {
      console.error('GitHub App auth error:', error);
      alert(error instanceof Error ? error.message : 'GitHub App auth failed.');
    }
  }

  onSubmit() {
    if (this.username().trim()) {
      this.connect.emit(this.username().trim());
    }
  }

  isAuthUnavailable() {
    return this.authApiBaseUrl() === null || this.authApiBaseUrl() === undefined;
  }

  private async loadRuntimeConfig() {
    const localOverride = window.localStorage.getItem('vibegotchi.authApiBaseUrl');
    if (localOverride) {
      this.authApiBaseUrl.set(localOverride.replace(/\/$/, ''));
      await this.checkEnhancedAuth();
      return;
    }

    try {
      const response = await fetch(new URL('config.json', document.baseURI), { cache: 'no-store' });
      const config = await response.json();
      const configuredUrl = typeof config.authApiBaseUrl === 'string' ? config.authApiBaseUrl.trim() : null;
      this.authApiBaseUrl.set(
        configuredUrl !== null
          ? configuredUrl.replace(/\/$/, '')
          : null
      );
      await this.checkEnhancedAuth();
    } catch {
      this.authApiBaseUrl.set(window.location.hostname === 'localhost' ? '' : null);
      await this.checkEnhancedAuth();
    }
  }

  private async checkEnhancedAuth() {
    const authApiBaseUrl = this.authApiBaseUrl();
    if (authApiBaseUrl === null || typeof window === 'undefined') {
      this.enhancedAuthAvailable.set(false);
      return;
    }

    try {
      const response = await fetch(`${authApiBaseUrl || ''}/api/github-app/url?origin=${encodeURIComponent(window.location.origin)}`, {
        cache: 'no-store',
      });
      this.enhancedAuthAvailable.set(response.ok);
    } catch {
      this.enhancedAuthAvailable.set(false);
    }
  }

  private getAllowedMessageOrigin(): string {
    const authApiBaseUrl = this.authApiBaseUrl();
    if (!authApiBaseUrl && typeof window !== 'undefined') {
      return window.location.origin;
    }

    try {
      return new URL(authApiBaseUrl || '').origin;
    } catch {
      return '';
    }
  }
}
