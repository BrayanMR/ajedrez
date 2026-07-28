import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Navbar } from '../navbar/navbar';
import { PartidaService } from '../../services/partida.service';
import { AuthService } from '../../services/auth.service';
import { Partida } from '../../models/partida';

@Component({
  selector: 'app-historial',
  standalone: true,
  imports: [CommonModule, RouterLink, Navbar],
  template: `
    <div class="min-h-screen bg-[#0b0e14] text-white flex flex-col">
      <!-- Navbar -->
      <app-navbar></app-navbar>

      <!-- Main Container -->
      <main class="flex-1 max-w-4xl w-full mx-auto p-4 md:p-8 flex flex-col gap-6">
        
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="text-left">
            <h2 class="text-3xl font-extrabold tracking-tight">Mi Historial</h2>
            <p class="text-gray-400 text-sm mt-1">
              {{ usuario()?.nombre }} &bull; {{ partidas.length }} partidas registradas
            </p>
          </div>

          <!-- Filters -->
          <div class="flex bg-[#121620] p-1 rounded-xl border border-gray-800 self-start">
            <button *ngFor="let filter of ['Todas', 'Ganadas', 'Perdidas', 'Empates']" 
                    (click)="cambiarFiltro(filter)"
                    [ngClass]="filtroActivo === filter ? 'bg-[#d9a01a] text-[#0b0e14]' : 'text-gray-400 hover:text-white bg-transparent'"
                    class="px-4 py-2 rounded-lg text-xs font-bold transition select-none cursor-pointer">
              {{ filter }}
            </button>
          </div>
        </div>

        <!-- Stats row (matching mockup cards) -->
        <div class="grid grid-cols-3 gap-4">
          <!-- Wins Card -->
          <div class="bg-green-500/5 border border-green-500/10 rounded-2xl p-4 text-center">
            <span class="text-2xl md:text-3xl font-black text-green-400 block">{{ countVictorias() }}</span>
            <span class="text-[10px] uppercase font-bold tracking-wider text-green-500">Victorias</span>
          </div>

          <!-- Losses Card -->
          <div class="bg-red-500/5 border border-red-500/10 rounded-2xl p-4 text-center">
            <span class="text-2xl md:text-3xl font-black text-red-400 block">{{ countDerrotas() }}</span>
            <span class="text-[10px] uppercase font-bold tracking-wider text-red-500">Derrotas</span>
          </div>

          <!-- Draws Card -->
          <div class="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-4 text-center">
            <span class="text-2xl md:text-3xl font-black text-blue-400 block">{{ countEmpates() }}</span>
            <span class="text-[10px] uppercase font-bold tracking-wider text-blue-500">Empates</span>
          </div>
        </div>

        <!-- Matches list -->
        <div class="flex flex-col gap-3">
          <div *ngIf="partidasFiltradas.length === 0" class="text-center py-12 text-gray-500 text-sm bg-[#121620] border border-gray-800 rounded-2xl">
            No se encontraron partidas en esta categoría.
          </div>

          <div *ngFor="let p of partidasFiltradas" 
               [ngClass]="{
                 'border-green-500/20 bg-green-500/[0.02]': esGanador(p),
                 'border-red-500/20 bg-red-500/[0.02]': esPerdedor(p),
                 'border-blue-500/20 bg-blue-500/[0.02]': p.estado === 'empate'
               }"
               class="border rounded-2xl p-4 flex items-center justify-between shadow transition-all hover:scale-[1.005]">
            
            <div class="flex items-center gap-4">
              <!-- Left piece symbol representing color played -->
              <div [ngClass]="{
                     'bg-green-500/10 text-green-400': esGanador(p),
                     'bg-red-500/10 text-red-400': esPerdedor(p),
                     'bg-blue-500/10 text-blue-400': p.estado === 'empate'
                   }"
                   class="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0">
                <!-- Rook / Chess piece SVG representation -->
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H5.25a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                </svg>
              </div>

              <!-- Match Details -->
              <div class="text-left">
                <div class="text-xs md:text-sm font-bold text-white flex items-center gap-1.5 flex-wrap">
                  <span class="text-gray-500 font-medium">[{{ p.jugadorBlanco === usuario()?.id ? 'Blancas' : 'Negras' }}]</span>
                  <span>{{ p.nombreBlanco }}</span>
                  <span class="text-gray-500 font-medium">vs</span>
                  <span>{{ p.nombreNegro }}</span>
                </div>
                <div class="text-[10px] text-gray-500 mt-0.5">
                  {{ formatearFecha(p.fechaInicio) }}
                </div>
              </div>
            </div>

            <!-- ELO Pill, status badge and View details -->
            <div class="flex items-center gap-3">
              <!-- ELO adjustment pill -->
              <span *ngIf="esGanador(p)" class="px-2 py-1 rounded-lg text-xs font-black bg-green-500/10 text-green-400 border border-green-500/20">
                +20 pts
              </span>
              <span *ngIf="esPerdedor(p)" class="px-2 py-1 rounded-lg text-xs font-black bg-red-500/10 text-red-400 border border-red-500/20">
                -10 pts
              </span>
              <span *ngIf="p.estado === 'empate'" class="px-2 py-1 rounded-lg text-xs font-black bg-blue-500/10 text-blue-400 border border-blue-500/20">
                +5 pts
              </span>

              <!-- Status Tag -->
              <span *ngIf="esGanador(p)" class="hidden md:inline px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-green-500/10 text-green-400 border border-green-500/20">
                Victoria
              </span>
              <span *ngIf="esPerdedor(p)" class="hidden md:inline px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/20">
                Derrota
              </span>
              <span *ngIf="p.estado === 'empate'" class="hidden md:inline px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Empate
              </span>

              <!-- Eye icon to view details -->
              <a [routerLink]="['/jugador', p.id]" class="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-white/5 transition flex items-center justify-center">
                <!-- Eye SVG -->
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                </svg>
              </a>
            </div>

          </div>
        </div>

      </main>
    </div>
  `
})
export class Historial implements OnInit {
  private partidaService = inject(PartidaService);
  private authService = inject(AuthService);

  usuario = this.authService.currentUser;
  
  partidas: Partida[] = [];
  partidasFiltradas: Partida[] = [];
  filtroActivo = 'Todas';

  ngOnInit() {
    this.cargarHistorial();
  }

  cargarHistorial() {
    this.partidaService.listarHistorialUsuario().subscribe({
      next: (partidas) => {
        this.partidas = partidas;
        this.aplicarFiltro();
      }
    });
  }

  cambiarFiltro(filtro: string) {
    this.filtroActivo = filtro;
    this.aplicarFiltro();
  }

  aplicarFiltro() {
    if (this.filtroActivo === 'Todas') {
      this.partidasFiltradas = this.partidas;
    } else if (this.filtroActivo === 'Ganadas') {
      this.partidasFiltradas = this.partidas.filter(p => this.esGanador(p));
    } else if (this.filtroActivo === 'Perdidas') {
      this.partidasFiltradas = this.partidas.filter(p => this.esPerdedor(p));
    } else if (this.filtroActivo === 'Empates') {
      this.partidasFiltradas = this.partidas.filter(p => p.estado === 'empate');
    }
  }

  esGanador(p: Partida): boolean {
    return p.estado === 'terminada' && p.ganador === this.usuario()?.id;
  }

  esPerdedor(p: Partida): boolean {
    return p.estado === 'terminada' && p.ganador !== this.usuario()?.id;
  }

  countVictorias(): number {
    return this.partidas.filter(p => this.esGanador(p)).length;
  }

  countDerrotas(): number {
    return this.partidas.filter(p => this.esPerdedor(p)).length;
  }

  countEmpates(): number {
    return this.partidas.filter(p => p.estado === 'empate').length;
  }

  formatearFecha(fechaStr: string): string {
    try {
      const f = new Date(fechaStr);
      return f.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return fechaStr;
    }
  }
}
