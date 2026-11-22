import { Component, DestroyRef, ElementRef, afterNextRender, computed, inject, isDevMode, signal, viewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { CourseCard, Teacher, University } from '../../core/models';
import { domainOf, isPublicTeacher } from '../../core/display';
import { dt } from '../../core/format';
import { SAMPLE_TESTIMONIALS, TESTIMONIALS } from '../../core/testimonials';
import { CONTACT_EMAIL, HERO_SOCIAL_PROOF, PHOTO_IDS, WHATSAPP_URL, SHOW_TESTIMONIALS, pexelsSrcset, pexelsUrl, teacherPhoto, withOverride } from '../../core/site-config';
import { AvatarComponent } from '../../shared/avatar';
import { CourseCardComponent } from '../../shared/course-card';
import { IconComponent } from '../../shared/icon';
import { RevealDirective } from '../../shared/reveal';
import { WaitlistModal } from '../../shared/waitlist-modal';

/** Page d'accueil = vitrine + sélection de cours. Le catalogue complet (recherche, filtres) est sur /cours. */
@Component({
  selector: 'app-catalog',
  imports: [CourseCardComponent, RouterLink, IconComponent, AvatarComponent, RevealDirective, WaitlistModal],
  templateUrl: './catalog.html',
})
export class CatalogPage {
  private api = inject(ApiService);
  protected auth = inject(AuthService);
  private router = inject(Router);

  universities = signal<University[]>([]);
  allTeachers = signal<Teacher[]>([]);
  /** Tous les cours publiés : sert à la sélection « à la une », aux chips des enseignants et aux prix « à partir de ». */
  allCourses = signal<CourseCard[]>([]);
  /** Sélection affichée sur l'accueil. */
  featured = computed(() => this.allCourses().slice(0, 3));

  readonly contactEmail = CONTACT_EMAIL;
  readonly showTestimonials = SHOW_TESTIMONIALS;
  readonly skeletons = [1, 2, 3];
  readonly heroProof = HERO_SOCIAL_PROOF;

  /** Liste d'attente ouverte (null = fermée). */
  waitlist = signal<'premium' | 'lycee' | null>(null);
  /** Universités proposées dans le formulaire Premium. */
  waitlistUniversities = computed(() => this.universities().map((u) => u.code));

  /** Mobile : le bouton « Créer mon compte » collant apparaît une fois le hero dépassé par le haut. */
  showSticky = signal(false);
  private heroEl = viewChild<ElementRef<HTMLElement>>('hero');

  // Photos Pexels (URL, srcset 600w / 1200w)
  readonly photo = {
    hero: { src: pexelsUrl(PHOTO_IDS.hero, 1200), srcset: pexelsSrcset(PHOTO_IDS.hero) },
    parents: { src: pexelsUrl(PHOTO_IDS.parents, 1200), srcset: pexelsSrcset(PHOTO_IDS.parents) },
    students: { src: pexelsUrl(PHOTO_IDS.students, 800), srcset: pexelsSrcset(PHOTO_IDS.students) },
    teacher: { src: pexelsUrl(PHOTO_IDS.teacher, 1200), srcset: pexelsSrcset(PHOTO_IDS.teacher) },
  };

  readonly arguments = [
    { icon: 'users' as const, title: 'Des profs professionnels', text: 'Un médecin, des ingénieurs informatique et financier : ils pratiquent ce qu’ils enseignent.' },
    { icon: 'graduation' as const, title: 'Un programme aligné sur ton école', text: 'ESPRIT, ESC, FMT : chaque cours suit le programme de ton établissement.' },
    { icon: 'file' as const, title: 'Exercices type examen corrigés', text: 'Entraîne-toi sur des exercices dans le style de tes examens, avec leur correction.' },
  ];

  /** Vrais avis s'il y en a ; sinon exemples marqués « À REMPLACER », visibles uniquement en développement. */
  readonly testimonialsAreSamples = TESTIMONIALS.length === 0;
  readonly testimonials = TESTIMONIALS.length ? TESTIMONIALS : isDevMode() ? SAMPLE_TESTIMONIALS : [];

  readonly faq = [
    { q: 'Comment puis-je payer ?', a: 'Par carte bancaire, e-DINAR ou D17. Le paiement en ligne donne un accès immédiat ; pour D17, virement ou espèces, envoie la preuve de virement sur WhatsApp : l’accès est activé après validation par l’équipe.', link: WHATSAPP_URL ? { text: 'Envoyer la preuve sur WhatsApp', href: WHATSAPP_URL } : null },
    { q: 'Comment j’accède à mes cours après l’achat ?', a: 'Connecte-toi, puis ouvre « Mes cours » : vidéos, résumés PDF et exercices y sont réunis. Un cours acheté reste accessible à vie.', link: null },
    { q: 'Quelle différence entre « Par cours », « Abonnement » et « Premium » ?', a: '« Par cours » : accès à vie à un cours (autonome). « Abonnement » : tous les cours d’un enseignant ou d’une filière pendant la durée de l’abonnement (accompagné). « Premium » : l’abonnement plus le chat privé avec l’enseignant, la correction de devoirs et des lives en groupe (coaché, bientôt, places limitées).', link: null },
    { q: 'Comment poser une question à mon professeur ?', a: 'Le chat privé avec l’enseignant fait partie de l’offre Premium, bientôt disponible avec une liste d’attente. L’enseignant te répond sous 48 h.', link: null },
  ];

  /** Enseignants affichés publiquement : profils complets avec au moins un cours. */
  teachers = computed(() => this.allTeachers().map(withOverride).filter(isPublicTeacher));
  /** Université « lycée » si elle existe dans les données ; sinon l'offre lycée est affichée comme « Bientôt ». */
  lyceeUniversity = computed(() => this.universities().find((u) => /lyc/i.test(u.code) || /lyc/i.test(u.name)) ?? null);

  teacherCards = computed(() =>
    this.teachers().map((t) => {
      const mine = this.allCourses().filter((c) => c.teacherId === t.id);
      const unis = [...new Set(mine.map((c) => c.universityCode).filter((x): x is string => !!x))];
      return { t, unis, domain: domainOf(t.specialty), photo: teacherPhoto(t.id, t.photoUrl) };
    }),
  );

  /** Prix réels uniquement : le plus bas des cours / des abonnements enseignants, sinon « selon l'enseignant ». */
  fromCoursePrice = computed(() => {
    const p = this.allCourses().map((c) => c.price).filter((x) => x > 0);
    return p.length ? 'à partir de ' + dt(Math.min(...p)) : 'Prix selon le cours';
  });
  fromMonthlyPrice = computed(() => {
    const p = this.teachers().map((t) => t.monthlyPrice).filter((x): x is number => !!x && x > 0);
    return p.length ? 'à partir de ' + dt(Math.min(...p)) + ' / mois' : 'Prix selon l’enseignant';
  });

  /** Exemple de valeur de l'abonnement, calculé sur les vrais prix : cours cumulés d'un enseignant vs son prix mensuel. */
  valueExample = computed(() => {
    let best: { name: string; n: number; total: number; monthly: number } | null = null;
    for (const t of this.teachers()) {
      const monthly = t.monthlyPrice;
      if (!monthly || monthly <= 0) continue;
      const mine = this.allCourses().filter((c) => c.teacherId === t.id && c.price > 0);
      const total = mine.reduce((s, c) => s + c.price, 0);
      if (mine.length >= 2 && total > monthly && (!best || total - monthly > best.total - best.monthly)) {
        best = { name: t.fullName, n: mine.length, total, monthly };
      }
    }
    return best ? `Exemple : les ${best.n} cours de ${best.name} coûtent ${dt(best.total)} à l’unité, contre ${dt(best.monthly)} / mois en abonnement.` : '';
  });

  constructor() {
    this.api.universities().subscribe((u) => this.universities.set(u));
    this.api.teachers().subscribe((t) => this.allTeachers.set(t));
    this.api.courses({}).subscribe({ next: (c) => this.allCourses.set(c), error: () => {} });

    // Observe le hero : bouton collant visible seulement quand le hero est sorti de l'écran par le haut
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const el = this.heroEl()?.nativeElement;
      if (!el || !('IntersectionObserver' in window)) return;
      const obs = new IntersectionObserver(([e]) => this.showSticky.set(!e.isIntersecting && e.boundingClientRect.top < 0));
      obs.observe(el);
      destroyRef.onDestroy(() => obs.disconnect());
    });
  }

  pickTeacher(id: number) {
    this.router.navigate(['/cours'], { queryParams: { teacherId: id } });
  }

  discoverLycee() {
    const lycee = this.lyceeUniversity();
    if (lycee) this.router.navigate(['/cours'], { queryParams: { universityId: lycee.id } });
  }


  scrollTrack(el: HTMLElement, dir: number) {
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' });
  }
}
