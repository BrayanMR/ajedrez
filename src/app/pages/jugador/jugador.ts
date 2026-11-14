import { Component, OnInit, OnDestroy, inject, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Navbar } from '../../components/navbar/navbar';
import { Tablero } from '../../components/tablero/tablero';
import { PartidaService } from '../../services/partida.service';
import { MovimientoService } from '../../services/movimiento.service';
import { AuthService } from '../../services/auth.service';
import { PartidaEnVivoService } from '../../services/partida-en-vivo.service';
import { UsuarioService } from '../../services/usuario.service';
import { Partida } from '../../models/partida';
import { Movimiento } from '../../models/movimiento';
import { Chess } from 'chess.js';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-jugador',
  standalone: true,
  imports: [CommonModule, RouterLink, Navbar, Tablero],
  template: `
    <div class="retro-pagina flex flex-col">
      <!-- Header -->
      <app-navbar></app-navbar>

      <!-- Floating Turn Alert -->
      <div *ngIf="mostrarAlertaTurno()" 
           class="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-[#f7c77e] text-[#0b0e14] px-6 py-3 rounded-full font-black text-xs uppercase tracking-widest shadow-2xl animate-bounce select-none pointer-events-none flex items-center gap-2 border border-amber-600/40">
        👑 ¡Es tu turno de jugar!
      </div>

      <!-- Main Game Area -->
      <main class="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <header class="retro-portada lg:col-span-3">
          <h1 class="retro-titulo">Partida</h1>
        </header>
        
        <!-- Left Side: Chess Board (cols 2 on large) -->
        <div class="lg:col-span-2 flex flex-col gap-3 items-center w-full">
          
          <!-- Opponent Player Info Header -->
          <div class="w-full max-w-[480px] retro-panel p-3 flex items-center justify-between shadow-md select-none">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-full bg-[#f43f5e]/20 text-[#f43f5e] border border-gray-800 flex items-center justify-center font-bold text-xs">
                {{ obtenerOponenteIniciales() }}
              </div>
              <div class="text-left">
                <span class="text-sm font-bold text-white block">{{ obtenerOponenteNombre() }}</span>
                <span class="text-[10px] text-gray-400 font-medium">
                  {{ obtenerOponenteElo() }} pts &bull; Piezas {{ miColor === 'w' ? 'Negras' : 'Blancas' }}
                </span>
              </div>
            </div>

            <!-- Turn Badge -->
            <span *ngIf="!esMiTurno() && partida?.estado === 'jugando'" class="bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full select-none">
              Su turno
            </span>
          </div>

          <!-- The Board -->
          @if (estadoJaque) {
            <p role="status" class="rounded-lg border border-rose-400/40 bg-rose-950/40 px-4 py-2 text-sm font-bold text-rose-200">
              {{ estadoJaque }}
            </p>
          }
          <app-tablero [fen]="fen"
                       [miColor]="miColor"
                       [esMiTurno]="esMiTurno() && partida?.estado === 'jugando'"
                       [ultimoMovimiento]="obtenerUltimoMovimiento()"
                       (onMove)="realizarMovimiento($event)">
          </app-tablero>

          <!-- Local Player Info Footer -->
          <div class="w-full max-w-[480px] retro-panel p-3 flex items-center justify-between shadow-md select-none">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-full bg-[#f7c77e] text-[#0b0e14] flex items-center justify-center font-bold text-xs">
                {{ miNombre().substring(0, 2).toUpperCase() }}
              </div>
              <div class="text-left">
                <span class="text-sm font-bold text-white block">{{ miNombre() }} (Tú)</span>
                <span class="text-[10px] text-gray-400 font-medium">
                  {{ miElo() }} pts &bull; Piezas {{ miColor === 'w' ? 'Blancas' : 'Negras' }}
                </span>
              </div>
            </div>

            <!-- Turn Badge -->
            <span *ngIf="esMiTurno() && partida?.estado === 'jugando'" class="bg-green-500/10 text-green-500 border border-green-500/20 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full select-none">
              Tu turno
            </span>
          </div>

        </div>

        <!-- Right Side: Game details & Actions -->
        <div class="flex flex-col gap-4 w-full">
          
          <!-- Card 1: Match Status -->
          <div class="retro-panel p-5 shadow">
            <h3 class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Partida en curso</h3>
            <div class="flex flex-col gap-3">
              <!-- White Player Info -->
              <div class="flex items-center justify-between border-b border-gray-800/40 pb-2">
                <div class="flex items-center gap-2">
                  <span class="text-sm text-white font-semibold">♔ Blancas</span>
                </div>
                <div class="text-right">
                  <span class="text-sm font-bold block">{{ partida?.nombreBlanco || 'Esperando...' }}</span>
                  <span class="text-[10px] text-[#f7c77e]">{{ partida?.eloBlanco || '---' }} ELO</span>
                </div>
              </div>

              <!-- Black Player Info -->
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="text-sm text-gray-400 font-semibold">♚ Negras</span>
                </div>
                <div class="text-right">
                  <span class="text-sm font-bold block">{{ partida?.nombreNegro || 'Esperando...' }}</span>
                  <span class="text-[10px] text-[#f7c77e]">{{ partida?.eloNegro || '---' }} ELO</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Card 2: Move Logs -->
          <div class="retro-panel p-5 shadow flex-1 min-h-[300px] flex flex-col justify-between">
            <div>
              <h3 class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Registro de Movimientos</h3>
              
              <div class="overflow-y-auto max-h-[220px] pr-2 flex flex-col gap-1.5 text-sm">
                <div *ngIf="movimientosAgrupados.length === 0" class="text-center py-8 text-gray-500 select-none">
                  No se han registrado movimientos.
                </div>
                
                <!-- Moves Table -->
                <div *ngFor="let m of movimientosAgrupados" class="grid grid-cols-3 py-1 border-b border-gray-800/20 text-gray-300">
                  <span class="font-bold text-gray-500">{{ m.numero }}.</span>
                  <span>{{ m.blanco }}</span>
                  <span class="text-gray-400">{{ m.negro }}</span>
                </div>
              </div>
            </div>

            <!-- Card Actions -->
            <div class="flex items-center gap-3 mt-6 border-t border-gray-800/40 pt-4" *ngIf="partida?.estado === 'jugando'">
              <button (click)="proponerTablas()" 
                      class="flex-1 border border-gray-800 hover:bg-[#1a202c] text-white py-3 rounded-xl font-bold text-sm transition cursor-pointer select-none">
                Empate (+5)
              </button>
              <button (click)="rendirse()" 
                      class="flex-1 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-500 py-3 rounded-xl font-bold text-sm transition cursor-pointer select-none">
                Rendirse (-10)
              </button>
            </div>
          </div>

        </div>

      </main>

      <!-- Game Over Modal overlay -->
      <div *ngIf="!revisandoTablero && (partida?.estado === 'terminada' || partida?.estado === 'empate')" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-[#000]/80 backdrop-blur-xs"></div>

        <!-- Modal Card -->
        <div class="resultado-partida retro-panel w-full max-w-sm p-6 shadow-2xl relative z-10 text-center flex flex-col items-center gap-4">
          
          <!-- Trophy symbol -->
          <div class="w-16 h-16 rounded-full bg-[#f7c77e]/10 text-[#f7c77e] flex items-center justify-center text-3xl mb-2">
            🏆
          </div>

          <h3 class="retro-titulo">{{ estadoJaque === 'Jaque mate' ? estadoJaque : 'Partida finalizada' }}</h3>
          
          <p class="text-sm text-gray-300">
            {{ obtenerMensajeResultado() }}
          </p>

          <div class="flex flex-col gap-2 w-full mt-4">
            <button type="button" class="rounded-xl border border-white/20 py-3 font-semibold text-white"
                    (click)="revisandoTablero = true">Ver posición final</button>
            <a routerLink="/dashboard" 
               class="bg-[#f7c77e] hover:bg-[#ffdaa0] text-[#0b0e14] py-3.5 rounded-xl font-bold text-sm transition shadow cursor-pointer select-none">
              Volver al Dashboard
            </a>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: `
    @media (prefers-reduced-motion: no-preference) {
      .resultado-partida { animation: aparecer-resultado .28s ease-out both; }
      @keyframes aparecer-resultado {
        from { opacity: 0; transform: translateY(12px) scale(.97); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }
    }
  `
})
export class JugadorPage implements OnInit, OnDestroy {
  revisandoTablero = false;
  estadoJaque: 'Jaque' | 'Jaque mate' | null = null;
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);
  private partidaService = inject(PartidaService);
  private movimientoService = inject(MovimientoService);
  private partidaEnVivo = inject(PartidaEnVivoService);
  private cdr = inject(ChangeDetectorRef);
  private usuarioService = inject(UsuarioService);

  usuario = this.authService.currentUser;
  
  partidaId = '';
  partida: Partida | null = null;
  movimientos: Movimiento[] = [];
  movimientosAgrupados: { numero: number; blanco: string; negro: string }[] = [];
  fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  miColor: 'w' | 'b' = 'w';
  mostrarAlertaTurno = signal(false);

  // Chess.js instance locally to reconstruct notations and validate FEN
  private chessLocal = new Chess();
  private subscriptions: Subscription[] = [];

  ngOnInit() {
    this.partidaId = this.route.snapshot.paramMap.get('id') || '';
    if (!this.partidaId) {
      this.router.navigate(['/dashboard']);
      return;
    }

    this.iniciarPartida();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  iniciarPartida() {
    this.subscriptions.push(
      this.partidaEnVivo.observarPartida(this.partidaId).subscribe({
        next: actualizada => {
          const estadoAnterior = this.partida?.estado;
          const finalizada = this.partida?.estado === 'jugando'
            && (actualizada.estado === 'terminada' || actualizada.estado === 'empate');
          this.partida = actualizada;
          this.configurarColor();
          if (estadoAnterior !== 'jugando' && actualizada.estado === 'jugando' && this.movimientos.length) {
            this.reconstruirJuego();
          }
          if (finalizada) this.usuarioService.obtenerPerfil().subscribe({ error: console.error });
          this.cdr.detectChanges();
        },
        error: () => this.router.navigate(['/dashboard'])
      }),
      this.movimientoService.observarMovimientos(this.partidaId).subscribe({
        next: movimientos => {
          this.movimientos = movimientos;
          this.reconstruirJuego();
          this.cdr.detectChanges();
        },
        error: console.error
      })
    );
  }

  configurarColor() {
    if (this.partida) {
      const miId = this.usuario()?.id;
      if (this.partida.jugadorBlanco === miId) {
        this.miColor = 'w';
      } else {
        this.miColor = 'b';
      }
    }
  }

  detenerPolling() {
    // Polling removido, método se mantiene vacío para no romper referencias de finalización
  }

  cargarMovimientosYReconstruir() {
    this.movimientoService.obtenerMovimientosPartida(this.partidaId).subscribe({
      next: (movs) => {
        // Solo actualizar si la longitud es distinta (nuevos movimientos)
        if (movs.length !== this.movimientos.length) {
          this.movimientos = movs;
          this.reconstruirJuego();
        }
      }
    });
  }

  reconstruirJuego() {
    const oldFen = this.fen;
    this.chessLocal.reset();
    const agrupados: { numero: number; blanco: string; negro: string }[] = [];
    let successfulMoveIndex = 0;

    for (let i = 0; i < this.movimientos.length; i++) {
      const m = this.movimientos[i];
      try {
        const result = this.chessLocal.move({ from: m.origen, to: m.destino });
        
        // Agrupar jugadas de forma segura basándonos en los movimientos aplicados exitosamente
        const indiceAgrupado = Math.floor(successfulMoveIndex / 2);
        if (successfulMoveIndex % 2 === 0) {
          agrupados.push({
            numero: indiceAgrupado + 1,
            blanco: result.san,
            negro: ''
          });
        } else {
          agrupados[indiceAgrupado].negro = result.san;
        }
        successfulMoveIndex++;
      } catch (e) {
        console.error('Error al aplicar movimiento en local:', m, e);
      }
    }

    this.movimientosAgrupados = agrupados;
    this.fen = this.chessLocal.fen();
    this.estadoJaque = this.chessLocal.isCheckmate() ? 'Jaque mate' : this.chessLocal.isCheck() ? 'Jaque' : null;

    // Si el FEN cambió, significa que hubo un movimiento nuevo
    if (oldFen !== this.fen) {
      if (this.esMiTurno() && this.partida?.estado === 'jugando') {
        this.mostrarAlertaTurno.set(true);
        this.reproducirSonido('turno');
        setTimeout(() => {
          this.mostrarAlertaTurno.set(false);
          this.cdr.detectChanges();
        }, 3500);
      } else {
        this.reproducirSonido('movimiento');
      }
    }

    // Auto-detectar fin de juego si soy el jugador activo
    if (this.partida?.estado === 'jugando' && this.esMiTurno()) {
      if (this.chessLocal.isGameOver()) {
        this.manejarFinJuegoAutomatico();
      }
    }
  }

  reproducirSonido(tipo: 'movimiento' | 'turno') {
    const audio = new Audio();
    if (tipo === 'movimiento') {
      audio.src = 'https://assets.mixkit.co/active_storage/sfx/2568/2568-84.wav'; // Madera click
    } else {
      audio.src = 'https://assets.mixkit.co/active_storage/sfx/911/911-84.wav'; // Campanada
    }
    audio.play().catch(() => {});
  }

  manejarFinJuegoAutomatico() {
    this.detenerPolling();
    
    if (this.chessLocal.isCheckmate()) {
      // El jugador contrario que acaba de mover ganó, o sea, yo perdí.
      const ganadorId = this.obtenerOponenteId();
      this.partidaService.finalizarPartida(this.partidaId, 'terminada', ganadorId).subscribe({
        next: (res) => {
          this.partida = res.partida;
          this.usuarioService.obtenerPerfil().subscribe();
        }
      });
    } else if (this.chessLocal.isDraw() || this.chessLocal.isStalemate() || this.chessLocal.isThreefoldRepetition()) {
      // Tablas automáticas
      this.partidaService.finalizarPartida(this.partidaId, 'empate', null).subscribe({
        next: (res) => {
          this.partida = res.partida;
          this.usuarioService.obtenerPerfil().subscribe();
        }
      });
    }
  }

  esMiTurno(): boolean {
    if (!this.partida) return false;
    const uid = this.usuario()?.id;
    if (!uid || (uid !== this.partida.jugadorBlanco && uid !== this.partida.jugadorNegro)) return false;
    
    // Si la partida está en espera, nadie mueve
    if (this.partida.estado !== 'jugando') return false;

    const activeColor = this.chessLocal.turn(); // 'w' o 'b'
    return activeColor === this.miColor;
  }

  realizarMovimiento(event: { from: string; to: string; piece: string }) {
    if (!this.partida || this.partida.estado !== 'jugando') return;

    const turnoIndex = this.movimientos.length + 1;
    
    // 1. Guardar movimiento en base de datos
    this.movimientoService.registrarMovimiento(
      this.partidaId,
      turnoIndex,
      event.piece,
      event.from,
      event.to
    ).subscribe({
      next: (nuevoMov) => {
        // Evitar duplicados si el escucha de Firestore ya agregó el movimiento
        if (!this.movimientos.some(m => m.id === nuevoMov.id)) {
          this.movimientos.push(nuevoMov);
          this.reconstruirJuego();
        }
        // Si este movimiento causó fin de partida, la función reconstruirJuego se encargará de reportarlo.
      },
      error: (err) => {
        // En caso de error, refrescar movimientos
        this.cargarMovimientosYReconstruir();
      }
    });
  }

  rendirse() {
    if (!confirm('¿Estás seguro de que quieres rendirte? Perderás 10 puntos ELO.')) return;
    
    this.detenerPolling();
    const ganadorId = this.obtenerOponenteId();

    this.partidaService.finalizarPartida(this.partidaId, 'terminada', ganadorId).subscribe({
      next: (res) => {
        this.partida = res.partida;
        this.usuarioService.obtenerPerfil().subscribe();
      }
    });
  }

  proponerTablas() {
    if (!confirm('¿Quieres acordar tablas/empate? Ambos obtendrán +5 puntos ELO.')) return;

    this.detenerPolling();
    this.partidaService.finalizarPartida(this.partidaId, 'empate', null).subscribe({
      next: (res) => {
        this.partida = res.partida;
        this.usuarioService.obtenerPerfil().subscribe();
      }
    });
  }

  // Helpers de datos
  miNombre(): string {
    return this.usuario()?.nombre || 'Jugador';
  }

  miElo(): number {
    return this.usuario()?.elo || 1000;
  }

  obtenerOponenteId(): string {
    if (!this.partida) return '';
    const miId = this.usuario()?.id;
    return this.partida.jugadorBlanco === miId ? (this.partida.jugadorNegro || '') : (this.partida.jugadorBlanco || '');
  }

  obtenerOponenteNombre(): string {
    if (!this.partida) return 'Esperando...';
    return this.miColor === 'w' ? (this.partida.nombreNegro || 'Esperando...') : (this.partida.nombreBlanco || 'Esperando...');
  }

  obtenerOponenteElo(): number | string {
    if (!this.partida) return '---';
    const elo = this.miColor === 'w' ? this.partida.eloNegro : this.partida.eloBlanco;
    return elo !== undefined ? elo : '---';
  }

  obtenerOponenteIniciales(): string {
    const nombre = this.obtenerOponenteNombre();
    if (nombre === 'Esperando...') return '❔';
    return nombre.substring(0, 2).toUpperCase();
  }

  obtenerMensajeResultado(): string {
    if (!this.partida) return '';
    
    if (this.partida.estado === 'empate') {
      return 'La partida terminó en empate (tablas). Ambos jugadores ganan +5 puntos ELO.';
    }

    if (this.partida.estado === 'terminada') {
      const miId = this.usuario()?.id;
      if (this.partida.ganador === miId) {
        return '¡Felicidades! Has ganado la partida. Obtienes +20 puntos ELO.';
      } else {
        const nombreGanador = this.partida.ganador === this.partida.jugadorBlanco ? this.partida.nombreBlanco : this.partida.nombreNegro;
        return `Has perdido la partida. Ganador: ${nombreGanador || 'oponente'}. Pierdes 10 puntos ELO.`;
      }
    }

    return '';
  }

  obtenerUltimoMovimiento() {
    if (this.movimientos.length === 0) return null;
    const m = this.movimientos[this.movimientos.length - 1];
    return { from: m.origen, to: m.destino };
  }
}
