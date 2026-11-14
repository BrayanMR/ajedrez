import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { FirebaseError } from 'firebase/app';
import { Subject } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { Usuario } from '../../models/usuario';
import { Registro } from './registro';

describe('Registro', () => {
  const respuesta = new Subject<Usuario | null>();
  const registrar = vi.fn(() => respuesta.asObservable());
  let registro: Registro;

  beforeEach(() => {
    registrar.mockClear();
    TestBed.configureTestingModule({
      imports: [Registro],
      providers: [provideRouter([]), { provide: AuthService, useValue: { registro: registrar } }]
    });
    registro = TestBed.createComponent(Registro).componentInstance;
    registro.nombre = '  Jugador QA  ';
    registro.correo = '  qa@example.test  ';
    registro.contrasena = registro.confirmacion = 'clave-qa';
  });

  it.each([
    [{ nombre: ' ' }, 'Completa todos los campos.'],
    [{ correo: 'sin-arroba' }, 'Escribe un correo electrónico válido.'],
    [{ contrasena: 'corta', confirmacion: 'corta' }, 'La contraseña debe tener al menos 6 caracteres.'],
    [{ confirmacion: 'otra-clave' }, 'Las contraseñas no coinciden.']
  ])('rechaza datos inválidos antes de llamar a Firebase (%j)', (campos, mensaje) => {
    Object.assign(registro, campos);
    registro.onSubmit();
    expect(registro.errorMsg()).toBe(mensaje);
    expect(registrar).not.toHaveBeenCalled();
  });

  it('evita duplicados y continúa al inicio de sesión si el perfil queda pendiente', () => {
    const alLogin = vi.spyOn(registro.cuentaCreada, 'emit');
    const solicitud = new Subject<Usuario | null>();
    registrar.mockReturnValueOnce(solicitud.asObservable());
    registro.onSubmit();
    registro.onSubmit();

    expect(registrar).toHaveBeenCalledExactlyOnceWith('Jugador QA', 'qa@example.test', 'clave-qa');
    expect(registro.loading()).toBe(true);
    solicitud.next(null);
    solicitud.complete();
    expect(alLogin).toHaveBeenCalledWith('qa@example.test');
    expect(registro.loading()).toBe(false);
  });

  it('muestra el error de correo duplicado y permite reintentar', () => {
    const solicitud = new Subject<Usuario | null>();
    registrar.mockReturnValueOnce(solicitud.asObservable());
    registro.onSubmit();
    solicitud.error(new FirebaseError('auth/email-already-in-use', 'Duplicado'));
    expect(registro.errorMsg()).toBe('El correo ya está registrado.');
    expect(registro.loading()).toBe(false);
  });

  it('abre el tablero cuando Firebase devuelve un perfil completo', () => {
    const navegar = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const solicitud = new Subject<Usuario | null>();
    registrar.mockReturnValueOnce(solicitud.asObservable());
    registro.onSubmit();
    solicitud.next({
      id: 'qa', correo: 'qa@example.test', nombre: 'Jugador QA', elo: 1000,
      partidasGanadas: 0, partidasJugadas: 0, fechaRegistro: '2026-11-13'
    });
    solicitud.complete();
    expect(navegar).toHaveBeenCalledWith(['/dashboard'], { info: 'registro-completado' });
    expect(registro.loading()).toBe(false);
  });
});
