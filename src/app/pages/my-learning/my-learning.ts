import { Component, inject, signal } from '@angular/core';
import { IconComponent } from '../../shared/icon';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { MyLearning, Payment } from '../../core/models';
import { CourseCardComponent } from '../../shared/course-card';
import { OFFER_LABELS, STATUS_LABELS, date, dt } from '../../core/format';

@Component({
  selector: 'app-my-learning',
  imports: [RouterLink, CourseCardComponent, IconComponent],
  template: `
    <div class="container page">
      <h1>Bonjour {{ auth.user()?.fullName }}</h1>
      <p class="muted">Retrouve ici tes cours, tes abonnements et tes paiements.</p>

      <div class="tabs mt">
        <button [class.active]="tab() === 'courses'" (click)="tab.set('courses')">Mes cours</button>
        <button [class.active]="tab() === 'subs'" (click)="tab.set('subs')">Mes accès</button>
        <button [class.active]="tab() === 'payments'" (click)="tab.set('payments')">Mes paiements</button>
      </div>

      @if (!data()) {
        <div class="loading">Chargement…</div>
      } @else {
        @switch (tab()) {
          @case ('courses') {
            @if (data()!.courses.length === 0) {
              <div class="empty card flat">
                <div class="empty-icon"><app-icon name="book" [size]="26" /></div>
                <p>Tu n'as pas encore de cours. Commence par regarder le catalogue.</p>
                <a routerLink="/cours" class="btn btn-primary">Voir le catalogue</a>
              </div>
            } @else {
              <div class="grid grid-3">
                @for (c of data()!.courses; track c.id) { <app-course-card [course]="c" [owned]="true" /> }
              </div>
            }
          }
          @case ('subs') {
            <div class="card table-wrap">
              <table class="table">
                <thead><tr><th>Accès</th><th>Depuis</th><th>Jusqu'au</th><th>Statut</th></tr></thead>
                <tbody>
                  @for (a of data()!.accesses; track a.id) {
                    <tr>
                      <td>{{ a.label }}</td>
                      <td>{{ date(a.startsAt) }}</td>
                      <td>{{ a.endsAt ? date(a.endsAt) : 'À vie' }}</td>
                      <td>
                        @if (a.active) { <span class="badge success">Actif</span> }
                        @else { <span class="badge">Expiré</span> }
                      </td>
                    </tr>
                  } @empty {
                    <tr><td colspan="4" class="muted center">Aucun accès pour le moment.</td></tr>
                  }
                </tbody>
              </table>
            </div>
          }
          @case ('payments') {
            <div class="card table-wrap">
              <table class="table">
                <thead><tr><th>Référence</th><th>Offre</th><th>Montant</th><th>Moyen</th><th>Date</th><th>Statut</th></tr></thead>
                <tbody>
                  @for (p of payments(); track p.id) {
                    <tr>
                      <td><code>{{ p.reference }}</code></td>
                      <td>{{ p.label }}<br /><span class="small muted">{{ offers[p.offerType] }}</span></td>
                      <td><strong>{{ dt(p.amount) }}</strong></td>
                      <td>{{ p.method === 'MANUAL' ? 'D17 / manuel' : 'En ligne' }}</td>
                      <td>{{ date(p.createdAt) }}</td>
                      <td>
                        <span class="badge" [class.success]="p.status === 'PAID'" [class.warning]="p.status === 'PENDING'"
                              [class.danger]="p.status === 'FAILED' || p.status === 'CANCELLED'">{{ statuses[p.status] }}</span>
                        @if (p.status === 'PENDING' && p.method === 'MANUAL') {
                          <a [routerLink]="['/paiement/manuel', p.id]" class="small ml-sm">Compléter</a>
                        }
                      </td>
                    </tr>
                  } @empty {
                    <tr><td colspan="6" class="muted center">Aucun paiement.</td></tr>
                  }
                </tbody>
              </table>
            </div>
          }
        }
      }
    </div>
  `,
})
export class MyLearningPage {
  private api = inject(ApiService);
  protected auth = inject(AuthService);

  tab = signal<'courses' | 'subs' | 'payments'>('courses');
  data = signal<MyLearning | null>(null);
  payments = signal<Payment[]>([]);
  offers = OFFER_LABELS;
  statuses = STATUS_LABELS;
  date = date;
  dt = dt;

  constructor() {
    this.api.myLearning().subscribe((d) => this.data.set(d));
    this.api.myPayments().subscribe((p) => this.payments.set(p));
  }
}
