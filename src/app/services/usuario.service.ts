import { Injectable, inject } from '@angular/core';
import { updatePassword } from 'firebase/auth';
import { collection, documentId, getDocs, limit, orderBy, query, startAfter, updateDoc } from 'firebase/firestore';
import { defer } from 'rxjs';
import { AuthService } from './auth.service';
import { asegurarPerfil, perfilRef, usuarioFirebase } from './firebase-data';
import { db } from '../config/firebase.config';
import { Usuario } from '../models/usuario';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private authService = inject(AuthService);

  obtenerPerfil() {
    return defer(async () => {
      const perfil = await asegurarPerfil(usuarioFirebase());
      this.authService.actualizarUsuarioLocal(perfil);
      return perfil;
    });
  }

  actualizarPerfil(nombre: string, contraseña?: string) {
    return defer(async () => {
      const user = usuarioFirebase();
      if (contraseña) await updatePassword(user, contraseña);
      await updateDoc(perfilRef(user.uid), { nombre });
      const usuario = await asegurarPerfil(user);
      this.authService.actualizarUsuarioLocal(usuario);
      return { usuario };
    });
  }

  listarUsuarios(cursor?: string) {
    return defer(async () => {
      const snapshot = await getDocs(query(collection(db, 'usuarios'), orderBy(documentId()),
        ...(cursor === undefined ? [] : [startAfter(cursor)]), limit(25)));
      return {
        usuarios: snapshot.docs.map(item => item.data() as Usuario),
        siguiente: snapshot.size === 25 ? snapshot.docs.at(-1)?.id : undefined
      };
    });
  }
}
