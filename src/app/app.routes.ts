import { Routes } from '@angular/router';
import { InicioPage } from './pages/inicio/inicio';
import { Dashboard } from './components/dashboard/dashboard';
import { Historial } from './components/historial/historial';
import { RankingLeaderboard } from './components/ranking/ranking';
import { PerfilComponent } from './components/perfil/perfil';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'inicio', component: InicioPage },
  { path: 'dashboard', component: Dashboard, canActivate: [authGuard] },
  {
    path: 'jugador/:id',
    loadComponent: () => import('./pages/jugador/jugador').then(module => module.JugadorPage),
    canActivate: [authGuard]
  },
  { path: 'historial', component: Historial, canActivate: [authGuard] },
  { path: 'ranking', component: RankingLeaderboard, canActivate: [authGuard] },
  { path: 'perfil', component: PerfilComponent, canActivate: [authGuard] },
  {
    path: 'admin',
    loadComponent: () => import('./pages/admin/admin').then(module => module.AdminPage),
    canActivate: [authGuard]
  },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: 'dashboard' }
];

