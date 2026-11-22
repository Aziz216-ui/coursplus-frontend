import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthResponse, User } from './models';

const TOKEN_KEY = 'cp_token';
const USER_KEY = 'cp_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  readonly user = signal<User | null>(this.readUser());
  readonly isLoggedIn = computed(() => this.user() !== null);
  readonly role = computed(() => this.user()?.role ?? null);

  get token(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/api/auth/login`, { email, password })
      .pipe(tap((res) => this.save(res)));
  }

  register(data: { fullName: string; email: string; password: string; universityId: number | null }) {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/api/auth/register`, data)
      .pipe(tap((res) => this.save(res)));
  }

  /** Candidature enseignant : compte créé « en attente » jusqu'à validation par l'admin. */
  registerTeacher(data: {
    fullName: string; email: string; password: string; specialty: string; bio: string;
    credentialsLink: string; universityId: number | null;
  }) {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/api/auth/register-teacher`, data)
      .pipe(tap((res) => this.save(res)));
  }

  /** Recharge le profil depuis le serveur (utile après une modification). */
  refresh() {
    return this.http.get<User>(`${environment.apiUrl}/api/auth/me`).pipe(
      tap((u) => {
        localStorage.setItem(USER_KEY, JSON.stringify(u));
        this.user.set(u);
      }),
    );
  }

  logout(callServer = true) {
    if (callServer && this.token) {
      this.http.post(`${environment.apiUrl}/api/auth/logout`, {}).subscribe({ error: () => {} });
    }
    this.clear();
    this.router.navigateByUrl('/');
  }

  /** Efface la session locale sans appeler le serveur. */
  clear() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.user.set(null);
  }

  /** Page d'accueil selon le rôle. */
  homeFor(user: User | null = this.user()): string {
    if (user?.role === 'ADMIN') return '/admin';
    if (user?.role === 'TEACHER') return '/enseignant';
    return '/mon-espace';
  }

  private save(res: AuthResponse) {
    localStorage.setItem(TOKEN_KEY, res.token);
    localStorage.setItem(USER_KEY, JSON.stringify(res.user));
    this.user.set(res.user);
  }

  private readUser(): User | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw && localStorage.getItem(TOKEN_KEY) ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  }
}
