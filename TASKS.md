# TASKS — Copa de Futsal Feminino Vila Mariana 2026

Checklist de execução do MVP. Marque apenas o que estiver realmente concluído.

## 0. Documentação e alinhamento

- [x] Atualizar `PRD.md` para v1.1 (3 times, 7 partidas, calendário, amistoso, W.O., `finalists`, `drawOrder`, estatísticas com shootout).
- [x] Atualizar `AGENTS.md` para v1.1 (regras, design, validação, comandos e testes).
- [x] Atualizar `SPEC.md` para v1.2 (g4 `tb x ta`, `buildTeamStats`, TST-115/116, §15/§17).
- [x] Criar `docs/decisoes-v1.1.md` como reconstrução documentada.
- [x] Criar `PLAN.md` e `TASKS.md`.
- [x] Aprovar formalmente o PRD v1.1 (§18).

## 1. Fundação

- [ ] Criar `package.json` conforme a SPEC §12.1 e commitar `package-lock.json`.
- [ ] Configurar Astro 7, TypeScript 6, `astro.config.mjs` e `tsconfig.json`.
- [ ] Configurar Vitest, Playwright e `@axe-core/playwright`.
- [ ] Criar `src/styles/tokens.css` com aliases semânticos e sem nomes de marca/fontes proprietárias.
- [ ] Criar layout global, skip link, navegação com 6 links e rodapé.
- [ ] Criar metadados, canonical, Open Graph sem imagem e favicon.
- [ ] Garantir que `airbnb-design-design.md` e `airbnb-design-tokens.css` não vão para o `dist/`.

## 2. Dados e validação

- [ ] Implementar schema Zod do envelope, times, jogadoras, partidas, eventos, `finalists`, `drawOrder`, `friendly` e `notices`.
- [ ] Implementar leitura de `data/2026/copa.yaml` com mensagens de erro claras.
- [ ] Implementar validação semântica e agregação de erros (`VAL-*`).
- [ ] Implementar avisos não bloqueantes (`VAL-W*`).
- [ ] Implementar `npm run validate` com resumo em Markdown e exit code correto.
- [ ] Criar fixture válido com 3 times, `g1`…`g6`, final e amistoso.
- [ ] Criar fixtures inválidos para cada regra bloqueante.
- [ ] Validar `g4` como `tb x ta` e simetria dos confrontos.

## 3. Domínio

- [ ] Implementar `deriveScore` e `resolveMatchTeams`.
- [ ] Implementar `buildStandings` e `rankTeams` com grupos de desempate.
- [ ] Implementar confronto direto de dois jogos: pontos agregados, saldo agregado, ambos `finished` e W.O. 1x0.
- [ ] Implementar pontos disciplinares e segundo amarelo (3 pontos).
- [ ] Implementar `buildSuspensions` e bloqueio de eventos de suspensa.
- [ ] Implementar `buildPlayerStats` (gols, assistências, gols contra, cartões).
- [ ] Implementar `buildTeamStats` (grupo + final, V/E/D no tempo normal, `shootoutWins`/`shootoutLosses`, GP/GC/SG sem shootout, amistoso fora).
- [ ] Implementar `buildFinalists`, `buildPodium` e validação de correção após a final.
- [ ] Implementar `buildNextMatch`, últimos resultados e estados da Início.
- [ ] Implementar `formatScore` e `formatScoreAccessible` (incluindo W.O. e shootout).

## 4. Páginas

- [ ] Início: quatro estados, próximo jogo, últimos resultados, resumo e destaques.
- [ ] Jogos: lista por data com 7 partidas oficiais; amistoso fora da lista.
- [ ] Detalhe da partida: gols, assistências, cartões, W.O., shootout e desfalques.
- [ ] Classificação: 13 colunas, provisória, badge “Sorteio” e explicação dos critérios.
- [ ] Times: 3 cards, elenco ativo, badge <5, suspensão, histórico e estatísticas coletivas.
- [ ] Estatísticas: artilharia, assistências, cartões e gols contra.
- [ ] Fase final: “a definir”, card do amistoso antes da final e pódio de 3.
- [ ] 404 e navegação sem Regulamento.
- [ ] Nenhum card, rota ou link de 3º lugar.

## 5. Acessibilidade e design

- [ ] Aplicar tokens de cor, tipografia, espaço, raio, sombra e movimento.
- [ ] Validar contraste WCAG AA dos pares usados.
- [ ] Garantir foco visível, teclado, skip link e menu `<details>`.
- [ ] Tabelas com `caption`, `th` e `scope`; rolagem acessível em tabelas largas.
- [ ] 320px sem overflow horizontal da página.
- [ ] Respeitar `prefers-reduced-motion`.
- [ ] Não transmitir estado apenas por cor.
- [ ] Verificar zoom 200% e leitor de tela.

## 6. Testes

- [ ] TST-001…TST-016: classificação, desempate e W.O.
- [ ] TST-105 e TST-110: empate provisório e W.O. no confronto direto.
- [ ] TST-017…TST-027 e TST-112: cartões e suspensão.
- [ ] TST-028…TST-038: gols, assistências, pênaltis e estatísticas individuais.
- [ ] TST-115: estatísticas coletivas com shootout.
- [ ] TST-039…TST-048: elenco e elegibilidade.
- [ ] TST-049…TST-065, TST-107, TST-109 e TST-116: validação, schema, fase final e simetria.
- [ ] TST-066…TST-083 e TST-106/108/113/114: interface e estados.
- [ ] TST-084…TST-094: build, segurança e determinismo.
- [ ] TST-095…TST-104: acessibilidade e layout.
- [ ] `npm run verify` completo.

## 7. Publicação

- [ ] Configurar GitHub Actions com permissões mínimas.
- [ ] Habilitar GitHub Pages em Settings → Pages → Source: GitHub Actions.
- [ ] Validar o deploy em `https://grazielevasconcelos.github.io/futsal-cup/`.
- [ ] Verificar hard refresh após o deploy.
- [ ] Documentar rollback por commit.
- [ ] Confirmar ausência de segredos, analytics e chamadas externas.

## 8. Antes da primeira partida

- [ ] `data/2026/copa.yaml` com times, elencos e calendário reais.
- [ ] Horários, nomes dos times e local definidos pela organização.
- [ ] Amistoso definido ou `friendly: null`.
- [ ] `npm run validate` sem erros; avisos revisados.
- [ ] Site publicado e acessível antes de 24/11/2026.
- [ ] Checklist manual do Apêndice D assinado.
