import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Navbar } from './components/Navbar';
import { HeroNarrativeSection } from './components/HeroNarrativeSection';
import { AtuacaoSection } from './components/AtuacaoSection';
import { AtendimentoSection } from './components/AtendimentoSection';
import { PilaresSection } from './components/PilaresSection';
import { FaqSection } from './components/FaqSection';
import { ContatoSection } from './components/ContatoSection';
import { GoogleReviewSection } from './components/GoogleReviewSection';
import { ContactPage } from './pages/ContactPage';
import { Footer } from './components/Footer';
import { NoticeModal } from './components/NoticeModal';
import { defaultProfessionalConfig, hasValidGoogleReview, hasValidWhatsapp } from './config/professional';
import { downloadVCard } from './utils/vcard';
import { focusSection } from './utils/navigation';
import { useScrollReveal } from './hooks/useScrollReveal';

type Route = '/' | '/contato';

const readRoute = (): Route =>
  window.location.hash === '#/contato' ||
  (window.location.hash !== '#/' && window.location.pathname.replace(/\/$/, '') === '/contato')
    ? '/contato'
    : '/';

export default function App() {
  const config = defaultProfessionalConfig;
  const [currentRoute, setCurrentRoute] = useState<Route>(readRoute);
  const route = useRef(currentRoute);
  const pendingFocus = useRef(false);
  const [systemReduced, setSystemReduced] = useState(
    () => matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  const [manualReduced, setManualReduced] = useState<boolean | null>(null);
  const reducedMotion = systemReduced || manualReduced === true;
  const [modal, setModal] = useState({ isOpen: false, title: '', message: '' });
  const closeModal = useCallback(() => setModal((previous) => ({ ...previous, isOpen: false })), []);

  useEffect(() => {
    const query = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setSystemReduced(query.matches);
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.motion = reducedMotion ? 'reduced' : 'full';
    return () => {
      delete document.documentElement.dataset.motion;
    };
  }, [reducedMotion]);

  useEffect(() => {
    const sync = () => {
      const next = readRoute();
      if (next === route.current) return;
      route.current = next;
      pendingFocus.current = true;
      setCurrentRoute(next);
      closeModal();
    };
    window.addEventListener('popstate', sync);
    window.addEventListener('hashchange', sync);
    return () => {
      window.removeEventListener('popstate', sync);
      window.removeEventListener('hashchange', sync);
    };
  }, [closeModal]);

  useLayoutEffect(() => {
    document.title =
      currentRoute === '/contato'
        ? 'Cartão Digital e Contato | Antônio Andreoli — Direito Previdenciário e Cível (OAB/RJ 064430)'
        : 'Antônio Andreoli | Direito Previdenciário, Cível, Família e Sucessões — OAB/RJ 064430';
    if (!pendingFocus.current) return;
    pendingFocus.current = false;
    document.querySelector<HTMLElement>('main')?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [currentRoute]);

  const navigate = (next: Route) => {
    if (next === route.current) {
      window.scrollTo({ top: 0, behavior: reducedMotion ? 'instant' : 'smooth' });
      return;
    }
    route.current = next;
    pendingFocus.current = true;
    history.pushState(
      {},
      '',
      `${import.meta.env.BASE_URL}${next === '/contato' ? '#/contato' : '#/'}`
    );
    closeModal();
    setCurrentRoute(next);
  };

  const speak = () => {
    if (!hasValidWhatsapp(config)) {
      setModal({
        isOpen: true,
        title: 'Vamos conversar',
        message: 'O canal de WhatsApp estará disponível em breve.',
      });
    }
  };

  const saveContact = () => {
    if (downloadVCard(config)) {
      setModal({
        isOpen: true,
        title: 'Contato pronto para salvar',
        message:
          `O arquivo antonio-andreoli.vcf foi baixado. Abra-o na lista de downloads do seu celular ou computador e escolha adicionar o contato à agenda. Se preferir anotar, o número é ${config.whatsappDisplay}.`,
      });
    }
  };

  const review = () => {
    if (!hasValidGoogleReview(config)) {
      setModal({
        isOpen: true,
        title: 'Sua experiência importa',
        message: 'O canal de avaliações estará disponível em breve.',
      });
    }
  };

  useScrollReveal(reducedMotion, currentRoute);

  return (
    <div className="site-app font-sans">
      <a href="#conteudo-principal" className="skip-main" onClick={event => {
        event.preventDefault();
        document.getElementById('conteudo-principal')?.focus({ preventScroll: true });
        document.getElementById('conteudo-principal')?.scrollIntoView({ behavior: 'instant' });
      }}>
        Pular para o conteúdo principal
      </a>
      <Navbar
        config={config}
        onSpeakWithAntonio={speak}
        currentRoute={currentRoute}
        onNavigateHome={() => navigate('/')}
        onNavigateContactPage={() => navigate('/contato')}
      />
      {currentRoute === '/contato' ? (
        <ContactPage
          config={config}
          onNavigateHome={() => navigate('/')}
          onSpeakWithAntonio={speak}
          onSaveContact={saveContact}
          onGoogleReview={review}
        />
      ) : (
        <main id="conteudo-principal" tabIndex={-1}>
          <HeroNarrativeSection
            config={config}
            onSpeakWithAntonio={speak}
            onExploreClick={() => focusSection('atuacao')}
            reducedMotion={reducedMotion}
            motionLocked={systemReduced}
            onToggleReducedMotion={() => setManualReduced(!reducedMotion)}
          />
          <AtuacaoSection />
          <AtendimentoSection config={config} onSpeakWithAntonio={speak} />
          <PilaresSection config={config} />
          <FaqSection config={config} />
          <GoogleReviewSection config={config} onReviewClick={review} />
          <ContatoSection
            config={config}
            onSpeakWithAntonio={speak}
            onSaveContact={saveContact}
          />
          <Footer onNavigateContactPage={() => navigate('/contato')} />
        </main>
      )}
      <NoticeModal
        isOpen={modal.isOpen}
        onClose={closeModal}
        title={modal.title}
        message={modal.message}
      />
    </div>
  );
}
