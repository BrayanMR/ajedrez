import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Navbar } from '../../components/navbar/navbar';
import { UsuarioService } from '../../services/usuario.service';
import { Usuario } from '../../models/usuario';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, Navbar],
  template: `
    <div class="min-h-screen bg-[#0b0e14] text-white flex flex-col">
      <!-- Navbar -->
      <app-navbar></app-navbar>

      <!-- Main Container -->
      <main class="flex-1 max-w-5xl w-full mx-auto p-4 md:p-8 flex flex-col gap-6">
        
        <!-- Header -->
        <div class="text-left">
          <h2 class="text-3xl font-extrabold tracking-tight">Panel del Administrador</h2>
          <p class="text-gray-400 text-sm mt-1">Gestión general del sistema: Monitoreo de usuarios, puntuaciones y actividad.</p>
        </div>

        <!-- Users Management Card -->
        <section class="bg-[#121620] border border-gray-800 rounded-2xl p-5 shadow">
          <h3 class="text-lg font-bold text-white mb-4">Usuarios Registrados</h3>
          
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
                <tr *ngFor="let u of usuarios" class="hover:bg-white/[0.01]">
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
                  <td class="py-3.5 text-right text-[#d9a01a] font-bold">
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
        </section>

      </main>
    </div>
  `
})
export class AdminPage implements OnInit {
  private usuarioService = inject(UsuarioService);

  usuarios: Usuario[] = [];

  ngOnInit() {
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    this.usuarioService.listarUsuarios().subscribe({
      next: (data) => {
        this.usuarios = data;
      }
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
