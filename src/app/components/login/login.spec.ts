import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { FirebaseError } from 'firebase/app';
import { defer } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { Login } from './login';

describe('Login con Firebase', () => {
  const casos = [
    ['auth/user-not-found', 'No existe una cuenta registrada con este correo.'],
    ['auth/wrong-password', 'La contraseña es incorrecta.'],
    ['auth/invalid-credential', 'Correo o contraseña incorrectos.']
  ];

  for (const [codigo, mensaje] of casos) {
    it('muestra el mensaje y permite reintentar después de ' + codigo, async () => {
      let rechazar!: (error: FirebaseError) => void;
      const login = () => defer(() => new Promise<never>((_, reject) => {
        rechazar = reject;
      }));
      await TestBed.configureTestingModule({
        imports: [Login],
        providers: [
          provideZonelessChangeDetection(),
          provideRouter([]),
          { provide: AuthService, useValue: { login } }
        ]
      }).compileComponents();

      const fixture = TestBed.createComponent(Login);
      fixture.componentInstance.correo = 'qa@example.test';
      fixture.componentInstance.contrasena = 'prueba-qa';
      await fixture.whenStable();

      const formulario = fixture.nativeElement.querySelector('form') as HTMLFormElement;
      const boton = formulario.querySelector('button[type=submit]') as HTMLButtonElement;
      formulario.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      await fixture.whenStable();
      expect(boton.disabled).toBe(true);

      rechazar(new FirebaseError(codigo, 'Respuesta simulada de Firebase'));
      await Promise.resolve();
      await fixture.whenStable();
      expect(fixture.nativeElement.querySelector('[role=alert] p:last-child')?.textContent.trim()).toBe(mensaje);
      expect(boton.disabled).toBe(false);
    });
  }
});
