import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth';
import { UserRole } from '../classes/user';

// Allows the route only to users whose role is listed in route.data.roles.
// Signed out -> /login, signed in with the wrong role -> /home.
export const roleGuard: CanActivateFn = async (route) => {
  const auth = inject(Auth);
  const router = inject(Router);
  const profile = await auth.getProfile();

  if (!profile) {
    return router.createUrlTree(['/login']);
  }

  const roles = (route.data['roles'] as UserRole[] | undefined) ?? [];
  return roles.length === 0 || roles.includes(profile.role) ? true : router.createUrlTree(['/home']);
};
