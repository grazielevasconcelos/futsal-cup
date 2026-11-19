# PLAN — Copa de Futsal Feminino Vila Mariana 2026

Plano de execução do MVP, subordinado ao `PRD.md`, ao `AGENTS.md` e à `SPEC.md`. O checklist detalhado está em `TASKS.md`.

## Objetivo

Publicar, até 24/11/2026, o site estático e somente leitura da Copa de Futsal Feminino Vila Mariana 2026, com 3 times, 6 partidas de grupo em turno e returno, semifinal 2º x 3º, final 1º x vencedora da semifinal, vantagem do empate e pódio de 3. Não há amistoso, disputa de 3º lugar, prorrogação, pênaltis ou shootout.

## Princípios

- A fonte única de dados é `data/2026/copa.yaml`; nada de resultados ou classificação no HTML.
- Regras de negócio em funções puras, determinísticas e testáveis.
- Sem JavaScript no cliente, sem backend, sem login e sem analytics.
- Mobile-first, WCAG 2.2 AA, 320px sem overflow e tokens do projeto.
- Validação bloqueante antes do build; o site anterior permanece no ar em caso de falha.
- Commits em Conventional Commits.

## Fatias de execução

### Fatia 1 — Fundação

- Criar o projeto Astro 7 + TypeScript 6 com o `package.json` da SPEC §12.1.
- Configurar `astro.config.mjs`, `tsconfig.json`, Vitest, Playwright e o workflow do GitHub Actions.
- Criar `src/styles/tokens.css` com aliases semânticos; não importar `airbnb-design-tokens.css` integralmente.
- Criar layout global, navegação com 6 links, skip link, rodapé e metadados.
- Critério: `npm ci`, `npm run check` e `npm run build` funcionam; nenhuma rota de Regulamento.

### Fatia 2 — Dados e validação

- Implementar o schema Zod do envelope, times, jogadoras, partidas, eventos, `semifinalists`, `finalists`, `drawOrder` e `notices`, sem `friendly`/`shootout`.
- Implementar o pipeline YAML → schema → validação semântica → erros agregados.
- Implementar `npm run validate` com resumo em Markdown e exit code correto.
- Criar `data/2026/copa.yaml` de exemplo com 3 times e 8 partidas (`g1`…`g6`, `semi`, `final`).
- Critério: fixtures válidas passam; todas as `VAL-*` bloqueantes têm teste; avisos não bloqueiam.

### Fatia 3 — Domínio

- Implementar `deriveScore`, `resolveMatchTeams`, `buildStandings`, `rankTeams` com confronto direto de dois jogos, cartões, suspensões, `buildPlayerStats`, `buildTeamStats`, `buildPlayoffs`, `buildPodium` e `buildNextMatch`.
- Implementar `formatScore`, `formatScoreAccessible`, `cardSummary` e os cinco estados de UI.
- Critério: testes unitários de pontuação, desempate, W.O., vantagem do empate, cartões, suspensão, estatísticas e pódio passam.

### Fatia 4 — Páginas

- Início nos cinco estados (`beforeCup`, `duringGroup`, `groupComplete`, `semiComplete`, `afterFinal`).
- Jogos: lista por data (5 datas) e detalhe com eventos, W.O. e desfalques; sem shootout.
- Classificação: 13 colunas, provisória, sorteio e critérios.
- Times: elenco ativo, badge <5, suspensão, histórico e estatísticas coletivas das 8 partidas, sem colunas de pênaltis.
- Estatísticas: artilharia, assistências, cartões e gols contra.
- Fase final: semifinal, final, vantagem do empate textual, card da final antes da semi com o 1º e “Vencedora da semifinal”, pódio de 3.
- 404 e metadados.
- Critério: todas as rotas estáticas, sem JS de cliente e sem overflow em 320px.

### Fatia 5 — Qualidade e publicação

- Rodar `npm run verify` completo.
- Verificar contraste, foco, teclado, `prefers-reduced-motion`, zoom 200% e leitor de tela.
- Verificar ausência de termos proibidos, fontes proprietárias, fotos e dados pessoais no `dist/`.
- Habilitar GitHub Pages e validar o deploy.
- Critério: CI verde, site publicado e checklist do Apêndice D assinado.

### Fatia 6 — Cobertura pendente

- Fechar os testes de elenco e elegibilidade `TST-039`…`TST-048` em dados e domínio.
- Cobrir o badge “Elenco em formação” (`TST-042`) com teste de componente.
- Cobrir os três estados da Fase final (`TST-078`) com teste de componente.
- Cobrir lista de jogos por data (`TST-071`), detalhe da partida (`TST-072`…`TST-074`) e página do time (`TST-076`).
- Critério: `TST-039`…`TST-048` e `TST-066`…`TST-083` cobertos por testes automatizados; `TST-104` permanece manual.

### Fatia 7 — Compatibilidade e CI

- Adicionar smoke cross-browser em Firefox, WebKit desktop e WebKit mobile (Safari/iOS) para rotas, menu móvel, skip link e tabela larga.
- Instalar Chromium, Firefox e WebKit no workflow e documentar a matriz.
- Adicionar checagem de links internos e de `javascript:` no `scripts/check-build.ts`.
- Critério: CI passa nos três motores (Chromium, Firefox e WebKit); link interno quebrado falha o build; a conferência manual de navegadores fica restrita a dispositivos e inspeção visual.

### Fatia 8 — Fonte pública pré-competição

- Substituir o fixture de temporada encerrada em `data/2026/copa.yaml` por uma fonte pré-competição: 3 times provisórios, elencos vazios, 7 partidas `scheduled`, sem eventos, W.O., shootout, finalistas, sorteio ou amistoso.
- Preservar a temporada concluída em `tests/fixtures/valida.yaml` e usá-la nos testes de domínio, componentes e no build de teste do E2E.
- Separar `dist/` (produção) de `dist-test/` (E2E), sem publicar dados de exemplo.
- Critério: `npm run validate` sem erros e com avisos de elenco; `npm run verify` passa; a fonte pública não contém resultados nem elencos fictícios; o build de produção continua sem JS de cliente.

### Fatia 9 — Migração para o formato v2.0

- Atualizar `data/2026/copa.yaml` para 8 partidas: adicionar `semi`, manter `final`, preencher `semifinalists`/`finalists` como `null` antes da competição e remover `shootout`/`friendly`.
- Atualizar schema, validação, tipos e domínio: snapshots `semifinalists`/`finalists`, `winnerOf` com vantagem do empate, 3ª colocada como perdedora da semifinal e suspensões pelo caminho real do time.
- Atualizar UI, fixture, testes e `check-build` para semifinal, final, 8 cards, 5 datas, ausência de amistoso/shootout e rotas `jogos/semi/`.
- Critério: `npm run verify` passa; build de produção com 8 partidas; nenhuma referência a amistoso, shootout, 3º lugar ou 4º lugar em dados, UI ou `dist/`.

## Marcos

| Data | Marco |
|---|---|
| 12/11/2026 | PRD v1.1, SPEC v1.2 e documentos alinhados |
| 18/11/2026 | PRD/SPEC/AGENTS v2.0 e migração do formato |
| 18–20/11/2026 | Implementação |
| 21–23/11/2026 | Testes, dados de exemplo e congelamento |
| 24/11/2026 | Primeira rodada |
| 26/11/2026 | Segunda rodada |
| 01/12/2026 | Terceira rodada |
| 02/12/2026 | Semifinal |
| 03/12/2026 | Final |
| 04/12/2026 | Retrospectiva |

## Riscos de execução

- **Prazo curto:** congelar escopo e priorizar as fatias 1–3 antes da UI.
- **Complexidade do desempate:** implementar e testar o confronto direto de dois jogos primeiro.
- **Dados reais incompletos:** manter o fixture válido e permitir avisos para elencos <7.
- **Acessibilidade:** testar 320px, foco e contraste a cada página, não só no final.
- **Publicação:** validar o workflow em um branch de teste antes de habilitar o Pages.

## Definição de pronto

- `npm run verify` passa localmente e no CI.
- `data/2026/copa.yaml` válido, com 3 times e 8 partidas (`g1`…`g6`, `semi`, `final`), sem amistoso ou shootout.
- Nenhuma rota/link/placeholder de Regulamento, amistoso ou 3º lugar; a 3ª colocada é a perdedora da semifinal.
- Nenhum JS de cliente, termo proibido, fonte proprietária, foto ou dado pessoal no `dist/`.
- Site publicado no GitHub Pages e acessível antes de 24/11/2026.
