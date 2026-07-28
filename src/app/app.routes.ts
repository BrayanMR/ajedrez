import { Routes } from '@angular/router';
import { InicioPage } from './pages/inicio/inicio';
import { Dashboard } from './components/dashboard/dashboard';
import { JugadorPage } from './pages/jugador/jugador';
import { Historial } from './components/historial/historial';
import { RankingLeaderboard } from './components/ranking/ranking';
import { PerfilComponent } from './components/perfil/perfil';
import { AdminPage } from './pages/admin/admin';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'inicio', component: InicioPage },
  { path: 'dashboard', component: Dashboard, canActivate: [authGuard] },
  { path: 'jugador/:id', component: JugadorPage, canActivate: [authGuard] },
  { path: 'historial', component: Historial, canActivate: [authGuard] },
  { path: 'ranking', component: RankingLeaderboard, canActivate: [authGuard] },
  { path: 'perfil', component: PerfilComponent, canActivate: [authGuard] },
  { path: 'admin', component: AdminPage, canActivate: [authGuard] },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: 'dashboard' }
];

