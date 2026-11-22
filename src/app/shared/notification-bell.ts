import { Component, ElementRef, HostListener, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AppNotification } from '../core/models';
import { NotificationService } from '../core/notification.service';
import { IconComponent } from './icon';

/** Cloche de la barre du haut : compteur de non lus + liste déroulante. */
@Component({
  selector: 'app-notification-bell',
  imports: [IconComponent],
  template: `
    <button type="button" class="bell" (click)="toggle()" [attr.aria-expanded]="open()" aria-haspopup="true"
            [attr.aria-label]="'Notifications' + (notif.unread() ? ' (' + notif.unread() + ' non lues)' : '')">
      <app-icon name="bell" [size]="20" />
      @if (notif.unread() > 0) {
        <span class="count" aria-hidden="true">{{ notif.unread() > 9 ? '9+' : notif.unread() }}</span>
      }
    </button>

    @if (open()) {
      <section class="panel" aria-label="Notifications">
        <header>
          <strong>Notifications</strong>
          <button type="button" class="link" (click)="notif.markAllRead()" [disabled]="!notif.unread()">Tout marquer comme lu</button>
        </header>
        <ul>
          @for (n of notif.items(); track n.id) {
            <li>
              <button type="button" class="item" [class.unseen]="!n.seen" (click)="go(n)">
                <span class="dot" aria-hidden="true"></span>
                <span class="body">
                  <span class="title">{{ n.title }}</span>
                  @if (n.message) { <span class="msg">{{ n.message }}</span> }
                  <span class="time">{{ ago(n.createdAt) }}</span>
                </span>
              </button>
            </li>
          } @empty {
            <li class="empty">Aucune notification pour le moment.</li>
          }
        </ul>
      </section>
    }
  `,
  styles: `
    :host { position: relative; display: inline-flex; }
    .bell {
      position: relative; display: inline-flex; align-items: center; justify-content: center;
      width: var(--target); height: var(--target); border-radius: var(--radius-sm);
      background: none; border: 1px solid var(--line-strong); color: var(--ink); cursor: pointer;
    }
    .bell:hover { background: var(--cp-primary-50); }
    .count {
      position: absolute; top: -6px; right: -6px; min-width: 18px; height: 18px; padding: 0 4px;
      border-radius: 9px; background: var(--cp-sun); color: var(--cp-navy); font-size: 0.7rem; font-weight: 800;
      display: grid; place-items: center; border: 2px solid var(--cp-bg);
    }
    .panel {
      position: fixed; top: 72px; right: max(8px, calc((100vw - var(--container)) / 2 + var(--gutter)));
      width: min(94vw, 380px); max-height: min(70vh, 520px); overflow-y: auto; z-index: 40;
      background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius-md); box-shadow: var(--shadow-lg);
    }
    header { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; border-bottom: 1px solid var(--line-soft); position: sticky; top: 0; background: var(--surface); }
    .link { background: none; border: none; color: var(--cp-primary); font: inherit; font-size: 0.85rem; font-weight: 600; cursor: pointer; }
    .link:disabled { color: var(--muted); cursor: default; }
    ul { list-style: none; margin: 0; padding: 0; }
    .empty { padding: 28px 16px; text-align: center; color: var(--muted); }
    .item {
      display: flex; gap: 10px; width: 100%; text-align: left; padding: 12px 16px; background: none; border: none;
      border-bottom: 1px solid var(--line-soft); font: inherit; color: var(--ink); cursor: pointer;
    }
    .item:hover { background: var(--cp-primary-50); }
    .item.unseen { background: var(--cp-gold-50); }
    .dot { flex: 0 0 8px; height: 8px; margin-top: 7px; border-radius: 50%; background: transparent; }
    .unseen .dot { background: var(--cp-navy); }
    .body { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
    .title { font-weight: 700; font-size: 0.92rem; }
    .msg { font-size: 0.86rem; color: var(--ink-2); overflow-wrap: anywhere; }
    .time { font-size: 0.78rem; color: var(--muted); }
  `,
})
export class NotificationBell {
  protected notif = inject(NotificationService);
  private router = inject(Router);
  private host = inject(ElementRef<HTMLElement>);

  protected open = signal(false);

  toggle() {
    this.open.update((o) => !o);
  }

  go(n: AppNotification) {
    this.notif.open(n);
    this.open.set(false);
    if (n.link) this.router.navigateByUrl(n.link);
  }

  @HostListener('document:click', ['$event'])
  onDocClick(e: Event) {
    if (this.open() && !this.host.nativeElement.contains(e.target as Node)) this.open.set(false);
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    this.open.set(false);
  }

  ago(iso: string): string {
    const s = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
    if (s < 60) return "à l'instant";
    if (s < 3600) return `il y a ${Math.floor(s / 60)} min`;
    if (s < 86400) return `il y a ${Math.floor(s / 3600)} h`;
    return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  }
}
