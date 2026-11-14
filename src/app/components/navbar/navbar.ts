import { Component, ElementRef, Injector, afterNextRender, inject, signal, viewChild } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  template: `
    <header class="cabecera" (keydown.escape)="cerrarMenu(true)">
      <nav class="barra" aria-label="Navegación principal">
        <a routerLink="/dashboard" class="marca" (click)="cerrarMenu()">
          <img src="imagenes/logo.png" alt="" width="38" height="38">
          <span>Chess<strong>Rank</strong></span>
        </a>

        <div #menu id="chessrank-menu" class="enlaces" [class.abierto]="menuAbierto()">
          @for (enlace of enlaces; track enlace.ruta) {
            <a [routerLink]="enlace.ruta" routerLinkActive="activo" ariaCurrentWhenActive="page"
               [class.en-partida]="enlace.ruta === '/dashboard' && enPartida()"
               [attr.aria-current]="enlace.ruta === '/dashboard' && enPartida() ? 'location' : null"
               (click)="cerrarMenu(true)">
              <span>{{ enlace.texto }}</span>
              <span class="indicador" aria-hidden="true"></span>
            </a>
          }
        </div>

        <div class="acciones">
          @if (usuario(); as jugador) {
            <a routerLink="/perfil" class="perfil" aria-label="Mi perfil" (click)="cerrarMenu()">
              <span class="avatar">{{ obtenerIniciales(jugador.nombre) }}</span>
              <span class="jugador">
                <span class="nombre">{{ jugador.nombre }}</span>
              </span>
              <span class="elo"><strong>{{ jugador.elo }}</strong> ELO</span>
            </a>
            <button type="button" class="icono salir" (click)="logout()" aria-label="Cerrar sesión" title="Cerrar sesión">
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M10 4H5v16h5m-1-8h11m-4-4 4 4-4 4"/>
              </svg>
            </button>
          }
          <button #botonMenu type="button" class="icono menu" aria-controls="chessrank-menu"
                  [attr.aria-expanded]="menuAbierto()" [attr.aria-label]="menuAbierto() ? 'Cerrar menú' : 'Abrir menú'"
                  (click)="alternarMenu()">
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
              <path [attr.d]="menuAbierto() ? 'M6 6l12 12M18 6 6 18' : 'M4 7h16M4 12h16M4 17h16'"/>
            </svg>
          </button>
        </div>
      </nav>
    </header>
  `,
  styleUrl: './navbar.css'
})
export class Navbar {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly injector = inject(Injector);
  private readonly botonMenu = viewChild<ElementRef<HTMLButtonElement>>('botonMenu');
  private readonly menu = viewChild<ElementRef<HTMLElement>>('menu');

  readonly usuario = this.authService.currentUser;
  readonly menuAbierto = signal(false);
  readonly enPartida = signal(this.router.url.startsWith('/jugador/'));
  readonly enlaces = [
    { ruta: '/dashboard', texto: 'Tablero' },
    { ruta: '/ranking', texto: 'Ranking' },
    { ruta: '/historial', texto: 'Historial' },
    { ruta: '/perfil', texto: 'Perfil' },
    { ruta: '/admin', texto: 'Admin' }
  ];

  constructor() {
    this.router.events.pipe(
      filter(evento => evento instanceof NavigationEnd),
      takeUntilDestroyed()
    ).subscribe(evento => {
      this.enPartida.set(evento.urlAfterRedirects.startsWith('/jugador/'));
      this.cerrarMenu();
    });
  }

  cerrarMenu(devolverFoco = false) {
    if (!this.menuAbierto()) return;
    this.menuAbierto.set(false);
    if (devolverFoco) this.botonMenu()?.nativeElement.focus();
  }

  alternarMenu() {
    if (this.menuAbierto()) {
      this.cerrarMenu();
      return;
    }
    this.menuAbierto.set(true);
    afterNextRender(() => {
      if (this.menuAbierto()) this.menu()?.nativeElement.querySelector('a')?.focus();
    }, { injector: this.injector });
  }

  obtenerIniciales(nombre: string): string {
    const partes = nombre.trim().split(/\s+/);
    if (!partes[0]) return 'U';
    return (partes.length > 1 ? partes[0][0] + partes[1][0] : partes[0].slice(0, 2)).toUpperCase();
  }

  logout() {
    this.cerrarMenu();
    this.authService.logout();
  }
}
