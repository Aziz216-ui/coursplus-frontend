import { Component, effect, inject, input, signal } from '@angular/core';
import { IconComponent } from '../../shared/icon';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { Payment } from '../../core/models';
import { dt } from '../../core/format';

/** Page de retour après un paiement en ligne (Konnect redirige ici). */
@Component({
  selector: 'app-payment-result',
  imports: [RouterLink, IconComponent],
  template: `
    <div class="container page narrow">
      <div class="card center">
        @if (!payment()) {
          <p class="muted">Vérification du paiement…</p>
        } @else if (payment()!.status === 'PAID') {
          <div class="empty-icon"><app-icon name="party" [size]="28" /></div>
          <h1>Paiement réussi</h1>
          <p class="muted">{{ payment()!.label }}, {{ dt(payment()!.amount) }}</p>
          <p>Ton accès est activé. Bon apprentissage.</p>
          <a routerLink="/mon-espace" class="btn btn-primary">Aller à mes cours</a>
        } @else if (payment()!.status === 'PENDING') {
          <div class="empty-icon"><app-icon name="clock" [size]="28" /></div>
          <h1>Paiement en cours de vérification</h1>
          <p class="muted">Ça peut prendre quelques secondes. Cette page se met à jour toute seule.</p>
        } @else {
          <div class="empty-icon"><app-icon name="alert" [size]="28" /></div>
          <h1>Paiement non abouti</h1>
          <p class="muted">Aucun montant n'a été validé. Tu peux réessayer ou payer par D17.</p>
          <a routerLink="/cours" class="btn btn-ghost">Retour au catalogue</a>
        }
      </div>
    </div>
  `,
})
export class PaymentResultPage {
  id = input.required<string>();
  private api = inject(ApiService);
  payment = signal<Payment | null>(null);
  dt = dt;
  private tries = 0;

  constructor() {
    effect(() => {
      this.id();
      this.check();
    });
  }

  /** Revérifie toutes les 3 secondes tant que le paiement est en attente (max ~1 min). */
  private check() {
    this.api.payment(Number(this.id())).subscribe((p) => {
      this.payment.set(p);
      if (p.status === 'PENDING' && p.method === 'KONNECT' && this.tries++ < 20) {
        setTimeout(() => this.check(), 3000);
      }
    });
  }
}
