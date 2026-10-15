import { ArrowUpRight, Check, Copy, Download, Phone } from 'lucide-react';
import { OfficeAddress } from './OfficeAddress';
import { getWhatsappLink, getOabFormatted, hasValidGoogleReview, type ProfessionalConfig } from '../config/professional';
import { copyTextToClipboard } from '../utils/clipboard';
import { useActionFeedback } from '../hooks/useActionFeedback';

interface Props {
  config: ProfessionalConfig;
  onSpeakWithAntonio: () => void;
  onSaveContact: () => void;
  onPlaceholderClick?: (channel: 'email') => void;
}

export function ContatoSection({ config, onSaveContact }: Props) {
  const { feedback, announce } = useActionFeedback();
  const phoneCopied = feedback?.success === true;

  const handleCopyPhone = async () => {
    const ok = await copyTextToClipboard(config.whatsappDisplay);
    announce(ok ? 'Número copiado para a área de transferência.' : `Não foi possível copiar. Você pode anotar o número ${config.whatsappDisplay} ou selecioná-lo acima.`, ok);
  };

  return (
    <section id="contato" aria-labelledby="contato-heading" className="editorial-section contact-section">
      <div className="editorial-container">
        <div className="contact-top">
          <p className="section-kicker">
            <span>{hasValidGoogleReview(config) ? '06' : '05'}</span> VAMOS CONVERSAR
          </p>
          <span>ATENDIMENTO MEDIANTE AGENDAMENTO</span>
        </div>
        <div className="contact-layout">
          <div>
            <h2 id="contato-heading">
              O próximo passo
              <br />
              começa com uma
              <br />
              <em>conversa.</em>
            </h2>
            <p className="contact-intro">
              Conte sua dúvida previdenciária, cível, de família ou sobre inventário e partilha pelo WhatsApp. Você também pode agendar atendimento presencial em Nova Iguaçu.
            </p>
          </div>
          <div className="contact-direct">
            <span className="contact-channel">WHATSAPP DIRETO</span>
            <a
              className="contact-number"
              href={getWhatsappLink(config)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Conversar no WhatsApp pelo número ${config.whatsappDisplay}`}
            >
              <span>{config.whatsappDisplay}</span>
              <ArrowUpRight aria-hidden="true" />
            </a>
            <p>Converse diretamente com o advogado Antônio Andreoli.</p>
            <a
              className="editorial-button"
              href={getWhatsappLink(config)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>Falar com Antônio no WhatsApp</span>
              <ArrowUpRight size={19} aria-hidden="true" />
            </a>
            <div className="contact-secondary-actions">
              <a className="editorial-text-link" href={`tel:${config.whatsappE164}`}>
                <span>Ligar para este número</span><Phone size={16} aria-hidden="true" />
              </a>
              <button type="button" className="editorial-text-link" onClick={onSaveContact}>
                <span>Salvar contato na agenda</span>
                <Download size={16} aria-hidden="true" />
              </button>
              <button type="button" className="editorial-text-link" onClick={handleCopyPhone}>
                <span>{phoneCopied ? 'Telefone copiado' : 'Copiar número do WhatsApp'}</span>
                {phoneCopied ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
              </button>
            </div>
            <p className="action-feedback" role="status" aria-live="polite" aria-atomic="true">{feedback?.message || ''}</p>
          </div>
        </div>
        <OfficeAddress config={config} />
        <div className="contact-bottom">
          <p>
            {config.nomeExibicao} · Advogado · {getOabFormatted(config)}
          </p>
          <p>Sigilo profissional e atenção à sua história.</p>
        </div>
      </div>
    </section>
  );
}
