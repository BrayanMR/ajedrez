import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { Movimiento } from '../models/movimiento';
import { API_CONFIG } from '../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class MovimientoService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  private readonly API_URL = `${API_CONFIG.API_BASE_URL}/movimientos`;

  registrarMovimiento(
    partidaId: string,
    turno: number,
    pieza: string,
    origen: string,
    destino: string
  ): Observable<Movimiento> {
    return this.http.post<Movimiento>(
      this.API_URL,
      { partidaId, turno, pieza, origen, destino },
      { headers: this.authService.getAuthHeaders() }
    );
  }

  obtenerMovimientosPartida(partidaId: string): Observable<Movimiento[]> {
    return this.http.get<Movimiento[]>(
      `${this.API_URL}/partida/${partidaId}`,
      { headers: this.authService.getAuthHeaders() }
    );
  }
}
