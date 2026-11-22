import { Component, OnDestroy, computed, effect, inject, input, signal } from '@angular/core';
import { IconComponent } from '../../shared/icon';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { CourseDetail, Lesson } from '../../core/models';
import { ToastService, errorMessage } from '../../core/toast.service';

/**
 * Lecteur de cours : vidéo + liste des leçons + documents PDF.
 * Protection : lien vidéo court renouvelé automatiquement, filigrane (e-mail + ID) en mosaïque et mobile,
 * plein écran sur le conteneur, clic droit et téléchargement désactivés.
 */
@Component({
  selector: 'app-learn',
  imports: [RouterLink, IconComponent],
  templateUrl: './learn.html',
  styleUrl: './learn.scss',
})
export class LearnPage implements OnDestroy {
  id = input.required<string>();
  /** ?lecon=12 dans l'URL */
  lecon = input<string | undefined>();

  private api = inject(ApiService);
  private router = inject(Router);
  private toast = inject(ToastService);

  course = signal<CourseDetail | null>(null);
  current = signal<Lesson | null>(null);
  videoUrl = signal<string | null>(null);
  watermark = signal('');
  locked = signal(false);
  wmPos = signal({ top: 12, left: 10 });
  private wmTimer = setInterval(() => this.moveWatermark(), 7000);
  /** 9 tuiles de filigrane (mosaïque 3×3). */
  readonly tiles = [0, 1, 2, 3, 4, 5, 6, 7, 8];
  /** true si les filigranes ont été retirés ou masqués : la lecture est alors arrêtée. */
  tampered = signal(false);
  readonly canFullscreen = typeof document !== 'undefined' && !!document.documentElement.requestFullscreen;
  /** Vérifie régulièrement que les filigranes sont toujours là (dissuasion, pas une protection absolue). */
  private integrityTimer = setInterval(() => this.checkIntegrity(), 3000);
  private refreshTimer: any;
  /** Battement : toutes les 15 s de lecture réelle, on informe le serveur (suivi du temps regardé). */
  private beatTimer = setInterval(() => this.beat(), 15000);
  private lastBeat = Date.now();
  private lastRefresh = 0;

  index = computed(() => {
    const c = this.course();
    const cur = this.current();
    return c && cur ? c.lessons.findIndex((l) => l.id === cur.id) : -1;
  });

  constructor() {
    effect(() => {
      const courseId = Number(this.id());
      const lessonId = this.lecon() ? Number(this.lecon()) : null;
      this.api.course(courseId).subscribe({
        next: (c) => {
          this.course.set(c);
          const lesson = c.lessons.find((l) => l.id === lessonId) ?? c.lessons[0] ?? null;
          if (lesson) this.open(lesson);
        },
        error: () => this.router.navigateByUrl('/'),
      });
    });
  }

  open(lesson: Lesson) {
    const c = this.course();
    if (!c) return;
    this.current.set(lesson);
    this.videoUrl.set(null);
    this.tampered.set(false);
    clearTimeout(this.refreshTimer);
    if (!c.hasAccess && !lesson.freePreview) {
      this.locked.set(true);
      return;
    }
    this.locked.set(false);
    this.api.play(lesson.id).subscribe({
      next: (res) => {
        this.videoUrl.set(this.api.absolute(res.url));
        this.watermark.set(res.watermark);
        this.scheduleRefresh(lesson, res.expiresInSeconds);
      },
      error: (err) => this.toast.error(errorMessage(err, 'Impossible de lire cette vidéo')),
    });
  }

  next() {
    const c = this.course();
    const i = this.index();
    if (c && i >= 0 && i < c.lessons.length - 1) this.open(c.lessons[i + 1]);
  }

  openDocument(id: number) {
    // On ouvre l'onglet tout de suite (sinon le navigateur peut bloquer la fenêtre)
    const win = window.open('', '_blank');
    this.api.documentLink(id).subscribe({
      next: (res) => {
        if (win) win.location.href = this.api.absolute(res.url);
        else window.location.href = this.api.absolute(res.url);
      },
      error: (err) => {
        win?.close();
        this.toast.error(errorMessage(err, 'Document indisponible'));
      },
    });
  }

  // ---------- Protection : renouvellement du lien, intégrité, plein écran ----------

  /** Le lien vidéo est court (15 min) : on le renouvelle 2 minutes avant son expiration, sans couper la lecture. */
  private scheduleRefresh(lesson: Lesson, expiresInSeconds: number) {
    clearTimeout(this.refreshTimer);
    const delay = Math.max(30, (expiresInSeconds || 900) - 120) * 1000;
    this.refreshTimer = setTimeout(() => this.refreshVideo(lesson), delay);
  }

  /** Redemande un lien et reprend à la même seconde, dans le même état (lecture ou pause). */
  private refreshVideo(lesson: Lesson) {
    if (this.current()?.id !== lesson.id) return;
    this.lastRefresh = Date.now();
    const video = document.querySelector<HTMLVideoElement>('.player video');
    const time = video?.currentTime ?? 0;
    const wasPlaying = !!video && !video.paused && !video.ended;
    this.api.play(lesson.id).subscribe({
      next: (res) => {
        video?.addEventListener('loadedmetadata', () => {
          video.currentTime = time;
          if (wasPlaying) void video.play().catch(() => {});
          else video.pause();
        }, { once: true });
        this.videoUrl.set(this.api.absolute(res.url));
        this.watermark.set(res.watermark);
        this.scheduleRefresh(lesson, res.expiresInSeconds);
      },
      // 401/403 : la session est gérée par l'intercepteur ; sinon on réessaie dans une minute
      error: () => { this.refreshTimer = setTimeout(() => this.refreshVideo(lesson), 60000); },
    });
  }

  /** Lien expiré pendant une longue pause : on en redemande un (au plus une fois toutes les 10 s). */
  onVideoError() {
    const lesson = this.current();
    if (lesson && !this.locked() && Date.now() - this.lastRefresh > 10000) this.refreshVideo(lesson);
  }

  /** Envoie les secondes réellement regardées depuis le dernier battement (0 si en pause ou onglet sans lecture). */
  private beat() {
    const now = Date.now();
    const elapsed = Math.round((now - this.lastBeat) / 1000);
    this.lastBeat = now;
    const lesson = this.current();
    const video = document.querySelector<HTMLVideoElement>('.player video');
    if (!lesson || !video || video.paused || video.ended || this.locked() || this.tampered()) return;
    this.api.heartbeat(lesson.id, Math.min(elapsed, 20), Math.floor(video.currentTime)).subscribe({ error: () => {} });
  }

  /** Les filigranes doivent exister et rester visibles ; sinon on arrête la vidéo. */
  private checkIntegrity() {
    const player = document.querySelector('.player');
    if (!player || !player.querySelector('video')) return; // pas de vidéo en cours
    const ok = ['.wm-tiles', '.watermark'].every((sel) => {
      const el = player.querySelector<HTMLElement>(sel);
      if (!el) return false;
      const s = getComputedStyle(el);
      return s.display !== 'none' && s.visibility !== 'hidden' && parseFloat(s.opacity) > 0.05;
    });
    if (!ok) {
      player.querySelector('video')?.pause();
      this.videoUrl.set(null);
      this.tampered.set(true);
    }
  }

  /** Plein écran sur le conteneur : les filigranes restent visibles (le plein écran natif de la vidéo les masquerait). */
  toggleFullscreen(player: HTMLElement) {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void player.requestFullscreen?.();
  }

  private moveWatermark() {
    this.wmPos.set({ top: 8 + Math.random() * 70, left: 5 + Math.random() * 55 });
  }

  ngOnDestroy() {
    clearInterval(this.wmTimer);
    clearInterval(this.integrityTimer);
    clearInterval(this.beatTimer);
    clearTimeout(this.refreshTimer);
  }
}
