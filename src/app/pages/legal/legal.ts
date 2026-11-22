import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PHOTO_CREDITS } from '../../core/site-config';

/** Pages légales (CGV, mentions légales, confidentialité) : le titre vient de la route, le texte reste à rédiger. */
@Component({
  selector: 'app-legal',
  imports: [RouterLink],
  template: `
    <div class="container page legal">
      <h1>{{ title }}</h1>
      <p class="lead">Page en cours de rédaction.</p>
      <p class="muted">Ce document sera publié avant l’ouverture officielle de la plateforme.</p>
      <!-- TODO: remplacer par le texte juridique validé. -->

      @if (isMentions) {
        <h2>Crédits</h2>
        <p>Photos : Pexels ({{ photoCredits }}).</p>
        <p>Les logos et noms cités appartiennent à leurs propriétaires respectifs. CoursPlus n’est affilié à aucun de ces projets ni approuvé par eux.</p>
        <ul class="credits">
          <li>Git Logo by Jason Long, licence <a href="https://creativecommons.org/licenses/by/3.0/" target="_blank" rel="noopener">Creative Commons Attribution 3.0</a>.</li>
          <li>Logo Angular par Google, licence <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener">CC BY 4.0</a>.</li>
          <li>Logo PHP par Colin Viebrock, licence <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener">CC BY-SA 4.0</a>.</li>
          <li>« Python » et les logos Python sont des marques déposées de la Python Software Foundation.</li>
          <li>TensorFlow, le logo TensorFlow et les marques associées sont des marques de Google Inc.</li>
          <li>Flutter et son logo sont des marques de Google LLC. CoursPlus n’est ni approuvé par Google LLC ni affilié à elle.</li>
          <li>JavaScript : logo.js, licence MIT. C++ : logo de Standard C++ Foundation. Kotlin : logo de la Kotlin Foundation. scikit-learn : licence BSD-3-Clause.</li>
          <li>Icônes génériques : <a href="https://github.com/lucide-icons/lucide/blob/main/LICENSE" target="_blank" rel="noopener">Lucide</a> (licence ISC).</li>
        </ul>
      }
      <a routerLink="/" class="btn btn-outline">Retour à l’accueil</a>
    </div>
  `,
  styles: `.legal { max-width: 720px; min-height: 50vh; } .credits { padding-left: 1.2em; color: var(--cp-text-2); } .credits li { margin-bottom: 8px; } .legal h2 { margin-top: var(--s-6); } .legal .btn { margin-top: var(--s-5); }`,
})
export class LegalPage {
  protected title: string = inject(ActivatedRoute).snapshot.data['title'] ?? '';
  protected isMentions = this.title === 'Mentions légales';
  protected photoCredits = PHOTO_CREDITS;
}
