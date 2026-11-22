import { Component, input } from '@angular/core';

export type IconName =
  | 'search' | 'lock' | 'file' | 'play' | 'check' | 'card' | 'phone' | 'arrow-left'
  | 'logo-book' | 'brain' | 'leaf' | 'sliders' | 'whatsapp' | 'plus' | 'stethoscope' | 'chart' | 'code' | 'users' | 'star' | 'shield' | 'message' | 'video' | 'graduation' | 'chevron-down' | 'chevron-right' | 'x' | 'book' | 'menu' | 'clock' | 'alert' | 'party' | 'bell' | 'arrow-up-right';

/**
 * Jeu d'icônes unique (trait 1.75, arrondi), hérite la couleur du texte.
 * Décoratif par défaut (aria-hidden) : le texte voisin porte le sens.
 */
@Component({
  selector: 'app-icon',
  template: `
    <svg class="icon" [attr.width]="size()" [attr.height]="size()" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
      @switch (name()) {
        @case ('logo-book') { <path d="M3 19a9 9 0 0 1 9 0a9 9 0 0 1 9 0" /><path d="M3 6a9 9 0 0 1 9 0a9 9 0 0 1 9 0" /><path d="M3 6l0 13" /><path d="M12 6l0 13" /><path d="M21 6l0 13" /> }
        @case ('brain') { <circle cx="12" cy="12" r="2.5" /><circle cx="5" cy="6" r="2" /><circle cx="19" cy="6" r="2" /><circle cx="5" cy="18" r="2" /><circle cx="19" cy="18" r="2" /><path d="M6.700 7.200l3.500 3.300M17.300 7.200l-3.500 3.300M6.700 16.800l3.500-3.300M17.300 16.800l-3.500-3.300" /> }
        @case ('leaf') { <path d="M5 19c0-8 5-13 15-14 0 9-4 14-12 14" /><path d="M5 19c3-5 6-8 10-10" /> }
        @case ('sliders') { <path d="M4 7h9M17 7h3M4 17h3M11 17h9" /><circle cx="15" cy="7" r="2" /><circle cx="9" cy="17" r="2" /> }
        @case ('plus') { <path d="M12 5v14M5 12h14" /> }
        @case ('whatsapp') { <path d="M4 20l1.3-4.2A8 8 0 1 1 8.3 18.8z" /><path d="M9 9c0 3 3 6 6 6l1.2-1.5-2-1-.8.8c-1-.4-2-1.4-2.4-2.4l.8-.8-1-2z" /> }
        @case ('stethoscope') { <path d="M6 3v6a4 4 0 0 0 8 0V3" /><path d="M10 13v2a5 5 0 0 0 10 0v-2" /><circle cx="20" cy="11" r="2" /> }
        @case ('chart') { <path d="M4 20V4M4 20h16" /><path d="m8 15 4-5 3 3 5-7" /> }
        @case ('code') { <path d="m8 8-5 4 5 4M16 8l5 4-5 4M14 5l-4 14" /> }
        @case ('users') { <circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0" /><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.3a6.5 6.5 0 0 1 3.5 5.7" /> }
        @case ('star') { <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" /> }
        @case ('shield') { <path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.500 7-10V6z" /><path d="m9 12 2 2 4-4" /> }
        @case ('message') { <path d="M4 5h16v11H9l-5 4z" /> }
        @case ('video') { <rect x="3" y="6" width="13" height="12" rx="2" /><path d="m16 10 5-3v10l-5-3" /> }
        @case ('graduation') { <path d="m2 9 10-5 10 5-10 5z" /><path d="M6 11.500V16c3 2.500 9 2.500 12 0v-4.500" /> }
        @case ('chevron-down') { <path d="m6 9 6 6 6-6" /> }
        @case ('search') { <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /> }
        @case ('lock') { <rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /> }
        @case ('file') { <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5M9 13h6M9 17h6" /> }
        @case ('play') { <path d="M7 5v14l12-7z" /> }
        @case ('check') { <path d="m5 12.5 4.5 4.5L19 7.5" /> }
        @case ('card') { <rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 10h18M7 15h3" /> }
        @case ('phone') { <rect x="7" y="2.5" width="10" height="19" rx="2" /><path d="M11 18h2" /> }
        @case ('arrow-left') { <path d="M19 12H5M11 6l-6 6 6 6" /> }
        @case ('arrow-up-right') { <path d="M7 17L17 7M8 7h9v9" /> }
        @case ('chevron-right') { <path d="m9 6 6 6-6 6" /> }
        @case ('x') { <path d="M6 6l12 12M18 6 6 18" /> }
        @case ('book') { <path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z" /><path d="M4 21a2 2 0 0 0 2 0M8 7h7" /> }
        @case ('menu') { <path d="M4 7h16M4 12h16M4 17h16" /> }
        @case ('clock') { <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /> }
        @case ('alert') { <circle cx="12" cy="12" r="9" /><path d="M12 7.5v5M12 16.2v.1" /> }
        @case ('bell') { <path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z" /><path d="M10 21a2 2 0 0 0 4 0" /> }
        @case ('party') { <circle cx="12" cy="12" r="9" /><path d="m8 12.5 3 3 5-6" /> }
      }
    </svg>
  `,
  styles: `:host { display: inline-flex; flex-shrink: 0; line-height: 0; } .icon { display: block; }`,
})
export class IconComponent {
  name = input.required<IconName>();
  size = input(18);
}
