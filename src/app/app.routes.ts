import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './core/guards';

// Chaque page est chargée seulement quand on y va (loadComponent) : le site reste léger.
export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/catalog/catalog').then((m) => m.CatalogPage) },
  { path: 'cours', loadComponent: () => import('./pages/courses/courses').then((m) => m.CoursesPage) },
  { path: 'cours/:id', loadComponent: () => import('./pages/course-detail/course-detail').then((m) => m.CourseDetailPage) },
  {
    path: 'cours/:id/apprendre',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/learn/learn').then((m) => m.LearnPage),
  },
  // Pages légales (texte à rédiger)
  { path: 'cgv', data: { title: 'Conditions générales de vente' }, loadComponent: () => import('./pages/legal/legal').then((m) => m.LegalPage) },
  { path: 'mentions-legales', data: { title: 'Mentions légales' }, loadComponent: () => import('./pages/legal/legal').then((m) => m.LegalPage) },
  { path: 'confidentialite', data: { title: 'Politique de confidentialité' }, loadComponent: () => import('./pages/legal/legal').then((m) => m.LegalPage) },
  { path: 'connexion', loadComponent: () => import('./pages/auth/login').then((m) => m.LoginPage) },
  { path: 'inscription', loadComponent: () => import('./pages/auth/register').then((m) => m.RegisterPage) },
  { path: 'inscription-enseignant', loadComponent: () => import('./pages/auth/register-teacher').then((m) => m.RegisterTeacherPage) },

  // Étudiant
  {
    path: 'mon-espace',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/my-learning/my-learning').then((m) => m.MyLearningPage),
  },
  {
    path: 'paiement/manuel/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/payment/manual-payment').then((m) => m.ManualPaymentPage),
  },
  {
    path: 'paiement/simulation/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/payment/simulation').then((m) => m.SimulationPage),
  },
  {
    path: 'paiement/resultat/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/payment/payment-result').then((m) => m.PaymentResultPage),
  },

  // Enseignant
  {
    path: 'enseignant',
    canActivate: [roleGuard('TEACHER')],
    loadComponent: () => import('./pages/teacher/teacher-dashboard').then((m) => m.TeacherDashboardPage),
  },
  {
    path: 'enseignant/cours/nouveau',
    canActivate: [roleGuard('TEACHER')],
    loadComponent: () => import('./pages/teacher/course-editor').then((m) => m.CourseEditorPage),
  },
  {
    path: 'enseignant/cours/:id',
    canActivate: [roleGuard('TEACHER')],
    loadComponent: () => import('./pages/teacher/course-editor').then((m) => m.CourseEditorPage),
  },

  // Administrateur
  {
    path: 'admin',
    canActivate: [roleGuard('ADMIN')],
    loadComponent: () => import('./pages/admin/admin').then((m) => m.AdminPage),
  },

  { path: '**', redirectTo: '' },
];
