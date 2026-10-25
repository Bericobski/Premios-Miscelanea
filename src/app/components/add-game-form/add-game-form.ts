import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NavBar } from '../../core/navBar/navBar';
import { Footer } from '../../core/footer/footer';
import { GameApiService } from '../../services/game-api.service';

const CURRENT_YEAR = new Date().getFullYear();
// Same rules the API applies in POST /api/games.
const URL_PATTERN = /^https?:\/\/\S+$/i;

// Admin-only form (see roleGuard in app.routes.ts) that adds a game to the MySQL catalog.
@Component({
  selector: 'app-add-game-form',
  imports: [ReactiveFormsModule, NavBar, Footer],
  templateUrl: './add-game-form.html',
  styleUrl: './add-game-form.scss',
})
export class AddGameForm {
  readonly maxYear = CURRENT_YEAR + 5;

  readonly genres = signal<string[]>([]);
  readonly saving = signal<boolean>(false);
  readonly error = signal<string | null>(null);
  readonly success = signal<string | null>(null);
  // False when the cover URL can't be loaded, so the preview falls back to the placeholder.
  readonly coverLoaded = signal<boolean>(true);

  readonly form = inject(FormBuilder).nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(200)]],
    studio: ['', [Validators.maxLength(150)]],
    genre: ['', [Validators.required]],
    year: [CURRENT_YEAR, [Validators.required, Validators.min(1950), Validators.max(this.maxYear)]],
    rating: [3, [Validators.required, Validators.min(1), Validators.max(5)]],
    coverImage: ['', [Validators.maxLength(500), Validators.pattern(URL_PATTERN)]],
    description: ['', [Validators.maxLength(2000)]],
  });

  constructor(private gameApiService: GameApiService) {
    this.gameApiService.getGenres().subscribe({
      next: (genres) => this.genres.set(genres),
      error: () => this.error.set('Could not load the genres list.'),
    });

    // A new URL deserves a new chance to load.
    this.form.controls.coverImage.valueChanges.subscribe(() => this.coverLoaded.set(true));
  }

  // True when the field was touched and fails the given validator.
  hasError(field: keyof typeof this.form.controls, validator: string): boolean {
    const control = this.form.controls[field];
    return control.touched && control.hasError(validator);
  }

  coverPreview(): string | null {
    const control = this.form.controls.coverImage;
    return control.value && control.valid && this.coverLoaded() ? control.value : null;
  }

  async onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.error.set(null);
    this.success.set(null);
    const value = this.form.getRawValue();
    try {
      const game = await this.gameApiService.createGame({
        ...value,
        title: value.title.trim(),
        studio: value.studio.trim(),
        coverImage: value.coverImage.trim(),
        description: value.description.trim(),
      });
      this.success.set(`"${game.title}" was added to the catalog (ID ${game.id}).`);
      this.form.reset();
    } catch (err) {
      const message = err instanceof HttpErrorResponse ? err.error?.error : null;
      this.error.set(message ?? 'Could not add the game. Please try again.');
    } finally {
      this.saving.set(false);
    }
  }
}
