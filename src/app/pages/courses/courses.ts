import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { CourseCard, Teacher, University } from '../../core/models';
import { coursesHeading, isPublicTeacher } from '../../core/display';
import { withOverride } from '../../core/site-config';
import { CourseCardComponent } from '../../shared/course-card';
import { IconComponent } from '../../shared/icon';

/**
 * Page /cours : le catalogue complet (recherche, chips d'université, filtres avancés).
 * Accepte des paramètres d'URL : ?universityId=1&teacherId=2&q=spring (liens depuis l'accueil).
 */
@Component({
  selector: 'app-courses',
  imports: [FormsModule, CourseCardComponent, IconComponent],
  templateUrl: './courses.html',
})
export class CoursesPage {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  private auth = inject(AuthService);

  universities = signal<University[]>([]);
  allTeachers = signal<Teacher[]>([]);
  courses = signal<CourseCard[]>([]);
  loading = signal(true);
  filtersOpen = signal(false);

  universityId = signal<number | null>(null);
  trackId = signal<number | null>(null);
  teacherId = signal<number | null>(null);
  q = signal('');

  readonly popular = ['Spring Boot', 'Anatomie', 'Maths financières'];
  readonly skeletons = [1, 2, 3];

  teachers = computed(() => this.allTeachers().map(withOverride).filter(isPublicTeacher));
  tracks = computed(() => this.universities().find((u) => u.id === this.universityId())?.tracks ?? []);
  advancedCount = computed(() => (this.trackId() ? 1 : 0) + (this.teacherId() ? 1 : 0));
  hasFilters = computed(() => !!(this.universityId() || this.trackId() || this.teacherId() || this.q()));
  heading = computed(() => coursesHeading(this.courses().length));

  private searchTimer: any;

  constructor() {
    this.api.universities().subscribe((u) => this.universities.set(u));
    this.api.teachers().subscribe((t) => this.allTeachers.set(t));

    // Filtres initiaux : paramètres d'URL, sinon l'université de l'étudiant connecté
    const p = this.route.snapshot.queryParamMap;
    const num = (k: string) => (p.get(k) ? Number(p.get(k)) || null : null);
    const uni = num('universityId') ?? this.auth.user()?.universityId ?? null;
    this.universityId.set(uni);
    this.teacherId.set(num('teacherId'));
    this.q.set(p.get('q') ?? '');
    if (this.teacherId()) this.filtersOpen.set(true);
    this.search();
  }

  onUniversityChange(id: number | null) {
    this.universityId.set(id);
    this.trackId.set(null);
    this.search();
  }

  onQueryChange(value: string) {
    this.q.set(value);
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => this.search(), 300);
  }

  useChip(term: string) {
    this.q.set(term);
    this.search();
  }

  search() {
    this.loading.set(true);
    this.api
      .courses({ universityId: this.universityId(), trackId: this.trackId(), teacherId: this.teacherId(), q: this.q() })
      .subscribe({
        next: (c) => {
          this.courses.set(c);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  reset() {
    this.universityId.set(null);
    this.trackId.set(null);
    this.teacherId.set(null);
    this.q.set('');
    this.search();
  }
}
