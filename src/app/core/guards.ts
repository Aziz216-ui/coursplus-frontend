import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { Role } from './models';

/** Page réservée aux utilisateurs connectés. */
export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  if (auth.isLoggedIn()) return true;
  return inject(Router).createUrlTree(['/connexion'], { queryParams: { retour: state.url } });
};

/** Page réservée à un rôle précis, ex. canActivate: [roleGuard('TEACHER')] */
export function roleGuard(role: Role): CanActivateFn {
  return (_route, state) => {
    const auth = inject(AuthService);
    const router = inject(Router);
    if (!auth.isLoggedIn()) {
      return router.createUrlTree(['/connexion'], { queryParams: { retour: state.url } });
    }
    return auth.role() === role ? true : router.createUrlTree([auth.homeFor()]);
  };
}
