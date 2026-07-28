export interface Ranking {
  id: string;
  usuarioId: string;
  nombre?: string;
  puntos: number;
  posicion: number;
  nivel: string;
  partidasJugadas?: number;
  partidasGanadas?: number;
}
