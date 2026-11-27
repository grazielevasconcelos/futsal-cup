# TASKS — Copa de Futsal Feminino Vila Mariana 2026

Checklist histórico de execução do MVP; não use para inferir o estado atual nem continue marcando tarefas sem revisar a SPEC vigente.

> **Registro histórico:** este checklist reúne o planejamento e a execução de etapas anteriores (v1.1–v2.3). Os itens e caixas refletem registros daquela execução e não são uma descrição confiável do estado atual da competição ou do repositório. Para as regras vigentes, consulte `PRD.md`, `SPEC.md` e `AGENTS.md`; para o estado dos dados, consulte `data/2026/copa.yaml`.

As seções 0–8 registram a implementação histórica da v1.1. A seção 9 acompanha a migração para o formato v2.0 (8 partidas, semifinal, final e vantagem do empate), que substitui as decisões anteriores. A seção 10 registra o tema claro/escuro da v2.1; as seções seguintes registram os passes v2.2 e v2.3.

## 0. Documentação e alinhamento (histórico v1.1)

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
- [x] Implementar confronto direto de dois jogos: pontos agregados, saldo agregado, ambos `finished` e W.O. 3x0.
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

- [x] `data/2026/copa.yaml` válido no estado pré-competição, com as 7 partidas agendadas e sem resultados fictícios.
- [ ] Times, elencos e calendário reais definidos pela organização.
- [ ] Horários, nomes dos times e local definidos pela organização.
- [x] Amistoso definido ou `friendly: null`.
- [x] `npm run validate` sem erros; avisos de elenco vazio revisados.
- [x] E2E isolado em `dist-test/` com a fixture concluída; build de produção sem dados de exemplo.
- [x] Site publicado e acessível antes de 24/11/2026.
- [ ] Checklist manual do Apêndice D assinado (leitor de tela, Safari/Firefox/Edge e Lighthouse).

## 9. Migração para o formato v2.0

### 9.1 Documentação

- [x] Atualizar `PRD.md` para v2.0 (8 partidas, semifinal 2º x 3º, final 1º x vencedora, vantagem do empate, 3ª colocada, sem amistoso/shootout).
- [x] Atualizar `AGENTS.md` para v2.0.
- [x] Atualizar `SPEC.md` para v2.0 (schema, algoritmos, validação, UI, testes, apêndices e ADRs).
- [x] Criar `docs/decisoes-v2.0.md` e marcar `context.md`/`docs/decisoes-v1.1.md` como históricos.
- [x] Atualizar `README.md`, `PLAN.md` e `TASKS.md`.
- [x] Commits `docs(prd)`, `docs(agents)`, `docs(spec)` e `docs:`.

### 9.2 Dados e validação

- [x] Adicionar `semi` (03/12/2026) e remover `shootout`/`friendly` de `data/2026/copa.yaml`.
- [x] Adicionar `semifinalists` e `finalists` ao envelope; ambos `null` antes da competição.
- [x] Atualizar `schema.ts` para 8 IDs, `stage: semi`, snapshots e proibição de campos antigos.
- [x] Atualizar `validate.ts`: conjunto de partidas, progressão, snapshots, W.O. no mata-mata, suspensões e migração.
- [x] Atualizar fixture `tests/fixtures/valida.yaml`: TC 1ª, TA 2ª, TB 3ª; semi TA 1x2 TB; final TC 1x1 TB; TC campeã por vantagem.
- [x] Garantir suspensões da fixture: TB `p-014` vermelho em g6 cumpre na semi; TC `p-016` 2º amarelo em g5 cumpre em g6.

### 9.3 Domínio

- [x] Implementar `PlayoffSnapshots`, `resolveMatchTeams` e `deriveScore` para `semi`/`final`.
- [x] Implementar `winnerOf` com W.O. e vantagem do empate; `semi` empata para o 2º, `final` empata para o 1º.
- [x] Renomear/reescrever `finalists.ts` como `playoffs.ts`; 3ª colocada = perdedora da semifinal; pódio de 3.
- [x] Atualizar `discipline.ts` para o caminho real do time (1º sem semi; vermelho na semi só conta na final se avançar; vermelho na final sem efeito).
- [x] Atualizar `stats.ts` para grupo + semi + final, sem `shootoutWins`/`shootoutLosses`.
- [x] Atualizar `format/match.ts`, `format/events.ts` e `format/suspension.ts`; remover `friendly.ts`.

### 9.4 UI

- [x] Remover `FriendlyCard.astro` e estilos do amistoso.
- [x] Atualizar Início para cinco estados e cards de semifinal/final.
- [x] Atualizar Jogos e detalhe para `semi`/`final`, vantagem textual e ausência de shootout.
- [x] Atualizar Fase final: semifinal 2º x 3º, final 1º x vencedora, vantagem do empate, 3ª colocada.
- [x] Atualizar Times/Estatísticas para 8 partidas e sem colunas de pênaltis.
- [x] Remover rotas/links de amistoso e 3º lugar.

### 9.5 Testes e build

- [x] Atualizar factories e testes unitários/de dados para snapshots, vantagem do empate, W.O. no mata-mata e suspensões.
- [x] Atualizar E2E: 8 cards, 4 datas, semifinal, final, 3ª colocada, ausência de amistoso/shootout.
- [x] Atualizar `scripts/check-build.ts`: rota `jogos/semi/`, termos proibidos e ausência de JS externo (o script inline de tema é permitido a partir da v2.1).
- [x] Rodar `npm run validate`, `npm run check`, `npm test`, `npm run build`, `npm run build:test`, `npm run test:build`, `npm run test:e2e` e `npm run verify`.
- [x] Commits `feat(dados)`, `feat(dominio)`, `feat(ui)`, `test:` e `chore(build)`.

## 10. Tema claro/escuro (v2.1)

### 10.1 Documentação

- [x] Atualizar `PRD.md` para v2.1 (tema claro padrão, alternância acessível, preferência local e critérios de aceite).
- [x] Atualizar `SPEC.md` para v2.1 (script inline de tema, tokens escuros, contraste, impressão, orçamento e testes).
- [x] Atualizar `AGENTS.md` (exceção de JavaScript limitada ao tema, aliases claros/escuros e contraste nos dois temas).
- [x] Criar `docs/decisoes-v2.1.md` e citá-lo no PRD, na SPEC e no README.
- [x] Atualizar `PLAN.md` e `TASKS.md`.
- [ ] Commits `feat(ui)`, `test:` e `docs:` do tema criados após a revisão final.

### 10.2 Implementação

- [x] Adicionar `:root[data-theme="dark"]` em `src/styles/tokens.css`, com cores e sombras próprias.
- [x] Fixar o tema claro na impressão, independentemente da preferência de tela.
- [x] Inicializar `data-theme` em `BaseLayout.astro` antes do CSS, lendo `futsal-cup-theme` do `localStorage`.
- [x] Adicionar botão acessível de tema no cabeçalho, com `aria-pressed` e ícones sol/lua decorativos.
- [x] Alternar e persistir o tema com um único script inline, sem rede, cookies ou frameworks.
- [x] Garantir fallback claro quando a leitura falhar e alternância funcional quando a gravação falhar.

### 10.3 Testes e build

- [x] Validar tokens e contraste AA dos pares claros e escuros (`tests/unit/tokens.test.ts`).
- [x] Cobrir tema padrão, alternância, persistência entre rotas, teclado, falha de armazenamento e impressão (`tests/e2e/quality.spec.ts`).
- [x] Rodar axe nas rotas principais nos temas claro e escuro.
- [x] Permitir no `scripts/check-build.ts` exatamente um script inline de tema ≤1 KB gzip e nenhum JS externo.
- [x] Rodar `npm run verify` completo.

## 11. Passe visual (v2.2)

### 11.1 Documentação e tokens

- [x] Adicionar `--tracking-display`, `--tracking-heading`, `--shortcut-min`, `--team-logo-size`, `--team-logo-size-lg`, `--accent-bar-width` e `--accent-bar-height`.
- [x] Atualizar `SPEC.md` §10.2, §11.2, §11.4, §11.6 e §11.8.
- [x] Atualizar `AGENTS.md` e criar `docs/decisoes-v2.2.md`.
- [x] Atualizar `tests/unit/tokens.test.ts` para os novos tokens.

### 11.2 Interface

- [x] Adicionar barra de gradiente, eyebrow em caixa alta, tracking, `text-wrap` e números tabulares.
- [x] Adicionar `:active`, `:focus-within`, link estendido nos cards e chevrons de navegação.
- [x] Ajustar gaps, badges, tabelas, estados vazios e banner de avisos.
- [x] Criar painel de placar nos cards e no detalhe da partida.
- [x] Tornar o cabeçalho do time horizontal, reduzir o logo nos cards e manter estatísticas em 2 colunas.
- [x] Destacar a campeã no pódio e remover a seção duplicada na Início.
- [x] Ajustar atalhos para 1/2/3 colunas conforme a largura.

### 11.3 Validação

- [x] Capturar screenshots antes/depois em 320, 390, 768 e 1280, claro/escuro.
- [x] Rodar `npm run validate`, `npm run check`, `npm test`, `npm run build`, `npm run test:build`, `npm run test:e2e` e `npm run verify`.

## 12. Impressão e PDF (v2.3)

### 12.1 Documentação e tokens

- [x] Registrar a decisão v2.3: impressão CSS e guia nativo, sem JavaScript novo.
- [x] Alinhar PRD, SPEC, AGENTS e README com o escopo e contrato de impressão.
- [x] Definir escala tipográfica e logos de impressão nos tokens.

### 12.2 Interface e estilos

- [x] Criar `src/styles/print.css` e importar após as folhas de tela.
- [x] Adaptar grids, tabelas, navegação, rodapé e quebras para A4 retrato.
- [x] Adicionar guia `<details>` no rodapé e esconder o guia na impressão.
- [x] Marcar links de retorno/atalhos de navegação para ocultação no papel.

### 12.3 Testes e validação

- [x] Adicionar testes unitários para tokens, tabelas, paginação e regras CSS.
- [x] Adicionar testes E2E para tema claro, largura de tabela, grid e guia por teclado.
- [x] Rodar validação, check, Vitest, build, checagem de produção e suíte E2E em ambiente isolado.
- [x] Conferir PDFs gerados em Chromium, incluindo classificação e tema escuro.
