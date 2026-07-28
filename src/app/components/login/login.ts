import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-[#121620] border border-gray-800 rounded-2xl p-8 w-full max-w-md shadow-2xl relative">
      <!-- Welcome Header -->
      <h2 class="text-2xl font-bold text-white mb-1">Bienvenido de vuelta</h2>
      <p class="text-gray-400 text-sm mb-6">Ingresa tus credenciales para continuar</p>

      <!-- Tabs -->
      <div class="grid grid-cols-2 bg-[#1a202c] p-1 rounded-xl mb-6 border border-gray-800">
        <button type="button" class="py-2.5 rounded-lg text-sm font-semibold transition text-white bg-[#d9a01a] shadow">
          Iniciar Sesión
        </button>
        <button type="button" (click)="onSwitchTab.emit('registro')" 
                class="py-2.5 rounded-lg text-sm font-semibold transition text-gray-400 hover:text-white bg-transparent">
          Registrarse
        </button>
      </div>

      <!-- Error Alert -->
      <div *ngIf="errorMsg" class="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm mb-4">
        {{ errorMsg }}
      </div>

      <!-- Form -->
      <form (submit)="onSubmit()">
        <!-- Email -->
        <div class="mb-4">
          <label class="block text-[11px] font-bold text-gray-400 tracking-wider mb-2">CORREO ELECTRÓNICO</label>
          <input type="email" name="correo" [(ngModel)]="correo" required
                 placeholder="jugador@chess.com"
                 class="w-full bg-[#181d2a] border border-gray-800 focus:border-[#d9a01a] focus:ring-1 focus:ring-[#d9a01a] rounded-xl py-3 px-4 text-white text-sm outline-none transition placeholder-gray-600" />
        </div>

        <!-- Password -->
        <div class="mb-6">
          <label class="block text-[11px] font-bold text-gray-400 tracking-wider mb-2">CONTRASEÑA</label>
          <input type="password" name="contraseña" [(ngModel)]="contrasena" required
                 placeholder="••••••••"
                 class="w-full bg-[#181d2a] border border-gray-800 focus:border-[#d9a01a] focus:ring-1 focus:ring-[#d9a01a] rounded-xl py-3 px-4 text-white text-sm outline-none transition placeholder-gray-600" />
        </div>

        <!-- Submit Button -->
        <button type="submit" [disabled]="loading"
                class="w-full bg-[#d9a01a] hover:bg-[#c28e13] disabled:bg-[#d9a01a]/50 text-[#0b0e14] py-3 rounded-xl font-bold transition shadow-lg shadow-[#d9a01a]/10 hover:shadow-[#d9a01a]/20 flex items-center justify-center gap-2 cursor-pointer">
          <span *ngIf="loading" class="animate-spin rounded-full h-4 w-4 border-2 border-[#0b0e14] border-t-transparent"></span>
          Ingresar
        </button>
      </form>


  `
})
export class Login {
  @Output() onSwitchTab = new EventEmitter<string>();

  private authService = inject(AuthService);
  private router = inject(Router);

  correo = '';
  contrasena = '';
  errorMsg = '';
  loading = false;

  onSubmit() {
    if (!this.correo || !this.contrasena) {
      this.errorMsg = 'Por favor, rellene todos los campos.';
      return;
    }

    this.loading = true;
    this.errorMsg = '';

    this.authService.login(this.correo, this.contrasena).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err.error?.mensaje || 'Error al iniciar sesión. Compruebe sus credenciales.';
      }
    });
  }
}
