import { Component, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { FilterGamesPipe } from '../../../pipes/filter-games-pipe';
import { GameApiService, GameCatalogRow } from '../../../services/game-api.service';
import { GameService } from '../../../services/game.service';

// Every game in a text-only table. All rows are loaded once and filtered live with the filterGames pipe;
// the CDK virtual scroll only renders the rows currently visible, so ~7.8k games stay smooth.
@Component({
  selector: 'app-games-table',
  imports: [FormsModule, ScrollingModule, FilterGamesPipe],
  templateUrl: './games-table.html',
  styleUrl: './games-table.scss',
})
export class GamesTable {
  // Must match the row height in games-table.scss: the viewport uses it to know which rows are visible.
  readonly rowHeight = 44;

  readonly games = signal<GameCatalogRow[]>([]);
  readonly loading = signal<boolean>(true);
  readonly error = signal<string | null>(null);
  // Feedback after a delete, and the id of the game being deleted (disables its button).
  readonly message = signal<string | null>(null);
  readonly actionError = signal<string | null>(null);
  readonly deletingId = signal<number | null>(null);
  // Id of the game whose page is being opened (shows it as loading).
  readonly openingId = signal<number | null>(null);

  searchQuery = '';

  constructor(
    private gameApiService: GameApiService,
    private gameService: GameService,
    private router: Router
  ) {
    gameApiService.getCatalog().subscribe({
      next: (games) => {
        this.games.set(games);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not load the games.');
        this.loading.set(false);
      },
    });
  }

  // The table only has text columns, so fetch the full game first, then open its page like home does.
  async openGamePage(row: GameCatalogRow) {
    if (this.openingId() !== null) return;

    this.openingId.set(row.id);
    this.actionError.set(null);
    try {
      const game = await this.gameApiService.getGame(row.id);
      this.gameService.setSelectedGame(game);
      this.router.navigate(['/game-page']);
    } catch {
      this.actionError.set(`Could not open "${row.title}".`);
    } finally {
      this.openingId.set(null);
    }
  }

  async deleteGame(game: GameCatalogRow) {
    if (!confirm(`Delete "${game.title}" (ID ${game.id})? Its votes and comments will be deleted too.`)) return;

    this.deletingId.set(game.id);
    this.message.set(null);
    this.actionError.set(null);
    try {
      const result = await this.gameApiService.deleteGame(game.id);
      this.games.update((games) => games.filter((g) => g.id !== game.id));
      this.message.set(
        result.commentsCleanup === 'failed'
          ? `"${game.title}" was deleted, but its comments could not be removed.`
          : `"${game.title}" was deleted (${result.votesDeleted} votes, ${result.commentsDeleted} comments removed).`
      );
    } catch (err) {
      const apiMessage = err instanceof HttpErrorResponse ? err.error?.error : null;
      this.actionError.set(apiMessage ?? 'Could not delete the game.');
    } finally {
      this.deletingId.set(null);
    }
  }

  // Lets the virtual scroll reuse row elements by game id instead of rebuilding them.
  trackById(_index: number, game: GameCatalogRow): number {
    return game.id;
  }
}
