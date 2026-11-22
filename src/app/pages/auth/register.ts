import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IconComponent } from '../../shared/icon';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { University } from '../../core/models';
import { errorMessage } from '../../core/toast.service';

@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink, IconComponent],
  styleUrl: './auth.scss',
  template: `
    
    <div class="auth-split">
      <aside class="auth-side">
        <a routerLink="/" class="logo side-logo"><span class="logo-mark light" aria-hidden="true"><app-icon name="logo-book" [size]="22" /></span><span>Cours<span class="plus">Plus</span></span></a>
        <h2>Rejoins CoursPlus.</h2>
        <p>Les cours de ton université, expliqués par des enseignants qui y sont passés.</p>
        <ul class="ticks">
          <li><app-icon name="check" [size]="16" /> Cours alignés sur le programme de ton école</li>
          <li><app-icon name="check" [size]="16" /> Des enseignants qui ont déjà réussi ces cours</li>
          <li><app-icon name="check" [size]="16" /> Exercices type examen corrigés</li>
        </ul>
      </aside>
      <div class="auth-main">
        <div class="auth-card">
        <h1>Créer un compte</h1>
        <p class="muted center">Gratuit. Tu paies seulement les cours que tu choisis.</p>
        <form class="card" (ngSubmit)="submit()" novalidate>
          @if (error()) { <div class="error-box" role="alert">{{ error() }}</div> }
          <div class="field">
            <label for="name">Nom complet</label>
            <input id="name" name="fullName" class="input" [(ngModel)]="fullName" #nm="ngModel" [class.invalid]="nm.invalid && nm.touched" required />
            @if (nm.invalid && nm.touched) { <p class="field-error" role="alert">Entre ton nom complet.</p> }
          </div>
          <div class="field">
            <label for="email">Email</label>
            <input id="email" name="email" type="email" class="input" [(ngModel)]="email" #em="ngModel" [class.invalid]="em.invalid && em.touched" required />
            @if (em.invalid && em.touched) { <p class="field-error" role="alert">Entre une adresse email valide.</p> }
          </div>
          <div class="field">
            <label for="password">Mot de passe (6 caractères minimum)</label>
            <input id="password" name="password" type="password" class="input" [(ngModel)]="password" #pw="ngModel" [class.invalid]="pw.invalid && pw.touched" required minlength="6" />
            @if (pw.invalid && pw.touched) { <p class="field-error" role="alert">Au moins 6 caractères.</p> }
          </div>
          <div class="field">
            <label for="uni">Ton université</label>
            <select id="uni" name="universityId" class="input" [(ngModel)]="universityId">
              <option [ngValue]="null">Choisir (facultatif)</option>
              @for (u of universities(); track u.id) { <option [ngValue]="u.id">{{ u.code }}, {{ u.name }}</option> }
            </select>
          </div>
          <button class="btn btn-primary btn-block" [disabled]="loading()">
            {{ loading() ? 'Création…' : 'Créer mon compte' }}
          </button>
        </form>
        <p class="center mt">Déjà inscrit ? <a routerLink="/connexion">Connecte-toi</a></p>
        <p class="center small muted">Tu veux donner des cours ? <a routerLink="/inscription-enseignant">Deviens enseignant</a></p>
        </div>
      </div>
    </div>
  `,
})
export class RegisterPage {
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private router = inject(Router);

  universities = signal<University[]>([]);
  fullName = '';
  email = '';
  password = '';
  universityId: number | null = null;
  loading = signal(false);
  error = signal<string | null>(null);

  constructor() {
    this.api.universities().subscribe((u) => this.universities.set(u));
  }

  submit() {
    this.loading.set(true);
    this.error.set(null);
    this.auth
      .register({ fullName: this.fullName, email: this.email, password: this.password, universityId: this.universityId })
      .subscribe({
        next: () => this.router.navigateByUrl('/'),
        error: (err) => {
          this.loading.set(false);
          this.error.set(errorMessage(err, 'Inscription impossible'));
        },
      });
  }
}
