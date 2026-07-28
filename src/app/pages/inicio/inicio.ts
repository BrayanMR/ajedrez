import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Login } from '../../components/login/login';
import { Registro } from '../../components/registro/registro';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, Login, Registro],
  template: `
    <div class="min-h-screen bg-[#0b0e14] flex flex-col md:flex-row">
      <!-- Left Hero Banner Panel (Hidden on mobile) -->
      <div class="hidden md:flex md:w-1/2 relative bg-cover bg-center flex-col justify-between p-12 text-white select-none overflow-hidden"
           style="background-image: url('/chess_background.jpg')">
        <!-- Deep blue-slate overlay to match styling -->
        <div class="absolute inset-0 bg-gradient-to-tr from-[#0a0d14]/95 via-[#0e1320]/80 to-[#1b253b]/45 mix-blend-multiply"></div>
        <div class="absolute inset-0 bg-[#0b0e14]/50"></div>

        <!-- Content Overlay -->
        <div class="relative z-10 flex flex-col h-full justify-between">
          <!-- Logo at Top Left -->
          <div class="flex items-center gap-2">
            <div class="bg-[#d9a01a] p-1.5 rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="#0b0e14" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H5.25a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
              </svg>
            </div>
            <span class="text-xl font-bold tracking-tight">Chess<span class="text-[#d9a01a]">Rank</span></span>
          </div>

          <!-- Hero Message -->
          <div class="max-w-md my-auto">
            <div class="w-10 h-1 bg-[#d9a01a] mb-6 rounded-full"></div>
            <h1 class="text-4xl md:text-5xl font-extrabold leading-tight mb-4 tracking-tight">
              Compite, clasifica <br>y domina <br>
              <span class="text-[#d9a01a]">el tablero.</span>
            </h1>
            <p class="text-gray-300 text-base leading-relaxed">
              La plataforma de ajedrez competitivo con ranking ELO en tiempo real. Cada partida cuenta.
            </p>
          </div>

          <!-- Stats Footer -->
          <div class="grid grid-cols-3 gap-4 pt-6 border-t border-white/10">
            <div>
              <p class="text-2xl font-black text-[#d9a01a]">2,400+</p>
              <p class="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Jugadores activos</p>
            </div>
            <div>
              <p class="text-2xl font-black text-[#d9a01a]">18,000+</p>
              <p class="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Partidas jugadas</p>
            </div>
            <div>
              <p class="text-2xl font-black text-[#d9a01a]">Real-time</p>
              <p class="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Ranking ELO</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Form Panel -->
      <div class="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12 relative overflow-y-auto">
        <!-- Subtle background details on mobile -->
        <div class="md:hidden absolute inset-0 bg-cover bg-center" style="background-image: url('/chess_background.jpg')"></div>
        <div class="md:hidden absolute inset-0 bg-[#0b0e14]/90 backdrop-blur-sm"></div>

        <!-- Render active form card -->
        <div class="relative z-10 w-full flex justify-center">
          <app-login *ngIf="activeTab === 'login'" (onSwitchTab)="switchTab($event)"></app-login>
          <app-registro *ngIf="activeTab === 'registro'" (onSwitchTab)="switchTab($event)"></app-registro>
        </div>
      </div>
    </div>
  `
})
export class InicioPage {
  activeTab: 'login' | 'registro' = 'login';

  switchTab(tab: string) {
    this.activeTab = tab as 'login' | 'registro';
  }
}
