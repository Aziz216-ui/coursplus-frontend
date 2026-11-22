import { Component, effect, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { Payment } from '../../core/models';
import { ToastService, errorMessage } from '../../core/toast.service';
import { STATUS_LABELS, dt } from '../../core/format';

/** Paiement manuel : D17, virement ou espèces, validé ensuite par un admin. */
@Component({
  selector: 'app-manual-payment',
  imports: [FormsModule, RouterLink],
  template: `
    <div class="container page narrow wide">
      @if (payment(); as p) {
        <h1>Paiement par D17 / virement</h1>
        <div class="card mt">
          <div class="row between">
            <div>
              <div class="muted small">Offre</div>
              <strong>{{ p.label }}</strong>
            </div>
            <div class="text-right">
              <div class="muted small">Montant</div>
              <span class="price">{{ dt(p.amount) }}</span>
            </div>
          </div>
          <div class="ref mt">
            <span class="muted small">Ta référence (à écrire dans la note du paiement)</span>
            <div class="code">{{ p.reference }}</div>
          </div>
          <div class="info-box mt">{{ instructions() }}</div>

          @if (p.status === 'PENDING') {
            <form class="mt" (ngSubmit)="send()">
              <div class="field">
                <label for="note">Numéro de transaction D17 / référence du virement</label>
                <input id="note" name="note" class="input" [(ngModel)]="note" placeholder="Ex. D17-845123 ou « payé en espèces à Aziz »" required />
              </div>
              <button class="btn btn-primary" [disabled]="sending() || !note.trim()">
                {{ p.studentNote ? 'Mettre à jour' : "J'ai payé, envoyer" }}
              </button>
              @if (p.studentNote) { <p class="small muted mt">Justificatif envoyé : « {{ p.studentNote }} ». En attente de validation.</p> }
            </form>
          } @else {
            <p class="mt"><span class="badge" [class.success]="p.status === 'PAID'">{{ statuses[p.status] }}</span></p>
            @if (p.status === 'PAID') { <a routerLink="/mon-espace" class="btn btn-primary">Accéder à mes cours</a> }
          }
        </div>
        <p class="small muted mt">Tu retrouves ce paiement à tout moment dans <a routerLink="/mon-espace">Mon espace, onglet Mes paiements</a>.</p>
      } @else {
        <div class="loading">Chargement…</div>
      }
    </div>
  `,
  styles: `
    .ref { background: var(--bg); border: 1px dashed var(--line-strong); border-radius: var(--radius-sm); padding: 14px; text-align: center; }
    .code { font-size: 1.6rem; font-weight: 800; letter-spacing: 0.08em; color: var(--cp-navy); }
  `,
})
export class ManualPaymentPage {
  id = input.required<string>();
  private api = inject(ApiService);
  private toast = inject(ToastService);
  private router = inject(Router);

  payment = signal<Payment | null>(null);
  instructions = signal(
    "Envoie le montant par D17 (ou en espèces à un membre de l'équipe) en mettant ta référence dans la note, puis colle le numéro de transaction ci-dessous.",
  );
  note = '';
  sending = signal(false);
  statuses = STATUS_LABELS;
  dt = dt;

  constructor() {
    const state = this.router.getCurrentNavigation()?.extras.state as { instructions?: string } | undefined;
    if (state?.instructions) this.instructions.set(state.instructions);
    effect(() => {
      this.api.payment(Number(this.id())).subscribe((p) => {
        this.payment.set(p);
        this.note = p.studentNote ?? '';
      });
    });
  }

  send() {
    this.sending.set(true);
    this.api.sendProof(Number(this.id()), this.note).subscribe({
      next: (p) => {
        this.payment.set(p);
        this.sending.set(false);
        this.toast.success("Merci ! On valide ton paiement au plus vite.");
      },
      error: (err) => {
        this.sending.set(false);
        this.toast.error(errorMessage(err));
      },
    });
  }
}
