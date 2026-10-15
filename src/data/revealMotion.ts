interface RevealSpec {
  dx: number;
  dy: number;
  duration: number;
  delay: number;
  scale?: number;
}

export interface TargetConfig {
  selector: string;
  desktop: Omit<RevealSpec, 'delay'> & { stagger: number; baseDelay?: number; maxDelay?: number };
  mobile: Omit<RevealSpec, 'delay'> & { stagger: number; baseDelay?: number; maxDelay?: number };
}

export const EASE_OUT_EDITORIAL = 'cubic-bezier(0.16, 1, 0.3, 1)';

/**
 * Choreographed per-section animation profiles.
 * Selectors strictly target non-overlapping leaf groups so parent/child transforms never stack.
 */
export const SECTION_CHOREOGRAPHY: Record<string, TargetConfig[]> = {
  inicio: [
    {
      selector: '.story-copy > .story-eyebrow',
      desktop: { dx: 0, dy: 36, duration: 820, stagger: 0 },
      mobile: { dx: 0, dy: 24, duration: 720, stagger: 0 },
    },
    {
      selector: '.story-copy > h1',
      desktop: { dx: 0, dy: 56, duration: 960, stagger: 0, baseDelay: 95 },
      mobile: { dx: 0, dy: 34, duration: 800, stagger: 0, baseDelay: 70 },
    },
    {
      selector: '.story-copy > .story-description',
      desktop: { dx: 0, dy: 44, duration: 880, stagger: 0, baseDelay: 190 },
      mobile: { dx: 0, dy: 28, duration: 760, stagger: 0, baseDelay: 140 },
    },
    {
      selector: '.story-copy > .story-actions',
      desktop: { dx: 0, dy: 40, duration: 860, stagger: 0, baseDelay: 280 },
      mobile: { dx: 0, dy: 26, duration: 740, stagger: 0, baseDelay: 200 },
    },
    {
      selector: '.story-copy > .story-signature',
      desktop: { dx: 0, dy: 34, duration: 820, stagger: 0, baseDelay: 360 },
      mobile: { dx: 0, dy: 24, duration: 720, stagger: 0, baseDelay: 260 },
    },
    {
      selector: '.story-footer',
      desktop: { dx: 0, dy: 28, duration: 800, stagger: 0, baseDelay: 390 },
      mobile: { dx: 0, dy: 24, duration: 700, stagger: 0, baseDelay: 280 },
    },
  ],
  atuacao: [
    {
      selector: '.editorial-heading > .section-kicker, .editorial-heading > div > h2, .editorial-heading > div > .section-intro',
      desktop: { dx: 0, dy: 56, duration: 920, stagger: 110, maxDelay: 260 },
      mobile: { dx: 0, dy: 32, duration: 760, stagger: 80, maxDelay: 180 },
    },
    {
      selector: '.practice-row > .practice-label, .practice-row > h3, .practice-row > .practice-copy',
      desktop: { dx: 0, dy: 46, duration: 840, stagger: 85, maxDelay: 220 },
      mobile: { dx: 0, dy: 28, duration: 720, stagger: 65, maxDelay: 160 },
    },
    {
      selector: '.practice-link',
      desktop: { dx: 0, dy: 34, duration: 780, stagger: 0, baseDelay: 120 },
      mobile: { dx: 0, dy: 24, duration: 680, stagger: 0, baseDelay: 80 },
    },
  ],
  atendimento: [
    {
      selector: '.process-heading > .section-kicker, .process-heading > h2, .process-heading > .process-intro',
      desktop: { dx: 0, dy: 58, duration: 940, stagger: 115, maxDelay: 260 },
      mobile: { dx: 0, dy: 34, duration: 780, stagger: 85, maxDelay: 180 },
    },
    {
      selector: '.process-steps > li',
      desktop: { dx: 0, dy: 54, duration: 900, stagger: 130, baseDelay: 80, maxDelay: 360 },
      mobile: { dx: 0, dy: 32, duration: 760, stagger: 90, baseDelay: 40, maxDelay: 220 },
    },
    {
      selector: '.process-bottom > p, .process-bottom > a',
      desktop: { dx: 0, dy: 38, duration: 820, stagger: 100, baseDelay: 120, maxDelay: 240 },
      mobile: { dx: 0, dy: 26, duration: 700, stagger: 75, baseDelay: 60, maxDelay: 160 },
    },
  ],
  pilares: [
    {
      selector: '.about-heading > :first-child',
      desktop: { dx: -42, dy: 20, duration: 940, stagger: 0 },
      mobile: { dx: 0, dy: 32, duration: 780, stagger: 0 },
    },
    {
      selector: '.about-heading > .about-copy',
      desktop: { dx: 42, dy: 20, duration: 940, stagger: 0, baseDelay: 120 },
      mobile: { dx: 0, dy: 32, duration: 780, stagger: 0, baseDelay: 90 },
    },
    {
      selector: '.about-values > div',
      desktop: { dx: 0, dy: 46, duration: 860, stagger: 120, baseDelay: 100, maxDelay: 360 },
      mobile: { dx: 0, dy: 28, duration: 740, stagger: 85, baseDelay: 60, maxDelay: 220 },
    },
  ],
  duvidas: [
    {
      selector: '.editorial-heading > .section-kicker, .editorial-heading > div > h2, .editorial-heading > div > .section-intro',
      desktop: { dx: 0, dy: 54, duration: 900, stagger: 105, maxDelay: 240 },
      mobile: { dx: 0, dy: 32, duration: 760, stagger: 75, maxDelay: 160 },
    },
    {
      selector: '.faq-row',
      desktop: { dx: 0, dy: 34, duration: 780, stagger: 95, maxDelay: 290 },
      mobile: { dx: 0, dy: 24, duration: 680, stagger: 70, maxDelay: 180 },
    },
    {
      selector: '.faq-footer > .faq-disclaimer, .faq-footer > a',
      desktop: { dx: 0, dy: 28, duration: 760, stagger: 90, baseDelay: 80, maxDelay: 200 },
      mobile: { dx: 0, dy: 22, duration: 660, stagger: 65, baseDelay: 50, maxDelay: 140 },
    },
  ],
  avaliacoes: [
    {
      selector: '.reviews-heading > .section-kicker, .reviews-heading > h2',
      desktop: { dx: 0, dy: 52, duration: 900, stagger: 110, maxDelay: 220 },
      mobile: { dx: 0, dy: 30, duration: 760, stagger: 80, maxDelay: 160 },
    },
    {
      selector: '.reviews-summary, .reviews-order, .review-row, .reviews-copy, .reviews-policy',
      desktop: { dx: 0, dy: 42, duration: 840, stagger: 105, baseDelay: 80, maxDelay: 380 },
      mobile: { dx: 0, dy: 26, duration: 720, stagger: 75, baseDelay: 50, maxDelay: 220 },
    },
  ],
  contato: [
    {
      selector: '.contact-top > .section-kicker, .contact-top > span',
      desktop: { dx: 0, dy: 40, duration: 840, stagger: 90, maxDelay: 180 },
      mobile: { dx: 0, dy: 26, duration: 720, stagger: 65, maxDelay: 120 },
    },
    {
      selector: '.contact-layout > :first-child > h2, .contact-layout > :first-child > .contact-intro',
      desktop: { dx: 0, dy: 60, duration: 980, stagger: 120, baseDelay: 60, maxDelay: 240 },
      mobile: { dx: 0, dy: 34, duration: 800, stagger: 85, baseDelay: 40, maxDelay: 160 },
    },
    {
      selector: '.contact-direct, .office-address, .contact-bottom > p',
      desktop: { dx: 0, dy: 44, duration: 860, stagger: 110, baseDelay: 140, maxDelay: 380 },
      mobile: { dx: 0, dy: 28, duration: 740, stagger: 80, baseDelay: 80, maxDelay: 240 },
    },
  ],
};

export const FOOTER_CHOREOGRAPHY: TargetConfig[] = [
  {
    selector: '.footer-main > a, .footer-main > nav, .footer-meta > p',
    desktop: { dx: 0, dy: 40, duration: 840, stagger: 100, maxDelay: 320 },
    mobile: { dx: 0, dy: 26, duration: 720, stagger: 75, maxDelay: 220 },
  },
];
