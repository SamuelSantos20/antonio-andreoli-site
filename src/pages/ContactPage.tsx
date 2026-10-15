import { ArrowLeft, ArrowUpRight, Copy, Download, Phone, Share2 } from 'lucide-react';
import { BrandSymbol } from '../components/BrandSymbol';
import { ContactChannels } from '../components/ContactChannels';
import {
  getWhatsappLink,
  getOabFormatted,
  hasValidGoogleReview,
  type ProfessionalConfig,
} from '../config/professional';
import { copyTextToClipboard } from '../utils/clipboard';
import { useActionFeedback } from '../hooks/useActionFeedback';

interface Props {
  config: ProfessionalConfig;
  onNavigateHome: () => void;
  onSpeakWithAntonio: () => void;
  onSaveContact: () => void;
  onGoogleReview: () => void;
  onPlaceholderClick?: (channel: 'email') => void;
}

export function ContactPage({ config, onNavigateHome, onSaveContact }: Props) {
  const { feedback, announce } = useActionFeedback();

  const handleCopyPhone = async () => {
    const ok = await copyTextToClipboard(config.whatsappDisplay);
    announce(ok ? 'Número copiado para a área de transferência.' : `Não foi possível copiar. Você pode anotar o número ${config.whatsappDisplay}.`, ok);
  };

  const handleShareCard = async () => {
    const shareUrl = new URL(`${import.meta.env.BASE_URL}#/contato`, window.location.origin).href;
    const shareData = {
      title: `${config.nomeExibicao} — ${config.descricao}`,
      text: `${config.nomeExibicao} · Advogado (${getOabFormatted(config)}) — WhatsApp: ${config.whatsappDisplay}`,
      url: shareUrl,
    };

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return;
      }
    }

    const ok = await copyTextToClipboard(shareUrl || `${config.nomeExibicao} - ${config.whatsappDisplay}`);
    announce(ok ? 'Link do cartão copiado para compartilhar.' : 'Não foi possível copiar o link. Você pode compartilhar o endereço desta página pelo navegador.', ok);
  };

  return (
    <main id="conteudo-principal" tabIndex={-1} className="digital-contact">
      <div className="digital-top">
        <button type="button" onClick={onNavigateHome} className="editorial-text-link">
          <ArrowLeft size={16} aria-hidden="true" />
          <span>Voltar ao site</span>
        </button>
        <p>CARTÃO DIGITAL DE CONTATO</p>
      </div>
      <div className="digital-layout">
        <div className="digital-identity">
          <BrandSymbol size={58} color="#183f35" />
          <h1>{config.nomeExibicao.replace(' ', '\n')}</h1>
          <p>{config.descricao}</p>
          <span>Advogado · {getOabFormatted(config)}</span>
        </div>
        <div className="digital-actions">
          <a
            className="editorial-button"
            href={getWhatsappLink(config)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span>Falar com Antônio no WhatsApp</span>
            <ArrowUpRight size={19} aria-hidden="true" />
          </a>

          <div className="digital-utility-links">
            <a className="editorial-text-link" href={`tel:${config.whatsappE164}`}>
              <span>Ligar para este número</span><Phone size={16} aria-hidden="true" />
            </a>
            <button type="button" className="editorial-text-link" onClick={onSaveContact}>
              <span>Salvar contato na agenda (.vcf)</span>
              <Download size={17} aria-hidden="true" />
            </button>
            <button type="button" className="editorial-text-link" onClick={handleCopyPhone}>
              <span>Copiar número do WhatsApp</span>
              <Copy size={16} aria-hidden="true" />
            </button>
            <button type="button" className="editorial-text-link" onClick={handleShareCard}>
              <span>Compartilhar cartão digital</span>
              <Share2 size={16} aria-hidden="true" />
            </button>
            {hasValidGoogleReview(config) && (
              <a
                className="editorial-text-link"
                href={config.googleReviewUrl!}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>Avaliar no Google</span>
                <ArrowUpRight size={17} aria-hidden="true" />
              </a>
            )}
          </div>

          <p className={`action-feedback${feedback?.success ? ' action-feedback--success' : ''}`} role="status" aria-live="polite" aria-atomic="true">{feedback?.message || ''}</p>

          <ContactChannels config={config} className="digital-channels" />
          <p className="digital-note">Sigilo profissional e atenção à sua história.</p>
        </div>
      </div>
      <div className="digital-bottom">
        <button type="button" onClick={onNavigateHome}>
          <span>Conheça a atuação de Antônio Andreoli</span>
          <ArrowUpRight size={15} aria-hidden="true" />
        </button>
      </div>
    </main>
  );
}
