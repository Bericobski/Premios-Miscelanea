import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Routes, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

import { User, UserRole } from '../../classes/user'; 

@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink, ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {

  // Form builder 
  registerForm;

  // TEMPORARY SESSION STORAGE
  users: User[] = [];

  // FORM FIELDS
  name: string = '';
  surename: string = '';
  nickname: string = '';
  email: string = '';
  password: string = '';
  bio: string = '';

  constructor(private formBuilder: FormBuilder) {
    this.registerForm = this.formBuilder.group({
      name: ['', Validators.required],
      surename: ['', Validators.required],
      nickname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      bio: ['']
    });
  }

  // Register method to create a new user and store it in the session memory
  registerUser(): void {
    if (this.registerForm.invalid) {
      // Mark all fields as touched to trigger validation messages
      this.registerForm.markAllAsTouched();
      return;
    }

    const formValues = this.registerForm.value as {
      name: string;
      surename: string;
      nickname: string;
      email: string;
      password: string;
      bio: string;
    };

    const newUser = new User(
      this.users.length + 1, // simple id generation
      formValues.name,
      formValues.surename,
      formValues.nickname,
      formValues.email,
      formValues.password,
      'https://i.imgur.com/HeIi0wU.png', // default profile picture
      formValues.bio,
      UserRole.USER
    );

    // Save user in current session memory
    this.users.push(newUser);

    console.log('Registered user:', newUser);
    console.log('All users:', this.users);

    // OPTIONAL: clear form after register
    this.registerForm.reset();
  }

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