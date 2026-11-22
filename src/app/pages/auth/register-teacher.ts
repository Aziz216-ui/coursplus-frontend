import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IconComponent } from '../../shared/icon';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { University } from '../../core/models';
import { ToastService, errorMessage } from '../../core/toast.service';

/** Candidature enseignant : le compte est vérifié par l'équipe avant de pouvoir publier des cours. */
@Component({
  selector: 'app-register-teacher',
  imports: [FormsModule, RouterLink, IconComponent],
  styleUrl: './auth.scss',
  template: `
    <div class="auth-split">
      <aside class="auth-side">
        <a routerLink="/" class="logo side-logo"><span class="logo-mark light" aria-hidden="true"><app-icon name="logo-book" [size]="22" /></span><span>Cours<span class="plus">Plus</span></span></a>
        <h2>Deviens enseignant.</h2>
        <p>Partage ton expérience avec les étudiants. On s’occupe de la technique et des paiements.</p>
        <ul class="ticks">
          <li><app-icon name="check" [size]="16" /> Tu envoies ta candidature</li>
          <li><app-icon name="check" [size]="16" /> L’équipe vérifie ton parcours</li>
          <li><app-icon name="check" [size]="16" /> Tu es prévenu dès la décision, puis tu publies tes cours</li>
        </ul>
      </aside>
      <div class="auth-main">
        <div class="auth-card">
          <h1>Candidature enseignant</h1>
          <p class="muted center">Ton compte sera activé après vérification de ta compétence.</p>
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
              <label for="spec">Spécialité / métier</label>
              <input id="spec" name="specialty" class="input" [(ngModel)]="specialty" #sp="ngModel" [class.invalid]="sp.invalid && sp.touched" placeholder="Ex. Ingénieur financier" required />
              @if (sp.invalid && sp.touched) { <p class="field-error" role="alert">Indique ta spécialité.</p> }
            </div>
            <div class="field">
              <label for="bio">Ton parcours et les cours que tu veux donner</label>
              <textarea id="bio" name="bio" class="input" rows="5" [(ngModel)]="bio" #bi="ngModel" [class.invalid]="bi.invalid && bi.touched" minlength="20" maxlength="2000" required
                        placeholder="Diplômes, expérience, matières, université d'origine…"></textarea>
              @if (bi.invalid && bi.touched) { <p class="field-error" role="alert">Décris ton parcours (20 caractères minimum).</p> }
            </div>
            <div class="field">
              <label for="link">Lien CV, LinkedIn ou diplôme (facultatif)</label>
              <input id="link" name="credentialsLink" type="url" class="input" [(ngModel)]="credentialsLink" placeholder="https://" />
            </div>
            <div class="field">
              <label for="uni">Ton université</label>
              <select id="uni" name="universityId" class="input" [(ngModel)]="universityId">
                <option [ngValue]="null">Choisir (facultatif)</option>
                @for (u of universities(); track u.id) { <option [ngValue]="u.id">{{ u.code }}, {{ u.name }}</option> }
              </select>
            </div>
            <button class="btn btn-primary btn-block" [disabled]="loading()">
              {{ loading() ? 'Envoi…' : 'Envoyer ma candidature' }}
            </button>
          </form>
          <p class="center mt">Tu es étudiant ? <a routerLink="/inscription">Crée un compte étudiant</a></p>
        </div>
      </div>
    </div>
  `,
})
export class RegisterTeacherPage {
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);

  universities = signal<University[]>([]);
  fullName = '';
  email = '';
  password = '';
  specialty = '';
  bio = '';
  credentialsLink = '';
  universityId: number | null = null;
  loading = signal(false);
  error = signal<string | null>(null);

  constructor() {
    this.api.universities().subscribe((u) => this.universities.set(u));
  }

  submit() {
    if (!this.fullName.trim() || !this.email.trim() || this.password.length < 6 || !this.specialty.trim() || this.bio.trim().length < 20) {
      this.error.set('Remplis tous les champs obligatoires (présentation : 20 caractères minimum).');
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    this.auth
      .registerTeacher({
        fullName: this.fullName, email: this.email, password: this.password, specialty: this.specialty,
        bio: this.bio, credentialsLink: this.credentialsLink, universityId: this.universityId,
      })
      .subscribe({
        next: () => {
          this.toast.success('Candidature envoyée : tu seras prévenu dès la validation.');
          this.router.navigateByUrl('/enseignant');
        },
        error: (err) => {
          this.loading.set(false);
          this.error.set(errorMessage(err, 'Candidature impossible'));
        },
      });
  }
}
