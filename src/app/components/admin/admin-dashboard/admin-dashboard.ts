import { Component, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavBar } from '../../../core/navBar/navBar';
import { Footer } from '../../../core/footer/footer';
import { UserProfile, UserRole } from '../../../classes/user';
import { Auth } from '../../../services/auth';
import { UserAdminService } from '../../../services/user-admin.service';
import { VoteResults } from '../vote-results/vote-results';
import { GamesTable } from '../games-table/games-table';

const MIN_SEARCH_LENGTH = 3;

@Component({
  selector: 'app-admin-dashboard',
  imports: [NavBar, Footer, FormsModule, VoteResults, GamesTable],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss',
})
export class AdminDashboard {
  readonly minSearchLength = MIN_SEARCH_LENGTH;
  readonly UserRole = UserRole;

  // Empty until the first search.
  readonly users = signal<UserProfile[]>([]);
  readonly searched = signal<boolean>(false);
  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);
  readonly message = signal<string | null>(null);
  readonly profile;

  searchQuery = '';
  // Optional role filters; none checked = every role.
  roles: Record<UserRole, boolean> = { [UserRole.ADMIN]: false, [UserRole.USER]: false };

  constructor(
    private userAdminService: UserAdminService,
    private authService: Auth,
    private router: Router
  ) {
    this.profile = toSignal(this.authService.profile$, { initialValue: null });
  }

  canSearch(): boolean {
    return this.searchQuery.trim().length >= MIN_SEARCH_LENGTH && !this.loading();
  }

  async search() {
    if (!this.canSearch()) return;

    const selectedRoles = (Object.keys(this.roles) as UserRole[]).filter((role) => this.roles[role]);
    this.loading.set(true);
    this.error.set(null);
    this.message.set(null);
    try {
      this.users.set(await this.userAdminService.searchUsers(this.searchQuery.trim(), selectedRoles));
      this.searched.set(true);
    } catch (err) {
      this.error.set(this.errorMessage(err, 'Could not search users.'));
    } finally {
      this.loading.set(false);
    }
  }

  async deleteUser(user: UserProfile) {
    const isSelf = user.id === this.profile()?.id;
    const question = isSelf
      ? `This is your own account. Delete @${user.nickname}? You will be logged out and lose your votes and comments.`
      : `Delete @${user.nickname}? This removes their account, votes and comments.`;
    if (!confirm(question)) return;

    this.error.set(null);
    this.message.set(null);
    try {
      const result = await this.userAdminService.deleteUser(user.id);

      if (result.self) {
        // The Firebase account no longer exists, so clear the local session too.
        await this.authService.logout();
        this.router.navigate(['/home']);
        return;
      }

      this.users.update((users) => users.filter((u) => u.id !== user.id));
      this.message.set(
        result.commentsCleanup === 'failed'
          ? `@${user.nickname} was deleted, but their comments could not be removed.`
          : `@${user.nickname} was deleted (${result.votesDeleted} votes, ${result.commentsDeleted} comments, ${result.likesRemoved} likes removed).`
      );
    } catch (err) {
      this.error.set(this.errorMessage(err, 'Could not delete the user.'));
    }
  }

  suspendUser(userId: number) {
    // To be implemented
    console.log('Suspend user:', userId);
  }

  private errorMessage(err: unknown, fallback: string): string {
    return (err instanceof HttpErrorResponse ? err.error?.error : null) ?? fallback;
  }
}
