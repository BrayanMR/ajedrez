import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { Login } from '../../components/login/login';
import { Registro } from '../../components/registro/registro';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, Login, Registro],
  template: `
    <main class="acceso retro-pagina">
      <section class="portada">
        <div class="marca">
          <img src="imagenes/logo.png" alt="" width="40" height="40">
          <span>Chess<strong>Rank</strong></span>
        </div>
        <div class="portada-texto">
          <h1 class="retro-titulo">Cada jugada<br><em>cuenta.</em></h1>
          <p>Compite en tiempo real y sube en el ranking ELO.</p>
        </div>
      </section>

      <section class="panel" aria-label="Acceso a ChessRank">
        <div class="marca marca-movil">
          <img src="imagenes/logo.png" alt="" width="40" height="40">
          <span>Chess<strong>Rank</strong></span>
        </div>
        <div class="formulario">
          <app-login *ngIf="activeTab === 'login'" [correo]="correoRegistrado"
            [cuentaCreada]="!!correoRegistrado" (onSwitchTab)="switchTab($event)" />
          <app-registro *ngIf="activeTab === 'registro'" (onSwitchTab)="switchTab($event)"
            (cuentaCreada)="volverAlLogin($event)" />
        </div>
      </section>
    </main>
  `,
  styleUrl: './inicio.css'
})
export class InicioPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  activeTab: 'login' | 'registro' = 'login';

  correoRegistrado = '';

  constructor() {
    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe(params => {
      this.activeTab = params.get('modo') === 'registro' ? 'registro' : 'login';
    });
  }

  volverAlLogin(correo: string) {
    this.correoRegistrado = correo;
    this.activeTab = 'login';
    this.actualizarModo('login');
  }

  switchTab(tab: string) {
    this.correoRegistrado = '';
    this.activeTab = tab as 'login' | 'registro';
    this.actualizarModo(this.activeTab);
  }

  private actualizarModo(modo: 'login' | 'registro') {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { modo },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }
}
