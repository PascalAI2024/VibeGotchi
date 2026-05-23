import { Component, Input, OnChanges, SimpleChanges, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { PetState } from '../models';
import { animate } from 'motion';

@Component({
  selector: 'app-pet',
  standalone: true,
  imports: [NgTemplateOutlet],
  template: `
    <div class="relative w-full max-w-sm aspect-square flex flex-col items-center justify-center">
      <!-- Glow effect -->
      <div 
        class="absolute inset-0 rounded-full blur-3xl opacity-30 mix-blend-screen transition-colors duration-1000"
        [class.bg-emerald-400]="state.health > 70"
        [class.bg-amber-400]="state.health > 30 && state.health <= 70"
        [class.bg-red-500]="state.health <= 30 && state.health > 0"
        [class.bg-slate-700]="state.health === 0"
      ></div>

      <!-- Main Pet SVG Container -->
      <div #petContainer class="relative z-10 w-full h-full p-3 transition-transform duration-1000 ease-in-out sm:p-5">
        
        <!-- DEAD STATE -->
        @if (state.mood === 'Dead') {
          <svg viewBox="-20 -20 140 140" class="w-full h-full text-slate-500 fill-current drop-shadow-lg overflow-visible">
            <!-- Tombstone -->
            <path d="M 30,80 L 30,40 C 30,20 70,20 70,40 L 70,80 Z" />
            <rect x="25" y="80" width="50" height="10" rx="2" />
            <text x="50" y="55" font-size="12" font-family="monospace" text-anchor="middle" fill="white">R.I.P.</text>
            <text x="50" y="70" font-size="6" font-family="monospace" text-anchor="middle" fill="white">0 commits</text>
          </svg>
        } @else if (useSpriteArt) {
          <img
            [src]="spriteUrl"
            [alt]="state.stage + ' VibeGotchi sprite'"
            class="pet-sprite h-full w-full object-contain drop-shadow-2xl"
            [class.pet-sprite-ecstatic]="state.mood === 'Ecstatic'"
            [class.pet-sprite-happy]="state.mood === 'Happy'"
            [class.pet-sprite-neutral]="state.mood === 'Neutral'"
            [class.pet-sprite-sad]="state.mood === 'Sad'"
            [class.pet-sprite-sit]="currentPosture === 'Sit'"
            [class.pet-sprite-lay]="currentPosture === 'LayDown'"
          />
        } @else {
          
          <!-- LIVING STATES -->
          <svg viewBox="-20 -20 140 140" class="w-full h-full drop-shadow-xl transition-all duration-1000 ease-in-out overflow-visible"
               [attr.data-mood]="state.mood"
               [attr.data-posture]="currentPosture"
               [class.pet-egg]="state.stage === 'Egg'"
               [class.pet-baby]="state.stage === 'Baby'"
               [class.pet-teen]="state.stage === 'Teen'"
               [class.pet-adult]="state.stage === 'Adult'"
               [class.pet-elder]="state.stage === 'Elder'"
               [class.text-emerald-400]="state.mood === 'Ecstatic'"
               [class.text-cyan-400]="state.mood === 'Happy'"
               [class.text-amber-300]="state.mood === 'Neutral'"
               [class.text-indigo-400]="state.mood === 'Sad'"
               [style.--body-dark]="state.mood === 'Ecstatic' ? '#059669' : state.mood === 'Happy' ? '#0891b2' : state.mood === 'Neutral' ? '#d97706' : '#4f46e5'"
               [style.--accent]="state.mood === 'Ecstatic' ? '#fbbf24' : state.mood === 'Happy' ? '#f472b6' : state.mood === 'Neutral' ? '#22c55e' : '#f9a8d4'"
               [style.--belly]="state.mood === 'Ecstatic' ? '#a7f3d0' : state.mood === 'Happy' ? '#a5f3fc' : state.mood === 'Neutral' ? '#fde68a' : '#c7d2fe'"
               [style.--eye-dark]="state.mood === 'Ecstatic' ? '#064e3b' : state.mood === 'Happy' ? '#164e63' : state.mood === 'Neutral' ? '#78350f' : '#312e81'">
            
            <defs>
              <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="currentColor" stop-opacity="1" />
                <stop offset="100%" stop-color="var(--body-dark)" stop-opacity="0.85" />
              </linearGradient>
              <linearGradient id="faceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="var(--belly)" stop-opacity="0.95" />
                <stop offset="100%" stop-color="currentColor" stop-opacity="0.4" />
              </linearGradient>
              <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="var(--accent)" stop-opacity="0.9" />
                <stop offset="100%" stop-color="var(--body-dark)" stop-opacity="0.5" />
              </linearGradient>
              <linearGradient id="bellyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="var(--belly)" stop-opacity="0.85"/>
                <stop offset="100%" stop-color="currentColor" stop-opacity="0.1"/>
              </linearGradient>
            </defs>

            @if (state.stage === 'Egg') {
               <g class="pet-body">
                 <path class="anim-egg" d="M 50,20 C 70,20 80,50 80,70 C 80,90 20,90 20,70 C 20,50 30,20 50,20 Z" fill="url(#bodyGrad)" stroke="var(--body-dark)" stroke-width="2"/>
                 <g class="anim-egg" fill="var(--accent)" opacity="0.5">
                   <circle cx="35" cy="45" r="5" />
                   <circle cx="65" cy="55" r="8" />
                   <circle cx="45" cy="75" r="6" />
                   <circle cx="60" cy="35" r="4" />
                 </g>
                 @if (state.mood === 'Ecstatic' || state.health > 80) {
                   <path class="anim-egg-crack" d="M 35,45 L 45,55 L 40,65 L 55,70 M 50,20 L 50,25" stroke="var(--belly)" stroke-width="2.5" fill="none" stroke-linecap="round"/>
                 }
               </g>
            }

            @if (state.stage === 'Baby') {
               <g class="pet-body anim-macaque-sway">
                  <!-- Tail -->
                  <path class="anim-tail" d="M 72,70 Q 100,75 90,40" fill="none" stroke="url(#accentGrad)" stroke-width="6" stroke-linecap="round"/>
                  <circle class="anim-tail" cx="90" cy="40" r="3" fill="var(--accent)" />
                  
                  <g class="pet-torso anim-macaque-breathe">
                     <!-- Body -->
                     <circle cx="50" cy="72" r="24" fill="url(#bodyGrad)" stroke="var(--body-dark)" stroke-width="2"/>
                     <!-- Belly -->
                     <circle cx="50" cy="76" r="14" fill="url(#bellyGrad)" opacity="0.9"/>
                  </g>
                  
                  <!-- Little feet (planted) -->
                  <g class="pet-feet">
                     <ellipse cx="38" cy="92" rx="6" ry="4" fill="var(--body-dark)" />
                     <ellipse cx="62" cy="92" rx="6" ry="4" fill="var(--body-dark)" />
                  </g>
                  
                  <g class="anim-macaque-head">
                     <!-- Ears -->
                     <g class="anim-ears">
                       <ellipse cx="20" cy="50" rx="14" ry="18" fill="url(#bodyGrad)" stroke="var(--body-dark)" stroke-width="2" transform="rotate(-20 20 50)"/>
                       <ellipse cx="80" cy="50" rx="14" ry="18" fill="url(#bodyGrad)" stroke="var(--body-dark)" stroke-width="2" transform="rotate(20 80 50)"/>
                       <!-- Inner Ear -->
                       <ellipse cx="20" cy="50" rx="8" ry="12" fill="var(--accent)" opacity="0.6" transform="rotate(-20 20 50)"/>
                       <ellipse cx="80" cy="50" rx="8" ry="12" fill="var(--accent)" opacity="0.6" transform="rotate(20 80 50)"/>
                     </g>
                     <!-- Head -->
                     <circle cx="50" cy="48" r="32" fill="url(#bodyGrad)" stroke="var(--body-dark)" stroke-width="2"/>
                     <!-- Face mask -->
                     <path d="M 28,45 C 28,25 72,25 72,45 C 72,65 55,75 50,75 C 45,75 28,65 28,45 Z" fill="url(#faceGrad)"/>
                     <!-- Cheeks -->
                     <circle cx="34" cy="58" r="4" fill="var(--accent)" opacity="0.4"/>
                     <circle cx="66" cy="58" r="4" fill="var(--accent)" opacity="0.4"/>
                     <!-- Nose -->
                     <circle cx="50" cy="53" r="2" fill="var(--eye-dark)" opacity="0.5"/>
                     <!-- Hair tuft -->
                     <path class="anim-hair" d="M 42,18 Q 50,2 55,16 Q 50,-5 45,15 Z" fill="var(--accent)"/>
                     <path class="anim-hair" d="M 50,18 Q 55,5 60,18" stroke="var(--accent)" stroke-width="2" fill="none" stroke-linecap="round"/>
                     
                     <!-- Face Layout -->
                     <ng-container *ngTemplateOutlet="eyesTpl; context: {cy: 43, cx1: 36, cx2: 64, r: 5}"></ng-container>
                     <ng-container *ngTemplateOutlet="mouthTpl; context: {y: 60, x1: 45, x2: 55, c1: 42, c2: 58}"></ng-container>
                  </g>
               </g>
            }

            @if (state.stage === 'Teen') {
               <g class="pet-body anim-capuchin-sway">
                  <!-- Long prehensile Tail -->
                  <path class="anim-tail" d="M 68,75 Q 130,85 100,50 C 70,25 120,20 110,15 C 105,10 95,20 100,25" fill="none" stroke="url(#accentGrad)" stroke-width="8" stroke-linecap="round"/>
                  
                  <g class="anim-capuchin-breathe">
                    <g class="pet-torso">
                      <!-- Lean Body -->
                      <path d="M 35,40 L 65,40 L 75,85 C 75,95 25,95 25,85 Z" fill="url(#bodyGrad)" stroke="var(--body-dark)" stroke-width="2"/>
                      <!-- Belly -->
                      <path d="M 40,43 L 60,43 L 65,80 C 65,85 35,85 35,80 Z" fill="url(#bellyGrad)" opacity="0.9"/>
                    </g>
                    <g class="pet-arms">
                      <!-- Arms -->
                      <path class="anim-arm-l" d="M 32,55 Q -5,45 15,92" fill="none" stroke="url(#accentGrad)" stroke-width="7" stroke-linecap="round"/>
                      <path class="anim-arm-r" d="M 68,55 Q 105,45 85,92" fill="none" stroke="url(#accentGrad)" stroke-width="7" stroke-linecap="round"/>
                      <!-- Hands -->
                      <circle class="anim-arm-l" cx="15" cy="92" r="4" fill="var(--eye-dark)" opacity="0.7"/>
                      <circle class="anim-arm-r" cx="85" cy="92" r="4" fill="var(--eye-dark)" opacity="0.7"/>
                    </g>
                    <g class="pet-feet">
                      <!-- Feet -->
                      <ellipse cx="33" cy="85" rx="5" ry="3" fill="var(--eye-dark)" opacity="0.7" transform="rotate(-15 33 85)"/>
                      <ellipse cx="67" cy="85" rx="5" ry="3" fill="var(--eye-dark)" opacity="0.7" transform="rotate(15 67 85)"/>
                    </g>
                  </g>
                  
                  <g class="anim-capuchin-head">
                    <!-- Ears -->
                    <circle cx="24" cy="45" r="10" fill="url(#bodyGrad)" stroke="var(--body-dark)" stroke-width="2"/>
                    <circle cx="76" cy="45" r="10" fill="url(#bodyGrad)" stroke="var(--body-dark)" stroke-width="2"/>
                    <circle cx="24" cy="45" r="5" fill="var(--accent)" opacity="0.5"/>
                    <circle cx="76" cy="45" r="5" fill="var(--accent)" opacity="0.5"/>
                    <!-- Head -->
                    <path d="M 50,15 C 78,15 82,45 75,60 C 65,70 35,70 25,60 C 18,45 22,15 50,15 Z" fill="url(#bodyGrad)" stroke="var(--body-dark)" stroke-width="2"/>
                    <!-- Face pattern -->
                    <path d="M 33,28 C 67,28 67,58 50,68 C 33,58 33,28 33,28 Z" fill="url(#faceGrad)"/>
                    <!-- Cheeks -->
                    <circle cx="36" cy="55" r="3" fill="var(--accent)" opacity="0.4"/>
                    <circle cx="64" cy="55" r="3" fill="var(--accent)" opacity="0.4"/>
                    <!-- Nose -->
                    <circle cx="50" cy="49" r="1.5" fill="var(--eye-dark)" opacity="0.6"/>
                    <!-- Messy Capuchin Hair / Cap -->
                    <g class="anim-hair" fill="var(--eye-dark)" opacity="0.4">
                       <path d="M 33,25 C 33,-5 67,-5 67,25 C 50,15 40,25 33,25 Z" />
                       <path d="M 40,15 L 42,5 L 48,15 Z" />
                       <path d="M 48,15 L 53,3 L 56,15 Z" />
                    </g>
                    
                    <!-- Face Layout -->
                    <ng-container *ngTemplateOutlet="eyesTpl; context: {cy: 41, cx1: 37, cx2: 63, r: 4.5}"></ng-container>
                    <ng-container *ngTemplateOutlet="mouthTpl; context: {y: 54, x1: 44, x2: 56, c1: 42, c2: 58}"></ng-container>
                  </g>
               </g>
            }

            @if (state.stage === 'Adult') {
               <g class="pet-body anim-gorilla-sway">
                  <!-- Massive Shoulders & Body -->
                  <g class="anim-gorilla-breathe">
                    <g class="pet-torso">
                      <!-- Back bulk -->
                      <path d="M 50,15 C 100,15 110,60 90,95 C 80,98 20,98 10,95 C -10,60 0,15 50,15 Z" fill="url(#bodyGrad)" stroke="var(--body-dark)" stroke-width="2"/>
                      <!-- Silverback / Accent stripe -->
                      <path d="M 15,60 C 15,100 85,100 85,60" fill="none" stroke="url(#accentGrad)" stroke-width="20" stroke-linecap="round" opacity="0.5"/>
                      <path d="M 25,65 C 25,95 75,95 75,65" fill="none" stroke="url(#bellyGrad)" stroke-width="12" stroke-linecap="round" opacity="0.7"/>
                      <!-- Belly/Chest -->
                      <path d="M 30,55 C 50,45 70,55 75,75 C 75,90 25,90 25,75 Z" fill="url(#bellyGrad)" opacity="0.9" />
                      <!-- Chest Pecks -->
                      <g class="anim-chest">
                        <path d="M 25,58 C 35,48 45,55 50,65 C 55,55 65,48 75,58 C 70,80 30,80 25,58 Z" fill="var(--body-dark)" stroke="var(--body-dark)" stroke-width="1.5" opacity="0.5"/>
                        <!-- Nipples -->
                        <circle cx="35" cy="65" r="2.5" fill="var(--body-dark)" opacity="0.8"/>
                        <circle cx="65" cy="65" r="2.5" fill="var(--body-dark)" opacity="0.8"/>
                        <!-- Chest cleft -->
                        <path d="M 50,62 L 50,80" stroke="var(--body-dark)" stroke-width="2" opacity="0.6"/>
                      </g>
                    </g>
                    <g class="pet-feet">
                      <!-- Feet planted -->
                      <ellipse cx="25" cy="95" rx="10" ry="5" fill="var(--eye-dark)" opacity="0.6"/>
                      <ellipse cx="75" cy="95" rx="10" ry="5" fill="var(--eye-dark)" opacity="0.6"/>
                    </g>
                  </g>
                  
                  <!-- Knuckle-walking Arms -->
                  <g class="anim-gorilla-arms">
                    <!-- Thick shoulders and arms -->
                    <path class="anim-arm-l" d="M 12,45 C -25,70 5,95 25,95" fill="none" stroke="url(#bodyGrad)" stroke-width="18" stroke-linecap="round"/>
                    <path class="anim-arm-r" d="M 88,45 C 125,70 95,95 75,95" fill="none" stroke="url(#bodyGrad)" stroke-width="18" stroke-linecap="round"/>
                    <!-- Knuckles -->
                    <circle class="anim-arm-l" cx="25" cy="95" r="9" fill="var(--eye-dark)" opacity="0.7"/>
                    <circle class="anim-arm-r" cx="75" cy="95" r="9" fill="var(--eye-dark)" opacity="0.7"/>
                  </g>

                  <!-- Big Head & Neck Area -->
                  <g class="anim-gorilla-head">
                    <circle cx="22" cy="35" r="6" fill="url(#bodyGrad)" stroke="var(--body-dark)" stroke-width="2"/>
                    <circle cx="78" cy="35" r="6" fill="url(#bodyGrad)" stroke="var(--body-dark)" stroke-width="2"/>
                    <!-- Domed Head / Sagittal crest -->
                    <path d="M 25,48 C 20,15 40,-5 50,-5 C 60,-5 80,15 75,48 C 75,75 25,75 25,48 Z" fill="url(#bodyGrad)" stroke="var(--body-dark)" stroke-width="2"/>
                    <!-- Head Highlights -->
                    <path d="M 40,5 C 50,-5 60,5 65,25 C 65,35 35,35 35,25 Z" fill="var(--accent)" opacity="0.4"/>
                    <!-- Face Mask -->
                    <path d="M 30,42 C 30,25 70,25 70,42 C 70,68 30,68 30,42 Z" fill="url(#faceGrad)"/>
                    <path d="M 35,45 C 35,35 65,35 65,45 C 65,65 35,65 35,45 Z" fill="var(--body-dark)" opacity="0.3"/>
                    <!-- Heavy Brow ridge -->
                    <path class="anim-brow" d="M 28,32 Q 50,42 72,32" stroke="var(--body-dark)" stroke-width="6" stroke-linecap="round" fill="none"/>
                    <path class="anim-brow" d="M 30,32 Q 50,42 70,32" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" fill="none" opacity="0.6"/>
                    <!-- Nostrils -->
                    <path d="M 46,47 Q 50,45 54,47" stroke="var(--eye-dark)" stroke-width="2" stroke-linecap="round" fill="none" opacity="0.7"/>
                    
                    <!-- Face Layout -->
                    <ng-container *ngTemplateOutlet="eyesTpl; context: {cy: 39, cx1: 37, cx2: 63, r: 3.5}"></ng-container>
                    <ng-container *ngTemplateOutlet="mouthTpl; context: {y: 56, x1: 42, x2: 58, c1: 38, c2: 62}"></ng-container>
                  </g>
               </g>
            }

            @if (state.stage === 'Elder') {
               <g class="pet-body anim-orangutan-sway">
                  <g class="anim-orangutan-breathe">
                     <g class="pet-torso">
                       <!-- Zen Body with shaggy fur -->
                       <path d="M 50,30 C 95,30 105,75 80,105 C 65,110 35,110 20,105 C -5,75 5,30 50,30 Z" fill="url(#bodyGrad)" stroke="var(--body-dark)" stroke-width="2"/>
                       <!-- Fuzzy edges (basic representation) -->
                       <path d="M 20,105 Q 15,115 25,100 M 80,105 Q 85,115 75,100" stroke="var(--body-dark)" stroke-width="2" fill="none"/>
                       
                       <!-- Belly -->
                       <circle cx="50" cy="72" r="24" fill="url(#bellyGrad)" opacity="0.9"/>
                       <!-- Inner Belly glow -->
                       <circle cx="50" cy="76" r="16" fill="var(--accent)" opacity="0.4"/>
                     </g>
                     
                     <g class="pet-arms">
                       <!-- Zen Arms -->
                       <path class="anim-arm-l" d="M 8,65 C 0,105 35,105 45,75" fill="none" stroke="url(#accentGrad)" stroke-width="14" stroke-linecap="round"/>
                       <path class="anim-arm-r" d="M 92,65 C 100,105 65,105 55,75" fill="none" stroke="url(#accentGrad)" stroke-width="14" stroke-linecap="round"/>
                       <!-- Hands -->
                       <circle class="anim-arm-l" cx="45" cy="75" r="7" fill="var(--eye-dark)" opacity="0.7"/>
                       <circle class="anim-arm-r" cx="55" cy="75" r="7" fill="var(--eye-dark)" opacity="0.7"/>
                     </g>
                     
                     <g class="pet-feet">
                       <!-- Feet -->
                       <ellipse cx="25" cy="100" rx="9" ry="5" fill="var(--eye-dark)" opacity="0.6"/>
                       <ellipse cx="75" cy="100" rx="9" ry="5" fill="var(--eye-dark)" opacity="0.6"/>
                     </g>
                  </g>

                  <g class="anim-orangutan-head">
                     <!-- Massive Flanged Cheek pads -->
                     <g class="anim-cheeks">
                         <path d="M 5,42 C -15,60 5,85 28,75 C 32,55 5,42 5,42 Z" fill="url(#accentGrad)" stroke="var(--body-dark)" stroke-width="2"/>
                         <path d="M 95,42 C 115,60 95,85 72,75 C 68,55 95,42 95,42 Z" fill="url(#accentGrad)" stroke="var(--body-dark)" stroke-width="2"/>
                         <!-- Cheek details -->
                         <path d="M 12,50 Q 8,65 20,70" stroke="var(--body-dark)" stroke-width="1.5" fill="none" opacity="0.5"/>
                         <path d="M 88,50 Q 92,65 80,70" stroke="var(--body-dark)" stroke-width="1.5" fill="none" opacity="0.5"/>
                     </g>
                     
                     <!-- Dome Head -->
                     <path d="M 25,45 C 25,0 75,0 75,45 C 75,70 25,70 25,45 Z" fill="url(#bodyGrad)" stroke="var(--body-dark)" stroke-width="2"/>
                     <!-- Face -->
                     <path d="M 32,45 C 32,25 68,25 68,45 C 68,60 32,60 32,45 Z" fill="url(#faceGrad)"/>
                     
                     <!-- Face Stripes / Wrinkles -->
                     <path d="M 45,35 Q 40,45 42,55" stroke="var(--body-dark)" stroke-width="2" fill="none" stroke-linecap="round" opacity="0.5"/>
                     <path d="M 55,35 Q 60,45 58,55" stroke="var(--body-dark)" stroke-width="2" fill="none" stroke-linecap="round" opacity="0.5"/>
                     <path d="M 50,38 L 50,55" stroke="var(--body-dark)" stroke-width="2" fill="none" stroke-linecap="round" opacity="0.5"/>
                     <!-- Nostrils -->
                     <circle cx="48" cy="53" r="1" fill="var(--eye-dark)" opacity="0.6"/>
                     <circle cx="52" cy="53" r="1" fill="var(--eye-dark)" opacity="0.6"/>
                     
                     <!-- Long Wise Beard -->
                     <path class="anim-beard" d="M 30,62 C 20,95 40,120 50,120 C 60,120 80,95 70,62 C 60,70 40,70 30,62 Z" fill="url(#faceGrad)" stroke="var(--body-dark)" stroke-width="1"/>
                     <!-- Beard texturing -->
                     <path class="anim-beard" d="M 40,65 Q 45,90 50,110 Q 55,90 60,65" stroke="var(--body-dark)" stroke-width="1" fill="none" opacity="0.3"/>
                     
                     <!-- Face Layout -->
                     <ng-container *ngTemplateOutlet="eyesTpl; context: {cy: 38, cx1: 37, cx2: 63, r: 4}"></ng-container>
                     <ng-container *ngTemplateOutlet="mouthTpl; context: {y: 58, x1: 44, x2: 56, c1: 40, c2: 60}"></ng-container>
                  </g>
               </g>
            }

            <!-- Templates for features -->
            <ng-template #eyesTpl let-cy="cy" let-cx1="cx1" let-cx2="cx2" let-r="r">
               @if (state.mood === 'Sad') {
                  <path [attr.d]="'M ' + (cx1-r-1) + ',' + cy + ' C ' + cx1 + ',' + (cy-r) + ' ' + (cx1+r+1) + ',' + cy + ' ' + (cx1+r+1) + ',' + cy" stroke="var(--eye-dark)" stroke-width="2.5" fill="none" class="pet-eye glow"/>
                  <path [attr.d]="'M ' + (cx2+r+1) + ',' + cy + ' C ' + cx2 + ',' + (cy-r) + ' ' + (cx2-r-1) + ',' + cy + ' ' + (cx2-r-1) + ',' + cy" stroke="var(--eye-dark)" stroke-width="2.5" fill="none" class="pet-eye glow"/>
               } @else if (state.mood === 'Ecstatic') {
                  <text [attr.x]="cx1-r-2" [attr.y]="cy+r" font-size="14" fill="var(--eye-dark)" font-weight="bold" class="glow" font-family="monospace">></text>
                  <text [attr.x]="cx2-r-2" [attr.y]="cy+r" font-size="14" fill="var(--eye-dark)" font-weight="bold" class="glow" font-family="monospace"><</text>
               } @else {
                  <circle [attr.cx]="cx1" [attr.cy]="cy" [attr.r]="r" fill="white" stroke="var(--eye-dark)" stroke-width="1.5" class="pet-eye glow anim-blink" />
                  <circle [attr.cx]="cx1" [attr.cy]="cy" [attr.r]="r/2.5" fill="var(--eye-dark)" class="pet-eye anim-blink" />
                  <circle [attr.cx]="cx2" [attr.cy]="cy" [attr.r]="r" fill="white" stroke="var(--eye-dark)" stroke-width="1.5" class="pet-eye glow anim-blink" />
                  <circle [attr.cx]="cx2" [attr.cy]="cy" [attr.r]="r/2.5" fill="var(--eye-dark)" class="pet-eye anim-blink" />
               }
            </ng-template>

            <ng-template #mouthTpl let-y="y" let-x1="x1" let-x2="x2" let-c1="c1" let-c2="c2">
               @if (state.mood === 'Sad') {
                  <path [attr.d]="'M ' + c1 + ',' + (y+5) + ' Q 50,' + y + ' ' + c2 + ',' + (y+5)" stroke="var(--eye-dark)" stroke-width="2.5" stroke-linecap="round" fill="none" />
               } @else if (state.mood === 'Happy' || state.mood === 'Ecstatic') {
                  <path [attr.d]="'M ' + c1 + ',' + y + ' Q 50,' + (y+8) + ' ' + c2 + ',' + y" stroke="var(--eye-dark)" stroke-width="2.5" stroke-linecap="round" fill="none" />
               } @else {
                  <line [attr.x1]="x1" [attr.y1]="y+2" [attr.x2]="x2" [attr.y2]="y+2" stroke="var(--eye-dark)" stroke-width="2.5" stroke-linecap="round" />
               }
            </ng-template>

          </svg>
        }
      </div>
      
      <!-- Particles / FX -->
      @if (state.mood === 'Ecstatic' || (state.health > 80 && state.stage !== 'Egg' && state.health <= 100)) {
        <div class="absolute top-4 right-4 text-emerald-300 text-2xl font-bold animate-pulse opacity-80 filter drop-shadow-md">+XP</div>
      }
      @if (state.mood === 'Sad' && state.health !== 0) {
        <div class="absolute top-10 left-10 text-indigo-300 text-xl font-bold animate-pulse opacity-60 filter drop-shadow-md">Zzz</div>
      }
      
      <!-- Posture Controls -->
      @if (interactive && !useSpriteArt && state.stage !== 'Egg' && state.mood !== 'Dead') {
        <div class="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2 z-20 bg-slate-900/50 backdrop-blur pb-1 px-2 rounded-full border border-white/10">
          <button (click)="setPosture('Stand')" class="text-[10px] uppercase tracking-widest font-mono text-white/50 hover:text-white px-2 py-1 transition-colors" [class.text-emerald-400]="currentPosture === 'Stand'" [class.font-bold]="currentPosture === 'Stand'">Stand</button>
          <button (click)="setPosture('Sit')" class="text-[10px] uppercase tracking-widest font-mono text-white/50 hover:text-white px-2 py-1 transition-colors" [class.text-emerald-400]="currentPosture === 'Sit'" [class.font-bold]="currentPosture === 'Sit'">Sit</button>
          <button (click)="setPosture('LayDown')" class="text-[10px] uppercase tracking-widest font-mono text-white/50 hover:text-white px-2 py-1 transition-colors" [class.text-emerald-400]="currentPosture === 'LayDown'" [class.font-bold]="currentPosture === 'LayDown'">Lay Down</button>
        </div>
      }
    </div>
  `,
  styles: [`
    /* Universal */
    .glow { filter: drop-shadow(0 0 3px currentColor); }
    .pet-sprite {
      animation: sprite-idle 3.8s ease-in-out infinite alternate;
      filter: saturate(1.08) drop-shadow(0 0 20px rgba(163, 230, 53, 0.18));
      transform-origin: 50% 82%;
    }
    .pet-sprite-ecstatic {
      animation: sprite-hop 0.7s ease-in-out infinite alternate;
      filter: saturate(1.22) drop-shadow(0 0 24px rgba(163, 230, 53, 0.34));
    }
    .pet-sprite-happy {
      animation-duration: 2.5s;
    }
    .pet-sprite-neutral {
      filter: saturate(1.02) drop-shadow(0 0 16px rgba(34, 211, 238, 0.14));
    }
    .pet-sprite-sad {
      animation: sprite-sad 3.2s ease-in-out infinite alternate;
      filter: saturate(0.72) drop-shadow(0 0 14px rgba(129, 140, 248, 0.16));
    }
    .pet-sprite-sit {
      transform: translateY(5%) scale(0.96);
    }
    .pet-sprite-lay {
      transform: translateY(12%) rotate(-8deg) scale(0.9);
    }
    @keyframes sprite-idle {
      0% { transform: translateY(0) rotate(-0.8deg) scale(1); }
      100% { transform: translateY(-3%) rotate(0.8deg) scale(1.015); }
    }
    @keyframes sprite-hop {
      0% { transform: translateY(0) rotate(-1deg) scale(1); }
      100% { transform: translateY(-7%) rotate(1deg) scale(1.035); }
    }
    @keyframes sprite-sad {
      0% { transform: translateY(4%) rotate(-1deg) scale(0.96); }
      100% { transform: translateY(6%) rotate(1deg) scale(0.94); }
    }
    
    @keyframes blink {
      0%, 96%, 98% { transform: scaleY(1); }
      97% { transform: scaleY(0.1); }
    }
    .anim-blink { animation: blink 4s infinite; transform-origin: center; transform-box: fill-box; }

    /* Egg Animations */
    .pet-egg[data-mood="Ecstatic"] .anim-egg { animation: egg-jump 0.5s infinite alternate; }
    .pet-egg[data-mood="Sad"] .anim-egg { animation: egg-shrink 3s infinite alternate; }
    .pet-egg[data-mood="Neutral"] .anim-egg, .pet-egg[data-mood="Happy"] .anim-egg { animation: egg-wobble 2s infinite alternate; }

    /* Baby Animations (Macaque) */
    .pet-baby .anim-macaque-breathe { animation: breathe-fast 1.2s infinite alternate ease-in-out; }
    .pet-baby .anim-macaque-head { animation: head-bob-fast 2s infinite alternate ease-in-out; }
    .pet-baby[data-mood="Ecstatic"] .anim-tail { animation: tail-wag 0.15s infinite alternate ease-in-out; }
    .pet-baby[data-mood="Ecstatic"] .anim-macaque-sway { animation: hop 0.3s infinite alternate ease-in-out; }
    .pet-baby[data-mood="Sad"] .anim-ears { animation: ear-droop 2s infinite alternate ease-in-out; }
    .pet-baby[data-mood="Neutral"] .anim-ears, .pet-baby[data-mood="Happy"] .anim-ears { animation: ear-twitch 3s infinite ease-in-out; }
    .pet-baby[data-mood="Happy"] .anim-tail { animation: tail-wag 0.5s infinite alternate ease-in-out; }

    /* Teen Animations (Capuchin) */
    .pet-teen .anim-capuchin-breathe { animation: breathe-normal 2s infinite alternate ease-in-out; }
    .pet-teen .anim-capuchin-head { animation: head-look 4s infinite alternate ease-in-out; }
    .pet-teen[data-mood="Ecstatic"] .anim-capuchin-sway { animation: swing-jump 0.5s infinite alternate ease-in-out; }
    .pet-teen[data-mood="Ecstatic"] .anim-arm-l { animation: arm-reach-l 0.4s infinite alternate ease-in-out; }
    .pet-teen[data-mood="Ecstatic"] .anim-arm-r { animation: arm-reach-r 0.4s infinite alternate ease-in-out; }
    .pet-teen[data-mood="Sad"] .anim-tail { animation: tail-droop 2s infinite alternate ease-in-out; }
    .pet-teen[data-mood="Sad"] .anim-capuchin-head { animation: head-droop 3s infinite alternate ease-in-out; }
    .pet-teen[data-mood="Neutral"] .anim-hair, .pet-teen[data-mood="Happy"] .anim-hair { animation: hair-sway 2s infinite alternate ease-in-out; }
    .pet-teen[data-mood="Happy"] .anim-capuchin-sway { animation: sway-normal 2.5s infinite alternate ease-in-out; }

    /* Adult Animations (Gorilla) */
    .pet-adult .anim-gorilla-breathe { animation: breathe-deep 3s infinite alternate ease-in-out; }
    .pet-adult[data-mood="Ecstatic"] .anim-chest { animation: chest-beat 0.15s infinite alternate ease-in-out; }
    .pet-adult[data-mood="Ecstatic"] .anim-arm-l { animation: chest-beat-arm-l 0.3s infinite alternate ease-in-out; }
    .pet-adult[data-mood="Ecstatic"] .anim-arm-r { animation: chest-beat-arm-r 0.3s infinite alternate-reverse ease-in-out; }
    .pet-adult[data-mood="Sad"] .anim-brow { animation: brow-furrow 2s infinite alternate ease-in-out; }
    .pet-adult[data-mood="Sad"] .anim-gorilla-head { animation: gorilla-slouch 3s infinite alternate ease-in-out; }
    .pet-adult[data-mood="Sad"] .anim-gorilla-breathe { animation: breathe-shallow 3s infinite alternate ease-in-out; }
    .pet-adult[data-mood="Neutral"] .anim-gorilla-sway, .pet-adult[data-mood="Happy"] .anim-gorilla-sway { animation: gorilla-shift 4s infinite alternate ease-in-out; }
    .pet-adult[data-mood="Neutral"] .anim-gorilla-head, .pet-adult[data-mood="Happy"] .anim-gorilla-head { animation: gorilla-look 5s infinite alternate ease-in-out; }

    /* Elder Animations (Orangutan) */
    .pet-elder .anim-orangutan-breathe { animation: breathe-zen 4s infinite alternate ease-in-out; }
    .pet-elder .anim-orangutan-sway { animation: zen-float 4s infinite alternate ease-in-out; }
    .pet-elder[data-mood="Ecstatic"] .anim-beard { animation: beard-flutter 0.4s infinite alternate ease-in-out; }
    .pet-elder[data-mood="Ecstatic"] .anim-arm-l { animation: arm-raise-l 2s infinite alternate ease-in-out; }
    .pet-elder[data-mood="Ecstatic"] .anim-arm-r { animation: arm-raise-r 2s infinite alternate ease-in-out; }
    .pet-elder[data-mood="Sad"] .anim-cheeks { animation: cheek-sag 3s infinite alternate ease-in-out; }
    .pet-elder[data-mood="Sad"] .anim-orangutan-head { animation: orangutan-slump 4s infinite alternate ease-in-out; }
    .pet-elder[data-mood="Neutral"] .anim-arm-l, .pet-elder[data-mood="Happy"] .anim-arm-l { animation: zen-float-arm-l 3s infinite alternate ease-in-out; }
    .pet-elder[data-mood="Neutral"] .anim-arm-r, .pet-elder[data-mood="Happy"] .anim-arm-r { animation: zen-float-arm-r 3s infinite alternate ease-in-out reverse; }

    /* Base Keyframes */
    @keyframes egg-jump {
      0% { transform: translateY(0) scaleY(1); transform-origin: 50px 90px; }
      100% { transform: translateY(-10px) scaleY(1.05); transform-origin: 50px 90px; }
    }
    @keyframes egg-shrink {
      0% { transform: scale(1); transform-origin: 50px 90px; }
      100% { transform: scale(0.95) translateY(2px); transform-origin: 50px 90px; }
    }
    @keyframes egg-wobble {
      0% { transform: rotate(-3deg); transform-origin: 50px 90px; }
      100% { transform: rotate(3deg); transform-origin: 50px 90px; }
    }
    
    /* Biomechanical Breathing */
    @keyframes breathe-fast {
      0% { transform: scale(1); transform-origin: 50px 70px; }
      100% { transform: scale(1.03) translateY(-1px); transform-origin: 50px 70px; }
    }
    @keyframes breathe-normal {
      0% { transform: scaleX(1) scaleY(1); transform-origin: 50px 60px; }
      100% { transform: scaleX(1.04) scaleY(0.98); transform-origin: 50px 60px; }
    }
    @keyframes breathe-deep {
      0% { transform: scaleX(1) scaleY(1) translateY(0); transform-origin: 50px 60px; }
      100% { transform: scaleX(1.05) scaleY(1.02) translateY(-2px); transform-origin: 50px 60px; }
    }
    @keyframes breathe-shallow {
      0% { transform: scale(1); transform-origin: 50px 60px; }
      100% { transform: scale(1.01); transform-origin: 50px 60px; }
    }
    @keyframes breathe-zen {
      0% { transform: scaleX(1) scaleY(1) translateY(0); transform-origin: 50px 50px; }
      100% { transform: scaleX(1.02) scaleY(1.04) translateY(-3px); transform-origin: 50px 50px; }
    }

    /* Swaying & Hopping */
    @keyframes hop {
      0% { transform: translateY(0); }
      100% { transform: translateY(-8px); }
    }
    @keyframes swing-jump {
      0% { transform: translateY(0) rotate(-2deg); transform-origin: 50px 90px; }
      100% { transform: translateY(-12px) rotate(2deg); transform-origin: 50px 90px; }
    }
    @keyframes sway-normal {
      0% { transform: rotate(-2deg); transform-origin: 50px 90px; }
      100% { transform: rotate(2deg); transform-origin: 50px 90px; }
    }
    @keyframes gorilla-shift {
      0% { transform: translateX(-2px) rotate(-1deg); transform-origin: 50px 90px; }
      100% { transform: translateX(2px) rotate(1deg); transform-origin: 50px 90px; }
    }
    @keyframes zen-float {
      0% { transform: translateY(0); }
      100% { transform: translateY(-5px); }
    }

    /* Head Movements */
    @keyframes head-bob-fast {
      0% { transform: rotate(-3deg); transform-origin: 50px 48px; }
      50% { transform: rotate(2deg); transform-origin: 50px 48px; }
      100% { transform: rotate(-1deg) translateY(2px); transform-origin: 50px 48px; }
    }
    @keyframes head-look {
      0% { transform: rotate(-4deg); transform-origin: 50px 45px; }
      100% { transform: rotate(4deg); transform-origin: 50px 45px; }
    }
    @keyframes head-droop {
      0% { transform: translateY(0) rotate(0); transform-origin: 50px 45px; }
      100% { transform: translateY(6px) rotate(3deg); transform-origin: 50px 45px; }
    }
    @keyframes gorilla-look {
      0% { transform: rotate(-2deg) translateX(-1px); transform-origin: 50px 35px; }
      100% { transform: rotate(2deg) translateX(1px); transform-origin: 50px 35px; }
    }
    @keyframes gorilla-slouch {
      0% { transform: translateY(0); transform-origin: 50px 35px; }
      100% { transform: translateY(8px) scale(0.95); transform-origin: 50px 35px; }
    }
    @keyframes orangutan-slump {
      0% { transform: translateY(0); transform-origin: 50px 45px; }
      100% { transform: translateY(5px) rotate(-2deg); transform-origin: 50px 45px; }
    }

    /* Individual Parts */
    @keyframes tail-wag {
      0% { transform: rotate(-10deg); transform-origin: 75px 70px; }
      100% { transform: rotate(15deg); transform-origin: 75px 70px; }
    }
    @keyframes tail-droop {
      0% { transform: rotate(0); transform-origin: 68px 80px; }
      100% { transform: rotate(20deg) scaleY(0.9); transform-origin: 68px 80px; }
    }
    @keyframes ear-droop {
      0% { transform: translateY(0); }
      100% { transform: translateY(5px); }
    }
    @keyframes ear-twitch {
      0%, 80%, 100% { transform: translateY(0); }
      85% { transform: translateY(-3px) rotate(5deg); transform-origin: center; }
      90% { transform: translateY(0); }
      95% { transform: translateY(-3px) rotate(-5deg); transform-origin: center; }
    }
    @keyframes hair-sway {
      0% { transform: skewX(-5deg); transform-origin: 50px 15px; }
      100% { transform: skewX(10deg); transform-origin: 50px 15px; }
    }
    
    @keyframes arm-reach-l {
      0% { transform: translateY(0) rotate(0); transform-origin: 32px 55px; }
      100% { transform: translateY(-18px) rotate(-25deg); transform-origin: 32px 55px; }
    }
    @keyframes arm-reach-r {
      0% { transform: translateY(-18px) rotate(25deg); transform-origin: 68px 55px; }
      100% { transform: translateY(0) rotate(0); transform-origin: 68px 55px; }
    }
    
    @keyframes chest-beat {
      0% { transform: scale(1); transform-origin: 50px 62px; opacity: 0.3; }
      100% { transform: scale(1.1); transform-origin: 50px 62px; opacity: 0.8; }
    }
    @keyframes chest-beat-arm-l {
      0% { transform: rotate(0); transform-origin: 12px 50px; }
      100% { transform: rotate(-15deg) translateY(-5px); transform-origin: 12px 50px; }
    }
    @keyframes chest-beat-arm-r {
      0% { transform: rotate(15deg) translateY(-5px); transform-origin: 88px 50px; }
      100% { transform: rotate(0); transform-origin: 88px 50px; }
    }
    @keyframes brow-furrow {
      0% { transform: translateY(0); }
      100% { transform: translateY(4px) scaleX(0.92); transform-origin: 50px 34px; }
    }
    
    @keyframes beard-flutter {
      0% { transform: skewX(-3deg) scaleY(1); transform-origin: 50px 62px; }
      100% { transform: skewX(3deg) scaleY(1.05); transform-origin: 50px 62px; }
    }
    @keyframes cheek-sag {
      0% { transform: translateY(0); }
      100% { transform: translateY(4px) scaleY(0.95); transform-origin: 50px 42px; }
    }
    @keyframes arm-raise-l {
      0% { transform: rotate(0); transform-origin: 12px 65px; }
      100% { transform: rotate(-40deg); transform-origin: 12px 65px; }
    }
    @keyframes arm-raise-r {
      0% { transform: rotate(0); transform-origin: 88px 65px; }
      100% { transform: rotate(40deg); transform-origin: 88px 65px; }
    }
    @keyframes zen-float-arm-l {
      0% { transform: translateY(0) rotate(0); transform-origin: 12px 65px; }
      100% { transform: translateY(-4px) rotate(-3deg); transform-origin: 12px 65px; }
    }
    @keyframes zen-float-arm-r {
      0% { transform: translateY(0) rotate(0); transform-origin: 88px 65px; }
      100% { transform: translateY(4px) rotate(3deg); transform-origin: 88px 65px; }
    }

    /* === BIOMECHANICAL POSTURES === */
    svg * { transition: translate 0.8s cubic-bezier(0.4, 0, 0.2, 1), rotate 0.8s cubic-bezier(0.4, 0, 0.2, 1), scale 0.8s cubic-bezier(0.4, 0, 0.2, 1); }

    /* Baby (Macaque) */
    svg[data-posture="Stand"].pet-baby .pet-torso { scale: 0.95 1.35; transform-origin: 50% 90px; }
    svg[data-posture="Stand"].pet-baby .anim-macaque-head { translate: 0 -13px; rotate: -4deg; transform-origin: 50% 50%; }
    svg[data-posture="Stand"].pet-baby .anim-tail { rotate: 20deg; transform-origin: 72px 70px; }

    svg[data-posture="Sit"].pet-baby .pet-torso { scale: 1.05 0.95; transform-origin: 50% 90px; }
    svg[data-posture="Sit"].pet-baby .anim-macaque-head { translate: 0 4px; }
    
    svg[data-posture="LayDown"].pet-baby .pet-body { translate: 0 20px; rotate: -80deg; transform-origin: 50px 72px; }
    svg[data-posture="LayDown"].pet-baby .anim-macaque-head { rotate: 30deg; transform-origin: 50px 48px; }

    /* Teen (Capuchin) */
    svg[data-posture="Stand"].pet-teen .pet-torso { scale: 0.9 1.35; transform-origin: 50% 85px; }
    svg[data-posture="Stand"].pet-teen .anim-capuchin-head { translate: 0 -14px; rotate: -6deg; transform-origin: 50% 50%; }
    svg[data-posture="Stand"].pet-teen .pet-arms { translate: 0 -10px; }
    svg[data-posture="Stand"].pet-teen .anim-arm-l { rotate: -15deg; transform-origin: 32px 55px; }
    svg[data-posture="Stand"].pet-teen .anim-arm-r { rotate: 15deg; transform-origin: 68px 55px; }
    svg[data-posture="Stand"].pet-teen .anim-tail { rotate: -30deg; transform-origin: 68px 75px; }

    svg[data-posture="Sit"].pet-teen .pet-torso { scale: 1.05 0.9; transform-origin: 50% 85px; }
    svg[data-posture="Sit"].pet-teen .anim-capuchin-head { translate: 0 8px; }
    svg[data-posture="Sit"].pet-teen .pet-arms { translate: 0 5px; }
    svg[data-posture="Sit"].pet-teen .anim-arm-l { rotate: 35deg; transform-origin: 32px 55px; }
    svg[data-posture="Sit"].pet-teen .anim-arm-r { rotate: -35deg; transform-origin: 68px 55px; }

    svg[data-posture="LayDown"].pet-teen .pet-body { translate: 0 25px; rotate: 85deg; transform-origin: 50px 80px; }
    svg[data-posture="LayDown"].pet-teen .anim-capuchin-head { rotate: -60deg; transform-origin: 50px 45px; }

    /* Adult (Gorilla) */
    svg[data-posture="Stand"].pet-adult .pet-torso { scale: 1 1.25; transform-origin: 50% 95px; }
    svg[data-posture="Stand"].pet-adult .anim-gorilla-head { translate: 0 -10px; }
    svg[data-posture="Stand"].pet-adult .anim-gorilla-arms { translate: 0 -10px; }
    svg[data-posture="Stand"].pet-adult .anim-arm-l { rotate: -12deg; transform-origin: 12px 45px; }
    svg[data-posture="Stand"].pet-adult .anim-arm-r { rotate: 12deg; transform-origin: 88px 45px; }

    svg[data-posture="Sit"].pet-adult .pet-torso { scale: 1.05 0.9; transform-origin: 50% 95px; }
    svg[data-posture="Sit"].pet-adult .anim-gorilla-head { translate: 0 6px; }
    svg[data-posture="Sit"].pet-adult .anim-gorilla-arms { translate: 0 5px; }
    svg[data-posture="Sit"].pet-adult .anim-arm-l { rotate: 45deg; transform-origin: 12px 45px; }
    svg[data-posture="Sit"].pet-adult .anim-arm-r { rotate: -45deg; transform-origin: 88px 45px; }

    svg[data-posture="LayDown"].pet-adult .pet-body { translate: 0 20px; rotate: -80deg; transform-origin: 50px 75px; }
    svg[data-posture="LayDown"].pet-adult .anim-gorilla-head { rotate: 45deg; transform-origin: 50px 35px; }
    svg[data-posture="LayDown"].pet-adult .anim-gorilla-arms { rotate: -45deg; transform-origin: 50px 45px; }

    /* Elder (Orangutan) */
    svg[data-posture="Stand"].pet-elder .pet-torso { scale: 1 1.2; transform-origin: 50% 100px; }
    svg[data-posture="Stand"].pet-elder .anim-orangutan-head { translate: 0 -8px; }
    svg[data-posture="Stand"].pet-elder .pet-arms { translate: 0 -10px; }
    svg[data-posture="Stand"].pet-elder .anim-arm-l { rotate: -10deg; transform-origin: 8px 65px; }
    svg[data-posture="Stand"].pet-elder .anim-arm-r { rotate: 10deg; transform-origin: 92px 65px; }

    svg[data-posture="Sit"].pet-elder .pet-torso { scale: 1.05 0.95; transform-origin: 50% 100px; }
    svg[data-posture="Sit"].pet-elder .anim-orangutan-head { translate: 0 4px; }
    svg[data-posture="Sit"].pet-elder .pet-arms { translate: 0 3px; }
    svg[data-posture="Sit"].pet-elder .anim-arm-l { rotate: 20deg; transform-origin: 8px 65px; }
    svg[data-posture="Sit"].pet-elder .anim-arm-r { rotate: -20deg; transform-origin: 92px 65px; }

    svg[data-posture="LayDown"].pet-elder .pet-body { translate: 0 18px; rotate: -85deg; transform-origin: 50px 70px; }
    svg[data-posture="LayDown"].pet-elder .anim-orangutan-head { rotate: 45deg; transform-origin: 50px 45px; }
  `]
})
export class PetComponent implements AfterViewInit, OnChanges {
  @Input({ required: true }) state!: PetState;
  @Input() interactive = true;
  @ViewChild('petContainer') petContainer!: ElementRef;
  readonly useSpriteArt = true;

  currentPosture: PetState['posture'] = 'Stand';

  get spriteUrl() {
    return `assets/pets/vibegotchi-${this.state.stage.toLowerCase()}.png`;
  }

  ngAfterViewInit() {
    this.animateIdle();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['state']) {
      // Re-apply if stage changes maybe? Optional
      if (changes['state'].currentValue?.posture && !changes['state'].previousValue) {
        this.currentPosture = changes['state'].currentValue.posture || 'Stand';
      }
      this.animateReaction();
    }
  }

  setPosture(posture: PetState['posture']) {
    this.currentPosture = posture;
  }

  animateIdle() {
    if (typeof window === 'undefined' || !this.petContainer) return;
    const el = this.petContainer.nativeElement;
    
    // Smooth idle bob based on mood
    const duration = this.state.mood === 'Sad' ? 3 : 1.5;
    const yAmount = this.state.mood === 'Dead' ? 0 : 8;

    animate(el, { y: [0, -yAmount, 0] }, { 
      duration, 
      repeat: Infinity,
      ease: "easeInOut"
    });
  }

  animateReaction() {
    if (typeof window === 'undefined' || !this.petContainer || this.state.mood === 'Dead') return;
    const el = this.petContainer.nativeElement;
    
    // Quick burst animation when state changes
    animate(el, 
      { scale: [1, 1.2, 0.9, 1.05, 1], rotate: [0, -5, 5, -2, 0] }, 
      { duration: 0.6, ease: "easeOut" }
    );
  }
}
