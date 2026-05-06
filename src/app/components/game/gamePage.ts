import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Game } from '../../classes/game';
import { GameComment } from '../../classes/gamecomment';
import { NavBar } from '../../core/navBar/navBar';

@Component({
  selector: 'app-game-page',
  standalone: true,
  imports: [CommonModule, NavBar],
  templateUrl: './gamePage.html',
  styleUrls: ['./gamePage.scss']
})
export class GamePageComponent {
  @ViewChild('galleryScroll', { static: false }) galleryScroll?: ElementRef<HTMLDivElement>;

  selectedGalleryIndex = 0;
  currentCoverImage = 'https://www.nintendo.com/eu/media/images/10_share_images/portals_3/2x1_SuperMarioHub.jpg';

  game: Game = new Game(
    1,
    'Super mario Odyssey',
    'An open world futuristic RPG where choices matter.',
    'Nintendo',
    'Adventure',
    4,
    this.currentCoverImage,
    [
      'https://media.vandal.net/i/640x360/10-2023/17/202310171423122_1.jpg',
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRBkWkce8Si9jchfuvjcPjrBINQ5eS_aSe3Nw&s',
      'https://www.nintendo.com/eu/media/images/10_share_images/portals_3/2x1_SuperMarioHub.jpg'
    ],
    ['Best Story', 'Best Graphics', 'Best Gameplay'],
    [
      new GameComment('Bruno', 'Amazing game!'),
      new GameComment('Alex', 'Could be better.')
    ]
  );

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
}