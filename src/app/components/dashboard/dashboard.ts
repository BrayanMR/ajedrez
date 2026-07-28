import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Navbar } from '../navbar/navbar';
import { AuthService } from '../../services/auth.service';
import { PartidaService } from '../../services/partida.service';
import { RankingService } from '../../services/ranking.service';
import { UsuarioService } from '../../services/usuario.service';
import { Partida } from '../../models/partida';
import { Ranking } from '../../models/ranking';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, Navbar, FormsModule],
  template: `
    <div class="min-h-screen bg-[#0b0e14] text-white flex flex-col">
      <!-- Top Navbar -->
      <app-navbar></app-navbar>

      <!-- Main Dashboard Container -->
      <main class="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 flex flex-col gap-6">
        
        <!-- Welcome Banner -->
        <section class="bg-gradient-to-r from-[#111726] to-[#162035] border border-gray-800 rounded-3xl p-6 md:p-8 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <!-- Chess Knights Watermark Background -->
          <div class="absolute right-10 top-0 bottom-0 opacity-10 flex items-center pointer-events-none select-none">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-48 h-48">
              <path d="M19.5 21a3 3 0 0 0 3-3v-4.5a3 3 0 0 0-3-3h-1.5V9a3 3 0 0 0-3-3h-3a3 3 0 0 0-3 3v1.5H7.5A3 3 0 0 0 4.5 13.5V18a3 3 0 0 0 3 3h12ZM6 16.5a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0ZM16.5 6a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Z" />
            </svg>
          </div>

          <div class="relative z-10 flex flex-col gap-2">
            <span class="text-[11px] font-bold text-[#d9a01a] tracking-widest uppercase">LISTO PARA JUGAR</span>
            <h2 class="text-3xl md:text-4xl font-extrabold tracking-tight">
              Bienvenido de vuelta,<br>
              <span class="text-[#d9a01a]">{{ usuario()?.nombre }}</span>.
            </h2>
          </div>

          <button (click)="abrirModalCrear()" class="relative z-10 bg-[#d9a01a] hover:bg-[#c28e13] text-[#0b0e14] px-6 py-3.5 rounded-xl font-bold transition shadow-lg shadow-[#d9a01a]/15 hover:shadow-[#d9a01a]/25 flex items-center gap-2 cursor-pointer select-none">
            <!-- Swords/Play Icon -->
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 18a3.75 3.75 0 0 0 .495-7.467 5.99 5.99 0 0 0-1.925 3.546 5.974 5.974 0 0 1-2.133-1A3.75 3.75 0 0 0 12 18Z" />
            </svg>
            Jugar Ahora
          </button>
        </section>

        <!-- Stats Row -->
        <section class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Elo Card -->
          <div class="bg-[#121620] border border-gray-800 rounded-2xl p-5 flex items-center justify-between shadow">
            <div class="flex flex-col gap-1">
              <span class="text-[11px] font-bold text-gray-400 tracking-wider uppercase">PUNTUACIÓN ELO</span>
              <span class="text-3xl font-black text-white">{{ usuario()?.elo }} <span class="text-sm font-semibold text-gray-400">pts</span></span>
            </div>
            <div class="bg-[#d9a01a]/10 p-3.5 rounded-xl text-[#d9a01a]">
              <!-- Chart Icon -->
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
              </svg>
            </div>
          </div>

          <!-- Matches Played Card -->
          <div class="bg-[#121620] border border-gray-800 rounded-2xl p-5 flex items-center justify-between shadow">
            <div class="flex flex-col gap-1">
              <span class="text-[11px] font-bold text-gray-400 tracking-wider uppercase">PARTIDAS JUGADAS</span>
              <span class="text-3xl font-black text-white">{{ usuario()?.partidasJugadas }} <span class="text-sm font-semibold text-gray-400">total</span></span>
            </div>
            <div class="bg-[#d9a01a]/10 p-3.5 rounded-xl text-[#d9a01a]">
              <!-- Pulse graph Icon -->
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.746 3.746 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
              </svg>
            </div>
          </div>

          <!-- Wins Card -->
          <div class="bg-[#121620] border border-gray-800 rounded-2xl p-5 flex items-center justify-between shadow">
            <div class="flex flex-col gap-1">
              <span class="text-[11px] font-bold text-gray-400 tracking-wider uppercase">VICTORIAS</span>
              <span class="text-3xl font-black text-white">
                {{ usuario()?.partidasGanadas }}
                <span class="text-sm font-semibold text-gray-400">
                  ({{ calcularWinRatio(usuario()?.partidasJugadas, usuario()?.partidasGanadas) }}% ratio)
                </span>
              </span>
            </div>
            <div class="bg-[#d9a01a]/10 p-3.5 rounded-xl text-[#d9a01a]">
              <!-- Trophy Icon -->
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3-3V12m-12 6.75a3 3 0 0 0-3-3V12m18 0a3 3 0 0 0-3-3m-12 0A3 3 0 0 0 3 12m18 0H3M9 6a3 3 0 0 1 3-3h0a3 3 0 0 1 3 3v3H9V6Z" />
              </svg>
            </div>
          </div>
        </section>

        <!-- Dynamic Matchmaking Lobby / Active Games (Partidas en Espera y En Curso) -->
        <section class="bg-[#121620] border border-gray-800 rounded-2xl p-5 md:p-6 shadow">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-bold text-white flex items-center gap-2">
              <span class="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></span>
              Lobby de Partidas Activas
            </h3>
            <button (click)="cargarLobby()" class="text-xs text-[#d9a01a] hover:underline flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3 h-3">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              Actualizar
            </button>
          </div>

          <!-- Empty Lobby -->
          <div *ngIf="partidasLobby.length === 0" class="text-center py-8 text-gray-500 text-sm">
            No hay partidas esperando oponentes. ¡Crea una para que otros se unan!
          </div>

          <!-- Lobby Table -->
          <div *ngIf="partidasLobby.length > 0" class="overflow-x-auto">
            <table class="w-full text-left text-sm">
              <thead>
                <tr class="border-b border-gray-800 text-gray-400 text-xs font-bold uppercase tracking-wider">
                  <th class="pb-3">Creador</th>
                  <th class="pb-3">Detalle</th>
                  <th class="pb-3">Estado</th>
                  <th class="pb-3 text-right">Acción</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-800/40">
                <tr *ngFor="let p of partidasLobby" class="hover:bg-white/[0.01]">
                  <td class="py-3.5 flex items-center gap-2">
                    <div class="w-6 h-6 rounded-full bg-[#d9a01a]/20 text-[#d9a01a] flex items-center justify-center font-bold text-xs">
                      {{ obtenerCreadorNombre(p).substring(0, 2).toUpperCase() }}
                    </div>
                    <div>
                      <div class="font-semibold">{{ obtenerCreadorNombre(p) }}</div>
                      <div class="text-[10px] text-[#d9a01a]">{{ obtenerCreadorElo(p) }} ELO</div>
                    </div>
                  </td>
                  <td class="py-3.5">
                    <span class="text-xs text-gray-400">
                      Juega con piezas {{ p.jugadorBlanco ? 'Blancas' : 'Negras' }}
                    </span>
                  </td>
                  <td class="py-3.5">
                    <span *ngIf="p.estado === 'espera'" class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                      Esperando
                    </span>
                    <span *ngIf="p.estado === 'jugando'" class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-500/10 text-green-500 border border-green-500/20">
                      Jugando
                    </span>
                  </td>
                  <td class="py-3.5 text-right">
                    <button *ngIf="p.estado === 'espera' && !esMiPartida(p)" (click)="unirseAPartida(p.id)"
                            class="bg-[#d9a01a] hover:bg-[#c28e13] text-[#0b0e14] px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer">
                      Unirse
                    </button>
                    <button *ngIf="esMiPartida(p) || p.estado === 'jugando' && involucraUsuario(p)" (click)="irAPartida(p.id)"
                            class="bg-[#1e2530] hover:bg-gray-700 text-white border border-gray-700 px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer">
                      Jugar
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- Two Columns: Top Players & Last Games -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          <!-- Column 1: Top Players -->
          <section class="bg-[#121620] border border-gray-800 rounded-2xl p-5 md:p-6 shadow flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-bold text-white flex items-center gap-2">
                  <!-- Crown SVG -->
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="#d9a01a" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-.778.099-1.533.284-2.253" />
                  </svg>
                  Top Jugadores
                </h3>
                <a routerLink="/ranking" class="text-xs text-[#d9a01a] hover:underline font-semibold">Ver todo</a>
              </div>

              <!-- Leaderboard List -->
              <div class="flex flex-col gap-3">
                <div *ngFor="let rank of topRankings" class="flex items-center justify-between bg-[#171c26]/40 border border-gray-800/40 rounded-xl p-3.5">
                  <div class="flex items-center gap-3">
                    <!-- Rank Position Label -->
                    <span class="w-5 font-black text-center text-xs" 
                          [ngClass]="{
                            'text-[#d9a01a]': rank.posicion === 1,
                            'text-gray-400': rank.posicion === 2,
                            'text-amber-700': rank.posicion === 3,
                            'text-gray-600': rank.posicion > 3
                          }">
                      #{{ rank.posicion }}
                    </span>
                    <!-- Initials circle -->
                    <div class="w-8 h-8 rounded-full bg-[#1e2530] text-[#d9a01a] border border-gray-800 flex items-center justify-center font-bold text-xs select-none">
                      {{ rank.nombre ? rank.nombre.substring(0, 2).toUpperCase() : 'U' }}
                    </div>
                    <!-- Player Name and Tier -->
                    <div class="text-left">
                      <div class="font-bold text-sm text-white">{{ rank.nombre }}</div>
                      <div class="text-[10px] text-gray-400 font-medium">{{ rank.nivel }}</div>
                    </div>
                  </div>
                  <span class="font-black text-sm text-[#d9a01a]">{{ rank.puntos }} pts</span>
                </div>
              </div>
            </div>
          </section>

          <!-- Column 2: Last Games (Ultimas Partidas) -->
          <section class="bg-[#121620] border border-gray-800 rounded-2xl p-5 md:p-6 shadow flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-bold text-white flex items-center gap-2">
                  <!-- Clock/History SVG -->
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 text-gray-400">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                  Últimas Partidas
                </h3>
                <a routerLink="/historial" class="text-xs text-[#d9a01a] hover:underline font-semibold">Ver historial</a>
              </div>

              <!-- Matches List -->
              <div *ngIf="recentGames.length === 0" class="text-center py-8 text-gray-500 text-sm">
                Aún no has jugado ninguna partida completa.
              </div>

              <div *ngIf="recentGames.length > 0" class="flex flex-col gap-3">
                <div *ngFor="let g of recentGames" class="flex items-center justify-between bg-[#171c26]/40 border border-gray-800/40 rounded-xl p-3.5">
                  <div class="flex items-center gap-3">
                    <!-- Color Dot representing White/Black side in result -->
                    <span class="w-2 h-2 rounded-full" 
                          [ngClass]="{
                            'bg-green-500': g.ganador === usuario()?.id,
                            'bg-red-500': g.ganador !== usuario()?.id && g.estado === 'terminada',
                            'bg-gray-500': g.estado === 'empate'
                          }">
                    </span>
                    <div class="text-sm">
                      <span class="font-semibold">{{ g.nombreBlanco }}</span> 
                      <span class="text-gray-500 text-xs"> vs </span> 
                      <span class="font-semibold">{{ g.nombreNegro }}</span>
                    </div>
                  </div>

                  <!-- Elo Pill indicator -->
                  <div class="flex items-center gap-2">
                    <!-- ELO Change -->
                    <span *ngIf="g.ganador === usuario()?.id" class="px-2.5 py-1 rounded-lg text-xs font-black bg-green-500/10 text-green-400 border border-green-500/20">
                      +20
                    </span>
                    <span *ngIf="g.ganador !== usuario()?.id && g.estado === 'terminada'" class="px-2.5 py-1 rounded-lg text-xs font-black bg-red-500/10 text-red-400 border border-red-500/20">
                      -10
                    </span>
                    <span *ngIf="g.estado === 'empate'" class="px-2.5 py-1 rounded-lg text-xs font-black bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      +5
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

        </div>

      </main>

      <!-- Match Creator Slideover / Modal (Standard HTML, styled cleanly) -->
      <div *ngIf="mostrarModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div (click)="cerrarModalCrear()" class="absolute inset-0 bg-[#000]/70 backdrop-blur-xs"></div>
        
        <!-- Modal Content -->
        <div class="bg-[#121620] border border-gray-800 w-full max-w-md rounded-2xl p-6 shadow-2xl relative z-10">
          <h3 class="text-xl font-bold text-white mb-2">Crear nueva partida</h3>
          <p class="text-xs text-gray-400 mb-6">Elige el color de tus piezas para la nueva partida. El otro jugador tomará el color opuesto.</p>
          
          <div class="grid grid-cols-3 gap-3 mb-6">
            <!-- White Pieces -->
            <button type="button" (click)="opcionColor = 'blancas'"
                    [class.border-[#d9a01a]]="opcionColor === 'blancas'"
                    class="bg-[#181d2a] border border-gray-800 hover:border-[#d9a01a] py-4 rounded-xl flex flex-col items-center gap-2 font-bold text-sm cursor-pointer select-none">
              <span class="text-2xl text-white">♔</span>
              <span>Blancas</span>
            </button>

            <!-- Random Pieces -->
            <button type="button" (click)="opcionColor = 'aleatorio'"
                    [class.border-[#d9a01a]]="opcionColor === 'aleatorio'"
                    class="bg-[#181d2a] border border-gray-800 hover:border-[#d9a01a] py-4 rounded-xl flex flex-col items-center gap-2 font-bold text-sm cursor-pointer select-none">
              <span class="text-2xl text-[#d9a01a]">☯</span>
              <span>Aleatorio</span>
            </button>

            <!-- Black Pieces -->
            <button type="button" (click)="opcionColor = 'negras'"
                    [class.border-[#d9a01a]]="opcionColor === 'negras'"
                    class="bg-[#181d2a] border border-gray-800 hover:border-[#d9a01a] py-4 rounded-xl flex flex-col items-center gap-2 font-bold text-sm cursor-pointer select-none">
              <span class="text-2xl text-gray-400">♚</span>
              <span>Negras</span>
            </button>
          </div>

          <div class="flex items-center gap-3">
            <button type="button" (click)="cerrarModalCrear()" 
                    class="flex-1 border border-gray-800 hover:bg-[#1a202c] text-white py-3 rounded-xl font-bold text-sm transition cursor-pointer select-none">
              Cancelar
            </button>
            <button type="button" (click)="crearPartida()"
                    class="flex-1 bg-[#d9a01a] hover:bg-[#c28e13] text-[#0b0e14] py-3 rounded-xl font-bold text-sm transition shadow shadow-[#d9a01a]/10 cursor-pointer select-none">
              Crear Partida
            </button>
          </div>
        </div>
      </div>
      
    </div>
  `
})
export class Dashboard implements OnInit {
  private authService = inject(AuthService);
  private partidaService = inject(PartidaService);
  private rankingService = inject(RankingService);
  private usuarioService = inject(UsuarioService);
  private router = inject(Router);

  usuario = this.authService.currentUser;
  
  topRankings: Ranking[] = [];
  recentGames: Partida[] = [];
  partidasLobby: Partida[] = [];

  mostrarModal = false;
  opcionColor: 'blancas' | 'negras' | 'aleatorio' = 'aleatorio';

  ngOnInit() {
    this.usuarioService.obtenerPerfil().subscribe();
    this.cargarLobby();
    this.cargarRanking();
    this.cargarHistorialReciente();
  }

  cargarLobby() {
    this.partidaService.listarPartidasActivas().subscribe({
      next: (partidas) => {
        this.partidasLobby = partidas;
      }
    });
  }

  cargarRanking() {
    this.rankingService.obtenerLeaderboard().subscribe({
      next: (leaderboard) => {
        this.topRankings = leaderboard.slice(0, 3);
      }
    });
  }

  cargarHistorialReciente() {
    this.partidaService.listarHistorialUsuario().subscribe({
      next: (historial) => {
        this.recentGames = historial.slice(0, 3); // Solo mostrar las últimas 3
      }
    });
  }

  calcularWinRatio(jugadas?: number, ganadas?: number): number {
    if (!jugadas) return 0;
    return Math.round(( (ganadas || 0) / jugadas ) * 100);
  }

  abrirModalCrear() {
    this.mostrarModal = true;
  }

  cerrarModalCrear() {
    this.mostrarModal = false;
  }

  crearPartida() {
    this.partidaService.crearPartida(this.opcionColor).subscribe({
      next: (partida) => {
        this.cerrarModalCrear();
        this.irAPartida(partida.id);
      }
    });
  }

  unirseAPartida(partidaId: string) {
    this.partidaService.unirseAPartida(partidaId).subscribe({
      next: () => {
        this.irAPartida(partidaId);
      }
    });
  }

  irAPartida(partidaId: string) {
    this.router.navigate(['/jugador', partidaId]);
  }

  // Helpers de rendering de tabla de Lobby
  obtenerCreadorNombre(p: Partida): string {
    if (p.jugadorBlanco) return p.nombreBlanco || 'Desconocido';
    return p.nombreNegro || 'Desconocido';
  }

  obtenerCreadorElo(p: Partida): number {
    if (p.jugadorBlanco) return p.eloBlanco || 1000;
    return p.eloNegro || 1000;
  }

  esMiPartida(p: Partida): boolean {
    const miId = this.usuario()?.id;
    return p.jugadorBlanco === miId || p.jugadorNegro === miId;
  }

  involucraUsuario(p: Partida): boolean {
    const miId = this.usuario()?.id;
    return p.jugadorBlanco === miId || p.jugadorNegro === miId;
  }
}
