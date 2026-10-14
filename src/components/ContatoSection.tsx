import { ArrowUpRight, Download } from 'lucide-react';
import { OfficeAddress } from './OfficeAddress';
import { getWhatsappLink, getOabFormatted, type ProfessionalConfig } from '../config/professional';
interface Props { config: ProfessionalConfig; onSpeakWithAntonio: () => void; onSaveContact: () => void; onPlaceholderClick?: (channel:'email') => void }
export function ContatoSection({config,onSaveContact}:Props) {
  return <section id="contato" aria-labelledby="contato-heading" className="editorial-section contact-section">
    <div className="editorial-container">
      <div className="contact-top"><p className="section-kicker"><span>04</span> VAMOS CONVERSAR</p><span>ATENDIMENTO MEDIANTE AGENDAMENTO</span></div>
      <div className="contact-layout">
        <div><h2 id="contato-heading">O próximo passo<br />começa com uma<br /><em>conversa.</em></h2><p className="contact-intro">Conte sua dúvida previdenciária.<br />Vamos começar pela sua história.</p></div>
        <div className="contact-direct"><span className="contact-channel">WHATSAPP</span><a className="contact-number" href={getWhatsappLink(config)} target="_blank" rel="noopener noreferrer">{config.whatsappDisplay}<ArrowUpRight aria-hidden="true" /></a><p>Converse diretamente com Antônio Andreoli.</p><a className="editorial-button" href={getWhatsappLink(config)} target="_blank" rel="noopener noreferrer">Falar com Antônio <ArrowUpRight size={19} aria-hidden="true" /></a><button className="editorial-text-link" onClick={onSaveContact}>Salvar contato na agenda <Download size={16} aria-hidden="true" /></button></div>
      </div>
      <OfficeAddress config={config} />
      <div className="contact-bottom"><p>{config.nomeExibicao} · {getOabFormatted(config)}</p><p>Sigilo profissional e atenção à sua história.</p></div>
    </div>
  </section>;
}

