import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { AchievementBadge } from '../models';

const CONFETTI_COUNT = 8;
const CONFETTI_COLORS = [
  'bg-amber-300',
  'bg-emerald-300',
  'bg-fuchsia-300',
  'bg-cyan-300',
  'bg-rose-300',
  'bg-indigo-300',
] as const;

interface ConfettiDot {
  id: number;
  colorClass: string;
  delayMs: number;
  xDrift: number; // px from center
  yDrift: number; // px from center (downward)
}

/**
 * Self-contained celebration toast for a single unlocked achievement.
 *
 * Animation timeline (4s by default):
 *   0.0s - 0.3s   scale-in (0.4 -> 1.05 with a soft overshoot)
 *   0.3s - 0.6s   settle to scale 1.0
 *   0.3s - 1.2s   glow pulse (1 cycle)
 *   0.1s - 1.5s   confetti scatter (8 colored dots, staggered)
 *   3.4s - 4.0s   fade out + slight scale down
 *
 * The component is purely presentational — it does not own the queueing
 * logic. The parent (DashboardComponent) decides when to mount/unmount it
 * and forwards a `dismiss` event when its 4s timer is up.
 */
@Component({
  selector: 'app-achievement-celebration',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
  template: `
    <div
      class="celebration-root relative w-72 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-amber-300/40 bg-slate-900/95 px-4 py-3 shadow-[0_0_40px_-5px_rgba(251,191,36,0.45)] backdrop-blur-md"
      role="status"
      aria-live="polite"
    >
      <!-- Glow ring behind the badge -->
      <div
        class="celebration-glow pointer-events-none absolute -inset-2 rounded-2xl bg-amber-400/20 blur-xl"
        aria-hidden="true"
      ></div>

      <div class="relative flex items-start gap-3">
        <div
          class="celebration-badge grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-amber-300/60 bg-amber-400/15 text-amber-200"
        >
          <mat-icon class="text-[22px] w-[22px] h-[22px]">{{ achievement.icon }}</mat-icon>
        </div>
        <div class="min-w-0 flex-1">
          <div
            class="text-[10px] font-mono uppercase tracking-[0.18em] text-amber-300/80"
          >
            Achievement unlocked
          </div>
          <div class="mt-0.5 truncate text-sm font-bold text-slate-50">
            {{ achievement.name }}
          </div>
          <div class="mt-0.5 line-clamp-2 text-[11px] leading-snug text-slate-300">
            {{ achievement.description }}
          </div>
        </div>
      </div>

      <!-- Confetti scatter (CSS only, no library) -->
      <div
        class="pointer-events-none absolute inset-0 flex items-center justify-center"
        aria-hidden="true"
      >
        @for (dot of confettiDots; track dot.id) {
          <span
            class="celebration-confetti absolute h-1.5 w-1.5 rounded-full opacity-0"
            [class]="dot.colorClass"
            [style.transform]="'translate(0,0) scale(0.6)'"
            [style.animationDelay.ms]="dot.delayMs"
            [style.--x-drift.px]="dot.xDrift"
            [style.--y-drift.px]="dot.yDrift"
          ></span>
        }
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        animation: celeb-enter 360ms cubic-bezier(0.34, 1.56, 0.64, 1) both,
          celeb-exit 600ms ease-in 3400ms both;
        will-change: transform, opacity;
      }

      .celebration-glow {
        animation: celeb-glow-pulse 900ms ease-in-out 300ms 1 both;
      }

      .celebration-badge {
        animation: celeb-badge-pop 420ms cubic-bezier(0.34, 1.56, 0.64, 1) 60ms both;
      }

      .celebration-confetti {
        animation: celeb-confetti 1300ms cubic-bezier(0.22, 1, 0.36, 1) both;
      }

      @keyframes celeb-enter {
        0% {
          opacity: 0;
          transform: translate3d(0, -8px, 0) scale(0.4);
        }
        70% {
          opacity: 1;
          transform: translate3d(0, 0, 0) scale(1.05);
        }
        100% {
          opacity: 1;
          transform: translate3d(0, 0, 0) scale(1);
        }
      }

      @keyframes celeb-exit {
        0% {
          opacity: 1;
          transform: translate3d(0, 0, 0) scale(1);
        }
        100% {
          opacity: 0;
          transform: translate3d(0, -4px, 0) scale(0.96);
        }
      }

      @keyframes celeb-glow-pulse {
        0% {
          opacity: 0;
          transform: scale(0.85);
        }
        50% {
          opacity: 1;
          transform: scale(1.08);
        }
        100% {
          opacity: 0.6;
          transform: scale(1);
        }
      }

      @keyframes celeb-badge-pop {
        0% {
          transform: scale(0.6);
        }
        70% {
          transform: scale(1.15);
        }
        100% {
          transform: scale(1);
        }
      }

      @keyframes celeb-confetti {
        0% {
          opacity: 0;
          transform: translate(0, 0) scale(0.4);
        }
        15% {
          opacity: 1;
        }
        100% {
          opacity: 0;
          transform: translate(var(--x-drift, 0), var(--y-drift, 0)) scale(0.9);
        }
      }
    `,
  ],
})
export class AchievementCelebrationComponent implements OnInit, OnDestroy {
  @Input({ required: true }) achievement!: AchievementBadge;
  @Input() autoDismissMs = 4000;
  @Output() dismiss = new EventEmitter<void>();

  /**
   * Pre-computed confetti dots. Each dot gets a random color, stagger
   * delay, and scatter direction so the burst feels organic without
   * requiring any JS animation loop.
   */
  readonly confettiDots: ConfettiDot[] = Array.from(
    { length: CONFETTI_COUNT },
    (_, i) => {
      const angle = (Math.PI * 2 * i) / CONFETTI_COUNT + (Math.random() - 0.5) * 0.5;
      const distance = 36 + Math.random() * 28; // 36-64 px from center
      return {
        id: i,
        colorClass: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        delayMs: 60 + i * 35, // staggered start, ~35ms apart
        xDrift: Math.cos(angle) * distance,
        yDrift: Math.sin(angle) * distance,
      };
    }
  );

  private dismissTimer: ReturnType<typeof setTimeout> | null = null;

  ngOnInit() {
    this.dismissTimer = setTimeout(() => {
      this.dismiss.emit();
    }, this.autoDismissMs);
  }

  ngOnDestroy() {
    if (this.dismissTimer !== null) {
      clearTimeout(this.dismissTimer);
      this.dismissTimer = null;
    }
  }
}
