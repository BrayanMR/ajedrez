import { Injectable } from '@angular/core';
import { FirebaseError } from 'firebase/app';
import { collection, doc, getDocs, limit, orderBy, query, runTransaction, setDoc, where } from 'firebase/firestore';
import { defer, map, switchMap } from 'rxjs';
import { db } from '../config/firebase.config';
import { Partida } from '../models/partida';
import { Usuario } from '../models/usuario';
import { agregarJugadores, cargarJugadores, cargarPerfilesPartidas, partidaRef, perfilRef, usuarioFirebase } from './firebase-data';

@Injectable({ providedIn: 'root' })
export class PartidaService {
  crearPartida(colorPiezas: 'blancas' | 'negras' | 'aleatorio') {
    return defer(async () => {
      const { uid } = usuarioFirebase();
      const ref = doc(collection(db, 'partidas'));
      const blancas = colorPiezas === 'blancas' || (colorPiezas === 'aleatorio' && Math.random() < 0.5);
      const partida: Partida = {
        id: ref.id,
        jugadorBlanco: blancas ? uid : null,
        jugadorNegro: blancas ? null : uid,
        estado: 'espera',
        ganador: null,
        fechaInicio: new Date().toISOString(),
        fechaFin: null
      };
      await setDoc(ref, partida);
      return partida;
    });
  }

  unirseAPartida(id: string) {
    return defer(() => runTransaction(db, async transaction => {
      const { uid } = usuarioFirebase();
      const ref = partidaRef(id);
      const partida = (await transaction.get(ref)).data() as Partida | undefined;
      if (!partida || partida.estado !== 'espera') throw new Error('La partida ya no está en espera.');
      if (partida.jugadorBlanco === uid || partida.jugadorNegro === uid) {
        throw new Error('No puedes unirte a tu propia partida.');
      }

      const cambios = {
        estado: 'jugando' as const,
        jugadorBlanco: partida.jugadorBlanco ?? uid,
        jugadorNegro: partida.jugadorNegro ?? uid
      };
      transaction.update(ref, cambios);
      return { ...partida, ...cambios };
    }));
  }

  listarPartidasActivas() {
    const activas = query(collection(db, 'partidas'), where('estado', 'in', ['espera', 'jugando']));
    return defer(() => getDocs(activas)).pipe(
      map(snapshot => snapshot.docs.map(item => item.data() as Partida)),
      switchMap(partidas => this.conPerfiles(partidas))
    );
  }

  listarHistorialUsuario(maximo?: number, incluirPerfiles = true) {
    return defer(async () => {
      const { uid } = usuarioFirebase();
      const partidas = collection(db, 'partidas');
      const campos = ['jugadorBlanco', 'jugadorNegro'];
      const resultados = await Promise.all(campos.map(async campo => {
        const jugador = where(campo, '==', uid);
        if (maximo === undefined) return getDocs(query(partidas, jugador));
        try {
          return await getDocs(query(partidas, jugador, where('estado', 'in', ['terminada', 'empate']),
            orderBy('fechaInicio', 'desc'), limit(maximo)));
        } catch (error) {
          if (!(error instanceof FirebaseError) || error.code !== 'failed-precondition') throw error;
          return getDocs(query(partidas, jugador));
        }
      }));
      const historial = resultados.flatMap(resultado => resultado.docs.map(item => item.data() as Partida));
      const ordenado = historial.filter(p => p.estado === 'terminada' || p.estado === 'empate')
        .sort((a, b) => b.fechaInicio.localeCompare(a.fechaInicio));
      const seleccion = ordenado.slice(0, maximo);
      return incluirPerfiles ? this.conPerfiles(seleccion) : seleccion;
    });
  }

  finalizarPartida(id: string, estado: 'terminada' | 'empate', ganador: string | null) {
    return defer(async () => {
      const { uid } = usuarioFirebase();
      const partida = await runTransaction(db, async transaction => {
        const ref = partidaRef(id);
        const actual = (await transaction.get(ref)).data() as Partida | undefined;
        if (!actual?.jugadorBlanco || !actual.jugadorNegro) throw new Error('La partida no está activa.');
        const jugadores = [actual.jugadorBlanco, actual.jugadorNegro];
        if (!jugadores.includes(uid)) throw new Error('No participas en esta partida.');
        if (actual.estado === 'terminada' || actual.estado === 'empate') return actual;
        if (actual.estado !== 'jugando' || (estado === 'terminada' && (!ganador || !jugadores.includes(ganador)))) {
          throw new Error('El resultado no es válido.');
        }
        const perfiles = await Promise.all(jugadores.map(jugador => transaction.get(perfilRef(jugador))));
        const cambios = { estado, ganador: estado === 'empate' ? null : ganador, fechaFin: new Date().toISOString() };
        transaction.update(ref, cambios);
        for (const perfil of perfiles) {
          if (!perfil.exists()) throw new Error('Falta el perfil de un jugador.');
          const usuario = perfil.data() as Usuario;
          const gano = estado === 'terminada' && perfil.id === ganador;
          const puntos = estado === 'empate' ? 5 : gano ? 20 : -10;
          transaction.update(perfil.ref, {
            ultimaPartidaCalificada: id,
            elo: Math.max(100, (usuario.elo ?? 1000) + puntos),
            partidasJugadas: (usuario.partidasJugadas ?? 0) + 1,
            partidasGanadas: (usuario.partidasGanadas ?? 0) + Number(gano)
          });
        }
        return { ...actual, ...cambios };
      });
      return { partida: await cargarJugadores(partida) };
    });
  }

  async conPerfiles(partidas: Partida[]) {
    if (!partidas.length) return partidas;
    const perfiles = await cargarPerfilesPartidas(partidas);
    return partidas.map(partida => agregarJugadores(partida, perfiles));
  }
}
