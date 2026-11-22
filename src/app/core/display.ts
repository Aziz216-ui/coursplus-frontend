import { CourseCard, Teacher } from './models';

/** Pluriel français propre : plural(0,'vidéo') -> "0 vidéo", plural(2,'vidéo') -> "2 vidéos". */
export function plural(n: number, word: string, pluralWord = word + 's'): string {
  return `${n} ${n > 1 ? pluralWord : word}`;
}

/** Titre de section : "Aucun cours", "1 cours disponible", "5 cours disponibles". */
export function coursesHeading(n: number): string {
  if (n === 0) return 'Aucun cours disponible';
  return n === 1 ? '1 cours disponible' : `${n} cours disponibles`;
}

const PLACEHOLDERS = new Set(['', 'x', 'bio', 'test', 'n/a', '-']);
const blank = (v: string | null | undefined) => PLACEHOLDERS.has((v ?? '').trim().toLowerCase());

/** Un profil est publiable s'il a au moins un cours, un métier et une bio réels (masque les comptes de test). */
export function isPublicTeacher(t: Teacher): boolean {
  return t.courseCount > 0 && !blank(t.specialty) && !blank(t.bio) && !/^prof e2e/i.test(t.fullName.trim());
}

export type Domain = 'health' | 'finance' | 'tech' | 'other';

/** Domaine déduit du métier / de la filière (sert aux couleurs et aux icônes). */
export function domainOf(...texts: (string | null | undefined)[]): Domain {
  const t = texts.filter(Boolean).join(' ').toLowerCase();
  if (/m[ée]decin|m[ée]decine|sant[ée]|anatom|fmt|pharma|dent/.test(t)) return 'health';
  if (/financ|gestion|compta|[ée]co|esc|march[ée]|banque/.test(t)) return 'finance';
  if (/inform|d[ée]velop|code|spring|angular|logiciel|esprit|data|r[ée]seau|ing[ée]nieur/.test(t)) return 'tech';
  return 'other';
}

export const DOMAIN_COLOR: Record<Domain, string> = {
  health: 'var(--uni-fmt)',
  finance: 'var(--uni-esc)',
  tech: 'var(--uni-esprit)',
  other: 'var(--uni-lycee)',
};

/** Couleur fixe par université (jamais aléatoire). */
export function uniColor(code: string | null | undefined): string {
  switch ((code ?? '').toUpperCase()) {
    case 'ESPRIT': return 'var(--uni-esprit)';
    case 'ESC': return 'var(--uni-esc)';
    case 'FMT': return 'var(--uni-fmt)';
    case 'LYCEE': case 'LYCÉE': return 'var(--uni-lycee)';
    default: return 'var(--cp-primary)';
  }
}

export function courseDomain(c: CourseCard): Domain {
  const d = domainOf(c.trackName, c.title);
  return d !== 'other' ? d : domainOf(c.universityCode);
}

export function initials(name: string): string {
  return name.replace(/^(dr|pr|prof)\.?\s+/i, '').split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase();
}

const ICON_NAMES = new Set(['stethoscope', 'chart', 'code', 'brain', 'leaf', 'book']);

/** Icône d'un cours : champ `icon` des données s'il existe, sinon déduite du titre / de la filière, sinon par domaine. */
export function courseIcon(c: CourseCard): string {
  if (c.icon && ICON_NAMES.has(c.icon)) return c.icon;
  const t = (c.title + ' ' + (c.trackName ?? '')).toLowerCase();
  if (/machine learning|intelligence artificielle|\bia\b|data science|deep learning/.test(t)) return 'brain';
  if (/spring/.test(t)) return 'leaf';
  if (/anatom|m[ée]decin|physiolog|pcem/.test(t)) return 'stethoscope';
  if (/financ|march[ée]|compta|gestion|[ée]conom/.test(t)) return 'chart';
  const d = courseDomain(c);
  return d === 'health' ? 'stethoscope' : d === 'finance' ? 'chart' : d === 'tech' ? 'code' : 'book';
}

// ============ Logos des matières ============
// Règles issues de la vérification des chartes de marque (voir la page « Mentions légales ») :
//  - brand   : logo officiel non modifié (couleurs d'origine), affiché tel quel ;
//  - mono    : logo à une couleur, affiché dans sa couleur officielle (masque CSS) ;
//  - generic : icône libre (Lucide, ISC) quand le logo de la marque n'est pas utilisable (Spring, Java, Node, Docker, Excel…).
//    Le nom de la technologie est alors écrit en texte sur la carte (l'usage du nom est autorisé, pas celui du logo).
export interface CourseLogo {
  kind: 'brand' | 'mono' | 'generic';
  src: string;
  color?: string;
  /** Nom de la technologie affiché en texte (icônes génériques). */
  name?: string;
  /** Marque déposée : afficher ™ à côté du logo. */
  tm?: boolean;
}
const g = (file: string, name?: string): CourseLogo => ({ kind: 'generic', src: 'assets/logos/' + file, name });
const b = (file: string, tm = false): CourseLogo => ({ kind: 'brand', src: 'assets/logos/' + file, tm });
const m = (file: string, color: string): CourseLogo => ({ kind: 'mono', src: 'assets/logos/' + file, color });

/** Ordre important : le premier motif qui correspond gagne. */
const LOGO_RULES: [RegExp, CourseLogo][] = [
  [/mlops|devops/, g('generic-container.svg')],
  [/spring/, g('generic-server.svg')],
  [/scikit|sklearn/, b('scikit-learn.svg')],
  [/tensorflow/, b('tensorflow.svg', true)],
  [/pytorch/, g('generic-brain.svg', 'PyTorch')],
  [/angular/, m('angular.svg', '#0F0F11')],
  [/typescript/, m('typescript.svg', '#3178C6')],
  [/javascript|\bjs\b/, b('javascript.svg')],
  [/python/, b('python.svg', true)],
  [/flutter/, b('flutter.svg', true)],
  [/kotlin/, b('kotlin.svg')],
  [/laravel/, g('generic-code.svg', 'Laravel')],
  [/\bphp\b/, b('php.svg')],
  [/c\+\+|\bcpp\b/, b('cpp.svg')],
  [/\bjava\b/, g('generic-braces.svg', 'Java')],
  [/react/, g('generic-atom.svg', 'React')],
  [/node\.?js/, g('generic-terminal.svg', 'Node.js')],
  [/postgres/, g('generic-database.svg', 'PostgreSQL')],
  [/mysql/, g('generic-database.svg', 'MySQL')],
  [/docker/, g('generic-container.svg', 'Docker')],
  [/\bgit\b|github/, m('git.svg', '#F03C2E')],
  [/excel/, g('generic-sheet.svg', 'Excel')],
  [/machine learning|intelligence artificielle|\bia\b|data science|deep learning/, g('generic-brain.svg')],
  [/anatom|m[ée]decin|physiolog|pcem/, g('generic-bone.svg')],
  [/math/, g('generic-sigma.svg')],
  [/financ|march[ée]/, g('generic-candlestick.svg')],
];

/** Logo d'un cours, déduit du titre et de la filière ; null si rien ne correspond (on garde l'icône par défaut). */
export function courseLogo(c: CourseCard): CourseLogo | null {
  if (c.icon) return null; // une icône choisie dans les données prime
  const t = (c.title + ' ' + (c.trackName ?? '')).toLowerCase();
  return LOGO_RULES.find(([re]) => re.test(t))?.[1] ?? null;
}
