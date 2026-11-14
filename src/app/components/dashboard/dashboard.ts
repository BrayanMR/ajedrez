import { Aviso } from '../aviso/aviso';
import { Component, ElementRef, OnInit, inject, signal, viewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Navbar } from '../navbar/navbar';
import { AuthService } from '../../services/auth.service';
import { PartidaService } from '../../services/partida.service';
import { RankingService } from '../../services/ranking.service';
import { UsuarioService } from '../../services/usuario.service';
import { Partida } from '../../models/partida';
import { Ranking } from '../../models/ranking';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [Aviso, RouterLink, Navbar],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  private authService = inject(AuthService);
  private partidaService = inject(PartidaService);
  private rankingService = inject(RankingService);
  private usuarioService = inject(UsuarioService);
  private router = inject(Router);

  usuario = this.authService.currentUser;
  
  readonly topRankings = signal<Ranking[]>([]);
  readonly recentGames = signal<Partida[]>([]);
  readonly partidasLobby = signal<Partida[]>([]);

  private readonly creador = viewChild.required<ElementRef<HTMLDialogElement>>('creador');
  readonly creando = signal(false);
  readonly uniendose = signal(false);
  readonly cargandoLobby = signal(false);
  readonly errorLobby = signal('');
  readonly errorCreacion = signal('');
  opcionColor: 'blancas' | 'negras' | 'aleatorio' = 'aleatorio';

  readonly registroCompletado = this.router.currentNavigation()?.extras.info === 'registro-completado';

  ngOnInit() {
    this.usuarioService.obtenerPerfil().subscribe({ error: console.error });
    this.cargarLobby();
    this.cargarRanking();
    this.cargarHistorialReciente();
  }

  cargarLobby() {
    if (this.cargandoLobby()) return;
    this.cargandoLobby.set(true);
    this.errorLobby.set('');
    this.partidaService.listarPartidasActivas().pipe(
      finalize(() => this.cargandoLobby.set(false))
    ).subscribe({
      next: (partidas) => {
        this.partidasLobby.set(partidas);
      },
      error: () => this.errorLobby.set('No pudimos cargar las partidas. Pulsa Actualizar para reintentar.')
    });
  }

  cargarRanking() {
    this.rankingService.obtenerLeaderboard(3).subscribe({
      next: (leaderboard) => {
        this.topRankings.set(leaderboard);
      },
      error: console.error
    });
  }

  cargarHistorialReciente() {
    this.partidaService.listarHistorialUsuario(3).subscribe({
      next: (historial) => {
        this.recentGames.set(historial);
      },
      error: console.error
    });
  }

  calcularWinRatio(jugadas?: number, ganadas?: number): number {
    if (!jugadas) return 0;
    return Math.round(( (ganadas || 0) / jugadas ) * 100);
  }

  abrirModalCrear() {
    this.errorCreacion.set('');
    this.creador().nativeElement.showModal();
  }

  cerrarModalCrear() {
    this.creador().nativeElement.close();
  }

  crearPartida() {
    if (this.creando()) return;
    this.creando.set(true);
    this.errorCreacion.set('');
    this.partidaService.crearPartida(this.opcionColor).pipe(
      finalize(() => this.creando.set(false))
    ).subscribe({
      next: (partida) => {
        this.cerrarModalCrear();
        this.irAPartida(partida.id);
      },
      error: () => this.errorCreacion.set('No pudimos crear la partida. Inténtalo de nuevo.')
    });
  }

  unirseAPartida(partidaId: string) {
    if (this.uniendose()) return;
    this.uniendose.set(true);
    this.errorLobby.set('');
    this.partidaService.unirseAPartida(partidaId).pipe(
      finalize(() => this.uniendose.set(false))
    ).subscribe({
      next: () => {
        this.irAPartida(partidaId);
      },
      error: () => this.errorLobby.set('No pudimos unirte a la partida. Actualiza el lobby para ver si sigue disponible.')
    });
  }

  irAPartida(partidaId: string) {
    this.router.navigate(['/jugador', partidaId]);
  }

  // Helpers de rendering de tabla de Lobby
  obtenerCreadorNombre(p: Partida): string {
    if (p.jugadorBlanco) return p.nombreBlanco || 'Desconocido';
    return p.nombreNegro || 'Desconocido';
  }

  obtenerCreadorElo(p: Partida): number {
    if (p.jugadorBlanco) return p.eloBlanco || 1000;
    return p.eloNegro || 1000;
  }

  esMiPartida(p: Partida): boolean {
    const miId = this.usuario()?.id;
    return p.jugadorBlanco === miId || p.jugadorNegro === miId;
  }

  involucraUsuario(p: Partida): boolean {
    const miId = this.usuario()?.id;
    return p.jugadorBlanco === miId || p.jugadorNegro === miId;
  }

  obtenerRangoMilitar(elo?: number): { titulo: string; clase: string; division: string } {
    const score = elo ?? 1000;
    if (score >= 2000) return { titulo: 'Gran Almirante de Flota', clase: 'rango-supremo', division: 'División Zenith // Sector 01' };
    if (score >= 1700) return { titulo: 'Comandante de Escuadrón', clase: 'rango-elite', division: 'Flota Táctica // Escuadrón Alfa' };
    if (score >= 1400) return { titulo: 'Capitán de Artillería', clase: 'rango-veterano', division: 'Fuerza de Asalto // Sector Bravo' };
    if (score >= 1100) return { titulo: 'Oficial Táctico', clase: 'rango-oficial', division: 'Vanguardia Naval // Escuadrón Delta' };
    return { titulo: 'Cadete de Maniobras', clase: 'rango-cadete', division: 'Reserva Estratégica // Base Cero' };
  }
}
