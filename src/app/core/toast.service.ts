import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  text: string;
  kind: 'success' | 'error' | 'info';
}

/** Petites notifications en bas de l'écran. */
@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toasts = signal<Toast[]>([]);
  private nextId = 1;

  show(text: string, kind: Toast['kind'] = 'info') {
    const id = this.nextId++;
    this.toasts.update((t) => [...t, { id, text, kind }]);
    setTimeout(() => this.dismiss(id), 4500);
  }

  success(text: string) {
    this.show(text, 'success');
  }

  error(text: string) {
    this.show(text, 'error');
  }

  dismiss(id: number) {
    this.toasts.update((t) => t.filter((x) => x.id !== id));
  }
}

/** Extrait le message d'erreur renvoyé par le backend. */
export function errorMessage(err: any, fallback = 'Une erreur est survenue'): string {
  return err?.error?.message || fallback;
}
