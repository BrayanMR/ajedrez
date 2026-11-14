import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword,
  signOut, updateProfile, User
} from 'firebase/auth';
import { defer } from 'rxjs';
import { auth } from '../config/firebase.config';
import { asegurarPerfil } from './firebase-data';
import { Usuario } from '../models/usuario';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private router = inject(Router);
  private userSignal = signal<Usuario | null>(null);
  currentUser = this.userSignal.asReadonly();
  isAuthenticated = computed(() => !!this.userSignal());

  readonly ready = auth.authStateReady().then(async () => {
    if (auth.currentUser) await this.cargarPerfil(auth.currentUser);
  }).catch(() => {});

  constructor() {
    onAuthStateChanged(auth, user => {
      if (!user) this.userSignal.set(null);
    });
  }

  private async cargarPerfil(user: User, nombre?: string) {
    const perfil = await asegurarPerfil(user, nombre);
    if (auth.currentUser?.uid === user.uid) this.userSignal.set(perfil);
    return perfil;
  }

  registro(nombre: string, correo: string, contraseña: string) {
    return defer(async () => {
      const { user } = await createUserWithEmailAndPassword(auth, correo, contraseña);
      await updateProfile(user, { displayName: nombre }).catch(() => {});
      try {
        return await this.cargarPerfil(user, nombre);
      } catch {
        await signOut(auth);
        return null;
      }
    });
  }

  login(correo: string, contraseña: string) {
    return defer(async () => {
      const { user } = await signInWithEmailAndPassword(auth, correo, contraseña);
      return this.cargarPerfil(user);
    });
  }

  async logout() {
    await signOut(auth);
    this.userSignal.set(null);
    await this.router.navigate(['/inicio']);
  }

  actualizarUsuarioLocal(usuario: Usuario) {
    if (auth.currentUser?.uid === usuario.id) this.userSignal.set(usuario);
  }
}
