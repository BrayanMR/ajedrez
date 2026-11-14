import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Navbar } from '../../components/navbar/navbar';
import { UsuarioService } from '../../services/usuario.service';
import { finalize } from 'rxjs';
import { Usuario } from '../../models/usuario';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, Navbar],
  template: `
    <div class="retro-pagina flex flex-col">
      <!-- Navbar -->
      <app-navbar></app-navbar>

      <!-- Main Container -->
      <main class="flex-1 max-w-5xl w-full mx-auto p-4 md:p-8 flex flex-col gap-6">
        
        <!-- Header -->
        <div class="retro-portada cabecera-admin">
          <h1 class="retro-titulo">Panel de administración</h1>
          <p class="text-gray-400 text-sm mt-1">Gestión general del sistema: Monitoreo de usuarios, puntuaciones y actividad.</p>
        </div>

        <!-- Users Management Card -->
        <section class="retro-panel p-5 shadow">
          <h3 class="text-lg font-bold text-white mb-4">Usuarios Registrados</h3>
          
          @if (cargando()) { <p role="status" class="mb-3 text-sm text-gray-300">Cargando usuarios…</p> }
          @if (error()) { <p role="alert" class="mb-3 text-sm text-red-300">No se pudieron cargar los usuarios.</p> }
          @if (!cargando() && !error() && !usuarios().length) { <p class="mb-3 text-sm text-gray-300">No hay usuarios registrados.</p> }
          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm">
              <thead>
                <tr class="border-b border-gray-800 text-gray-400 text-xs font-bold uppercase tracking-wider">
                  <th class="pb-3">Nombre</th>
                  <th class="pb-3">Correo</th>
                  <th class="pb-3 text-center">Partidas Jugadas</th>
                  <th class="pb-3 text-center">Partidas Ganadas</th>
                  <th class="pb-3 text-right">ELO</th>
                  <th class="pb-3 text-right">Fecha Registro</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-800/40">
                <tr *ngFor="let u of usuarios()" class="hover:bg-white/[0.01]">
                  <!-- Name -->
                  <td class="py-3.5 font-semibold text-white">
                    {{ u.nombre }}
                  </td>

                  <!-- Email -->
                  <td class="py-3.5 text-gray-400">
                    {{ u.correo }}
                  </td>

                  <!-- Matches Played -->
                  <td class="py-3.5 text-center text-gray-300 font-medium">
                    {{ u.partidasJugadas || 0 }}
                  </td>

                  <!-- Wins -->
                  <td class="py-3.5 text-center text-green-400 font-medium">
                    {{ u.partidasGanadas || 0 }}
                  </td>

                  <!-- ELO -->
                  <td class="py-3.5 text-right text-[#f7c77e] font-bold">
                    {{ u.elo || 1000 }} pts
                  </td>

                  <!-- Registration Date -->
                  <td class="py-3.5 text-right text-gray-500 text-xs">
                    {{ formatearFecha(u.fechaRegistro) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          @if (!cargando() && (siguiente() || error())) {
            <button type="button" class="mt-4 rounded-lg border border-amber-300/30 px-4 py-2 text-sm text-[#f7c77e]"
              (click)="cargarUsuarios()">{{ error() ? 'Reintentar' : 'Cargar más usuarios' }}</button>
          }
        </section>

      </main>
    </div>
  `,
  styles: `
    .cabecera-admin {
      flex: none;
      padding: .875rem clamp(1rem, 3vw, 1.5rem);
      border-radius: .625rem;
    }

    .cabecera-admin h1 {
      font-size: clamp(1.25rem, 3vw, 1.75rem);
    }
  `
})
export class AdminPage implements OnInit {
  private usuarioService = inject(UsuarioService);

  readonly usuarios = signal<Usuario[]>([]);
  readonly siguiente = signal<string | undefined>(undefined);
  readonly cargando = signal(false);
  readonly error = signal(false);

  ngOnInit() {
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    if (this.cargando()) return;
    this.cargando.set(true);
    this.error.set(false);
    this.usuarioService.listarUsuarios(this.siguiente()).pipe(
      finalize(() => this.cargando.set(false))
    ).subscribe({
      next: ({ usuarios, siguiente }) => {
        this.usuarios.update(actuales => [...actuales, ...usuarios]);
        this.siguiente.set(siguiente);
      },
      error: () => this.error.set(true)
    });
  }

  formatearFecha(fechaStr?: string): string {
    if (!fechaStr) return '---';
    try {
      const f = new Date(fechaStr);
      return f.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (e) {
      return fechaStr;
    }
  }
}
