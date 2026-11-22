import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CourseCard } from '../core/models';
import { dt, duration } from '../core/format';
import { courseIcon, courseLogo, plural, uniColor } from '../core/display';
import { courseTitle, teacherPhoto, teacherRole } from '../core/site-config';
import { AvatarComponent } from './avatar';
import { IconComponent, IconName } from './icon';

/**
 * Carte d'un cours (accueil, catalogue, « Mes cours »). Toute la carte est cliquable.
 * Desktop : vignette 16:9 au-dessus. Mobile : carte horizontale (vignette à gauche).
 * Image de couverture optionnelle (coverUrl) ; sinon icône de la matière sur la couleur de l'école.
 */
@Component({
  selector: 'app-course-card',
  imports: [RouterLink, IconComponent, AvatarComponent],
  styleUrl: './course-card.scss',
  template: `
    <a class="course-card" [routerLink]="link()">
      <div class="thumb" [style.--cover]="color()">
        @if (course().coverUrl) {
          <img class="cover-img" [src]="course().coverUrl" alt="" loading="lazy" />
        } @else {
          @if (logo(); as l) {
            <span class="logo-chip" [class.has-name]="!!l.name">
              @if (l.kind === 'brand') {
                <img [src]="l.src" alt="" width="40" height="40" loading="lazy" />
              } @else {
                <span class="logo-mask" [style.--src]="'url(' + l.src + ')'" [style.--ink]="l.color || 'var(--cp-primary-700)'"></span>
              }
              @if (l.tm) { <sup class="tm" aria-hidden="true">™</sup> }
            </span>
          } @else {
            <app-icon class="big" [name]="subjectIcon()" [size]="64" />
          }
        }
        @if (course().universityCode) { <span class="chip">{{ course().universityCode }}</span> }
        <!-- Tag optionnel selon la propriété badge du cours -->
        @if (course().badge === 'populaire') { <span class="tag">🔥 Populaire</span> }
        @else if (course().badge === 'nouveau') { <span class="tag">✨ Nouveau</span> }
      </div>
      <div class="body">
        <div class="level">{{ course().trackName || 'Tous niveaux' }}</div>
        <h3 class="title">{{ title() }}</h3>
        <div class="teacher">
          <app-avatar [name]="course().teacherName" [specialty]="teacherField()" [photoUrl]="photo()" [size]="28" />
          <span class="t-text">
            <strong>{{ course().teacherName }}</strong>
            @if (role()) { <span class="muted small">{{ role() }}</span> }
          </span>
        </div>
        <div class="meta muted small">
          <span class="with-icon"><app-icon name="play" [size]="14" /> {{ videos() }}</span>
          <span class="with-icon"><app-icon name="file" [size]="14" /> {{ docs() }}</span>
          @if (length()) { <span class="with-icon"><app-icon name="clock" [size]="14" /> {{ length() }}</span> }
          @if (course().freePreview) { <span class="free-badge">Aperçu gratuit</span> }
        </div>
        <div class="foot">
          @if (owned()) {
            <span class="badge success"><app-icon name="check" [size]="14" /> Accès débloqué</span>
            <span class="btn btn-primary btn-sm">Continuer</span>
          } @else {
            <span class="price">{{ price() }}</span>
            <span class="btn btn-outline btn-sm">Voir le cours</span>
          }
        </div>
      </div>
    </a>
  `,
})
export class CourseCardComponent {
  course = input.required<CourseCard>();
  owned = input(false);

  link = computed(() => (this.owned() ? ['/cours', this.course().id, 'apprendre'] : ['/cours', this.course().id]));
  title = computed(() => courseTitle(this.course().title));
  length = computed(() => duration(this.course().totalDurationMinutes));
  price = computed(() => dt(this.course().price));
  color = computed(() => uniColor(this.course().universityCode));
  videos = computed(() => plural(this.course().lessonCount, 'vidéo'));
  docs = computed(() => plural(this.course().documentCount, 'document'));
  photo = computed(() => teacherPhoto(this.course().teacherId));
  logo = computed(() => courseLogo(this.course()));
  role = computed(() => teacherRole(this.course().teacherId, this.course().teacherSpecialty));
  teacherField = computed(() => this.role() ?? this.course().trackName);
  subjectIcon = computed<IconName>(() => courseIcon(this.course()) as IconName);
}
