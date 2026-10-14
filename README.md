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
