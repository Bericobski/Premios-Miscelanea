import { Component } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-register',
  imports: [RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
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
