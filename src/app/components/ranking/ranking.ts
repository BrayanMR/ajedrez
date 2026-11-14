import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { Navbar } from '../navbar/navbar';
import { RankingService } from '../../services/ranking.service';
import { AuthService } from '../../services/auth.service';
import { Ranking } from '../../models/ranking';

@Component({
  selector: 'app-ranking',
  standalone: true,
  imports: [Navbar],
  templateUrl: './ranking.html',
  styleUrl: './ranking.css'
})
export class RankingLeaderboard implements OnInit {
  private rankingService = inject(RankingService);
  private authService = inject(AuthService);

  usuario = this.authService.currentUser;
  
  readonly leaderboard = signal<Ranking[]>([]);
  readonly podio = computed(() => this.leaderboard().slice(0, 3));
  readonly cargando = signal(true);
  readonly error = signal(false);

  ngOnInit() {
    this.cargarRanking();
  }

  cargarRanking() {
    this.cargando.set(true);
    this.error.set(false);
    this.rankingService.obtenerLeaderboard().pipe(
      finalize(() => this.cargando.set(false))
    ).subscribe({
      next: (data) => {
        this.leaderboard.set(data);
      },
      error: () => this.error.set(true)
    });
  }
}
