import { ArrowUpRight, Check, Copy } from 'lucide-react';
import { getAddressMapsLink, type ProfessionalConfig } from '../config/professional';
import { copyTextToClipboard } from '../utils/clipboard';
import { useActionFeedback } from '../hooks/useActionFeedback';

export function OfficeAddress({ config }: { config: ProfessionalConfig }) {
  const { feedback, announce } = useActionFeedback();
  const copied = feedback?.success === true;
  const endereco = config.endereco;
  if (!endereco) return null;

  const mapsLink = getAddressMapsLink(config);
  const fullAddressText = `${endereco.logradouro}, ${endereco.numero} - ${endereco.bairro}, ${endereco.cidade} - ${endereco.uf}, CEP ${endereco.cep}`;

  const handleCopyAddress = async () => {
    const ok = await copyTextToClipboard(fullAddressText);
    announce(ok ? 'Endereço copiado para a área de transferência.' : 'Não foi possível copiar. Selecione o endereço acima para copiar manualmente.', ok);
  };

  return (
    <div className="office-address">
      <span className="contact-channel">ATENDIMENTO PRESENCIAL</span>
      <address>
        {endereco.logradouro}, {endereco.numero}
        <br />
        {endereco.bairro} · {endereco.cidade} — {endereco.uf}
        <br />
        CEP {endereco.cep}
      </address>
      {config.horarioAtendimento && (
        <p>
          {config.horarioAtendimento}
          <br />
          Mediante agendamento prévio.
        </p>
      )}
      {!config.horarioAtendimento && <p>Mediante agendamento prévio.</p>}

      <div className="office-address__actions">
        {mapsLink && (
          <a
            href={mapsLink}
            target="_blank"
            rel="noopener noreferrer"
            className="editorial-text-link office-action-link"
          >
            <span>Abrir localização no Google Maps</span>
            <ArrowUpRight size={15} aria-hidden="true" />
          </a>
        )}
        <button
          type="button"
          onClick={handleCopyAddress}
          className="editorial-text-link office-action-link"
        >
          <span>{copied ? 'Endereço copiado' : 'Copiar endereço'}</span>
          {copied ? <Check size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}
        </button>
      </div>
      <p className="action-feedback" role="status" aria-live="polite" aria-atomic="true">{feedback?.message || ''}</p>
    </div>
  );
}
