import { getOabFormatted, type ProfessionalConfig } from '../config/professional';
import { BrandSymbol } from './BrandSymbol';
interface Props { config: ProfessionalConfig }
const values=[
  {title:'Escuta atenta',text:'Acolher os detalhes da sua história, seus vínculos e as particularidades da sua vida de trabalho.'},
  {title:'Informação clara',text:'Explicar os documentos, os procedimentos e cada etapa de forma compreensível.'},
  {title:'Atenção aos próximos passos',text:'Organizar o que precisa ser feito, com orientações práticas e respeito ao seu momento.'},
];
export function PilaresSection({config}:Props) {
  return <section id="pilares" aria-labelledby="pilares-heading" className="editorial-section about-section">
    <div className="editorial-container">
      <div className="about-heading">
        <div><p className="section-kicker"><span>03</span> QUEM VAI OUVIR VOCÊ</p><h2 id="pilares-heading">{config.nomeExibicao.replace(' ','\n')}</h2><p className="about-role">{config.descricao}<br /><span>{getOabFormatted(config)}</span></p></div>
        <div className="about-copy"><BrandSymbol size={54} color="#183f35" /><p className="about-lead">Uma prática jurídica feita<br />de atenção e <em>clareza.</em></p><p>Orientação em aposentadorias, benefícios do INSS e planejamento previdenciário. Um atendimento que considera a pessoa e sua trajetória, com informação acessível e respeito ao sigilo profissional.</p></div>
      </div>
      <div className="about-values">{values.map(value=><div key={value.title}><h3>{value.title}</h3><p>{value.text}</p></div>)}</div>
    </div>
  </section>;
}
