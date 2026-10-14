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
export function getFilmCrop(mobile: boolean) {
  return mobile ? { x: 125, y: 70, width: 710, height: 400 } : { x: 0, y: 0, width: FILM.width, height: FILM.height };
}
