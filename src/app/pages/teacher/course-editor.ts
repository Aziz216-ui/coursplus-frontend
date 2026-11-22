import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { HttpEventType } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../../shared/icon';
import { Router, RouterLink } from '@angular/router';
import { ApiService, CourseForm } from '../../core/api.service';
import { CourseDetail, University } from '../../core/models';
import { ToastService, errorMessage } from '../../core/toast.service';

/** Création / modification d'un cours, envoi des vidéos et des PDF. */
@Component({
  selector: 'app-course-editor',
  imports: [FormsModule, RouterLink, IconComponent],
  templateUrl: './course-editor.html',
  styles: `
    .lesson { display:flex; align-items:center; gap:12px; padding:12px 0; border-bottom:1px solid var(--line-soft); }
    .lesson:last-child { border-bottom:none; }
    .grow { flex:1; }
    .upload { background: var(--bg); border: 1px dashed var(--line-strong); border-radius: var(--radius-sm); padding: 16px; margin-top: 14px; }
    .layout { display:grid; grid-template-columns: 1fr 1fr; gap: 20px; align-items: start; }
    @media (max-width: 860px) { .layout { grid-template-columns: 1fr; } }
  `,
})
export class CourseEditorPage {
  /** Absent pour /enseignant/cours/nouveau */
  id = input<string | undefined>();

  private api = inject(ApiService);
  private router = inject(Router);
  private toast = inject(ToastService);

  universities = signal<University[]>([]);
  course = signal<CourseDetail | null>(null);
  isNew = computed(() => !this.id());
  saving = signal(false);

  form: CourseForm = { title: '', description: '', price: null, universityId: null, trackId: null };
  tracks = computed(() => this.universities().find((u) => u.id === this.selectedUni())?.tracks ?? []);
  selectedUni = signal<number | null>(null);

  // Envoi de vidéo
  videoFile: File | null = null;
  videoTitle = '';
  videoPreview = false;
  uploadProgress = signal<number | null>(null);

  // Envoi de PDF
  docFile: File | null = null;
  docTitle = '';
  docType: 'SUMMARY' | 'EXERCISE' = 'SUMMARY';
  docUploading = signal(false);

  constructor() {
    this.api.universities().subscribe((u) => this.universities.set(u));
    effect(() => {
      const id = this.id();
      if (id) this.load(Number(id));
    });
  }

  private load(id: number) {
    this.api.course(id).subscribe({
      next: (c) => {
        this.course.set(c);
        this.form = {
          title: c.title,
          description: c.description ?? '',
          price: c.price,
          universityId: c.universityId,
          trackId: c.trackId,
        };
        this.selectedUni.set(c.universityId);
      },
      error: () => this.router.navigateByUrl('/enseignant'),
    });
  }

  onUniChange(id: number | null) {
    this.form.universityId = id;
    this.form.trackId = null;
    this.selectedUni.set(id);
  }

  save() {
    this.saving.set(true);
    const req = this.isNew() ? this.api.createCourse(this.form) : this.api.updateCourse(this.course()!.id, this.form);
    req.subscribe({
      next: (c) => {
        this.saving.set(false);
        this.toast.success(this.isNew() ? 'Cours créé ! Ajoute maintenant tes vidéos.' : 'Modifications enregistrées');
        if (this.isNew()) this.router.navigate(['/enseignant/cours', c.id]);
        else this.course.set(c);
      },
      error: (err) => {
        this.saving.set(false);
        this.toast.error(errorMessage(err));
      },
    });
  }

  togglePublish() {
    const c = this.course()!;
    this.api.publishCourse(c.id, !c.published).subscribe({
      next: (res) => {
        this.course.set(res);
        this.toast.success(res.published ? 'Cours publié : il est visible dans le catalogue' : 'Cours retiré du catalogue');
      },
      error: (err) => this.toast.error(errorMessage(err)),
    });
  }

  remove() {
    const c = this.course()!;
    if (!confirm(`Supprimer définitivement « ${c.title} » ?`)) return;
    this.api.deleteCourse(c.id).subscribe({
      next: () => {
        this.toast.success('Cours supprimé');
        this.router.navigateByUrl('/enseignant');
      },
      error: (err) => this.toast.error(errorMessage(err)),
    });
  }

  // ---------- Vidéos ----------

  onVideoSelected(e: Event) {
    this.videoFile = (e.target as HTMLInputElement).files?.[0] ?? null;
    if (this.videoFile && !this.videoTitle) this.videoTitle = this.videoFile.name.replace(/\.[^.]+$/, '');
  }

  uploadVideo(input: HTMLInputElement) {
    const c = this.course();
    if (!c || !this.videoFile) return;
    this.uploadProgress.set(0);
    this.api.uploadLesson(c.id, this.videoFile, this.videoTitle, this.videoPreview).subscribe({
      next: (event) => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
          this.uploadProgress.set(Math.round((100 * event.loaded) / event.total));
        } else if (event.type === HttpEventType.Response) {
          this.uploadProgress.set(null);
          this.videoFile = null;
          this.videoTitle = '';
          this.videoPreview = false;
          input.value = '';
          this.toast.success('Vidéo ajoutée');
          this.load(c.id);
        }
      },
      error: (err) => {
        this.uploadProgress.set(null);
        this.toast.error(errorMessage(err, "Échec de l'envoi"));
      },
    });
  }

  togglePreview(lessonId: number, freePreview: boolean) {
    this.api.updateLesson(lessonId, { freePreview }).subscribe(() => this.load(this.course()!.id));
  }

  deleteLesson(lessonId: number) {
    if (!confirm('Supprimer cette vidéo ?')) return;
    this.api.deleteLesson(lessonId).subscribe({
      next: () => this.load(this.course()!.id),
      error: (err) => this.toast.error(errorMessage(err)),
    });
  }

  // ---------- Documents ----------

  onDocSelected(e: Event) {
    this.docFile = (e.target as HTMLInputElement).files?.[0] ?? null;
    if (this.docFile && !this.docTitle) this.docTitle = this.docFile.name.replace(/\.[^.]+$/, '');
  }

  uploadDoc(input: HTMLInputElement) {
    const c = this.course();
    if (!c || !this.docFile) return;
    this.docUploading.set(true);
    this.api.uploadDocument(c.id, this.docFile, this.docTitle, this.docType).subscribe({
      next: () => {
        this.docUploading.set(false);
        this.docFile = null;
        this.docTitle = '';
        input.value = '';
        this.toast.success('Document ajouté');
        this.load(c.id);
      },
      error: (err) => {
        this.docUploading.set(false);
        this.toast.error(errorMessage(err, "Échec de l'envoi"));
      },
    });
  }

  deleteDoc(id: number) {
    if (!confirm('Supprimer ce document ?')) return;
    this.api.deleteDocument(id).subscribe(() => this.load(this.course()!.id));
  }
}
