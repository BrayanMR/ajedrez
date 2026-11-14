import { Injectable } from '@angular/core';
import { onSnapshot } from 'firebase/firestore';
import { Observable, switchMap } from 'rxjs';
import { Partida } from '../models/partida';
import { agregarJugadores, cargarPerfilesPartidas, partidaRef } from './firebase-data';

@Injectable({ providedIn: 'root' })
export class PartidaEnVivoService {
  observarPartida(id: string) {
    let jugadores: string | undefined;
    let perfiles: ReturnType<typeof cargarPerfilesPartidas>;
    return new Observable<Partida>(observer => onSnapshot(partidaRef(id), { includeMetadataChanges: true }, snapshot => {
      if (snapshot.exists()) observer.next(snapshot.data() as Partida);
      else if (snapshot.metadata.fromCache) return;
      else observer.error(new Error('Partida no encontrada.'));
    }, error => observer.error(error))).pipe(switchMap(async partida => {
      const actuales = JSON.stringify([partida.jugadorBlanco, partida.jugadorNegro]);
      if (jugadores !== actuales) {
        jugadores = actuales;
        perfiles = cargarPerfilesPartidas([partida]);
      }
      return agregarJugadores(partida, await perfiles);
    }));
  }
}
