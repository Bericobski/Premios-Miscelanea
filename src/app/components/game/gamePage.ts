import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Game } from '../../classes/game';
import { GameComment } from '../../classes/gamecomment';
import { NavBar } from '../../core/navBar/navBar';
import { GameService } from '../../services/game.service';
import { Footer } from '../../core/footer/footer';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-game-page',
  standalone: true,
  imports: [CommonModule, NavBar, Footer, FormsModule],
  templateUrl: './gamePage.html',
  styleUrls: ['./gamePage.scss']
})
export class GamePageComponent {
  @ViewChild('galleryScroll', { static: false }) galleryScroll?: ElementRef<HTMLDivElement>;

  isAdmin$: Observable<boolean>;
  isLogged$: Observable<boolean>;

  newRating: number;

  selectedGalleryIndex = 0;
  currentCoverImage = '';

  game: Game;

  newComment = {
    user: '',
    message: ''
  };

  constructor(private gameService: GameService, private authService: Auth) {
    const selectedGame = this.gameService.getSelectedGame();

    this.isAdmin$ = this.authService.isAdmin$;
    this.isLogged$ = this.authService.isLogged$;

    this.newRating = 0;
    if (selectedGame) {
      this.game = selectedGame;
      this.currentCoverImage = selectedGame.coverImage;
    } else {
      // Fallback game if none is selected
      this.game = new Game(
        1,
        'Super mario Odyssey',
        'An open world futuristic RPG where choices matter.',
        'Nintendo',
        'Adventure',
        4,
        'https://www.nintendo.com/eu/media/images/10_share_images/portals_3/2x1_SuperMarioHub.jpg',
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
      );
      this.currentCoverImage = this.game.coverImage;
    }
  }

  selectGalleryImage(index: number) {
    this.selectedGalleryIndex = index;
    this.currentCoverImage = this.game.gallery[index] || this.game.coverImage;
    this.scrollToThumbnail(index);
  }

  scrollGallery(direction: number) {
    const nextIndex = this.selectedGalleryIndex + direction;
    const boundedIndex = Math.min(Math.max(nextIndex, 0), this.game.gallery.length - 1);

    if (boundedIndex !== this.selectedGalleryIndex) {
      this.selectGalleryImage(boundedIndex);
    }
  }

  private scrollToThumbnail(index: number) {
    const container = this.galleryScroll?.nativeElement;
    const thumbnail = container?.children[index] as HTMLElement | undefined;

    if (!container || !thumbnail) {
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const thumbRect = thumbnail.getBoundingClientRect();
    const offset = thumbRect.left - containerRect.left - (container.clientWidth - thumbRect.width) / 2;

    container.scrollBy({ left: offset, behavior: 'smooth' });
  }

  vote(category: string) {
    console.log('Voted for:', category);
  }


  addComment(): void {

    
    if (this.newComment.user.trim() && this.newComment.message.trim()) {
      const comment = new GameComment(
        this.game.comments.length + 1,
        this.newComment.user,
        this.newComment.message,
        1,
        1
      );
      
      this.game.comments.push(comment);
      
      // Limpiar el formulario
      this.newComment = {
        user: '',
        message: ''
      };
      
      console.log('Comentario agregado:', comment);
      // Opcional: llamar a un servicio para guardar en la base de datos
      // this.gameService.saveComment(this.game.id, comment);
    }
  }


  updateRating(): void {
    if (this.newRating >= 1 && this.newRating <= 5) {
        this.game.rating = this.newRating;
        this.newRating = 0; // Clear input after submit
        // Optional: call an API to save the rating
    }
  }
}