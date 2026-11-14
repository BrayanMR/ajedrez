import { Aviso } from '../aviso/aviso';
import { Component, DestroyRef, EventEmitter, Output, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FirebaseError } from 'firebase/app';
import { finalize, timer } from 'rxjs';
import { mensajeFirebase } from '../../services/firebase-data';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [Aviso, CommonModule, FormsModule],
  template: `
    <div class="acceso-tarjeta">
      <!-- Header -->
      <h2 class="acceso-titulo">Crea tu cuenta</h2>
      <p class="text-slate-400 text-sm mb-7">Únete y comienza con 1,000 puntos ELO</p>

      <!-- Tabs -->
      <div class="acceso-tabs">
        <button type="button" [disabled]="loading()" (click)="onSwitchTab.emit('login')"
                class="acceso-tab">
          Iniciar Sesión
        </button>
        <button type="button" class="acceso-tab acceso-tab-activa">
          Registrarse
        </button>
      </div>

      @if (errorMsg()) {
        <app-aviso class="mb-4" tipo="error" titulo="Revisa el registro" [mensaje]="errorMsg()" />
      }

      <!-- Form -->
      <form (ngSubmit)="onSubmit()" [attr.aria-busy]="loading()">
        <fieldset [disabled]="loading()" class="min-w-0">
          <!-- Username -->
          <div class="mb-4">
            <label for="registro-nombre" class="block text-[11px] font-bold text-gray-400 tracking-wider mb-2">NOMBRE DE USUARIO</label>
            <input type="text" name="nombre" [(ngModel)]="nombre" required id="registro-nombre" autocomplete="nickname"
                   placeholder="magnus_fischer"
                   class="acceso-campo" />
          </div>

          <!-- Email -->
          <div class="mb-4">
            <label for="registro-correo" class="block text-[11px] font-bold text-gray-400 tracking-wider mb-2">CORREO ELECTRÓNICO</label>
            <input type="email" name="correo" spellcheck="false" autocapitalize="none" [(ngModel)]="correo" required id="registro-correo" autocomplete="email"
                   placeholder="jugador@chess.com"
                   class="acceso-campo" />
          </div>

          <!-- Password -->
          <div class="mb-5">
            <label for="registro-contrasena" class="block text-[11px] font-bold text-gray-400 tracking-wider mb-2">CONTRASEÑA</label>
            <div class="relative">
              <input [type]="mostrarContrasena ? 'text' : 'password'" name="contraseña" [(ngModel)]="contrasena" required minlength="6" id="registro-contrasena" autocomplete="new-password" aria-describedby="registro-requisitos"
                   placeholder="••••••••"
                   class="acceso-campo acceso-campo-clave" />
              <button type="button" (click)="mostrarContrasena = !mostrarContrasena"
                      [attr.aria-label]="mostrarContrasena ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                      aria-controls="registro-contrasena"
                      class="absolute inset-y-0 right-0 px-3 text-sm font-medium text-gray-300 hover:text-white focus-visible:outline-[#d9a01a]">
                {{ mostrarContrasena ? 'Ocultar' : 'Mostrar' }}
              </button>
            </div>
            <p id="registro-requisitos" class="mt-2 text-xs text-gray-400">Usa al menos 6 caracteres.</p>
          </div>

          <div class="mb-5">
            <label for="registro-confirmacion" class="block text-[11px] font-bold text-gray-400 tracking-wider mb-2">CONFIRMA TU CONTRASEÑA</label>
            <input [type]="mostrarContrasena ? 'text' : 'password'" name="confirmacion" [(ngModel)]="confirmacion"
                   required id="registro-confirmacion" autocomplete="new-password"
                   class="acceso-campo" />
          </div>

          <!-- Submit Button -->
          <button type="submit" [disabled]="loading()"
                  class="acceso-boton">
            <span *ngIf="loading()" class="animate-spin rounded-full h-4 w-4 border-2 border-[#0b0e14] border-t-transparent"></span>
            {{ loading() ? 'Creando cuenta…' : 'Crear cuenta' }}
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
export class Registro {
  @Output() onSwitchTab = new EventEmitter<string>();

  @Output() cuentaCreada = new EventEmitter<string>();

  private authService = inject(AuthService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  nombre = '';
  correo = '';
  contrasena = '';
  confirmacion = '';
  readonly errorMsg = signal('');
  readonly loading = signal(false);
  readonly esperaProlongada = signal(false);
  mostrarContrasena = false;

  onSubmit() {
    if (this.loading()) return;

    const correo = this.correo.trim();
    const nombre = this.nombre.trim();
    if (!nombre || !correo || !this.contrasena || !this.confirmacion) {
      this.errorMsg.set('Completa todos los campos.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
      this.errorMsg.set('Escribe un correo electrónico válido.');
      return;
    }

    if (this.contrasena.length < 6) {
      this.errorMsg.set('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (this.contrasena !== this.confirmacion) {
      this.errorMsg.set('Las contraseñas no coinciden.');
      return;
    }

    this.loading.set(true);
    this.errorMsg.set('');

    const aviso = timer(4_000).subscribe(() => this.esperaProlongada.set(true));
    this.authService.registro(nombre, correo, this.contrasena).pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => {
        aviso.unsubscribe();
        this.esperaProlongada.set(false);
        this.loading.set(false);
      })
    ).subscribe({
      next: usuario => {
        if (usuario) this.router.navigate(['/dashboard'], { info: 'registro-completado' });
        else this.cuentaCreada.emit(correo);
      },
      error: (err) => {
        const fallback = err instanceof FirebaseError
          ? `Firebase rechazó el registro (${err.code}).`
          : 'No se pudo crear la cuenta. Inténtalo de nuevo.';
        this.errorMsg.set(mensajeFirebase(err, fallback));
      }
    });
  }
}
