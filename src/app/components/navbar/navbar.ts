import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="bg-[#0b0e14] border-b border-gray-800 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-50">
      <!-- Logo -->
      <a routerLink="/dashboard" class="flex items-center gap-2 cursor-pointer select-none">
        <div class="bg-[#d9a01a] p-1.5 rounded-lg flex items-center justify-center">
          <!-- Gold Rook/Crown SVG -->
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="#0b0e14" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H5.25a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
          </svg>
        </div>
        <span class="text-xl font-bold tracking-tight">Chess<span class="text-[#d9a01a]">Rank</span></span>
      </a>

      <!-- Menu links (Desktop) -->
      <div class="hidden md:flex items-center gap-2">
        <a routerLink="/dashboard" routerLinkActive="bg-[#171c26] text-[#d9a01a] border-[#d9a01a]" [routerLinkActiveOptions]="{exact: true}" 
           class="flex items-center gap-1.5 px-4 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-[#121620] transition border-b-2 border-transparent">
          <span>Tablero</span>
        </a>
        <a routerLink="/ranking" routerLinkActive="bg-[#171c26] text-[#d9a01a] border-[#d9a01a]"
           class="flex items-center gap-1.5 px-4 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-[#121620] transition border-b-2 border-transparent">
          <span>Ranking</span>
        </a>
        <a routerLink="/historial" routerLinkActive="bg-[#171c26] text-[#d9a01a] border-[#d9a01a]"
           class="flex items-center gap-1.5 px-4 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-[#121620] transition border-b-2 border-transparent">
          <span>Historial</span>
        </a>
        <a routerLink="/perfil" routerLinkActive="bg-[#171c26] text-[#d9a01a] border-[#d9a01a]"
           class="flex items-center gap-1.5 px-4 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-[#121620] transition border-b-2 border-transparent">
          <span>Perfil</span>
        </a>
        <a routerLink="/admin" routerLinkActive="bg-[#171c26] text-[#d9a01a] border-[#d9a01a]"
           class="flex items-center gap-1.5 px-4 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-[#121620] transition border-b-2 border-transparent">
          <span>Admin</span>
        </a>
      </div>

      <!-- User Info & Logout -->
      <div class="flex items-center gap-4" *ngIf="usuario()">
        <a routerLink="/perfil" class="flex items-center gap-3 bg-[#121620] hover:bg-[#171c26] border border-gray-800 rounded-full py-1 pl-1 pr-4 cursor-pointer transition select-none">
          <!-- Avatar con iniciales -->
          <div class="w-8 h-8 rounded-full bg-[#d9a01a] text-[#0b0e14] font-bold flex items-center justify-center text-sm shadow">
            {{ obtenerIniciales(usuario()?.nombre) }}
          </div>
          <!-- Nombre y ELO -->
          <div class="text-left flex flex-col justify-center">
            <span class="text-xs font-semibold text-white leading-tight block">{{ usuario()?.nombre }}</span>
            <span class="text-[10px] text-[#d9a01a] font-medium leading-none">{{ usuario()?.elo }} pts</span>
          </div>
        </a>

        <!-- Logout button -->
        <button (click)="logout()" class="text-gray-400 hover:text-[#f43f5e] transition p-2 rounded-lg hover:bg-[#171c26]" title="Cerrar Sesión">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 6.75 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
          </svg>
        </button>
      </div>
    </nav>
  `
})
export class Navbar {
  private authService = inject(AuthService);
  
  usuario = this.authService.currentUser;

  obtenerIniciales(nombre?: string): string {
    if (!nombre) return 'U';
    const partes = nombre.trim().split(' ');
    if (partes.length > 1) {
      return (partes[0][0] + partes[1][0]).toUpperCase();
    }
    return partes[0].substring(0, 2).toUpperCase();
  }

  logout() {
    this.authService.logout();
  }
}
