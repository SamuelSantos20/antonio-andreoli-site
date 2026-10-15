import { ArrowUpRight } from 'lucide-react';
import { focusSection } from '../utils/navigation';

const areas = [
  {
    number: '01',
    label: 'APOSENTADORIAS',
    title: 'Uma vida de trabalho merece um olhar atento.',
    text: 'Análise cuidadosa dos seus vínculos em carteira, carnês de contribuição e períodos trabalhados para identificar a regra mais adequada ao seu pedido de aposentadoria.',
    detail: 'Aposentadoria por idade · Tempo de contribuição · Atividades especiais · Regras de transição',
  },
  {
    number: '02',
    label: 'BENEFÍCIOS DO INSS',
    title: 'Orientação segura em momentos que pedem cuidado.',
    text: 'Acompanhamento de pedidos no INSS, pensão por morte, benefícios por incapacidade, cumprimento de exigências e revisão de benefícios, com explicações simples em cada etapa.',
    detail: 'Pedidos e exigências · Pensão por morte · Auxílios e incapacidade · Revisões',
  },
  {
    number: '03',
    label: 'PLANEJAMENTO PREVIDENCIÁRIO',
    title: 'Mais clareza para organizar os próximos passos.',
    text: 'Conferência detalhada do extrato do INSS (CNIS) e do histórico de contribuições para corrigir pendências com antecedência e preparar sua futura aposentadoria.',
    detail: 'Regularização do CNIS · Conferência de documentos · Organização do histórico',
  },
];

export function AtuacaoSection() {
  return (
    <section id="atuacao" aria-labelledby="atuacao-heading" className="editorial-section practice-section">
      <div className="editorial-container">
        <div className="editorial-heading">
          <p className="section-kicker">
            <span>01</span> ÁREAS DE ATUAÇÃO
          </p>
          <div>
            <h2 id="atuacao-heading">
              Sua história é<br />o ponto de <em>partida.</em>
            </h2>
            <p className="section-intro">
              Cada trajetória de trabalho tem suas particularidades. O primeiro passo é compreender a sua com calma e clareza.
            </p>
          </div>
        </div>
        <div className="practice-list">
          {areas.map((area) => (
            <article className="practice-row" key={area.number}>
              <div className="practice-label">
                <span className="practice-number">{area.number}</span>
                <p>{area.label}</p>
              </div>
              <h3>{area.title}</h3>
              <div className="practice-copy">
                <p>{area.text}</p>
                <span>{area.detail}</span>
              </div>
            </article>
          ))}
        </div>
        <a className="editorial-text-link practice-link" href="#contato" onClick={event => {
          event.preventDefault();
          focusSection('contato', true);
        }}>
          <span>Conversar sobre minha trajetória</span>
          <ArrowUpRight size={17} aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}
