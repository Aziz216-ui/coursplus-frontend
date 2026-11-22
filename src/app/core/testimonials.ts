export interface Testimonial {
  quote: string;
  firstName: string;
  university: string;
  course: string;
}

// TODO: remplacer par de vrais avis. Tant que ce tableau est vide, aucun témoignage réel n'est publié.
export const TESTIMONIALS: Testimonial[] = [];

// À REMPLACER : exemples de mise en page, NON RÉELS. Affichés uniquement en mode développement, avec la mention « Exemple ».
export const SAMPLE_TESTIMONIALS: Testimonial[] = [
  { quote: 'À REMPLACER : une phrase courte d’un vrai étudiant sur ce que le cours lui a apporté.', firstName: 'Prénom', university: 'ESPRIT', course: 'Nom du cours' },
  { quote: 'À REMPLACER : une phrase courte d’un vrai étudiant sur ce que le cours lui a apporté.', firstName: 'Prénom', university: 'ESC', course: 'Nom du cours' },
  { quote: 'À REMPLACER : une phrase courte d’un vrai étudiant sur ce que le cours lui a apporté.', firstName: 'Prénom', university: 'FMT', course: 'Nom du cours' },
];
