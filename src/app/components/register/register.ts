import { Component, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Auth } from '../../services/auth';

// Same rules the API applies in PUT /api/users/me.
const NICKNAME_PATTERN = /^[A-Za-z0-9._-]+$/;

// Form-level validator: password and confirmPassword must be equal.
function passwordsMatch(group: AbstractControl): ValidationErrors | null {
  const password = group.get('password')?.value;
  const confirm = group.get('confirmPassword')?.value;
  return password && confirm && password !== confirm ? { passwordsMismatch: true } : null;
}

@Component({
  selector: 'app-register',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  error: string = '';
  submitting = false;

  readonly form = inject(FormBuilder).nonNullable.group(
    {
      name: ['', [Validators.required, Validators.maxLength(100)]],
      surename: ['', [Validators.maxLength(100)]],
      nickname: ['', [Validators.required, Validators.maxLength(100), Validators.pattern(NICKNAME_PATTERN)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: passwordsMatch }
  );

  constructor(private authService: Auth, private router: Router) {}

  // True when the field was touched and fails the given validator.
  hasError(field: keyof typeof this.form.controls, validator: string): boolean {
    const control = this.form.controls[field];
    return control.touched && control.hasError(validator);
  }

  async onRegister() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.error = '';
    this.submitting = true;
    const { name, surename, nickname, email, password } = this.form.getRawValue();
    try {
      await this.authService.registerWithEmail({
        name: name.trim(),
        surename: surename.trim(),
        nickname: nickname.trim(),
        email: email.trim().toLowerCase(),
        password,
      });
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
