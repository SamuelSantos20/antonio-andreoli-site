import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { FILM, getFilmFrame, getFilmFrameUrl, getFilmCrop } from '../data/filmMotion';

export interface WritingFilmHandle { seek(progress: number): void }
interface Props { reducedMotion: boolean }
const smooth = (n: number) => { const t = Math.max(0, Math.min(1, n)); return t * t * (3 - 2 * t); };

export const WritingFilm = forwardRef<WritingFilmHandle, Props>(function WritingFilm({ reducedMotion }, ref) {
  const host = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const progress = useRef(0);
  const request = useRef<(() => void) | null>(null);
  const [failed, setFailed] = useState(false);
  useImperativeHandle(ref, () => ({
    seek(p) {
      progress.current = p;
      if (host.current) host.current.style.opacity = String(reducedMotion ? 1 : smooth((p - .27) / .08));
      request.current?.();
    },
  }), [reducedMotion]);

  useEffect(() => {
    const element = canvas.current, container = host.current;
    if (!element || !container || reducedMotion || failed) return;
    const context = element.getContext('2d', { alpha: false });
    if (!context) { setFailed(true); return; }
    let disposed = false, inView = true, raf = 0, active = 0, serial = 0;
    let requested = getFilmFrame(progress.current);
    const cache = new Map<number, { bitmap: ImageBitmap; touched: number }>();
    const pending = new Set<number>();
    const abort = new AbortController();
    const queue: number[] = [];

    const trim = () => {
      while (cache.size > 18) {
        const oldest = [...cache].filter(([index]) => index !== requested).sort((a,b) => a[1].touched-b[1].touched)[0];
        if (!oldest) break;
        oldest[1].bitmap.close(); cache.delete(oldest[0]);
      }
    };
    const draw = () => {
      if (disposed || !inView || document.hidden) return;
      const source = cache.get(requested);
      if (!source) return; // Keep the previous real frame while the requested frame decodes.
      source.touched = ++serial;
      const rect = container.getBoundingClientRect();
      const width = Math.max(1, rect.width), height = Math.max(1, rect.height);
      const ratio = Math.min(devicePixelRatio || 1, 1.5);
      const pixelWidth = Math.round(width*ratio), pixelHeight = Math.round(height*ratio);
      if (element.width !== pixelWidth || element.height !== pixelHeight) { element.width = pixelWidth; element.height = pixelHeight; }
      const crop = getFilmCrop(width < 760);
      context.drawImage(source.bitmap,crop.x,crop.y,crop.width,crop.height,0,0,pixelWidth,pixelHeight);
      element.style.opacity = '1';
      container.dataset.frame = String(requested);
      container.dataset.requestedFrame = String(requested);
      container.dataset.cacheSize = String(cache.size);
      container.dataset.ready = 'true';
    };
    const scheduleDraw = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(draw); };
    const pump = () => {
      if (disposed || document.hidden || !inView) return;
      while (active < 3 && queue.length) {
        const index = queue.shift()!;
        if (cache.has(index) || pending.has(index)) continue;
        active++; pending.add(index);
        void fetch(getFilmFrameUrl(index, import.meta.env.BASE_URL), { signal: abort.signal, cache: 'force-cache' })
          .then(response => { if (!response.ok) throw new Error('Frame unavailable'); return response.blob(); })
          .then(blob => createImageBitmap(blob))
          .then(bitmap => {
            if (disposed || !inView || document.hidden) { bitmap.close(); return; }
            cache.set(index, { bitmap, touched: ++serial }); trim();
            if (index === requested) scheduleDraw();
          })
          .catch(error => { if (!disposed && error.name !== 'AbortError' && index === requested) setFailed(true); })
          .finally(() => { active--; pending.delete(index); pump(); });
      }
    };
    const update = () => {
      requested = getFilmFrame(progress.current);
      container.dataset.requestedFrame = String(requested);
      // Drop stale queued work when the direction changes. Only three requests may be in flight.
      queue.length = 0;
      for (const distance of [0,1,-1,2,-2,3,-3,4,-4]) {
        const index = requested + distance;
        if (index >= 0 && index < FILM.frames && !cache.has(index) && !pending.has(index)) queue.push(index);
      }
      scheduleDraw(); pump();
    };
    const resize = new ResizeObserver(scheduleDraw);
    resize.observe(container);
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      if (inView) update();
      else { queue.length = 0; cache.forEach(item=>item.bitmap.close()); cache.clear(); }
    });
    observer.observe(container);
    const visibility = () => { if (!document.hidden) update(); };
    document.addEventListener('visibilitychange', visibility);
    request.current = update;
    update();
    return () => {
      disposed = true; request.current = null; abort.abort(); cancelAnimationFrame(raf);
      resize.disconnect(); observer.disconnect(); document.removeEventListener('visibilitychange',visibility);
      cache.forEach(item=>item.bitmap.close()); cache.clear();
    };
  }, [reducedMotion, failed]);

  return <div ref={host} className={`writing-film${reducedMotion ? ' writing-film--still' : ''}`} role="img" aria-label="Cena ilustrativa: uma mão escreve Direito com clareza. com uma caneta verde moderna.">
    <img src={`${import.meta.env.BASE_URL}media/escrita/final.webp`} alt="" className={`writing-film__poster${reducedMotion || failed ? ' writing-film__poster--visible' : ''}`} decoding="async" />
    {!reducedMotion && !failed && <canvas ref={canvas} className="writing-film__canvas" aria-hidden="true" />}
  </div>;
});
