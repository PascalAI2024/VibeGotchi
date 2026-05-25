import { Component, Input, Output, EventEmitter } from '@angular/core';
import { PetState, GitHubUser } from '../models';
import { PetComponent } from '../pet/pet.component';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [PetComponent, MatIconModule],
  template: `
    <div class="min-h-screen w-full flex flex-col items-center justify-start md:justify-center p-4 pt-12">
      
      <!-- Top Bar -->
      <div class="w-full max-w-4xl flex items-center justify-between mb-8">
        <div class="flex items-center gap-4">
          <img [src]="user.avatar_url" class="w-12 h-12 rounded-full border-2 border-slate-700 shadow-lg" [alt]="user.login" crossorigin="anonymous" referrerpolicy="no-referrer">
          <div>
            <h2 class="text-xl font-bold text-slate-100 font-sans">{{user.name || user.login}}</h2>
            <p class="text-sm text-slate-400 font-mono">&#64;{{user.login}}</p>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <button (click)="downloadShareCard()" class="text-emerald-300 hover:text-emerald-200 transition-colors flex items-center gap-2 text-sm font-medium">
            <mat-icon class="text-[18px] w-[18px] h-[18px]">ios_share</mat-icon>
            Share Card
          </button>
          <button (click)="logout.emit()" class="text-slate-400 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium">
            <mat-icon class="text-[18px] w-[18px] h-[18px]">logout</mat-icon>
            Switch User
          </button>
        </div>
      </div>

      <section class="w-full max-w-4xl mb-6 bg-slate-900/70 border border-emerald-500/20 rounded-lg p-4">
        <div class="flex items-start gap-3">
          <mat-icon class="text-emerald-400 mt-0.5">psychology</mat-icon>
          <div>
            <div class="text-[10px] uppercase tracking-wider text-slate-500 font-mono mb-1">Pet readout</div>
            <p class="text-slate-200 font-mono text-sm md:text-base">{{state.personalityLine}}</p>
          </div>
        </div>
      </section>

      @if ((state.privateContributionsCount || 0) > 0) {
        <section class="w-full max-w-4xl mb-6 bg-indigo-950/30 border border-indigo-400/20 rounded-lg p-4">
          <div class="flex items-start gap-3">
            <mat-icon class="text-indigo-300 mt-0.5">domain_verification</mat-icon>
            <div>
              <div class="text-[10px] uppercase tracking-wider text-slate-500 font-mono mb-1">Private and org activity detected</div>
              <p class="text-slate-300 text-sm">
                GitHub reports {{state.privateContributionsCount}} restricted contribution{{state.privateContributionsCount === 1 ? '' : 's'}} in the contribution graph. VibeGotchi counts the activity signal, but does not request private repo names, source, or language metadata.
              </p>
            </div>
          </div>
        </section>
      }

      <!-- Main Stage -->
      <div class="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <!-- Stats Left -->
        <div class="flex flex-col gap-4 order-2 md:order-1">
          <div class="bg-slate-800/50 border border-slate-700/50 backdrop-blur-md rounded-2xl p-5 shadow-sm">
            <div class="flex items-center gap-2 mb-2 text-slate-400">
               <mat-icon class="text-[18px] w-[18px] h-[18px]">local_fire_department</mat-icon>
               <span class="text-xs uppercase tracking-wider font-semibold">Streak</span>
            </div>
            <div class="text-3xl font-mono font-bold text-amber-400">{{state.commitStreak}} <span class="text-lg text-slate-500">Days</span></div>
          </div>
          
          <div class="bg-slate-800/50 border border-slate-700/50 backdrop-blur-md rounded-2xl p-5 shadow-sm">
            <div class="flex items-center gap-2 mb-2 text-slate-400">
               <mat-icon class="text-[18px] w-[18px] h-[18px]">history</mat-icon>
               <span class="text-xs uppercase tracking-wider font-semibold">Last Commit</span>
            </div>
            <div class="text-2xl font-mono font-bold text-slate-200">
              @if (state.daysSinceLastCommit === 0) {
                <span class="text-emerald-400">Today</span>
              } @else if (state.daysSinceLastCommit === 1) {
                Yesterday
              } @else if (state.daysSinceLastCommit < 900) {
                {{state.daysSinceLastCommit}} <span class="text-base text-slate-500">days ago</span>
              } @else {
                <span class="text-slate-500">Never/Unknown</span>
              }
            </div>
          </div>
        </div>

        <!-- Central Pet -->
        <div class="flex flex-col items-center justify-center order-1 md:order-2">
          
          <div class="mb-2 text-center">
            <h3 class="text-emerald-400 font-mono tracking-widest uppercase text-sm font-bold flex items-center justify-center gap-2">
              Lvl {{state.level}} {{state.stage}}
            </h3>
            <div class="text-slate-400 text-xs mt-1">{{state.mood}}</div>
            <div
              class="mt-2 inline-flex items-center justify-center gap-1 rounded-full border px-3 py-1 text-[10px] font-mono uppercase tracking-wider"
              [class.border-emerald-400]="state.careState === 'Thriving'"
              [class.text-emerald-300]="state.careState === 'Thriving'"
              [class.border-cyan-400]="state.careState === 'Active'"
              [class.text-cyan-300]="state.careState === 'Active'"
              [class.border-amber-400]="state.careState === 'Resting'"
              [class.text-amber-300]="state.careState === 'Resting'"
              [class.border-red-400]="state.careState === 'Neglected'"
              [class.text-red-300]="state.careState === 'Neglected'"
            >
              <mat-icon class="text-[14px] w-[14px] h-[14px]">{{careIcon()}}</mat-icon>
              {{state.careState}}
            </div>
          </div>

          <app-pet [state]="state"></app-pet>
          
          <!-- XP Bar -->
          <div class="w-48 mt-4">
            <div class="flex justify-between text-[10px] text-slate-500 font-mono mb-1 uppercase tracking-wider">
              <span>XP {{state.xp}}</span>
              <span>Next {{state.xpToNextLevel}}</span>
            </div>
            <div class="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div class="h-full bg-indigo-500 transition-all duration-1000 ease-out" 
                   [style.width.%]="(state.xp / state.xpToNextLevel) * 100"></div>
            </div>
          </div>
        </div>

        <!-- Stats Right -->
        <div class="flex flex-col gap-4 order-3 md:order-3">
          <div class="bg-slate-800/50 border border-slate-700/50 backdrop-blur-md rounded-2xl p-5 shadow-sm">
             <div class="flex items-center gap-2 mb-2 text-slate-400">
               <mat-icon class="text-[18px] w-[18px] h-[18px]">favorite</mat-icon>
               <span class="text-xs uppercase tracking-wider font-semibold">Vitality</span>
            </div>
            <div class="flex items-end gap-2">
              <div class="text-3xl font-mono font-bold" 
                   [class.text-emerald-400]="state.health > 70"
                   [class.text-amber-400]="state.health > 30 && state.health <= 70"
                   [class.text-red-500]="state.health <= 30">{{state.health}}%</div>
            </div>
            <div class="mt-2 text-xs text-slate-500">{{careDescription()}}</div>
          </div>
          
          <div class="bg-slate-800/50 border border-slate-700/50 backdrop-blur-md rounded-2xl p-5 shadow-sm flex flex-col justify-between">
            <div class="flex items-center gap-2 mb-2 text-slate-400">
               <mat-icon class="text-[18px] w-[18px] h-[18px]">terminal</mat-icon>
               <span class="text-xs uppercase tracking-wider font-semibold">Latest Commit</span>
            </div>
            <div class="text-sm text-slate-300 italic line-clamp-3 font-mono bg-slate-900/50 p-2 rounded-md border border-slate-800">
               @if (state.lastCommitMessage) {
                 "{{state.lastCommitMessage}}"
               } @else {
                 No recent commits detected.
               }
            </div>
            @if (state.activitySource) {
              <div class="mt-2 text-[10px] uppercase tracking-wider text-slate-500 font-mono">
                {{state.activitySource}}
              </div>
            }
          </div>
        </div>

      </div>

      @if (state.techBadges.length) {
        <section class="w-full max-w-4xl mt-6 bg-slate-900/60 border border-slate-800 rounded-lg p-4">
          <div class="flex items-center justify-between gap-3 mb-3">
            <div class="flex items-center gap-2 text-slate-300">
              <mat-icon class="text-[18px] w-[18px] h-[18px] text-emerald-400">workspace_premium</mat-icon>
              <h3 class="text-sm uppercase tracking-wider font-semibold">Tech Badges</h3>
            </div>
            <span class="text-[10px] uppercase tracking-wider text-slate-500 font-mono">By visible public repo language count</span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            @for (badge of state.techBadges; track badge.tech) {
              <div class="border border-slate-800 bg-slate-950/60 rounded-lg px-3 py-2 flex items-center justify-between gap-3">
                <div class="min-w-0 flex items-center gap-3">
                  <div class="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-slate-800 bg-slate-900">
                    @if (badge.iconUrl) {
                      <img
                        class="h-5 w-5"
                        [src]="badge.iconUrl"
                        [alt]="badge.tech + ' logo'"
                        loading="lazy"
                        referrerpolicy="no-referrer"
                      >
                    } @else {
                      <span class="text-xs font-bold text-slate-400">{{badge.tech.slice(0, 2).toUpperCase()}}</span>
                    }
                  </div>
                  <div class="min-w-0">
                    <div class="text-sm font-bold text-slate-100 truncate">{{badge.tech}}</div>
                    <div class="text-[11px] text-slate-500 font-mono">{{badge.repoCount}} repos</div>
                  </div>
                </div>
                <div
                  class="shrink-0 rounded-md border px-2 py-1 text-right"
                  [class.border-amber-600]="badge.tier === 'Bronze'"
                  [class.border-slate-400]="badge.tier === 'Silver'"
                  [class.border-yellow-400]="badge.tier === 'Gold'"
                  [class.border-cyan-300]="badge.tier === 'Platinum'"
                  [class.border-fuchsia-400]="badge.tier === 'Legend'"
                >
                  <div
                    class="text-xs font-bold"
                    [class.text-amber-500]="badge.tier === 'Bronze'"
                    [class.text-slate-300]="badge.tier === 'Silver'"
                    [class.text-yellow-300]="badge.tier === 'Gold'"
                    [class.text-cyan-300]="badge.tier === 'Platinum'"
                    [class.text-fuchsia-300]="badge.tier === 'Legend'"
                  >
                    Lv {{badge.level}}
                  </div>
                  <div class="text-[9px] uppercase tracking-wider text-slate-500">{{badge.tier}}</div>
                </div>
              </div>
            }
          </div>
        </section>
      }

      @if (state.achievements.length || state.scoreBreakdown.length) {
        <div class="w-full max-w-4xl mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          @if (state.achievements.length) {
            <section class="bg-slate-900/60 border border-slate-800 rounded-lg p-4">
              <div class="flex items-center gap-2 text-slate-300 mb-3">
                <mat-icon class="text-[18px] w-[18px] h-[18px] text-yellow-300">military_tech</mat-icon>
                <h3 class="text-sm uppercase tracking-wider font-semibold">Achievements</h3>
              </div>
              <div class="flex flex-col gap-2">
                @for (achievement of state.achievements; track achievement.name) {
                  <div class="flex items-start gap-3 rounded-md border border-slate-800 bg-slate-950/50 p-2">
                    <mat-icon class="text-[18px] w-[18px] h-[18px] text-yellow-300 mt-0.5">{{achievement.icon}}</mat-icon>
                    <div>
                      <div class="text-sm font-bold text-slate-100">{{achievement.name}}</div>
                      <div class="text-xs text-slate-500">{{achievement.description}}</div>
                    </div>
                  </div>
                }
              </div>
            </section>
          }

          @if (state.scoreBreakdown.length) {
            <section class="bg-slate-900/60 border border-slate-800 rounded-lg p-4">
              <div class="flex items-center gap-2 text-slate-300 mb-3">
                <mat-icon class="text-[18px] w-[18px] h-[18px] text-indigo-300">query_stats</mat-icon>
                <h3 class="text-sm uppercase tracking-wider font-semibold">Score Breakdown</h3>
              </div>
              <div class="flex flex-col gap-2">
                @for (item of state.scoreBreakdown; track item.label) {
                  <div class="flex items-center justify-between gap-3 text-sm font-mono">
                    <span class="text-slate-400">{{item.label}}</span>
                    <span class="text-emerald-300">+{{item.value}} XP</span>
                  </div>
                }
              </div>
            </section>
          }
        </div>
      }
    </div>
  `
})
export class DashboardComponent {
  @Input({required: true}) user!: GitHubUser;
  @Input({required: true}) state!: PetState;
  @Output() logout = new EventEmitter<void>();

  downloadShareCard() {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 630;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const topBadges = this.state.techBadges.slice(0, 4);
    const gradient = ctx.createLinearGradient(0, 0, 1200, 630);
    gradient.addColorStop(0, '#020617');
    gradient.addColorStop(0.55, '#0f172a');
    gradient.addColorStop(1, '#064e3b');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1200, 630);

    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 4;
    ctx.strokeRect(28, 28, 1144, 574);

    ctx.fillStyle = '#a7f3d0';
    ctx.font = '700 30px monospace';
    ctx.fillText('VIBE GOTCHI', 70, 90);

    ctx.fillStyle = '#f8fafc';
    ctx.font = '800 68px sans-serif';
    ctx.fillText(`${this.state.stage} · Level ${this.state.level}`, 70, 175);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '28px monospace';
    ctx.fillText(`@${this.user.login}`, 70, 225);
    ctx.fillText(`${this.state.careState} · ${this.state.health}% vitality · ${this.state.commitStreak} day streak`, 70, 270);

    ctx.fillStyle = '#e2e8f0';
    ctx.font = '24px monospace';
    this.wrapText(ctx, this.state.personalityLine, 70, 335, 820, 34);

    ctx.fillStyle = '#10b981';
    ctx.font = '700 26px monospace';
    ctx.fillText('Top Tech Badges', 70, 455);

    topBadges.forEach((badge, index) => {
      const x = 70 + index * 260;
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(x, 485, 230, 82);
      ctx.strokeStyle = '#334155';
      ctx.strokeRect(x, 485, 230, 82);
      ctx.fillStyle = '#f8fafc';
      ctx.font = '700 24px sans-serif';
      ctx.fillText(badge.tech.slice(0, 13), x + 18, 522);
      ctx.fillStyle = '#a7f3d0';
      ctx.font = '18px monospace';
      ctx.fillText(`Lv ${badge.level} ${badge.tier}`, x + 18, 552);
    });

    ctx.fillStyle = '#64748b';
    ctx.font = '18px monospace';
    ctx.fillText('vibegotchi.pages.dev', 880, 585);

    const link = document.createElement('a');
    link.download = `vibegotchi-${this.user.login}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  private wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
    const words = text.split(' ');
    let line = '';
    for (const word of words) {
      const testLine = `${line}${word} `;
      if (ctx.measureText(testLine).width > maxWidth && line) {
        ctx.fillText(line, x, y);
        line = `${word} `;
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, y);
  }

  careIcon() {
    if (this.state.careState === 'Thriving') return 'restaurant';
    if (this.state.careState === 'Active') return 'bolt';
    if (this.state.careState === 'Resting') return 'bedtime';
    return 'sentiment_dissatisfied';
  }

  careDescription() {
    if (this.state.careState === 'Thriving') return 'Fed by activity today.';
    if (this.state.careState === 'Active') return 'Recently active and healthy.';
    if (this.state.careState === 'Resting') return 'Quiet for a bit, but not abandoned.';
    return 'Needs a push soon. Possibly dramatic.';
  }
}
