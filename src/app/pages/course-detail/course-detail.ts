import { Component, inject, input, signal, effect } from '@angular/core';
import { IconComponent } from '../../shared/icon';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { CourseDetail, Offer, PaymentMethod } from '../../core/models';
import { ToastService, errorMessage } from '../../core/toast.service';
import { dt } from '../../core/format';
import { plural, uniColor } from '../../core/display';
import { courseTitle, withOverride } from '../../core/site-config';
import { AvatarComponent } from '../../shared/avatar';

@Component({
  selector: 'app-course-detail',
  imports: [RouterLink, IconComponent, AvatarComponent],
  templateUrl: './course-detail.html',
  styleUrl: './course-detail.scss',
})
export class CourseDetailPage {
  /** :id de l'URL (grâce à withComponentInputBinding) */
  id = input.required<string>();

  private api = inject(ApiService);
  protected auth = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);

  protected plural = plural;
  protected courseTitle = courseTitle;
  protected uniColor = uniColor;
  course = signal<CourseDetail | null>(null);
  notFound = signal(false);
  selectedOffer = signal<Offer | null>(null);
  paying = signal(false);
  dt = dt;

  constructor() {
    effect(() => {
      const id = Number(this.id());
      this.api.course(id).subscribe({
        next: (c) => this.course.set({ ...c, teacher: withOverride(c.teacher) }),
        error: () => this.notFound.set(true),
      });
    });
  }

  choose(offer: Offer) {
    if (!this.auth.isLoggedIn()) {
      this.toast.show('Crée un compte ou connecte-toi pour acheter ce cours.');
      this.router.navigate(['/connexion'], { queryParams: { retour: this.router.url } });
      return;
    }
    if (this.auth.role() !== 'STUDENT') {
      this.toast.error('Seuls les comptes étudiants peuvent acheter.');
      return;
    }
    this.selectedOffer.set(offer);
  }

  pay(method: PaymentMethod) {
    const offer = this.selectedOffer();
    if (!offer) return;
    this.paying.set(true);
    this.api.checkout(offer.offerType, offer.targetId, method).subscribe({
      next: (res) => {
        this.paying.set(false);
        this.selectedOffer.set(null);
        if (method === 'MANUAL') {
          this.router.navigate(['/paiement/manuel', res.payment.id], {
            state: { instructions: res.instructions, courseId: this.course()?.id },
          });
        } else if (res.payUrl?.startsWith(window.location.origin)) {
          // Page de simulation (développement) : navigation interne
          this.router.navigateByUrl(res.payUrl.substring(window.location.origin.length));
        } else if (res.payUrl) {
          // Vraie page de paiement Konnect
          window.location.href = res.payUrl;
        }
      },
      error: (err) => {
        this.paying.set(false);
        this.toast.error(errorMessage(err));
      },
    });
  }
}
