import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowUpRight, Pause, Play } from 'lucide-react';
import { Pen3DScene, type PenSceneHandle } from './Pen3DScene';
import { WritingFilm, type WritingFilmHandle } from './WritingFilm';
import { ProfessionalConfig, getWhatsappLink, getOabFormatted } from '../config/professional';
import './pen-story.css';

interface Props {
  config: ProfessionalConfig;
  onSpeakWithAntonio: () => void;
  onExploreClick: () => void;
  reducedMotion: boolean;
  motionLocked?: boolean;
  onToggleReducedMotion: () => void;
}

const labels = ['Cada história deixa uma marca.', 'Um olhar mais próximo.', 'Clareza, palavra por palavra.', 'Direito com clareza.'];
export function HeroNarrativeSection({ config, onExploreClick, reducedMotion, motionLocked = false, onToggleReducedMotion }: Props) {
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const copy = useRef<HTMLDivElement>(null);
  const scene = useRef<PenSceneHandle>(null);
  const film = useRef<WritingFilmHandle>(null);
  const current = useRef(0);
  const lastPhase = useRef(0);
  const [phase, setPhase] = useState(0);
  const [fallback, setFallback] = useState(false);
  const still = reducedMotion || fallback;
  const onUnavailable = useCallback(() => setFallback(true), []);
  const manualToggle = useRef(false);

  useLayoutEffect(() => {
    if (!manualToggle.current) return;
    manualToggle.current = false;
    window.scrollTo({ top: section.current ? window.scrollY + section.current.getBoundingClientRect().top : 0, behavior: 'instant' });
  }, [still]);

  useEffect(() => {
    const host = section.current, viewport = stage.current, text = copy.current;
    if (!host || !viewport || !text) return;
    let frame = 0, disposed = false, previous = 0, target = 0;
    const apply = (p: number) => {
      current.current = p;
      const opacity = still ? 1 : Math.max(0, 1 - Math.max(0, p - .035) / .18);
      text.style.opacity = String(opacity);
      text.style.transform = still ? 'none' : `translateY(${-Math.min(p, .25) * 100}px)`;
      text.inert = !still && opacity < .06;
      viewport.style.setProperty('--progress', String(p));
      viewport.dataset.progress = p.toFixed(5);
      scene.current?.seek(p);
      film.current?.seek(p);
      const nextPhase = p < .25 ? 0 : p < .5 ? 1 : p < .9 ? 2 : 3;
      if (lastPhase.current !== nextPhase) { lastPhase.current = nextPhase; setPhase(nextPhase); }
    };
    const measure = () => {
      if (disposed || document.hidden) return;
      if (still) { apply(1); return; }
      const rect = host.getBoundingClientRect();
      const travel = Math.max(1, host.offsetHeight - viewport.offsetHeight);
      target = Math.max(0, Math.min(1, -rect.top / travel));
      if (Math.abs(current.current - target) > .00001) {
        if (!frame) frame = requestAnimationFrame(tick);
      } else apply(target);
    };
    const tick = (time: number) => {
      frame = 0;
      if (disposed || document.hidden) return;
      const delta = previous ? Math.min(time - previous, 50) : 16;
      previous = time;
      const next = current.current + (target - current.current) * (1 - Math.exp(-delta / 65));
      const complete = Math.abs(next - target) < .00005;
      apply(complete ? target : next);
      if (!complete) frame = requestAnimationFrame(tick);
      else previous = 0;
    };
    const visibility = () => { cancelAnimationFrame(frame); frame = 0; previous = 0; if (!document.hidden) measure(); };
    const observer = new ResizeObserver(measure);
    observer.observe(host);
    observer.observe(viewport);
    window.addEventListener('scroll', measure, { passive: true });
    window.addEventListener('resize', measure);
    document.addEventListener('visibilitychange', visibility);
    apply(still ? 1 : 0);
    measure();
    return () => { disposed = true; cancelAnimationFrame(frame); observer.disconnect(); window.removeEventListener('scroll', measure); window.removeEventListener('resize', measure); document.removeEventListener('visibilitychange', visibility); };
  }, [still]);

  return <section ref={section} id="inicio" className={`pen-story${still ? ' pen-story--still' : ''}`} aria-labelledby="hero-title">
    <div ref={stage} className="story-stage">
      <div ref={copy} className="story-copy">
        <p className="story-eyebrow"><span /> DIREITO PREVIDENCIÁRIO</p>
        <h1 id="hero-title">O seu próximo<br />passo começa<br />com <em>clareza.</em></h1>
        <p className="story-description">Orientação em aposentadorias, benefícios do INSS e planejamento previdenciário. Uma conversa atenta à sua história.</p>
        <div className="story-actions">
          <a href={getWhatsappLink(config)} target="_blank" rel="noopener noreferrer" className="story-cta">Falar com Antônio Andreoli <ArrowUpRight size={19} aria-hidden="true" /></a>
          <button onClick={onExploreClick} className="story-explore">Conhecer a atuação <ArrowDown size={16} aria-hidden="true" /></button>
        </div>
        <div className="story-signature"><span>{config.nomeExibicao}</span><p className="story-oab">Advogado · {getOabFormatted(config)}</p></div>
      </div>
      <div className="story-visual">
        <Pen3DScene ref={scene} reducedMotion={still} onUnavailable={onUnavailable} />
        <WritingFilm ref={film} reducedMotion={still} />
        {!still && <div className="story-caption" aria-hidden="true" style={{ opacity: phase === 0 ? 1 : 0 }}><span>TRAJETÓRIA & CONTINUIDADE</span><p>Cada história<br />deixa uma <em>marca.</em></p></div>}
      </div>
      <div className="story-footer">
        <div className="story-direction"><ArrowDown size={14} aria-hidden="true" /><span>{still ? 'Clareza para seguir.' : labels[phase]}</span></div>
        <button className="story-motion" onClick={() => { manualToggle.current = true; onToggleReducedMotion(); }} disabled={fallback || motionLocked} aria-pressed={still}>
          {still ? <Play size={12} aria-hidden="true" /> : <Pause size={12} aria-hidden="true" />}
          {fallback ? 'Versão leve' : motionLocked ? 'Movimento reduzido' : still ? 'Ativar animação' : 'Reduzir animação'}
        </button>
      </div>
      {!still && <div className="story-progress" aria-hidden="true"><span style={{ transform: 'scaleX(var(--progress, 0))' }} /></div>}
    </div>
  </section>;
}

