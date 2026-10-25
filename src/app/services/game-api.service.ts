import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, firstValueFrom, map } from 'rxjs';
import { Game } from '../classes/game';
import { Auth } from './auth';
import { environment } from '../../environments/environment';

interface GameRow {
  id: number;
  title: string;
  description: string;
  studio: string;
  genre: string;
  rating: number;
  coverImage: string;
  gallery: string[];
  year: number;
}

// One row of GET /api/games/catalog: just the text columns, no images.
export interface GameCatalogRow {
  id: number;
  title: string;
  studio: string;
  year: number;
}

// Body of POST /api/games (admin only).
export interface NewGame {
  title: string;
  studio: string;
  genre: string;
  year: number;
  rating: number;
  coverImage: string;
  description: string;
}

// Response of DELETE /api/games/:id.
export interface DeleteGameResult {
  deleted: boolean;
  votesDeleted: number;
  commentsDeleted?: number;
  commentsCleanup?: 'failed';
}

export interface GamesPage {
  games: Game[];
  total: number;
}

@Injectable({
  providedIn: 'root',
})
export class GameApiService {
  constructor(private http: HttpClient, private auth: Auth) {}

  // `genre` is optional: when given, only games of that genre are returned (e.g. 'Adventure').
  // `random` returns a random selection instead of the usual id order.
  getGames(limit: number, offset: number, genre?: string, random = false): Observable<GamesPage> {
    const params: Record<string, string | number> = { limit, offset };
    if (genre) {
      params['genre'] = genre;
    }
    if (random) {
      params['random'] = 'true';
    }
    return this.http
      .get<{ games: GameRow[]; total: number }>(`${environment.apiUrl}/games`, { params })
      .pipe(
        map(({ games, total }) => ({
          games: games.map((row) => this.toGame(row)),
          total,
        }))
      );
  }

  // All games at once (text only) for the admin catalog table.
  getCatalog(): Observable<GameCatalogRow[]> {
    return this.http.get<GameCatalogRow[]>(`${environment.apiUrl}/games/catalog`);
  }

  // One full game (description, cover, gallery...) by id.
  getGame(id: number): Promise<Game> {
    return firstValueFrom(
      this.http.get<GameRow>(`${environment.apiUrl}/games/${id}`).pipe(map((row) => this.toGame(row)))
    );
  }

  // Distinct genres already in the catalog (for the add-game form).
  getGenres(): Observable<string[]> {
    return this.http.get<string[]>(`${environment.apiUrl}/games/genres`);
  }

  // Admin only: creates a game and returns it as saved in MySQL.
  async createGame(input: NewGame): Promise<Game> {
    const headers = await this.authHeaders();
    const row = await firstValueFrom(this.http.post<GameRow>(`${environment.apiUrl}/games`, input, { headers }));
    return this.toGame(row);
  }

  // Admin only: deletes the game together with its votes and comments.
  async deleteGame(id: number): Promise<DeleteGameResult> {
    const headers = await this.authHeaders();
    return firstValueFrom(this.http.delete<DeleteGameResult>(`${environment.apiUrl}/games/${id}`, { headers }));
  }

  private async authHeaders(): Promise<Record<string, string>> {
    const idToken = await this.auth.getIdToken();
    if (!idToken) {
      throw new Error('Not signed in');
    }
    return { Authorization: `Bearer ${idToken}` };
  }

  private toGame(row: GameRow): Game {
    return new Game(
      row.id,
      row.title,
      row.description,
      row.studio,
      row.genre,
      row.rating,
      row.coverImage,
      row.gallery ?? [],
      [],
      row.year
    );
  }
}
