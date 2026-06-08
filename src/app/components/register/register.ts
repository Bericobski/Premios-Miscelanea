import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Routes, RouterLink } from '@angular/router';

import { User, UserRole } from '../../classes/user'; 

@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {

  // TEMPORARY SESSION STORAGE
  users: User[] = [];

  // FORM FIELDS
  name: string = '';
  surename: string = '';
  nickname: string = '';
  email: string = '';
  password: string = '';
  bio: string = '';

  register(): void {

    const newUser = new User(
      this.users.length + 1, // simple id
      this.name,
      this.surename,
      this.nickname,
      this.email,
      this.password,
      'https://i.imgur.com/HeIi0wU.png', // default profile picture
      this.bio,
      UserRole.USER
    );

    // Save user in current session memory
    this.users.push(newUser);

    console.log('Registered user:', newUser);
    console.log('All users:', this.users);

    // OPTIONAL: clear form after register
    this.name = '';
    this.surename = '';
    this.nickname = '';
    this.email = '';
    this.password = '';
    this.bio = '';
  }
}