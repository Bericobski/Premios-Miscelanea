import { Component } from '@angular/core';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  user = {
    username: '',
    password: ''
  };
  error: string = '';

  constructor(private authService: Auth) {}

  onLogin() {
    const user = this.authService.getUser();
    if (user && user.name === this.user.username && user.password === this.user.password) {
      this.authService.login();
      // Redirect to home page 
      window.location.href = '/home';
    } else {
      this.error = 'Invalid username or password';
    }
  }

}
