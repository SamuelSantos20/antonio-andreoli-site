import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Navbar } from './components/Navbar';
import { HeroNarrativeSection } from './components/HeroNarrativeSection';
import { AtuacaoSection } from './components/AtuacaoSection';
import { AtendimentoSection } from './components/AtendimentoSection';
import { PilaresSection } from './components/PilaresSection';
import { ContatoSection } from './components/ContatoSection';
import { GoogleReviewSection } from './components/GoogleReviewSection';
import { ContactPage } from './pages/ContactPage';
import { Footer } from './components/Footer';
import { NoticeModal } from './components/NoticeModal';
import { defaultProfessionalConfig, hasValidGoogleReview, hasValidWhatsapp } from './config/professional';
import { downloadVCard } from './utils/vcard';

type Route = '/' | '/contato';
const readRoute = (): Route => window.location.hash === '#/contato' || (window.location.hash !== '#/' && window.location.pathname.replace(/\/$/,'') === '/contato') ? '/contato' : '/';
export default function App() {
  const config = defaultProfessionalConfig;
  const [currentRoute, setCurrentRoute] = useState<Route>(readRoute);
  const route = useRef(currentRoute);
  const pendingFocus = useRef(false);
  const [systemReduced, setSystemReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [manualReduced, setManualReduced] = useState<boolean | null>(null);
  const reducedMotion = systemReduced || manualReduced === true;
  const [modal, setModal] = useState({ isOpen: false, title: '', message: '' });
  const closeModal = useCallback(() => setModal(previous=>({...previous,isOpen:false})), []);

  useEffect(() => {
    const query = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setSystemReduced(query.matches);
    query.addEventListener('change',update);
    return () => query.removeEventListener('change',update);
  }, []);
  useEffect(() => {
    document.documentElement.dataset.motion = reducedMotion ? 'reduced' : 'full';
    return () => { delete document.documentElement.dataset.motion; };
  }, [reducedMotion]);
  useEffect(() => {
    const sync = () => {
      const next = readRoute();
      if (next === route.current) return;
      route.current = next; pendingFocus.current = true;
      setCurrentRoute(next); closeModal();
    };
    window.addEventListener('popstate',sync); window.addEventListener('hashchange',sync);
    return () => { window.removeEventListener('popstate',sync); window.removeEventListener('hashchange',sync); };
  }, [closeModal]);
  useLayoutEffect(() => {
    document.title = currentRoute === '/contato' ? 'Contato | Antônio Andreoli — Direito Previdenciário' : 'Antônio Andreoli | Direito Previdenciário';
    if (!pendingFocus.current) return;
    pendingFocus.current = false;
    document.querySelector<HTMLElement>('main')?.focus({preventScroll:true});
    window.scrollTo({top:0,behavior:'instant'});
  }, [currentRoute]);
  const navigate = (next: Route) => {
    if (next === route.current) { window.scrollTo({top:0,behavior:reducedMotion?'instant':'smooth'}); return; }
    route.current = next; pendingFocus.current = true;
    history.pushState({},'',`${import.meta.env.BASE_URL}${next === '/contato' ? '#/contato' : '#/'}`);
    closeModal(); setCurrentRoute(next);
  };
  // Valid external links navigate through their anchor once. The callback handles missing data only.
  const speak = () => { if (!hasValidWhatsapp(config)) setModal({isOpen:true,title:'Vamos conversar',message:'O canal de WhatsApp estará disponível em breve.'}); };
  const saveContact = () => {
    if (downloadVCard(config)) setModal({isOpen:true,title:'Contato pronto para salvar',message:'Abra o cartão baixado e escolha adicionar Antônio Andreoli à sua agenda.'});
  };
  const review = () => { if (!hasValidGoogleReview(config)) setModal({isOpen:true,title:'Sua experiência importa',message:'O canal de avaliações estará disponível em breve.'}); };

  useEffect(() => {
    if (reducedMotion || currentRoute !== '/') return;
    const animations: Animation[] = [];
    const observer = new IntersectionObserver(entries=>entries.forEach(entry=>{
      if (!entry.isIntersecting) return;
      animations.push(entry.target.animate([{opacity:0,transform:'translateY(20px)'},{opacity:1,transform:'translateY(0)'}],{duration:650,easing:'cubic-bezier(.22,1,.36,1)'}));
      observer.unobserve(entry.target);
    }),{threshold:.1});
    document.querySelectorAll('main > section:not(#inicio) > div').forEach(element=>observer.observe(element));
    return () => {observer.disconnect();animations.forEach(animation=>animation.cancel());};
  }, [reducedMotion,currentRoute]);

  return <div className="site-app font-sans">
    <a href="#conteudo-principal" className="skip-main">Pular para o conteúdo principal</a>
    <Navbar config={config} onSpeakWithAntonio={speak} currentRoute={currentRoute} onNavigateHome={()=>navigate('/')} onNavigateContactPage={()=>navigate('/contato')} />
    {currentRoute === '/contato' ? <ContactPage config={config} onNavigateHome={()=>navigate('/')} onSpeakWithAntonio={speak} onSaveContact={saveContact} onGoogleReview={review} /> : <main id="conteudo-principal" tabIndex={-1}>
      <HeroNarrativeSection config={config} onSpeakWithAntonio={speak} onExploreClick={()=>document.getElementById('atuacao')?.scrollIntoView({behavior:reducedMotion?'instant':'smooth'})} reducedMotion={reducedMotion} motionLocked={systemReduced} onToggleReducedMotion={()=>setManualReduced(!reducedMotion)} />
      <AtuacaoSection />
      <AtendimentoSection config={config} onSpeakWithAntonio={speak} />
      <PilaresSection config={config} />
      <GoogleReviewSection config={config} onReviewClick={review} />
      <ContatoSection config={config} onSpeakWithAntonio={speak} onSaveContact={saveContact} />
      <Footer onNavigateContactPage={()=>navigate('/contato')} />
    </main>}
    <NoticeModal isOpen={modal.isOpen} onClose={closeModal} title={modal.title} message={modal.message} />
  </div>;
}

