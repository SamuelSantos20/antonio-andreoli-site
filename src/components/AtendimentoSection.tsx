import { ArrowUpRight } from 'lucide-react';
import { getWhatsappLink, getOabFormatted, type ProfessionalConfig } from '../config/professional';

interface Props {
  config: ProfessionalConfig;
  onSpeakWithAntonio: () => void;
}

const steps = [
  {
    number: '01',
    title: 'Conte sua história.',
    text: 'Compartilhe sua dúvida e o momento da sua vida profissional pelo WhatsApp ou em atendimento presencial agendado. A conversa começa pela escuta.',
  },
  {
    number: '02',
    title: 'Reúna os documentos que tiver.',
    text: 'Carteiras de trabalho, carnês, extrato do INSS (CNIS) ou cartas do órgão ajudam na análise. Se faltar algum documento, orientamos como obtê-lo.',
  },
  {
    number: '03',
    title: 'Entenda o caminho com clareza.',
    text: 'Você recebe explicações diretas sobre sua situação previdenciária, os documentos necessários e os próximos passos possíveis.',
  },
];

export function AtendimentoSection({ config }: Props) {
  return (
    <section id="atendimento" aria-labelledby="atendimento-heading" className="editorial-section process-section">
      <div className="editorial-container">
        <div className="process-heading">
          <p className="section-kicker">
            <span>02</span> COMO COMEÇAMOS
          </p>
          <h2 id="atendimento-heading">
            Antes de orientar,
            <br />
            <em>ouvir.</em>
          </h2>
          <p className="process-intro">
            Uma conversa tranquila.
            <br />
            Um passo de cada vez.
          </p>
        </div>
        <ol className="process-steps">
          {steps.map((step) => (
            <li key={step.number}>
              <span className="process-number">{step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </li>
          ))}
        </ol>
        <div className="process-bottom">
          <p>
            Atendimento direto com Antônio Andreoli
            <br />
            <span>Advogado · {getOabFormatted(config)}</span>
          </p>
          <a
            href={getWhatsappLink(config)}
            target="_blank"
            rel="noopener noreferrer"
            className="editorial-button editorial-button--light"
          >
            <span>Iniciar uma conversa pelo WhatsApp</span>
            <ArrowUpRight size={19} aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}
