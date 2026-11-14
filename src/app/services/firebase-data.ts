import { FirebaseError } from 'firebase/app';
import { User } from 'firebase/auth';
import { collection, doc, getDoc, getDocs, runTransaction } from 'firebase/firestore';
import { auth, db } from '../config/firebase.config';
import { Partida } from '../models/partida';
import { Usuario } from '../models/usuario';

export function usuarioFirebase() {
  if (!auth.currentUser) throw new Error('Inicia sesión para continuar.');
  return auth.currentUser;
}

export function perfilRef(id: string) {
  return doc(db, 'usuarios', id);
}

export function partidaRef(id: string) {
  return doc(db, 'partidas', id);
}

export async function asegurarPerfil(user: User, nombre?: string): Promise<Usuario> {
  const ref = perfilRef(user.uid);
  const existente = await getDoc(ref);
  if (existente.exists()) return existente.data() as Usuario;
  return runTransaction(db, async transaction => {
    const actual = await transaction.get(ref);
    if (actual.exists()) return actual.data() as Usuario;
    const perfil: Usuario = {
      id: user.uid,
      nombre: nombre || user.displayName || user.email?.split('@')[0] || 'Jugador',
      correo: user.email || '',
      elo: 1000,
      partidasJugadas: 0,
      partidasGanadas: 0,
      fechaRegistro: user.metadata.creationTime
        ? new Date(user.metadata.creationTime).toISOString()
        : new Date().toISOString()
    };
    transaction.set(ref, perfil);
    return perfil;
  });
}

export async function listarPerfiles() {
  const snapshot = await getDocs(collection(db, 'usuarios'));
  return snapshot.docs.map(item => item.data() as Usuario);
}

export function agregarJugadores(partida: Partida, perfiles: Map<string, Usuario>): Partida {
  const blanco = perfiles.get(partida.jugadorBlanco ?? '');
  const negro = perfiles.get(partida.jugadorNegro ?? '');
  return {
    ...partida,
    nombreBlanco: blanco?.nombre,
    eloBlanco: blanco?.elo,
    nombreNegro: negro?.nombre,
    eloNegro: negro?.elo
  };
}

export async function cargarPerfilesPartidas(partidas: Partida[]) {
  const ids = [...new Set(partidas.flatMap(p => [p.jugadorBlanco, p.jugadorNegro])
    .filter(id => id !== null))];
  const perfiles = await Promise.all(ids.map(id => getDoc(perfilRef(id))));
  return new Map(perfiles.filter(perfil => perfil.exists())
    .map(perfil => [perfil.id, perfil.data() as Usuario]));
}

export async function cargarJugadores(partida: Partida) {
  return agregarJugadores(partida, await cargarPerfilesPartidas([partida]));
}

export function mensajeFirebase(error: unknown, fallback: string) {
  if (!(error instanceof FirebaseError)) return fallback;
  switch (error.code) {
    case 'auth/invalid-credential':
      return 'Correo o contraseña incorrectos.';
    case 'auth/user-not-found':
      return 'No existe una cuenta registrada con este correo.';
    case 'auth/wrong-password':
      return 'La contraseña es incorrecta.';
    case 'auth/invalid-email':
      return 'Escribe un correo electrónico válido.';
    case 'auth/email-already-in-use':
      return 'El correo ya está registrado.';
    case 'auth/admin-restricted-operation':
      return 'La creación de cuentas está deshabilitada en Firebase.';
    case 'auth/operation-not-allowed':
      return 'El registro con correo y contraseña está deshabilitado en Firebase.';
    case 'auth/quota-exceeded':
      return 'Firebase alcanzó el límite de registros. Inténtalo más tarde.';
    case 'auth/captcha-check-failed':
    case 'auth/missing-recaptcha-token':
    case 'auth/invalid-recaptcha-token':
      return 'Firebase no pudo verificar la solicitud de registro. Recarga la página e inténtalo de nuevo.';
    case 'auth/weak-password':
      return 'La contraseña debe tener al menos 6 caracteres.';
    case 'auth/password-does-not-meet-requirements':
      return 'La contraseña no cumple los requisitos de seguridad del proyecto.';
    case 'permission-denied':
      return 'Firebase rechazó el acceso a los datos de tu perfil.';
    case 'auth/requires-recent-login':
      return 'Vuelve a iniciar sesión para cambiar tu contraseña.';
    case 'auth/too-many-requests':
      return 'Hay demasiados intentos. Inténtalo más tarde.';
    case 'auth/network-request-failed':
    case 'unavailable':
      return 'No pudimos conectar con Firebase. Revisa tu conexión e inténtalo de nuevo.';
    default:
      return fallback;
  }
}
