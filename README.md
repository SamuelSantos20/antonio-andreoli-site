# Antônio Andreoli — Direito Previdenciário

[Ver o site no GitHub Pages](https://samuelsantos20.github.io/antonio-andreoli-site/)

Site institucional com composição aberta, caneta em 3D e uma sequência de escrita controlada pela rolagem. Inclui atendimento, áreas de atuação, contato por WhatsApp e cartão digital para salvar na agenda.

## Executar localmente

Requer Node.js 24 e pnpm.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Prévia local: http://127.0.0.1:3002/

## Atualizar o GitHub Pages

O Pages publica a pasta `docs` da branch `main`. Ela contém a versão compilada para o caminho `/antonio-andreoli-site/`.

```sh
pnpm typecheck
pnpm check:film
pnpm check:contact
pnpm check:render
pnpm check:reviews
pnpm exec vite build --base /antonio-andreoli-site/ --outDir docs
```

Preserve `docs/.nojekyll` e envie as alterações de código e `docs` para a branch `main`. A navegação do cartão digital usa hash para permitir abrir e recarregar a página em hospedagem estática.

## Avaliações Google

A seção está preparada para avaliações reais e permanece oculta enquanto não houver link público configurado. O GitHub Pages hospeda arquivos estáticos; consultas automáticas à Places API precisam de um backend separado. O servidor Node opcional está incluído para outra hospedagem, com configurações privadas em `.env.local` conforme `.env.example`.

## Movimento e acessibilidade

A escrita acompanha a rolagem nos dois sentidos. Com movimento reduzido, a cena mostra a imagem final. A mão no filme é ilustrativa e não representa Antônio. O contato inclui endereço e horários informados pelo responsável.

## Revisão de 15/10/2026

Integração das melhorias do Argon, revisadas e corrigidas localmente: textos auxiliares maiores, FAQ, localização no Maps, copiar telefone/endereço com avisos de erro, compartilhamento do cartão, ligação para o número confirmado, menu com rótulo e seção atual, foco ao navegar e instruções para abrir o contato baixado.

Os controles da apresentação cabem em celulares pequenos. Em janelas de até 560 px de altura, a abertura usa fluxo natural e a imagem final para permitir a leitura sem prender a rolagem. O menu permite rolagem interna em paisagem. A preferência de movimento reduzido continua sendo respeitada.

TypeScript, os quatro scripts de verificação e os builds passaram. A versão compilada foi conferida em nove viewports, com testes de teclado, rota direta e recarga do cartão, download do vCard, falhas de cópia e escrita reversível. A importação final na agenda e o diálogo nativo de compartilhamento dependem do aparelho.

### Fundo da sequência de escrita

A sequência agora preenche toda a seção de apresentação, com proporção preservada e a frase protegida do corte. No celular, uma amostra limpa do papel completa o fundo, integrando o quadro nítido sem um painel central. O pôster compartilha o cálculo de enquadramento. A verificação do filme inclui 20 combinações de geometria efetivamente utilizadas pelo renderizador.

### Animações de aparição por seção

As seções e o rodapé têm entradas com ritmos próprios: títulos sobem até 60px, as colunas de apresentação entram pelas laterais no desktop e os serviços aparecem em sequência. No celular e em janelas baixas, o movimento é menor e vertical. A navegação por teclado e por âncoras revela o destino imediatamente; a opção de reduzir movimento cancela os efeitos. Os perfis ficam em `src/data/revealMotion.ts` e a execução em `src/hooks/useScrollReveal.ts`.
