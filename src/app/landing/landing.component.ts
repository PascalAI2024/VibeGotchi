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
      <div class="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <section class="grid min-w-0 items-start gap-8 pt-8 lg:min-h-[760px] lg:grid-cols-[0.78fr_1.22fr] lg:gap-10 lg:pt-16">
          <div class="min-w-0 animate-fade-in-up text-left">
            <div class="mb-4 grid max-w-full grid-cols-1 gap-2 sm:flex sm:flex-wrap sm:items-center">
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

            <div class="mt-6 grid grid-cols-1 gap-2 min-[480px]:grid-cols-2 sm:grid-cols-4">
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

            <div class="mt-7 max-w-xl min-w-0 rounded-lg border border-lime-400/20 bg-slate-950/75 p-4 shadow-2xl shadow-black/30">
              <div class="mb-4 flex items-start justify-between gap-3">
                <div>
                  <div class="text-[10px] font-mono uppercase tracking-wider text-lime-300/70">Choose scoring mode</div>
                  <div class="text-sm text-slate-400">Fastest demo: score Linus or another preset, then tap Elder below for the full dashboard.</div>
                </div>
                <mat-icon class="shrink-0 text-lime-300">route</mat-icon>
              </div>

              <div class="mb-3 flex items-start gap-2 rounded-lg border border-emerald-400/20 bg-emerald-400/10 p-3 text-xs leading-5 text-emerald-100">
                <mat-icon class="mt-0.5 shrink-0 text-[16px] h-[16px] w-[16px] text-emerald-300">shield</mat-icon>
                <span>No writes. No classic repo scope. Optional GitHub App access only reads selected repositories.</span>
              </div>

              <div class="mb-3 rounded-lg border border-cyan-400/30 bg-cyan-500/10 p-3">
                <div class="mb-3 flex items-start gap-3">
                  <span class="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-cyan-300 text-sm font-bold text-slate-950">1</span>
                  <div>
                    <div class="text-sm font-bold text-cyan-100">Public username lookup</div>
                    <div class="text-xs leading-5 text-slate-400">No login. Scores recent public activity and visible public repositories.</div>
                  </div>
                </div>
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
                      class="h-12 w-full rounded-lg border border-slate-700/70 bg-slate-900/80 py-3 pl-12 pr-4 font-mono text-slate-100 placeholder:text-slate-600 shadow-inner transition-all focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                    >
                  </div>

                  <button
                    type="submit"
                    [disabled]="!username() || isLoading"
                    class="group relative flex h-12 items-center justify-center gap-2 overflow-hidden rounded-lg border border-cyan-400/40 bg-cyan-500/15 px-5 font-bold uppercase tracking-widest text-cyan-100 transition-all hover:border-cyan-300 hover:bg-cyan-500/25 disabled:cursor-not-allowed disabled:opacity-50"
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
                <div class="mt-3 grid grid-cols-1 gap-2 min-[480px]:grid-cols-2">
                  @for (preset of presetUsers; track preset.username) {
                    <button
                      type="button"
                      (click)="usePresetUsername(preset.username)"
                      class="inline-flex min-w-0 items-center justify-center gap-2 rounded-lg border border-cyan-300/25 bg-slate-950/50 px-3 py-2 text-xs font-bold uppercase tracking-widest text-cyan-100 transition-all hover:border-cyan-300/60 hover:bg-cyan-500/15"
                    >
                      <mat-icon class="shrink-0 text-[16px] h-[16px] w-[16px]">{{preset.icon}}</mat-icon>
                      <span class="truncate">{{preset.label}}</span>
                    </button>
                  }
                </div>
              </div>

              <div class="grid gap-3 sm:grid-cols-2">
                <div class="rounded-lg border border-lime-400/25 bg-lime-400/10 p-3">
                  <div class="mb-3 flex items-start gap-3">
                    <span class="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-lime-300 text-sm font-bold text-slate-950">2</span>
                    <div>
                      <div class="text-sm font-bold text-lime-100">GitHub login</div>
                      <div class="text-xs leading-5 text-slate-400">Read-only contribution graph. No repo scope. No writes.</div>
                    </div>
                  </div>
                  <button
                    (click)="handleLogin()"
                    [disabled]="isLoading || isAuthUnavailable()"
                    class="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-lg border border-lime-400/40 bg-lime-400/10 py-3 text-sm font-bold uppercase tracking-widest text-lime-200 transition-all hover:border-lime-300 hover:bg-lime-400/20 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <div class="absolute inset-0 bg-gradient-to-r from-lime-400/0 via-lime-400/10 to-lime-400/0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                    @if (isLoading) {
                      <mat-icon class="animate-spin relative z-10 w-[18px] h-[18px] text-[18px]">sync</mat-icon>
                      <span class="relative z-10">Authenticating</span>
                    } @else if (authApiBaseUrl() === undefined) {
                      <mat-icon class="animate-spin relative z-10 w-[18px] h-[18px] text-[18px]">sync</mat-icon>
                      <span class="relative z-10">Preparing</span>
                    } @else if (authApiBaseUrl() === null) {
                      <mat-icon class="relative z-10 w-[18px] h-[18px] text-[18px]">lock</mat-icon>
                      <span class="relative z-10">Not configured</span>
                    } @else {
                      <mat-icon class="relative z-10 w-[18px] h-[18px] text-[18px]">login</mat-icon>
                      <span class="relative z-10">Login</span>
                    }
                  </button>
                </div>

                <div class="rounded-lg border border-fuchsia-400/25 bg-fuchsia-500/10 p-3">
                  <div class="mb-3 flex items-start gap-3">
                    <span class="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-fuchsia-300 text-sm font-bold text-slate-950">3</span>
                    <div>
                      <div class="text-sm font-bold text-fuchsia-100">Enhanced repo read</div>
                      <div class="text-xs leading-5 text-slate-400">Optional GitHub App access for selected repositories only.</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    (click)="handleEnhancedLogin()"
                    [disabled]="isLoading || enhancedAuthAvailable() !== true"
                    class="flex w-full items-center justify-center gap-2 rounded-lg border border-fuchsia-400/30 bg-fuchsia-500/10 py-3 text-sm font-bold uppercase tracking-widest text-fuchsia-100 transition-all hover:border-fuchsia-300 hover:bg-fuchsia-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <mat-icon class="text-[18px] w-[18px] h-[18px]">admin_panel_settings</mat-icon>
                    @if (enhancedAuthAvailable() === undefined) {
                      Checking
                    } @else if (enhancedAuthAvailable()) {
                      Connect App
                    } @else {
                      Setup pending
                    }
                  </button>
                </div>
              </div>

              <div class="mt-4 grid min-w-0 grid-cols-1 gap-2 text-[11px] font-mono uppercase tracking-wider text-slate-500 min-[560px]:grid-cols-3">
                <span class="inline-flex items-center gap-1">
                  <mat-icon class="text-[14px] w-[14px] h-[14px] text-emerald-400">lock_open</mat-icon>
                  No writes
                </span>
                <span class="inline-flex items-center gap-1">
                  <mat-icon class="text-[14px] w-[14px] h-[14px] text-emerald-400">visibility</mat-icon>
                  Public path first
                </span>
                <span class="inline-flex items-center gap-1">
                  <mat-icon class="text-[14px] w-[14px] h-[14px] text-emerald-400">rule</mat-icon>
                  Scoped access
                </span>
              </div>
              @if (errorMsg) {
                <p class="mt-4 flex items-center gap-1 text-sm font-mono text-red-400">
                  <mat-icon class="text-[16px] w-[16px] h-[16px]">error_outline</mat-icon>
                  {{errorMsg}}
                </p>
              }
            </div>
          </div>

          <div class="min-w-0 animate-fade-in-up lg:-mr-6 lg:pt-[66px] xl:-mr-10" style="animation-delay: 120ms;">
            <div class="relative overflow-hidden rounded-2xl border border-lime-400/25 bg-slate-950 shadow-[0_0_60px_rgba(163,230,53,0.12)]">
              <div class="absolute inset-0 border-2 border-fuchsia-400/10 pointer-events-none"></div>
              <img
                src="vibegotchi-banner.jpeg"
                alt="VibeGotchi branded virtual pet poster"
                class="block aspect-[3/2] w-full max-w-full object-cover object-center"
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
                <div class="h-40 flex items-center justify-center overflow-visible rounded-md bg-slate-950/40 sm:h-44">
                  <div class="w-36 transition-transform group-hover:scale-105 sm:w-40">
                    <app-pet [state]="demoState" [interactive]="false"></app-pet>
                  </div>
                </div>
                <div class="mt-2 flex items-center justify-between gap-2">
                  <div>
                    <div class="text-sm font-bold text-slate-100">{{demoState.stage}}</div>
                    <div class="text-xs font-mono text-slate-500">Lvl {{demoState.level}} · {{demoState.careState}}</div>
                  </div>
                  <mat-icon class="text-[18px] w-[18px] h-[18px] text-slate-500 group-hover:text-lime-300">play_arrow</mat-icon>
                </div>
              </button>
            }
          </div>
        </section>

        <section class="w-full animate-fade-in-up pb-12" style="animation-delay: 280ms;">
          <div class="mb-5 flex items-end justify-between gap-4 text-left">
            <div>
              <h2 class="text-lg font-bold text-slate-100 md:text-xl">Feature map</h2>
              <p class="max-w-3xl text-sm font-mono text-slate-500">The full shipped surface: scoring, privacy boundaries, badges, demo paths, and the final share artifact.</p>
            </div>
            <mat-icon class="hidden text-fuchsia-300 sm:block">checklist</mat-icon>
          </div>

          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            @for (item of featureItems; track item.name) {
              <div class="flex min-w-0 items-start gap-3 rounded-lg border border-slate-800 bg-slate-900/65 p-3 shadow-lg">
                <span class="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-slate-700/70 bg-slate-950/70">
                  <mat-icon class="text-[18px] h-[18px] w-[18px]" [class.text-lime-300]="item.tone === 'lime'" [class.text-cyan-300]="item.tone === 'cyan'" [class.text-fuchsia-300]="item.tone === 'fuchsia'" [class.text-amber-300]="item.tone === 'amber'">{{item.icon}}</mat-icon>
                </span>
                <span class="min-w-0">
                  <span class="block text-sm font-bold leading-tight text-slate-100">{{item.name}}</span>
                  <span class="mt-1 block text-xs leading-5 text-slate-500">{{item.detail}}</span>
                </span>
              </div>
            }
          </div>
        </section>

        <section class="w-full animate-fade-in-up pb-14" style="animation-delay: 340ms;">
          <div class="mb-5 flex items-end justify-between gap-4 text-left">
            <div>
              <h2 class="text-lg font-bold text-slate-100 md:text-xl">Built with</h2>
              <p class="max-w-3xl text-sm font-mono text-slate-500">The visible stack behind the demo, deployment, read-only auth, scoring engine, and project presentation.</p>
            </div>
            <mat-icon class="hidden text-cyan-400 sm:block">hub</mat-icon>
          </div>

          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            @for (item of stackItems; track item.name) {
              <a
                [href]="item.href"
                target="_blank"
                rel="noreferrer"
                class="group flex min-w-0 items-center gap-3 rounded-lg border border-slate-800 bg-slate-900/65 p-3 text-left shadow-lg transition-all hover:border-lime-400/60 hover:bg-slate-800/80"
              >
                <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-slate-700/70 bg-slate-950/70">
                  <img
                    [src]="item.logo"
                    [alt]="item.name + ' logo'"
                    class="h-6 w-6 object-contain"
                    loading="lazy"
                  />
                </span>
                <span class="min-w-0">
                  <span class="block truncate text-sm font-bold text-slate-100">{{item.name}}</span>
                  <span class="block truncate text-xs font-mono text-slate-500">{{item.role}}</span>
                </span>
                <mat-icon class="ml-auto hidden text-[17px] text-slate-600 transition-colors group-hover:text-lime-300 min-[420px]:block">open_in_new</mat-icon>
              </a>
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
  username = signal('torvalds');
  authApiBaseUrl = signal<string | null | undefined>(undefined);
  enhancedAuthAvailable = signal<boolean | undefined>(undefined);
  readonly presetUsers = [
    { label: 'Linus', username: 'torvalds', icon: 'terminal' },
    { label: 'Sindre', username: 'sindresorhus', icon: 'auto_awesome' },
    { label: 'Dan', username: 'gaearon', icon: 'psychology' },
    { label: 'Evan', username: 'yyx990803', icon: 'data_object' },
  ];
  readonly featureItems = [
    {
      name: 'Five evolution stages',
      detail: 'Egg, Baby, Teen, Adult, and Elder previews with animated sprites.',
      icon: 'pets',
      tone: 'lime',
    },
    {
      name: 'Read-only GitHub login',
      detail: 'Contribution-history scoring without classic repo scope or write access.',
      icon: 'verified_user',
      tone: 'cyan',
    },
    {
      name: 'Public lookup',
      detail: 'Username scoring works without login from recent public GitHub events.',
      icon: 'search',
      tone: 'cyan',
    },
    {
      name: 'Tech badges',
      detail: 'Ranks visible repo languages and mapped package/framework signals.',
      icon: 'workspace_premium',
      tone: 'amber',
    },
    {
      name: 'GitHub App mode',
      detail: 'Optional selected-repo read mode for private/company badge signals.',
      icon: 'admin_panel_settings',
      tone: 'fuchsia',
    },
    {
      name: 'Private activity signal',
      detail: 'Counts restricted contribution totals without exposing private repo names.',
      icon: 'domain_verification',
      tone: 'fuchsia',
    },
    {
      name: 'Simple Icons logos',
      detail: 'Mapped tech badges use official-style SVG logos with text fallback.',
      icon: 'category',
      tone: 'lime',
    },
    {
      name: 'Achievements',
      detail: 'Rewards streaks, polyglot work, specialist lanes, and milestones.',
      icon: 'military_tech',
      tone: 'amber',
    },
    {
      name: 'XP breakdown',
      detail: 'Shows exactly why a profile reached its level and score.',
      icon: 'query_stats',
      tone: 'cyan',
    },
    {
      name: 'Care interactions',
      detail: 'Feed, pet, and play actions give immediate vitality and XP feedback.',
      icon: 'front_hand',
      tone: 'fuchsia',
    },
    {
      name: 'Share card',
      detail: 'Exports a polished GitHub-style PNG card from the dashboard.',
      icon: 'ios_share',
      tone: 'lime',
    },
  ];
  readonly stackItems = [
    {
      name: 'Angular',
      role: 'Standalone UI + SSR-ready build',
      logo: 'https://cdn.simpleicons.org/angular/DD0031',
      href: 'https://angular.dev',
    },
    {
      name: 'TypeScript',
      role: 'Typed scoring and app logic',
      logo: 'https://cdn.simpleicons.org/typescript/3178C6',
      href: 'https://www.typescriptlang.org',
    },
    {
      name: 'Tailwind CSS',
      role: 'Responsive neon interface',
      logo: 'https://cdn.simpleicons.org/tailwindcss/06B6D4',
      href: 'https://tailwindcss.com',
    },
    {
      name: 'Angular Material',
      role: 'Icons and interface primitives',
      logo: 'https://cdn.simpleicons.org/materialdesign/757575',
      href: 'https://material.angular.dev',
    },
    {
      name: 'GitHub OAuth',
      role: 'Read-only contribution login',
      logo: 'https://cdn.simpleicons.org/github/FFFFFF',
      href: 'https://docs.github.com/apps/oauth-apps',
    },
    {
      name: 'GitHub Apps',
      role: 'Selected repo read mode',
      logo: 'https://cdn.simpleicons.org/github/FFFFFF',
      href: 'https://docs.github.com/apps',
    },
    {
      name: 'Cloudflare Pages',
      role: 'Primary app hosting',
      logo: 'https://cdn.simpleicons.org/cloudflare/F38020',
      href: 'https://pages.cloudflare.com',
    },
    {
      name: 'Pages Functions',
      role: 'Server-side token exchange',
      logo: 'https://cdn.simpleicons.org/cloudflare/F38020',
      href: 'https://developers.cloudflare.com/pages/functions',
    },
    {
      name: 'GitHub Pages',
      role: 'Static fallback demo',
      logo: 'https://cdn.simpleicons.org/githubpages/FFFFFF',
      href: 'https://pages.github.com',
    },
    {
      name: 'GitHub Actions',
      role: 'CI and Pages deploy',
      logo: 'https://cdn.simpleicons.org/githubactions/2088FF',
      href: 'https://github.com/features/actions',
    },
    {
      name: 'Simple Icons',
      role: 'Official-style tech logos',
      logo: 'https://cdn.simpleicons.org/simpleicons/FFFFFF',
      href: 'https://simpleicons.org',
    },
    {
      name: 'npm',
      role: 'Package and script workflow',
      logo: 'https://cdn.simpleicons.org/npm/CB3837',
      href: 'https://www.npmjs.com',
    },
  ];
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

  usePresetUsername(username: string) {
    this.username.set(username);
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
