import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { CourseCard, TeacherStats, TeacherStudent } from '../../core/models';
import { ToastService, errorMessage } from '../../core/toast.service';
import { OFFER_LABELS, date, dt } from '../../core/format';
import { teacherRole } from '../../core/site-config';

/** Espace enseignant : ventes, cours, étudiants, profil. */
@Component({
  selector: 'app-teacher-dashboard',
  imports: [RouterLink, FormsModule],
  templateUrl: './teacher-dashboard.html',
})
export class TeacherDashboardPage {
  private api = inject(ApiService);
  protected auth = inject(AuthService);
  private toast = inject(ToastService);

  tab = signal<'overview' | 'courses' | 'students' | 'profile'>('overview');
  stats = signal<TeacherStats | null>(null);
  courses = signal<CourseCard[]>([]);
  students = signal<TeacherStudent[]>([]);
  offers = OFFER_LABELS;
  dt = dt;
  date = date;

  // Profil
  specialty = this.auth.user()?.specialty ?? '';
  /** Métier affiché dans l'en-tête (corrige l'affichage « Info » en attendant la correction en base ; le formulaire garde la vraie valeur). */
  role = () => { const u = this.auth.user(); return u ? teacherRole(u.id, u.specialty) : ''; };
  bio = this.auth.user()?.bio ?? '';
  monthlyPrice: number | null = this.auth.user()?.monthlyPrice ?? null;
  saving = signal(false);
  /** Seuls les enseignants validés par l'admin peuvent créer des cours. */
  approved = () => {
    const s = this.auth.user()?.approvalStatus; // absent dans un profil enregistré avant cette fonction = validé
    return s !== 'PENDING' && s !== 'REJECTED';
  };

  constructor() {
    this.api.teacherStats().subscribe((s) => this.stats.set(s));
    this.api.teacherCourses().subscribe((c) => this.courses.set(c));
    this.api.teacherStudents().subscribe((s) => this.students.set(s));
  }

  saveProfile() {
    this.saving.set(true);
    this.api.updateTeacherProfile({ specialty: this.specialty, bio: this.bio, monthlyPrice: this.monthlyPrice }).subscribe({
      next: () => {
        this.saving.set(false);
        this.auth.refresh().subscribe();
        this.toast.success('Profil enregistré');
      },
      error: (err) => {
        this.saving.set(false);
        this.toast.error(errorMessage(err));
      },
    });
  }
}
