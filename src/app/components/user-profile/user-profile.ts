import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { NavBar } from '../../core/navBar/navBar';
import { Footer } from '../../core/footer/footer';  
import { User, UserRole } from '../../classes/user';
import { Game } from '../../classes/game';
import { GameService } from '../../services/game.service';


interface Vote {
  game: Game;
  category: string;
}

@Component({
  selector: 'app-user-profile',
  imports: [NavBar, Footer, RouterLink, RouterOutlet],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.scss',
})
export class UserProfile {
  constructor(private router: Router, private gameService: GameService) {}


  completion = 75;
  user : User = new User(
    1,
    'Bruno',
    'Bevilaqua',
    'bruno.bevilaqua',
    'bruno.bevilaqua@example.com',
    'password123',
    'profile.jpg',
    'I am a passionate gamer and reviewer.',
    UserRole.USER
  );
  games: Game[] = [
    new Game(1, 'The Guest: Home Alone', 'The Guest: Home Alone is a short psychological horror experience. You play as Tyler, a man who returns home after a long day at work seeking rest \u2014 but something feels wrong. Are you really alone?.', 'Unknown', 'Adventure', 3, 'https://images.igdb.com/igdb/image/upload/t_cover_big/cobqbx.jpg', ['https://images.igdb.com/igdb/image/upload/t_screenshot_big/sc12izb.jpg', 'https://images.igdb.com/igdb/image/upload/t_screenshot_big/sc12izc.jpg', 'https://images.igdb.com/igdb/image/upload/t_screenshot_big/sc12izd.jpg', 'https://images.igdb.com/igdb/image/upload/t_screenshot_big/sc12ize.jpg', 'https://images.igdb.com/igdb/image/upload/t_screenshot_big/sc12izf.jpg'], ['Most Anticipated', 'Best Story', 'Best World'], []),
  ];
  
  votes: Vote[] = [
    { game: this.games[0], category: 'Best Story' },
    { game: this.games[0], category: 'Most Anticipated' },
    { game: this.games[0], category: 'Best World' },
  ];

  navigateToGame(gameId: number): void {
    this.router.navigate(['/game', gameId]);
  }

  goToGamePage(game: Game) {
    this.gameService.setSelectedGame(game);
    this.router.navigate(['/game-page']);
  }

}
