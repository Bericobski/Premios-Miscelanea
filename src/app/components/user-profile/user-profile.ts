import { Component, computed, effect, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavBar } from '../../core/navBar/navBar';
import { Footer } from '../../core/footer/footer';
import { ProfileChanges } from '../../classes/user';
import { Game } from '../../classes/game';
import { Category } from '../../classes/category';
import { GameService } from '../../services/game.service';
import { Auth } from '../../services/auth';
import { AwardCategoryService } from '../../services/award-category.service';
import { VotedGame, VoteService } from '../../services/vote.service';

const PICTURE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_PICTURE_BYTES = 2 * 1024 * 1024;

@Component({
  selector: 'app-user-profile',
  imports: [NavBar, Footer, RouterLink, FormsModule],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.scss',
})
export class UserProfile {
  // The signed-in user's MySQL profile (null while loading or when signed out).
  readonly profile;
  readonly isLogged;
  readonly isPasswordUser;

  readonly votes = signal<VotedGame[]>([]);
  readonly votesLoading = signal<boolean>(true);
  readonly categories = signal<Category[]>([]);

  // Percentage of active award categories the user has voted in.
  readonly completion = computed(() => {
    const total = this.categories().length;
    return total === 0 ? 0 : Math.round((this.votes().length / total) * 100);
  });

  readonly editing = signal<boolean>(false);
  readonly saving = signal<boolean>(false);
  readonly editError = signal<string | null>(null);
  readonly uploadingPicture = signal<boolean>(false);
  readonly pictureError = signal<string | null>(null);

    editForm: ProfileChanges = { name: '', surename: '', nickname: '', email: '', bio: '' };

  constructor(
    private router: Router,
    private gameService: GameService,
    private authService: Auth,
    private voteService: VoteService,
    awardCategoryService: AwardCategoryService
  ) {
    this.profile = toSignal(this.authService.profile$, { initialValue: null });
    this.isLogged = toSignal(this.authService.isLogged$, { initialValue: false });
    this.isPasswordUser = toSignal(this.authService.isPasswordUser$, { initialValue: false });

    awardCategoryService.getActiveCategories().subscribe((categories) => this.categories.set(categories));

    // Load the user's votes once their profile is available.
    effect(() => {
      if (!this.profile()) {
        this.votes.set([]);
        return;
      }

      this.votesLoading.set(true);
      this.voteService
        .getMyVotedGames()
        .then((votes) => this.votes.set(votes))
        .catch((error) => console.error('Failed to load votes', error))
        .finally(() => this.votesLoading.set(false));
    });
  }

  startEdit(): void {
    const profile = this.profile();
    if (!profile) return;

    this.editForm = {
      name: profile.name,
      surename: profile.surename,
      nickname: profile.nickname,
      email: profile.email,
      bio: profile.bio ?? '',
    };
    this.editError.set(null);
    this.editing.set(true);
  }

  cancelEdit(): void {
    this.editing.set(false);
    this.editError.set(null);
  }

  async saveProfile(): Promise<void> {
    this.editError.set(null);
    this.saving.set(true);

    try {
      await this.authService.updateProfile(this.editForm);
      this.editing.set(false);
    } catch (error) {
      console.error('Failed to update profile', error);
      this.editError.set(
        error instanceof HttpErrorResponse && error.error?.error
          ? error.error.error
          : 'Something went wrong saving your profile. Please try again.'
      );
    } finally {
      this.saving.set(false);
    }
  }

  async onPictureSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = ''; // lets the same file be picked again after an error
    if (!file) return;

    this.pictureError.set(null);
    if (!PICTURE_TYPES.includes(file.type)) {
      this.pictureError.set('Choose a JPG, PNG, WEBP or GIF image.');
      return;
    }
    if (file.size > MAX_PICTURE_BYTES) {
      this.pictureError.set('The picture must be at most 2 MB.');
      return;
    }

    this.uploadingPicture.set(true);
    try {
      await this.authService.uploadProfilePicture(file);
    } catch (error) {
      console.error('Failed to upload profile picture', error);
      this.pictureError.set(
        error instanceof HttpErrorResponse && error.error?.error
          ? error.error.error
          : 'Something went wrong uploading your picture. Please try again.'
      );
    } finally {
      this.uploadingPicture.set(false);
    }
  }

  goToGamePage(game: Game) {
    this.gameService.setSelectedGame(game);
    this.router.navigate(['/game-page']);
  }
}
