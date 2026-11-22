import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';

/** Demande d'inscription à une liste d'attente (offre Premium ou ouverture de l'offre lycée). */
export interface WaitlistRequest {
  /** Quelle liste : Premium (étudiants) ou lycée (parents). */
  list: 'premium' | 'lycee';
  /** E-mail ou numéro de téléphone. */
  contact: string;
  /** Université (Premium) ou niveau / matière (lycée). */
  detail: string;
}

/**
 * Liste d'attente.
 * TODO: le back-end n'a pas encore d'endpoint. Remplacer le corps de join() par
 *   return this.http.post<void>(`${environment.apiUrl}/waitlist`, req);
 * dès que POST /api/waitlist existe. Les composants n'ont pas besoin de changer.
 */
@Injectable({ providedIn: 'root' })
export class WaitlistService {
  join(req: WaitlistRequest): Observable<void> {
    // Version simulée : aucune donnée n'est envoyée ni enregistrée pour l'instant.
    console.info('[waitlist simulée]', req);
    return of(void 0).pipe(delay(700));
  }
}
