// ============ Configuration du site (à compléter par l'équipe) ============

// TODO: remplacer par l'e-mail de contact réel (candidatures enseignants, footer). Valeur provisoire.
// Tant qu'il est vide, aucun lien mailto n'est affiché.
export const CONTACT_EMAIL: string = 'contact@coursplus.tn';

// TODO: remplacer 216XXXXXXXX par le vrai numéro WhatsApp (format international, chiffres seulement).
// Tant qu'il est vide, le bouton WhatsApp flottant n'est pas affiché.
export const WHATSAPP_NUMBER: string = '216XXXXXXXX';

// ---------- Photos (Pexels, usage commercial autorisé) : URL uniquement, rien n'est stocké dans le repo ----------
export const PHOTO_IDS = {
  hero: 4778621, // groupe d'étudiants qui révisent (TODO: créditer le photographe)
  parents: 6958547, // Karola G
  students: 7972537, // deux étudiantes sur le campus (TODO: créditer le photographe)
  teacher: 39192424, // Vitaly Gariev
  ambiance: 37284575, // Halil Cihat Darıcıoğlu (fond des pages connexion/inscription, voir home.scss)
} as const;

// TODO: ajouter les photographes des photos 4778621 et 7972537 (nom visible sur leur page Pexels).
export const PHOTO_CREDITS = 'Karola G, Vitaly Gariev, Halil Cihat Darıcıoğlu';

export function pexelsUrl(id: number, width = 1200): string {
  return `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${width}`;
}

/** srcset 400w / 800w (écrans Retina 2x) / 1200w : Pexels redimensionne à la demande, aucun fichier 2x à fournir. */
export function pexelsSrcset(id: number): string {
  return `${pexelsUrl(id, 400)} 400w, ${pexelsUrl(id, 800)} 800w, ${pexelsUrl(id, 1200)} 1200w`;
}

// TODO: vraies photos des enseignants. Associer l'id de l'enseignant à l'URL de sa photo.
// Exemple : { 2: 'https://…/sami.jpg' }. Sans photo, ses initiales sont affichées.
export const TEACHER_PHOTOS: Record<number, string> = {};

export function teacherPhoto(id: number, fromApi?: string | null): string | null {
  return fromApi || TEACHER_PHOTOS[id] || null;
}

// ---------- Hero ----------
/** Ligne de preuve sociale affichée sous les boutons du hero (texte facile à modifier ici). */
export const HERO_SOCIAL_PROOF = '⭐ Déjà des centaines d’étudiants ESPRIT, ESC et FMT inscrits';

// ---------- Section témoignages ----------
// TODO: passer à true quand TESTIMONIALS (core/testimonials.ts) contient de vrais avis.
export const SHOW_TESTIMONIALS = false;

// ---------- Contact (footer) ----------
// TODO: renseigner les vraies valeurs. Une entrée vide n'est pas affichée comme lien (« bientôt »).
export const contact: { email: string; whatsapp: string; facebook: string; instagram: string } = {
  email: CONTACT_EMAIL,
  whatsapp: WHATSAPP_NUMBER, // chiffres seulement, format international
  facebook: '', // URL complète de la page Facebook
  instagram: '', // URL complète du profil Instagram
};

// ---------- Corrections d'affichage des profils enseignants ----------
// Les données viennent du back-end (non modifié). En attendant qu'elles soient corrigées à la source,
// on complète côté front. TODO: supprimer une entrée dès que le profil est corrigé en base.
export const TEACHER_OVERRIDES: Record<number, { specialty?: string; bio?: string }> = {
  // Youssef Gharbi : métier affiché « Info » et bio « bio » en base.
  4: {
    specialty: 'Ingénieur informatique',
    // TODO: remplacer par la vraie bio de Youssef (ce texte est seulement déduit de ses cours).
    bio: 'Ingénieur informatique. Cours de Spring Boot et de Machine Learning pour les étudiants d’ESPRIT.',
  },
};

export function withOverride<T extends { id: number; specialty: string | null; bio: string | null }>(t: T): T {
  const o = TEACHER_OVERRIDES[t.id];
  return o ? { ...t, specialty: o.specialty ?? t.specialty, bio: o.bio ?? t.bio } : t;
}

export function teacherRole(id: number, specialty: string | null): string | null {
  return TEACHER_OVERRIDES[id]?.specialty ?? specialty;
}

/** Lien WhatsApp (footer, bouton flottant, FAQ paiement). Vide si le numéro n'est pas renseigné. */
export const WHATSAPP_URL: string = WHATSAPP_NUMBER ? 'https://wa.me/' + WHATSAPP_NUMBER : '';

// ---------- Corrections d'affichage des titres de cours ----------
// TODO: supprimer une entrée dès que le titre est corrigé en base (espace enseignant → modifier le cours).
export const COURSE_TITLE_FIXES: Record<string, string> = {
  mlops: 'MLOps : du modèle à la production',
};
export function courseTitle(title: string): string {
  return COURSE_TITLE_FIXES[title.trim().toLowerCase()] ?? title;
}
