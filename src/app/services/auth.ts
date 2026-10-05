import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, firstValueFrom, map } from 'rxjs';
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  User as FirebaseUser,
} from 'firebase/auth';
import { firebaseAuth } from '../core/firebase.config';
import { ProfileChanges, UserProfile, UserRole } from '../classes/user';
import { environment } from '../../environments/environment';

const ERROR_MESSAGES: Record<string, string> = {
  'auth/popup-closed-by-user': 'Sign-in was cancelled.',
  'auth/popup-blocked': 'Your browser blocked the sign-in popup. Please allow popups and try again.',
  'auth/cancelled-popup-request': 'Sign-in was cancelled.',
};

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private currentUserSubject = new BehaviorSubject<FirebaseUser | null>(null);
  private profileSubject = new BehaviorSubject<UserProfile | null>(null);

  currentUser$ = this.currentUserSubject.asObservable();
  profile$ = this.profileSubject.asObservable();
  isLogged$ = this.currentUser$.pipe(map((user) => !!user));
  isAdmin$ = this.profile$.pipe(map((profile) => profile?.role === UserRole.ADMIN));

  constructor(private http: HttpClient) {
    onAuthStateChanged(firebaseAuth, (user) => {
      this.currentUserSubject.next(user);
      if (user) {
        this.syncProfile(user);
      } else {
        this.profileSubject.next(null);
      }
    });
  }

  async loginWithGoogle(): Promise<void> {
    try {
      await signInWithPopup(firebaseAuth, new GoogleAuthProvider());
    } catch (err: any) {
      throw new Error(ERROR_MESSAGES[err?.code] ?? 'Something went wrong signing in with Google.');
    }
  }

  logout() {
    return signOut(firebaseAuth);
  }

  // Fresh Firebase ID token for authenticated calls to our API (null when signed out).
  async getIdToken(): Promise<string | null> {
    return (await firebaseAuth.currentUser?.getIdToken()) ?? null;
  }

  // Saves the editable profile fields in MySQL and publishes the updated profile to profile$.
  async updateProfile(changes: ProfileChanges): Promise<UserProfile> {
    const idToken = await this.getIdToken();
    if (!idToken) {
      throw new Error('Not signed in');
    }
    const profile = await firstValueFrom(
      this.http.put<UserProfile>(`${environment.apiUrl}/users/me`, changes, {
        headers: { Authorization: `Bearer ${idToken}` },
      })
    );
    this.profileSubject.next(profile);
    return profile;
  }

  private async syncProfile(user: FirebaseUser): Promise<void> {
    const idToken = await user.getIdToken();
    const profile = await firstValueFrom(
      this.http.post<UserProfile>(
        `${environment.apiUrl}/users`,
        {
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
        },
        { headers: { Authorization: `Bearer ${idToken}` } }
      )
    );
    this.profileSubject.next(profile);
  }
}