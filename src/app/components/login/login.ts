import { Component, inject } from '@angular/core';
import { Auth } from '../../services/auth';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  error: string = '';
  submitting = false;

  readonly form = inject(FormBuilder).nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  constructor(private authService: Auth, private router: Router) {}

  async onEmailLogin() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.error = '';
    this.submitting = true;
    const { email, password } = this.form.getRawValue();
    try {
      await this.authService.loginWithEmail(email.trim(), password);
      this.router.navigate(['/home']);
    } catch (err: any) {
      this.error = err.message;
    } finally {
      this.submitting = false;
    }
  }

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
