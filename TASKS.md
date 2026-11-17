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

- [x] Criar `package.json` conforme a SPEC §12.1.
- [x] Commitar `package-lock.json` junto com a fatia.
- [x] Configurar Astro 7, TypeScript 6, `astro.config.mjs` e `tsconfig.json`.
- [x] Configurar Vitest, Playwright e `@axe-core/playwright`.
- [x] Criar `src/styles/tokens.css` com aliases semânticos e sem nomes de marca/fontes proprietárias.
- [x] Criar layout global, skip link, navegação com 6 links e rodapé.
- [x] Criar metadados, canonical, Open Graph sem imagem e favicon.
- [x] Garantir que `airbnb-design-design.md` e `airbnb-design-tokens.css` não vão para o `dist/`.

## 2. Dados e validação

- [x] Implementar schema Zod do envelope, times, jogadoras, partidas, eventos, `finalists`, `drawOrder`, `friendly` e `notices`.
- [x] Implementar leitura de `data/2026/copa.yaml` com mensagens de erro claras.
- [x] Implementar validação semântica e agregação de erros (`VAL-*`).
- [x] Implementar avisos não bloqueantes (`VAL-W*`).
- [x] Implementar `npm run validate` com resumo em Markdown e exit code correto.
- [x] Criar fixture válido com 3 times, `g1`…`g6`, final e amistoso.
- [x] Criar fixtures/factories inválidos para cada regra bloqueante.
- [x] Validar `g4` como `tb x ta` e simetria dos confrontos.

## 3. Domínio

- [x] Implementar `deriveScore` e `resolveMatchTeams`.
- [x] Implementar `buildStandings` e `rankTeams` com grupos de desempate.
- [x] Implementar confronto direto de dois jogos: pontos agregados, saldo agregado, ambos `finished` e W.O. 1x0.
- [x] Implementar pontos disciplinares e segundo amarelo (3 pontos).
- [x] Implementar `buildSuspensions` e bloqueio de eventos de suspensa.
- [x] Implementar `buildPlayerStats` (gols, assistências, gols contra, cartões).
- [x] Implementar `buildTeamStats` (grupo + final, V/E/D no tempo normal, `shootoutWins`/`shootoutLosses`, GP/GC/SG sem shootout, amistoso fora).
- [x] Implementar `buildFinalists`, `buildPodium` e validação de correção após a final.
- [x] Implementar `buildNextMatch`, últimos resultados e estados da Início.
- [x] Implementar `formatScore` e `formatScoreAccessible` (incluindo W.O. e shootout).

## 4. Páginas

- [x] Início: quatro estados, próximo jogo, últimos resultados, resumo e destaques.
- [x] Jogos: lista por data com 7 partidas oficiais; amistoso fora da lista.
- [x] Detalhe da partida: gols, assistências, cartões, W.O., shootout e desfalques.
- [x] Classificação: 13 colunas, provisória, badge “Sorteio” e explicação dos critérios.
- [x] Times: 3 cards, elenco ativo, badge <5, suspensão, histórico e estatísticas coletivas.
- [x] Estatísticas: artilharia, assistências, cartões e gols contra.
- [x] Fase final: “a definir”, card do amistoso antes da final e pódio de 3.
- [x] 404 e navegação sem Regulamento.
- [x] Nenhum card, rota ou link de 3º lugar.

## 5. Acessibilidade e design

- [x] Aplicar tokens de cor, tipografia, espaço, raio, sombra e movimento.
- [x] Validar contraste WCAG AA dos pares usados.
- [x] Garantir foco visível, teclado, skip link e menu `<details>`.
- [x] Tabelas com `caption`, `th` e `scope`; rolagem acessível em tabelas largas.
- [x] 320px sem overflow horizontal da página.
- [x] Respeitar `prefers-reduced-motion`.
- [x] Não transmitir estado apenas por cor.
- [x] Verificar zoom 200% (teste automatizado em viewport de 640px).
- [ ] Verificar com leitor de tela (NVDA/VoiceOver).

## 6. Testes

- [x] TST-001…TST-009 e TST-011…TST-016: classificação, desempate e W.O.
- [x] TST-010: critério “menos gols contra” é redundante quando SG e GP empatam (GC = GP − SG); omitido com justificativa.
- [x] TST-105 e TST-110: empate provisório e W.O. no confronto direto.
- [x] TST-017…TST-027 e TST-112: cartões e suspensão.
- [x] TST-028…TST-038: gols, assistências, pênaltis e estatísticas individuais.
- [x] TST-115: estatísticas coletivas com shootout.
- [x] TST-039…TST-048: elenco e elegibilidade.
- [x] TST-049…TST-065, TST-107, TST-109 e TST-116: validação, schema, fase final e simetria.
- [x] TST-066…TST-083 e TST-106/108/113/114: interface, estados e componentes.
- [x] TST-084…TST-094: build, segurança e determinismo.
- [x] TST-095…TST-103: acessibilidade e layout automatizados (axe, foco, teclado, 320px, tabela rolável, reduced motion, sem cor exclusiva, semântica e zoom 200%).
- [x] Smoke cross-browser em Firefox e WebKit (desktop e iOS) para rotas, menu, skip link e tabela larga.
- [x] Checagem de links internos e de `javascript:` no build.
- [ ] TST-104: leitores de tela (NVDA/VoiceOver), verificação manual.
- [x] `npm run verify` completo.

## 7. Publicação

- [x] Configurar GitHub Actions com permissões mínimas.
- [x] Habilitar GitHub Pages em Settings → Pages → Source: GitHub Actions.
- [x] Validar o deploy em `https://grazielevasconcelos.github.io/futsal-cup/`.
- [x] Verificar hard refresh após o deploy (HTML e CSS conferidos com cache-busting).
- [x] Documentar rollback por commit.
- [x] Confirmar ausência de segredos, analytics e chamadas externas.

## 8. Antes da primeira partida

- [ ] `data/2026/copa.yaml` com times, elencos e calendário reais.
- [ ] Horários, nomes dos times e local definidos pela organização.
- [ ] Amistoso definido ou `friendly: null`.
- [ ] `npm run validate` sem erros; avisos revisados.
- [x] Site publicado e acessível antes de 24/11/2026.
- [ ] Checklist manual do Apêndice D assinado (leitor de tela, Safari/Firefox/Edge e Lighthouse).
