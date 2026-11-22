import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { ToastService } from './toast.service';

/**
 * Ajoute "Authorization: Bearer <jeton>" à chaque requête vers l'API.
 * Si le serveur répond 401 (jeton expiré ou compte connecté ailleurs),
 * on déconnecte et on renvoie vers la page de connexion.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const toast = inject(ToastService);

  const token = auth.token;
  const isAuthCall = req.url.includes('/api/auth/login') || req.url.includes('/api/auth/register');
  if (token && !isAuthCall) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401 && !isAuthCall && token) {
        auth.clear();
        toast.error(err.error?.message || 'Ta session a expiré, reconnecte-toi.');
        router.navigate(['/connexion'], { queryParams: { retour: router.url } });
      }
      return throwError(() => err);
    }),
  );
};
