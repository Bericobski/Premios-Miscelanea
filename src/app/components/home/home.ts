import { Component, computed, signal } from '@angular/core';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { NavBar } from '../../core/navBar/navBar';
import { Footer } from '../../core/footer/footer';
import { Game } from '../../classes/game';
import { GameService } from '../../services/game.service';
import { GameApiService } from '../../services/game-api.service';
import { CommonModule } from '@angular/common';
import { FilterGamesPipe } from '../../pipes/filter-games-pipe';
import { FormsModule } from '@angular/forms';
import { Highlight } from '../../directives/highlight';

@Component({
  selector: 'app-home',
  imports: [RouterOutlet, RouterLink, NavBar, Footer, CommonModule, FilterGamesPipe, FormsModule, Highlight],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  public games = signal<Game[]>([]);
  stars = [1, 2, 3, 4, 5];
  public searchQuery = '';

  // Adventure section: 8 random adventure games per visit, not affected by the search bar.
  public adventureGames = signal<Game[]>([]);
  public indieGames = signal<Game[]>([]);
  private readonly adventureCount = 8;

  totalGames = signal(0);
  private readonly pageSize = 60;

  constructor(
    private gameService: GameService,
    private router: Router,
    private gameApiService: GameApiService
  ) {
    this.loadGames();
    this.loadAdventureGames();
    this.loadIndieGames();
  }

  hasMoreGames = computed(() => this.games().length < this.totalGames());

  loadMoreGames(): void {
    this.loadGames();
  }

  private loadGames(): void {
    this.gameApiService.getGames(this.pageSize, this.games().length).subscribe(({ games, total }) => {
      this.games.update((current) => [...current, ...games]);
      this.totalGames.set(total);
    });
  }

  private loadAdventureGames(): void {
    this.gameApiService
      .getGames(this.adventureCount, 0, 'Adventure', true)
      .subscribe(({ games }) => this.adventureGames.set(games));
  }

  private loadIndieGames(): void {
    this.gameApiService
      .getGames(this.adventureCount, 0, 'Indie', true)
      .subscribe(({ games }) => this.indieGames.set(games));
  }

  goToGamePage(game: Game) {
    this.gameService.setSelectedGame(game);
    this.router.navigate(['/game-page']);
  }
}
