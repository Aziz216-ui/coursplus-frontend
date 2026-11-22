import { HttpClient, HttpEvent, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  AdminOverview, CheckoutResponse, CourseCard, CourseDetail, CourseDocument, Lesson, MyLearning,
  NotificationList, OfferType, Payment, PaymentMethod, PaymentStatus, PlayResponse, Teacher, TeacherStats, WatchLessonRow, WatchRow,
  TeacherStudent, Track, University, User,
} from './models';

/** Tous les appels HTTP vers le backend, au même endroit. */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/api`;

  /** Transforme une URL relative du backend (/api/media/...) en URL complète. */
  absolute(url: string): string {
    return url.startsWith('http') ? url : `${environment.apiUrl}${url}`;
  }

  // ---------- Catalogue ----------
  universities() {
    return this.http.get<University[]>(`${this.base}/catalog/universities`);
  }
  teachers() {
    return this.http.get<Teacher[]>(`${this.base}/catalog/teachers`);
  }
  courses(filters: { universityId?: number | null; trackId?: number | null; teacherId?: number | null; q?: string }) {
    let params = new HttpParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== null && v !== undefined && v !== '') params = params.set(k, String(v));
    });
    return this.http.get<CourseCard[]>(`${this.base}/courses`, { params });
  }
  course(id: number) {
    return this.http.get<CourseDetail>(`${this.base}/courses/${id}`);
  }

  // ---------- Étudiant ----------
  myLearning() {
    return this.http.get<MyLearning>(`${this.base}/me/learning`);
  }
  myPayments() {
    return this.http.get<Payment[]>(`${this.base}/me/payments`);
  }
  play(lessonId: number) {
    return this.http.get<PlayResponse>(`${this.base}/lessons/${lessonId}/play`);
  }
  /** Battement du lecteur : secondes regardées depuis le précédent + position dans la vidéo. */
  heartbeat(lessonId: number, seconds: number, position: number) {
    return this.http.post<void>(`${this.base}/lessons/${lessonId}/heartbeat`, { seconds, position });
  }
  adminWatch() {
    return this.http.get<WatchRow[]>(`${this.base}/admin/watch`);
  }
  adminWatchDetail(userId: number) {
    return this.http.get<WatchLessonRow[]>(`${this.base}/admin/watch/${userId}`);
  }
  documentLink(documentId: number) {
    return this.http.get<PlayResponse>(`${this.base}/documents/${documentId}/link`);
  }

  // ---------- Paiement ----------
  checkout(offerType: OfferType, targetId: number, method: PaymentMethod) {
    return this.http.post<CheckoutResponse>(`${this.base}/payments/checkout`, { offerType, targetId, method });
  }
  payment(id: number) {
    return this.http.get<Payment>(`${this.base}/payments/${id}`);
  }
  sendProof(id: number, note: string) {
    return this.http.post<Payment>(`${this.base}/payments/${id}/proof`, { note });
  }
  simulate(id: number) {
    return this.http.post<Payment>(`${this.base}/payments/${id}/simulate-success`, {});
  }

  // ---------- Enseignant ----------
  teacherCourses() {
    return this.http.get<CourseCard[]>(`${this.base}/teacher/courses`);
  }
  createCourse(body: CourseForm) {
    return this.http.post<CourseDetail>(`${this.base}/teacher/courses`, body);
  }
  updateCourse(id: number, body: CourseForm) {
    return this.http.put<CourseDetail>(`${this.base}/teacher/courses/${id}`, body);
  }
  publishCourse(id: number, published: boolean) {
    return this.http.patch<CourseDetail>(`${this.base}/teacher/courses/${id}/published`, { published });
  }
  deleteCourse(id: number) {
    return this.http.delete<void>(`${this.base}/teacher/courses/${id}`);
  }
  /** Envoi d'une vidéo avec suivi de progression (reportProgress). */
  uploadLesson(courseId: number, file: File, title: string, freePreview: boolean): Observable<HttpEvent<Lesson>> {
    const form = new FormData();
    form.append('file', file);
    form.append('title', title);
    form.append('freePreview', String(freePreview));
    return this.http.post<Lesson>(`${this.base}/teacher/courses/${courseId}/lessons`, form, {
      reportProgress: true,
      observe: 'events',
    });
  }
  updateLesson(id: number, body: { title?: string; freePreview?: boolean; position?: number }) {
    return this.http.patch<Lesson>(`${this.base}/teacher/lessons/${id}`, body);
  }
  deleteLesson(id: number) {
    return this.http.delete<void>(`${this.base}/teacher/lessons/${id}`);
  }
  uploadDocument(courseId: number, file: File, title: string, type: 'SUMMARY' | 'EXERCISE') {
    const form = new FormData();
    form.append('file', file);
    form.append('title', title);
    form.append('type', type);
    return this.http.post<CourseDocument>(`${this.base}/teacher/courses/${courseId}/documents`, form);
  }
  deleteDocument(id: number) {
    return this.http.delete<void>(`${this.base}/teacher/documents/${id}`);
  }
  teacherStats() {
    return this.http.get<TeacherStats>(`${this.base}/teacher/stats`);
  }
  teacherStudents() {
    return this.http.get<TeacherStudent[]>(`${this.base}/teacher/students`);
  }
  updateTeacherProfile(body: { specialty: string | null; bio: string | null; monthlyPrice: number | null }) {
    return this.http.put<User>(`${this.base}/teacher/profile`, body);
  }

  // ---------- Notifications ----------
  notifications() {
    return this.http.get<NotificationList>(`${this.base}/notifications`);
  }
  markNotificationRead(id: number) {
    return this.http.post<void>(`${this.base}/notifications/${id}/read`, {});
  }
  markAllNotificationsRead() {
    return this.http.post<void>(`${this.base}/notifications/read-all`, {});
  }

  // ---------- Admin ----------
  adminOverview() {
    return this.http.get<AdminOverview>(`${this.base}/admin/overview`);
  }
  adminPayments(status?: PaymentStatus) {
    const params = status ? new HttpParams().set('status', status) : undefined;
    return this.http.get<Payment[]>(`${this.base}/admin/payments`, { params });
  }
  adminConfirm(id: number) {
    return this.http.post<Payment>(`${this.base}/admin/payments/${id}/confirm`, {});
  }
  adminReject(id: number) {
    return this.http.post<Payment>(`${this.base}/admin/payments/${id}/reject`, {});
  }
  adminUsers(role?: string) {
    const params = role ? new HttpParams().set('role', role) : undefined;
    return this.http.get<User[]>(`${this.base}/admin/users`, { params });
  }
  adminCreateTeacher(body: {
    fullName: string; email: string; password: string; specialty: string; bio: string; monthlyPrice: number | null;
  }) {
    return this.http.post<User>(`${this.base}/admin/teachers`, body);
  }
  adminReviewTeacher(id: number, approve: boolean, note?: string) {
    return this.http.post<User>(`${this.base}/admin/teachers/${id}/review`, { approve, note });
  }
  adminSetActive(id: number, active: boolean) {
    return this.http.patch<User>(`${this.base}/admin/users/${id}/active`, { active });
  }
  adminCreateUniversity(code: string, name: string) {
    return this.http.post<University>(`${this.base}/admin/universities`, { code, name });
  }
  adminCreateTrack(name: string, universityId: number, monthlyPrice: number | null) {
    return this.http.post<Track>(`${this.base}/admin/tracks`, { name, universityId, monthlyPrice });
  }
  adminCourses() {
    return this.http.get<CourseCard[]>(`${this.base}/admin/courses`);
  }
  adminPublishCourse(id: number, published: boolean) {
    return this.http.patch<CourseCard>(`${this.base}/admin/courses/${id}/published`, { published });
  }
}

export interface CourseForm {
  title: string;
  description: string;
  price: number | null;
  universityId: number | null;
  trackId: number | null;
}
