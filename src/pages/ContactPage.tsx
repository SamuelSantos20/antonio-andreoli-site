import { ArrowLeft, ArrowUpRight, Download } from 'lucide-react';
import { BrandSymbol } from '../components/BrandSymbol';
import { ContactChannels } from '../components/ContactChannels';
import { getWhatsappLink, getOabFormatted, hasValidGoogleReview, type ProfessionalConfig } from '../config/professional';
interface Props {
 config: ProfessionalConfig;
 onNavigateHome: () => void;
 onSpeakWithAntonio: () => void;
 onSaveContact: () => void;
 onGoogleReview: () => void;
 onPlaceholderClick?: (channel:'email') => void;
}
export function ContactPage({config,onNavigateHome,onSaveContact}:Props) {
 return <main id="conteudo-principal" tabIndex={-1} className="digital-contact">
   <div className="digital-top"><button onClick={onNavigateHome} className="editorial-text-link"><ArrowLeft size={16} aria-hidden="true" /> Voltar ao site</button><p>CARTÃO DIGITAL</p></div>
   <div className="digital-layout">
     <div className="digital-identity"><BrandSymbol size={58} color="#183f35" /><h1>{config.nomeExibicao.replace(' ','\n')}</h1><p>{config.descricao}</p><span>{getOabFormatted(config)}</span></div>
     <div className="digital-actions">
       <a className="editorial-button" href={getWhatsappLink(config)} target="_blank" rel="noopener noreferrer">Falar com Antônio <ArrowUpRight size={19} aria-hidden="true" /></a>
       <button className="editorial-text-link" onClick={onSaveContact}>Salvar contato <Download size={17} aria-hidden="true" /></button>
       {hasValidGoogleReview(config)&&<a className="editorial-text-link" href={config.googleReviewUrl!} target="_blank" rel="noopener noreferrer">Avaliar no Google <ArrowUpRight size={17} aria-hidden="true" /></a>}
       <ContactChannels config={config} className="digital-channels" />
       <p className="digital-note">Sigilo profissional e atenção à sua história.</p>
     </div>
   </div>
   <div className="digital-bottom"><button onClick={onNavigateHome}>Conheça a atuação de Antônio Andreoli <ArrowUpRight size={15} aria-hidden="true" /></button></div>
 </main>;
}

