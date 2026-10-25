import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { UserProfile, UserRole } from '../classes/user';
import { Auth } from './auth';
import { environment } from '../../environments/environment';

// Response of DELETE /api/users/:id.
export interface DeleteUserResult {
  deleted: boolean;
  // True when the admin deleted their own account.
  self: boolean;
  votesDeleted: number;
  commentsDeleted?: number;
  likesRemoved?: number;
  commentsCleanup?: 'failed';
}

// Admin-only user management against the API (both routes require an ADMIN token).
@Injectable({
  providedIn: 'root',
})
export class UserAdminService {
  constructor(private http: HttpClient, private auth: Auth) {}

  // Users whose nickname contains `nickname`; an empty `roles` list means every role.
  async searchUsers(nickname: string, roles: UserRole[]): Promise<UserProfile[]> {
    const headers = await this.authHeaders();
    const params: Record<string, string> = { nickname };
    if (roles.length > 0) {
      params['roles'] = roles.join(',');
    }
    return firstValueFrom(this.http.get<UserProfile[]>(`${environment.apiUrl}/users`, { headers, params }));
  }

  async deleteUser(id: number): Promise<DeleteUserResult> {
    const headers = await this.authHeaders();
    return firstValueFrom(this.http.delete<DeleteUserResult>(`${environment.apiUrl}/users/${id}`, { headers }));
  }

  private async authHeaders(): Promise<Record<string, string>> {
    const idToken = await this.auth.getIdToken();
    if (!idToken) {
      throw new Error('Not signed in');
    }
    return { Authorization: `Bearer ${idToken}` };
  }
}
