import { Component } from '@angular/core';
import { Auth } from '../../services/auth';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  error: string = '';

  constructor(private authService: Auth, private router: Router) {}

  async onGoogleLogin() {
    this.error = '';
    try {
      await this.authService.loginWithGoogle();
      this.router.navigate(['/home']);
    } catch (err: any) {
      this.error = err.message;
    }
  }
}
