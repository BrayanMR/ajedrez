import { Injectable } from '@angular/core';
import { defer, map } from 'rxjs';
import { collection, documentId, getDocs, limit, orderBy, query } from 'firebase/firestore';
import { db } from '../config/firebase.config';
import { Ranking } from '../models/ranking';
import { Usuario } from '../models/usuario';
import { listarPerfiles } from './firebase-data';

@Injectable({ providedIn: 'root' })
export class RankingService {
  obtenerLeaderboard(maximo?: number) {
    return defer(async () => {
      if (maximo === undefined) {
        return (await listarPerfiles()).sort((a, b) => b.elo - a.elo || (a.id < b.id ? 1 : a.id > b.id ? -1 : 0));
      }
      const snapshot = await getDocs(query(collection(db, 'usuarios'),
        orderBy('elo', 'desc'), orderBy(documentId(), 'desc'), limit(maximo)));
      return snapshot.docs.map(item => item.data() as Usuario);
    }).pipe(map(perfiles => perfiles
      .map((perfil, index): Ranking => ({
        id: perfil.id,
        usuarioId: perfil.id,
        nombre: perfil.nombre,
        puntos: perfil.elo,
        posicion: index + 1,
        nivel: this.nivel(perfil.elo),
        partidasJugadas: perfil.partidasJugadas,
        partidasGanadas: perfil.partidasGanadas
      }))));
  }

  obtenerRankingUsuario(usuarioId: string) {
    return this.obtenerLeaderboard().pipe(map(ranking => {
      const jugador = ranking.find(item => item.usuarioId === usuarioId);
      if (!jugador) throw new Error('No se encontró el ranking del jugador.');
      return jugador;
    }));
  }

  private nivel(elo: number) {
    if (elo >= 2400) return 'Gran Maestro';
    if (elo >= 2000) return 'Maestro';
    if (elo >= 1600) return 'Avanzado';
    if (elo >= 1200) return 'Intermedio';
    return 'Principiante';
  }
}
