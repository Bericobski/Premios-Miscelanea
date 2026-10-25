import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, firstValueFrom, map } from 'rxjs';
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile as updateFirebaseProfile,
  User as FirebaseUser,
} from 'firebase/auth';
import { firebaseAuth } from '../core/firebase.config';
import { ProfileChanges, UserProfile, UserRole } from '../classes/user';
import { environment } from '../../environments/environment';

const ERROR_MESSAGES: Record<string, string> = {
  'auth/popup-closed-by-user': 'Sign-in was cancelled.',
  'auth/popup-blocked': 'Your browser blocked the sign-in popup. Please allow popups and try again.',
  'auth/cancelled-popup-request': 'Sign-in was cancelled.',
  'auth/email-already-in-use': 'An account with that email already exists. Try logging in instead.',
  'auth/invalid-email': 'Enter a valid email address.',
  'auth/weak-password': 'The password must be at least 6 characters.',
  'auth/invalid-credential': 'Wrong email or password.',
  'auth/too-many-requests': 'Too many attempts. Please wait a moment and try again.',
  'auth/operation-not-allowed': 'Email/password sign-in is not enabled in the Firebase project.',
};

// Fields collected by the register form.
export interface EmailRegistration {
  name: string;
  surename: string;
  nickname: string;
  email: string;
  password: string;
}

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
  // True for accounts that sign in with email/password (only these can upload a profile picture).
  isPasswordUser$ = this.currentUser$.pipe(
    map((user) => !!user?.providerData.some((provider) => provider.providerId === 'password'))
  );

  // Settles once the current user's profile sync has finished (null when signed out).
  private profileReady: Promise<UserProfile | null> = Promise.resolve(null);

  constructor(private http: HttpClient) {
    onAuthStateChanged(firebaseAuth, (user) => {
      this.currentUserSubject.next(user);
      if (user) {
        this.profileReady = this.syncProfile(user);
      } else {
        this.profileSubject.next(null);
        this.profileReady = Promise.resolve(null);
      }
    });
  }

  // Resolves once Firebase has restored the session and the MySQL profile is loaded (null = signed out).
  // Guards use this instead of profile$, which is still null right after a page refresh.
  async getProfile(): Promise<UserProfile | null> {
    await firebaseAuth.authStateReady();
    return this.profileReady;
  }

  async loginWithGoogle(): Promise<void> {
    try {
      await signInWithPopup(firebaseAuth, new GoogleAuthProvider());
    } catch (err: any) {
      throw new Error(ERROR_MESSAGES[err?.code] ?? 'Something went wrong signing in with Google.');
    }
  }

  async loginWithEmail(email: string, password: string): Promise<void> {
    try {
      await signInWithEmailAndPassword(firebaseAuth, email, password);
    } catch (err: any) {
      throw new Error(ERROR_MESSAGES[err?.code] ?? 'Something went wrong signing in.');
    }
  }

  // Creates the Firebase account, then saves the form's name/nickname into the MySQL profile
  // (syncProfile creates the row with placeholder values, since email users have no displayName).
  async registerWithEmail(form: EmailRegistration): Promise<UserProfile> {
    // If a previous attempt created the account but failed saving the profile (e.g. nickname taken),
    // reuse the signed-in account instead of failing with email-already-in-use.
    let user = firebaseAuth.currentUser;
    if (user?.email !== form.email) {
      try {
        user = (await createUserWithEmailAndPassword(firebaseAuth, form.email, form.password)).user;
      } catch (err: any) {
        throw new Error(ERROR_MESSAGES[err?.code] ?? 'Something went wrong creating your account.');
      }
    }

    await updateFirebaseProfile(user!, { displayName: `${form.name} ${form.surename}`.trim() });

    if (!(await this.getProfile())) {
      throw new Error('Your account was created but your profile could not be loaded. Please try again.');
    }

    try {
      return await this.updateProfile({
        name: form.name,
        surename: form.surename,
        nickname: form.nickname,
        email: form.email,
        bio: '',
      });
    } catch (err) {
      const message = err instanceof HttpErrorResponse ? err.error?.error : null;
      throw new Error(message ?? 'Your account was created but your profile could not be saved.');
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
    this.profileReady = Promise.resolve(profile);
    return profile;
  }

  // Uploads a new profile picture (email/password accounts only) and publishes the updated profile to profile$.
  async uploadProfilePicture(file: File): Promise<UserProfile> {
    const idToken = await this.getIdToken();
    if (!idToken) {
      throw new Error('Not signed in');
    }
    const body = new FormData();
    body.append('picture', file);
    const profile = await firstValueFrom(
      this.http.post<UserProfile>(`${environment.apiUrl}/users/me/profile-picture`, body, {
        headers: { Authorization: `Bearer ${idToken}` },
      })
    );
    this.profileSubject.next(profile);
    this.profileReady = Promise.resolve(profile);
    return profile;
  }

  // Creates/fetches the MySQL profile for the Firebase user. Returns null on failure so guards never hang.
  private async syncProfile(user: FirebaseUser): Promise<UserProfile | null> {
    try {
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
      return profile;
    } catch (error) {
      console.error('Failed to sync profile', error);
      this.profileSubject.next(null);
      return null;
    }
  }
}