import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Navbar } from '../navbar/navbar';
import { RankingService } from '../../services/ranking.service';
import { AuthService } from '../../services/auth.service';
import { Ranking } from '../../models/ranking';

@Component({
  selector: 'app-ranking',
  standalone: true,
  imports: [CommonModule, Navbar],
  template: `
    <div class="min-h-screen bg-[#0b0e14] text-white flex flex-col">
      <!-- Navbar -->
      <app-navbar></app-navbar>

      <!-- Main Container -->
      <main class="flex-1 max-w-4xl w-full mx-auto p-4 md:p-8 flex flex-col gap-6">
        
        <!-- Header -->
        <div class="text-left">
          <h2 class="text-3xl font-extrabold tracking-tight">Clasificación Global</h2>
          <p class="text-gray-400 text-sm mt-1">Los mejores jugadores de la plataforma clasificados según su puntuación ELO en tiempo real.</p>
        </div>

        <!-- Leaderboard Table -->
        <section class="bg-[#121620] border border-gray-800 rounded-2xl p-5 shadow">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm">
              <thead>
                <tr class="border-b border-gray-800 text-gray-400 text-xs font-bold uppercase tracking-wider">
                  <th class="pb-3 w-16 text-center">Posición</th>
                  <th class="pb-3">Jugador</th>
                  <th class="pb-3">Nivel</th>
                  <th class="pb-3 text-center">Partidas</th>
                  <th class="pb-3 text-center">Victorias</th>
                  <th class="pb-3 text-right">ELO</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-800/40">
                <tr *ngFor="let rank of leaderboard" 
                    [ngClass]="{'bg-[#d9a01a]/5 border-l-2 border-l-[#d9a01a]': rank.usuarioId === usuario()?.id}"
                    class="hover:bg-white/[0.01]">
                  
                  <!-- Position -->
                  <td class="py-4 text-center font-black text-sm">
                    <span [ngClass]="{
                            'text-[#d9a01a] text-base': rank.posicion === 1,
                            'text-gray-300': rank.posicion === 2,
                            'text-amber-700': rank.posicion === 3,
                            'text-gray-500': rank.posicion > 3
                          }">
                      #{{ rank.posicion }}
                    </span>
                  </td>

                  <!-- Player Name -->
                  <td class="py-4 flex items-center gap-2">
                    <div class="w-7 h-7 rounded-full bg-[#1e2530] text-[#d9a01a] border border-gray-800 flex items-center justify-center font-bold text-xs select-none">
                      {{ rank.nombre ? rank.nombre.substring(0, 2).toUpperCase() : 'U' }}
                    </div>
                    <div>
                      <div class="font-bold text-white flex items-center gap-1.5">
                        {{ rank.nombre }}
                        <span *ngIf="rank.usuarioId === usuario()?.id" class="px-1.5 py-0.5 rounded text-[8px] bg-[#d9a01a] text-[#0b0e14] font-black uppercase">Tú</span>
                      </div>
                    </div>
                  </td>

                  <!-- Tier Level -->
                  <td class="py-4 font-semibold text-gray-400 text-xs">
                    {{ rank.nivel }}
                  </td>

                  <!-- Matches Played -->
                  <td class="py-4 text-center text-gray-300 font-medium">
                    {{ rank.partidasJugadas || 0 }}
                  </td>

                  <!-- Wins -->
                  <td class="py-4 text-center text-green-400 font-medium">
                    {{ rank.partidasGanadas || 0 }}
                  </td>

                  <!-- ELO points -->
                  <td class="py-4 text-right font-black text-[#d9a01a] text-base">
                    {{ rank.puntos }} pts
                  </td>

                </tr>
              </tbody>
            </table>
          </div>
        </section>

      </main>
    </div>
  `
})
export class RankingLeaderboard implements OnInit {
  private rankingService = inject(RankingService);
  private authService = inject(AuthService);

  usuario = this.authService.currentUser;
  
  leaderboard: Ranking[] = [];

  ngOnInit() {
    this.cargarRanking();
  }

  cargarRanking() {
    this.rankingService.obtenerLeaderboard().subscribe({
      next: (data) => {
        this.leaderboard = data;
      }
    });
  }
}
