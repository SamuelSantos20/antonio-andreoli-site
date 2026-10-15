import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { FILM, PAPER_PATCH, getFilmFrame, getFilmFrameUrl, getFilmLayout } from '../data/filmMotion';

export interface WritingFilmHandle {
  seek(progress: number): void;
}
interface Props {
  reducedMotion: boolean;
}

const smooth = (n: number) => {
  const t = Math.max(0, Math.min(1, n));
  return t * t * (3 - 2 * t);
};

export const WritingFilm = forwardRef<WritingFilmHandle, Props>(function WritingFilm(
  { reducedMotion },
  ref
) {
  const host = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const progress = useRef(0);
  const request = useRef<(() => void) | null>(null);
  const [failed, setFailed] = useState(false);

  // The static poster uses the exact same geometry as the animated canvas.
  useEffect(() => {
    const container = host.current;
    if (!container) return;
    const update = () => {
      const rect = container.getBoundingClientRect();
      const layout = getFilmLayout(rect.width, rect.height, reducedMotion);
      container.dataset.framing = layout.mode;
      for (const [prefix, box] of [['film', layout.foreground], ['paper', layout.background]] as const) {
        for (const key of ['x', 'y', 'width', 'height'] as const) {
          container.style.setProperty(`--${prefix}-${key}`, `${box[key]}px`);
        }
      }
    };
    const observer = new ResizeObserver(update);
    observer.observe(container);
    update();
    return () => observer.disconnect();
  }, [reducedMotion]);

  useImperativeHandle(
    ref,
    () => ({
      seek(p) {
        progress.current = p;
        if (host.current) {
          host.current.style.opacity = String(reducedMotion ? 1 : smooth((p - 0.25) / 0.09));
        }
        request.current?.();
      },
    }),
    [reducedMotion]
  );

  useEffect(() => {
    const element = canvas.current,
      container = host.current;
    if (!element || !container || reducedMotion || failed) return;
    const context = element.getContext('2d', { alpha: false });
    if (!context) {
      setFailed(true);
      return;
    }

    let disposed = false,
      inView = true,
      raf = 0,
      active = 0,
      serial = 0;
    let requested = getFilmFrame(progress.current);
    const cache = new Map<number, { bitmap: ImageBitmap; touched: number }>();
    const pending = new Set<number>();
    const abort = new AbortController();
    const queue: number[] = [];
    const feathered = document.createElement('canvas');
    feathered.width = FILM.width;
    feathered.height = FILM.height;
    const featherContext = feathered.getContext('2d');
    const paper = document.createElement('canvas');
    const paperContext = paper.getContext('2d');
    let paperReady = false;
    const vertical = featherContext?.createLinearGradient(0, 0, 0, FILM.height);
    const horizontal = featherContext?.createLinearGradient(0, 0, FILM.width, 0);
    for (const gradient of [vertical, horizontal]) {
      gradient?.addColorStop(0, 'transparent');
      gradient?.addColorStop(0.12, '#000');
      gradient?.addColorStop(0.88, '#000');
      gradient?.addColorStop(1, 'transparent');
    }

    const trim = () => {
      while (cache.size > 20) {
        const oldest = [...cache]
          .filter(([index]) => index !== requested && index !== 0 && index !== FILM.frames - 1)
          .sort((a, b) => a[1].touched - b[1].touched)[0];
        if (!oldest) break;
        oldest[1].bitmap.close();
        cache.delete(oldest[0]);
      }
    };

    const draw = () => {
      if (disposed || !inView || document.hidden) return;
      const source = cache.get(requested);
      if (!source) return;
      source.touched = ++serial;
      const rect = container.getBoundingClientRect();
      const width = Math.max(1, rect.width),
        height = Math.max(1, rect.height);
      const ratio = Math.min(devicePixelRatio || 1, 1.5);
      const pixelWidth = Math.round(width * ratio),
        pixelHeight = Math.round(height * ratio);
      if (element.width !== pixelWidth || element.height !== pixelHeight) {
        element.width = pixelWidth;
        element.height = pixelHeight;
      }
      const layout = getFilmLayout(width, height);
      const box = layout.foreground;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.fillStyle = '#cbc5b4';
      context.fillRect(0, 0, width + 1, height + 1);
      if (layout.mode === 'paper' && featherContext && paperContext && vertical && horizontal) {
        // Cache one clean paper surface per viewport, avoiding giant blurred duplicate letters.
        if (!paperReady || paper.width !== pixelWidth || paper.height !== pixelHeight) {
          paper.width = pixelWidth;
          paper.height = pixelHeight;
          paperContext.setTransform(ratio, 0, 0, ratio, 0, 0);
          paperContext.fillStyle = '#cbc5b4';
          paperContext.fillRect(0, 0, width + 1, height + 1);
          paperContext.filter = `blur(${12 * ratio}px)`;
          const bg = layout.paperDestination;
          paperContext.drawImage(source.bitmap, PAPER_PATCH.x, PAPER_PATCH.y, PAPER_PATCH.width, PAPER_PATCH.height, bg.x, bg.y, bg.width, bg.height);
          paperReady = true;
        }
        context.drawImage(paper, 0, 0, width, height);
        featherContext.clearRect(0, 0, FILM.width, FILM.height);
        featherContext.drawImage(source.bitmap, 0, 0);
        featherContext.save();
        featherContext.globalCompositeOperation = 'destination-in';
        featherContext.fillStyle = vertical;
        featherContext.fillRect(0, 0, FILM.width, FILM.height);
        featherContext.fillStyle = horizontal;
        featherContext.fillRect(0, 0, FILM.width, FILM.height);
        featherContext.restore();
        context.drawImage(feathered, box.x, box.y, box.width, box.height);
      } else {
        context.drawImage(source.bitmap, box.x, box.y, box.width, box.height);
      }
      element.style.opacity = '1';
      container.dataset.frame = String(requested);
      container.dataset.requestedFrame = String(requested);
      container.dataset.cacheSize = String(cache.size);
      container.dataset.ready = 'true';
      container.dataset.framing = layout.mode;
    };

    const scheduleDraw = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(draw);
    };

    const pump = () => {
      if (disposed || document.hidden || !inView) return;
      while (active < 3 && queue.length) {
        const index = queue.shift()!;
        if (cache.has(index) || pending.has(index)) continue;
        active++;
        pending.add(index);
        void fetch(getFilmFrameUrl(index, import.meta.env.BASE_URL), {
          signal: abort.signal,
          cache: 'force-cache',
        })
          .then((response) => {
            if (!response.ok) throw new Error('Frame unavailable');
            return response.blob();
          })
          .then((blob) => createImageBitmap(blob))
          .then((bitmap) => {
            if (disposed || !inView || document.hidden) {
              bitmap.close();
              return;
            }
            cache.set(index, { bitmap, touched: ++serial });
            trim();
            if (index === requested) scheduleDraw();
          })
          .catch((error) => {
            if (!disposed && error.name !== 'AbortError' && index === requested) {
              setFailed(true);
            }
          })
          .finally(() => {
            active--;
            pending.delete(index);
            pump();
          });
      }
    };

    const update = () => {
      requested = getFilmFrame(progress.current);
      container.dataset.requestedFrame = String(requested);
      queue.length = 0;
      for (const distance of [0, 1, -1, 2, -2, 3, -3, 4, -4]) {
        const index = requested + distance;
        if (index >= 0 && index < FILM.frames && !cache.has(index) && !pending.has(index)) {
          queue.push(index);
        }
      }
      scheduleDraw();
      pump();
    };

    const resize = new ResizeObserver(scheduleDraw);
    resize.observe(container);
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      if (inView) {
        update();
      } else {
        queue.length = 0;
        cache.forEach((item) => item.bitmap.close());
        cache.clear();
      }
    });
    observer.observe(container);
    const visibility = () => {
      if (!document.hidden) update();
    };
    document.addEventListener('visibilitychange', visibility);
    request.current = update;
    update();

    return () => {
      disposed = true;
      request.current = null;
      abort.abort();
      cancelAnimationFrame(raf);
      resize.disconnect();
      observer.disconnect();
      document.removeEventListener('visibilitychange', visibility);
      cache.forEach((item) => item.bitmap.close());
      cache.clear();
    };
  }, [reducedMotion, failed]);

  return (
    <div
      ref={host}
      className={`writing-film${reducedMotion ? ' writing-film--still' : ''}`}
      role="img"
      aria-label="Cena ilustrativa: uma mão escreve a frase Direito com clareza com uma caneta verde moderna."
    >
      <div className={`writing-film__paper${reducedMotion || failed ? ' writing-film__paper--visible' : ''}`}
        style={{ backgroundImage: `url(${import.meta.env.BASE_URL}media/escrita/final.webp)` }} aria-hidden="true" />
      <img
        src={`${import.meta.env.BASE_URL}media/escrita/final.webp`}
        alt=""
        className={`writing-film__poster${
          reducedMotion || failed ? ' writing-film__poster--visible' : ''
        }`}
        decoding="async"
      />
      {!reducedMotion && !failed && (
        <canvas ref={canvas} className="writing-film__canvas" aria-hidden="true" />
      )}
    </div>
  );
});
