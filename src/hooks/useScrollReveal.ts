import { useEffect } from 'react';
import { EASE_OUT_EDITORIAL, FOOTER_CHOREOGRAPHY, SECTION_CHOREOGRAPHY, type TargetConfig } from '../data/revealMotion';

/** Content stays visible by default; only an active entrance animation hides it. */
export function useScrollReveal(reducedMotion: boolean, currentRoute: string) {
  useEffect(() => {
    if (currentRoute !== '/') return;
    const main = document.querySelector('main');
    if (!main) return;

    const targets = new Set<HTMLElement>();
    const configs = new Map<HTMLElement, TargetConfig>();
    const animations = new Map<HTMLElement, Animation>();
    const canAnimate = !reducedMotion && typeof IntersectionObserver !== 'undefined';
    let observer: IntersectionObserver | undefined;

    const show = (element: HTMLElement) => {
      observer?.unobserve(element);
      element.dataset.revealed = 'true';
      const animation = animations.get(element);
      animations.delete(element);
      animation?.cancel();
    };

    const reveal = (element: HTMLElement, delay: number) => {
      if (element.dataset.revealed === 'true') return;
      element.dataset.revealed = 'true';
      observer?.unobserve(element);
      if (!canAnimate || typeof element.animate !== 'function') return;
      const config = configs.get(element);
      if (!config) return;
      // Re-evaluate at entrance so rotating/resizing while scrolling uses the current layout.
      const mobile = window.innerWidth < 760 || window.innerHeight < 500;
      const profile = mobile ? config.mobile : config.desktop;
      try {
        const animation = element.animate([
          { opacity: 0, transform: `translate3d(${profile.dx}px, ${profile.dy}px, 0)` },
          { opacity: 1, transform: 'translate3d(0, 0, 0)' },
        ], {
          duration: profile.duration, delay, easing: EASE_OUT_EDITORIAL, fill: 'backwards',
        });
        animations.set(element, animation);
        // Remove finished effects so later interactions retain their own styling.
        animation.onfinish = () => {
          if (animations.get(element) === animation) animations.delete(element);
          animation.cancel();
        };
      } catch { /* The underlying content remains visible if animation fails. */ }
    };

    if (canAnimate) {
      observer = new IntersectionObserver(entries => {
        const batches = new Map<Element | null, Map<TargetConfig, HTMLElement[]>>();
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const element = entry.target as HTMLElement;
          const config = configs.get(element);
          if (!config) return;
          const section = element.closest('.practice-row, section, footer');
          const sectionBatches = batches.get(section) || new Map<TargetConfig, HTMLElement[]>();
          const batch = sectionBatches.get(config) || [];
          batch.push(element);
          sectionBatches.set(config, batch);
          batches.set(section, sectionBatches);
        });
        const mobile = window.innerWidth < 760 || window.innerHeight < 500;
        batches.forEach(sectionBatches => sectionBatches.forEach((batch, config) => {
          const profile = mobile ? config.mobile : config.desktop;
          batch.forEach((element, index) => reveal(element,
            Math.min((profile.baseDelay || 0) + index * profile.stagger, profile.maxDelay ?? 400)));
        }));
      }, { threshold: 0, rootMargin: '0px' });
    }

    const showSection = (section: Element) => {
      targets.forEach(element => { if (section.contains(element)) show(element); });
    };
    const hashDestination = () => {
      try {
        const id = decodeURIComponent(window.location.hash.slice(1));
        const section = id && document.getElementById(id);
        if (section) showSection(section);
      } catch { /* A malformed external fragment must not block page content. */ }
    };
    const register = () => {
      const candidates = new Map<HTMLElement, TargetConfig>();
      const collect = (root: Element | null, profiles: TargetConfig[]) => {
        profiles.forEach(profile => root?.querySelectorAll<HTMLElement>(profile.selector)
          .forEach(element => candidates.set(element, profile)));
      };
      Object.entries(SECTION_CHOREOGRAPHY).forEach(([id, profiles]) => {
        collect(main.querySelector(`#${id}`), profiles);
      });
      collect(main.querySelector('footer.editorial-footer'), FOOTER_CHOREOGRAPHY);
      candidates.forEach((config, element) => {
        if (targets.has(element)) return;
        targets.add(element);
        configs.set(element, config);
        element.dataset.reveal = 'true';
        if (element.dataset.revealed === 'true') return;
        const rect = element.getBoundingClientRect();
        if (!canAnimate || rect.bottom < 0 || element.contains(document.activeElement)) show(element);
        else observer?.observe(element);
      });
      // Release nodes replaced by asynchronously loaded reviews.
      targets.forEach(element => {
        if (!main.contains(element)) { show(element); targets.delete(element); configs.delete(element); }
      });
      hashDestination();
    };

    const focus = (event: FocusEvent) => {
      if (!(event.target instanceof Element)) return;
      const section = event.target.closest('section, footer');
      if (section) showSection(section);
      else if (event.target === main) targets.forEach(show);
    };
    const jump = (event: Event) => {
      const id = (event as CustomEvent<string>).detail;
      const section = document.getElementById(id);
      if (section) showSection(section);
    };
    document.addEventListener('focusin', focus);
    document.addEventListener('section-navigation', jump);
    window.addEventListener('hashchange', hashDestination);
    register();
    const mutations = typeof MutationObserver !== 'undefined' ? new MutationObserver(register) : undefined;
    mutations?.observe(main, { childList: true, subtree: true });

    return () => {
      observer?.disconnect();
      mutations?.disconnect();
      document.removeEventListener('focusin', focus);
      document.removeEventListener('section-navigation', jump);
      window.removeEventListener('hashchange', hashDestination);
      animations.forEach(animation => animation.cancel());
      animations.clear();
    };
  }, [reducedMotion, currentRoute]);
}
