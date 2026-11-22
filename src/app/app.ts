import { Component, HostListener, effect, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth.service';
import { PHOTO_CREDITS, WHATSAPP_URL, contact } from './core/site-config';
import { ToastService } from './core/toast.service';
import { initials } from './core/display';
import { IconComponent } from './shared/icon';
import { NotificationBell } from './shared/notification-bell';
import { NotificationService } from './core/notification.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, IconComponent, NotificationBell],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected auth = inject(AuthService);
  protected toast = inject(ToastService);
  protected menuOpen = signal(false);
  protected scrolled = signal(false);
  protected year = new Date().getFullYear();
  protected contact = contact;
  protected photoCredits = PHOTO_CREDITS;
  /** Lien WhatsApp : vide tant que WHATSAPP_NUMBER n'est pas renseigné (le bouton n'est alors pas affiché). */
  protected whatsappLink = WHATSAPP_URL;

  private notifications = inject(NotificationService);

  constructor() {
    // Connecté : on ouvre le flux temps réel des notifications. Déconnecté : on le ferme.
    effect(() => {
      if (this.auth.isLoggedIn()) this.notifications.start();
      else this.notifications.stop();
    });
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled.set(window.scrollY > 8);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.menuOpen.set(false);
  }

  /** Le lien d'évitement garde l'URL intacte (balise base) et place le focus sur le contenu. */
  skipToMain(event: Event): void {
    event.preventDefault();
    document.getElementById('main')?.focus();
  }

  initials(name: string): string {
    return initials(name);
  }
}
