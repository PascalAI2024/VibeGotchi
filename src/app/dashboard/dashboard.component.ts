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
        <button (click)="logout.emit()" class="text-slate-400 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium">
          <mat-icon class="text-[18px] w-[18px] h-[18px]">logout</mat-icon>
          Switch User
        </button>
      </div>

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
    </div>
  `
})
export class DashboardComponent {
  @Input({required: true}) user!: GitHubUser;
  @Input({required: true}) state!: PetState;
  @Output() logout = new EventEmitter<void>();
}
