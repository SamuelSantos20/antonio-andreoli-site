import { BrandLogo } from './BrandLogo';
import { focusSection } from '../utils/navigation';

interface Props {
  onNavigateContactPage?: () => void;
}

export function Footer({ onNavigateContactPage }: Props) {
  return (
    <footer className="editorial-footer" onClick={event => {
      const link = (event.target as Element).closest<HTMLAnchorElement>('a[href^="#"]');
      if (link) {
        event.preventDefault();
        focusSection(link.hash.slice(1), true);
      }
    }}>
      <div className="editorial-container">
        <div className="footer-main">
          <a href="#inicio" aria-label="Antônio Andreoli — voltar ao início">
            <BrandLogo variant="light" symbolSize={32} />
          </a>
          <nav aria-label="Navegação do rodapé">
            <a href="#atuacao">Atuação</a>
            <a href="#atendimento">Atendimento</a>
            <a href="#pilares">Sobre</a>
            <a href="#duvidas">Dúvidas</a>
            <a href="#contato">Contato</a>
            {onNavigateContactPage && (
              <button type="button" onClick={onNavigateContactPage}>
                Cartão digital
              </button>
            )}
          </nav>
        </div>
        <div className="footer-meta">
          <p>© {new Date().getFullYear()} Antônio Andreoli · Todos os direitos reservados</p>
          <p>Direito Previdenciário · OAB/RJ 064430 · Nova Iguaçu — RJ</p>
        </div>
      </div>
    </footer>
  );
}
