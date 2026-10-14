import { BrandLogo } from './BrandLogo';
interface Props { onNavigateContactPage?: () => void }
export function Footer({onNavigateContactPage}:Props) {
  return <footer className="editorial-footer"><div className="editorial-container">
    <div className="footer-main"><a href="#inicio" aria-label="Antônio Andreoli — voltar ao início"><BrandLogo variant="light" symbolSize={32} /></a><nav aria-label="Navegação do rodapé"><a href="#atuacao">Atuação</a><a href="#atendimento">Atendimento</a><a href="#contato">Contato</a>{onNavigateContactPage&&<button onClick={onNavigateContactPage}>Cartão digital</button>}</nav></div>
    <div className="footer-meta"><p>© {new Date().getFullYear()} Antônio Andreoli</p><p>Direito Previdenciário · OAB/RJ 064430</p></div>
  </div></footer>;
}
