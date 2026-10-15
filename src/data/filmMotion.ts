export const FILM = { frames: 128, width: 960, height: 540, begin: .34, end: .90, fps: 16 } as const;
export function getFilmFrame(progress: number, still = false): number {
  if (still) return FILM.frames - 1;
  const finite = Number.isFinite(progress) ? progress : 0;
  const t = Math.max(0, Math.min(1, (finite - FILM.begin) / (FILM.end - FILM.begin)));
  return Math.round(t * (FILM.frames - 1));
}
export function getFilmFrameUrl(index: number, baseUrl = '/'): string {
  const bounded = Math.max(0, Math.min(FILM.frames - 1, Math.round(Number.isFinite(index) ? index : 0)));
  return baseUrl + 'media/escrita/quadro-' + String(bounded + 1).padStart(3, '0') + '.webp';
}

// Bounds include breathing room around the lettering in the supplied frames.
export const PHRASE_BOUNDS = { x: 248, y: 156, width: 524, height: 240 } as const;
// A paper-only region below the writing and left of the moving hand.
export const PAPER_PATCH = { x: 230, y: 405, width: 90, height: 120 } as const;

export function getFilmLayout(viewWidth: number, viewHeight: number, standalone = false) {
  const width = Number.isFinite(viewWidth) && viewWidth > 0 ? viewWidth : 1;
  const height = Number.isFinite(viewHeight) && viewHeight > 0 ? viewHeight : 1;
  const side = Math.min(40, width * 0.05);
  const top = standalone ? Math.min(16, height * 0.1) : Math.min(height * 0.25, (width <= 650 ? 76 : 86) + 20);
  const bottom = standalone ? Math.min(16, height * 0.1) : Math.min(96, height * 0.22);
  const safeArea = { x: side, y: top, width: width - 2 * side, height: Math.max(1, height - top - bottom) };
  const centerX = PHRASE_BOUNDS.x + PHRASE_BOUNDS.width / 2;
  const centerY = PHRASE_BOUNDS.y + PHRASE_BOUNDS.height / 2;
  const targetX = width / 2;
  const targetY = safeArea.y + safeArea.height / 2;
  const coverScale = Math.max(width / FILM.width, height / FILM.height);
  const place = (scale: number, cover: boolean) => {
    const drawWidth = FILM.width * scale, drawHeight = FILM.height * scale;
    const x = targetX - centerX * scale, y = targetY - centerY * scale;
    return {
      x: cover ? Math.min(0, Math.max(width - drawWidth, x)) : x,
      y: cover ? Math.min(0, Math.max(height - drawHeight, y)) : y,
      width: drawWidth, height: drawHeight,
    };
  };
  const cover = place(coverScale, true);
  const fits = cover.x + PHRASE_BOUNDS.x * coverScale >= safeArea.x &&
    cover.x + (PHRASE_BOUNDS.x + PHRASE_BOUNDS.width) * coverScale <= safeArea.x + safeArea.width &&
    cover.y + PHRASE_BOUNDS.y * coverScale >= safeArea.y &&
    cover.y + (PHRASE_BOUNDS.y + PHRASE_BOUNDS.height) * coverScale <= safeArea.y + safeArea.height;
  const scale = fits ? coverScale : Math.min(safeArea.width / PHRASE_BOUNDS.width, safeArea.height / PHRASE_BOUNDS.height);
  const foreground = fits ? cover : place(scale, false);
  const paperScale = Math.max((width + 32) / PAPER_PATCH.width, (height + 32) / PAPER_PATCH.height);
  const paperDestination = {
    x: (width - PAPER_PATCH.width * paperScale) / 2,
    y: (height - PAPER_PATCH.height * paperScale) / 2,
    width: PAPER_PATCH.width * paperScale,
    height: PAPER_PATCH.height * paperScale,
  };
  const background = {
    x: paperDestination.x - PAPER_PATCH.x * paperScale,
    y: paperDestination.y - PAPER_PATCH.y * paperScale,
    width: FILM.width * paperScale, height: FILM.height * paperScale,
  };
  return { mode: fits ? 'cover' as const : 'paper' as const, foreground, background, paperDestination, safeArea, scale };
}
