import { Aviso } from '../aviso/aviso';
import { mensajeFirebase } from '../../services/firebase-data';
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Navbar } from '../navbar/navbar';
import { UsuarioService } from '../../services/usuario.service';
import { AuthService } from '../../services/auth.service';
import { Usuario } from '../../models/usuario';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [Aviso, CommonModule, FormsModule, Navbar],
  template: `
    <div class="perfil-page open-world-sector">
      <!-- Capas de Mundo Abierto Táctico -->
      <div class="map-grid-layer" aria-hidden="true"></div>
      <div class="radar-scanline-layer" aria-hidden="true"></div>
      <div class="tactical-vignette" aria-hidden="true"></div>

      <app-navbar />

      <main class="perfil-main">
        <!-- Header de Expediente de Mando -->
        <header class="perfil-header">
          <div class="header-info">
            <div class="hud-tag">
              <span class="pulse-dot"></span> EXPEDIENTE DE MANDO CLASIFICADO
            </div>
            <h1 class="tactical-title">PERFIL DEL COMANDANTE</h1>
            <p class="tactical-subtitle">
              Configuración de insignia, rango de servicio y credenciales de acceso a la flota.
            </p>
          </div>
        </header>

        <div class="perfil-grid">
          <!-- Columna Izquierda: Tarjeta de Oficial de Flota -->
          <div class="tactical-module commander-dossier">
            <div class="avatar-crest-container">
              <div class="naval-avatar-crest">
                <span>{{ obtenerIniciales() }}</span>
              </div>
              <div class="crest-status-ping"></div>
            </div>

            <div class="dossier-identity">
              <h2>{{ usuario()?.nombre }}</h2>
              <span class="rank-tag">{{ obtenerNivel() }}</span>
            </div>

            <!-- Telemetría de Servicio -->
            <div class="dossier-telemetry-list">
              <div class="telemetry-item">
                <span class="lbl">ID / CORREO</span>
                <span class="val text-truncate">{{ usuario()?.correo }}</span>
              </div>
              <div class="telemetry-item">
                <span class="lbl">CALIBRE ELO</span>
                <span class="val gold">{{ usuario()?.elo }} PTS</span>
              </div>
              <div class="telemetry-item">
                <span class="lbl">INCURSIONES</span>
                <span class="val">{{ usuario()?.partidasJugadas }} TOTAL</span>
              </div>
              <div class="telemetry-item">
                <span class="lbl">VICTORIAS TÁCTICAS</span>
                <span class="val green">{{ usuario()?.partidasGanadas }}</span>
              </div>
              <div class="telemetry-item">
                <span class="lbl">FECHA DE ALISTAMIENTO</span>
                <span class="val">{{ formatearFecha(usuario()?.fechaRegistro) }}</span>
              </div>
            </div>
          </div>

          <!-- Columna Derecha: Configuración de Credenciales Tácticas -->
          <div class="tactical-module configuration-sector">
            <div class="module-title-bar">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="module-ico">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke-width="2" stroke-linecap="round"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <h3>ACTUALIZAR IDENTIFICACIÓN DE COMBATE</h3>
            </div>

            @if (mensaje) {
              <app-aviso [tipo]="tipoMensaje" [titulo]="tipoMensaje === 'exito' ? 'Parámetros guardados' : 'Alerta táctica'" [mensaje]="mensaje" />
            }

            <form (ngSubmit)="guardarCambios()" class="tactical-form">
              <div class="form-field">
                <label for="nombre">CALLSIGN / NOMBRE CLAVE</label>
                <div class="input-frame">
                  <input type="text" id="nombre" name="nombre" [(ngModel)]="nombre" required placeholder="Nombre de comandante" />
                </div>
              </div>

              <div class="form-actions">
                <button type="submit" [disabled]="guardando" class="btn-tactical-save">
                  <span>{{ guardando ? 'TRANSMITIENDO A LA FLOTA…' : 'GUARDAR IDENTIFICACIÓN' }}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
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

    .perfil-page.open-world-sector {
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

    .perfil-main {
      position: relative;
      z-index: 10;
      max-width: 80rem;
      margin: 0 auto;
      padding: clamp(1rem, 2.5vw, 2.5rem);
      display: flex;
      flex-direction: column;
      gap: 1.8rem;
    }

    .perfil-header {
      background: linear-gradient(135deg, rgba(17, 23, 38, 0.95), rgba(8, 12, 19, 0.98));
      border: 1px solid var(--acero-borde);
      border-radius: 12px;
      padding: clamp(1.4rem, 3.5vw, 2.2rem);
      position: relative;
    }

    .perfil-header::before {
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

    .perfil-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }

    @media (min-width: 55rem) {
      .perfil-grid {
        grid-template-columns: minmax(0, 1fr) minmax(0, 1.8fr);
      }
    }

    .tactical-module {
      background: var(--acero-panel);
      border: 1px solid var(--acero-borde);
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.5);
    }

    .commander-dossier {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 1.2rem;
    }

    .avatar-crest-container {
      position: relative;
    }

    .naval-avatar-crest {
      width: 88px;
      height: 88px;
      border-radius: 16px;
      background: linear-gradient(135deg, rgba(255, 183, 3, 0.2), rgba(0, 240, 255, 0.15));
      border: 2px solid var(--almirante-oro);
      box-shadow: 0 0 25px rgba(255, 183, 3, 0.25);
      display: grid;
      place-items: center;
      font-family: var(--font-mono);
      font-size: 2.2rem;
      font-weight: 900;
      color: var(--almirante-oro);
      clip-path: polygon(15% 0, 85% 0, 100% 15%, 100% 85%, 85% 100%, 15% 100%, 0 85%, 0 15%);
    }

    .crest-status-ping {
      position: absolute;
      bottom: 2px;
      right: 2px;
      width: 14px;
      height: 14px;
      background-color: var(--radar-verde);
      border: 2px solid var(--titanio-deep);
      border-radius: 50%;
      box-shadow: 0 0 10px var(--radar-verde);
    }

    .dossier-identity h2 {
      font-size: 1.4rem;
      font-weight: 850;
      color: #FFFFFF;
      margin: 0 0 0.3rem;
    }

    .rank-tag {
      display: inline-block;
      font-family: var(--font-mono);
      font-size: 0.72rem;
      font-weight: 750;
      color: var(--almirante-oro);
      background: rgba(255, 183, 3, 0.12);
      border: 1px solid rgba(255, 183, 3, 0.3);
      padding: 0.2rem 0.6rem;
      border-radius: 4px;
    }

    .dossier-telemetry-list {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      padding-top: 1.2rem;
      text-align: left;
    }

    .telemetry-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.8rem;
    }

    .telemetry-item .lbl {
      font-family: var(--font-mono);
      font-size: 0.68rem;
      color: var(--texto-atenuado);
      letter-spacing: 0.05em;
    }

    .telemetry-item .val {
      font-family: var(--font-mono);
      font-weight: 750;
      color: var(--texto-principal);
    }
    .telemetry-item .val.gold { color: var(--almirante-oro); }
    .telemetry-item .val.green { color: var(--radar-verde); }

    .module-title-bar {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
      padding-bottom: 0.8rem;
      margin-bottom: 1.4rem;
    }

    .module-ico { width: 20px; height: 20px; color: var(--sonar-cyan); }

    .module-title-bar h3 {
      font-family: var(--font-mono);
      font-size: 0.85rem;
      font-weight: 800;
      letter-spacing: 0.06em;
      color: #FFFFFF;
      margin: 0;
    }

    .tactical-form {
      display: flex;
      flex-direction: column;
      gap: 1.4rem;
    }

    .form-field label {
      display: block;
      font-family: var(--font-mono);
      font-size: 0.68rem;
      letter-spacing: 0.08em;
      color: var(--sonar-cyan);
      margin-bottom: 0.4rem;
    }

    .input-frame input {
      width: 100%;
      background: rgba(10, 14, 23, 0.8);
      border: 1px solid var(--acero-borde);
      border-radius: 6px;
      color: #FFFFFF;
      padding: 0.8rem 1rem;
      font-size: 0.95rem;
      font-family: inherit;
      outline: none;
      transition: all 0.2s ease;
    }

    .input-frame input:focus {
      border-color: var(--sonar-cyan);
      box-shadow: 0 0 15px rgba(0, 240, 255, 0.2);
    }

    .btn-tactical-save {
      background: var(--sonar-cyan);
      color: #05070B;
      border: none;
      padding: 0.85rem 1.6rem;
      border-radius: 6px;
      font-family: var(--font-mono);
      font-size: 0.78rem;
      font-weight: 850;
      letter-spacing: 0.06em;
      cursor: pointer;
      box-shadow: 0 0 20px rgba(0, 240, 255, 0.25);
      transition: all 0.2s ease;
    }

    .btn-tactical-save:hover:enabled {
      filter: brightness(1.1);
      transform: translateY(-1px);
      box-shadow: 0 0 30px rgba(0, 240, 255, 0.45);
    }

    .btn-tactical-save:disabled {
      opacity: 0.6;
      cursor: wait;
    }
  `]
})
export class PerfilComponent implements OnInit {
  private usuarioService = inject(UsuarioService);
  private authService = inject(AuthService);

  usuario = this.authService.currentUser;
  nombre: string = '';
  guardando: boolean = false;
  mensaje: string = '';
  tipoMensaje: 'exito' | 'error' = 'exito';

  ngOnInit() {
    this.nombre = this.usuario()?.nombre || '';
  }

  obtenerIniciales(): string {
    const nombre = this.usuario()?.nombre || 'C';
    return nombre.substring(0, 2).toUpperCase();
  }

  obtenerNivel(): string {
    const elo = this.usuario()?.elo || 1000;
    if (elo >= 2000) return 'Gran Almirante';
    if (elo >= 1700) return 'Comandante de Escuadrón';
    if (elo >= 1400) return 'Capitán de Artillería';
    if (elo >= 1100) return 'Oficial Táctico';
    return 'Cadete de Maniobras';
  }

  formatearFecha(fecha: any): string {
    if (!fecha) return 'RECIENTE';
    const d = fecha.toDate ? fecha.toDate() : new Date(fecha);
    return isNaN(d.getTime()) ? 'FECHA N/D' : d.toLocaleDateString();
  }

  guardarCambios() {
    if (!this.nombre.trim()) return;
    this.guardando = true;
    this.mensaje = '';

    this.usuarioService.actualizarPerfil(this.nombre).subscribe({
      next: () => {
        this.guardando = false;
        this.tipoMensaje = 'exito';
        this.mensaje = 'Credenciales y Callsign de combate actualizados con éxito.';
      },
      error: (err) => {
        this.guardando = false;
        this.tipoMensaje = 'error';
        this.mensaje = mensajeFirebase(err, 'No se pudo actualizar el perfil.');
      }
    });
  }
}
