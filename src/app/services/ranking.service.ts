import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { Ranking } from '../models/ranking';
import { API_CONFIG } from '../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class RankingService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  private readonly API_URL = `${API_CONFIG.API_BASE_URL}/ranking`;

  obtenerLeaderboard(): Observable<Ranking[]> {
    return this.http.get<Ranking[]>(
      this.API_URL,
      { headers: this.authService.getAuthHeaders() }
    );
  }

  obtenerRankingUsuario(usuarioId: string): Observable<Ranking> {
    return this.http.get<Ranking>(
      `${this.API_URL}/${usuarioId}`,
      { headers: this.authService.getAuthHeaders() }
    );
  }
}
