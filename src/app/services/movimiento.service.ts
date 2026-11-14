import { Injectable } from '@angular/core';
import { collection, doc, getDocs, onSnapshot, query, runTransaction, where } from 'firebase/firestore';
import { Observable, defer } from 'rxjs';
import { db } from '../config/firebase.config';
import { Movimiento } from '../models/movimiento';
import { Partida } from '../models/partida';
import { partidaRef, usuarioFirebase } from './firebase-data';

@Injectable({ providedIn: 'root' })
export class MovimientoService {
  registrarMovimiento(partidaId: string, turno: number, pieza: string, origen: string, destino: string) {
    return defer(() => runTransaction(db, async transaction => {
      const { uid } = usuarioFirebase();
      const partida = (await transaction.get(partidaRef(partidaId))).data() as Partida | undefined;
      if (partida?.estado !== 'jugando') throw new Error('La partida no está activa.');
      if (uid !== (turno % 2 === 1 ? partida.jugadorBlanco : partida.jugadorNegro)) {
        throw new Error('Es el turno del otro jugador.');
      }
      const ref = doc(db, 'movimientos', `${partidaId}_${turno}`);
      if ((await transaction.get(ref)).exists()) throw new Error('Ese turno ya se jugó.');
      const movimiento: Movimiento = { id: ref.id, partidaId, turno, pieza, origen, destino, fecha: new Date().toISOString() };
      transaction.set(ref, movimiento);
      return movimiento;
    }));
  }

  obtenerMovimientosPartida(partidaId: string) {
    return defer(async () => {
      const snapshot = await getDocs(this.consulta(partidaId));
      return snapshot.docs.map(item => item.data() as Movimiento).sort((a, b) => a.turno - b.turno);
    });
  }

  observarMovimientos(partidaId: string) {
    return new Observable<Movimiento[]>(observer => onSnapshot(this.consulta(partidaId), snapshot => {
      observer.next(snapshot.docs.map(item => item.data() as Movimiento).sort((a, b) => a.turno - b.turno));
    }, error => observer.error(error)));
  }

  private consulta(partidaId: string) {
    return query(collection(db, 'movimientos'), where('partidaId', '==', partidaId));
  }
}
