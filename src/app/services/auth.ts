import { Injectable } from '@angular/core';
import { User, UserRole } from '../classes/user';
import { BehaviorSubject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class Auth {

  // Initial value = false
  private isAdminSubject = new BehaviorSubject<boolean>(false);

  // Observable that components can subscribe to
  isAdmin$ = this.isAdminSubject.asObservable();

  private isLoggedSubject = new BehaviorSubject<boolean>(false);

  isLogged$ = this.isLoggedSubject.asObservable();





  private currentUser: User | null = null;

  constructor() {
    // TEMP: simulate logged user
    this.currentUser = new User(1,
        'Bruno',
        'Bevilaqua',
        'bruno.bevilaqua',
        'bruno.bevilaqua@example.com',
        '123',
        'profile.jpg',
        'I am a passionate gamer and reviewer.',
        UserRole.ADMIN);
  }

  getUser(): User | null {
    return this.currentUser;
  }

  get_is_admin(): boolean {
    if (this.currentUser) {
      return this.currentUser.role === UserRole.ADMIN;
    }
    return false;
  }

  get_is_logged(): boolean {
    return !!this.currentUser;
  }

  isAdmin(): boolean {
    return this.currentUser?.role === UserRole.ADMIN;
  }

  login(name: string, password: string) {
    if (this.currentUser && this.currentUser.name === name && this.currentUser.password === password) {
      // Update the isAdminSubject with the new value
      this.isAdminSubject.next(this.currentUser.role === UserRole.ADMIN);
      // Update the isLoggedSubject with the new value
      this.isLoggedSubject.next(true);
      return true;
    }
    return false;
  }

  logout() {
    this.currentUser = null;
    // Update both subjects when logging out
    this.isAdminSubject.next(false);
    this.isLoggedSubject.next(false);
  }
}