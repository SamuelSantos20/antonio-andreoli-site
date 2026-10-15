import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowUpRight, Menu, X } from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { ProfessionalConfig, getWhatsappLink } from '../config/professional';
import { focusSection } from '../utils/navigation';

interface Props {
  config: ProfessionalConfig;
  onSpeakWithAntonio: () => void;
  onNavigateContactPage?: () => void;
  currentRoute?: string;
  onNavigateHome?: () => void;
}

const links = [
  ['#inicio', 'Início'],
  ['#atuacao', 'Atuação'],
  ['#atendimento', 'Atendimento'],
  ['#pilares', 'Sobre'],
  ['#duvidas', 'Dúvidas'],
  ['#contato', 'Contato'],
] as const;

export function Navbar({
  config,
  onNavigateContactPage,
  currentRoute = '/',
  onNavigateHome,
}: Props) {
  const [open, setOpen] = useState(false);
  const [activeHref, setActiveHref] = useState<string>('#inicio');
  const headerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const firstMobileItemRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    setOpen(false);
  }, [currentRoute]);

  useEffect(() => {
    if (currentRoute !== '/') return;
    const sections = links.map(([href]) => document.querySelector(href)).filter((section): section is HTMLElement => section instanceof HTMLElement);
    const update = () => {
      const marker = window.innerHeight * 0.35;
      const active = [...sections].reverse().find(section => section.getBoundingClientRect().top <= marker);
      if (active) setActiveHref(`#${active.id}`);
    };
    const observer = new IntersectionObserver(update, { rootMargin: '-15% 0px -55% 0px' });
    sections.forEach(section => observer.observe(section));
    update();
    return () => observer.disconnect();
  }, [currentRoute]);

  useEffect(() => {
    const query = matchMedia('(min-width: 1101px)');
    const update = () => { if (query.matches) setOpen(false); };
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (!open) return;
    firstMobileItemRef.current?.focus({ preventScroll: true });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setOpen(false);
        menuButtonRef.current?.focus({ preventScroll: true });
      }
    };

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (target && headerRef.current && !headerRef.current.contains(target)) {
        setOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown, { passive: true });
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
    };
  }, [open]);

  const home = () => {
    setOpen(false);
    if (currentRoute === '/contato') {
      onNavigateHome?.();
    } else {
      window.scrollTo({
        top: 0,
        behavior: document.documentElement.dataset.motion === 'reduced' ? 'instant' : 'smooth',
      });
    }
  };

  const isContactRoute = currentRoute === '/contato';

  return (
    <header ref={headerRef} className="site-navigation">
      <div className="navigation-inner">
        <a
          href={`${import.meta.env.BASE_URL}#/`}
          onClick={(event) => {
            event.preventDefault();
            home();
          }}
          aria-label="Antônio Andreoli — Direito Previdenciário e Cível (ir para o início)"
          className="navigation-brand"
        >
          <BrandLogo symbolSize={34} showSubtitle />
        </a>

        {!isContactRoute ? (
          <nav className="desktop-navigation" aria-label="Navegação principal">
            {links.map(([href, label]) => (
              <a key={href} href={href} aria-current={activeHref === href ? 'location' : undefined}
                onClick={event => { event.preventDefault(); focusSection(href.slice(1), true); }}>
                {label}
              </a>
            ))}
          </nav>
        ) : (
          <nav className="desktop-navigation" aria-label="Navegação de retorno">
            <button type="button" onClick={home} className="navigation-back-home">
              <ArrowLeft size={16} aria-hidden="true" />
              <span>Voltar à página inicial</span>
            </button>
          </nav>
        )}

        <div className="navigation-actions">
          <button
            type="button"
            className="navigation-card"
            onClick={() => {
              setOpen(false);
              if (isContactRoute) onNavigateHome?.();
              else onNavigateContactPage?.();
            }}
          >
            {isContactRoute ? 'Início do site' : 'Cartão digital'}
          </button>

          <a
            className="navigation-whatsapp"
            href={getWhatsappLink(config)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Conversar pelo WhatsApp: ${config.whatsappDisplay}`}
          >
            <span>WhatsApp</span>
            <ArrowUpRight size={16} aria-hidden="true" />
          </a>

          {!isContactRoute && (
            <button
              ref={menuButtonRef}
              type="button"
              className="navigation-menu"
              aria-expanded={open}
              aria-controls="mobile-navigation"
              aria-label={open ? 'Fechar menu de navegação' : 'Abrir menu de navegação'}
              onClick={() => setOpen((prev) => !prev)}
            >
              {open ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
              <span>{open ? 'Fechar' : 'Menu'}</span>
            </button>
          )}
        </div>
      </div>

      {open && !isContactRoute && (
        <nav id="mobile-navigation" className="mobile-navigation" aria-label="Menu de navegação móvel">
          {links.map(([href, label], index) => (
            <a
              key={href}
              ref={index === 0 ? firstMobileItemRef : undefined}
              href={href}
              aria-current={activeHref === href ? 'location' : undefined}
              onClick={event => {
                event.preventDefault();
                setOpen(false);
                focusSection(href.slice(1), true);
              }}
            >
              <span>{label}</span>
              <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          ))}
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onNavigateContactPage?.();
            }}
          >
            <span>Cartão digital de contato</span>
            <ArrowUpRight size={16} aria-hidden="true" />
          </button>
        </nav>
      )}
    </header>
  );
}
