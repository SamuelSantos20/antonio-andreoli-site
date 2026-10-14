import { useEffect, useState } from 'react';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { ProfessionalConfig, getWhatsappLink } from '../config/professional';

interface Props { config: ProfessionalConfig; onSpeakWithAntonio: () => void; onNavigateContactPage?: () => void; currentRoute?: string; onNavigateHome?: () => void }
const links = [['#inicio','Início'],['#atuacao','Atuação'],['#atendimento','Atendimento'],['#contato','Contato']];
export function Navbar({config,onNavigateContactPage,currentRoute='/',onNavigateHome}:Props) {
  const [open,setOpen] = useState(false);
  useEffect(()=>setOpen(false),[currentRoute]);
  const home = () => {
    setOpen(false);
    if (currentRoute === '/contato') onNavigateHome?.();
    else window.scrollTo({top:0,behavior:document.documentElement.dataset.motion === 'reduced'?'instant':'smooth'});
  };
  return <header className="site-navigation" onKeyDown={event=>{if(event.key==='Escape') setOpen(false);}}>
    <div className="navigation-inner">
      <a href={import.meta.env.BASE_URL} onClick={event=>{event.preventDefault();home();}} aria-label="Antônio Andreoli — início"><BrandLogo symbolSize={32} showSubtitle /></a>
      {currentRoute === '/' && <nav className="desktop-navigation" aria-label="Navegação principal">{links.map(([href,label])=><a key={href} href={href}>{label}</a>)}</nav>}
      <div className="navigation-actions">
        <button className="navigation-card" onClick={onNavigateContactPage}>Cartão digital</button>
        <a className="navigation-whatsapp" href={getWhatsappLink(config)} target="_blank" rel="noopener noreferrer"><span>WhatsApp</span><ArrowUpRight size={15} aria-hidden="true" /></a>
        {currentRoute === '/' && <button className="navigation-menu" aria-expanded={open} aria-controls="mobile-navigation" aria-label={open?'Fechar menu':'Abrir menu'} onClick={()=>setOpen(!open)}>{open?<X size={18}/>:<Menu size={18}/>}</button>}
      </div>
    </div>
    {open && <nav id="mobile-navigation" className="mobile-navigation" aria-label="Navegação mobile">{links.map(([href,label])=><a key={href} href={href} onClick={()=>setOpen(false)}>{label}<ArrowUpRight size={15} aria-hidden="true" /></a>)}<button onClick={()=>{setOpen(false);onNavigateContactPage?.();}}>Cartão digital <ArrowUpRight size={15} aria-hidden="true" /></button></nav>}
  </header>;
}

