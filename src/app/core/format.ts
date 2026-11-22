/** Formate un prix en dinars : 29 -> "29 DT" */
export function dt(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—';
  const n = Number(value);
  return (Number.isInteger(n) ? n.toString() : n.toFixed(3).replace(/0+$/, '').replace(/\.$/, '')) + ' DT';
}

export function date(value: string | null | undefined): string {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

export const OFFER_LABELS: Record<string, string> = {
  COURSE: 'Cours',
  TEACHER_SUB: 'Abonnement enseignant',
  TRACK_SUB: 'Abonnement filière',
};

export const STATUS_LABELS: Record<string, string> = {
  PENDING: 'En attente',
  PAID: 'Payé',
  FAILED: 'Échoué',
  CANCELLED: 'Annulé',
};

/** Durée en minutes -> "2 h 30" ou "45 min". */
export function duration(minutes: number | null | undefined): string {
  if (!minutes || minutes <= 0) return '';
  const h = Math.floor(minutes / 60), m = Math.round(minutes % 60);
  if (h === 0) return `${m} min`;
  return m ? `${h} h ${String(m).padStart(2, '0')}` : `${h} h`;
}
