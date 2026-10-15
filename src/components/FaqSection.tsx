import { ArrowUpRight } from 'lucide-react';
import { getWhatsappLink, type ProfessionalConfig } from '../config/professional';

interface Props {
  config: ProfessionalConfig;
}

const createFaqs = (config: ProfessionalConfig) => [
  {
    question: 'Quais documentos são úteis para a primeira conversa?',
    answer:
      'Documento de identificação, carteiras de trabalho, carnês de contribuição e, se tiver acesso ao aplicativo ou site Meu INSS, o extrato de contribuições (CNIS). Caso ainda não tenha todos os documentos em mãos, podemos conversar primeiro e orientar como solicitá-los.',
  },
  {
    question: 'Já tenho um pedido em andamento ou recebi uma exigência do INSS. Posso buscar orientação?',
    answer:
      'Sim. Se o INSS solicitou documentos complementares ou se você deseja compreender o andamento e a resposta de um requerimento, analisamos a comunicação recebida para esclarecer quais providências cabem no seu caso.',
  },
  {
    question: 'Quando vale a pena fazer o planejamento previdenciário?',
    answer:
      'O planejamento é indicado para quem deseja conferir se todos os vínculos e recolhimentos estão registrados corretamente no CNIS antes de pedir a aposentadoria, evitando surpresas com períodos pendentes ou dados divergentes.',
  },
  {
    question: 'O atendimento pode ser feito tanto pelo WhatsApp quanto presencialmente?',
    answer: config.endereco
      ? `O primeiro contato pode ser feito pelo WhatsApp para explicar sua dúvida ou agendar um horário. O escritório fica em ${config.endereco.bairro}, ${config.endereco.cidade} — ${config.endereco.uf}.${config.horarioAtendimento ? ` Atendimento: ${config.horarioAtendimento.toLocaleLowerCase('pt-BR')}, mediante agendamento prévio.` : ' O atendimento presencial ocorre mediante agendamento prévio.'}`
      : 'O primeiro contato pode ser feito pelo WhatsApp para explicar sua dúvida e combinar o atendimento.',
  },
];

export function FaqSection({ config }: Props) {
  const faqs = createFaqs(config);
  return (
    <section id="duvidas" aria-labelledby="duvidas-heading" className="editorial-section faq-section">
      <div className="editorial-container">
        <div className="editorial-heading">
          <p className="section-kicker">
            <span>04</span> DÚVIDAS FREQUENTES
          </p>
          <div>
            <h2 id="duvidas-heading">
              Respostas claras para
              <br />o primeiro <em>passo.</em>
            </h2>
            <p className="section-intro">
              Informações gerais para ajudar você a se preparar com tranquilidade antes do atendimento.
            </p>
          </div>
        </div>

        <dl className="faq-list">
          {faqs.map((item) => (
            <div className="faq-row" key={item.question}>
              <dt>{item.question}</dt>
              <dd>{item.answer}</dd>
            </div>
          ))}
        </dl>

        <div className="faq-footer">
          <p className="faq-disclaimer">
            As respostas acima têm caráter meramente informativo. Cada situação previdenciária depende da análise individual do histórico e dos documentos do segurado.
          </p>
          <a
            href={getWhatsappLink(config)}
            target="_blank"
            rel="noopener noreferrer"
            className="editorial-text-link"
          >
            <span>Tirar uma dúvida pelo WhatsApp</span>
            <ArrowUpRight size={17} aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}
