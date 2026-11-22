import { Injectable, inject, signal } from '@angular/core';
import { Subject } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { AppNotification } from './models';
import { ToastService } from './toast.service';

/**
 * Notifications en temps réel (Server-Sent Events).
 *
 * EventSource ne sait pas envoyer l'en-tête Authorization, on lit donc le flux
 * avec fetch() : même résultat, mais avec le jeton JWT dans l'en-tête (rien dans l'URL).
 * En cas de coupure, on se reconnecte seul (délai croissant) et on recharge la liste.
 */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private toast = inject(ToastService);

  readonly items = signal<AppNotification[]>([]);
  readonly unread = signal(0);
  /** Émet chaque nouvelle notification reçue (les pages peuvent s'en servir pour se rafraîchir). */
  readonly incoming = new Subject<AppNotification>();

  private abort: AbortController | null = null;
  private running = false;

  /** À appeler quand l'utilisateur est connecté (sans effet si déjà démarré). */
  start() {
    if (this.running || !this.auth.token) return;
    this.running = true;
    this.abort = new AbortController();
    void this.loop(this.abort.signal);
  }

  /** À appeler à la déconnexion. */
  stop() {
    this.running = false;
    this.abort?.abort();
    this.abort = null;
    this.items.set([]);
    this.unread.set(0);
  }

  reload() {
    this.api.notifications().subscribe({
      next: (r) => {
        this.items.set(r.items);
        this.unread.set(r.unread);
      },
      error: () => {},
    });
  }

  open(n: AppNotification) {
    if (n.seen) return;
    this.items.update((list) => list.map((x) => (x.id === n.id ? { ...x, seen: true } : x)));
    this.unread.update((c) => Math.max(0, c - 1));
    this.api.markNotificationRead(n.id).subscribe({ error: () => {} });
  }

  markAllRead() {
    if (this.unread() === 0) return;
    this.items.update((list) => list.map((x) => ({ ...x, seen: true })));
    this.unread.set(0);
    this.api.markAllNotificationsRead().subscribe({ error: () => {} });
  }

  // ---------- Flux SSE ----------

  private async loop(signal: AbortSignal) {
    let delay = 2000;
    while (this.running && !signal.aborted) {
      this.reload(); // rattrape ce qui a pu arriver pendant une coupure
      try {
        const token = this.auth.token;
        if (!token) return;
        const res = await fetch(`${environment.apiUrl}/api/notifications/stream`, {
          headers: { Authorization: `Bearer ${token}`, Accept: 'text/event-stream' },
          signal,
        });
        if (res.status === 401 || res.status === 403) {
          // session invalide : le reste de l'appli gère la déconnexion, on n'insiste pas
          if (!signal.aborted) this.running = false;
          return;
        }
        if (!res.ok || !res.body) throw new Error('flux indisponible');
        delay = 2000;
        await this.read(res.body, signal);
      } catch {
        // coupure réseau ou arrêt volontaire : on retente ci-dessous
      }
      if (signal.aborted) return;
      await new Promise((r) => setTimeout(r, delay));
      delay = Math.min(delay * 2, 30000);
    }
  }

  private async read(body: ReadableStream<Uint8Array>, signal: AbortSignal) {
    const reader = body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    while (!signal.aborted) {
      const { value, done } = await reader.read();
      if (done) return;
      buffer += decoder.decode(value, { stream: true }).replace(/\r\n/g, '\n');
      let end: number;
      while ((end = buffer.indexOf('\n\n')) !== -1) {
        this.handle(buffer.slice(0, end));
        buffer = buffer.slice(end + 2);
      }
    }
  }

  private handle(block: string) {
    let event = 'message';
    const data: string[] = [];
    for (const line of block.split('\n')) {
      if (line.startsWith('event:')) event = line.slice(6).trim();
      else if (line.startsWith('data:')) data.push(line.slice(5).trim());
    }
    if (event !== 'notification' || data.length === 0) return; // « ready » et « ping » sont ignorés
    try {
      this.receive(JSON.parse(data.join('\n')) as AppNotification);
    } catch {
      /* message illisible : ignoré */
    }
  }

  private receive(n: AppNotification) {
    this.items.update((list) => [n, ...list.filter((x) => x.id !== n.id)].slice(0, 50));
    this.unread.update((c) => c + 1);
    this.toast.show(n.title, 'info');
    this.incoming.next(n);
    // Le statut du compte a changé : on met à jour le profil affiché.
    if (n.type === 'TEACHER_APPROVED' || n.type === 'TEACHER_REJECTED') {
      this.auth.refresh().subscribe({ error: () => {} });
    }
  }
}
