import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Votes } from '../classes/votes';
import { Game } from '../classes/game';
import { Auth } from './auth';
import { environment } from '../../environments/environment';

interface VoteRow {
  userId: number;
  categoryId: number;
  gameId: number;
  createdAt: string;
}

// One row of GET /api/votes/stats: a game and how many votes it received.
export interface GameVoteStat {
  gameId: number;
  title: string;
  coverImage: string | null;
  votes: number;
}

// One row of GET /api/votes/me/games: a vote with its full game and category name.
export interface VotedGame {
  categoryId: number;
  categoryName: string;
  createdAt: Date;
  game: Game;
}

interface VotedGameRow {
  categoryId: number;
  categoryName: string;
  createdAt: string;
  game: {
    id: number;
    title: string;
    description: string;
    studio: string;
    genre: string;
    rating: number;
    coverImage: string;
    gallery: string[];
    year: number;
  };
}

@Injectable({
  providedIn: 'root',
})
export class VoteService {
  constructor(private http: HttpClient, private auth: Auth) {}

  async castVote(gameId: number, categoryId: number): Promise<Votes> {
    const headers = await this.authHeaders();
    const row = await firstValueFrom(
      this.http.post<VoteRow>(`${environment.apiUrl}/votes`, { gameId, categoryId }, { headers })
    );
    return this.toVote(row);
  }

  async getMyVotes(): Promise<Votes[]> {
    const headers = await this.authHeaders();
    const rows = await firstValueFrom(
      this.http.get<VoteRow[]>(`${environment.apiUrl}/votes/me`, { headers })
    );
    return rows.map((row) => this.toVote(row));
  }

  async getMyVotedGames(): Promise<VotedGame[]> {
    const headers = await this.authHeaders();
    const rows = await firstValueFrom(
      this.http.get<VotedGameRow[]>(`${environment.apiUrl}/votes/me/games`, { headers })
    );
    return rows.map(({ categoryId, categoryName, createdAt, game }) => ({
      categoryId,
      categoryName,
      createdAt: new Date(createdAt),
      game: new Game(
        game.id,
        game.title,
        game.description,
        game.studio,
        game.genre,
        game.rating,
        game.coverImage,
        game.gallery ?? [],
        [],
        game.year
      ),
    }));
  }

  // Admin only. categoryId = null returns the totals across every award category.
  async getVoteStats(categoryId: number | null): Promise<GameVoteStat[]> {
    const headers = await this.authHeaders();
    const params: Record<string, number> = categoryId === null ? {} : { categoryId };
    return firstValueFrom(
      this.http.get<GameVoteStat[]>(`${environment.apiUrl}/votes/stats`, { headers, params })
    );
  }

  private async authHeaders(): Promise<Record<string, string>> {
    const idToken = await this.auth.getIdToken();
    if (!idToken) {
      throw new Error('Not signed in');
    }
    return { Authorization: `Bearer ${idToken}` };
  }

  private toVote(row: VoteRow): Votes {
    return new Votes(row.userId, row.categoryId, row.gameId, new Date(row.createdAt));
  }
}
