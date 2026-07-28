export interface Partida {
  id: string;
  jugadorBlanco: string | null;
  jugadorNegro: string | null;
  ganador: string | null;
  estado: 'espera' | 'jugando' | 'terminada' | 'empate';
  fechaInicio: string;
  fechaFin: string | null;
  // Propiedades virtuales unidas en backend para facilidad del UI
  nombreBlanco?: string;
  nombreNegro?: string;
  eloBlanco?: number;
  eloNegro?: number;
}
