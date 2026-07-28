import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AuthService } from './auth.service';
import { Usuario } from '../models/usuario';
import { API_CONFIG } from '../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  private readonly API_URL = `${API_CONFIG.API_BASE_URL}/usuarios`;

  obtenerPerfil(): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.API_URL}/perfil`, {
      headers: this.authService.getAuthHeaders()
    }).pipe(
      tap(usuario => {
        this.authService.actualizarUsuarioLocal(usuario);
      })
    );
  }

  actualizarPerfil(nombre: string, contraseña?: string): Observable<any> {
    const body: any = { nombre };
    if (contraseña) {
      body.contraseña = contraseña;
    }

    return this.http.put<any>(`${this.API_URL}/perfil`, body, {
      headers: this.authService.getAuthHeaders()
    }).pipe(
      tap(res => {
        if (res.usuario) {
          this.authService.actualizarUsuarioLocal(res.usuario);
        }
      })
    );
  }

  listarUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.API_URL}`, {
      headers: this.authService.getAuthHeaders()
    });
  }
}
