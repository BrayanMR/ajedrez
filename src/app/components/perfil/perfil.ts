import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Navbar } from '../navbar/navbar';
import { UsuarioService } from '../../services/usuario.service';
import { AuthService } from '../../services/auth.service';
import { Usuario } from '../../models/usuario';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule, Navbar],
  template: `
    <div class="min-h-screen bg-[#0b0e14] text-white flex flex-col">
      <!-- Navbar -->
      <app-navbar></app-navbar>

      <!-- Main Container -->
      <main class="flex-1 max-w-4xl w-full mx-auto p-4 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        
        <!-- Left Side: User profile card & Stats -->
        <div class="md:col-span-1 bg-[#121620] border border-gray-800 rounded-2xl p-6 shadow text-center flex flex-col items-center gap-4">
          <!-- Large Avatar -->
          <div class="w-20 h-20 rounded-full bg-[#d9a01a] text-[#0b0e14] font-black flex items-center justify-center text-3xl shadow-xl shadow-[#d9a01a]/5">
            {{ obtenerIniciales() }}
          </div>

          <div>
            <h3 class="text-xl font-bold text-white">{{ usuario()?.nombre }}</h3>
            <span class="text-xs text-[#d9a01a] font-semibold uppercase tracking-wider">{{ obtenerNivel() }}</span>
          </div>

          <div class="w-full border-t border-gray-800/40 my-2 pt-4 flex flex-col gap-2.5 text-left text-xs text-gray-300">
            <div class="flex justify-between">
              <span class="text-gray-500 font-medium">Correo:</span>
              <span class="font-semibold">{{ usuario()?.correo }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500 font-medium">Puntuación ELO:</span>
              <span class="font-bold text-[#d9a01a]">{{ usuario()?.elo }} pts</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500 font-medium">Partidas jugadas:</span>
              <span class="font-bold">{{ usuario()?.partidasJugadas }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500 font-medium">Partidas ganadas:</span>
              <span class="font-bold text-green-400">{{ usuario()?.partidasGanadas }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500 font-medium">Miembro desde:</span>
              <span class="font-semibold">{{ formatearFecha(usuario()?.fechaRegistro) }}</span>
            </div>
          </div>
        </div>

        <!-- Right Side: Edit Form -->
        <div class="md:col-span-2 bg-[#121620] border border-gray-800 rounded-2xl p-6 shadow">
          <h3 class="text-lg font-bold text-white mb-2">Editar Perfil</h3>
          <p class="text-xs text-gray-400 mb-6">Actualiza tu nombre de usuario y contraseña.</p>

          <!-- Alerts -->
          <div *ngIf="successMsg" class="bg-green-500/10 border border-green-500/20 text-green-400 p-3 rounded-lg text-sm mb-4">
            {{ successMsg }}
          </div>
          <div *ngIf="errorMsg" class="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm mb-4">
            {{ errorMsg }}
          </div>

          <form (submit)="onSubmit()">
            <!-- Nombre de usuario -->
            <div class="mb-4">
              <label class="block text-[11px] font-bold text-gray-400 tracking-wider mb-2">NOMBRE DE USUARIO</label>
              <input type="text" name="nombre" [(ngModel)]="nombre" required
                     placeholder="Nombre de usuario"
                     class="w-full bg-[#181d2a] border border-gray-800 focus:border-[#d9a01a] focus:ring-1 focus:ring-[#d9a01a] rounded-xl py-3 px-4 text-white text-sm outline-none transition" />
            </div>
            <button type="submit" [disabled]="loading"
                    class="w-full md:w-auto px-6 bg-[#d9a01a] hover:bg-[#c28e13] disabled:bg-[#d9a01a]/50 text-[#0b0e14] py-3 rounded-xl font-bold transition shadow-lg shadow-[#d9a01a]/5 cursor-pointer">
              <span *ngIf="loading" class="animate-spin rounded-full h-4 w-4 border-2 border-[#0b0e14] border-t-transparent inline-block mr-1"></span>
              Guardar Cambios
            </button>
          </form>
        </div>

      </main>
    </div>
  `
})
export class PerfilComponent implements OnInit {
  private usuarioService = inject(UsuarioService);
  private authService = inject(AuthService);

  usuario = this.authService.currentUser;

  nombre = '';
  contrasena = '';
  successMsg = '';
  errorMsg = '';
  loading = false;

  ngOnInit() {
    if (this.usuario()) {
      this.nombre = this.usuario()!.nombre;
    }
  }

  obtenerIniciales(): string {
    const name = this.usuario()?.nombre;
    if (!name) return 'U';
    return name.substring(0, 2).toUpperCase();
  }

  obtenerNivel(): string {
    const elo = this.usuario()?.elo || 1000;
    if (elo >= 2400) return 'Gran Maestro';
    if (elo >= 2000) return 'Maestro';
    if (elo >= 1600) return 'Avanzado';
    if (elo >= 1200) return 'Intermedio';
    return 'Principiante';
  }

  formatearFecha(fechaStr?: string): string {
    if (!fechaStr) return '---';
    try {
      const f = new Date(fechaStr);
      return f.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch (e) {
      return fechaStr;
    }
  }

  onSubmit() {
    if (!this.nombre) {
      this.errorMsg = 'El nombre de usuario es obligatorio.';
      return;
    }

    this.loading = true;
    this.errorMsg = '';
    this.successMsg = '';

    this.usuarioService.actualizarPerfil(this.nombre, this.contrasena || undefined).subscribe({
      next: () => {
        this.loading = false;
        this.successMsg = 'Perfil actualizado con éxito.';
        this.contrasena = '';
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err.error?.mensaje || 'Error al actualizar el perfil.';
      }
    });
  }
}
