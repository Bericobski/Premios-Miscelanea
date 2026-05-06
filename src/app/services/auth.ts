import { Injectable } from '@angular/core';
import { User, UserRole } from '../classes/user';


@Injectable({
  providedIn: 'root'
})
export class Auth {


  is_Admin: boolean = false;
  is_Logged: boolean = false;


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
        75,
        ['Action', 'Adventure', 'RPG'],
        UserRole.ADMIN);
  }

  getUser(): User | null {
    return this.currentUser;
  }

  get_is_admin(): boolean {
    return this.is_Admin;
  }

  get_is_logged(): boolean {
    return this.is_Logged;
  }

  isAdmin(): boolean {
    return this.currentUser?.role === UserRole.ADMIN;
  }

  login() {
    this.is_Admin = true;
    this.is_Logged = true;
  }

  logout() {
    this.currentUser = null;
  }
}