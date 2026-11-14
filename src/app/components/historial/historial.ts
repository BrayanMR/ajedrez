import { ChangeDetectorRef, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Navbar } from '../navbar/navbar';
import { PartidaService } from '../../services/partida.service';
import { AuthService } from '../../services/auth.service';
import { Partida } from '../../models/partida';

@Component({
  selector: 'app-historial',
  standalone: true,
  imports: [CommonModule, RouterLink, Navbar],
  template: `
    <div class="historial-page open-world-sector">
      <!-- Capas de Mundo Abierto Táctico -->
      <div class="map-grid-layer" aria-hidden="true"></div>
      <div class="radar-scanline-layer" aria-hidden="true"></div>
      <div class="tactical-vignette" aria-hidden="true"></div>

      <app-navbar />

      <main class="historial-main">
        <!-- Header de Bitácora Militar -->
        <header class="historial-header">
          <div class="header-info">
            <div class="hud-tag">
              <span class="pulse-dot"></span> REGISTRO OFICIAL DE COMBATE
            </div>
            <h1 class="tactical-title">DIARIO DE INCURSIONES</h1>
            <p class="tactical-subtitle">
              Oficial al mando: <strong>{{ usuario()?.nombre }}</strong> // {{ partidas.length }} misiones registradas en el servidor naval.
            </p>
          </div>

          <!-- Filtros de Batalla Tácticos -->
          <div class="filter-dock" role="tablist" aria-label="Filtro de misiones">
            <button *ngFor="let filter of ['Todas', 'Ganadas', 'Perdidas', 'Empates']" 
                    (click)="cambiarFiltro(filter)"
                    [class.active]="filtroActivo === filter"
                    class="btn-filter">
              {{ filter | uppercase }}
            </button>
          </div>
        </header>

        <!-- Métricas Rápidas de Rendimiento de Flota -->
        <div class="metrics-grid">
          <div class="metric-card win">
            <div class="metric-header">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="metric-ico">
                <polyline points="20 6 9 17 4 12" stroke-width="2.5" stroke-linecap="round"/>
              </svg>
              <span>VICTORIAS TÁCTICAS</span>
            </div>
            <span class="metric-value">{{ countVictorias() }}</span>
            <span class="metric-sub">Sectores Conquistados</span>
          </div>

          <div class="metric-card loss">
            <div class="metric-header">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="metric-ico">
                <line x1="18" y1="6" x2="6" y2="18" stroke-width="2.5" stroke-linecap="round"/>
                <line x1="6" y1="6" x2="18" y2="18" stroke-width="2.5" stroke-linecap="round"/>
              </svg>
              <span>DERROTAS EN COMBATE</span>
            </div>
            <span class="metric-value">{{ countDerrotas() }}</span>
            <span class="metric-sub">Embarcaciones Replegadas</span>
          </div>

          <div class="metric-card draw">
            <div class="metric-header">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="metric-ico">
                <circle cx="12" cy="12" r="9" stroke-width="2"/>
                <line x1="8" y1="12" x2="16" y2="12" stroke-width="2.5" stroke-linecap="round"/>
              </svg>
              <span>TABLAS TÁCTICAS</span>
            </div>
            <span class="metric-value">{{ countEmpates() }}</span>
            <span class="metric-sub">Treguas de Alto el Fuego</span>
          </div>
        </div>

        <!-- Lista de Despliegues de la Bitácora -->
        <section class="log-module">
          <div class="log-module-header">
            <h2>INFORMES DE MISIÓN</h2>
            <span class="module-counter">{{ partidasFiltradas.length }} INFORMES DISPONIBLES</span>
          </div>

          <div class="skirmish-log-list">
            <div *ngFor="let g of partidasFiltradas; trackBy: trackById" class="mission-log-card" [ngClass]="obtenerClaseResultado(g)">
              <div class="mission-accent-bar"></div>

              <div class="mission-details">
                <div class="mission-top-id">
                  <span class="mission-code">OPERACIÓN #{{ g.id ? g.id.slice(0, 8).toUpperCase() : 'SECTOR-X' }}</span>
                  <span class="mission-date">{{ formatearFecha(g.fechaInicio) }}</span>
                </div>

                <div class="mission-combatants">
                  <div class="combatant-side">
                    <span class="fleet-tag white">BLANCAS</span>
                    <strong>{{ g.nombreBlanco || 'Oficial Blanco' }}</strong>
                  </div>
                  <div class="clash-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="ico-vs">
                      <circle cx="12" cy="12" r="8" stroke-width="1.5" stroke-dasharray="2 3"/>
                      <path d="M12 2v20M2 12h20" stroke-width="1"/>
                    </svg>
                  </div>
                  <div class="combatant-side text-right">
                    <span class="fleet-tag dark">NEGRAS</span>
                    <strong>{{ g.nombreNegro || 'Oficial Negro' }}</strong>
                  </div>
                </div>
              </div>

              <div class="mission-status-dock">
                <span class="badge-status" [ngClass]="obtenerBadgeClase(g)">
                  {{ obtenerTextoResultado(g) }}
                </span>
                <span class="elo-impact">{{ obtenerImpactoElo(g) }}</span>
                <a [routerLink]="['/jugador', g.id]" class="btn-inspect-mission" title="Revisar coordenadas">
                  <span>TELEMETRÍA</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="ico-arrow">
                    <path d="M5 12h14m-7-7 7 7-7 7" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                </a>
              </div>
            </div>

            <div *ngIf="partidasFiltradas.length === 0" class="empty-log-state">
              <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" class="empty-sonar-ico">
                <circle cx="24" cy="24" r="20" stroke-width="1.5" stroke-dasharray="3 3"/>
                <path d="M24 8v16l10 6" stroke-width="2" stroke-linecap="round"/>
              </svg>
              <h3>SIN REGISTROS EN ESTE CRITERIO</h3>
              <p>No se han encontrado bitácoras de combate coincidentes con el filtro seleccionado.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  `,
  styles: [`
    :host {
      --titanio-deep: #05070B;
      --acero-panel: #111726;
      --acero-borde: #1C273C;
      --sonar-cyan: #00F0FF;
      --almirante-oro: #FFB703;
      --radar-verde: #00E676;
      --alerta-carmesi: #FF2A5F;
      --texto-principal: #E2E8F0;
      --texto-secundario: #8899AC;
      --texto-atenuado: #4F6178;
      --font-mono: ui-monospace, SFMono-Regular, "Roboto Mono", Menlo, Monaco, Consolas, monospace;
    }

    .historial-page.open-world-sector {
      position: relative;
      min-height: 100dvh;
      background-color: var(--titanio-deep);
      color: var(--texto-principal);
      font-family: system-ui, -apple-system, sans-serif;
      overflow-x: hidden;
    }

    .map-grid-layer {
      position: fixed;
      inset: 0;
      pointer-events: none;
      background-image: 
        linear-gradient(to right, rgba(0, 240, 255, 0.03) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(0, 240, 255, 0.03) 1px, transparent 1px);
      background-size: 55px 55px;
      mask-image: radial-gradient(circle at 50% 25%, black 20%, transparent 80%);
      z-index: 0;
    }

    .radar-scanline-layer {
      position: fixed;
      inset: 0;
      pointer-events: none;
      background: repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.12) 0px, rgba(0, 0, 0, 0.12) 1px, transparent 1px, transparent 3px);
      z-index: 1;
    }

    .tactical-vignette {
      position: fixed;
      inset: 0;
      pointer-events: none;
      background: radial-gradient(circle at 50% 15%, transparent 40%, rgba(3, 5, 8, 0.85) 90%);
      z-index: 2;
    }

    .historial-main {
      position: relative;
      z-index: 10;
      max-width: 80rem;
      margin: 0 auto;
      padding: clamp(1rem, 2.5vw, 2.5rem);
      display: flex;
      flex-direction: column;
      gap: 1.8rem;
    }

    .historial-header {
      background: linear-gradient(135deg, rgba(17, 23, 38, 0.95), rgba(8, 12, 19, 0.98));
      border: 1px solid var(--acero-borde);
      border-radius: 12px;
      padding: clamp(1.4rem, 3.5vw, 2.2rem);
      display: flex;
      flex-direction: column;
      gap: 1.4rem;
      position: relative;
    }

    @media (min-width: 50rem) {
      .historial-header {
        flex-direction: row;
        justify-content: space-between;
        align-items: flex-end;
      }
    }

    .historial-header::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 140px;
      height: 3px;
      background: linear-gradient(90deg, var(--sonar-cyan), transparent);
    }

    .hud-tag {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-family: var(--font-mono);
      font-size: 0.72rem;
      letter-spacing: 0.08em;
      color: var(--sonar-cyan);
      margin-bottom: 0.4rem;
    }

    .pulse-dot {
      width: 8px;
      height: 8px;
      background-color: var(--sonar-cyan);
      border-radius: 50%;
      box-shadow: 0 0 10px var(--sonar-cyan);
    }

    .tactical-title {
      font-size: clamp(1.8rem, 4vw, 2.6rem);
      font-weight: 850;
      letter-spacing: -0.02em;
      margin: 0 0 0.35rem;
      color: #FFFFFF;
    }

    .tactical-subtitle {
      font-size: 0.88rem;
      color: var(--texto-secundario);
      margin: 0;
    }
    .tactical-subtitle strong { color: var(--almirante-oro); }

    .filter-dock {
      display: flex;
      background: rgba(10, 14, 23, 0.7);
      border: 1px solid var(--acero-borde);
      border-radius: 8px;
      padding: 0.3rem;
      gap: 0.3rem;
    }

    .btn-filter {
      background: transparent;
      border: none;
      color: var(--texto-secundario);
      padding: 0.45rem 1rem;
      border-radius: 6px;
      font-family: var(--font-mono);
      font-size: 0.72rem;
      font-weight: 750;
      letter-spacing: 0.06em;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-filter.active {
      background: var(--almirante-oro);
      color: #05070B;
      box-shadow: 0 0 15px rgba(255, 183, 3, 0.3);
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 1.2rem;
    }

    .metric-card {
      background: var(--acero-panel);
      border: 1px solid var(--acero-borde);
      border-radius: 10px;
      padding: 1.2rem;
      display: flex;
      flex-direction: column;
    }

    .metric-card.win { border-color: rgba(0, 230, 118, 0.3); }
    .metric-card.loss { border-color: rgba(255, 42, 95, 0.3); }
    .metric-card.draw { border-color: rgba(0, 240, 255, 0.3); }

    .metric-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-family: var(--font-mono);
      font-size: 0.68rem;
      letter-spacing: 0.06em;
      color: var(--texto-secundario);
    }

    .metric-ico { width: 16px; height: 16px; }
    .metric-card.win .metric-ico { color: var(--radar-verde); }
    .metric-card.loss .metric-ico { color: var(--alerta-carmesi); }
    .metric-card.draw .metric-ico { color: var(--sonar-cyan); }

    .metric-value {
      font-family: var(--font-mono);
      font-size: clamp(1.6rem, 3vw, 2.4rem);
      font-weight: 850;
      margin: 0.3rem 0;
      line-height: 1.1;
    }
    .metric-card.win .metric-value { color: var(--radar-verde); }
    .metric-card.loss .metric-value { color: var(--alerta-carmesi); }
    .metric-card.draw .metric-value { color: var(--sonar-cyan); }

    .metric-sub {
      font-size: 0.72rem;
      color: var(--texto-atenuado);
    }

    .log-module {
      background: var(--acero-panel);
      border: 1px solid var(--acero-borde);
      border-radius: 12px;
      padding: 1.4rem;
      box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.5);
    }

    .log-module-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      padding-bottom: 0.8rem;
      margin-bottom: 1.2rem;
    }

    .log-module-header h2 {
      font-size: 1.05rem;
      font-weight: 800;
      letter-spacing: 0.04em;
      margin: 0;
    }

    .module-counter {
      font-family: var(--font-mono);
      font-size: 0.7rem;
      color: var(--texto-atenuado);
    }

    .skirmish-log-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .mission-log-card {
      position: relative;
      background: linear-gradient(135deg, rgba(14, 20, 32, 0.85), rgba(9, 13, 21, 0.95));
      border: 1px solid var(--acero-borde);
      border-radius: 8px;
      padding: 1rem 1.3rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      overflow: hidden;
      transition: all 0.2s ease;
    }

    @media (min-width: 50rem) {
      .mission-log-card {
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
      }
    }

    .mission-log-card:hover {
      border-color: var(--sonar-cyan);
      transform: translateY(-2px);
    }

    .mission-accent-bar {
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      width: 4px;
      background: var(--acero-borde);
    }

    .mission-log-card.res-win .mission-accent-bar { background: var(--radar-verde); }
    .mission-log-card.res-loss .mission-accent-bar { background: var(--alerta-carmesi); }
    .mission-log-card.res-draw .mission-accent-bar { background: var(--almirante-oro); }

    .mission-details {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      flex: 1;
    }

    .mission-top-id {
      display: flex;
      align-items: center;
      gap: 1rem;
      font-family: var(--font-mono);
      font-size: 0.68rem;
    }

    .mission-code { color: var(--sonar-cyan); font-weight: 750; }
    .mission-date { color: var(--texto-atenuado); }

    .mission-combatants {
      display: flex;
      align-items: center;
      gap: 1.2rem;
    }

    .combatant-side {
      display: flex;
      flex-direction: column;
    }
    .combatant-side.text-right { text-align: right; }

    .fleet-tag {
      font-family: var(--font-mono);
      font-size: 0.6rem;
      letter-spacing: 0.08em;
      color: var(--texto-atenuado);
    }

    .combatant-side strong {
      font-size: 0.95rem;
      color: #FFFFFF;
    }

    .clash-icon {
      width: 24px;
      height: 24px;
      color: var(--texto-atenuado);
    }

    .mission-status-dock {
      display: flex;
      align-items: center;
      gap: 1.2rem;
    }

    .badge-status {
      font-family: var(--font-mono);
      font-size: 0.72rem;
      font-weight: 850;
      letter-spacing: 0.06em;
      padding: 0.25rem 0.65rem;
      border-radius: 4px;
    }

    .badge-status.win { background: rgba(0, 230, 118, 0.15); color: var(--radar-verde); }
    .badge-status.loss { background: rgba(255, 42, 95, 0.15); color: var(--alerta-carmesi); }
    .badge-status.draw { background: rgba(255, 183, 3, 0.15); color: var(--almirante-oro); }

    .elo-impact {
      font-family: var(--font-mono);
      font-size: 0.85rem;
      font-weight: 800;
      color: var(--texto-principal);
    }

    .btn-inspect-mission {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid var(--acero-borde);
      color: var(--texto-secundario);
      padding: 0.45rem 0.85rem;
      border-radius: 6px;
      font-family: var(--font-mono);
      font-size: 0.7rem;
      font-weight: 750;
      text-decoration: none;
      transition: all 0.2s ease;
    }

    .btn-inspect-mission:hover {
      background: var(--sonar-cyan);
      color: #05070B;
      border-color: var(--sonar-cyan);
    }

    .ico-arrow { width: 14px; height: 14px; }

    .empty-log-state {
      text-align: center;
      padding: 3rem;
      border: 1px dashed var(--acero-borde);
      border-radius: 8px;
    }

    .empty-sonar-ico {
      width: 48px;
      height: 48px;
      color: var(--texto-atenuado);
      margin-bottom: 0.8rem;
    }

    .empty-log-state h3 {
      font-family: var(--font-mono);
      font-size: 0.95rem;
      color: #FFFFFF;
      margin-bottom: 0.4rem;
    }

    .empty-log-state p {
      font-size: 0.8rem;
      color: var(--texto-secundario);
    }
  `]
})
export class Historial implements OnInit {
  private partidaService = inject(PartidaService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  usuario = this.authService.currentUser;
  partidas: Partida[] = [];
  partidasFiltradas: Partida[] = [];
  filtroActivo: string = 'Todas';

  ngOnInit() {
    this.cargarHistorial();
  }

  cargarHistorial() {
    this.partidaService.listarHistorialUsuario().subscribe({
      next: (partidas) => {
        this.partidas = partidas;
        this.aplicarFiltro();
        this.cdr.markForCheck();
      },
      error: console.error
    });
  }

  cambiarFiltro(filtro: string) {
    this.filtroActivo = filtro;
    this.aplicarFiltro();
  }

  aplicarFiltro() {
    const miId = this.usuario()?.id;
    if (this.filtroActivo === 'Todas') {
      this.partidasFiltradas = this.partidas;
    } else if (this.filtroActivo === 'Ganadas') {
      this.partidasFiltradas = this.partidas.filter(p => p.ganador === miId);
    } else if (this.filtroActivo === 'Perdidas') {
      this.partidasFiltradas = this.partidas.filter(p => p.ganador && p.ganador !== miId && p.estado !== 'empate');
    } else if (this.filtroActivo === 'Empates') {
      this.partidasFiltradas = this.partidas.filter(p => p.estado === 'empate');
    }
  }

  countVictorias(): number {
    const miId = this.usuario()?.id;
    return this.partidas.filter(p => p.ganador === miId).length;
  }

  countDerrotas(): number {
    const miId = this.usuario()?.id;
    return this.partidas.filter(p => p.ganador && p.ganador !== miId && p.estado !== 'empate').length;
  }

  countEmpates(): number {
    return this.partidas.filter(p => p.estado === 'empate').length;
  }

  obtenerClaseResultado(p: Partida): string {
    const miId = this.usuario()?.id;
    if (p.estado === 'empate') return 'res-draw';
    if (p.ganador === miId) return 'res-win';
    return 'res-loss';
  }

  obtenerBadgeClase(p: Partida): string {
    const miId = this.usuario()?.id;
    if (p.estado === 'empate') return 'draw';
    if (p.ganador === miId) return 'win';
    return 'loss';
  }

  obtenerTextoResultado(p: Partida): string {
    const miId = this.usuario()?.id;
    if (p.estado === 'empate') return 'TABLAS';
    if (p.ganador === miId) return 'VICTORIA';
    return 'DERROTA';
  }

  obtenerImpactoElo(p: Partida): string {
    const miId = this.usuario()?.id;
    if (p.estado === 'empate') return '+5 ELO';
    if (p.ganador === miId) return '+20 ELO';
    return '-10 ELO';
  }

  formatearFecha(fecha: any): string {
    if (!fecha) return 'RECIENTE';
    const d = fecha.toDate ? fecha.toDate() : new Date(fecha);
    return isNaN(d.getTime()) ? 'FECHA N/D' : d.toLocaleDateString();
  }

  trackById(_: number, item: Partida): string {
    return item.id;
  }
}
