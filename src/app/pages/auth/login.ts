import { Component, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IconComponent } from '../../shared/icon';
import { AuthService } from '../../core/auth.service';
import { errorMessage } from '../../core/toast.service';
import { isDevMode } from '@angular/core';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink, IconComponent],
  styleUrl: './auth.scss',
  template: `
    
    <div class="auth-split">
      <aside class="auth-side">
        <a routerLink="/" class="logo side-logo"><span class="logo-mark light" aria-hidden="true"><app-icon name="logo-book" [size]="22" /></span><span>Cours<span class="plus">Plus</span></span></a>
        <h2>Content de te revoir.</h2>
        <p>Reprends tes cours là où tu les as laissés.</p>
        <ul class="ticks">
          <li><app-icon name="check" [size]="16" /> Cours alignés sur le programme de ton école</li>
          <li><app-icon name="check" [size]="16" /> Des enseignants qui ont déjà réussi ces cours</li>
          <li><app-icon name="check" [size]="16" /> Exercices type examen corrigés</li>
        </ul>
      </aside>
      <div class="auth-main">
        <div class="auth-card">
        <h1>Connexion</h1>
        <p class="muted center">Content de te revoir.</p>
        <form class="card" (ngSubmit)="submit()" novalidate>
          @if (error()) { <div class="error-box" role="alert">{{ error() }}</div> }
          <div class="field">
            <label for="email">Email</label>
            <input id="email" name="email" type="email" class="input" [(ngModel)]="email" #em="ngModel" [class.invalid]="em.invalid && em.touched" required autocomplete="email" />
            @if (em.invalid && em.touched) { <p class="field-error" role="alert">Entre une adresse email valide.</p> }
          </div>
          <div class="field">
            <label for="password">Mot de passe</label>
            <input id="password" name="password" type="password" class="input" [(ngModel)]="password" #pw="ngModel" [class.invalid]="pw.invalid && pw.touched" required autocomplete="current-password" />
            @if (pw.invalid && pw.touched) { <p class="field-error" role="alert">Entre ton mot de passe.</p> }
          </div>
          <button class="btn btn-primary btn-block" [disabled]="loading()">
            {{ loading() ? 'Connexion…' : 'Se connecter' }}
          </button>
          <p class="small muted center tight-top">
            Un seul appareil connecté à la fois : te connecter ici déconnecte tes autres appareils.
          </p>
        </form>
        <p class="center mt">Pas encore de compte ? <a routerLink="/inscription">Inscris-toi</a></p>

        @if (dev) {
          <div class="card flat demo">
            <strong>Comptes de démonstration</strong>
            @for (a of demoAccounts; track a.email) {
              <div><button type="button" (click)="email = a.email; password = a.password">{{ a.label }}, {{ a.email }}</button></div>
            }
          </div>
        }
        </div>
      </div>
    </div>
  `,
})
export class LoginPage {
  /** ?retour=/cours/3 : page où revenir après la connexion */
  retour = input<string | undefined>();

  private auth = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';
  loading = signal(false);
  error = signal<string | null>(null);
  dev = isDevMode();

  demoAccounts = [
    { label: 'Étudiant', email: 'etudiant@esprit.tn', password: 'etudiant123' },
    { label: 'Enseignant', email: 'info@coursplus.tn', password: 'prof123' },
    { label: 'Admin', email: 'admin@coursplus.tn', password: 'admin123' },
  ];

  submit() {
    this.loading.set(true);
    this.error.set(null);
    this.auth.login(this.email, this.password).subscribe({
      next: (res) => this.router.navigateByUrl(this.retour() || this.auth.homeFor(res.user)),
      error: (err) => {
        this.loading.set(false);
        this.error.set(errorMessage(err, 'Connexion impossible'));
      },
    });
  }
}
