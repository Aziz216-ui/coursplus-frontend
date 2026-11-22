import { Directive, ElementRef, OnDestroy, afterNextRender, inject } from '@angular/core';

/** Apparition douce d'une section au scroll. Sans effet (contenu visible) si prefers-reduced-motion ou sans IntersectionObserver. */
@Directive({ selector: '[appReveal]' })
export class RevealDirective implements OnDestroy {
  private el = inject<ElementRef<HTMLElement>>(ElementRef);
  private obs?: IntersectionObserver;

  constructor() {
    afterNextRender(() => {
      const node = this.el.nativeElement;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
      node.classList.add('rv-hidden');
      this.obs = new IntersectionObserver((entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        node.classList.remove('rv-hidden');
        node.classList.add('rv-in');
        this.obs?.disconnect();
      }, { threshold: 0.08 });
      this.obs.observe(node);
    });
  }

  ngOnDestroy() { this.obs?.disconnect(); }
}
