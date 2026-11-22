import { Component, effect, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { Payment } from '../../core/models';
import { ToastService, errorMessage } from '../../core/toast.service';
import { dt } from '../../core/format';

/**
 * Page de paiement SIMULÉE (développement uniquement).
 * Elle remplace la page Konnect tant que la clé API Konnect n'est pas configurée.
 */
@Component({
  selector: 'app-simulation',
  template: `
    <div class="container page narrow">
      <div class="card center">
        <span class="badge warning">Mode test : aucun argent réel</span>
        <h1 class="mt">Paiement simulé</h1>
        @if (payment(); as p) {
          <p class="muted">{{ p.label }}</p>
          <p class="price price-xl">{{ dt(p.amount) }}</p>
          <p class="small muted">En production, l'étudiant verra ici la page de paiement Konnect (carte, e-DINAR, wallet).</p>
          <div class="row justify-center">
            <button class="btn btn-ghost" (click)="cancel()">Annuler</button>
            <button class="btn btn-primary" (click)="pay()" [disabled]="busy()">Simuler un paiement réussi</button>
          </div>
        }
      </div>
    </div>
  `,
})
export class SimulationPage {
  id = input.required<string>();
  private api = inject(ApiService);
  private router = inject(Router);
  private toast = inject(ToastService);
  payment = signal<Payment | null>(null);
  busy = signal(false);
  dt = dt;

  constructor() {
    effect(() => this.api.payment(Number(this.id())).subscribe((p) => this.payment.set(p)));
  }

  pay() {
    this.busy.set(true);
    this.api.simulate(Number(this.id())).subscribe({
      next: () => this.router.navigate(['/paiement/resultat', this.id()]),
      error: (err) => {
        this.busy.set(false);
        this.toast.error(errorMessage(err));
      },
    });
  }

  cancel() {
    this.router.navigateByUrl('/');
  }
}
