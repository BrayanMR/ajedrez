import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { Usuario } from '../models/usuario';
import { API_CONFIG } from '../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  
  private readonly API_URL = `${API_CONFIG.API_BASE_URL}/usuarios`;

  // Señales de Angular para un manejo de estado reactivo y limpio
  private userSignal = signal<Usuario | null>(null);
  
  currentUser = computed(() => this.userSignal());
  isAuthenticated = computed(() => !!this.userSignal());

  constructor() {
    this.cargarSesion();
  }

  private cargarSesion() {
    const token = localStorage.getItem('cr_token');
    const userJson = localStorage.getItem('cr_usuario');
    
    if (token && userJson) {
      try {
        this.userSignal.set(JSON.parse(userJson));
      } catch (e) {
        this.logout();
      }
    }
  }

  registro(nombre: string, correo: string, contraseña: string): Observable<any> {
    return this.http.post(`${this.API_URL}/registro`, { nombre, correo, contraseña });
  }

  login(correo: string, contraseña: string): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/login`, { correo, contraseña }).pipe(
      tap(res => {
        if (res.token && res.usuario) {
          localStorage.setItem('cr_token', res.token);
          localStorage.setItem('cr_usuario', JSON.stringify(res.usuario));
          this.userSignal.set(res.usuario);
        }
      })
    );
  }

  logout() {
    localStorage.removeItem('cr_token');
    localStorage.removeItem('cr_usuario');
    this.userSignal.set(null);
    this.router.navigate(['/inicio']);
  }

  // Permite actualizar el estado del usuario local cuando edita su perfil
  actualizarUsuarioLocal(usuario: Usuario) {
    localStorage.setItem('cr_usuario', JSON.stringify(usuario));
    this.userSignal.set(usuario);
  }

  getToken(): string | null {
    return localStorage.getItem('cr_token');
  }

  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }
}
