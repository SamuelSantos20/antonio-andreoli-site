import { ArrowUpRight } from 'lucide-react';
import { getWhatsappLink, getOabFormatted, type ProfessionalConfig } from '../config/professional';
interface Props { config: ProfessionalConfig; onSpeakWithAntonio: () => void }
const steps = [
  {number:'01', title:'Conte sua história.', text:'Compartilhe sua dúvida e o momento da sua vida profissional. A conversa começa pela escuta.'},
  {number:'02', title:'Organize as informações.', text:'Reúna carteiras de trabalho, registros do CNIS e comprovantes disponíveis. Cada detalhe ajuda a entender sua trajetória.'},
  {number:'03', title:'Entenda o caminho.', text:'Conheça sua situação e os próximos passos, com explicações claras sobre documentos e procedimentos.'},
];
export function AtendimentoSection({config}:Props) {
  return <section id="atendimento" aria-labelledby="atendimento-heading" className="editorial-section process-section">
    <div className="editorial-container">
      <div className="process-heading">
        <p className="section-kicker"><span>02</span> COMO COMEÇAMOS</p>
        <h2 id="atendimento-heading">Antes de orientar,<br /><em>ouvir.</em></h2>
        <p className="process-intro">Uma conversa.<br />Um passo de cada vez.</p>
      </div>
      <ol className="process-steps">{steps.map(step=><li key={step.number}>
        <span className="process-number">{step.number}</span><h3>{step.title}</h3><p>{step.text}</p>
      </li>)}</ol>
      <div className="process-bottom"><p>Atendimento com Antônio Andreoli<br /><span>{getOabFormatted(config)}</span></p><a href={getWhatsappLink(config)} target="_blank" rel="noopener noreferrer" className="editorial-button editorial-button--light">Iniciar uma conversa <ArrowUpRight size={19} aria-hidden="true" /></a></div>
    </div>
  </section>;
}
