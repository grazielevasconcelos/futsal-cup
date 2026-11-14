# PLAN — Copa de Futsal Feminino Vila Mariana 2026

Plano de execução do MVP, subordinado ao `PRD.md`, ao `AGENTS.md` e à `SPEC.md`. O checklist detalhado está em `TASKS.md`.

## Objetivo

Publicar, até 24/11/2026, o site estático e somente leitura da Copa de Futsal Feminino Vila Mariana 2026, com 3 times, 6 partidas de grupo em turno e returno, final única, pódio de 3 e card informativo do amistoso do 3º colocado.

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

- Implementar o schema Zod do envelope, times, jogadoras, partidas, eventos, `finalists`, `drawOrder`, `friendly` e `notices`.
- Implementar o pipeline YAML → schema → validação semântica → erros agregados.
- Implementar `npm run validate` com resumo em Markdown e exit code correto.
- Criar `data/2026/copa.yaml` de exemplo com 3 times, 7 partidas e amistoso.
- Critério: fixtures válidas passam; todas as `VAL-*` bloqueantes têm teste; avisos não bloqueiam.

### Fatia 3 — Domínio

- Implementar `deriveScore`, `buildStandings`, `rankTeams` com confronto direto de dois jogos, cartões, suspensões, `buildPlayerStats`, `buildTeamStats`, `buildFinalists`, `buildPodium` e `buildNextMatch`.
- Implementar `formatScore`, `formatScoreAccessible`, `cardSummary` e estados de UI.
- Critério: testes unitários de pontuação, desempate, W.O., shootout, cartões, suspensão, estatísticas e pódio passam.

### Fatia 4 — Páginas

- Início nos quatro estados.
- Jogos: lista por data e detalhe com eventos, W.O., shootout e desfalques.
- Classificação: 13 colunas, provisória, sorteio e critérios.
- Times: elenco ativo, badge <5, suspensão, histórico e estatísticas coletivas com campanha nos pênaltis separada.
- Estatísticas: artilharia, assistências, cartões e gols contra.
- Fase final: “a definir”, card do amistoso antes da final e pódio de 3.
- 404 e metadados.
- Critério: todas as rotas estáticas, sem JS de cliente e sem overflow em 320px.

### Fatia 5 — Qualidade e publicação

- Rodar `npm run verify` completo.
- Verificar contraste, foco, teclado, `prefers-reduced-motion`, zoom 200% e leitor de tela.
- Verificar ausência de termos proibidos, fontes proprietárias, fotos e dados pessoais no `dist/`.
- Habilitar GitHub Pages e validar o deploy.
- Critério: CI verde, site publicado e checklist do Apêndice D assinado.

## Marcos

| Data | Marco |
|---|---|
| 12/11/2026 | PRD v1.1, SPEC v1.2 e documentos alinhados |
| 13–20/11/2026 | Implementação |
| 21–23/11/2026 | Testes, dados de exemplo e congelamento |
| 24/11/2026 | Primeira rodada |
| 26/11/2026 | Segunda rodada |
| 01/12/2026 | Terceira rodada |
| 03/12/2026 | Amistoso e final |
| 04/12/2026 | Retrospectiva |

## Riscos de execução

- **Prazo curto:** congelar escopo e priorizar as fatias 1–3 antes da UI.
- **Complexidade do desempate:** implementar e testar o confronto direto de dois jogos primeiro.
- **Dados reais incompletos:** manter o fixture válido e permitir avisos para elencos <7.
- **Acessibilidade:** testar 320px, foco e contraste a cada página, não só no final.
- **Publicação:** validar o workflow em um branch de teste antes de habilitar o Pages.

## Definição de pronto

- `npm run verify` passa localmente e no CI.
- `data/2026/copa.yaml` válido, com 3 times, 7 partidas e amistoso.
- Nenhuma rota/link/placeholder de Regulamento ou de 3º lugar.
- Nenhum JS de cliente, termo proibido, fonte proprietária, foto ou dado pessoal no `dist/`.
- Site publicado no GitHub Pages e acessível antes de 24/11/2026.
