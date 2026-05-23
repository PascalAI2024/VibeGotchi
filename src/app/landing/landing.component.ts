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
    <div class="min-h-screen w-full max-w-full overflow-x-hidden flex flex-col items-center justify-center p-6 text-center pt-24 md:pt-10">
      
      <div class="w-full max-w-5xl mb-12 animate-fade-in-up">
        <h1 class="text-4xl sm:text-6xl md:text-8xl font-sans font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-emerald-400 via-teal-300 to-indigo-500 mb-4 drop-shadow-[0_0_15px_rgba(52,211,153,0.3)]">
          VIBE GOTCHI
        </h1>
        <p class="text-lg sm:text-xl text-slate-400 font-mono max-w-xs sm:max-w-lg mx-auto">
          A virtual pet that feeds on your commits. <br class="hidden md:block"/> Connect your GitHub. Ship code. Keep it alive.
        </p>
        <img
          src="vibegotchi-banner.jpeg"
          alt="VibeGotchi evolution banner"
          class="mt-8 block w-full max-w-full md:max-w-5xl mx-auto rounded-lg border border-slate-800 shadow-2xl shadow-black/40"
          loading="eager"
          fetchpriority="high"
        />
      </div>

      <div class="w-full max-w-md animate-fade-in-up" style="animation-delay: 150ms;">
        
        <button 
          (click)="handleLogin()"
          [disabled]="isLoading || isAuthUnavailable()"
          class="group relative w-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 hover:border-emerald-500 text-emerald-300 py-4 rounded-2xl font-bold tracking-widest uppercase transition-all overflow-hidden flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mb-6"
        >
           <div class="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/10 to-emerald-500/0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
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

        <div class="flex items-center text-slate-500 text-sm font-mono mb-6 before:flex-1 before:border-t before:border-slate-800 before:mr-4 after:flex-1 after:border-t after:border-slate-800 after:ml-4">
          OR PUBLIC LOOKUP
        </div>

        <form (ngSubmit)="onSubmit()" class="flex flex-col gap-4">
          <div class="relative group">
            <div class="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
              <mat-icon>code</mat-icon>
            </div>
            <input 
              type="text" 
              name="username" 
              [ngModel]="username()"
              (ngModelChange)="username.set($event)"
              placeholder="Enter GitHub Username" 
              required
              autocomplete="off"
              class="w-full bg-slate-900/80 border-2 border-slate-700/50 text-slate-100 rounded-2xl py-4 pl-12 pr-4 text-lg font-mono placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all shadow-inner"
            >
          </div>
          
          <button 
            type="submit" 
            [disabled]="!username() || isLoading"
            class="group relative w-full bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 hover:border-indigo-500 text-indigo-300 py-4 rounded-2xl font-bold tracking-widest uppercase transition-all overflow-hidden flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div class="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/10 to-indigo-500/0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
            @if (isLoading) {
              <mat-icon class="animate-spin relative z-10 w-[20px] h-[20px] text-[20px]">sync</mat-icon>
              <span class="relative z-10">Syncing...</span>
            } @else {
              <mat-icon class="relative z-10 w-[20px] h-[20px] text-[20px]">search</mat-icon>
              <span class="relative z-10">Public Lookup</span>
            }
          </button>
        </form>
        @if (errorMsg) {
          <p class="mt-4 text-red-400 text-sm font-mono flex items-center justify-center gap-1">
             <mat-icon class="text-[16px] w-[16px] h-[16px]">error_outline</mat-icon>
             {{errorMsg}}
          </p>
        }
      </div>

      <section class="w-full max-w-5xl mt-14 animate-fade-in-up" style="animation-delay: 260ms;">
        <div class="flex items-end justify-between gap-4 mb-5 text-left">
          <div>
            <h2 class="text-lg md:text-xl font-bold text-slate-100">Evolution demo</h2>
            <p class="text-sm text-slate-500 font-mono max-w-xs sm:max-w-none">Preview every stage without grinding commits like a Victorian factory owner.</p>
          </div>
          <mat-icon class="hidden sm:block text-emerald-400">auto_awesome</mat-icon>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          @for (demoState of demoStates; track demoState.stage) {
            <button
              type="button"
              (click)="demo.emit(demoState)"
              class="group text-left bg-slate-900/70 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/60 rounded-lg p-3 transition-all shadow-lg"
            >
              <div class="h-28 flex items-center justify-center overflow-hidden">
                <div class="w-32 scale-75 group-hover:scale-[0.8] transition-transform">
                  <app-pet [state]="demoState" [interactive]="false"></app-pet>
                </div>
              </div>
              <div class="mt-2 flex items-center justify-between gap-2">
                <div>
                  <div class="text-sm font-bold text-slate-100">{{demoState.stage}}</div>
                  <div class="text-xs font-mono text-slate-500">Lvl {{demoState.level}} · {{demoState.mood}}</div>
                </div>
                <mat-icon class="text-[18px] w-[18px] h-[18px] text-slate-500 group-hover:text-emerald-400">play_arrow</mat-icon>
              </div>
            </button>
          }
        </div>
      </section>

    </div>
  `,
  styles: [`
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
  @Input() isLoading = false;
  @Input() errorMsg = '';
  @Input({ required: true }) demoStates: PetState[] = [];
  
  @Output() connect = new EventEmitter<string>();
  @Output() authFinish = new EventEmitter<string>();
  @Output() demo = new EventEmitter<PetState>();

  private messageListener = (event: MessageEvent) => {
    const allowedOrigin = this.getAllowedMessageOrigin();
    if (allowedOrigin && event.origin !== allowedOrigin) {
      return;
    }
    if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
      this.authFinish.emit(event.data.token);
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
    } catch {
      this.authApiBaseUrl.set(window.location.hostname === 'localhost' ? '' : null);
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
