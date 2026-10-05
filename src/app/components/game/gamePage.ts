import { Component, ElementRef, ViewChild, effect, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { Game } from '../../classes/game';
import { CommentCategory, GameComment } from '../../classes/gamecomment';
import { Category } from '../../classes/category';
import { UserProfile } from '../../classes/user';
import { NavBar } from '../../core/navBar/navBar';
import { GameService } from '../../services/game.service';
import { AwardCategoryService } from '../../services/award-category.service';
import { GameCommentService } from '../../services/game-comment.service';
import { VoteService } from '../../services/vote.service';
import { Footer } from '../../core/footer/footer';
import { FormsModule } from '@angular/forms';
import { Observable, map } from 'rxjs';
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

  categories: Category[] = [];

  // Reactive identity of the signed-in user, derived from the Auth observables so
  // comment ownership/permission checks can be read synchronously in the template.
  private readonly currentUid: () => string | null;
  private readonly currentProfile: () => UserProfile | null;
  readonly isAdmin: () => boolean;

  readonly gameId = signal<number>(0);
  readonly comments = signal<GameComment[]>([]);
  readonly commentsLoading = signal<boolean>(true);

  readonly editingCommentId = signal<string | null>(null);
  readonly commentActionError = signal<string | null>(null);

  // The signed-in user's votes as categoryId -> gameId (one vote per award category).
  readonly myVotes = signal<Map<number, number>>(new Map());
  readonly votingCategoryId = signal<number | null>(null);
  readonly voteMessage = signal<string | null>(null);
  readonly voteError = signal<string | null>(null);

  newComment = {
    commentText: '',
    categoryIds: [] as number[]
  };

  editCommentText = '';
  editCategoryIds: number[] = [];

  constructor(
    private gameService: GameService,
    private authService: Auth,
    private awardCategoryService: AwardCategoryService,
    private gameCommentService: GameCommentService,
    private voteService: VoteService
  ) {
    const selectedGame = this.gameService.getSelectedGame();

    this.isAdmin$ = this.authService.isAdmin$;
    this.isLogged$ = this.authService.isLogged$;

    this.currentUid = toSignal(
      this.authService.currentUser$.pipe(map((user) => user?.uid ?? null)),
      { initialValue: null }
    );
    this.currentProfile = toSignal(this.authService.profile$, { initialValue: null });
    this.isAdmin = toSignal(this.authService.isAdmin$, { initialValue: false });

    this.awardCategoryService.getActiveCategories().subscribe((categories) => {
      this.categories = categories;
    });

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
        ['Best Story', 'Best Graphics', 'Best Gameplay']
      );
      this.currentCoverImage = this.game.coverImage;
    }

    this.gameId.set(this.game.id);

    // Keep a live Firestore subscription in sync with gameId, tearing down the
    // previous listener whenever it changes (or the component is destroyed).
    effect((onCleanup) => {
      const gameId = this.gameId();
      this.commentsLoading.set(true);

      const unsubscribe = this.gameCommentService.listenToComments(gameId, (comments) => {
        this.comments.set(comments);
        this.commentsLoading.set(false);
      });

      onCleanup(() => unsubscribe());
    });

    // Load the user's votes once their MySQL profile exists (it's created on first login),
    // and clear them on logout.
    effect(() => {
      if (!this.currentProfile()) {
        this.myVotes.set(new Map());
        return;
      }

      this.voteService
        .getMyVotes()
        .then((votes) => this.myVotes.set(new Map(votes.map((v) => [v.categoryId, v.gameId]))))
        .catch((error) => console.error('Failed to load votes', error));
    });
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

  hasVotedHere(categoryId: number): boolean {
    return this.myVotes().get(categoryId) === this.game.id;
  }

  async vote(category: Category): Promise<void> {
    this.voteMessage.set(null);
    this.voteError.set(null);

    if (!this.currentProfile()) {
      this.voteError.set('You need to be signed in to vote.');
      return;
    }

    if (this.hasVotedHere(category.id)) {
      this.voteMessage.set(`You already voted for this game in ${category.name}.`);
      return;
    }

    const previousGameId = this.myVotes().get(category.id);
    this.votingCategoryId.set(category.id);

    try {
      const saved = await this.voteService.castVote(this.game.id, category.id);

      this.myVotes.update((votes) => new Map(votes).set(saved.categoryId, saved.gameId));
      this.voteMessage.set(
        previousGameId !== undefined
          ? `Your vote for ${category.name} was moved to this game.`
          : `Vote saved for ${category.name}!`
      );
    } catch (error) {
      console.error('Failed to save vote', error);
      this.voteError.set('Something went wrong saving your vote. Please try again.');
    } finally {
      this.votingCategoryId.set(null);
    }
  }

  canManageComment(comment: GameComment): boolean {
    const uid = this.currentUid();
    return (!!uid && comment.userFirebaseUid === uid) || this.isAdmin();
  }

  hasLiked(comment: GameComment): boolean {
    return comment.isLikedBy(this.currentUid());
  }

  isNewCommentCategorySelected(categoryId: number): boolean {
    return this.newComment.categoryIds.includes(categoryId);
  }

  toggleCategoryForNewComment(categoryId: number): void {
    this.newComment.categoryIds = this.toggleId(this.newComment.categoryIds, categoryId);
  }

  isEditCategorySelected(categoryId: number): boolean {
    return this.editCategoryIds.includes(categoryId);
  }

  toggleCategoryForEdit(categoryId: number): void {
    this.editCategoryIds = this.toggleId(this.editCategoryIds, categoryId);
  }

  private toggleId(ids: number[], id: number): number[] {
    return ids.includes(id) ? ids.filter((existing) => existing !== id) : [...ids, id];
  }

  private selectedCategories(categoryIds: number[]): CommentCategory[] {
    return this.categories
      .filter((category) => categoryIds.includes(category.id))
      .map((category) => ({ id: category.id, name: category.name }));
  }

  async addComment(): Promise<void> {
    this.commentActionError.set(null);

    const uid = this.currentUid();
    if (!uid) {
      this.commentActionError.set('You need to be signed in to comment.');
      return;
    }

    const profile = this.currentProfile();
    if (!profile) {
      this.commentActionError.set("Your profile hasn't loaded yet — try again in a moment.");
      return;
    }

    if (!this.newComment.commentText.trim()) {
      this.commentActionError.set('Write something before posting.');
      return;
    }

    try {
      await this.gameCommentService.addComment({
        gameId: this.game.id,
        userId: profile.id,
        userFirebaseUid: uid,
        userName: profile.nickname,
        commentText: this.newComment.commentText.trim(),
        categories: this.selectedCategories(this.newComment.categoryIds)
      });

      this.newComment = { commentText: '', categoryIds: [] };
    } catch (error) {
      console.error('Failed to post comment', error);
      this.commentActionError.set('Something went wrong posting your comment. Please try again.');
    }
  }

  startEditComment(comment: GameComment): void {
    this.editingCommentId.set(comment.id);
    this.editCommentText = comment.commentText;
    this.editCategoryIds = comment.categories.map((category) => category.id);
  }

  cancelEditComment(): void {
    this.editingCommentId.set(null);
    this.editCommentText = '';
    this.editCategoryIds = [];
  }

  async saveEditComment(comment: GameComment): Promise<void> {
    this.commentActionError.set(null);

    if (!this.editCommentText.trim()) {
      this.commentActionError.set('Write something before saving.');
      return;
    }

    try {
      await this.gameCommentService.updateComment(
        comment.id,
        this.editCommentText.trim(),
        this.selectedCategories(this.editCategoryIds)
      );

      this.cancelEditComment();
    } catch (error) {
      console.error('Failed to update comment', error);
      this.commentActionError.set('Something went wrong saving your changes. Please try again.');
    }
  }

  async deleteComment(comment: GameComment): Promise<void> {
    this.commentActionError.set(null);

    try {
      await this.gameCommentService.deleteComment(comment.id);
    } catch (error) {
      console.error('Failed to delete comment', error);
      this.commentActionError.set('Something went wrong deleting the comment. Please try again.');
    }
  }

  async toggleLike(comment: GameComment): Promise<void> {
    this.commentActionError.set(null);

    const uid = this.currentUid();
    if (!uid) {
      this.commentActionError.set('You need to be signed in to like a comment.');
      return;
    }

    try {
      await this.gameCommentService.toggleLike(comment.id, uid);
    } catch (error) {
      console.error('Failed to update like', error);
      this.commentActionError.set('Something went wrong updating your like. Please try again.');
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
