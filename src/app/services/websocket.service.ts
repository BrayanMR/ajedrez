import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { Movimiento } from '../models/movimiento';
import { Partida } from '../models/partida';
import { API_CONFIG } from '../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private socket: Socket;
  private readonly SERVER_URL = API_CONFIG.WS_BASE_URL;

  constructor() {
    this.socket = io(this.SERVER_URL, {
      autoConnect: true,
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      console.log('Conectado al servidor de WebSockets');
    });

    this.socket.on('disconnect', () => {
      console.log('Desconectado del servidor de WebSockets');
    });
  }

  // Unirse a la sala de una partida específica
  joinPartida(partidaId: string) {
    this.socket.emit('unirse_partida', partidaId);
  }

  // Abandonar la sala de una partida
  leavePartida(partidaId: string) {
    this.socket.emit('salir_partida', partidaId);
  }

  // Escuchar cuando se realiza un nuevo movimiento
  onNuevoMovimiento(): Observable<Movimiento> {
    return new Observable<Movimiento>((observer) => {
      this.socket.on('nuevo_movimiento', (movimiento: Movimiento) => {
        observer.next(movimiento);
      });

      return () => {
        this.socket.off('nuevo_movimiento');
      };
    });
  }

  // Escuchar cuando la partida se inicia (ej. el oponente se une)
  onPartidaIniciada(): Observable<Partida> {
    return new Observable<Partida>((observer) => {
      this.socket.on('partida_iniciada', (partida: Partida) => {
        observer.next(partida);
      });

      return () => {
        this.socket.off('partida_iniciada');
      };
    });
  }

  // Escuchar cuando la partida es finalizada
  onPartidaFinalizada(): Observable<Partida> {
    return new Observable<Partida>((observer) => {
      this.socket.on('partida_finalizada', (partida: Partida) => {
        observer.next(partida);
      });

      return () => {
        this.socket.off('partida_finalizada');
      };
    });
  }
}
