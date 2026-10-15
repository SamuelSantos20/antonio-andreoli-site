/** Move keyboard focus along with an intentional jump within the page. */
export function focusSection(id: string, updateHistory = false) {
  const section = document.getElementById(id);
  if (!section) return;
  document.dispatchEvent(new CustomEvent('section-navigation', { detail: id }));
  const target = section.querySelector<HTMLElement>('h1, h2') || section;
  if (!target.hasAttribute('tabindex')) target.tabIndex = -1;
  target.focus({ preventScroll: true });
  if (updateHistory && window.location.hash !== `#${id}`) history.pushState({}, '', `#${id}`);
  section.scrollIntoView({
    behavior: document.documentElement.dataset.motion === 'reduced' ? 'instant' : 'smooth',
    block: 'start',
  });
}
