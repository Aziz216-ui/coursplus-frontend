// Types qui correspondent aux DTO du backend Spring Boot

export type Role = 'STUDENT' | 'TEACHER' | 'ADMIN';
export type OfferType = 'COURSE' | 'TEACHER_SUB' | 'TRACK_SUB';
export type PaymentMethod = 'KONNECT' | 'MANUAL';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED';

export interface User {
  id: number;
  fullName: string;
  email: string;
  role: Role;
  universityId: number | null;
  universityCode: string | null;
  specialty: string | null;
  bio: string | null;
  monthlyPrice: number | null;
  active: boolean;
  /** Enseignants : PENDING (en cours de vérification), APPROVED ou REJECTED. */
  approvalStatus: ApprovalStatus;
  credentialsLink: string | null;
  reviewNote: string | null;
}

export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface AppNotification {
  id: number;
  type: string;
  title: string;
  message: string | null;
  link: string | null;
  seen: boolean;
  createdAt: string;
}

export interface NotificationList {
  unread: number;
  items: AppNotification[];
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Track {
  id: number;
  name: string;
  universityId: number;
  monthlyPrice: number | null;
}

export interface University {
  id: number;
  code: string;
  name: string;
  tracks: Track[];
}

export interface Teacher {
  id: number;
  fullName: string;
  specialty: string | null;
  bio: string | null;
  monthlyPrice: number | null;
  courseCount: number;
  /** Optionnel : photo de l'enseignant (non fournie par l'API pour l'instant, voir TEACHER_PHOTOS). */
  photoUrl?: string | null;
}

export interface CourseCard {
  id: number;
  title: string;
  shortDescription: string;
  price: number;
  teacherId: number;
  teacherName: string;
  teacherSpecialty: string | null;
  universityCode: string | null;
  trackName: string | null;
  lessonCount: number;
  documentCount: number;
  published: boolean;
  /** Optionnel : image de couverture. Sans elle, icône de la matière sur fond coloré. */
  coverUrl?: string | null;
  /** Optionnel : nom d'icône (voir IconName). Sinon déduit de la matière (courseIcon). */
  icon?: string | null;
  /** Optionnel : tag affiché sur la carte (« 🔥 Populaire » / « ✨ Nouveau »). Absent = aucun tag. */
  badge?: 'populaire' | 'nouveau' | null;
  /** Optionnel : durée totale des vidéos, en minutes (non fournie par l'API pour l'instant). */
  totalDurationMinutes?: number | null;
  /** Optionnel : la première vidéo est un aperçu gratuit (non fourni par l'API pour l'instant). */
  freePreview?: boolean;
}

export interface Lesson {
  id: number;
  title: string;
  position: number;
  freePreview: boolean;
  hasVideo: boolean;
}

export interface CourseDocument {
  id: number;
  title: string;
  type: 'SUMMARY' | 'EXERCISE';
  originalName: string | null;
}

export interface Offer {
  offerType: OfferType;
  targetId: number;
  label: string;
  description: string;
  price: number;
}

export interface CourseDetail {
  id: number;
  title: string;
  description: string | null;
  price: number;
  teacher: Teacher;
  universityId: number | null;
  universityCode: string | null;
  trackId: number | null;
  trackName: string | null;
  published: boolean;
  lessons: Lesson[];
  documents: CourseDocument[];
  hasAccess: boolean;
  offers: Offer[];
}

export interface Payment {
  id: number;
  reference: string;
  offerType: OfferType;
  targetId: number;
  label: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  studentId: number;
  studentName: string;
  studentEmail: string;
  studentNote: string | null;
  createdAt: string;
  paidAt: string | null;
}

export interface CheckoutResponse {
  payment: Payment;
  payUrl: string | null;
  instructions: string | null;
}

export interface AccessItem {
  id: number;
  type: OfferType;
  label: string;
  startsAt: string;
  endsAt: string | null;
  active: boolean;
}

export interface MyLearning {
  courses: CourseCard[];
  accesses: AccessItem[];
}

export interface PlayResponse {
  url: string;
  /** Texte du filigrane (e-mail + identifiant). */
  watermark: string;
  /** Durée de validité du lien, en secondes : le lecteur le renouvelle avant. */
  expiresInSeconds: number;
}

export interface CourseSales {
  courseId: number;
  title: string;
  sales: number;
  revenue: number;
}

export interface Sale {
  reference: string;
  label: string;
  studentName: string;
  amount: number;
  teacherShare: number;
  paidAt: string;
}

export interface TeacherStats {
  totalSales: number;
  grossRevenue: number;
  teacherRevenue: number;
  teacherSharePercent: number;
  studentCount: number;
  activeSubscribers: number;
  perCourse: CourseSales[];
  recentSales: Sale[];
}

export interface TeacherStudent {
  id: number;
  fullName: string;
  email: string;
  universityCode: string | null;
  accessType: OfferType;
  accessLabel: string;
  since: string;
  until: string | null;
  active: boolean;
}

export interface AdminOverview {
  students: number;
  teachers: number;
  publishedCourses: number;
  pendingPayments: number;
  paidPayments: number;
  grossRevenue: number;
  platformRevenue: number;
  pendingTeachers: number;
}

/** Ligne du tableau admin « Visionnage ». */
export interface WatchRow {
  userId: number;
  fullName: string;
  email: string;
  plays24h: number;
  ips24h: number;
  seconds24h: number;
  seconds7d: number;
  suspicious: boolean;
  reason: string;
}

export interface WatchLessonRow {
  lessonId: number;
  lessonTitle: string;
  courseTitle: string;
  seconds: number;
  maxPosition: number;
  lastWatchedAt: string;
}
