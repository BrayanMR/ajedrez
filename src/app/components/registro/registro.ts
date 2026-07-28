import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-[#121620] border border-gray-800 rounded-2xl p-8 w-full max-w-md shadow-2xl relative">
      <!-- Header -->
      <h2 class="text-2xl font-bold text-white mb-1">Crea tu cuenta</h2>
      <p class="text-gray-400 text-sm mb-6">Únete y comienza con 1,000 puntos ELO</p>

      <!-- Tabs -->
      <div class="grid grid-cols-2 bg-[#1a202c] p-1 rounded-xl mb-6 border border-gray-800">
        <button type="button" (click)="onSwitchTab.emit('login')"
                class="py-2.5 rounded-lg text-sm font-semibold transition text-gray-400 hover:text-white bg-transparent">
          Iniciar Sesión
        </button>
        <button type="button" class="py-2.5 rounded-lg text-sm font-semibold transition text-white bg-[#d9a01a] shadow">
          Registrarse
        </button>
      </div>

      <!-- Error Alert -->
      <div *ngIf="errorMsg" class="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm mb-4">
        {{ errorMsg }}
      </div>

      <!-- Form -->
      <form (submit)="onSubmit()">
        <!-- Username -->
        <div class="mb-4">
          <label class="block text-[11px] font-bold text-gray-400 tracking-wider mb-2">NOMBRE DE USUARIO</label>
          <input type="text" name="nombre" [(ngModel)]="nombre" required
                 placeholder="magnus_fischer"
                 class="w-full bg-[#181d2a] border border-gray-800 focus:border-[#d9a01a] focus:ring-1 focus:ring-[#d9a01a] rounded-xl py-3 px-4 text-white text-sm outline-none transition placeholder-gray-600" />
        </div>

        <!-- Email -->
        <div class="mb-4">
          <label class="block text-[11px] font-bold text-gray-400 tracking-wider mb-2">CORREO ELECTRÓNICO</label>
          <input type="email" name="correo" [(ngModel)]="correo" required
                 placeholder="jugador@chess.com"
                 class="w-full bg-[#181d2a] border border-gray-800 focus:border-[#d9a01a] focus:ring-1 focus:ring-[#d9a01a] rounded-xl py-3 px-4 text-white text-sm outline-none transition placeholder-gray-600" />
        </div>

        <!-- Password -->
        <div class="mb-5">
          <label class="block text-[11px] font-bold text-gray-400 tracking-wider mb-2">CONTRASEÑA</label>
          <input type="password" name="contraseña" [(ngModel)]="contrasena" required
                 placeholder="••••••••"
                 class="w-full bg-[#181d2a] border border-gray-800 focus:border-[#d9a01a] focus:ring-1 focus:ring-[#d9a01a] rounded-xl py-3 px-4 text-white text-sm outline-none transition placeholder-gray-600" />
        </div>

        <!-- ELO Start Alert Info Box -->
        <div class="flex items-center gap-2 bg-[#d9a01a]/5 border border-[#d9a01a]/20 text-[#d9a01a] px-4 py-3 rounded-xl text-xs mb-6 select-none">
          <!-- Star/Trophy Icon -->
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="w-4 h-4 shrink-0">
            <path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499c.173-.439.78-.439.953 0l1.79 4.549a.75.75 0 0 0 .583.497l4.908.412c.473.04.662.63.292.961l-3.71 3.327a.75.75 0 0 0-.213.657l.96 4.88c.092.47-.404.83-.807.568L12 18.17a.75.75 0 0 0-.73 0l-4.148 2.63c-.403.256-.899-.104-.807-.569l.96-4.88a.75.75 0 0 0-.213-.657L3.354 11.23c-.37-.331-.182-.921.291-.96l4.908-.413a.75.75 0 0 0 .584-.497l1.79-4.549Z" />
          </svg>
          <span>Al registrarte, iniciarás con <strong class="font-bold">1,000 puntos</strong> de ranking ELO.</span>
        </div>

        <!-- Submit Button -->
        <button type="submit" [disabled]="loading"
                class="w-full bg-[#d9a01a] hover:bg-[#c28e13] disabled:bg-[#d9a01a]/50 text-[#0b0e14] py-3 rounded-xl font-bold transition shadow-lg shadow-[#d9a01a]/10 hover:shadow-[#d9a01a]/20 flex items-center justify-center gap-2 cursor-pointer">
          <span *ngIf="loading" class="animate-spin rounded-full h-4 w-4 border-2 border-[#0b0e14] border-t-transparent"></span>
          Crear cuenta
        </button>
      </form>
    </div>
  `
})
export class Registro {
  @Output() onSwitchTab = new EventEmitter<string>();

  private authService = inject(AuthService);
  private router = inject(Router);

  nombre = '';
  correo = '';
  contrasena = '';
  errorMsg = '';
  loading = false;

  onSubmit() {
    if (!this.nombre || !this.correo || !this.contrasena) {
      this.errorMsg = 'Por favor, rellene todos los campos.';
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.correo)) {
      this.errorMsg = 'Por favor, introduce un correo electrónico válido (ejemplo@correo.com).';
      return;
    }

    this.loading = true;
    this.errorMsg = '';

    this.authService.registro(this.nombre, this.correo, this.contrasena).subscribe({
      next: () => {
        // Auto-login after registration
        this.authService.login(this.correo, this.contrasena).subscribe({
          next: () => {
            this.loading = false;
            this.router.navigate(['/dashboard']);
          },
          error: (err) => {
            this.loading = false;
            // If auto-login fails, redirect anyway so they can try to login manually
            this.router.navigate(['/inicio']);
          }
        });
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err.error?.mensaje || 'Error al registrar la cuenta. Inténtelo de nuevo.';
      }
    });
  }
}
