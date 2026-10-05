import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { NavBar } from '../../core/navBar/navBar';
import { Footer } from '../../core/footer/footer';
import { Game } from '../../classes/game';
import { GameService } from '../../services/game.service';
import { GameApiService } from '../../services/game-api.service';
import { CommonModule } from '@angular/common';
import { FilterGamesPipe } from '../../pipes/filter-games-pipe';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  imports: [RouterOutlet, RouterLink, NavBar, Footer, CommonModule, FilterGamesPipe, FormsModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  public games: Array<Game> = [];
  stars = [1, 2, 3, 4, 5];
  public searchQuery = '';

  totalGames = 0;
  private readonly pageSize = 60;

  constructor(
    private gameService: GameService,
    private router: Router,
    private gameApiService: GameApiService
  ) {
    this.loadGames();
  }

  get hasMoreGames(): boolean {
    return this.games.length < this.totalGames;
  }

  loadMoreGames(): void {
    this.loadGames();
  }

  private loadGames(): void {
    this.gameApiService.getGames(this.pageSize, this.games.length).subscribe(({ games, total }) => {
      this.games = [...this.games, ...games];
      this.totalGames = total;
    });
  }

  goToGamePage(game: Game) {
    this.gameService.setSelectedGame(game);
    this.router.navigate(['/game-page']);
  }
}
