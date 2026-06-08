import { Injectable } from '@angular/core';
import { Game } from '../classes/game';

@Injectable({
    providedIn: 'root'
})
export class GameService {
    private selectedGame: Game | null = null;

    setSelectedGame(game: Game) {
        this.selectedGame = game;
    }

    getSelectedGame(): Game | null {
        return this.selectedGame;
    }
}
