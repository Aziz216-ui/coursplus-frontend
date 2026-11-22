import { Component, computed, input } from '@angular/core';
import { initials } from '../core/display';

/** Avatar : photo ronde si on en a une, sinon initiales blanches sur fond navy. */
@Component({
  selector: 'app-avatar',
  template: `
    @if (photoUrl()) {
      <img class="av" [src]="photoUrl()" [alt]="name()" [style.width.px]="size()" [style.height.px]="size()" loading="lazy" />
    } @else {
      <span class="av" [style.width.px]="size()" [style.height.px]="size()"
            [style.font-size.px]="size() * 0.38" aria-hidden="true">{{ text() }}</span>
    }
  `,
  styles: `
    :host { display: inline-flex; flex-shrink: 0; }
    .av { display: grid; place-items: center; border-radius: 50%; background: var(--cp-navy); color: var(--cp-white); font-weight: 800; object-fit: cover;
          font-family: var(--font-display); border: 2px solid var(--cp-surface); letter-spacing: 0; }
  `,
})
export class AvatarComponent {
  name = input.required<string>();
  specialty = input<string | null>(null);
  photoUrl = input<string | null>(null);
  size = input(36);
  text = computed(() => initials(this.name()));
}
