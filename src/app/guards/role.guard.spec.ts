import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree, provideRouter } from '@angular/router';
import { vi } from 'vitest';

import { roleGuard } from './role.guard';
import { Auth } from '../services/auth';
import { UserProfile, UserRole } from '../classes/user';

describe('roleGuard', () => {
  const getProfile = vi.fn<() => Promise<UserProfile | null>>();

  const runGuard = (roles: UserRole[]) => {
    const route = { data: { roles } } as unknown as ActivatedRouteSnapshot;
    return TestBed.runInInjectionContext(() => roleGuard(route, {} as RouterStateSnapshot));
  };

  const profileWith = (role: UserRole) => ({ role }) as UserProfile;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: Auth, useValue: { getProfile } }],
    });
  });

  it('redirects signed-out users to /login', async () => {
    getProfile.mockResolvedValue(null);
    const result = (await runGuard([UserRole.ADMIN])) as UrlTree;
    expect(TestBed.inject(Router).serializeUrl(result)).toBe('/login');
  });

  it('redirects users without the required role to /home', async () => {
    getProfile.mockResolvedValue(profileWith(UserRole.USER));
    const result = (await runGuard([UserRole.ADMIN])) as UrlTree;
    expect(TestBed.inject(Router).serializeUrl(result)).toBe('/home');
  });

  it('allows users with the required role', async () => {
    getProfile.mockResolvedValue(profileWith(UserRole.ADMIN));
    expect(await runGuard([UserRole.ADMIN])).toBe(true);
  });
});
