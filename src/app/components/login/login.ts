import { Component } from '@angular/core';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Auth } from '../../services/auth';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  user = {
    username: '',
    password: ''
  };
  error: string = '';

  constructor(private authService: Auth, private router: Router) {}

  onLogin() {
    const user = this.authService.getUser();
    if (this.authService.login(this.user.username, this.user.password)) {
      // Redirect to home page 
      this.router.navigate(['/home']);
    } else {
      this.error = 'Invalid username or password';
    }
  }

}
