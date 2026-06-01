import { ChangeDetectionStrategy, Component, Input, computed, signal } from '@angular/core';
import { ContributionDay } from '../models';

interface TimelineCell {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
  label: string;
}

/**
 * Horizontal activity strip showing the last 90 days of contributions.
 * Renders a 7-row grid (days of the week) x 13 columns (weeks), with cell
 * intensity derived from contribution count. Hover any cell to see the date
 * and exact count in a tooltip.
 */
@Component({
  selector: 'app-activity-timeline',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (cells().length > 0) {
      <div class="relative">
        <div class="flex items-center justify-between gap-2 mb-2">
          <h3 class="text-xs uppercase tracking-widest font-semibold text-slate-300 flex items-center gap-2">
            <span class="text-emerald-400">▦</span>
            Activity (last 90 days)
          </h3>
          <div class="flex items-center gap-1.5 text-[10px] font-mono text-slate-500">
            <span>Less</span>
            @for (lvl of [0, 1, 2, 3, 4]; track lvl) {
              <span
                class="inline-block h-2.5 w-2.5 rounded-sm border border-slate-800"
                [class.bg-slate-800]="lvl === 0"
                [class.bg-emerald-900]="lvl === 1"
                [class.bg-emerald-700]="lvl === 2"
                [class.bg-emerald-500]="lvl === 3"
                [class.bg-emerald-300]="lvl === 4"></span>
            }
            <span>More</span>
          </div>
        </div>
        <div
          class="relative grid gap-[3px] overflow-x-auto"
          [style.gridTemplateRows]="'repeat(7, minmax(0, 1fr))'"
          [style.gridTemplateColumns]="'repeat(' + columns() + ', minmax(0, 1fr))'"
          [style.gridAutoFlow]="'column'"
          role="img"
          [attr.aria-label]="'Activity timeline showing ' + cells().length + ' days'">
          @for (cell of cells(); track cell.date) {
            <div
              class="aspect-square rounded-sm border border-slate-800/50 cursor-default transition-transform hover:scale-125 hover:z-10 hover:border-slate-600"
              [class.bg-slate-800]="cell.level === 0"
              [class.bg-emerald-900]="cell.level === 1"
              [class.bg-emerald-700]="cell.level === 2"
              [class.bg-emerald-500]="cell.level === 3"
              [class.bg-emerald-300]="cell.level === 4"
              [attr.title]="cell.label"
              [attr.aria-label]="cell.label"></div>
          }
        </div>
        <p class="mt-2 text-[11px] font-mono text-slate-500">
          <span class="text-emerald-300 font-bold">{{totalContributions()}}</span> contributions
          over <span class="text-slate-300">{{activeDays()}}</span> active days
        </p>
      </div>
    } @else {
      <div class="rounded-md border border-slate-800 bg-slate-900/40 p-4 text-center">
        <p class="text-[11px] font-mono uppercase tracking-widest text-slate-500">Activity timeline</p>
        <p class="mt-1 text-sm text-slate-400">Detailed activity is available after GitHub login.</p>
        <p class="mt-1 text-[11px] text-slate-500">Public username lookup uses event history only.</p>
      </div>
    }
  `,
})
export class ActivityTimelineComponent {
  private _days = signal<ContributionDay[]>([]);

  @Input({ required: true }) set days(value: ContributionDay[]) {
    this._days.set(value ?? []);
  }

  /**
   * Optional cap on the number of days to display. Defaults to 91 (13 weeks).
   */
  @Input() maxDays = 91;

  cells = computed<TimelineCell[]>(() => {
    const raw = this._days();
    if (!raw || raw.length === 0) {
      return [];
    }
    // Sort by date desc and take the last maxDays
    const sorted = [...raw].sort((a, b) => b.date.localeCompare(a.date)).slice(0, this.maxDays);
    // Reverse to chronological for left-to-right rendering
    return sorted
      .slice()
      .reverse()
      .map((d) => {
        const count = d.contributionCount;
        const level: TimelineCell['level'] =
          count === 0 ? 0 : count < 4 ? 1 : count < 7 ? 2 : count < 11 ? 3 : 4;
        const dateLabel = new Date(`${d.date}T00:00:00`).toLocaleDateString(undefined, {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
        return {
          date: d.date,
          count,
          level,
          label: `${count} contribution${count === 1 ? '' : 's'} on ${dateLabel}`,
        };
      });
  });

  columns = computed(() => Math.ceil(this.cells().length / 7));

  totalContributions = computed(() =>
    this.cells().reduce((sum, c) => sum + c.count, 0)
  );

  activeDays = computed(() => this.cells().filter((c) => c.count > 0).length);
}
