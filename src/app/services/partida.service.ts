import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { Partida } from '../models/partida';
import { API_CONFIG } from '../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class PartidaService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  private readonly API_URL = `${API_CONFIG.API_BASE_URL}/partidas`;

  crearPartida(colorPiezas: 'blancas' | 'negras' | 'aleatorio'): Observable<Partida> {
    return this.http.post<Partida>(
      this.API_URL,
      { colorPiezas },
      { headers: this.authService.getAuthHeaders() }
    );
  }

  unirseAPartida(partidaId: string): Observable<any> {
    return this.http.post<any>(
      `${this.API_URL}/${partidaId}/unirse`,
      {},
      { headers: this.authService.getAuthHeaders() }
    );
  }

  obtenerPartida(partidaId: string): Observable<Partida> {
    return this.http.get<Partida>(
      `${this.API_URL}/${partidaId}`,
      { headers: this.authService.getAuthHeaders() }
    );
  }

  listarPartidasActivas(): Observable<Partida[]> {
    return this.http.get<Partida[]>(
      this.API_URL,
      { headers: this.authService.getAuthHeaders() }
    );
  }

  listarHistorialUsuario(): Observable<Partida[]> {
    return this.http.get<Partida[]>(
      `${this.API_URL}/historial/usuario`,
      { headers: this.authService.getAuthHeaders() }
    );
  }

  finalizarPartida(partidaId: string, estado: 'terminada' | 'empate', ganador: string | null): Observable<any> {
    return this.http.put<any>(
      `${this.API_URL}/${partidaId}/finalizar`,
      { estado, ganador },
      { headers: this.authService.getAuthHeaders() }
    );
  }
}
