import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { NotificationService } from '../../core/notification.service';
import { AdminOverview, CourseCard, Payment, PaymentStatus, University, User, WatchLessonRow, WatchRow } from '../../core/models';
import { ToastService, errorMessage } from '../../core/toast.service';
import { OFFER_LABELS, STATUS_LABELS, date, dt } from '../../core/format';

/** Administration : paiements à valider, enseignants, universités/filières, cours, étudiants. */
@Component({
  selector: 'app-admin',
  imports: [FormsModule, RouterLink],
  templateUrl: './admin.html',
})
export class AdminPage {
  private api = inject(ApiService);
  private toast = inject(ToastService);

  tab = signal<'payments' | 'teachers' | 'universities' | 'courses' | 'students' | 'watch'>('payments');
  overview = signal<AdminOverview | null>(null);
  payments = signal<Payment[]>([]);
  paymentFilter = signal<PaymentStatus | ''>('PENDING');
  teachers = signal<User[]>([]);
  students = signal<User[]>([]);
  /** Onglet « Visionnage » : activité des comptes et détail d'un compte. */
  watchRows = signal<WatchRow[]>([]);
  watchDetail = signal<{ row: WatchRow; lessons: WatchLessonRow[] } | null>(null);
  universities = signal<University[]>([]);
  courses = signal<CourseCard[]>([]);
  offers = OFFER_LABELS;
  statuses = STATUS_LABELS;
  dt = dt;
  date = date;

  newTeacher = { fullName: '', email: '', password: '', specialty: '', bio: '', monthlyPrice: null as number | null };
  newUni = { code: '', name: '' };
  newTrack = { name: '', universityId: null as number | null, monthlyPrice: null as number | null };

  pendingTeachers = computed(() => this.teachers().filter((t) => t.approvalStatus === 'PENDING'));
  reviewedTeachers = computed(() => this.teachers().filter((t) => t.approvalStatus !== 'PENDING'));
  /** Motif de refus saisi par l'admin, par enseignant. */
  rejectNotes: Record<number, string> = {};

  private route = inject(ActivatedRoute);
  private notifications = inject(NotificationService);

  constructor() {
    this.refresh();

    // Les liens des notifications ouvrent le bon onglet : /admin?tab=teachers
    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe((q) => {
      const t = q.get('tab');
      if (t === 'payments' || t === 'teachers' || t === 'universities' || t === 'courses' || t === 'students' || t === 'watch') {
        this.tab.set(t);
      }
    });

    // Nouvelle candidature ou nouveau paiement reçu en direct : on recharge les listes.
    this.notifications.incoming.pipe(takeUntilDestroyed()).subscribe((n) => {
      if (n.type === 'TEACHER_PENDING' || n.type === 'PAYMENT_PROOF') this.refresh();
    });
  }

  /** Secondes -> "2 h 05" / "35 min" / "0 min". */
  hm(seconds: number): string {
    const m = Math.round(seconds / 60);
    return m >= 60 ? `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, '0')}` : `${m} min`;
  }

  openWatch(row: WatchRow) {
    this.api.adminWatchDetail(row.userId).subscribe({
      next: (lessons) => this.watchDetail.set({ row, lessons }),
      error: (err) => this.toast.error(errorMessage(err, 'Détail indisponible')),
    });
  }

  reviewTeacher(t: User, approve: boolean) {
    const verb = approve ? 'Valider' : 'Refuser';
    if (!window.confirm(`${verb} la candidature de ${t.fullName} ?`)) return;
    this.api.adminReviewTeacher(t.id, approve, this.rejectNotes[t.id]).subscribe({
      next: () => {
        this.toast.success(approve ? `${t.fullName} peut maintenant publier des cours` : 'Candidature refusée');
        delete this.rejectNotes[t.id];
        this.refresh();
      },
      error: (err) => this.toast.error(errorMessage(err)),
    });
  }

  refresh() {
    this.api.adminOverview().subscribe((o) => this.overview.set(o));
    this.loadPayments();
    this.api.adminUsers('TEACHER').subscribe((u) => this.teachers.set(u));
    this.api.adminUsers('STUDENT').subscribe((u) => this.students.set(u));
    this.api.adminWatch().subscribe({ next: (w) => this.watchRows.set(w), error: () => {} });
    this.api.universities().subscribe((u) => this.universities.set(u));
    this.api.adminCourses().subscribe((c) => this.courses.set(c));
  }

  loadPayments() {
    const f = this.paymentFilter();
    this.api.adminPayments(f || undefined).subscribe((p) => this.payments.set(p));
  }

  confirm(p: Payment) {
    if (!window.confirm(`Confirmer la réception de ${dt(p.amount)} de ${p.studentName} (réf. ${p.reference}) ?`)) return;
    this.api.adminConfirm(p.id).subscribe({
      next: () => {
        this.toast.success('Paiement validé : accès activé');
        this.refresh();
      },
      error: (err) => this.toast.error(errorMessage(err)),
    });
  }

  reject(p: Payment) {
    if (!window.confirm(`Refuser le paiement ${p.reference} ?`)) return;
    this.api.adminReject(p.id).subscribe({
      next: () => {
        this.toast.show('Paiement refusé');
        this.refresh();
      },
      error: (err) => this.toast.error(errorMessage(err)),
    });
  }

  createTeacher() {
    this.api.adminCreateTeacher(this.newTeacher).subscribe({
      next: (t) => {
        this.toast.success(`Compte enseignant créé pour ${t.fullName}`);
        this.newTeacher = { fullName: '', email: '', password: '', specialty: '', bio: '', monthlyPrice: null };
        this.refresh();
      },
      error: (err) => this.toast.error(errorMessage(err)),
    });
  }

  toggleActive(u: User) {
    this.api.adminSetActive(u.id, !u.active).subscribe({
      next: () => this.refresh(),
      error: (err) => this.toast.error(errorMessage(err)),
    });
  }

  createUniversity() {
    this.api.adminCreateUniversity(this.newUni.code, this.newUni.name).subscribe({
      next: () => {
        this.toast.success('Université ajoutée');
        this.newUni = { code: '', name: '' };
        this.refresh();
      },
      error: (err) => this.toast.error(errorMessage(err)),
    });
  }

  createTrack() {
    if (!this.newTrack.universityId) return;
    this.api.adminCreateTrack(this.newTrack.name, this.newTrack.universityId, this.newTrack.monthlyPrice).subscribe({
      next: () => {
        this.toast.success('Filière ajoutée');
        this.newTrack = { name: '', universityId: this.newTrack.universityId, monthlyPrice: null };
        this.refresh();
      },
      error: (err) => this.toast.error(errorMessage(err)),
    });
  }

  togglePublish(c: CourseCard) {
    this.api.adminPublishCourse(c.id, !c.published).subscribe(() => this.refresh());
  }
}
