import { ArrowUpRight } from 'lucide-react';

const areas = [
  { number:'01', label:'APOSENTADORIAS', title:'Uma vida de trabalho merece um olhar atento.', text:'Análise dos vínculos, das contribuições e dos períodos de atividade para entender sua trajetória e orientar o pedido de aposentadoria.', detail:'Tempo de contribuição · Atividades especiais · Regras de transição' },
  { number:'02', label:'BENEFÍCIOS DO INSS', title:'Orientação em momentos que pedem cuidado.', text:'Acompanhamento de pedidos de benefícios, pensão por morte, revisões e exigências do INSS, com explicações sobre cada etapa.', detail:'Pedidos e exigências · Pensões · Revisões' },
  { number:'03', label:'PLANEJAMENTO PREVIDENCIÁRIO', title:'Mais informação para decidir os próximos passos.', text:'Conferência do CNIS e do histórico de contribuições para organizar as informações que embasam suas decisões sobre aposentadoria.', detail:'Histórico previdenciário · Documentação · Planejamento' },
];
export function AtuacaoSection() {
  return <section id="atuacao" aria-labelledby="atuacao-heading" className="editorial-section practice-section">
    <div className="editorial-container">
      <div className="editorial-heading">
        <p className="section-kicker"><span>01</span> ÁREAS DE ATUAÇÃO</p>
        <div><h2 id="atuacao-heading">Sua história é<br />o ponto de <em>partida.</em></h2><p className="section-intro">Cada trajetória tem suas particularidades. O primeiro passo é entender a sua.</p></div>
      </div>
      <div className="practice-list">{areas.map(area=><article className="practice-row" key={area.number}>
        <div className="practice-label"><span className="practice-number">{area.number}</span><p>{area.label}</p></div>
        <h3>{area.title}</h3>
        <div className="practice-copy"><p>{area.text}</p><span>{area.detail}</span></div>
      </article>)}</div>
      <a className="editorial-text-link practice-link" href="#contato">Conversar sobre minha trajetória <ArrowUpRight size={17} aria-hidden="true" /></a>
    </div>
  </section>;
}
