import { Aviso } from '../aviso/aviso';
import { Component, DestroyRef, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TimeoutError, finalize, timeout, timer } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { mensajeFirebase } from '../../services/firebase-data';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [Aviso, CommonModule, FormsModule],
  template: `
    <div class="acceso-tarjeta">
      <!-- Welcome Header -->
      <h2 class="acceso-titulo">Bienvenido de vuelta</h2>
      <p class="text-slate-400 text-sm mb-7">Ingresa tus credenciales para continuar</p>

      <!-- Tabs -->
      <div class="acceso-tabs">
        <button type="button" class="acceso-tab acceso-tab-activa">
          Iniciar Sesión
        </button>
        <button type="button" [disabled]="loading()" (click)="onSwitchTab.emit('registro')"
                class="acceso-tab">
          Registrarse
        </button>
      </div>

      @if (cuentaCreada && !errorMsg()) {
        <app-aviso class="mb-4" tipo="exito" titulo="Cuenta creada"
          mensaje="Inicia sesión para terminar de configurar tu perfil." />
      }

      @if (errorMsg()) {
        <app-aviso class="mb-4" tipo="error" titulo="Revisa el inicio de sesión" [mensaje]="errorMsg()" />
      }

      <!-- Form -->
      <form (ngSubmit)="onSubmit()" [attr.aria-busy]="loading()">
        <fieldset [disabled]="loading()" class="min-w-0">
          <!-- Email -->
          <div class="mb-4">
            <label for="login-correo" class="block text-[11px] font-bold text-gray-400 tracking-wider mb-2">CORREO ELECTRÓNICO</label>
            <input type="email" name="correo" spellcheck="false" autocapitalize="none" [(ngModel)]="correo" required id="login-correo" autocomplete="username"
                   placeholder="jugador@chess.com"
                   class="acceso-campo" />
          </div>

          <!-- Password -->
          <div class="mb-6">
            <label for="login-contrasena" class="block text-[11px] font-bold text-gray-400 tracking-wider mb-2">CONTRASEÑA</label>
            <div class="relative">
              <input [type]="mostrarContrasena ? 'text' : 'password'" name="contraseña" [(ngModel)]="contrasena" required id="login-contrasena" autocomplete="current-password"
                   placeholder="••••••••"
                   class="acceso-campo acceso-campo-clave" />
              <button type="button" (click)="mostrarContrasena = !mostrarContrasena"
                      [attr.aria-label]="mostrarContrasena ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                      aria-controls="login-contrasena"
                      class="absolute inset-y-0 right-0 px-3 text-sm font-medium text-gray-300 hover:text-white focus-visible:outline-[#d9a01a]">
                {{ mostrarContrasena ? 'Ocultar' : 'Mostrar' }}
              </button>
            </div>
          </div>

          <!-- Submit Button -->
          <button type="submit" [disabled]="loading()"
                  class="acceso-boton">
            <span *ngIf="loading()" class="animate-spin rounded-full h-4 w-4 border-2 border-[#0b0e14] border-t-transparent"></span>
            {{ loading() ? 'Iniciando sesión…' : 'Iniciar sesión' }}
          </button>
        </fieldset>
      </form>
      @if (esperaProlongada()) {
        <app-aviso class="mt-4" tipo="espera" titulo="Seguimos procesando tu solicitud"
          mensaje="El servidor está tardando en responder. Puedes esperar en esta pantalla." />
      }
    </div>
  `
})
export class Login {
  @Output() onSwitchTab = new EventEmitter<string>();

  private authService = inject(AuthService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  @Input() correo = '';
  @Input() cuentaCreada = false;
  contrasena = '';
  readonly errorMsg = signal('');
  readonly loading = signal(false);
  readonly esperaProlongada = signal(false);
  mostrarContrasena = false;

  onSubmit() {
    if (this.loading()) return;

    const correo = this.correo.trim();
    if (!correo || !this.contrasena) {
      this.errorMsg.set('Completa todos los campos.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+$/.test(correo)) {
      this.errorMsg.set('Escribe un correo electrónico válido.');
      return;
    }

    this.loading.set(true);
    this.errorMsg.set('');

    const aviso = timer(4_000).subscribe(() => {
      this.esperaProlongada.set(true);
    });

    this.authService.login(correo, this.contrasena).pipe(
      timeout({ first: 20_000 }),
      takeUntilDestroyed(this.destroyRef),
      finalize(() => {
        aviso.unsubscribe();
        this.esperaProlongada.set(false);
        this.loading.set(false);
      })
    ).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        const mensaje = err instanceof TimeoutError
          ? 'Firebase tardó demasiado en responder. Inténtalo de nuevo.'
          : mensajeFirebase(err, 'No se pudo iniciar sesión. Inténtalo de nuevo.');
        this.errorMsg.set(mensaje);
      }
    });
  }
}
