import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Game } from '../classes/game';
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

export interface GamesPage {
  games: Game[];
  total: number;
}

@Injectable({
  providedIn: 'root',
})
export class GameApiService {
  constructor(private http: HttpClient) {}

  getGames(limit: number, offset: number): Observable<GamesPage> {
    return this.http
      .get<{ games: GameRow[]; total: number }>(`${environment.apiUrl}/games`, {
        params: { limit, offset },
      })
      .pipe(
        map(({ games, total }) => ({
          games: games.map(
            (row) =>
              new Game(
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
              )
          ),
          total,
        }))
      );
  }
}
