import { Component, ElementRef, ViewChild } from '@angular/core';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { NavBar } from '../../core/navBar/navBar';
import { Footer } from '../../core/footer/footer';
import { Game } from '../../classes/game';
import { GameComment } from '../../classes/gamecomment';
import { GameService } from '../../services/game.service';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import gamesjson from '../../../assets/data/games.json';
import gamesbigjson from '../../../assets/data/gamesBig.json';
import { FilterGamesPipe } from '../../pipes/filter-games-pipe';
import { Observable } from 'rxjs';
import { A } from '@angular/cdk/keycodes';
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

  constructor(private gameService: GameService, private router: Router) {
    this.gamesFromJSON();
  }

  gamesFromJSON() {
    this.games = gamesjson.map((gameData: any) => new Game(
      gameData.id,
      gameData.title,
      gameData.description,
      gameData.developer,
      gameData.genre,
      gameData.rating,
      gameData.coverImage,
      gameData.gallery,
      gameData.categories,
      gameData.comments.map((comment: any) => new GameComment(1, comment.username, comment.text, 2, 2))
    ));
  }

  gamesFromBigJSON() {
    this.games = gamesbigjson.map((gameData: any) => new Game(
      gameData.id,
      gameData.title,
      gameData.description,
      gameData.developer,
      gameData.genre,
      gameData.rating,
      gameData.coverImage,
      gameData.gallery,
      gameData.categories,
      gameData.comments.map((comment: any) => new GameComment(1,comment.username, comment.text, 2, 2))
    ));
  }

  initializeGames() {
    this.games = [
      new Game(
        1,
        'Super Mario Odyssey',
        'Join Mario as he travels to fantastic new worlds collecting Power Moons.',
        'Nintendo',
        'Adventure',
        4,
        'https://juegosdigitalesargentina.com/files/images/productos/1644882134-1637878223-super-mario-odyssey.jpg',
        [
          'https://media.vandal.net/i/640x360/10-2023/17/202310171423122_1.jpg',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRBkWkce8Si9jchfuvjcPjrBINQ5eS_aSe3Nw&s',
          'https://www.nintendo.com/eu/media/images/10_share_images/portals_3/2x1_SuperMarioHub.jpg'
        ],
        ['Best Story', 'Best Graphics', 'Best Gameplay'],
        [
          new GameComment(1, 'Bruno', 'Amazing game!', 1, 1),
          new GameComment(2, 'Alex', 'Could be better.', 1, 1)
        ]
      ),
      new Game(
        2,
        'The Legend of Zelda',
        'Embark on an epic adventure as Link in this legendary quest.',
        'Nintendo',
        'Adventure',
        5,
        'https://upload.wikimedia.org/wikipedia/en/thumb/c/c6/The_Legend_of_Zelda_Breath_of_the_Wild.jpg/250px-The_Legend_of_Zelda_Breath_of_the_Wild.jpg',
        [
          'https://media.vandal.net/i/640x360/10-2023/17/202310171423122_1.jpg',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRBkWkce8Si9jchfuvjcPjrBINQ5eS_aSe3Nw&s'
        ],
        ['Best Story', 'Best World'],
        [
          new GameComment(3, 'Maria', 'Masterpiece!', 2, 1)
        ]
      ),
      new Game(
        3,
        'Metroid Prime',
        'Experience Metroid Prime like never before.',
        'Nintendo',
        'Action',
        4,
        'https://assets.nintendo.com/image/upload/q_auto/f_auto/store/software/switch/70010000063709/32b85837beea0eee31220a59e247219662de4011f7a8c18fce61cf99a4933eb7',
        [
          'https://media.vandal.net/i/640x360/10-2023/17/202310171423122_1.jpg'
        ],
        ['Best Gameplay', 'Best Combat'],
        [
          new GameComment(4, 'John', 'Epic!', 3, 1),
          new GameComment(5, 'Sarah', 'Love it!', 3, 1)
        ]
      ),
      new Game(
        4,
        'Donkey Kong Country',
        'The classic side-scrolling adventure is back!',
        'Nintendo',
        'Platformer',
        4,
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ-gZ8nuCxMdYAUvUo6WTyXAIbabDajPtV7Nw&s',
        [
          'https://media.vandal.net/i/640x360/10-2023/17/202310171423122_1.jpg',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRBkWkce8Si9jchfuvjcPjrBINQ5eS_aSe3Nw&s',
          'https://www.nintendo.com/eu/media/images/10_share_images/portals_3/2x1_SuperMarioHub.jpg'
        ],
        ['Best Level Design', 'Most Fun'],
        [
          new GameComment(1, 'Tom', 'Great game!', 4, 1),
        ]
      )
    ];
  }

  goToGamePage(game: Game) {
    this.gameService.setSelectedGame(game);
    this.router.navigate(['/game-page']);
  }
}
