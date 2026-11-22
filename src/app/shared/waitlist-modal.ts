import { Component, ElementRef, HostListener, afterNextRender, inject, input, output, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { WaitlistService } from '../core/waitlist.service';
import { IconComponent } from './icon';

/** Petit formulaire modal « Liste d'attente » (Premium) / « Être prévenu » (lycée). */
@Component({
  selector: 'app-waitlist-modal',
  imports: [FormsModule, IconComponent],
  template: `
    <div class="overlay" (click)="close.emit()">
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="wl-title" (click)="$event.stopPropagation()">
        <div class="row between">
          <h2 id="wl-title" class="h-sub flush">{{ list() === 'premium' ? 'Liste d’attente Premium' : 'Être prévenu à l’ouverture' }}</h2>
          <button type="button" class="btn btn-ghost btn-icon" aria-label="Fermer" (click)="close.emit()"><app-icon name="x" [size]="18" /></button>
        </div>

        @if (done()) {
          <div class="info-box mt" role="status">
            <strong>C’est noté !</strong> {{ list() === 'premium' ? 'Nous te prévenons' : 'Nous vous préviendrons' }} dès l’ouverture.
          </div>
          <button type="button" class="btn btn-primary mt" (click)="close.emit()">Fermer</button>
        } @else {
          <p class="muted small">{{ list() === 'premium' ? 'Laisse ton e-mail ou ton numéro, nous te contactons à l’ouverture (places limitées).' : 'Laissez votre e-mail ou votre numéro, nous vous contacterons à l’ouverture de l’offre lycée.' }}</p>
          <form (ngSubmit)="submit()" novalidate>
            @if (error()) { <div class="error-box" role="alert">{{ error() }}</div> }
            <div class="field">
              <label for="wl-contact">E-mail ou téléphone</label>
              <input #first id="wl-contact" name="contact" class="input" [(ngModel)]="contact" autocomplete="email" required
                     [class.invalid]="touched() && contactError()" [attr.aria-invalid]="touched() && !!contactError()" aria-describedby="wl-contact-err" />
              @if (touched() && contactError()) { <p id="wl-contact-err" class="field-error" role="alert">{{ contactError() }}</p> }
            </div>
            <div class="field">
              <label for="wl-detail">{{ list() === 'premium' ? 'Université' : 'Niveau / matière' }}</label>
              @if (list() === 'premium') {
                <select id="wl-detail" name="detail" class="input" [(ngModel)]="detail" required [class.invalid]="touched() && detailError()" aria-describedby="wl-detail-err">
                  <option value="">Choisir…</option>
                  @for (u of universities(); track u) { <option [value]="u">{{ u }}</option> }
                  <option value="Autre">Autre</option>
                </select>
              } @else {
                <input id="wl-detail" name="detail" class="input" [(ngModel)]="detail" placeholder="Ex. 2e année, Maths" required
                       [class.invalid]="touched() && detailError()" aria-describedby="wl-detail-err" />
              }
              @if (touched() && detailError()) { <p id="wl-detail-err" class="field-error" role="alert">{{ detailError() }}</p> }
            </div>
            <button type="submit" class="btn btn-primary btn-block" [disabled]="sending()">{{ sending() ? 'Envoi…' : 'Me prévenir' }}</button>
          </form>
        }
      </div>
    </div>
  `,
})
export class WaitlistModal {
  private service = inject(WaitlistService);
  list = input<'premium' | 'lycee'>('premium');
  universities = input<string[]>([]);
  close = output<void>();

  contact = '';
  detail = '';
  touched = signal(false);
  sending = signal(false);
  done = signal(false);
  error = signal('');
  private first = viewChild<ElementRef<HTMLInputElement>>('first');

  constructor() {
    // Focus sur le premier champ à l'ouverture
    afterNextRender(() => this.first()?.nativeElement.focus());
  }

  @HostListener('document:keydown.escape')
  onEscape() { this.close.emit(); }

  /** E-mail valide, ou numéro de téléphone (8 chiffres ou plus, +, espaces et tirets tolérés). */
  contactError(): string {
    const v = this.contact.trim();
    if (!v) return this.list() === 'premium' ? 'Indique ton e-mail ou ton numéro de téléphone.' : 'Indiquez votre e-mail ou votre numéro de téléphone.';
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
    const isPhone = /^\+?[\d\s-]{8,15}$/.test(v) && v.replace(/\D/g, '').length >= 8;
    return isEmail || isPhone ? '' : 'E-mail ou numéro invalide.';
  }
  detailError(): string {
    return this.detail.trim() ? '' : this.list() === 'premium' ? 'Choisis ton université.' : 'Indiquez le niveau ou la matière.';
  }

  submit() {
    this.touched.set(true);
    this.error.set('');
    if (this.contactError() || this.detailError()) return;
    this.sending.set(true);
    this.service.join({ list: this.list(), contact: this.contact.trim(), detail: this.detail.trim() }).subscribe({
      next: () => { this.sending.set(false); this.done.set(true); },
      error: () => { this.sending.set(false); this.error.set(this.list() === 'premium' ? 'Une erreur est survenue. Réessaie dans un instant.' : 'Une erreur est survenue. Veuillez réessayer dans un instant.'); },
    });
  }
}
