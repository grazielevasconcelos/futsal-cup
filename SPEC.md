# SPEC — Copa de Futsal Feminino Vila Mariana 2026

**Versão:** 1.2  
**Data:** 12/11/2026  
**Status:** Aceito  
**Fonte de produto:** `PRD.md` v1.1 + `AGENTS.md` v1.1  
**Registro de decisões:** `docs/decisoes-v1.1.md` (reconstrução documentada)

Esta é a especificação técnica normativa do site. Ela está subordinada ao `PRD.md` (produto) e ao `AGENTS.md` (restrições do repositório). Em caso de conflito, prevalecem o PRD e o AGENTS; as interpretações e emendas estão registradas na §15. O alinhamento do PRD/AGENTS com a v1.1 foi aplicado e a aprovação formal do PRD (§18) está registrada. `PLAN.md` e `TASKS.md` são documentos de execução subordinados a esta SPEC.

> **Mudança de formato na v1.1 (12/11/2026):** a edição 2026 passa a ter **3 times fixos** (`ta`, `tb`, `tc`), **6 partidas classificatórias em turno e returno** e **final única** entre 1º e 2º. O 3º lugar é o 3º da classificação; **não há disputa de 3º x 4º nem 4º lugar**. O **amistoso do 3º colocado** é um metadado informativo (`friendly`), não uma partida. O confronto direto passa a considerar os **dois jogos** entre os times empatados. As emendas estão na §15 e foram refletidas no PRD v1.1 e no AGENTS v1.1.

---

## Sumário

1. [Metadados e convenções](#1-metadados-e-convenções)
2. [Contexto, escopo e não escopo](#2-contexto-escopo-e-não-escopo)
3. [Glossário](#3-glossário)
4. [Arquitetura](#4-arquitetura)
5. [Fonte de dados](#5-fonte-de-dados)
6. [Modelo de domínio](#6-modelo-de-domínio)
7. [Algoritmos](#7-algoritmos)
8. [Validação](#8-validação)
9. [Contratos internos](#9-contratos-internos)
10. [Interface](#10-interface)
11. [Design e acessibilidade](#11-design-e-acessibilidade)
12. [Build, CI e deploy](#12-build-ci-e-deploy)
13. [Testes](#13-testes)
14. [Rastreabilidade](#14-rastreabilidade)
15. [Emendas e interpretações](#15-emendas-e-interpretações)
16. [Riscos, premissas e questões em aberto](#16-riscos-premissas-e-questões-em-aberto)
17. [Definição de pronto](#17-definição-de-pronto)
- [Apêndice A — Exemplo YAML completo](#apêndice-a--exemplo-yaml-completo)
- [Apêndice B — Como atualizar a Copa](#apêndice-b--como-atualizar-a-copa)
- [Apêndice C — Catálogo de mensagens de validação](#apêndice-c--catálogo-de-mensagens-de-validação)
- [Apêndice D — Checklist manual de acessibilidade](#apêndice-d--checklist-manual-de-acessibilidade)
- [Apêndice E — Matriz de testes por regra](#apêndice-e--matriz-de-testes-por-regra)
- [Apêndice F — Procedimento do mapeamento privado de IDs](#apêndice-f--procedimento-do-mapeamento-privado-de-ids)
- [Apêndice G — ADRs resumidos](#apêndice-g--adrs-resumidos)

---

## 1. Metadados e convenções

### 1.1 Precedência e escopo

| Ordem | Fonte | Papel |
|---|---|---|
| 1 | `PRD.md` | Produto, regras da competição, critérios de aceite. |
| 2 | `AGENTS.md` | Restrições do repositório, design, acessibilidade, privacidade e testes. |
| 3 | `SPEC.md` | Decisões técnicas, schema, algoritmos, validação, UI e operação. |

- Esta SPEC **DEVE** ser lida como normativa para a implementação.
- Onde a SPEC interpretar ou complementar o PRD, a interpretação **DEVE** estar registrada na §15.
- Esta SPEC **NÃO DEVE** ser usada para alterar silenciosamente uma regra de produto.
- `PLAN.md` e `TASKS.md` são documentos de execução subordinados a esta SPEC; não alteram regras de produto.
- `docs/decisoes-v1.1.md` é um registro histórico e não normativo; em caso de divergência, prevalecem PRD, AGENTS e SPEC.

### 1.2 Linguagem normativa

- **DEVE / NÃO DEVE**: obrigação ou proibição verificável.
- **PODE**: alternativa permitida, sem obrigação.
- **RECOMENDADO**: boa prática, não bloqueante.
- **Bloqueante**: impede o build e a publicação.
- **Aviso**: aparece no build/CI, mas não impede a publicação.
- **Derivado**: calculado a partir da fonte; nunca editado manualmente.

“Build” significa a geração estática do site com Astro. “Publicação” significa o deploy no GitHub Pages. “Fonte” significa `data/2026/copa.yaml`.

### 1.3 Identificadores estáveis

| Prefixo | Uso |
|---|---|
| `SPEC-*` | Requisitos técnicos transversais. |
| `DM-*` | Invariantes do modelo de domínio. |
| `ALG-*` | Algoritmos normativos. |
| `VAL-*` | Regras de validação bloqueantes. |
| `VAL-W*` | Avisos de validação. |
| `UI-*` | Estados e contratos de interface. |
| `NFR-*` | Requisitos não funcionais. |
| `TST-*` | Casos da matriz de testes. |
| `ADR-*` | Decisões de arquitetura. |
| `FR-*` | Requisitos funcionais do PRD. |

Os IDs são estáveis: renomear uma seção não altera o ID. Um ID não pode ser reutilizado para outra regra. Se uma regra for removida, o ID fica reservado e marcado como obsoleto.

### 1.4 Requisitos técnicos transversais

| ID | Requisito | Verificação |
|---|---|---|
| SPEC-001 | Uma única fonte versionada por edição (`data/2026/copa.yaml`); nenhum dado de competição duplicado em HTML/componentes. | Teste de fonte única e varredura de dados hardcoded. |
| SPEC-002 | Dados inválidos bloqueiam o build com todos os erros agregados em pt-BR. | `npm run validate`, fixtures inválidas, build. |
| SPEC-003 | Zero JavaScript de cliente no MVP. | Varredura de `dist/` e teste E2E de requisições. |
| SPEC-004 | Site 100% estático no GitHub Pages, sem backend, banco ou login. | Build estático e workflow Pages. |
| SPEC-005 | Classificação, placar, cartões, suspensões e estatísticas são sempre derivados dos eventos. | Testes de funções puras. |
| SPEC-006 | Determinismo: mesma fonte + mesma versão de build produzem a mesma classificação e estatísticas. | Testes de repetição e ordenação. |
| SPEC-007 | Privacidade: somente apelido, posição, time e estatísticas são públicos. | Schema estrito + varredura de `dist/`. |
| SPEC-008 | Nome público “Copa de Futsal Feminino Vila Mariana 2026”; nome da instituição e marcas Airbnb ausentes da interface. | Teste de termos proibidos. |
| SPEC-009 | Interface e mensagens em pt-BR; datas no fuso `America/Sao_Paulo`. | Testes de formatação e conteúdo. |
| SPEC-010 | WCAG 2.2 AA, mobile-first, teclado, foco visível e tabelas semânticas. | axe, Playwright e checklist manual. |
| SPEC-011 | FR-10 (Regulamento) adiado: sem rota, link, página ou placeholder. | Varredura de rotas e links. |
| SPEC-012 | FR-20 (histórico de alterações) futuro: não implementar no MVP. | Revisão de escopo. |
| SPEC-013 | Cores, tipografia, espaçamento, raios, sombras e movimento vêm de tokens do projeto. | Teste de tokens e varredura de estilos. |
| SPEC-014 | Orçamento: 0 KB de JS de cliente, CSS < 30 KB gzip, sem fontes externas e sem imagens de pessoas. | `npm run test:build`. |
| SPEC-015 | Nenhum segredo, analytics, cookie de rastreamento ou requisição de terceiros. | Varredura e teste E2E de rede. |
| SPEC-016 | O amistoso do 3º colocado é metadado informativo (`friendly`), não é partida e não tem placar, eventos, cartões, estatísticas, suspensões ou efeito na classificação/pódio. | Schema estrito, validação VAL-033 e testes de UI. |
| SPEC-017 | O formato de 2026 tem 3 times e 7 partidas oficiais: 6 de grupo em turno e returno + 1 final. Não há partida de 3º lugar nem 4º lugar. | Schema, validação, rotas e testes. |

---

## 2. Contexto, escopo e não escopo

### 2.1 Produto

Site público, estático e somente leitura da Copa de Futsal Feminino Vila Mariana 2026, com **3 times**, **6 partidas classificatórias em turno e returno** e **final única**. O 3º lugar é o 3º da classificação; não há disputa de 3º x 4º nem 4º lugar. O **amistoso do 3º colocado** é um metadado informativo na Fase final, não uma partida. A organização edita a fonte YAML; o site apenas lê, valida e publica.

**Nome público (imutável na UI):** “Copa de Futsal Feminino Vila Mariana 2026”.

O nome da instituição **NÃO DEVE** aparecer em interface, título, metadados, Open Graph, favicon, `alt`, rodapé, mensagens ou URLs públicas. Documentação interna pode mencioná-lo.

### 2.2 No escopo do MVP

- **3 times** com nomes e abreviações vindos da fonte (`ta`, `tb`, `tc`).
- Elencos com apelido, posição opcional, `joinedAt`/`leftAt`.
- Calendário de **7 partidas oficiais**, agrupado por data: 6 de grupo + 1 final.
- **Amistoso informativo** (`friendly`) com data, horário, local e nota, exibido como card na Fase final, antes da final; não entra em placar, eventos, estatísticas, suspensões ou classificação.
- Resultados derivados de gols, gols contra, assistências, cartões, W.O. e pênaltis.
- Classificação automática com desempate por grupos e **confronto direto em dois jogos**.
- Suspensões automáticas e bloqueio de eventos.
- Fase final com `finalists` validado, **final única** e **pódio de 3**: campeã, vice e 3ª.
- Estatísticas individuais e coletivas da fase classificatória e da final.
- Páginas Início, Jogos, Classificação, Times, Estatísticas, Fase final e 404.
- Validação bloqueante, avisos de build, CI e deploy no GitHub Pages.
- Acessibilidade AA, SEO básico e performance em 4G.

### 2.3 Fora do escopo do MVP

- Admin, login, backend, banco de dados, área de edição no site.
- Placar ao vivo, cronômetro, faltas, escalação, presença, substituições.
- Fotos de jogadoras, nomes completos, contatos, camisa, data de nascimento.
- **Disputa de 3º lugar e 4º lugar**: o 3º é o 3º da classificação; não há partida extra.
- **Amistoso como partida oficial**: não tem placar, eventos, cartões, estatísticas ou efeito na classificação/pódio.
- Histórico de edições anteriores, multi-competição, busca, filtros com JS.
- Notificações, chat, pagamentos, streaming, ingressos.
- W.O. automático, detecção de jogadoras em quadra, automação de desistência de time inteiro.
- Regulamento (FR-10, adiado), modo escuro, impressão/PDF, analytics.
- Tema escuro, fontes proprietárias, imagens de pessoas, logotipos de terceiros.
- `PLAN.md` e `TASKS.md` nesta etapa.

### 2.4 Adiado e futuro

| Item | Status | Efeito |
|---|---|---|
| FR-10 — página de Regulamento | **ADIADO** | Sem rota `/regulamento/`, sem link na nav, sem placeholder. Acesso retorna 404. |
| FR-20 — histórico de alterações | **FUTURO** | Sem página, sem API, sem UI. O histórico oficial é o Git. |
| FR-09 — página inicial | Desejável no MVP | Implementada com os quatro estados da §10.3. |
| FR-19 — compartilhamento | Desejável no MVP | Título, descrição, canonical e Open Graph básico. |
| FR-21 — amistoso informativo | Obrigatório na v1.1 (campo opcional) | Card na Fase final, antes da final, quando `friendly` existir; não é partida e não altera classificação/pódio. |

### 2.5 Dados operacionais em aberto

Não há questão técnica bloqueante. Os itens abaixo são **dados** a preencher na fonte, com fallback explícito na UI:

| Dado | Campo | Fallback público |
|---|---|---|
| Nomes definitivos dos 3 times | `teams[].name` | O valor cadastrado (“Time A” etc.). |
| Horários das partidas | `matches[].startsAt` | “Horário a definir”. |
| Horário do amistoso | `friendly.startsAt` | Obrigatório; sem fallback, para garantir que seja anterior à final. |
| Local/quadra das partidas | `matches[].venue` | “Local a definir”. |
| Local do amistoso | `friendly.venue` | Obrigatório; sem fallback. |
| Nota do amistoso | `friendly.note` | Obrigatória; explica que é recreativo e sem efeito na classificação. |
| Critério de assistência duvidosa | decisão da organização ao lançar `assistPlayerId` | Sem impacto técnico; o dado é opcional. |
| Acomodação quando todos os times têm 8 | decisão da organização | O site bloqueia a 9ª ativa; a organização decide a saída/`leftAt`. |
| Habilitar Pages | configuração do repositório | Documentado na §12. |

Nenhum desses itens pode ser usado como desculpa para “a definir” silencioso no código. O campo existe, o fallback é explícito e a validação não depende do valor.

### 2.6 Premissas

- A edição é 2026; o build lê somente `data/2026/copa.yaml`.
- O formato é de **3 times e 7 partidas oficiais** (6 de grupo + final).
- O repositório é público; a fonte não contém dados pessoais além do apelido.
- O mapeamento `p-XXX` → pessoa fica fora do repositório (Apêndice F).
- O site não controla quem está em quadra; W.O. é registrado manualmente.
- O GitHub Pages serve o projeto em `/futsal-cup/`.
- A mesma versão de Node/ICU e o mesmo `package-lock.json` são usados no build.
- O amistoso é opcional (`friendly: null`) e, quando existir, é apenas informativo.

---

## 3. Glossário

| Termo | Definição |
|---|---|
| **Edição** | Conjunto de dados de um ano. No MVP, apenas 2026. |
| **Fonte** | Arquivo YAML único `data/2026/copa.yaml`. |
| **Time** | Uma das **3 equipes**; IDs `ta`, `tb`, `tc`. |
| **Jogadora** | Pessoa no elenco de um time; ID opaco `p-001` etc.; público apenas o apelido. |
| **Elenco ativo** | Jogadoras com `leftAt: null`. |
| **Elegibilidade** | Condição temporal para atuar: `joinedAt < startsAt` e (`leftAt == null` ou `leftAt > startsAt`). |
| **Partida** | Jogo oficial com `stage`, `date`, `status`, eventos e eventual W.O./shootout. |
| **Fase classificatória** | **6 partidas em turno e returno**; somente elas contam para a classificação. Cada time joga 4 vezes. |
| **Fase final** | **Final única** entre 1º e 2º; não há semifinais nem disputa de 3º lugar. |
| **3º lugar** | 3ª posição da classificação final da fase classificatória; **não** é decidido em partida. |
| **Amistoso** | Metadado `friendly` com data, horário, local e nota; card informativo na Fase final, antes da final. **Não é partida**: sem placar, eventos, cartões, estatísticas, suspensões ou efeito na classificação/pódio. |
| **Evento** | `goal`, `ownGoal`, `yellow` ou `red`, aninhado na partida. |
| **Gol contra** | `ownGoal` da jogadora que marcou contra o próprio time; credita o adversário; não entra na artilharia dela. |
| **Assistência** | Jogadora do mesmo time da marcadora, diferente dela; opcional; proibida em pênalti e gol contra. |
| **Pênalti do tempo normal** | `goal` com `penalty: true`; conta no placar e na artilharia. |
| **Disputa de pênaltis** | `shootout` apenas na final, após empate no tempo normal; 5 cobranças alternadas e morte súbita; o site registra apenas o placar final e não conta para placar normal nem estatísticas. |
| **W.O.** | Vitória administrativa por 1x0, registrada em `walkover`; sem gols/assistências; cartões permitidos conforme o motivo. Aplicado por partida; não há automação de desistência de time inteiro. |
| **Suspensão** | Efeito de um vermelho (direto ou 2º amarelo) na próxima partida do time. Se o time joga duas vezes na mesma data, a próxima partida pode ser no mesmo dia. |
| **Pontos disciplinares** | Amarelo = 1; vermelho = 2; segundo amarelo = 3 no total; menor é melhor. |
| **Confronto direto** | Soma dos pontos dos **dois jogos** de grupo entre exatamente dois times empatados; se empatar, saldo agregado dos dois jogos. Só vale com os dois jogos `finished`; W.O. conta como 1x0. |
| **Sorteio** | Critério final, registrado em `drawOrder` (permutação dos 3 times); badge textual “Sorteio”. |
| **Finalistas** | Snapshot `finalists.final` com `[1º, 2º]`, validado contra a classificação. Não há snapshot de 3º/4º. |
| **Pódio** | Campeã (vencedora da final), vice (perdedora da final) e 3ª (3ª da classificação). **Não há 4º lugar.** |
| **Classificação provisória** | Situação em que nem todas as 6 partidas classificatórias estão `finished`. |
| **Resultado pendente** | Partida `scheduled` cuja data/horário já passou; não é tratada como próximo jogo. |
| **Build time** | Instante do build; `SOURCE_DATE_EPOCH` se definido, senão o relógio do executor. |
| **Fuso** | `America/Sao_Paulo` para todas as datas/horas exibidas. |

---

## 4. Arquitetura

### 4.1 Stack

| Decisão | Escolha | Justificativa |
|---|---|---|
| Framework | Astro, última estável compatível (referência: 7.4.11) | MPA estática, HTML pré-renderizado, zero JS por padrão. |
| Linguagem | TypeScript em modo `strict` | Contratos e validação em tempo de build. |
| UI | Nenhum framework (React/Vue/Svelte) | Evita hidratação e JS de cliente. |
| CSS | CSS puro com tokens do projeto | Sem Tailwind; orçamento e acessibilidade controlados. |
| Dados | YAML 1.2 + `yaml` + Zod 4 estrito | Fonte legível e schema validado. |
| Pacotes | npm com `package-lock.json` | Reprodutibilidade. |
| Node | 26 LTS (ambiente: 26.13.0) | Compatível com Astro 7 e com os testes. |
| Deploy | GitHub Pages, site de projeto em `/futsal-cup/` | Restrição de produto. |

Versões de referência verificadas em 11/11/2026: Astro 7.4.11, TypeScript 6.0.x (o `@astrojs/check` aceita `^5 || ^6`; **não** usar TypeScript 7), Vitest 5.1.0, Playwright 1.65.0, Zod 4.6.7, `yaml` 2.9.1, `@axe-core/playwright` 4.14.0, `tsx` 4.23.15. O `package-lock.json` é a fonte final das versões instaladas.

### 4.2 Fluxo de build

```text
data/2026/copa.yaml
        │
        ▼
[1] loader: yaml.parseDocument + Zod strict
        │  erros → DataValidationError (todos agregados)
        ▼
[2] validação semântica (referências, elencos, calendário, W.O., finalistas)
        │  erros → build falha; avisos → job summary
        ▼
[3] domínio puro: placar, classificação, suspensões, estatísticas, pódio
        │
        ▼
[4] páginas Astro (getStaticPaths, layouts, componentes)
        │
        ▼
dist/ (HTML + CSS; 0 KB de JS)
        │
        ▼
GitHub Actions → GitHub Pages
```

O build **NÃO DEVE** consultar APIs, bancos, arquivos de outras edições ou o relógio para calcular classificação/estatísticas. O único uso de tempo é o “agora” do build para próximo jogo, “resultado pendente” e rodapé; esse instante é passado explicitamente às funções.

### 4.3 Estrutura de diretórios

```text
/
├── data/2026/copa.yaml
├── public/favicon.svg
├── scripts/
│   ├── validate-data.ts
│   └── check-build.ts
├── src/
│   ├── components/
│   │   ├── SiteHeader.astro
│   │   ├── SiteFooter.astro
│   │   ├── NoticeBanner.astro
│   │   ├── MatchCard.astro
│   │   ├── FriendlyCard.astro
│   │   ├── Score.astro
│   │   ├── StatusBadge.astro
│   │   ├── StandingsTable.astro
│   │   ├── RosterTable.astro
│   │   ├── StatsTable.astro
│   │   └── EmptyState.astro
│   ├── layouts/
│   │   └── BaseLayout.astro
│   ├── lib/
│   │   ├── data/          # loader, schema, validação
│   │   ├── domain/        # funções puras (ranking, score, stats, suspensão)
│   │   ├── format/        # datas, horas, placar, texto
│   │   └── site.ts        # nome público, base URL, metadados
│   ├── pages/
│   │   ├── index.astro
│   │   ├── 404.astro
│   │   ├── jogos/index.astro
│   │   ├── jogos/[matchId].astro
│   │   ├── classificacao/index.astro
│   │   ├── times/index.astro
│   │   ├── times/[teamId].astro
│   │   ├── estatisticas/index.astro
│   │   └── fase-final/index.astro
│   └── styles/
│       ├── tokens.css
│       ├── base.css
│       └── components.css
├── tests/
│   ├── unit/
│   ├── data/
│   ├── build/
│   ├── e2e/
│   ├── fixtures/
│   └── factories/
├── astro.config.mjs
├── package.json
├── package-lock.json
├── tsconfig.json
├── vitest.config.ts
├── playwright.config.ts
├── .gitignore
└── .github/workflows/deploy.yml
```

`airbnb-design-design.md` e `airbnb-design-tokens.css` permanecem na raiz como referência interna e **NÃO DEVEM** ser copiados para `public/` nem publicados no `dist/`.

### 4.4 Renderização e rotas

- `output: 'static'`, `build.format: 'directory'`, `trailingSlash: 'always'`.
- Cada rota é um arquivo HTML pré-renderizado. Não há SSR, middleware, API routes ou ilhas.
- `getStaticPaths` gera `/jogos/g1/`…`/jogos/g6/`, `/jogos/final/` e `/times/ta/`…`/times/tc/`.
- Links internos usam `import.meta.env.BASE_URL` (helper `withBase`), nunca `/` absoluto sem base.
- Nenhum `client:*`, `<script>` ou import de framework de UI.
- 404: `src/pages/404.astro` **DEVE** produzir `dist/404.html` (comportamento nativo do Astro; verificado no teste de build).

### 4.5 Fronteiras de código

| Camada | Pode | Não pode |
|---|---|---|
| `lib/data` | Ler YAML, validar, normalizar, lançar erros. | Conhecer componentes ou HTML. |
| `lib/domain` | Receber dados validados e `now`; calcular derivados. | Fazer I/O, usar `Date.now()`, mutar entrada. |
| `lib/format` | Formatar datas/placar/texto em pt-BR. | Conhecer regras de competição. |
| `pages` | Selecionar dados derivados e montar a página. | Reimplementar regras ou hardcodar times/datas. |
| `components` | Renderizar props e HTML semântico. | Acessar YAML diretamente ou calcular classificação. |
| `scripts` | Orquestrar validação e checagens de build. | Duplicar regras de domínio. |

### 4.6 Dependências

- Produção: nenhuma dependência de runtime no navegador.
- Build/dev: Astro, TypeScript, `yaml`, Zod, `tsx`, Vitest, Playwright, `@axe-core/playwright`, `@astrojs/check`, `@types/node`.
- **NÃO DEVE** haver framework de UI, Tailwind, biblioteca de datas, biblioteca de ícones, pacote de fontes, analytics ou cliente de banco.
- Dependências novas exigem justificativa e atualização desta SPEC.

### 4.7 Compatibilidade

- Navegadores recentes: Chrome, Edge, Firefox e Safari (últimas 2 versões), incluindo iOS Safari e Chrome Android.
- CSS moderno com fallback progressivo; `<details>` nativo; sem recursos que dependam de JS.
- Layout funcional em 320px, 360px, 768px, 1024px e 1280px.
- Zoom de 200% sem perda de conteúdo ou funcionalidade.

---

## 5. Fonte de dados

### 5.1 Arquivo e formato

- Caminho único: `data/2026/copa.yaml`.
- Formato: YAML 1.2, UTF-8, LF, indentação de 2 espaços.
- Datas e timestamps **DEVEM** ser strings entre aspas para evitar conversão implícita.
- Timestamps **DEVEM** usar ISO 8601 com offset explícito, por exemplo `"2026-11-24T19:00:00-03:00"`.
- A fonte **NÃO DEVE** conter nomes completos, fotos, contatos, camisa, data de nascimento, segredos ou dados de outras edições.
- Comentários são permitidos e recomendados para contexto operacional; não são publicados.

Cabeçalho mínimo recomendado:

```yaml
# Fonte pública da Copa de Futsal Feminino Vila Mariana 2026.
# Privacidade: apenas apelido, posição, time e estatísticas.
# O mapeamento p-XXX -> pessoa fica FORA do repositório.
# Não inclua nome completo, foto, contato, camisa ou data de nascimento.
```

### 5.2 Pipeline de leitura

1. Ler o arquivo com `readFileSync` (UTF-8).
2. Parsear com `yaml.parseDocument(text, { version: '1.2', uniqueKeys: true, prettyErrors: false })`.
3. Se houver erro de sintaxe, reportar `VAL-001` com linha/coluna e parar.
4. Converter para JS e validar com `competitionSchema.safeParse` (Zod strict).
5. Se houver erro de schema, reportar todos os `VAL-002` e parar a fase semântica.
6. Executar a validação semântica completa, agregando todos os erros e avisos.
7. Se houver erro bloqueante, lançar `DataValidationError` com todos os issues.
8. Retornar `Competition` congelado (readonly) para o domínio.

O loader **DEVE** ser chamado no build e no `npm run validate`. O build **NÃO DEVE** depender de o comando de validação ter rodado antes.

### 5.3 Convenções de IDs e referências

| Entidade | Formato | Exemplo | Observação |
|---|---|---|---|
| Time | `ta`…`tc` | `ta` | Exatamente 3; usado em URLs. |
| Jogadora | `p-` + 3 dígitos | `p-001` | Opaco, estável, nunca exibido. |
| Partida | `g1`…`g6`, `final` | `g3` | Exatamente 7. |
| Evento | sem ID | — | Aninhado e ordenado no arquivo. |
| Edição | inteiro | `2026` | Literal no schema. |

- IDs de time e partida são públicos em URLs; IDs de jogadora são internos.
- Renomear um time **NÃO DEVE** alterar seu ID.
- IDs de jogadora **NÃO DEVEM** ser reutilizados na mesma edição.
- Referências a IDs inexistentes são bloqueantes (`VAL-028`).

### 5.4 Schema Zod completo

O schema abaixo é normativo. `strict()` em todos os objetos garante que campo desconhecido é erro. Tipos, limites e literais são deliberadamente fechados para a edição 2026.

```ts
import { z } from 'zod';

/* ---------- primitivos ---------- */

const isoDateTime = z.string().refine((value) => {
  const match = /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d{1,3})?(?:Z|([+-])(\d{2}):(\d{2}))$/.exec(value);
  if (!match) return false;
  const [, date, hh, mm, ss, , offH, offM] = match;
  if (!isValidCalendarDate(date)) return false;
  if (Number(hh) > 23 || Number(mm) > 59 || Number(ss) > 59) return false;
  if (offH !== undefined && (Number(offH) > 23 || Number(offM) > 59)) return false;
  return Number.isFinite(Date.parse(value));
}, 'Data/hora inválida: use ISO 8601 com fuso, como 2026-11-24T19:00:00-03:00.');

const dateOnly = z.string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida: use AAAA-MM-DD.')
  .refine(isValidCalendarDate, 'Data inválida: use AAAA-MM-DD com dia real.');

const teamId = z.enum(['ta', 'tb', 'tc']);
const playerId = z.string().regex(/^p-\d{3}$/, 'ID de jogadora inválido: esperado p-001.');
const position = z.enum(['goleira', 'linha']).nullable();
const status = z.enum(['scheduled', 'finished', 'postponed']);
const stage = z.enum(['group', 'final']);
const walkoverReason = z.enum(['no_show', 'insufficient_players', 'withdrawal']);
const minute = z.number().int().min(0).nullable().optional();

function isValidCalendarDate(value: string): boolean {
  const parts = value.split('-');
  if (parts.length !== 3) return false;
  const [y, m, d] = parts.map(Number);
  if (!Number.isInteger(y) || !Number.isInteger(m) || !Number.isInteger(d)) return false;
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

/* ---------- jogadora e time ---------- */

const playerSchema = z.object({
  id: playerId,
  nickname: z.string().min(1).max(40),
  position,
  joinedAt: isoDateTime,
  leftAt: isoDateTime.nullable(),
}).strict();

const teamSchema = z.object({
  id: teamId,
  name: z.string().min(1).max(60),
  abbreviation: z.string().regex(/^[A-Z0-9]{1,5}$/, 'Abreviação inválida: use 1 a 5 caracteres A-Z ou 0-9.'),
  players: z.array(playerSchema),
}).strict();

/* ---------- eventos ---------- */

const goalEventSchema = z.object({
  type: z.literal('goal'),
  playerId,
  assistPlayerId: playerId.nullable().optional(),
  minute,
  penalty: z.boolean(),
}).strict();

const ownGoalEventSchema = z.object({
  type: z.literal('ownGoal'),
  playerId,
  minute,
}).strict();

const cardEventSchema = z.object({
  type: z.enum(['yellow', 'red']),
  playerId,
  minute,
}).strict();

const eventSchema = z.discriminatedUnion('type', [
  goalEventSchema,
  ownGoalEventSchema,
  cardEventSchema,
]);

/* ---------- partidas ---------- */

const walkoverSchema = z.object({
  winnerTeamId: teamId,
  reason: walkoverReason,
  note: z.string().min(1).max(200).nullable().optional(),
}).strict();

const shootoutSchema = z.object({
  home: z.number().int().min(0),
  away: z.number().int().min(0),
}).strict();

const groupMatchSchema = z.object({
  id: z.enum(['g1', 'g2', 'g3', 'g4', 'g5', 'g6']),
  stage: z.literal('group'),
  round: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  homeTeamId: teamId,
  awayTeamId: teamId,
  date: dateOnly,
  startsAt: isoDateTime.nullable(),
  venue: z.string().min(1).max(120).nullable(),
  status,
  walkover: walkoverSchema.nullable(),
  shootout: shootoutSchema.nullable(),
  events: z.array(eventSchema),
}).strict();

const finalMatchSchema = z.object({
  id: z.literal('final'),
  stage: z.literal('final'),
  round: z.null(),
  date: dateOnly,
  startsAt: isoDateTime.nullable(),
  venue: z.string().min(1).max(120).nullable(),
  status,
  walkover: walkoverSchema.nullable(),
  shootout: shootoutSchema.nullable(),
  events: z.array(eventSchema),
}).strict();

const matchSchema = z.discriminatedUnion('stage', [
  groupMatchSchema,
  finalMatchSchema,
]);

/* ---------- envelope ---------- */

const finalistsSchema = z.object({
  final: z.tuple([teamId, teamId]),
}).strict();

const friendlySchema = z.object({
  date: dateOnly,
  startsAt: isoDateTime,
  venue: z.string().min(1).max(120),
  note: z.string().min(1).max(300),
}).strict();

const noticeSchema = z.object({
  date: dateOnly,
  message: z.string().min(1).max(300),
}).strict();

export const competitionSchema = z.object({
  edition: z.literal(2026),
  timezone: z.literal('America/Sao_Paulo'),
  teams: z.array(teamSchema).length(3),
  matches: z.array(matchSchema).length(7),
  finalists: finalistsSchema.nullable(),
  drawOrder: z.array(teamId).length(3).nullable(),
  friendly: friendlySchema.nullable(),
  notices: z.array(noticeSchema),
}).strict();
```

**Decisões de schema:**

- `leftAt` é obrigatório e explícito (`null` quando ativa).
- `joinedAt`/`leftAt` são strings ISO, não objetos `Date` do YAML, para evitar ambiguidade de fuso.
- `venue: null` é permitido em partidas; a UI mostra “Local a definir”. No `friendly`, `date`, `startsAt`, `venue` e `note` são obrigatórios.
- `startsAt: null` é permitido em `scheduled`/`postponed`; `finished` exige valor.
- `walkover.note` e `event.minute` são opcionais; o loader normaliza ausência para `null`.
- `finalists`, `drawOrder` e `friendly` são obrigatórios no envelope, ainda que `null`.
- `friendly` não tem `status`, `events`, `walkover`, `shootout`, `homeTeamId`/`awayTeamId`, times ou placar; é metadado informativo com data, horário, local e nota.
- `notices` é obrigatório (pode ser `[]`).
- Não existe campo de placar, pontuação, classificação, suspensão ou estatística. Qualquer tentativa de incluí-los falha como campo desconhecido (`VAL-002`/`VAL-026`).

### 5.5 Normalização de texto

Para unicidade de apelido e abreviação:

```text
normalizeText(s):
  s.normalize('NFC').trim().replace(/\s+/gu, ' ')

uniqueKey(s):
  normalizeText(s).toLowerCase()
```

- A comparação é case-insensitive, mas **acentos continuam distintos** (“Ana” ≠ “Aná”).
- Espaços internos são colapsados; espaços nas pontas são removidos.
- Apelido vazio após normalização é erro (`VAL-002`/`VAL-007`).
- Apelido é único dentro do time; pode repetir entre times.
- Abreviação é comparada em maiúsculas e é única entre os 3 times (`VAL-005`).

Para ordenação estável e independente de ICU:

```text
sortKey(s):
  normalizeText(s)
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()

compareText(a, b):
  cmp(sortKey(a), sortKey(b))
  ?? cmp(normalizeText(a), normalizeText(b))
  ?? cmp(a, b)          // desempate final por code unit
```

A ordenação acima é usada em todas as tabelas. `localeCompare` e `Intl.Collator` **NÃO DEVEM** ser usados para ordenar dados, para evitar variação entre versões de ICU.

### 5.6 Modelo temporal do elenco

- `joinedAt` é o instante de registro/inclusão. A jogadora é elegível para partidas cujo `startsAt` seja **estritamente posterior** a `joinedAt`.
- `leftAt` é o instante efetivo de saída. A jogadora deixa de ser ativa em `leftAt` (intervalo semiaberto `[joinedAt, leftAt)`).
- Elenco ativo público = `leftAt === null`. A organização **NÃO DEVE** agendar `leftAt` futuro; a UI não antecipa saídas.
- Máximo de 8 jogadoras ativas simultaneamente em qualquer instante. A 9ª ativa é bloqueada (`VAL-009`).
- Menos de 7 ativas gera aviso de build (`VAL-W01`), sem bloquear.
- Badge público “Elenco em formação” somente com menos de 5 ativas. Entre 5 e 6 não há badge público; a pendência fica no CI.
- O mínimo de 3 jogadoras em quadra é regra de jogo, não regra de elenco. O site não controla quem está em quadra; W.O. é manual.
- Remover do elenco ativo = preencher `leftAt`; nunca apagar a jogadora nem seus eventos.
- Jogadora que já atuou não pode trocar de time. O vínculo é imutável após o primeiro evento; uma transferência antes de qualquer evento é permitida (sem eventos antigos).
- A mesma pessoa não pode estar em dois times. O schema detecta IDs duplicados; a ligação ID → pessoa é privada e fora do repositório.

Varredura de sobreposição para `VAL-009`:

```text
eventos = []
para cada jogadora:
  eventos.push({ t: joinedAt, delta: +1 })
  se leftAt != null: eventos.push({ t: leftAt, delta: -1 })
ordenar por t asc; em empate, delta -1 antes de +1
ativos = 0
para cada evento:
  ativos += delta
  se ativos > 8: erro VAL-009 no instante t
```

O empate `leftAt == joinedAt` é inválido (`VAL-008`), portanto a substituição no mesmo instante é representada por `leftAt` de uma e `joinedAt` da outra no mesmo timestamp; a ordem -1 antes de +1 mantém o máximo em 8.

### 5.7 Regras semânticas do envelope

Além do schema, a validação semântica **DEVE** garantir:

- `edition === 2026` e `timezone === "America/Sao_Paulo"`.
- Exatamente **3 times** com IDs `ta`, `tb`, `tc`.
- Exatamente **7 partidas** com IDs `g1`…`g6`, `final`.
- `g1`…`g6` formam exatamente os seis confrontos do **turno e returno**:
  - `g1`: ta x tb; `g2`: tb x tc (rodada 1, 24/11/2026);
  - `g3`: ta x tc; `g4`: tb x ta (rodada 2, 26/11/2026);
  - `g5`: tc x ta; `g6`: tc x tb (rodada 3, 01/12/2026).
- Cada time joga exatamente **4 partidas de grupo**; não há time contra si mesmo nem par de times sem os dois jogos.
- `round` de `g1`/`g2` = 1; `g3`/`g4` = 2; `g5`/`g6` = 3.
- `final` não tem `homeTeamId`/`awayTeamId`; usa `finalists`.
- `date` é uma data de calendário válida; se `startsAt` existe, sua data local em `America/Sao_Paulo` é igual a `date`.
- `finished` exige `startsAt`; `scheduled`/`postponed` não têm eventos, W.O. nem shootout.
- A ordem cronológica de cada time respeita a ordem canônica (`g1` → `g2` → `g3` → `g4` → `g5` → `g6` → `final`), e a final ocorre depois das 6 partidas de grupo. Um time pode ter duas partidas na mesma data, desde que os horários sejam distintos e respeitem essa ordem.
- `finalists` é `null` enquanto o grupo não termina; quando as 6 partidas terminam, é obrigatório e deve ser `[1º, 2º]` da classificação.
- `drawOrder` é uma permutação dos 3 times ou `null`; é obrigatório apenas se um empate chegar ao sorteio na classificação final (6 partidas de grupo `finished`).
- `friendly` é `null` ou um metadado com data, horário, local e nota; quando existir, deve estar na mesma data da final e, se a final tiver `startsAt`, antes do horário da final. Se a final ainda não tiver horário, a ordem é validada quando ele for preenchido.
- `notices` tem datas válidas e mensagens não vazias.

---

## 6. Modelo de domínio

### 6.1 Entidades e tipos

```ts
export type TeamId = 'ta' | 'tb' | 'tc';
export type PlayerId = `p-${string}`;
export type MatchId = 'g1' | 'g2' | 'g3' | 'g4' | 'g5' | 'g6' | 'final';
export type Stage = 'group' | 'final';
export type MatchStatus = 'scheduled' | 'finished' | 'postponed';
export type Position = 'goleira' | 'linha' | null;
export type WalkoverReason = 'no_show' | 'insufficient_players' | 'withdrawal';

export interface Player {
  readonly id: PlayerId;
  readonly nickname: string;
  readonly position: Position;
  readonly joinedAt: string;
  readonly leftAt: string | null;
}

export interface Team {
  readonly id: TeamId;
  readonly name: string;
  readonly abbreviation: string;
  readonly players: readonly Player[];
}

export interface Walkover {
  readonly winnerTeamId: TeamId;
  readonly reason: WalkoverReason;
  readonly note: string | null;
}

export interface Shootout {
  readonly home: number;
  readonly away: number;
}

export type Event =
  | { readonly type: 'goal'; readonly playerId: PlayerId;
      readonly assistPlayerId: PlayerId | null; readonly minute: number | null;
      readonly penalty: boolean }
  | { readonly type: 'ownGoal'; readonly playerId: PlayerId;
      readonly minute: number | null }
  | { readonly type: 'yellow'; readonly playerId: PlayerId;
      readonly minute: number | null }
  | { readonly type: 'red'; readonly playerId: PlayerId;
      readonly minute: number | null };

interface MatchBase {
  readonly id: MatchId;
  readonly stage: Stage;
  readonly date: string;              // AAAA-MM-DD
  readonly startsAt: string | null;   // ISO com offset
  readonly venue: string | null;
  readonly status: MatchStatus;
  readonly walkover: Walkover | null;
  readonly shootout: Shootout | null;
  readonly events: readonly Event[];
}

export interface GroupMatch extends MatchBase {
  readonly stage: 'group';
  readonly round: 1 | 2 | 3;
  readonly homeTeamId: TeamId;
  readonly awayTeamId: TeamId;
}

export interface FinalStageMatch extends MatchBase {
  readonly stage: 'final';
  readonly round: null;
}

export type Match = GroupMatch | FinalStageMatch;

// Partida com participantes resolvidos; a final usa o snapshot `finalists`.
export type ResolvedMatch = Match & {
  readonly homeTeamId: TeamId;
  readonly awayTeamId: TeamId;
};

export interface Finalists {
  readonly final: readonly [TeamId, TeamId];
}

export interface Friendly {
  readonly date: string;              // AAAA-MM-DD; mesma data da final
  readonly startsAt: string;          // ISO com offset; antes da final
  readonly venue: string;
  readonly note: string;              // texto informativo, sem placar
}

export interface Notice {
  readonly date: string;
  readonly message: string;
}

export interface Competition {
  readonly edition: 2026;
  readonly timezone: 'America/Sao_Paulo';
  readonly teams: readonly Team[];
  readonly matches: readonly Match[];
  readonly finalists: Finalists | null;
  readonly drawOrder: readonly TeamId[] | null;
  readonly friendly: Friendly | null;
  readonly notices: readonly Notice[];
}
```

### 6.2 Tipos derivados

```ts
export interface Score {
  readonly home: number;
  readonly away: number;
  readonly kind: 'normal' | 'walkover';
}

export interface StandingRow {
  readonly position: number;
  readonly teamId: TeamId;
  readonly points: number;
  readonly played: number;
  readonly wins: number;
  readonly draws: number;
  readonly losses: number;
  readonly goalsFor: number;
  readonly goalsAgainst: number;
  readonly goalDifference: number;
  readonly yellow: number;
  readonly red: number;
  readonly disciplinaryPoints: number;
  readonly decidedByDraw: boolean;
}

export interface RankingResult {
  readonly rows: readonly StandingRow[];
  readonly drawTeams: ReadonlySet<TeamId>;
  readonly provisional: boolean;
}

export interface PlayerStats {
  readonly playerId: PlayerId;
  readonly nickname: string;
  readonly teamId: TeamId;
  readonly goals: number;
  readonly assists: number;
  readonly ownGoals: number;
  readonly yellow: number;
  readonly red: number;
  readonly disciplinaryPoints: number;
  readonly active: boolean;
}

export interface TeamStats {
  readonly teamId: TeamId;
  readonly played: number;
  readonly wins: number;
  readonly draws: number;
  readonly losses: number;
  readonly shootoutWins: number;
  readonly shootoutLosses: number;
  readonly goalsFor: number;
  readonly goalsAgainst: number;
  readonly goalDifference: number;
  readonly yellow: number;
  readonly red: number;
  readonly disciplinaryPoints: number;
}

export interface Suspension {
  readonly playerId: PlayerId;
  readonly teamId: TeamId;
  readonly reason: 'direct' | 'secondYellow';
  readonly sentOffIn: MatchId;
  readonly suspendedFor: MatchId | null; // null = sem próxima partida ou fase final ainda indefinida
  readonly pendingFinalists: boolean;    // true = próxima partida depende de finalists
}

export interface Podium {
  readonly champion: TeamId | null;
  readonly runnerUp: TeamId | null;
  readonly third: TeamId | null;
}

export interface FriendlyCard {
  readonly title: string;
  readonly date: string;
  readonly startsAt: string;
  readonly venue: string;
  readonly note: string;
  readonly informational: true;
}
```

### 6.3 Invariantes de domínio

| ID | Invariante |
|---|---|
| DM-001 | A competição tem edição 2026, fuso `America/Sao_Paulo`, **3 times** e **7 partidas oficiais** (6 de grupo + final). |
| DM-002 | Cada time tem ID único, nome, abreviação única e elenco; nomes podem ser editáveis, IDs não. |
| DM-003 | Jogadora tem ID opaco e único na edição, apelido único no time, posição opcional, `joinedAt` e `leftAt`. |
| DM-004 | Partida tem `stage`, `date`, `status` e regras de `startsAt`; `finished` exige `startsAt`; `scheduled`/`postponed` não têm eventos/W.O./shootout. |
| DM-005 | Evento é `goal`, `ownGoal`, `yellow` ou `red`; assistência é opcional, do mesmo time e diferente da marcadora; pênalti não tem assistência; gol contra não tem assistência/pênalti. |
| DM-006 | Placar é sempre derivado dos eventos; não existe campo de placar. W.O. é a única exceção (1x0 administrativo). |
| DM-007 | W.O. é `walkover` em partida `finished`, com vencedor e motivo; não tem gols/assistências nem shootout; cartões permitidos conforme o motivo. |
| DM-008 | `shootout` só existe na **final** `finished`, sem W.O., após empate no tempo normal, com valores inteiros ≥0 e diferentes; não entra em placar normal, artilharia ou assistências. |
| DM-009 | `finalists` é o snapshot oficial **apenas da final** (`[1º, 2º]`), `null` enquanto o grupo não termina, obrigatório e igual à classificação quando termina. |
| DM-010 | `drawOrder` é uma permutação dos **3 times**; só é exigido quando um empate chega ao sorteio na classificação final. |
| DM-011 | `notices` é uma lista de avisos com data e mensagem; gera banner global. |
| DM-012 | O vínculo da jogadora é temporal e imutável após o primeiro evento; `leftAt` preserva histórico e não ocupa vaga. |
| DM-013 | Suspensão é derivada de vermelho direto ou segundo amarelo na partida anterior do time; sem acúmulo de amarelos. Se o time joga duas vezes na mesma data, a suspensão pode valer para a segunda partida do mesmo dia. |
| DM-014 | Privacidade: apenas apelido, posição, time e estatísticas são públicos; IDs de jogadora e datas de elenco não são renderizados. |
| DM-015 | Nenhuma classificação, estatística, suspensão ou pódio é armazenado como verdade editável. |
| DM-016 | O amistoso é metadado informativo (`friendly`), não é partida e não tem placar, eventos, cartões, estatísticas, suspensões ou efeito na classificação/pódio. |
| DM-017 | O pódio tem campeã, vice e 3ª; **não há 4º lugar** e o 3º não é decidido em partida. |

### 6.4 Regras de derivação

- **Placar normal:** gols do time = gols de suas jogadoras + gols contra de jogadoras adversárias. Pênalti do tempo normal é `goal` com `penalty: true` e conta normalmente.
- **W.O.:** placar fixo 1x0 para `winnerTeamId`; ignora eventos para fins de placar; cartões não alteram o placar.
- **Scheduled/postponed:** sem placar; a UI mostra “—”, “A definir” ou “Adiada”.
- **Classificação:** apenas as 6 partidas de grupo `finished`; a final e seus cartões não alteram a classificação.
- **Suspensão:** um vermelho na partida N suspende na próxima partida canônica do time (N+1), que pode ser no mesmo dia. Sem próxima partida, sem efeito. Cartões da final contam para estatísticas e suspensão, mas não para a classificação.
- **Pódio:** campeã = vencedora da final; vice = perdedora; 3ª = 3ª da classificação final do grupo. Empate no tempo normal na final exige shootout. Não há 4º lugar.
- **Amistoso:** o `friendly` não entra em `deriveScore`, classificação, estatísticas, suspensões ou pódio; é apenas um card informativo.

---

## 7. Algoritmos

Todas as funções desta seção são puras: recebem `Competition` já validada e, quando necessário, `now: Date`. Não leem arquivos, não usam `Date.now()` internamente, não mutam a entrada e retornam novas estruturas. A ordem de arrays de entrada só é usada quando explicitamente indicado (desempate de eventos no mesmo minuto).

### 7.1 ALG-001 — Derivação de placar

Os algoritmos que precisam dos participantes de uma partida usam `resolveMatchTeams`; quando a partida já foi resolvida, recebem `ResolvedMatch`. Para partidas de grupo, os participantes já estão na fonte; para a **final**, são resolvidos a partir de `finalists`:

```text
resolveMatchTeams(match, finalists):
  se match.stage == 'group':
    retornar { homeTeamId: match.homeTeamId, awayTeamId: match.awayTeamId }
  se finalists == null:
    lançar erro de invariante (VAL-017: final sem finalistas)
  retornar { homeTeamId: finalists.final[0], awayTeamId: finalists.final[1] }

toResolvedMatch(match, finalists):
  times = resolveMatchTeams(match, finalists)
  retornar { ...match, ...times }
```

```text
deriveScore(match, finalists):
  se match.status != finished: retornar null
  times = resolveMatchTeams(match, finalists)
  homeTeamId = times.homeTeamId; awayTeamId = times.awayTeamId
  se match.walkover != null:
    se walkover.winnerTeamId == homeTeamId: retornar { home:1, away:0, kind:'walkover' }
    senão: retornar { home:0, away:1, kind:'walkover' }

  home = 0; away = 0
  para cada evento em match.events:
    se evento.type == 'goal':
      time = teamOf(evento.playerId)   // time do elenco da partida
      se time == homeTeamId: home += 1
      senão: away += 1
    se evento.type == 'ownGoal':
      time = teamOf(evento.playerId)
      se time == homeTeamId: away += 1   // crédito ao adversário
      senão: home += 1

  retornar { home, away, kind:'normal' }
```

- Pênalti do tempo normal é `goal` e entra na contagem.
- `shootout` **não** entra em `deriveScore`.
- W.O. ignora eventos para placar; `walkover` é a única fonte do 1x0.
- `teamOf` é resolvido pelo elenco do time na partida; a validação já garantiu que a jogadora pertence a um dos dois times.
- `resolveMatchTeams` lança erro de invariante com `finalists == null`; a UI **DEVE** checar `finalists` antes de chamar funções de placar para a final e usar o fallback “Confrontos a definir”.
- O amistoso não é match e **NÃO DEVE** ser passado para `deriveScore`.

### 7.2 ALG-002 — Linhas da classificação

```text
buildStandingRow(team, groupMatches):
  points=0; played=0; wins=0; draws=0; losses=0; gf=0; ga=0
  yellow=0; red=0; disciplinary=0

  para cada match em groupMatches:
    se team != match.homeTeamId && team != match.awayTeamId: continuar
    se match.status != finished: continuar
    played += 1
    score = deriveScore(match, null)   // grupo não depende de finalists
    home = match.homeTeamId; away = match.awayTeamId
    se score.home > score.away:
      se team == home: points+=3; wins+=1
      senão: losses+=1
    senão se score.home < score.away:
      se team == away: points+=3; wins+=1
      senão: losses+=1
    senão:
      points+=1; draws+=1

    se team == home: gf+=score.home; ga+=score.away
    senão: gf+=score.away; ga+=score.home

    para cada jogadora do time na partida:
      resumo = cardSummary(match.events, jogadora.id)
      yellow += resumo.yellow
      red += resumo.red
      disciplinary += resumo.points

  gd = gf - ga
  retornar { teamId, points, played, wins, draws, losses,
             goalsFor: gf, goalsAgainst: ga, goalDifference: gd,
             yellow, red, disciplinaryPoints: disciplinary,
             position: 0, decidedByDraw: false }
```

- `groupMatches` são apenas `stage === 'group'`.
- Cartões e resultados da **final** não entram na classificação.
- `yellow` conta amarelos; `red` conta vermelhos diretos **e** vermelhos derivados de segundo amarelo (ALG-004).
- `disciplinaryPoints` é calculado por jogadora-partida (ALG-004), não pela soma direta de `yellow`/`red`.

### 7.3 ALG-003 — Ordenação por grupos e desempate

O algoritmo **NÃO DEVE** usar um comparador global. Ele forma grupos por pontos e resolve cada grupo recursivamente. O confronto direto usa **os dois jogos** de grupo entre os times empatados.

```text
rankTeams(competition):
  groupMatches = matches.filter(stage == group)
  rows = teams.map(t => buildStandingRow(t, groupMatches))
  provisional = groupMatches.some(m => m.status != finished)

  grupos = groupBy(rows, r => r.points)   // ordem: pontos desc
  resultado = []
  drawTeams = Set()

  para cada grupo em ordem de pontos desc:
    resolvido = resolveGroup(grupo, groupMatches, competition.drawOrder, drawTeams)
    resultado.push(...resolvido)

  resultado = resultado.map((row, index) => ({
    ...row,
    position: index + 1,
    decidedByDraw: drawTeams.has(row.teamId)
  }))
  retornar { rows: resultado, drawTeams, provisional }
```

```text
resolveGroup(group, groupMatches, drawOrder, drawTeams):
  se group.length == 1: retornar group
  provisional = groupMatches.some(m => m.status != finished)

  se group.length == 2:
    a = group[0]; b = group[1]
    h2h = groupMatches.filter(m =>
      (m.homeTeamId==a.teamId && m.awayTeamId==b.teamId) ||
      (m.homeTeamId==b.teamId && m.awayTeamId==a.teamId))

    // O confronto direto só vale com os DOIS jogos finished.
    se h2h.length == 2 && h2h.every(m => m.status == finished):
      ptsA = 0; ptsB = 0; aggA = 0; aggB = 0
      para cada m em h2h:
        score = deriveScore(m, null)   // grupo não depende de finalists; W.O. vira 1x0
        se a.teamId == m.homeTeamId:
          aGoals = score.home; bGoals = score.away
        senão:
          aGoals = score.away; bGoals = score.home
        se aGoals > bGoals: ptsA += 3
        senão se aGoals < bGoals: ptsB += 3
        senão: ptsA += 1; ptsB += 1
        aggA += aGoals; aggB += bGoals

      se ptsA != ptsB:
        retornar (ptsA > ptsB) ? [a, b] : [b, a]
      se aggA != aggB:
        retornar (aggA > aggB) ? [a, b] : [b, a]
      // empate nos pontos e no saldo agregado do confronto direto: segue critérios 2..6

  para cada critério em [wins, goalDifference, goalsFor, goalsAgainst, disciplinaryPoints]:
    subgrupos = splitByCriterion(group, critério)
    se subgrupos.length > 1:
      retornar concat(subgrupos.map(sub =>
        resolveGroup(sub, groupMatches, drawOrder, drawTeams)))

  // todos os critérios empatados: sorteio
  se drawOrder == null:
    se provisional:
      retornar group.slice().sort((x,y) =>
        x.teamId < y.teamId ? -1 : x.teamId > y.teamId ? 1 : 0)
      // ordem fixa ta…tc; sem badge de sorteio
    lançar DrawRequiredError
  ordenado = group.slice().sort((x,y) =>
    drawOrder.indexOf(x.teamId) - drawOrder.indexOf(y.teamId))
  para cada item de ordenado: drawTeams.add(item.teamId)
  retornar ordenado
```

**Critérios e direção:**

| Ordem | Critério | Melhor |
|---|---|---|
| 1 | Confronto direto — pontos dos dois jogos | Maior soma de pontos nos dois jogos. |
| 1b | Confronto direto — saldo agregado | Maior saldo somando os dois jogos. |
| 2 | `wins` | Maior. |
| 3 | `goalDifference` (saldo geral) | Maior. |
| 4 | `goalsFor` (gols pró) | Maior. |
| 5 | `goalsAgainst` (gols contra) | Menor. |
| 6 | `disciplinaryPoints` | Menor. |
| 7 | `drawOrder` | Ordem registrada. |

**Regras de aplicação:**

- O confronto direto só é aplicado a um grupo de **exatamente dois** times.
- O confronto direto considera **dois jogos**: soma os pontos de cada time nos dois confrontos; se empatar, compara o saldo agregado dos dois jogos; se ainda empatar, seguem os critérios 2..6.
- O confronto direto só vale se **os dois jogos** estiverem `finished`. Se um deles não estiver, o critério é ignorado por completo e seguem os critérios 2..6.
- W.O. conta como 1x0 no confronto direto, tanto para pontos quanto para o saldo agregado.
- Com 3+ times empatados em pontos, o confronto direto **não** é aplicado; começam os critérios 2..6.
- Se um critério dividir um grupo de 3+ e produzir um subgrupo de exatamente dois, `resolveGroup` reaplica o confronto direto (com os dois jogos) a esses dois.
- Se o confronto direto empatar em pontos e saldo agregado, ele é considerado empatado e seguem os critérios 2..6.
- Se todos os critérios empatarem, o sorteio decide; sem `drawOrder`, a validação falha (`VAL-018`) **quando a classificação é final**.
- Enquanto a classificação é provisória (alguma partida de grupo não `finished`), um empate total não exige `drawOrder`: a ordem exibida é a ordem fixa dos IDs `ta`…`tc` e não recebe badge “Sorteio”. Ao completar as 6 partidas, o `drawOrder` passa a ser obrigatório se o empate persistir.
- `splitByCriterion` preserva a ordem dos subgrupos pelo valor do critério (melhor primeiro) e usa a ordem atual do grupo para empates internos. A direção é a da tabela: `wins`, `goalDifference` e `goalsFor` em ordem decrescente; `goalsAgainst` e `disciplinaryPoints` em ordem crescente.
- A ordenação de nomes em estatísticas não interfere na classificação; a classificação usa apenas os critérios acima.

**Exemplo 1 — dois times, confronto direto decidido nos dois jogos:**

```text
A e B empatados em pontos.
Jogo 1: A 2x1 B. Jogo 2: B 1x0 A.
Pontos do confronto: A 3, B 3. Gols agregados: A 2, B 2 → saldo agregado 0 a 0.
→ segue wins; se iguais, saldo geral; se iguais, gols pró; se iguais, menos gols contra;
  se iguais, disciplina; se iguais, sorteio.
```

**Exemplo 2 — dois times, saldo agregado decide:**

```text
A e B empatados em pontos.
Jogo 1: A 3x1 B. Jogo 2: B 2x1 A.
Pontos do confronto: A 3, B 3. Gols agregados: A 4, B 3 → A fica à frente pelo saldo agregado.
```

**Exemplo 3 — dois times, um jogo não realizado:**

```text
A e B empatados em pontos; o segundo jogo entre eles está postponed.
→ o confronto direto é ignorado por completo; seguem wins, saldo geral, gols pró,
  menos gols contra, disciplina e sorteio.
```

**Exemplo 4 — três times, critério reduz para dois:**

```text
A, B e C empatados em pontos.
wins: todos 2 → não divide.
goalDifference: A +2, B +1, C +1 → subgrupos [A], [B,C].
→ B,C passam por resolveGroup([B,C]); o confronto direto dos dois jogos entre B e C
  é reaplicado antes dos critérios gerais.
```

**Exemplo 5 — três times, todos iguais:**

```text
A, B e C empatados em pontos, wins, goalDifference, goalsFor, gols contra e disciplina; grupo completo.
→ drawOrder decide os três; todos recebem badge “Sorteio”.
```

**Exemplo 6 — W.O. no confronto direto:**

```text
A e B empatados em pontos.
Jogo 1: A 1x0 B (W.O.). Jogo 2: B 2x0 A.
Pontos do confronto: A 3, B 3. Gols agregados: A 1, B 2 → B fica à frente.
```

### 7.4 ALG-004 — Cartões e pontos disciplinares

Para cada jogadora em cada partida:

```text
cardSummary(events, playerId):
  amarelos = events.filter(e => e.type=='yellow' && e.playerId==playerId).length
  vermelhosDiretos = events.filter(e => e.type=='red' && e.playerId==playerId).length
  se vermelhosDiretos > 1: erro VAL-022
  se vermelhosDiretos > 0 && amarelos >= 2: erro VAL-022
  se amarelos >= 3: erro VAL-022

  redDerivado = (amarelos == 2) ? 1 : 0
  redTotal = vermelhosDiretos + redDerivado

  se amarelos >= 2:
    pontos = 3                  // 1 amarelo + 2 vermelho; sem terceiro amarelo
  senão se vermelhosDiretos >= 1:
    pontos = 2 + amarelos       // 1 amarelo + 1 vermelho direto = 3
  senão:
    pontos = amarelos

  retornar { yellow: amarelos, red: redTotal, redDerived: redDerivado, points: pontos }
```

- `red` é o número exibido na coluna “Vermelhos”; inclui o segundo amarelo. `redDerived` é apenas o vermelho derivado do segundo amarelo.
- `points` é o valor usado no desempate e na tabela; **não** é `yellow*1 + red*2`.
- Um segundo amarelo **NÃO** deve ser registrado como evento `red` explícito. A UI mostra “2º amarelo → vermelho” no segundo amarelo.
- Um vermelho direto com um amarelo no mesmo jogo é permitido e vale 3 pontos.
- Não há suspensão nem bloqueio por acúmulo de amarelos entre partidas; `VAL-022` olha apenas a mesma partida.
- Cartões de W.O. contam para estatísticas/suspensão, exceto `no_show`, que não tem eventos.
- Cartões da final contam para estatísticas/suspensão, mas não para a classificação. Não há partida de 3º lugar; o amistoso (`friendly`) não tem cartões.

### 7.5 ALG-005 — Suspensões

```text
buildSuspensions(competition):
  resultado = []
  para cada time:
    partidas = matchesDoTime(time, competition.finalists).sort(byCanonicalOrder)
    para cada partida em partidas:
      reds = redCardsForTeamInMatch(time, partida)
      para cada red em reds:
        proxima = próxima partida canônica do time após partida
        pendente = proxima == null && competition.finalists == null &&
          partida.stage == 'group'
        resultado.push({
          playerId: red.playerId,
          teamId: time.id,
          reason: red.reason,          // direct | secondYellow
          sentOffIn: partida.id,
          suspendedFor: proxima?.id ?? null,
          pendingFinalists: pendente
        })
  retornar resultado
```

- `redCardsForTeamInMatch` inclui vermelhos diretos e vermelhos derivados de dois amarelos.
- `matchesDoTime(time, finalists)` inclui sempre as 4 partidas de grupo do time e inclui `final` somente quando `finalists != null` e o time é participante. Assim, a função não lança erro antes de a fase final estar definida.
- “Próxima partida” é a próxima na ordem canônica: `g1` → `g2` → `g3` → `g4` → `g5` → `g6` → `final`, considerando apenas partidas em que o time participa. Como cada time joga duas vezes em algumas datas, a ordem canônica dentro da mesma data é a ordem dos IDs.
- A validação impede ordem cronológica incompatível (`VAL-015`), então a ordem canônica coincide com a ordem real para partidas com `startsAt`.
- Se o time não tem próxima partida e `finalists` ainda é `null` após a última partida de grupo, `suspendedFor = null` e `pendingFinalists = true`: a suspensão pode valer para a final, mas o confronto ainda não está definido. Quando `finalists` for preenchido, o build recalcula: se o time se classificou, a suspensão vale para a final; se não se classificou, a suspensão não tem efeito.
- Se o time não tem próxima partida por não ter se classificado (`finalists != null`), `suspendedFor = null` e a suspensão não tem efeito.
- Se a próxima partida é `postponed` ou `scheduled`, a suspensão permanece pendente para ela.
- Se a próxima partida é `finished`, a suspensão foi cumprida e não se estende à seguinte.
- A jogadora suspensa **NÃO DEVE** ter nenhum evento na partida `suspendedFor` (`VAL-023`).
- Enquanto `pendingFinalists = true`, não há partida definida para bloquear; quando `finalists` for preenchido, o build recalcula e aplica `VAL-023` se o time estiver na final.
- Cartões da disputa de pênaltis não existem no modelo; não geram suspensão.

Status para a página do time:

```text
suspensionStatus(player):
  reds = todas as suspensões da jogadora
  pendente = reds.find(s => s.suspendedFor != null &&
    match(s.suspendedFor).status != finished)
  se pendente: “Suspensa na partida {adversário} de {data}”
  senão se reds.some(s => s.pendingFinalists):
    “Suspensão pendente — final a definir”
  senão se reds.some(s => s.suspendedFor == null):
    “Suspensão sem efeito — sem próxima partida”
  senão: “Sem suspensão”
```

### 7.6 ALG-006 — Estatísticas individuais e coletivas

```text
buildPlayerStats(competition):
  mapa = Map<PlayerId, PlayerStats>
  inicializar todas as jogadoras com zeros e active = (leftAt == null)

  para cada partida finished:
    para cada evento:
      se goal:
        stats[player].goals += 1
        se assistPlayerId != null: stats[assist].assists += 1
        // penalty: true também conta; shootout não é evento
      se ownGoal:
        stats[player].ownGoals += 1
        // não conta goals
      se yellow/red:
        stats[player].yellow/red += 1

    para cada jogadora da partida:
      resumo = cardSummary(partida.events, player.id)
      stats[player].red += resumo.redDerived
      stats[player].disciplinaryPoints += resumo.points

  retornar valores
```

```text
buildTeamStats(competition):
  mapa = Map<TeamId, TeamStats>
  inicializar os 3 times com zeros

  para cada partida oficial finished (stage 'group' ou 'final'):
    times = resolveMatchTeams(partida, competition.finalists)
    score = deriveScore(partida, competition.finalists)

    para cada (time, adversario) em [(times.homeTeamId, times.awayTeamId),
                                     (times.awayTeamId, times.homeTeamId)]:
      stats[time].played += 1
      stats[time].goalsFor += gols do time em score
      stats[time].goalsAgainst += gols do adversario em score

      se gols do time > gols do adversario:
        stats[time].wins += 1
      senão se gols do time < gols do adversario:
        stats[time].losses += 1
      senão:
        stats[time].draws += 1
        se partida.shootout != null:
          se partida.shootout.winnerTeamId == time:
            stats[time].shootoutWins += 1
          senão:
            stats[time].shootoutLosses += 1

    para cada jogadora em elencoDaPartida(times):   // home + away; inclui leftAt != null
      timeDaJogadora = time cujo elenco (team.players) contém jogadora.id   // elenco, não evento
      resumo = cardSummary(partida.events, jogadora.id)
      stats[timeDaJogadora].yellow += resumo.yellow
      stats[timeDaJogadora].red += resumo.red
      stats[timeDaJogadora].disciplinaryPoints += resumo.points

  para cada time:
    stats[time].goalDifference = stats[time].goalsFor - stats[time].goalsAgainst

  retornar os 3 times em ordem fixa ta, tb, tc
```

- `buildTeamStats` usa apenas partidas oficiais `group` + `final`; o amistoso (`friendly`) não entra.
- O placar do W.O. já é 1x0 em `deriveScore`; ele conta como vitória/derrota e entra em GP/GC/SG. Cartões de W.O. contam, exceto `no_show` (que não tem eventos).
- `timeDaJogadora` é resolvido pelo **elenco** (`team.players`), não pelo evento: eventos de cartão não carregam `teamId`. A busca considera apenas os dois participantes da partida (`times.homeTeamId` e `times.awayTeamId`); `VAL-006` garante que a jogadora não está em dois times e `VAL-019` garante que todo evento referencia jogadora de um dos dois elencos, então a resolução retorna exatamente um time; zero times é erro de invariante.
- `elencoDaPartida(times)` é a união dos elencos dos dois participantes, incluindo jogadoras com `leftAt != null`: cartões registrados enquanto a jogadora era elegível continuam contando para o time, mesmo que ela tenha saído depois.
- Em final decidida nos pênaltis, o tempo normal empatado conta como empate para os dois times; `shootoutWins`/`shootoutLosses` registram a campanha separadamente. O shootout não altera `goalsFor`, `goalsAgainst` nem `goalDifference`.
- `shootoutWins`/`shootoutLosses` são 0 para times que não disputaram shootout; não existe “shootout draw”.
- A classificação continua usando apenas as 6 partidas de grupo (`buildStandings`); `buildTeamStats` é para a página do time e não altera posições.

- Jogadoras sem eventos aparecem no elenco com zeros, mas não nas tabelas de líderes.
- Jogadoras com `leftAt != null` e eventos continuam nas estatísticas, com marca textual “fora do elenco ativo”.
- Gols contra não entram em `goals`; entram em `ownGoals`.
- Pênalti do tempo normal entra em `goals`; shootout não.
- Assistência em pênalti é inválida; assistência em gol contra é inválida.
- Cartões da final entram nas estatísticas; não há cartões de 3º lugar.
- Cartões de W.O. entram, exceto `no_show`.
- `teamStats` agregam as partidas oficiais do time (`group` + `final`) para a página do time; a classificação usa apenas `group`. O amistoso (`friendly`) não entra em nenhuma estatística.

**Ordenações normativas:**

| Tabela | Ordem |
|---|---|
| Artilharia | `goals` desc, `assists` desc, `compareText(nickname)` asc, `compareText(team.name)` asc, `playerId` asc. Somente `goals ≥ 1`. |
| Assistências | `assists` desc, `goals` desc, `compareText(nickname)` asc, `compareText(team.name)` asc, `playerId` asc. Somente `assists ≥ 1`. |
| Cartões por jogadora | `disciplinaryPoints` desc, `red` desc, `yellow` desc, `compareText(nickname)` asc, `compareText(team.name)` asc, `playerId` asc. Somente quem tem ao menos um cartão. |
| Cartões por time | `disciplinaryPoints` desc, `red` desc, `yellow` desc, `compareText(team.name)` asc, `teamId` asc. Todos os 3 times. |
| Gols contra | `ownGoals` desc, `compareText(nickname)` asc, `compareText(team.name)` asc, `playerId` asc. Somente `ownGoals ≥ 1`. |

### 7.7 ALG-007 — Finalistas, pódio e correções

```text
groupComplete = todas as 6 partidas de grupo estão finished
se groupComplete:
  ranking = rankTeams(competition)
  esperado = { final: [ranking[0].teamId, ranking[1].teamId] }
  se finalists == null: erro VAL-017
  se finalists.final != esperado.final: erro VAL-017 com antigos e novos
senão:
  se finalists != null: erro VAL-017
```

- Se `rankTeams` lançar `DrawRequiredError` durante a validação de `finalists`, o erro reportado é `VAL-018`; `VAL-017` não é emitido em cascata.
- `finalists.final[0]` é o mandante da final; `finalists.final[1]` é o visitante.
- A partida `final` não tem `homeTeamId`/`awayTeamId`; usa os finalistas. Não existe partida de 3º lugar.
- Se uma correção após a final mudar os finalistas, o build **DEVE** falhar listando os finalistas antigos e os novos. Atualizar `finalists` é a confirmação explícita.
- `notices` é o canal público para explicar a correção; o aviso de build é o canal operacional. Nenhum dos dois é obrigatório para o build passar, mas ambos são recomendados.
- Pódio:

```text
buildPodium(competition):
  se !groupComplete:
    champion=null; runnerUp=null; third=null
  senão:
    ranking = rankTeams(competition)
    third = ranking[2].teamId        // 3º da classificação, sem partida
    se final.status != finished:
      champion=null; runnerUp=null
    senão:
      finalists = competition.finalists
      vencedor = winnerOf(final, finalists)
      champion = vencedor
      runnerUp = (vencedor == finalists.final[0]) ? finalists.final[1] : finalists.final[0]
```

- `winnerOf(match, finalists)` usa W.O., shootout ou placar normal, nesta ordem de precedência: W.O. → shootout → placar normal. Para `final`, `finalists` é obrigatório.
- `third` é o 3º colocado da classificação final do grupo; não depende do resultado da final e não existe `fourth`. O pódio completo (campeão, vice e 3º) só é exibido quando a `final` está `finished`.
- A final encerrada não exige outra partida: não há disputa de 3º lugar (`VAL-016`).

### 7.8 ALG-008 — Próximo jogo, resultados e estados da Início

```text
homeState(competition, now):
  groupMatches = matches.filter(stage == group)
  groupComplete = groupMatches.every(m => m.status == finished)
  final = match('final')

  se final.status == finished:
    retornar 'afterFinal'
  se groupComplete:
    retornar 'groupComplete'
  primeiroDia = min(groupMatches.date)
  hoje = localDate(now, 'America/Sao_Paulo')
  se groupMatches.every(m => m.status != finished) && hoje < primeiroDia:
    retornar 'beforeCup'
  retornar 'duringGroup'
```

```text
isPast(match, now, today):
  se match.status != scheduled: false
  se match.startsAt != null: Date.parse(match.startsAt) < now
  senão: match.date < today

nextMatch(competition, now):
  candidatos = matches.filter(status == scheduled && !isPast)
  ordenar por (date asc, startsAt asc com null por último, canonicalOrder asc)
  retornar primeiro ou null

nextRoundMatches(competition, now):
  next = nextMatch
  se next == null: []
  hoje = localDate(now, 'America/Sao_Paulo')
  retornar matches.filter(m => m.status == scheduled &&
    m.date == next.date && !isPast(m, now, hoje))
    .sort(byCanonicalOrder)
```

- `isPast` usa `<` estrito: uma partida marcada para agora ainda é próxima.
- Partida `scheduled` com data passada e sem `startsAt` é “Resultado pendente”; não é próximo jogo.
- Partida `postponed` nunca é próximo jogo; aparece como “Adiada” na lista.
- Se não há próximo jogo, mas há `scheduled` vencida, a Início mostra “Resultado pendente”.
- Se o grupo terminou e a final ainda não encerrou, o próximo jogo é a final; o amistoso (`friendly`) não é partida e não entra em `nextMatch`.
- Se a final terminou, a Início mostra campeão/pódio (estado 4).
- **NÃO DEVE** haver contagem regressiva nem cálculo de “agora” no navegador.

```text
lastResults(competition):
  finished = matches.filter(status == finished)
  se vazio: []
  ultimaData = max(finished.date)
  retornar finished.filter(date == ultimaData)
    .sort(byCanonicalOrder)
    .slice(0, 4)
```

### 7.9 ALG-009 — Ordem da linha do tempo

```text
sortEvents(events):
  events.map((event, index) => ({event, index}))
    .sort((a,b) => {
      se a.event.minute == null && b.event.minute == null:
        retornar a.index - b.index
      se a.event.minute == null: retornar 1
      se b.event.minute == null: retornar -1
      se a.event.minute != b.event.minute:
        retornar a.event.minute - b.event.minute
      retornar a.index - b.index
    })
    .map(x => x.event)
```

- Minuto ascendente; eventos sem minuto ao final; empate pelo índice no arquivo.
- A ordenação é apenas de apresentação; não altera placar, estatísticas ou classificação.
- O segundo amarelo é exibido no evento do segundo amarelo com “2º amarelo → vermelho”; não há item separado de vermelho derivado.

### 7.10 ALG-010 — Pipeline de validação

```text
validate(rawText):
  doc = parseYaml(rawText)                 // VAL-001
  data = doc.toJS()
  schema = competitionSchema.safeParse(data) // VAL-002
  se schema falha: retornar erros de schema (parar semântica)

  erros = []
  avisos = []
  executar em ordem, agregando:
    VAL-003 edição/fuso
    VAL-004 times
    VAL-005 abreviações
    VAL-006 IDs de jogadora
    VAL-007 apelidos
    VAL-008 intervalos
    VAL-009 máximo de ativas
    VAL-010 vínculo após atuação
    VAL-011 conjunto de partidas
    VAL-012 confrontos do grupo
    VAL-013 datas/horas
    VAL-014 status × eventos/W.O./shootout
    VAL-015 ordem canônica
    VAL-016 fase final × grupo
    VAL-017 finalistas
    VAL-018 sorteio
    VAL-019 elenco da partida
    VAL-020 elegibilidade
    VAL-021 assistências
    VAL-022 cartões
    VAL-023 suspensão
    VAL-024 W.O.
    VAL-025 shootout
    VAL-026 placar materializado
    VAL-027 times da final
    VAL-028 referências
    VAL-029 eventos de W.O.
    VAL-030 shootout obrigatório
    VAL-031 notices
    VAL-032 privacidade
    VAL-033 amistoso
    VAL-W01..W04 avisos
  retornar { erros, avisos }
```

- A ordem é a da tabela, mas a agregação é independente; um erro não impede os demais, exceto quando o schema falha.
- Erros que dependem de referências inválidas são omitidos para evitar cascata; o erro de referência já é reportado.
- O exit code é `1` se houver erro; `0` se houver apenas avisos.
- O resumo em Markdown é gerado mesmo em falha e escrito em `GITHUB_STEP_SUMMARY` quando disponível.

### 7.11 ALG-011 — W.O. e pênaltis: apresentação

```text
formatScore(match, finalists):
  se match.stage != 'group' && finalists == null:
    retornar “Confrontos a definir”
  se match.status == postponed: retornar “Adiada”
  se match.status == scheduled: retornar “A definir”
  score = deriveScore(match, finalists)
  se match.walkover != null:
    retornar “{score.home} x {score.away} (W.O.)”
  se match.shootout != null:
    retornar “{score.home} ({shootout.home}) x ({shootout.away}) {score.away}”
  retornar “{score.home} x {score.away}”

formatScoreAccessible(match, finalists, homeName, awayName):
  se match.stage != 'group' && finalists == null:
    retornar “Confrontos a definir; a fase final depende das 6 partidas da classificatória.”
  se match.status == postponed:
    retornar “Partida adiada.”
  se match.status == scheduled:
    retornar “Partida agendada; placar a definir.”
  score = deriveScore(match, finalists)
  times = resolveMatchTeams(match, finalists)
  vencedor = winnerOf(match, finalists)
  nomeVencedor = vencedor == times.homeTeamId ? homeName : awayName
  se match.walkover != null:
    motivo = rótulo(match.walkover.reason)   // “Não compareceu”, “Menos de 3 jogadoras em quadra” ou “Desistência”
    retornar “{homeName} {score.home} a {score.away} {awayName} por W.O. — {motivo}.”
  se match.shootout != null:
    retornar “{homeName} {score.home} a {score.away} {awayName} no tempo normal; {shootout.home} a {shootout.away} nos pênaltis; vitória de {nomeVencedor}.”
  retornar “{homeName} {score.home} a {score.away} {awayName}.”
```

- O placar de pênaltis usa a ordem mandante/visitante da partida (finalistas[0]/[1]).
- O W.O. é exibido na ordem mandante/visitante: se o visitante venceu, o placar é `0 x 1 (W.O.)`, nunca um `1 x 0` fixo.
- A UI **DEVE** incluir texto acessível: “{home} {homeScore} a {awayScore} {away} no tempo normal; {shootout.home} a {shootout.away} nos pênaltis; vitória de {winner}.”
- W.O. mostra o motivo: “Não compareceu”, “Menos de 3 jogadoras em quadra” ou “Desistência”.
- Gols ocorridos antes de uma interrupção de W.O. não são registrados no MVP; a limitação é documentada na UI? Não: a UI apenas não inventa gols. A limitação fica na §16.

### 7.12 ALG-012 — Cartão informativo do amistoso

```text
buildFriendlyCard(competition):
  se competition.friendly == null: retornar null
  retornar {
    title: “Amistoso do 3º colocado”,
    date: friendly.date,
    startsAt: friendly.startsAt,
    venue: friendly.venue,
    note: friendly.note,
    informational: true
  }
```

- O cartão **DEVE** aparecer em `/fase-final/` antes do cartão da final e **NÃO DEVE** aparecer em `/jogos/`, na Início, na classificação, nas estatísticas ou no pódio.
- O cartão **DEVE** conter o rótulo textual “Informativo — não é partida oficial” e a explicação “Não altera classificação, estatísticas, suspensões ou pódio.”
- O cartão **NÃO DEVE** ter placar, status de partida, eventos, cartões, link para detalhe de partida, botão de resultado ou qualquer ação de edição.
- O amistoso **NÃO DEVE** ser contado em `nextMatch`, `lastResults`, `groupComplete`, número de partidas, classificação, estatísticas, suspensões ou pódio (`SPEC-016`, `VAL-033`).
- Se `friendly` for `null`, nenhum cartão ou placeholder é renderizado.
- O cartão usa os mesmos tokens, tipografia e espaçamento dos cards de partida, mas com tratamento visual informativo (sem placar e sem estado competitivo).

---

## 8. Validação

### 8.1 Comportamento geral

- A validação **DEVE** rodar em `npm run validate` e no build.
- Erros de sintaxe/schema interrompem a fase semântica; erros semânticos são todos agregados.
- Cada issue tem `code`, `severity`, `path`, `expected`, `found` e `message` em pt-BR.
- O processo sai com código `1` se houver qualquer erro bloqueante; `0` se houver apenas avisos.
- Nenhum build parcial ou “site anterior” é sobrescrito quando a validação falha: o workflow não executa o upload/deploy.
- O resumo do GitHub Actions **DEVE** listar contagem de erros/avisos e os caminhos afetados, sem dados pessoais.
- A mensagem **DEVE** dizer o que se esperava e o que foi encontrado; nunca apenas “dados inválidos”.

### 8.2 Catálogo bloqueante

| ID | Condição | Esperado | Encontrado | Ref |
|---|---|---|---|---|
| VAL-001 | YAML não parseia (sintaxe, indentação, âncora inválida). | YAML 1.2 válido. | Erro com linha/coluna. | §5.2 |
| VAL-002 | Schema Zod falha: campo desconhecido, tipo errado, campo obrigatório ausente, enum inválido, string vazia/curta/longa, formato inválido. | Schema §5.4. | Issue com caminho e valor. | §5.4 |
| VAL-003 | `edition != 2026` ou `timezone != "America/Sao_Paulo"`. | `2026` / `America/Sao_Paulo`. | Valor encontrado. | DM-001 |
| VAL-004 | Quantidade de times ≠ 3, IDs diferentes de `ta`…`tc` ou IDs duplicados. | Exatamente 3 times `ta`,`tb`,`tc`. | Lista encontrada. | DM-001/002 |
| VAL-005 | Abreviação de time duplicada (comparação case-insensitive). | Abreviações únicas. | Duplicata e times. | DM-002 |
| VAL-006 | ID de jogadora duplicado no mesmo time ou em times diferentes. | ID único na edição. | ID e times. | DM-003 |
| VAL-007 | Apelido duplicado dentro do time após `normalizeText`/`uniqueKey`; apelido vazio após normalização. | Único no time, não vazio. | Apelido e time. | DM-003 |
| VAL-008 | `leftAt != null` e `leftAt <= joinedAt`. | `leftAt > joinedAt`. | Datas encontradas. | DM-012 |
| VAL-009 | Mais de 8 jogadoras ativas simultaneamente em qualquer instante (inclui a 9ª ativa). | Máximo 8. | Instante e contagem. | DM-012 |
| VAL-010 | Jogadora com evento em partida de time diferente do time atual (transferência após atuar). | Vínculo imutável após o primeiro evento. | Jogadora, time atual, partida. | DM-012 |
| VAL-011 | Conjunto de partidas ≠ 7 IDs exatos; ID duplicado; `stage`/`round` incompatível com o ID. | `g1`…`g6`, `final`. | Lista encontrada. | DM-004 |
| VAL-012 | Confrontos de grupo diferentes dos seis do turno e returno; time repetido; time contra si mesmo; par sem os dois jogos. | `g1` ta×tb, `g2` tb×tc, `g3` ta×tc, `g4` tb×ta, `g5` tc×ta, `g6` tc×tb. | Confronto encontrado. | DM-004 |
| VAL-013 | Data de calendário inválida; `startsAt` inválido; data local de `startsAt` em `America/Sao_Paulo` diferente de `date`; `notice.date` inválida. | Data real e coerente com o fuso. | Valores encontrados. | DM-004/011 |
| VAL-014 | `finished` sem `startsAt`; `scheduled`/`postponed` com eventos, `walkover` ou `shootout`. | `finished` com `startsAt`; demais sem eventos/W.O./shootout. | Status e campos. | DM-004 |
| VAL-015 | Time com duas partidas no mesmo `startsAt`; ordem canônica incompatível com `startsAt`. | Ordem canônica e cronologia coerentes, inclusive nas datas com dois jogos do mesmo time. | Partidas e horários. | DM-004 |
| VAL-016 | Final encerrada antes de as 6 partidas de grupo terminarem; final com eventos sem `finalists`. | Grupo completo antes da final; final só com finalistas definidos. | Status e IDs. | DM-009 |
| VAL-017 | `finalists` nulo com grupo completo; não nulo com grupo incompleto; `final` inválida; divergente da classificação; divergente após a final. | Snapshot `[1º, 2º]` válido e igual à classificação. | Antigos e novos finalistas. | DM-009 |
| VAL-018 | `drawOrder` inválido (não é permutação dos 3) ou ausente quando um empate chega ao sorteio na classificação final (6 partidas de grupo `finished`). | Permutação dos 3 ou `null`; presente quando necessário. | Valor e grupo. | DM-010 |
| VAL-019 | Evento referencia jogadora fora do elenco dos dois times da partida. | Jogadora do elenco do time na partida. | Jogadora, times, partida. | DM-005 |
| VAL-020 | Jogadora inelegível no início da partida: `joinedAt >= startsAt` ou (`leftAt != null` e `leftAt <= startsAt`). | `joinedAt < startsAt < leftAt` (ou `leftAt` nulo). | Datas e partida. | DM-012 |
| VAL-021 | Assistência inválida: igual à marcadora; de outro time; em gol de pênalti; em gol contra; `ownGoal` com assistência/pênalti. | Assistência opcional, do mesmo time, diferente, só em `goal` normal. | Marcadora, assistente, tipo. | DM-005 |
| VAL-022 | Terceiro amarelo **no mesmo jogo**; `red` explícito com dois amarelos; mais de um `red` explícito; `red` em evento de `ownGoal` (schema). | No máximo 2 amarelos e 1 vermelho direto por jogadora/partida; 2º amarelo é derivado. | Jogadora, partida, cartões. | DM-005 |
| VAL-023 | Evento de jogadora suspensa na partida em que ela cumpre suspensão. | Nenhum evento da suspensa na partida `suspendedFor`. | Jogadora, partida, motivo. | DM-013 |
| VAL-024 | W.O. inválido: partida não `finished`; vencedor fora dos participantes; motivo inválido; `shootout` presente; `winnerTeamId` ausente. | `walkover` em partida `finished`, vencedor participante, motivo válido, sem shootout. | Campos encontrados. | DM-007 |
| VAL-025 | `shootout` inválido: stage diferente de `final`; partida não `finished`; W.O. presente; tempo normal não empatado; valores iguais ou negativos; eventos de shootout (schema). | Só `final`, finished, sem W.O., empate normal, valores ≥0 e diferentes. | Valores e partida. | DM-008 |
| VAL-026 | Placar materializado: qualquer campo `score`, `homeScore`, `awayScore`, `result`, `points`, `standings` ou similar. | Placar/classificação sempre derivados. | Campo e caminho. | DM-006/015 |
| VAL-027 | Partida `final` com `homeTeamId`/`awayTeamId` ou `round` diferente de `null`. | Times derivados de `finalists`; `round: null`. | Campos encontrados. | DM-009 |
| VAL-028 | Referência inexistente a time, jogadora, partida ou notice (além do schema). | IDs existentes na edição. | Referência e origem. | §5.3 |
| VAL-029 | `no_show` com qualquer evento; `insufficient_players`/`withdrawal` com `goal`/`ownGoal`; W.O. com assistência. | `no_show` sem eventos; demais só cartões; W.O. sem gols/assistências. | Eventos encontrados. | DM-007 |
| VAL-030 | `final` `finished` com empate no tempo normal sem `shootout`; `shootout` com tempo normal não empatado. | Empate normal ⇔ shootout presente. | Placar e shootout. | DM-008 |
| VAL-031 | `notice` com data inválida ou mensagem vazia/longa. | Data real e mensagem 1..300. | Valores encontrados. | DM-011 |
| VAL-032 | Campo de privacidade proibido: `fullName`, `photo`, `contact`, `shirtNumber`, `jersey`, `birthDate`, `phone`, `email`, `address`, `instagram`. | Nenhum campo pessoal além de `nickname`, `position`, `joinedAt`, `leftAt`. | Campo e caminho. | DM-014 |
| VAL-033 | `friendly` inválido: data inexistente, data diferente da final, horário inválido ou não anterior à final quando ela tem horário, local vazio, nota vazia; qualquer campo de partida (`status`, `events`, `score`, `walkover`, `shootout`, `homeTeamId`, `awayTeamId`, times). | Metadado informativo na data da final; se a final tiver horário, antes dele; com local e nota; sem campos de partida. | Campos e valores encontrados. | DM-016/SPEC-016 |

**Sobre “placar incompatível”:** como não existe placar armazenado, não há como divergir. A regra é garantida por `VAL-026` (campo de placar é proibido) e pelos testes de derivação (`TST-028`…`TST-037`). Se um campo de placar for adicionado no futuro, a validação de igualdade com `deriveScore` passa a ser obrigatória.

### 8.3 Avisos (não bloqueiam)

| ID | Condição | Mensagem | Efeito |
|---|---|---|---|
| VAL-W01 | Time com menos de 7 jogadoras ativas. | “Time {nome} tem {n} jogadoras ativas; o alvo é 7 ou 8. A publicação não é bloqueada.” | Job summary; badge público só se `<5` (regra de UI, não de validação). |
| VAL-W02 | Partida `scheduled`/`finished` fora da data original do calendário (24/11, 26/11, 01/12, 03/12). | “Partida {id} está em {data}, fora do calendário original. Confirme o adiamento.” | Job summary. `postponed` é isenta. |
| VAL-W03 | Nome de time duplicado após normalização. | “Os times {a} e {b} têm o mesmo nome; a abreviação distingue, mas confirme o nome público.” | Job summary. |
| VAL-W04 | Partida `scheduled` com data/horário já passados no build. | “Partida {id} está agendada, mas a data passou. A UI mostrará ‘Resultado pendente’.” | Job summary; não bloqueia. |

- Avisos **NÃO DEVEM** alterar a classificação, o placar, o pódio ou as estatísticas.
- O badge “Elenco em formação” é regra de UI: aparece com menos de 5 ativas, independentemente de `VAL-W01`. Entre 5 e 6, só o aviso de build.
- O aviso de elenco não impede a publicação; o PRD exige sinalização, não bloqueio.

### 8.4 Formato do erro

```ts
export interface ValidationIssue {
  readonly code: string;              // VAL-001 etc.
  readonly severity: 'error' | 'warning';
  readonly path: string;              // matches[0].events[2].assistPlayerId
  readonly expected: string;
  readonly found: string;
  readonly message: string;           // pt-BR, sem jargão desnecessário
}
```

Exemplo:

```text
VAL-021 · matches[0].events[2].assistPlayerId
Esperado: jogadora do time da marcadora (ta), diferente de p-002.
Encontrado: p-009 (time tb).
A assistência deve ser do mesmo time da marcadora e não pode ser a própria marcadora.
```

### 8.5 Resumo do GitHub Actions

```text
## Validação da Copa 2026

- Erros bloqueantes: 2
- Avisos: 1

### Erros
| Código | Caminho | Mensagem |
|---|---|---|
| VAL-021 | matches[0].events[2].assistPlayerId | ... |

### Avisos
| Código | Caminho | Mensagem |
|---|---|---|
| VAL-W01 | teams[2] | ... |
```

- O resumo é escrito em `$GITHUB_STEP_SUMMARY` pelo `scripts/validate-data.ts`.
- Em sucesso, mostra “Validação concluída sem erros” e a lista de avisos.
- Em falha, mostra os erros e o processo sai com `1`; o job de deploy não roda.
- Nenhum nome completo, ID privado ou dado pessoal aparece no resumo.

### 8.6 Exemplos de mensagens

- `VAL-009`: “Elenco com 9 jogadoras ativas em 2026-11-24T19:00:00-03:00; máximo permitido: 8. A 9ª jogadora deve sair com `leftAt` ou ser registrada em outro time.”
- `VAL-017`: “Finalistas divergentes da classificação. Antigos: final [ta, tb]. Novos: final [ta, tc]. Atualize `finalists` para confirmar a correção.”
- `VAL-023`: “p-016 (tc) está suspensa por 2º amarelo em g3 e não pode ter eventos em g5.”
- `VAL-024`: “W.O. inválido em g2: `no_show` não pode ter eventos; encontrados 2 cartões.”
- `VAL-025`: “Shootout inválido em final: o tempo normal terminou 2x1; shootout só é permitido em empate.”
- `VAL-032`: “Campo desconhecido em teams[0].players[0]: `fullName`. Remova o campo; a privacidade permite apenas id, nickname, position, joinedAt e leftAt.”
- `VAL-033`: “Amistoso em 03/12/2026 às 21:00: o amistoso deve ocorrer na mesma data da final e antes do horário da final (20:30). Corrija `friendly.startsAt` ou remova o metadado.”

---

## 9. Contratos internos

### 9.1 Contratos de dados e domínio

```ts
// lib/data/load.ts
export function loadCompetition(filePath?: string): Competition;
export function parseCompetition(rawText: string, source: string): Competition;
export function validateCompetition(raw: unknown): ValidationResult;

// lib/domain/score.ts
export function resolveMatchTeams(match: Match, finalists: Finalists | null):
  { readonly homeTeamId: TeamId; readonly awayTeamId: TeamId };
export function toResolvedMatch(match: Match, finalists: Finalists | null): ResolvedMatch;
export function deriveScore(match: Match, finalists?: Finalists | null): Score | null;
export function winnerOf(match: Match, finalists?: Finalists | null): TeamId | null;

// lib/domain/standings.ts
export function rankTeams(competition: Competition): RankingResult;
export function buildStandings(competition: Competition): readonly StandingRow[];

// lib/domain/discipline.ts
export function cardSummary(events: readonly Event[], playerId: PlayerId):
  { readonly yellow: number; readonly red: number;
    readonly redDerived: number; readonly points: number };
export function buildSuspensions(competition: Competition): readonly Suspension[];
export function suspendedFor(match: Match, competition: Competition): ReadonlySet<PlayerId>;

// lib/domain/stats.ts
export function buildPlayerStats(competition: Competition): readonly PlayerStats[];
export function buildTeamStats(competition: Competition): readonly TeamStats[];

// lib/domain/finalists.ts
export function buildExpectedFinalists(competition: Competition): Finalists | null;
export function buildPodium(competition: Competition): Podium;

// lib/domain/friendly.ts
export function buildFriendlyCard(competition: Competition): FriendlyCard | null;

// lib/domain/home.ts
export type HomeState = 'beforeCup' | 'duringGroup' | 'groupComplete' | 'afterFinal';
export function getHomeState(competition: Competition, now: Date): HomeState;
export function getNextMatch(competition: Competition, now: Date): Match | null;
export function getNextRoundMatches(competition: Competition, now: Date): readonly Match[];
export function getLastResults(competition: Competition): readonly Match[];

// lib/format/*
export function formatDate(date: string): string;                 // 24/11/2026
export function formatWeekday(date: string): string;              // terça-feira
export function formatTime(iso: string): string;                   // 19:00
export function formatDateTime(iso: string): string;               // 24/11/2026 às 19:00
export function formatBuildTimestamp(now: Date): string;           // ... (horário de Brasília)
export function formatScore(match: Match, finalists: Finalists | null): string;
export function formatScoreAccessible(
  match: Match,
  finalists: Finalists | null,
  homeName: string,
  awayName: string,
): string;
export function formatStatus(match: Match, now: Date): string;
```

**Regras de contrato:**

- Funções de domínio recebem `Competition` validada; não validam de novo.
- Funções que dependem de “agora” recebem `now`; não usam `Date.now()`.
- Nenhuma função muta arrays/objetos de entrada. Retornos são novos arrays ou `readonly`.
- `buildStandings` é um alias de `rankTeams(...).rows`, sem lógica duplicada.
- `winnerOf` retorna `null` para empate normal sem shootout, para partida não finished e para partida sem vencedor.
- `formatStatus` retorna “Agendada”, “Encerrada”, “Adiada” ou “Resultado pendente”, nunca apenas uma classe CSS.
- `formatScore` retorna o texto visual (“A definir”, “Adiada”, `1 x 0 (W.O.)`, `1 (4) x (3) 1` ou `2 x 1`); `formatScoreAccessible` retorna a frase completa com nomes e placar. Componentes não montam o formato manualmente.

### 9.2 Contratos de páginas

Cada página **DEVE**:

1. Chamar `loadCompetition()` uma vez e usar seletores de domínio.
2. Definir `title`, `description`, `canonicalPath` e `activeNav`.
3. Renderizar um único `<h1>`, com seções `<h2>`/`<h3>` em ordem.
4. Não conter dados de times, partidas, resultados ou estatísticas hardcoded.
5. Não conter `client:*`, `<script>` ou chamadas de rede.
6. Usar `withBase()` para todos os links internos.
7. Renderizar estados vazios explícitos quando não houver dados.

### 9.3 Contratos de componentes

| Componente | Props principais | Obrigações |
|---|---|---|
| `BaseLayout.astro` | `title`, `description`, `canonicalPath`, `activeNav`, `noindex?` | `<html lang="pt-BR">`, skip link, header, nav, `<main id="conteudo">`, footer, notices, meta tags. |
| `SiteHeader.astro` | `activeNav` | Nome público, nav desktop, `<details>` “Menu” no mobile, `aria-current="page"`. |
| `SiteFooter.astro` | `buildTimestamp` | Nome público, “Atualizado em … (horário de Brasília)”, sem instituição/Airbnb/analytics. |
| `NoticeBanner.astro` | `notices` | `<aside aria-labelledby="avisos-title">`, lista com `<time>`, nada só por cor. |
| `MatchCard.astro` | `match`, `competition`, `now`, `showStage?` | Times, fase, data, horário/local com fallback, status textual, placar/W.O./shootout, link para detalhe. Nunca é usado para o amistoso. |
| `FriendlyCard.astro` | `friendly` (`FriendlyCard`) | Cartão informativo na Fase final, antes da final; rótulo “Informativo — não é partida oficial”, data, horário, local e nota; sem placar, status, link de partida ou ação. |
| `Score.astro` | `match`, `finalists`, `homeTeam`, `awayTeam` | Usa `formatScore` e `formatScoreAccessible`; nunca só parênteses sem explicação. |
| `StatusBadge.astro` | `status`, `overdue?` | Texto visível; variantes não dependem de cor. |
| `StandingsTable.astro` | `rows`, `provisional`, `caption` | Tabela semântica, caption, `th scope`, contêiner de rolagem focável e rotulado, badge “Sorteio” textual. |
| `RosterTable.astro` | `players`, `suspensions`, `stats`, `mode` | Apelido, posição, gols, assistências, cartões, pontos, status de suspensão; marca “fora do elenco ativo”. |
| `StatsTable.astro` | `rows`, `columns`, `caption`, `emptyMessage` | Tabela semântica; estados vazios; marca “fora do elenco ativo”. |
| `EmptyState.astro` | `title`, `description` | Texto claro, sem dados inventados. |

- Componentes **NÃO DEVEM** calcular classificação, estatísticas ou suspensões; recebem dados prontos.
- Componentes **NÃO DEVEM** usar `dangerouslySetInnerHTML`.
- Textos de `notice`, `venue`, `nickname` e nomes de time são escapados pelo Astro.
- Nenhum componente renderiza ID de jogadora, `joinedAt`, `leftAt` ou o mapeamento privado.

### 9.4 Contrato de metadados

```ts
export interface PageMeta {
  readonly title: string;          // único, com nome público quando fizer sentido
  readonly description: string;    // 50..160 caracteres, pt-BR
  readonly canonicalPath: string;  // com base e barra final
  readonly ogType: 'website';      // MVP: sempre website
  readonly noindex?: boolean;      // apenas 404
}
```

- `canonicalPath` é convertido em URL absoluta com `site + base`.
- `og:title`, `og:description`, `og:url`, `og:type` são obrigatórios.
- `og:image` **NÃO DEVE** existir no MVP.
- `og:site_name` = nome público.
- 404 tem `noindex` e não tem canonical/OG.
- Nenhum metadado contém “Sesc”, “Airbnb”, “Airbnb Cereal” ou “Circular”.

### 9.5 Erros e logging

- `DataValidationError` contém `issues: readonly ValidationIssue[]` e uma mensagem resumida.
- O build Astro **DEVE** falhar com a lista completa, não apenas o primeiro erro.
- O script de validação imprime uma tabela legível e grava o resumo do Actions.
- Erros inesperados (bugs) devem incluir a função e o caminho, sem mascarar como erro de dados.
- Nenhum log imprime dados pessoais; IDs opacos são permitidos.

---

## 10. Interface

### 10.1 Catálogo de rotas

| Rota | Arquivo | Conteúdo | `activeNav` | Título |
|---|---|---|---|---|
| `/` | `index.astro` | Início com 4 estados | `inicio` | Copa de Futsal Feminino Vila Mariana 2026 |
| `/jogos/` | `jogos/index.astro` | Lista por data | `jogos` | Jogos — Copa … |
| `/jogos/g1/`…`/jogos/g6/` | `jogos/[matchId].astro` | Detalhe de partida | `jogos` | {TA} x {TB} — {data} — Copa … |
| `/jogos/final/` | idem | Detalhe da final | `jogos` | Final — Copa … |
| `/classificacao/` | `classificacao/index.astro` | Tabela e critérios | `classificacao` | Classificação — Copa … |
| `/times/` | `times/index.astro` | 3 times | `times` | Times — Copa … |
| `/times/ta/`…`/times/tc/` | `times/[teamId].astro` | Elenco e histórico | `times` | {Time} ({abrev}) — Copa … |
| `/estatisticas/` | `estatisticas/index.astro` | Artilharia, assistências, cartões, gols contra | `estatisticas` | Estatísticas — Copa … |
| `/fase-final/` | `fase-final/index.astro` | Final, card do amistoso e pódio | `fase-final` | Fase final — Copa … |
| `/404.html` | `404.astro` | Página não encontrada | — | Página não encontrada — Copa … |
| `/regulamento/` | **não existe** | 404 | — | — |

- Todas as rotas usam barra final, exceto `404.html`.
- URLs com IDs de time são estáveis; renomear o time não muda `/times/ta/`.
- `/jogos/[matchId]` tem `getStaticPaths` fechado nos 7 IDs (`g1`…`g6`, `final`); qualquer outro caminho cai no 404. `/jogos/terceiro/` não existe.
- `/times/[teamId]` tem `getStaticPaths` fechado em `ta`, `tb` e `tc`; `/times/td/` não existe.
- Nenhuma rota, link, metadado ou placeholder de Regulamento.
- Nenhuma rota para o amistoso; ele é apenas um card em `/fase-final/`.
- Nenhuma rota de admin, API, busca, filtro ou edição.

### 10.2 Layout global

Ordem do documento:

```text
<a class="skip-link" href="#conteudo">Pular para o conteúdo</a>
<header>
  <a href="/futsal-cup/">Copa de Futsal Feminino Vila Mariana 2026</a>
  <nav aria-label="Principal"> ... 6 links ... </nav>          // desktop
  <details class="menu-mobile">
    <summary>Menu</summary>
    <nav aria-label="Principal (menu móvel)"> ... 6 links ... </nav>
  </details>
</header>
<aside aria-labelledby="avisos-title"> ... notices, se houver ... </aside>
<main id="conteudo" tabindex="-1"> ... </main>
<footer> ... </footer>
```

- Nav: Início, Jogos, Classificação, Times, Estatísticas, Fase final. Sem Regulamento.
- `aria-current="page"` no link ativo, com indicador visual que não depende só de cor (sublinhado + peso).
- O `<summary>` “Menu” é focável, tem alvo mínimo de 44×44px e funciona com Enter/Espaço nativamente.
- No desktop (`min-width: 768px`), o menu mobile fica oculto e a nav desktop visível; no mobile, o contrário. Apenas uma nav é exibida por vez.
- Não há JS para abrir/fechar o menu; `<details>` nativo resolve.
- O header não é sticky (evita foco obscurecido).
- O rodapé contém o nome público e “Atualizado em {data} às {hora} (horário de Brasília)”. Não contém instituição, Airbnb, analytics, cookies ou links de terceiros.
- O skip link é o primeiro elemento focável e fica visível ao receber foco.

### 10.3 Início — quatro estados

O estado é calculado no build por `getHomeState(competition, now)`. Não há contagem regressiva.

#### UI-HOME-01 — Antes da copa

Condição: `hoje < primeira data do grupo` e nenhuma partida de grupo `finished`.

- Nome público em `<h1>` curto.
- “Primeira rodada — {data da primeira rodada}” com os dois jogos do dia, sem data fixa no componente.
- Atalhos para Jogos, Times e Classificação.
- Classificação zerada com as 3 linhas e “Classificação provisória — nenhuma partida encerrada”.
- Sem “últimos resultados”; sem artilheira/líder de assistências; sem dados inventados.
- Sem contagem regressiva.

#### UI-HOME-02 — Durante a classificatória

Condição: grupo incompleto e `hoje >= primeira data` (ou já há resultado).

- “Próxima rodada” com **todos** os jogos da próxima data; se não houver próximo jogo, “Próxima rodada a definir” e o bloco de “Resultado pendente” para partidas vencidas.
- “Últimos resultados”: todos os jogos da última data encerrada, até 4.
- Resumo da classificação: 3 linhas (posição, time, pontos, jogos).
- Artilheira e líder de assistências somente se houver dados; em empate, mostrar a primeira colocada e “Empate na liderança: …” com até 3 nomes + “e mais N”.
- Link para Classificação e Estatísticas.
- Badge “Classificação provisória” visível.

#### UI-HOME-03 — Classificatória encerrada

Condição: as 6 partidas de grupo estão `finished`, final ainda não encerrada.

- Card “1º x 2º” da final com data, local, horário ou fallback, e link para o detalhe.
- Link para Fase final.
- Últimos resultados da última data encerrada.
- Classificação final (sem “provisória”), com o 3º colocado já definido.
- Se a final já estiver encerrada, o estado é o 4.

#### UI-HOME-04 — Após a final

Condição: `final` `finished`.

- Campeão em destaque com texto “Campeã: {time}” (não só cor).
- Pódio completo: 1º, 2º e 3º; não há 4º lugar.
- Link para Fase final.
- Resultado da final.
- Sem contagem regressiva; sem dados inventados.

**Fallback de agenda:** se não houver próximo jogo e existirem partidas `postponed`, a Início mostra “Agenda em atualização” no bloco de próxima rodada e mantém últimos resultados/classificação. Isso não cria um quinto estado; é um conteúdo do estado 2/3.

### 10.4 Jogos — lista e detalhe

**Lista (`/jogos/`)**

- Agrupar por `date` em ordem ascendente.
- Cada grupo tem `<h2>` com data e dia da semana: “Terça-feira, 24/11/2026”.
- Cada card mostra: fase (“Rodada 1”, “Rodada 2”, “Rodada 3”, “Final”), times, horário ou “Horário a definir”, local ou “Local a definir”, status textual e placar quando aplicável.
- O amistoso (`friendly`) **NÃO DEVE** aparecer na lista de jogos; ele existe apenas como card informativo na Fase final.
- Status: “Agendada”, “Encerrada”, “Adiada” ou “Resultado pendente” (derivado para `scheduled` vencida).
- W.O.: placar derivado na ordem mandante/visitante (1x0 para o vencedor) + “(W.O.)” + motivo.
- Shootout: “1 (4) x (3) 1” + texto acessível.
- Partidas `postponed` aparecem na data cadastrada com “Adiada”; não somem da lista.
- Partida `final` com `finalists: null` mostra “Confrontos a definir” no lugar dos times e não calcula placar.
- Link do card para `/jogos/{id}/`.

**Detalhe (`/jogos/{id}/`)**

- Cabeçalho: fase, times, data/hora, local, status, placar.
- `final` com `finalists: null`: “Confrontos a definir”, explicação de que a fase final depende das 6 partidas e link para Classificação; sem placar/eventos e sem chamar `resolveMatchTeams`.
- Placar normal, W.O. ou shootout com texto acessível.
- Eventos em ordem cronológica (ALG-009):
  - gol: “Gol de {apelido} ({time})”, tag “Pênalti” quando `penalty: true`, assistência quando houver;
  - gol contra: “Gol contra de {apelido} ({time}) — gol para {adversário}”;
  - amarelo: “Cartão amarelo para {apelido} ({time})”;
  - vermelho direto: “Cartão vermelho para {apelido} ({time})”;
  - segundo amarelo: “2º amarelo → vermelho para {apelido} ({time})” no segundo amarelo.
- Minuto exibido como “{n} min”; sem minuto, “Minuto não informado”.
- Seção “Desfalques por suspensão” para cada time; se não houver, “Nenhum desfalque por suspensão”.
- W.O.: banner “Vitória por W.O. — {motivo}”, nota se houver; sem gols fictícios.
- `no_show`: “Sem eventos registrados”.
- Partida `scheduled`/`postponed`: sem seção de eventos; mostrar “Partida ainda não realizada” ou “Partida adiada”.
- Partida `scheduled` vencida: “Resultado pendente”; sem placar.

### 10.5 Classificação

- Tabela com colunas: Posição, Time, Pontos, Jogos, V, E, D, GP, GC, SG, CA, CV, PD.
- `<caption>`: “Classificação da fase classificatória — Copa de Futsal Feminino Vila Mariana 2026”.
- Cabeçalhos com `<abbr title="...">` para V, E, D, GP, GC, SG, CA, CV e PD; a nota abaixo da tabela repete os significados por extenso.
- Time como `<th scope="row">`; posição como `<td>`.
- “Classificação provisória” visível enquanto qualquer partida de grupo não estiver `finished`.
- Badge “Sorteio” na linha do time cuja posição foi decidida por `drawOrder`, com texto oculto “posição definida por sorteio”.
- Nota abaixo da tabela: “V = vitórias, E = empates, D = derrotas, GP = gols pró, GC = gols contra, SG = saldo de gols, CA = cartões amarelos, CV = cartões vermelhos, PD = pontos disciplinares. Vermelhos incluem o segundo amarelo. Pontos disciplinares: amarelo 1, vermelho 2, segundo amarelo 3 no total; menor é melhor.”
- Lista ordenada dos critérios de desempate, incluindo “confronto direto só para dois times” e “sorteio”.
- Tabela dentro de `.table-scroll` com `role="region"`, `aria-labelledby`, `tabindex="0"` e `overflow-x:auto`; a página não tem overflow horizontal em 320px.
- Dica visível em telas estreitas: “Deslize horizontalmente para ver todas as colunas.”
- Se não houver partidas encerradas, mostrar as 3 linhas zeradas e o aviso de classificação provisória.

### 10.6 Times

**Lista (`/times/`)**

- 3 cards com nome, abreviação, posição/registro, número de atletas ativas, estatísticas coletivas (jogos, V/E/D no tempo normal, campanha nos pênaltis V/D, GP/GC/SG, cartões/pontos) e link.
- Badge “Elenco em formação” somente quando ativas < 5.
- Entre 5 e 6 ativas, não há badge público; a pendência aparece no CI (`VAL-W01`).
- Nenhum card usa foto.

**Detalhe (`/times/{id}/`)**

- Cabeçalho com nome, abreviação, posição na classificação e estatísticas coletivas.
- A campanha nos pênaltis é exibida separadamente (por exemplo, “Pênaltis: 1 V, 0 D”); ela não é somada a V/E/D. Uma final decidida nos pênaltis conta como empate no tempo normal para as duas equipes.
- Tabela do elenco ativo: Apelido, Posição, Gols, Assistências, Amarelos, Vermelhos, Pontos disciplinares, Suspensão.
- Posição: “Goleira”, “Linha” ou “—”.
- Status de suspensão textual: “Sem suspensão”, “Suspensa na partida {adversário} de {data}”, “Suspensão pendente — final a definir” ou “Suspensão sem efeito — sem próxima partida”.
- Badge “Elenco em formação” quando ativas < 5.
- Seção separada “Atletas com histórico na edição” para jogadoras com `leftAt != null` e ao menos um evento; mostrar estatísticas e “fora do elenco ativo”.
- Se não houver atletas no histórico, omitir a seção.
- Se o elenco ativo estiver vazio, “Nenhuma atleta no elenco ativo”.

### 10.7 Estatísticas

Seções, nesta ordem:

1. **Artilharia** — Posição, Atleta, Time, Gols, Assistências. Nota: “Inclui pênaltis do tempo normal; não inclui a disputa de pênaltis.”
2. **Assistências** — Posição, Atleta, Time, Assistências, Gols.
3. **Cartões por jogadora** — Posição, Atleta, Time, Amarelos, Vermelhos, Pontos disciplinares. Nota sobre segundo amarelo.
4. **Cartões por time** — Time, Amarelos, Vermelhos, Pontos disciplinares.
5. **Gols contra** — Atleta, Time, Gols contra. Nota: “Não entram na artilharia.”

- Cada tabela tem `<caption>`, `th scope`, contêiner de rolagem acessível.
- Estados vazios: “Ainda não há gols registrados.”, “Ainda não há assistências registradas.”, “Ainda não há cartões registrados.”, “Ainda não há gols contra registrados.”
- Jogadoras com `leftAt != null` e eventos aparecem com “fora do elenco ativo” ao lado do apelido.
- Ordenações conforme §7.6.
- Não há filtros, busca ou tabs com JS.

### 10.8 Fase final

| Estado | Condição | Conteúdo |
|---|---|---|
| UI-FINAL-01 | Grupo incompleto | “Confrontos a definir” + explicação de que a fase final depende das 6 partidas; link para Classificação. Se `friendly` existir, card informativo antes do card da final. |
| UI-FINAL-02 | Grupo completo, final não encerrada | Card “1º x 2º” com data/local/horário e link; card informativo do amistoso, se existir, antes do card da final. |
| UI-FINAL-03 | Final encerrada | Pódio completo (campeã, vice e 3ª) + ficha da final + card informativo do amistoso, se existir, antes da ficha da final. |

- Os cards usam `finalists`; não há times hardcoded.
- Se a final foi W.O., mostrar o placar derivado na ordem mandante/visitante (1x0 para o vencedor), “(W.O.)” e o motivo.
- Se a final foi shootout, mostrar `1 (4) x (3) 1` e o texto acessível.
- “Campeã”, “Vice-campeã” e “3º lugar” são textos visíveis. **NÃO DEVE** existir “4º lugar” nem card de disputa de 3º lugar.
- O card do amistoso vem de `buildFriendlyCard` e segue a §7.12; não é um `MatchCard` e não tem placar, status, eventos ou link de partida.

### 10.9 404

- `dist/404.html`, título “Página não encontrada — Copa …”, mensagem curta e link “Voltar para o início”.
- `noindex`; sem canonical/OG.
- Mantém header/footer e nome público.
- Não revela caminhos internos, stack ou dados.

### 10.10 Catálogo de estados de UI

| ID | Estado | Texto/Comportamento |
|---|---|---|
| UI-GLOBAL-01 | Avisos presentes | Banner “Avisos” com data e mensagem; `<aside>`; sem cor exclusiva. |
| UI-GLOBAL-02 | Sem avisos | Banner não é renderizado. |
| UI-MATCH-01 | Agendada | “Agendada”; horário ou “Horário a definir”; sem placar. |
| UI-MATCH-02 | Encerrada | Placar normal; eventos. |
| UI-MATCH-03 | Adiada | “Adiada”; sem placar/eventos. |
| UI-MATCH-04 | Resultado pendente | “Resultado pendente”; sem placar; não é próximo jogo. |
| UI-MATCH-05 | W.O. | Placar derivado na ordem mandante/visitante (1x0 para o vencedor) + “(W.O.)” + motivo; sem gols fictícios. |
| UI-MATCH-06 | Shootout | “1 (4) x (3) 1” + texto acessível. |
| UI-MATCH-07 | Final sem finalistas | “Confrontos a definir”; sem placar/eventos; link para Classificação. |
| UI-STANDINGS-01 | Provisória | Badge “Classificação provisória”. |
| UI-STANDINGS-02 | Final | Sem badge de provisória. |
| UI-STANDINGS-03 | Sorteio | Badge “Sorteio” na linha. |
| UI-TEAM-01 | Elenco em formação | Badge visível com ativas < 5. |
| UI-TEAM-02 | Suspensão | Texto “Suspensa na partida …”. |
| UI-TEAM-03 | Histórico | Seção “Atletas com histórico na edição”. |
| UI-STATS-01 | Sem dados | Mensagem de estado vazio. |
| UI-STATS-02 | Fora do elenco | Marca textual “fora do elenco ativo”. |
| UI-FINAL-01/02/03 | Fase final | Conforme §10.8. |
| UI-FRIENDLY-01 | Amistoso presente | Card informativo antes da final, com “Informativo — não é partida oficial”; sem placar/status/link. |
| UI-FRIENDLY-02 | Amistoso ausente | Nenhum card ou placeholder. |
| UI-404-01 | Não encontrada | 404 com link. |

### 10.11 SEO, metadados e favicon

- `<html lang="pt-BR">`.
- Título único por página; descrição única, 50..160 caracteres.
- `link rel="canonical"` absoluto com base `/futsal-cup/`.
- Open Graph: `og:title`, `og:description`, `og:url`, `og:type=website`, `og:site_name`. Sem `og:image`.
- 404: `noindex`, sem canonical/OG.
- Favicon `public/favicon.svg`: 32×32, monograma tipográfico simples “CF” ou “Copa”, fundo coral e texto branco ou vice-versa, sem logotipos/marcas da Airbnb ou da instituição. Caminho público `/futsal-cup/favicon.svg`.
- `meta name="color-scheme" content="light"`.
- Sem `robots.txt` obrigatório; sem sitemap no MVP.
- Nenhuma imagem OG, foto, fonte externa ou script de terceiros.

---

## 11. Design e acessibilidade

### 11.1 Princípios

- Orientado a dados: tabelas, resultados e estatísticas têm prioridade sobre decoração.
- Mobile-first: 320px é o piso; o layout cresce sem overflow horizontal da página.
- Identidade coral/pink em acentos, títulos grandes e detalhes; nunca atrás de tabelas ou em grandes áreas.
- Sem fotos de jogadoras e sem imagens de pessoas. A hierarquia vem de tipografia, cor e espaço.
- Acessibilidade vence o estilo em qualquer conflito.
- Tema claro apenas; sem modo escuro no MVP.

### 11.2 Camada de tokens

A referência `airbnb-design-tokens.css` é interna e indicativa. Para evitar publicar nomes de fontes proprietárias e nomes de marca no CSS final, o projeto **NÃO DEVE** importar o arquivo integralmente. Ele **DEVE** criar `src/styles/tokens.css` com os valores necessários, renomeados para tokens do projeto, documentando a correspondência nesta SPEC. Essa é uma extensão da referência, não uma alteração dos valores originais.

| Token do projeto | Referência | Valor | Uso |
|---|---|---|---|
| `--color-text` | `--airbnb-hof` | `#222222` | Texto principal. |
| `--color-text-muted` | `--airbnb-foggy` | `#717171` | Texto secundário. |
| `--color-surface` | `--airbnb-white` | `#ffffff` | Superfícies. |
| `--color-surface-subtle` | `--airbnb-light` | `#f7f7f7` | Fundo sutil, linhas alternadas. |
| `--color-border` | `--airbnb-border` | `#dddddd` | Hairline decorativa; nunca estado/foco. |
| `--color-accent` | `--airbnb-rausch` | `#ff5a5f` | Acento, texto grande, ícones, detalhe. |
| `--color-accent-strong` | `--airbnb-pink` | `#e61e4d` | Acento forte, detalhe; não usar em texto normal. |
| `--color-on-accent` | — | `#222222` | Texto sobre coral. |
| `--color-focus` | — | `#222222` | Anel de foco. |
| `--font-family-body` | `--font-body` (substituído) | `-apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif` | Texto; sem fontes proprietárias. |
| `--text-display-size` / `--text-display-line` | `--text-display` | `48px` / `56px` | Título curto em telas largas. |
| `--text-heading-1-size` / `--text-heading-1-line` | `--text-heading-1` | `32px` / `36px` | `<h1>`/seções. |
| `--text-heading-2-size` / `--text-heading-2-line` | `--text-heading-2` | `22px` / `26px` | Subtítulos. |
| `--text-body-size` / `--text-body-line` | `--text-body` | `16px` / `24px` | Corpo. |
| `--text-small-size` / `--text-small-line` | `--text-small` | `14px` / `18px` | Tabelas, badges, legendas. |
| `--space-1`…`--space-6` | `--space-1`…`--space-6` | `8/16/24/32/48/64px` | Espaçamento. |
| `--radius-small` | `--radius-small` | `8px` | Elementos pequenos. |
| `--radius-card` | `--radius-card` | `12px` | Cards. |
| `--radius-pill` | `--radius-pill` | `9999px` | Badges. |
| `--shadow-card` | `--shadow-card` | `0 6px 16px rgba(0,0,0,0.12)` | Cards. |
| `--shadow-floating` | `--shadow-floating` | `0 3px 12px rgba(0,0,0,0.15)` | Menu sobreposto. |
| `--motion-default` | `--motion-default` | `250ms cubic-bezier(0.2,0,0,1)` | Transições discretas. |

A referência agrupa tamanho e entrelinha no mesmo token; o projeto separa cada par em `*-size` e `*-line` para uso direto em `font-size`/`line-height`.

Tokens técnicos adicionais (também em `tokens.css`): `--page-gutter`, `--content-max`, `--measure`, `--tap-target`, `--border-width`, `--focus-width`, `--focus-offset`, `--table-min-width`, `--gradient-accent`.

- Componentes **NÃO DEVEM** conter hexadecimais, `rgb()`, `hsl()`, sombras ou medidas avulsas; devem consumir tokens.
- `--color-border` é decorativa; não pode ser a única indicação de foco, erro ou estado.
- `--gradient-accent` só pode ser usado em barras decorativas sem texto.

### 11.3 Contraste (WCAG AA)

Pares calculados com luminância relativa WCAG:

| Par | Contraste | Uso permitido |
|---|---|---|
| `--color-text` sobre `--color-surface` | 15,91:1 | Texto normal e grande. |
| `--color-text` sobre `--color-surface-subtle` | 14,85:1 | Texto normal e grande. |
| `--color-text-muted` sobre `--color-surface` | 4,88:1 | Texto normal (limite confortável). |
| `--color-text-muted` sobre `--color-surface-subtle` | 4,56:1 | Texto normal (limite; validar no teste de tokens). |
| `--color-surface` sobre `--color-text` | 15,91:1 | Texto de botão primário. |
| `--color-text` sobre `--color-accent` | 5,21:1 | Texto normal sobre coral. |
| `--color-accent` sobre `--color-surface` | 3,05:1 | Somente texto grande (≥24px ou ≥19px em negrito), ícones e elementos não textuais. |
| `--color-accent-strong` sobre `--color-surface` | 4,51:1 | Texto normal no limite; preferir grande/detalhe. |
| `--color-text` sobre `--color-accent-strong` | 3,53:1 | Somente texto grande/ícones. |
| `--color-surface` sobre `--color-accent-strong` | 4,51:1 | Limite técnico; a SPEC restringe a texto grande/ícone por segurança. |
| `--color-focus` sobre `--color-surface`, `--color-surface-subtle`, `--color-accent`, `--color-accent-strong` | 15,91 / 14,85 / 5,21 / 3,53:1 | Anel de foco; atende 3:1 em todos. |
| `--color-border` sobre `--color-surface` | 1,36:1 | Apenas hairline decorativa. |

- Texto normal exige 4,5:1; texto grande e componentes interativos exigem 3:1.
- Não usar `--color-text-muted` sobre coral/pink; não usar coral/pink como fundo de texto normal.
- Gradientes não podem reduzir o contraste de texto; não colocar texto sobre `--gradient-accent`.
- O teste unitário `TST-090` lê os tokens e recalcula os pares; qualquer alteração de valor que reprove deve ser corrigida ou documentada como uso restrito.

### 11.4 Tipografia

- Pilha do sistema; **NÃO DEVE** haver `@font-face`, download, auto-hospedagem ou Google Fonts.
- Escala: display 48/56, heading-1 32/36, heading-2 22/26, body 16/24, small 14/18.
- Pesos: 400, 500, 600, 700. Nada fora dessa faixa.
- Nada abaixo de 14px, incluindo badges e cabeçalhos de tabela.
- `display` só em títulos curtos e telas ≥768px; em telas estreitas, usar heading-1.
- Preservar o par tamanho/entrelinha; não ajustar entrelinha isoladamente.
- Largura de linha máxima: `--measure` (68ch) para texto corrido.
- Não usar `text-transform: uppercase` em blocos longos; apenas em badges curtos, se necessário, com `letter-spacing` tokenizado.

### 11.5 Cores, estados e significado

- Não comunicar vitória/empate/derrota, classificação, cartão, suspensão, W.O. ou sorteio apenas por cor.
- Badges sempre com texto: “Encerrada”, “Adiada”, “Resultado pendente”, “W.O.”, “Sorteio”, “Elenco em formação”, “Suspensa”, “Classificação provisória”.
- Placar e resultados sempre em texto; ícones são decorativos (`aria-hidden="true"`).
- “Campeã” é texto, não apenas destaque de cor.
- Linhas alternadas podem usar `--color-surface-subtle`; a informação não depende disso.
- Links: `--color-text` com sublinhado de 2px em `--color-accent`; hover aumenta a espessura do sublinhado. Não usar coral como cor de texto de corpo.
- Botão primário: fundo `--color-text`, texto `--color-surface`; botão secundário: fundo transparente, texto `--color-text`, borda 2px `--color-text`.
- Foco: `outline: var(--focus-width) solid var(--color-focus); outline-offset: var(--focus-offset);` e fallback `:focus`. Não remover `outline` sem substituto equivalente.

### 11.6 Espaçamento, forma, elevação e movimento

- Base 8px; usar `--space-1`…`--space-6`. Não usar valores intermediários arbitrários.
- Página: gutter `--space-2` no mobile e `--space-4` a partir de 768px.
- Cards: padding `--space-3`, raio `--radius-card`, sombra `--shadow-card`.
- Badges: raio `--radius-pill`, padding vertical `--space-1`/2 e horizontal `--space-2`.
- Não criar sombras fora dos tokens.
- Movimento: apenas transições de cor/borda/sublinhado com `--motion-default`. Nada de animação de conteúdo essencial.
- `@media (prefers-reduced-motion: reduce)` deve zerar animações/transições e `scroll-behavior`.
- Não usar parallax, autoplay, carrossel ou vídeo.

### 11.7 Layout responsivo

- Mobile-first; breakpoints em `48em` (768px) e `64em` (1024px), em `em` para respeitar zoom.
- 320px: uma coluna; nav em `<details>`; tabelas em contêiner de rolagem; cards empilhados.
- 768px: nav desktop; grids de 2 colunas para cards; tabelas ainda podem rolar.
- 1024px+: conteúdo centralizado com `--content-max`; não esticar tabelas além do necessário.
- Nenhuma página pode ter `scrollWidth > clientWidth` em 320px. O único overflow permitido é dentro do contêiner de tabela.
- Nomes longos: `overflow-wrap: anywhere`; não truncar informação essencial.
- Alvos de toque: 44×44px para nav, menu e botões; links inline com pelo menos 24px de altura efetiva.

### 11.8 Acessibilidade

- Meta: WCAG 2.2 AA.
- Estrutura: `header`, `nav`, `main`, `footer`, `aside` para avisos; um `<h1>` por página; hierarquia sem saltos.
- Skip link visível ao foco; `<main id="conteudo" tabindex="-1">`.
- `aria-current="page"` no link ativo.
- Tabelas: `<caption>`, `<th scope="col">`, `<th scope="row">`, `<abbr title>`, sem tabela de layout.
- Contêiner de rolagem: `role="region"`, `aria-labelledby`, `tabindex="0"`, instrução textual; foco visível.
- Placar de pênaltis com texto acessível completo, não apenas “1 (4) x (3) 1”.
- Suspensões, W.O., sorteio e elenco em formação sempre com texto.
- Ícones decorativos com `aria-hidden="true"`; ícones informativos com nome acessível.
- `prefers-reduced-motion` respeitado.
- Zoom 200% sem perda de conteúdo/funcionalidade.
- Nenhum conteúdo piscante, autoplay ou tempo limite.
- Não há formulários no MVP; se houver no futuro, labels e erros acessíveis.
- Testar com teclado, leitor de tela (NVDA/VoiceOver) e zoom; checklist no Apêndice D.

### 11.9 Performance e orçamento

| Métrica | Limite | Verificação |
|---|---|---|
| JS de cliente | 0 KB; nenhum arquivo `.js` em `dist/`, nenhum `<script>` | `npm run test:build` |
| CSS | < 30 KB gzip por página | `npm run test:build` |
| HTML | ≤ 60 KB gzip por página | `npm run test:build` |
| Peso total (HTML+CSS) | ≤ 90 KB gzip por página | `npm run test:build` |
| Fontes externas | 0 | varredura de `dist/` |
| Imagens de pessoas | 0 | varredura de `dist/` |
| Requisições de terceiros | 0 | Playwright |
| Lighthouse mobile (Início e partida) | ≥ 90 em Performance, Acessibilidade, Boas práticas e SEO | auditoria manual no checklist |

- Sem imagens raster; favicon SVG pequeno.
- CSS crítico inline? **NÃO** no MVP; um único CSS externo cacheável é suficiente. Evitar `style` inline.
- Sem prefetch de rotas, sem service worker, sem fontes.
- O site deve carregar em 4G com uma única requisição HTML + CSS (e favicon opcional).

### 11.10 Conteúdo e privacidade visual

- Somente apelido, posição, time e estatísticas.
- Nenhum nome completo, foto, contato, camisa, data de nascimento, idade ou endereço.
- Nenhum ID de jogadora no HTML, em atributos, URLs ou JSON.
- Nenhum logo da instituição ou da Airbnb; nenhuma marca de terceiros.
- Textos públicos em pt-BR, com “você” e linguagem clara.
- Textos livres (`friendly.note` e `notices[].message`) são públicos: use apelidos ou descrições genéricas; nunca inclua nome completo, contato ou outro dado pessoal.
- Datas por extenso quando ajudar (“Terça-feira, 24/11/2026”); horários em 24h.
- “Horário de Brasília” no rodapé para explicar o fuso.

---

## 12. Build, CI e deploy

### 12.1 `package.json` de referência

```json
{
  "name": "copa-futsal-vila-mariana-2026",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "engines": { "node": ">=26.0.0 <27" },
  "packageManager": "npm@11.20.0",
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "validate": "tsx scripts/validate-data.ts",
    "check": "astro check",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:build": "tsx scripts/check-build.ts",
    "test:e2e": "playwright test",
    "verify": "npm run validate && npm run check && npm test && npm run build && npm run test:build && npm run test:e2e"
  },
  "dependencies": {},
  "devDependencies": {
    "@astrojs/check": "^0.9.12",
    "@axe-core/playwright": "^4.14.0",
    "@playwright/test": "^1.65.0",
    "@types/node": "^26.6.6",
    "astro": "^7.4.11",
    "tsx": "^4.23.15",
    "typescript": "^6.0.3",
    "vitest": "^5.1.0",
    "yaml": "^2.9.1",
    "zod": "^4.6.7"
  }
}
```

- `package-lock.json` **DEVE** ser commitado.
- `npm ci` é o comando de instalação no CI e em ambientes limpos.
- Não usar `npm install` no CI.
- `npm run verify` é o comando local completo; o CI executa os passos separadamente para relatar melhor.
- `npm run dev` não é usado para validar dados; use `npm run validate`.
- `npm run preview` serve o `dist/` após `npm run build`.

### 12.2 `astro.config.mjs`

```js
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://grazielevasconcelos.github.io',
  base: '/futsal-cup/',
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
  devToolbar: { enabled: false },
  vite: { build: { cssMinify: true } },
});
```

- `site` + `base` produzem canonical/OG corretos.
- `trailingSlash: 'always'` garante `/jogos/g1/`.
- `build.format: 'directory'` gera `index.html` por rota.
- `404.astro` gera `dist/404.html`; o teste de build confirma.
- Nenhum adaptador de SSR.
- Nenhuma integração de UI, sitemap ou analytics.

### 12.3 `tsconfig.json`

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true,
    "verbatimModuleSyntax": true,
    "allowJs": false,
    "types": ["node"]
  },
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist"]
}
```

- `strict` é obrigatório.
- `noUncheckedIndexedAccess` obriga a tratar arrays vazios.
- `exactOptionalPropertyTypes` evita `undefined` acidental em props.
- `allowJs: false` mantém a base em TypeScript.

### 12.4 Vitest

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/unit/**/*.test.ts', 'tests/data/**/*.test.ts'],
    environment: 'node',
    globals: false,
    coverage: { enabled: false },
  },
});
```

- Sem meta de cobertura; a matriz do Apêndice E é obrigatória.
- Testes de build/E2E ficam fora do `vitest run` para não depender de `dist/`.
- Fixtures e factories em `tests/fixtures` e `tests/factories`.

### 12.5 Playwright

```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:4321/futsal-cup/',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run preview -- --host 127.0.0.1 --port 4321',
    url: 'http://127.0.0.1:4321/futsal-cup/',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    { name: 'desktop-chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-chromium', use: { ...devices['Pixel 5'] } },
  ],
});
```

- CI instala apenas Chromium: `npx playwright install --with-deps chromium`.
- Safari/Firefox/Edge são verificados no checklist manual (Apêndice D).
- O `webServer` exige `dist/` construído; o CI roda `npm run build` antes.
- axe é executado em todas as rotas principais; falhas `serious`/`critical` bloqueiam.

### 12.6 Workflow do GitHub Actions

```yaml
name: Publicar site

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  validar-e-construir:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Node 26
        uses: actions/setup-node@v4
        with:
          node-version: 26
          cache: npm

      - name: Instalar
        run: npm ci

      - name: Validar dados
        run: npm run validate

      - name: Checar tipos
        run: npm run check

      - name: Testes unitários e de dados
        run: npm test

      - name: Build
        run: npm run build

      - name: Checar artefatos
        run: npm run test:build

      - name: Instalar Chromium
        run: npx playwright install --with-deps chromium

      - name: Testes E2E e acessibilidade
        run: npm run test:e2e

      - name: Configurar Pages
        uses: actions/configure-pages@v5

      - name: Empacotar artefato
        uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    if: github.ref == 'refs/heads/main'
    needs: validar-e-construir
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Publicar
        id: deployment
        uses: actions/deploy-pages@v4
```

- Deploy somente em `main`; sem preview de PR.
- Se qualquer etapa falhar, o artefato não é enviado e o site anterior permanece.
- `actions/configure-pages` deve rodar antes do upload.
- O job summary da validação é escrito pelo script; não é necessário um step extra.
- `GITHUB_TOKEN` é automático; nenhum segredo adicional.
- Permissões mínimas: `contents: read`, `pages: write`, `id-token: write`.

### 12.7 Comandos reais

| Comando | O que faz | Quando usar |
|---|---|---|
| `npm ci` | Instala exatamente o lockfile. | Setup local/CI. |
| `npm run dev` | Servidor Astro de desenvolvimento. | UI local. |
| `npm run validate` | Valida `data/2026/copa.yaml` e imprime erros/avisos. | Antes de commit. |
| `npm run check` | `astro check` (TypeScript + Astro). | Antes de commit/CI. |
| `npm test` | Vitest (unitários + dados). | Antes de commit/CI. |
| `npm run build` | Gera `dist/` estático. | Publicação local/CI. |
| `npm run preview` | Serve `dist/` em `localhost:4321/futsal-cup/`. | Conferência local/E2E. |
| `npm run test:build` | Varre `dist/` (rotas, JS, termos, orçamento). | Após build. |
| `npm run test:e2e` | Playwright + axe. | Após build. |
| `npm run verify` | Sequência completa local. | Antes de PR/publicação. |
| `npx playwright install --with-deps chromium` | Instala o navegador de teste. | Setup do E2E. |

### 12.8 Publicação e operação

1. Editar `data/2026/copa.yaml` (GitHub web ou local).
2. Rodar `npm run validate`; corrigir erros.
3. Commitar em `main` com Conventional Commits (ex.: `feat(dados): registra resultado da rodada 2`).
4. O Actions roda validação, testes, build e E2E; só então publica.
5. Habilitar Pages uma vez em **Settings → Pages → Source: GitHub Actions**.
6. URL: `https://grazielevasconcelos.github.io/futsal-cup/`.
7. Após deploy, fazer hard refresh (Ctrl+F5 / Cmd+Shift+R) se o HTML antigo estiver em cache.
8. Rollback: reverter o commit problemático e empurrar para `main`; o CI republica.
9. Se a validação falhar, o site anterior permanece no ar e o job summary lista os erros.

- Sem domínio próprio, sem preview de PR, sem deploy fora de `main`.
- Sem segredos, analytics, cookies de terceiros ou chamadas externas.
- O repositório é público; a fonte contém apenas dados públicos permitidos.

### 12.9 Variáveis de ambiente

| Variável | Uso | Obrigatória |
|---|---|---|
| `SOURCE_DATE_EPOCH` | Instante do build para rodapé/próximo jogo; se ausente, usa o relógio. | Não |
| `CI` | Detecta CI (Playwright/Vitest). | Não |
| `GITHUB_STEP_SUMMARY` | Arquivo de resumo do Actions. | Fornecido pelo Actions |

Nenhuma variável contém segredo. Não há `.env` versionado.

---

## 13. Testes

### 13.1 Estratégia

| Camada | Ferramenta | O que cobre | Bloqueia deploy |
|---|---|---|---|
| Unitários | Vitest | Placar, classificação, desempate, cartões, suspensão, estatísticas, pódio, próximo jogo, formatação, normalização, contraste de tokens. | Sim |
| Dados | Vitest + fixtures/factories | Schema, todas as validações bloqueantes, avisos, agregação de erros. | Sim |
| Build | `scripts/check-build.ts` | Rotas, 404, ausência de Regulamento, 0 KB JS, termos proibidos, fontes proprietárias, orçamento, IDs de jogadora. | Sim |
| E2E | Playwright | Navegação, teclado, foco, 320px, tabelas roláveis, meta tags, 404, menu `<details>`. | Sim |
| Acessibilidade | Playwright + axe-core | Violações `serious`/`critical` nas rotas principais. | Sim |
| Manual | Checklist Apêndice D | Leitor de tela, zoom 200%, Safari/Firefox/Edge, Lighthouse, inspeção visual. | Antes da publicação |

- Sem snapshot visual no MVP.
- Sem meta de cobertura; a matriz do Apêndice E é obrigatória.
- Todo bug corrigido deve ganhar um teste na camada mais baixa possível.
- Testes não dependem da data real: `now` é injetado; `SOURCE_DATE_EPOCH` é fixado quando necessário.
- Fixtures válidas e inválidas são versionadas; factories reduzem duplicação.

### 13.2 Casos mínimos obrigatórios

Os casos abaixo são derivados do AGENTS e do PRD. A matriz completa está no Apêndice E.

**Classificação e desempate**

- Vitória 3, empate 1, derrota 0; ordenação por pontos.
- Dois times empatados: soma dos pontos dos dois jogos do confronto direto; quem tiver mais pontos à frente.
- Dois times empatados com pontos iguais no confronto direto: saldo agregado dos dois jogos; se persistir, próximos critérios.
- Dois times empatados com um dos jogos do confronto direto não `finished`: confronto ignorado.
- Três times empatados: confronto direto não aplicado; vitórias, saldo, gols pró, menos gols contra, disciplina.
- Grupo de 3+ reduzido a 2: confronto direto reaplicado aos dois, considerando os dois jogos.
- Sorteio: `drawOrder` aplicado; badge “Sorteio”; ausência de `drawOrder` falha quando a classificação é final.
- Classificação provisória com partida não encerrada; empate total sem `drawOrder` usa a ordem fixa ta…tc.
- W.O. 1x0 conta para pontos, vitórias, gols pró/contra e saldo; no confronto direto, o W.O. conta como 1x0 para o vencedor.

**Cartões e suspensão**

- Amarelo = 1; vermelho = 2; 1 amarelo + 1 vermelho direto = 3; dois amarelos = 3 no total.
- Dois amarelos no mesmo jogo geram vermelho derivado para estatísticas/suspensão.
- Terceiro amarelo no mesmo jogo bloqueia; vermelho explícito com dois amarelos bloqueia.
- Vermelho direto suspende a próxima partida canônica do time.
- Sem próxima partida, sem efeito.
- Jogadora suspensa não pode ter eventos na partida que perde.
- Cartões da final contam para estatísticas/suspensão, não para classificação; não há cartões de 3º lugar.
- Cartões de W.O. contam, exceto `no_show`.
- Não há suspensão por acúmulo de amarelos.

**Gols, assistências e pênaltis**

- Placar derivado de gols normais, pênaltis do tempo normal e gols contra.
- Gol contra credita o adversário e não entra na artilharia da jogadora.
- Assistência opcional, do mesmo time, diferente da marcadora; proibida em pênalti e gol contra.
- Pênalti do tempo normal conta na artilharia; shootout não conta.
- Shootout só na final, após empate, valores diferentes.
- Placar `1 (4) x (3) 1` e texto acessível.
- W.O. sem gols/assistências; cartões permitidos conforme motivo.
- Estatísticas coletivas: `buildTeamStats` agrega grupo + final; final decidida nos pênaltis conta como empate em V/E/D e soma `shootoutWins`/`shootoutLosses`; GP/GC/SG ignoram o shootout; W.O. conta 1x0; amistoso fora.
- Simetria dos confrontos: cada par tem um jogo em casa para cada time; `g4` é `tb x ta`; trocar para `ta x tb` falha `VAL-012`.

**Elenco e elegibilidade**

- 7/8 ativas; 9ª bloqueada; <7 gera aviso; <5 gera badge.
- Apelido único no time após normalização; acentos distintos.
- Jogadora em dois times bloqueada.
- `leftAt` preserva histórico e não ocupa vaga.
- `joinedAt`/`leftAt` definem elegibilidade; eventos retroativos bloqueados.
- Jogadora que atuou não troca de time.
- Jogadora fora do elenco ativo com eventos aparece nas estatísticas com marca textual.

**Fase final e correções**

- `finalists` nulo com grupo incompleto; obrigatório e igual à classificação com grupo completo.
- Apenas 1º x 2º na final; não há 3º x 4º nem partida de 3º lugar.
- Pódio com campeã, vice e 3ª; 3ª é a 3ª da classificação; não há 4º lugar.
- Correção que muda finalistas após a final falha listando antigos/novos.
- `notices` gera banner global.
- W.O. na final define campeão.
- Amistoso (`friendly`) aparece só como card informativo na Fase final; não altera nada.
- `friendly` inválido (data/horário/local/nota ou campo de partida) é bloqueado por `VAL-033`.

**Validação**

- Todas as regras `VAL-*` e `VAL-W*` do §8, com fixtures/factories.
- Agregação de múltiplos erros, sem parar no primeiro.
- Exit code 1 com erro; 0 com apenas aviso.
- Resumo em Markdown para o Actions.

**Acessibilidade e UI**

- Contraste WCAG AA dos pares de tokens.
- Foco visível e navegação por teclado.
- `prefers-reduced-motion`.
- 320px sem overflow da página; tabela com rolagem acessível.
- Nada transmitido apenas por cor.
- Tabelas com `caption`, `th`, `scope`.
- Menu `<details>` acessível.
- Meta tags, canonical, OG, favicon, 404.
- Ausência de `client:*`, `<script>` e JS em `dist/`.
- Ausência de `airbnb-design-design.md`, `airbnb-design-tokens.css`, fontes proprietárias e termos proibidos em `dist/`.

### 13.3 Fixtures e factories

- `tests/fixtures/valida.yaml`: temporada completa válida (pode ser a do Apêndice A).
- `tests/fixtures/invalida-*.yaml`: casos de schema (campo desconhecido, tipo, data, enum).
- `tests/factories/competition.ts`: `buildValidCompetition()`, `withTeam()`, `withMatch()`, `withEvent()`, `withFinalists()`, `withDrawOrder()`.
- Testes semânticos mutam a factory e esperam o código `VAL-*` exato.
- O teste de fumaça carrega `data/2026/copa.yaml` real e exige validação sem erros (avisos permitidos).

### 13.4 Execução

```bash
npm ci
npm run validate
npm run check
npm test
npm run build
npm run test:build
npx playwright install --with-deps chromium
npm run test:e2e
```

Ou, após o setup:

```bash
npm run verify
```

- `npm run verify` não instala navegadores; rode o `npx playwright install` uma vez.
- O CI executa os passos na ordem acima.
- `npm run test:build` e `npm run test:e2e` exigem `dist/` atualizado.

---

## 14. Rastreabilidade

### 14.1 Requisitos funcionais do PRD

| FR | Prioridade | Onde na SPEC | Verificação | Status |
|---|---|---|---|---|
| FR-01 | Obrigatório | §5, §6, §9 | Schema único + build + varredura de dados hardcoded | MVP |
| FR-02 | Obrigatório | §8, §12 | Fixtures inválidas; build falha; job summary | MVP |
| FR-03 | Obrigatório | §5.6, §6, §10.6 | Testes de elenco + páginas de times | MVP |
| FR-04 | Obrigatório | §6, §7.8, §10.4 | Testes de calendário + lista/detalhe | MVP |
| FR-05 | Obrigatório | §7.1, §7.9, §10.4 | Testes de eventos + detalhe | MVP |
| FR-06 | Obrigatório | §7.2, §7.3 | Testes de desempate | MVP |
| FR-07 | Obrigatório | §7.7, §10.8 | Testes de finalistas/pódio | MVP |
| FR-08 | Obrigatório | §7.6, §10.7 | Testes de estatísticas | MVP |
| FR-09 | Desejável | §10.3 | E2E dos quatro estados | MVP (desejável) |
| FR-10 | Desejável | §2.4 | Sem rota/nav/placeholder; 404 | **ADIADO** |
| FR-11 | Obrigatório | §11, §13 | Playwright/axe + checklist | MVP |
| FR-12 | Obrigatório | §12 | Workflow Pages | MVP |
| FR-13 | Obrigatório | §7.5, §10.4, §10.6 | Testes de suspensão + UI | MVP |
| FR-14 | Obrigatório | §7.7, §8, §10.2 | Teste de correção + notice | MVP |
| FR-15 | Obrigatório | §5.6, §8, §10.6 | Testes de elegibilidade | MVP |
| FR-16 | Obrigatório | §5, §12 | Build lê só 2026 | MVP |
| FR-17 | Obrigatório | §5.4, §9, §11.10 | Schema + varredura de privacidade | MVP |
| FR-18 | Obrigatório | §2.1, §11, §13 | Teste de termos proibidos | MVP |
| FR-19 | Desejável | §10.11 | Teste de meta tags/OG | MVP (desejável) |
| FR-20 | Futuro | §2.4 | — | **FUTURO** |
| FR-21 | Obrigatório (emenda v1.1; `friendly` opcional) | §2, §5.4, §7.12, §10.8 | `VAL-033`, testes de unidade e E2E do card informativo | MVP |

### 14.2 Requisitos não funcionais

| NFR | Requisito | Onde na SPEC | Verificação |
|---|---|---|---|
| NFR-01 | GitHub Pages, estático, sem backend/login. | §4, §12 | Build + workflow. |
| NFR-02 | Performance em 4G. | §11.9 | Orçamento + Lighthouse manual. |
| NFR-03 | Acessibilidade AA. | §11.8 | axe + teclado + checklist. |
| NFR-04 | pt-BR e America/Sao_Paulo. | §5, §7.8, §9.1 | Testes de formatação/conteúdo. |
| NFR-05 | Privacidade. | §5.4, §11.10 | Schema estrito + varredura. |
| NFR-06 | Determinismo. | §7, §9 | Testes de repetição/ordenação. |
| NFR-07 | Segurança. | §12.9 | Sem segredos/terceiros; permissões mínimas. |
| NFR-08 | Compatibilidade. | §4.7 | Checklist Safari/Firefox/Edge + viewports. |
| NFR-09 | Manutenibilidade. | §5, §9, §15 | Schema/funções puras + docs. |
| NFR-10 | Disponibilidade. | §12.8 | Pages + rollback + fonte versionada. |
| NFR-11 | Conteúdo público sem instituição/marcas. | §2.1, §13 | Teste de termos proibidos. |

### 14.3 Critérios de aceite do PRD

| Critério do PRD §12 | Cobertura |
|---|---|
| Times e elencos | VAL-004..VAL-010, VAL-W01, UI-TEAM-01/03. |
| Pontuação | ALG-002, TST de ranking. |
| Desempate entre dois | ALG-003, exemplos 1/2. |
| Desempate entre 3+ | ALG-003, exemplos 4/5. |
| Cartões | ALG-004, VAL-022, UI de cartões. |
| Gols e assistências | ALG-001/006, VAL-021, UI de detalhe. |
| Fase final | ALG-007, VAL-016/017, UI-FINAL (final única, pódio de 3). |
| Amistoso | SPEC-016, ALG-012, VAL-033, UI-FRIENDLY. |
| Elenco flexível | §5.6, VAL-020, UI-TEAM-03. |
| Suspensão | ALG-005, VAL-023, UI-TEAM-02. |
| Correções | ALG-007, VAL-017, notices. |
| Publicação e acesso | §12, workflow. |
| Interface | §10, §11, testes E2E. |

---

## 15. Emendas e interpretações

### 15.1 Emendas registradas

| # | Tema | Decisão desta SPEC | Origem | Aplicação na v1.1 |
|---|---|---|---|---|
| 1 | Artilharia e pênalti | Pênalti do tempo normal conta para placar e artilharia; somente a disputa de pênaltis fica fora. | PRD §10.5 estava ambíguo (“excluindo pênaltis”). | PRD §10.5 ajustado para “exclui a disputa de pênaltis; inclui pênalti do tempo normal”. |
| 2 | Assistência em pênalti | Assistência em gol de pênalti é bloqueada. | PRD §7.6 não explicitava. | PRD §7.6 e validação do PRD §8.1 atualizados. |
| 3 | Limite de elenco | Máximo de 8 ativas; `leftAt` não ocupa vaga e preserva histórico; 9ª ativa bloqueada. | PRD §7.2. | PRD §7.2 e AGENTS (badge/limite) atualizados. |
| 4 | Badge de elenco | Badge público “Elenco em formação” somente com <5 ativas; aviso de build com <7; 9ª bloqueada. | PRD §7.2 fala em sinalizar <7; briefing separa badge e CI. | PRD §7.2, §10.4 e AGENTS atualizados. |
| 5 | Regulamento | FR-10 adiado: sem rota, link, página ou placeholder. | Briefing §2.10. | FR-10 marcado como ADIADO no PRD §6.1, §8, §10.7 e §12; removido da navegação no AGENTS. |
| 6 | W.O. | 1x0 fixo; `walkover` administrativo; sem gols/assistências; cartões permitidos conforme motivo; conta classificação, não artilharia. | Briefing §2.7; PRD §7.8/§16 deixavam em aberto. | Exceção documentada no PRD §7.8, §8.1 e AGENTS. |
| 7 | Confronto direto não realizado | Se a partida do confronto direto não está `finished`, o critério é ignorado e seguem os próximos. | Briefing §2.2. | PRD §7.4 atualizado. |
| 8 | Finalistas | `finalists` é snapshot oficial validado contra a classificação; correção após a final bloqueia o build até atualizar. | Briefing §2.6. | PRD §7.7 e §11.5 atualizados. |
| 9 | Estatísticas | Time como desempate final de ordenação; atletas fora do elenco ativo marcadas por texto. | Briefing §2.8. | PRD §10.5 atualizado. |
| 10 | Correções e avisos | `notices` gera banner global além do aviso de build. | Briefing §2.6/§2.10. | PRD §11.5 e §10 atualizados. |
| 11 | Status de partida | `scheduled`, `finished` e `postponed`; `date` obrigatória; `startsAt` opcional em `scheduled`; `finished` exige `startsAt`; `postponed` sem eventos/W.O./shootout. | Briefing §2.4 e §3.2. | PRD §7.3/§7.8 e AGENTS atualizados. |
| 12 | Mínimo de 3 em quadra | É regra de jogo, não regra de elenco. O site não detecta jogadoras em quadra; W.O. é manual. | Briefing §2.7; PRD §7.3. | PRD §7.2/§7.3 e AGENTS atualizados. |
| 13 | Sorteio | `drawOrder` só é exigido quando um empate chega ao sorteio; ausência falha; UI mostra badge textual “Sorteio”. | Briefing §2.2. | PRD §7.4 atualizado. |
| 14 | Próximo jogo | Partida `scheduled` com data passada mostra “Resultado pendente” e não é próximo jogo; cálculo no build. | Briefing §2.9. | PRD §10.1 atualizado. |
| 15 | Tokens de design | Não importar `airbnb-design-tokens.css` integralmente no CSS publicado; criar camada de tokens do projeto com os valores necessários e nomes sem marca. A referência permanece interna e não vai ao build. | AGENTS permite “importe ou estenda”; a importação literal publicaria nomes de fontes proprietárias/marca, violando o teste de termos proibidos. | Exceção registrada no AGENTS §Design e no README. |
| 16 | Nome de time duplicado | É aviso (`VAL-W03`), não bloqueio; a abreviação distingue. | Decisão de spec para não inventar regra de produto. | Nenhuma alteração no PRD; a decisão ficou registrada nesta SPEC. |
| 17 | Placar materializado | Não existe campo de placar; qualquer campo `score`/`result` é erro de schema. | PRD §7.6 + briefing §2.4. | Nenhuma alteração necessária; já coberto pelo PRD. |
| 18 | Formato 2026 | 3 times fixos (`ta`, `tb`, `tc`); 6 partidas de grupo em turno e returno; final única 1º x 2º; sem 3º x 4º e sem 4º lugar. | Decisão de produto de 12/11/2026 (registro em `docs/decisoes-v1.1.md`). | PRD §3, §7.1, §7.3, §7.7, §8, §10.6–§10.8 e §12 e AGENTS §Visão geral, §Regras e §Calendário atualizados. |
| 19 | Confronto direto em dois jogos | Soma dos pontos dos dois jogos; se empatar, saldo agregado dos dois jogos; só vale com os dois jogos `finished`; W.O. conta 1x0. | Decisão de produto de 12/11/2026. | PRD §7.4 e AGENTS §Desempate atualizados. |
| 20 | Amistoso do 3º colocado | Metadado `friendly`, exibido como card informativo na Fase final antes da final; sem placar, eventos, cartões, estatísticas, suspensões, classificação ou pódio. | Decisão de produto de 12/11/2026. | FR-21 e regra adicionadas ao PRD §7/§10.8; AGENTS §Regras e §Validação atualizados. |
| 21 | Pódio sem 4º | Pódio com 3 posições; o 3º é o 3º da classificação, sem partida decisiva. | Decisão de produto de 12/11/2026. | PRD §7.7, §10.8 e §12 e AGENTS §Regras atualizados. |
| 22 | Retirada de time | A organização registra W.O. por partida; o site não automatiza retirada, remoção de elenco ou recálculo especial. | Decisão de spec para não inventar regra de produto. | Documentado no PRD §7.8/§16 e no AGENTS §Riscos/limitações. |
| 23 | Estatísticas coletivas | `buildTeamStats` agrega grupo + final; V/E/D pelo tempo normal; final decidida nos pênaltis conta como empate; `shootoutWins`/`shootoutLosses` separados; shootout fora de GP/GC/SG; amistoso fora. | Decisão de produto de 12/11/2026. | PRD v1.1 §10.4/§10.6 e AGENTS v1.1 atualizados; teste TST-115. |
| 24 | Simetria dos confrontos | Cada par tem um jogo em casa para cada time; `g4` é `tb x ta`. | Correção de consistência do calendário v1.1. | PRD v1.1 §7.8, AGENTS v1.1 §Calendário e Apêndice A atualizados; teste TST-116. |

As emendas 1–24 foram refletidas no `PRD.md` v1.1 e no `AGENTS.md` v1.1. A coluna “Aplicação na v1.1” registra onde cada emenda foi aplicada; a aprovação formal do PRD (§18) está registrada no próprio PRD. As referências ao “briefing” nas emendas 1–17 são ao briefing original da v1.1, que não está versionado; `docs/decisoes-v1.1.md` é a reconstrução documentada e não normativa.

### 15.2 Alinhamento aplicado ao PRD, AGENTS e README

O alinhamento abaixo foi aplicado nesta entrega. A aprovação formal do PRD (§18) está registrada no próprio PRD; o commit `docs` é o registro final e só deve ser declarado concluído depois de existir.

**PRD.md v1.1**

- [x] §1/§6.1/§7.1: substituir “4 times, turno único e 8 partidas” por 3 times (`ta`, `tb`, `tc`), 6 partidas de grupo em turno e returno e final única.
- [x] §7.2: manter as regras de elenco; acrescentar `leftAt`, limite de 8 ativas simultâneas, badge <5, aviso <7 e distinção entre elenco e regra de 3 em quadra.
- [x] §7.8: atualizar o calendário para 24/11 (g1/g2), 26/11 (g3/g4), 01/12 (g5/g6) e 03/12 (amistoso + final), com dois jogos por time em cada uma das três primeiras datas.
- [x] §7.4: substituir o confronto direto de um jogo pela soma dos dois jogos (pontos e, se necessário, saldo agregado); exigir os dois jogos `finished`; W.O. conta 1x0; manter a regra de 3+ times e a reaplicação ao reduzir para dois.
- [x] §7.6: explicitar assistência proibida em pênalti e em gol contra; pênalti do tempo normal conta.
- [x] §7.7: `finalists` apenas para a final; pódio com 3 posições; remover 3º x 4º, disputa de 3º lugar e 4º lugar.
- [x] §7.8: W.O. 1x0, motivos, cartões, sem gols/assistências; documentar a retirada de time como W.O. manual por partida, sem automação.
- [x] §7.9/§10.6: adicionar o amistoso (`friendly`) como metadado informativo, com data, horário, local e nota, exibido antes da final e sem efeito competitivo; adicionar FR-21.
- [x] §8: FR-10 ADIADO; FR-20 FUTURO; FR-21 amistoso; remover validações de 3º lugar; acrescentar `VAL-033` e as validações de W.O., `drawOrder`, badge e `finalists`.
- [x] §10.1: próximo jogo/“Resultado pendente”.
- [x] §10.5: “exclui a disputa de pênaltis”, não “excluindo pênaltis”; desempate por time; marca “fora do elenco ativo”.
- [x] §10.4/§12: estatísticas coletivas com V/E/D no tempo normal, campanha separada nos pênaltis (`shootoutWins`/`shootoutLosses`) e GP/GC/SG sem shootout.
- [x] §7.8/§15: `g4` como `tb x ta`, garantindo um jogo em casa para cada time em cada par.
- [x] §10.2/§10.6: lista com 7 jogos, sem `/jogos/terceiro/`; Fase final com card informativo do amistoso antes da final; pódio de 3.
- [x] §10.7: remover Regulamento da navegação/página.
- [x] §11.5: `notices` e banner.
- [x] §12: ajustar critérios de aceite para 3 times, 7 partidas, pódio de 3, amistoso informativo, badge <5, W.O., `drawOrder`, `finalists` e Regulamento adiado.

**AGENTS.md v1.1**

- [x] §Visão geral e §Calendário: 3 times, 7 partidas oficiais, datas 24/11, 26/11, 01/12 e 03/12; remover 4 times/8 partidas/17-11 e 19-11.
- [x] §Regras da competição: turno e returno, final única, pódio de 3 sem 4º lugar, confronto direto de dois jogos, amistoso informativo e retirada de time via W.O. manual.
- [x] §Design: registrar a exceção de não importar o arquivo de referência integralmente; tokens do projeto sem marca no CSS publicado; card informativo do amistoso sem tratamento de partida.
- [x] §Validação: acrescentar as regras `VAL-*` novas, incluindo `VAL-033`.
- [x] §Comandos: substituir “ainda não definidos” pelos comandos reais da §12.7.
- [x] §Testes: acrescentar confronto direto de dois jogos, amistoso, 3 times/7 partidas, W.O., `finalists`, `drawOrder`, `notices`, estatísticas coletivas com shootout, simetria dos confrontos, orçamento e termos proibidos.

**README.md**

- [x] Visão geral, stack, comandos, estrutura de dados e link do site; refletir 3 times, 7 partidas e amistoso informativo.

**docs/decisoes-v1.1.md**

- [x] Registro reconstruído das decisões da v1.1, marcado como reconstrução e não como briefing original.

**PLAN.md e TASKS.md**

- [x] Plano de execução e checklist criados, subordinados a esta SPEC.

**Commit**

- [ ] Commit `docs: alinha PRD, AGENTS e SPEC com a v1.1` criado após a revisão final. Não declarar concluído antes de o commit existir.

### 15.3 Conflitos resolvidos

| Conflito | Resolução |
|---|---|
| PRD §10.5 diz “excluindo pênaltis” | Interpretado como “excluindo a disputa de pênaltis”; pênalti do tempo normal conta. Emenda 1. |
| PRD §6.1/§10.7 incluem Regulamento; briefing adia FR-10 | FR-10 ADIADO; sem rota/link/placeholder. Emenda 5. |
| AGENTS permite importar `airbnb-design-tokens.css`; teste proíbe nomes de fontes/marca no `dist/` | Não importar integralmente; estender com tokens do projeto. Emenda 15. |
| PRD §7.2 fala em sinalizar <7; briefing cria badge <5 | Badge público <5; aviso de build <7; 9ª bloqueada. Emenda 4. |
| PRD §7.8 não define W.O.; briefing define 1x0 | W.O. 1x0 administrativo, manual. Emenda 6. |
| PRD §11.5 “alerta e exige confirmação” sem mecanismo | `finalists` divergente bloqueia o build; atualizar `finalists` é a confirmação. Emenda 8. |
| PRD v1.0/AGENTS v1.0 descreviam 4 times, 8 partidas e disputa de 3º lugar | PRD v1.1 e AGENTS v1.1 foram atualizados: 3 times, 7 partidas e pódio de 3. Emendas 18, 21. |
| PRD v1.0 não tinha amistoso nem confronto direto de dois jogos | PRD v1.1 e AGENTS v1.1 incorporam o `friendly` informativo e o confronto direto agregado dos dois jogos; emendas 19 e 20. |

### 15.4 Regra de manutenção

- Novas decisões de produto exigem atualização do PRD e, se afetarem agentes, do AGENTS.
- Novas decisões técnicas exigem atualização desta SPEC e, se mudarem o schema, uma emenda.
- Não alterar valores de `airbnb-design-tokens.css`/`airbnb-design-design.md` para adaptar o produto.
- A fonte de dados não é alterada por esta SPEC; o exemplo do Apêndice A é ilustrativo.

---

## 16. Riscos, premissas e questões em aberto

### 16.1 Riscos

| Risco | Impacto | Mitigação |
|---|---|---|
| Prazo curto até 24/11/2026 | Alto | Escopo congelado; funções puras; implementação por fatias; testes desde o início. |
| Carga física: um time joga duas vezes em 24/11, 26/11 e 01/12 | Alto | Calendário explícito na fonte; horários distintos e ordem canônica validada; a organização controla aquecimento/recuperação; a UI lista os dois jogos do dia. |
| Retirada de um time no meio da competição | Alto | W.O. manual por partida restante, com motivo `withdrawal`; sem automação de remoção de elenco; classificação e estatísticas continuam derivadas dos eventos; limitação documentada na §16.3. |
| Amistoso confundido com partida oficial | Médio | Rótulo “Informativo — não é partida oficial”; card sem placar/status/link; `VAL-033`; testes de UI e de ausência em listas/estatísticas. |
| Erro de lançamento de dados | Alto | Schema estrito, validação agregada, fixtures, revisão antes do commit. |
| Interpretação errada do desempate | Alto | Algoritmo por grupos, exemplos trabalhados e matriz de testes. |
| Correção após a final mudar finalistas | Alto | `finalists` snapshot; build falha com antigos/novos; `notices` para o público. |
| W.O. mal registrado | Médio | Schema de `walkover`; validação de motivo/eventos; UI explícita. |
| Elenco flexível gerar inconsistência | Médio | `joinedAt`/`leftAt`, máximo 8, apelido único, vínculo imutável. |
| Suspensão aplicada à partida errada | Médio | Ordem canônica + validação de cronologia; testes. |
| Cache do GitHub Pages | Baixo | Hard refresh; assets com hash; rollback por commit. |
| Nome da instituição/marca em texto público | Médio | Teste de termos proibidos; revisão de metadados/OG/favicon. |
| Contraste insuficiente | Médio | Tokens medidos, teste unitário, axe, checklist. |
| Overflow em 320px | Médio | Mobile-first; tabela em contêiner; teste E2E. |
| Dependência de fonte externa | Baixo | Pilha do sistema; teste de `@font-face`. |
| JS acidental de framework | Médio | Sem framework; teste de `client:*` e `dist/`. |
| Build não determinístico | Médio | Funções puras, ordenação estável, `now` injetado, lockfile. |
| GitHub Pages indisponível | Baixo | Fonte versionada é o backup; sem SLA. |
| Vazamento de dados pessoais | Alto | Schema estrito, revisão, mapeamento privado fora do repo, varredura. |
| Regulamento reaparecer por engano | Baixo | Teste de rota/link ausente. |

### 16.2 Premissas

- 3 times, 7 partidas oficiais (6 de grupo + final) e o calendário de 24/11, 26/11, 01/12 e 03/12.
- O amistoso é metadado informativo na data da final, antes do horário da final.
- Nomes, horários e local exato são dados operacionais; a UI tem fallback.
- O site é somente leitura; a edição é via Git.
- O mapeamento de IDs é privado e fora do repositório.
- W.O. é registrado manualmente; o site não detecta jogadoras em quadra.
- A classificação é provisória enquanto houver partida de grupo não encerrada.
- O build usa Node 26 e o lockfile; versões diferentes podem alterar ICU/formatação, mas não a lógica pura.
- O Pages será habilitado manualmente uma vez.

### 16.3 Limitações documentadas

- Gols ocorridos antes de uma interrupção de W.O. não são registrados no MVP.
- A disputa de pênaltis registra apenas o placar, sem cobradoras/defesas.
- Não há placar ao vivo, cronômetro, faltas, escalação ou presença.
- Não há histórico de edições anteriores nem comparação entre edições.
- Não há área administrativa, login ou edição no site.
- Não há modo escuro, impressão/PDF ou analytics.
- Não há detecção automática de W.O. ou de quantidade de jogadoras em quadra.
- A retirada de um time não é automatizada: a organização registra um W.O. `withdrawal` em cada partida restante e mantém o elenco/histórico como estão.
- O amistoso não tem placar, eventos, cartões, estatísticas, suspensões ou efeito na classificação/pódio; a fonte guarda apenas data, horário, local e nota.
- Não há partida de 3º lugar nem 4º lugar; o 3º é o 3º da classificação.
- Não há imagens de jogadoras.
- O site não substitui a organização/arbitragem.

### 16.4 Questões em aberto (não bloqueantes)

Estas são **dados operacionais**, não decisões de spec:

- Nomes definitivos dos times.
- Horários exatos das partidas, incluindo os dois jogos do mesmo time em 24/11, 26/11 e 01/12.
- Local/quadra exata a exibir.
- Horário, local e texto do amistoso do 3º colocado.
- Quem disputa o amistoso (o schema não guarda participantes; se necessário, a organização descreve na nota).
- Critério de assistência em casos duvidosos (decisão da organização).
- Como acomodar novas alunas quando todos os times estiverem com 8 (decisão da organização; o site bloqueia a 9ª ativa).
- Data de habilitação do Pages.

Nenhuma questão bloqueia a implementação. A UI tem fallback para horário/local; os nomes vêm da fonte; a 9ª ativa é bloqueada.

### 16.5 Decisões que NÃO ficam em aberto

- Stack, schema, rotas, algoritmos, validação, tokens, testes, CI e deploy estão fechados nesta SPEC.
- FR-10 está adiado; FR-20 é futuro.
- W.O. é 1x0.
- Badge público é <5; aviso de build é <7.
- `finalists` é snapshot validado, apenas para a final.
- `drawOrder` é obrigatório apenas quando o sorteio é necessário.
- O formato é 3 times, 6 jogos de grupo em turno e returno e final única; não há 3º x 4º.
- O pódio tem 3 posições; não há 4º lugar.
- O confronto direto usa os dois jogos e só vale com ambos `finished`.
- O amistoso é informativo e não altera nada.
- A retirada de time é W.O. manual por partida.
- Não há JS de cliente.

---

## 17. Definição de pronto

### 17.1 Esta entrega (SPEC)

- [x] `SPEC.md` na raiz, em pt-BR.
- [x] Todos os blocos previstos da SPEC (1–17 + Apêndices A–G).
- [x] Schema YAML completo e consistente.
- [x] Algoritmos determinísticos de placar, desempate, cartões, suspensão, estatísticas, W.O., shootout e pódio.
- [x] Catálogo de validação com bloqueantes e avisos.
- [x] Catálogo de páginas/estados, incluindo os quatro estados da Início.
- [x] Rotas sem Regulamento.
- [x] Tokens, contraste, foco, teclado e 320px com critérios verificáveis.
- [x] Build/CI/deploy com comandos npm reais.
- [x] Matriz de testes por regra e rastreabilidade FR-01..FR-21, incluindo TST-115 (estatísticas coletivas com shootout) e TST-116 (simetria dos confrontos).
- [x] Nenhuma questão bloqueante em aberto; apenas dados operacionais.
- [x] Emendas registradas e alinhamento do PRD v1.1/AGENTS v1.1 aplicado.
- [x] `PRD.md`, `AGENTS.md`, `README.md`, `docs/decisoes-v1.1.md`, `PLAN.md` e `TASKS.md` alinhados nesta entrega.

### 17.2 Implementação do MVP

- [ ] `data/2026/copa.yaml` válido, com 3 times, 7 partidas e elencos.
- [ ] `npm ci` funciona em ambiente limpo.
- [ ] `npm run validate` passa sem erros; avisos revisados.
- [ ] `npm run check` passa.
- [ ] `npm test` passa.
- [ ] `npm run build` gera `dist/` com todas as rotas.
- [ ] `npm run test:build` passa (0 KB JS, CSS <30 KB gzip, termos proibidos, rotas, 404).
- [ ] `npm run test:e2e` passa (axe, teclado, 320px, meta tags, 404).
- [ ] `dist/404.html` existe e funciona.
- [ ] `/regulamento/` não existe e não aparece em links.
- [ ] 6 páginas na nav; menu mobile `<details>` funcional.
- [ ] Início nos quatro estados, sem contagem regressiva.
- [ ] Jogos agrupados por data; 7 partidas oficiais; sem card ou rota de 3º lugar.
- [ ] Detalhe com placar, eventos, W.O., shootout e desfalques.
- [ ] Classificação com 13 colunas, 3 linhas, provisória, sorteio e critérios.
- [ ] Times com elenco ativo, badge <5, suspensão e histórico.
- [ ] Estatísticas com artilharia, assistências, cartões e gols contra.
- [ ] Fase final com “a definir”, card do amistoso (se houver) antes da final e pódio de 3 sem 4º lugar.
- [ ] Metadados, canonical, OG sem imagem, favicon e 404.
- [ ] Nenhum nome da instituição/Airbnb, fonte proprietária, foto ou dado pessoal.
- [ ] CI/publicação no GitHub Pages funcionando; site anterior preservado em falha.
- [ ] Checklist manual do Apêndice D assinado.
- [ ] Commit `docs` com PRD/AGENTS/README alinhados e mensagem Conventional Commits.

### 17.3 Critérios de aceite finais

1. A mesma fonte produz sempre a mesma classificação e estatísticas.
2. Nenhum placar/classificação/estatística é editado manualmente.
3. Nenhum evento referencia jogadora fora do elenco ou suspensa indevidamente.
4. Nenhuma 9ª ativa, apelido duplicado, jogadora em dois times ou transferência após atuação.
5. Nenhuma final sem `finalists` válido; correção bloqueia até confirmação. Não há partida de 3º lugar.
6. Nenhuma rota/link/placeholder de Regulamento ou de 3º lugar.
7. Nenhum JS de cliente, fonte externa, imagem de pessoa ou analytics.
8. Nenhum texto público com instituição, Airbnb ou dado pessoal.
9. WCAG 2.2 AA verificado; 320px sem overflow da página.
10. O amistoso é exibido apenas como card informativo e não altera classificação, estatísticas, suspensões ou pódio.
11. Publicação só após validação, testes, build e E2E.

---

## Apêndice A — Exemplo YAML completo

Exemplo ilustrativo de temporada encerrada, consistente com o schema e os algoritmos. Pode ser usado como fixture válida. Os nomes são provisórios; horários e local são dados operacionais.

```yaml
# Fonte pública da Copa de Futsal Feminino Vila Mariana 2026.
# Privacidade: apenas apelido, posição, time e estatísticas.
# O mapeamento p-XXX -> pessoa fica FORA do repositório.
# Não inclua nome completo, foto, contato, camisa ou data de nascimento.

edition: 2026
timezone: "America/Sao_Paulo"

teams:
  - id: "ta"
    name: "Time A"
    abbreviation: "TA"
    players:
      - id: "p-001"
        nickname: "Ana"
        position: "goleira"
        joinedAt: "2026-11-10T00:00:00-03:00"
        leftAt: null
      - id: "p-002"
        nickname: "Bia"
        position: "linha"
        joinedAt: "2026-11-10T00:00:00-03:00"
        leftAt: null
      - id: "p-003"
        nickname: "Carla"
        position: "linha"
        joinedAt: "2026-11-10T00:00:00-03:00"
        leftAt: null
      - id: "p-004"
        nickname: "Dani"
        position: "linha"
        joinedAt: "2026-11-10T00:00:00-03:00"
        leftAt: null
      - id: "p-005"
        nickname: "Eva"
        position: "linha"
        joinedAt: "2026-11-10T00:00:00-03:00"
        leftAt: null
      - id: "p-006"
        nickname: "Fabi"
        position: "linha"
        joinedAt: "2026-11-10T00:00:00-03:00"
        leftAt: null
      - id: "p-007"
        nickname: "Gabi"
        position: "linha"
        joinedAt: "2026-11-10T00:00:00-03:00"
        leftAt: "2026-11-25T00:00:00-03:00"
      - id: "p-008"
        nickname: "Nana"
        position: "linha"
        joinedAt: "2026-11-10T00:00:00-03:00"
        leftAt: null

  - id: "tb"
    name: "Time B"
    abbreviation: "TB"
    players:
      - id: "p-009"
        nickname: "Helo"
        position: "goleira"
        joinedAt: "2026-11-10T00:00:00-03:00"
        leftAt: null
      - id: "p-010"
        nickname: "Isa"
        position: "linha"
        joinedAt: "2026-11-10T00:00:00-03:00"
        leftAt: null
      - id: "p-011"
        nickname: "Joana"
        position: "linha"
        joinedAt: "2026-11-10T00:00:00-03:00"
        leftAt: null
      - id: "p-012"
        nickname: "Kiki"
        position: "linha"
        joinedAt: "2026-11-10T00:00:00-03:00"
        leftAt: null
      - id: "p-013"
        nickname: "Lila"
        position: "linha"
        joinedAt: "2026-11-10T00:00:00-03:00"
        leftAt: null
      - id: "p-014"
        nickname: "Mari"
        position: "linha"
        joinedAt: "2026-11-10T00:00:00-03:00"
        leftAt: null
      - id: "p-015"
        nickname: "Nanda"
        position: "linha"
        joinedAt: "2026-11-10T00:00:00-03:00"
        leftAt: null

  - id: "tc"
    name: "Time C"
    abbreviation: "TC"
    players:
      - id: "p-016"
        nickname: "Olívia"
        position: "goleira"
        joinedAt: "2026-11-10T00:00:00-03:00"
        leftAt: null
      - id: "p-017"
        nickname: "Paula"
        position: "linha"
        joinedAt: "2026-11-10T00:00:00-03:00"
        leftAt: null
      - id: "p-018"
        nickname: "Rafa"
        position: "linha"
        joinedAt: "2026-11-10T00:00:00-03:00"
        leftAt: null
      - id: "p-019"
        nickname: "Sara"
        position: "linha"
        joinedAt: "2026-11-10T00:00:00-03:00"
        leftAt: null
      - id: "p-020"
        nickname: "Tati"
        position: "linha"
        joinedAt: "2026-11-10T00:00:00-03:00"
        leftAt: null
      - id: "p-021"
        nickname: "Ula"
        position: "linha"
        joinedAt: "2026-11-10T00:00:00-03:00"
        leftAt: null
      - id: "p-022"
        nickname: "Vivi"
        position: "linha"
        joinedAt: "2026-11-10T00:00:00-03:00"
        leftAt: null

matches:
  - id: "g1"
    stage: "group"
    round: 1
    homeTeamId: "ta"
    awayTeamId: "tb"
    date: "2026-11-24"
    startsAt: "2026-11-24T19:00:00-03:00"
    venue: "Vila Mariana, São Paulo"
    status: "finished"
    walkover: null
    shootout: null
    events:
      - type: "yellow"
        playerId: "p-009"
        minute: 8
      - type: "goal"
        playerId: "p-002"
        assistPlayerId: "p-007"
        minute: 12
        penalty: false

  - id: "g2"
    stage: "group"
    round: 1
    homeTeamId: "tb"
    awayTeamId: "tc"
    date: "2026-11-24"
    startsAt: "2026-11-24T20:30:00-03:00"
    venue: "Vila Mariana, São Paulo"
    status: "finished"
    walkover:
      winnerTeamId: "tc"
      reason: "no_show"
      note: "TB não compareceu."
    shootout: null
    events: []
    # W.O. 0x1 para TC na ordem mandante/visitante; sem gols ou assistências.

  - id: "g3"
    stage: "group"
    round: 2
    homeTeamId: "ta"
    awayTeamId: "tc"
    date: "2026-11-26"
    startsAt: "2026-11-26T19:00:00-03:00"
    venue: "Vila Mariana, São Paulo"
    status: "finished"
    walkover: null
    shootout: null
    events:
      - type: "yellow"
        playerId: "p-005"
        minute: 9
      - type: "yellow"
        playerId: "p-016"
        minute: 14
      - type: "goal"
        playerId: "p-003"
        assistPlayerId: "p-002"
        minute: 18
        penalty: false
      - type: "yellow"
        playerId: "p-016"
        minute: 22
        # 2º amarelo -> vermelho derivado; p-016 suspensa em g5.

  - id: "g4"
    stage: "group"
    round: 2
    homeTeamId: "tb"
    awayTeamId: "ta"
    date: "2026-11-26"
    startsAt: "2026-11-26T20:30:00-03:00"
    venue: "Vila Mariana, São Paulo"
    status: "finished"
    walkover: null
    shootout: null
    events:
      - type: "ownGoal"
        playerId: "p-005"
        minute: 11
        # Gol contra de TA; o gol é creditado a TB.
      - type: "goal"
        playerId: "p-004"
        assistPlayerId: "p-006"
        minute: 19
        penalty: false

  - id: "g5"
    stage: "group"
    round: 3
    homeTeamId: "tc"
    awayTeamId: "ta"
    date: "2026-12-01"
    startsAt: "2026-12-01T19:00:00-03:00"
    venue: "Vila Mariana, São Paulo"
    status: "finished"
    walkover: null
    shootout: null
    events:
      - type: "goal"
        playerId: "p-017"
        assistPlayerId: "p-018"
        minute: 7
        penalty: false
      - type: "goal"
        playerId: "p-004"
        assistPlayerId: "p-002"
        minute: 13
        penalty: false
      - type: "goal"
        playerId: "p-018"
        assistPlayerId: "p-017"
        minute: 20
        penalty: false
      - type: "goal"
        playerId: "p-019"
        assistPlayerId: "p-020"
        minute: 27
        penalty: false
    # p-016 (TC) está suspensa por 2º amarelo em g3 e não tem eventos aqui.

  - id: "g6"
    stage: "group"
    round: 3
    homeTeamId: "tc"
    awayTeamId: "tb"
    date: "2026-12-01"
    startsAt: "2026-12-01T20:30:00-03:00"
    venue: "Vila Mariana, São Paulo"
    status: "finished"
    walkover: null
    shootout: null
    events:
      - type: "goal"
        playerId: "p-020"
        assistPlayerId: "p-021"
        minute: 9
        penalty: false
      - type: "yellow"
        playerId: "p-021"
        minute: 14
      - type: "goal"
        playerId: "p-012"
        assistPlayerId: "p-013"
        minute: 18
        penalty: false
      - type: "red"
        playerId: "p-014"
        minute: 24
        # Vermelho direto; TB não tem próxima partida.

  - id: "final"
    stage: "final"
    round: null
    date: "2026-12-03"
    startsAt: "2026-12-03T20:30:00-03:00"
    venue: "Vila Mariana, São Paulo"
    status: "finished"
    walkover: null
    shootout:
      home: 4
      away: 3
    events:
      - type: "goal"
        playerId: "p-017"
        assistPlayerId: "p-018"
        minute: 10
        penalty: false
      - type: "yellow"
        playerId: "p-019"
        minute: 12
      - type: "goal"
        playerId: "p-002"
        assistPlayerId: null
        minute: 17
        penalty: true
      - type: "yellow"
        playerId: "p-006"
        minute: 21
      # 1x1 no tempo normal; TC venceu nos pênaltis por 4x3.

finalists:
  final: ["tc", "ta"]

drawOrder: null

friendly:
  date: "2026-12-03"
  startsAt: "2026-12-03T18:30:00-03:00"
  venue: "Vila Mariana, São Paulo"
  note: "Amistoso do 3º colocado contra um time convidado. Não vale pontos e não altera a competição."

notices: []
```

**Conferência do exemplo:**

- Grupo: TC 7 pts, 5 gols pró, 3 contra, saldo +2; TA 7 pts, 4 pró, 4 contra, saldo 0; TB 2 pts, 2 pró, 4 contra, saldo −2.
- TC e TA empatam em pontos. O confronto direto soma os dois jogos: g3 TA 1x0 TC e g5 TC 3x1 TA. Pontos 3–3; saldo agregado TC 3x2, então TC é 1ª e TA é 2ª. TB é 3ª.
- Finalistas: final `tc x ta`; não há 3º x 4º. O 3º lugar é TB, pela classificação.
- g2 é W.O. 0x1 para TC na ordem mandante/visitante, sem gols/assistências; conta pontos, vitória, gols pró/contra e saldo.
- p-016 (TC) recebe o 2º amarelo em g3 e cumpre suspensão em g5; não tem eventos em g5.
- p-014 (TB) recebe vermelho direto em g6; como TB não tem próxima partida, a suspensão não tem efeito.
- Final 1x1, shootout 4x3 para TC; campeã TC, vice TA, 3ª TB. **Não há 4º lugar.**
- p-007 (TA) saiu em 25/11 e tem assistência em g1; aparece como “fora do elenco ativo”.
- O amistoso de 03/12 às 18:30 é anterior à final das 20:30 e não entra em classificação, estatísticas, suspensões ou pódio.
- O exemplo não usa `drawOrder`; nenhum empate chegou ao sorteio.

---

## Apêndice B — Como atualizar a Copa

Receitas operacionais. Sempre rode `npm run validate` antes de commitar. A edição é feita apenas na fonte; não há admin.

### B.1 Antes da primeira partida

1. Preencher `edition`, `timezone`, 3 times, elencos e 7 partidas oficiais (g1…g6 + final).
2. `date` obrigatória; `startsAt` pode ser `null`; `venue` pode ser `null` nas partidas.
3. `status: "scheduled"`, `walkover: null`, `shootout: null`, `events: []`.
4. `finalists: null`, `drawOrder: null`, `friendly: null`, `notices: []`.
5. Rodar `npm run validate`, `npm test`, `npm run build`.
6. Publicar. A Início deve mostrar o estado “Antes da copa”.

### B.2 Adicionar jogadora

1. Confirmar que o time tem menos de 8 ativas.
2. Escolher o próximo ID opaco (`p-030`, etc.); não reutilizar.
3. Adicionar em `teams[].players` com:
   - `nickname` único no time;
   - `position`: `"goleira"`, `"linha"` ou `null`;
   - `joinedAt`: instante real com offset `-03:00`;
   - `leftAt: null`.
4. Não registrar eventos em partidas cujo `startsAt` seja anterior ou igual a `joinedAt`.
5. Atualizar o mapeamento privado fora do repositório (Apêndice F).
6. `npm run validate` e commit.

### B.3 Remover jogadora do elenco ativo

1. Definir `leftAt` com o instante efetivo da saída.
2. **NÃO** apagar a jogadora nem seus eventos.
3. Se o time ficar com menos de 7 ativas, revisar o aviso `VAL-W01`; se ficar com menos de 5, o badge público aparece.
4. `npm run validate`; a validação confirma que nunca houve mais de 8 ativas simultâneas.

### B.4 Registrar resultado de partida de grupo

1. Mudar `status` para `"finished"` e preencher `startsAt`.
2. Adicionar eventos de `goal`, `ownGoal`, `yellow`, `red`.
3. **NÃO** adicionar placar; ele é derivado.
4. Em gol: `assistPlayerId` opcional, do mesmo time e diferente da marcadora; `penalty: false` ou `true`.
5. Em pênalti: `assistPlayerId: null`.
6. Em gol contra: apenas `type`, `playerId`, `minute`.
7. Em segundo amarelo: registrar os dois `yellow`; **não** registrar `red`.
8. `npm run validate`, `npm test`, `npm run build`.

### B.5 Registrar W.O.

1. `status: "finished"` e `startsAt` administrativo (horário previsto).
2. `walkover`:
   ```yaml
   walkover:
     winnerTeamId: "ta"
     reason: "no_show" # no_show | insufficient_players | withdrawal
     note: "O time adversário não compareceu."
   ```
3. `shootout: null`.
4. `events: []` para `no_show`.
5. Para `insufficient_players`/`withdrawal`, permitir apenas cartões (`yellow`/`red`), nunca `goal`/`ownGoal`.
6. O placar exibido será 1x0 para o vencedor; não criar gol fictício.
7. `npm run validate` e commit.

### B.6 Registrar fase final

1. Confirmar que as 6 partidas de grupo estão `finished`.
2. Calcular a classificação com `npm run validate` (a validação aponta os finalistas esperados).
3. Preencher `finalists.final` exatamente com `[1º, 2º]`; não existe `thirdPlace`.
4. O 3º lugar é o 3º da classificação; não criar partida de 3º x 4º.
5. Se houver empate no tempo normal, preencher `shootout` com valores inteiros ≥0 e diferentes; não criar eventos de pênaltis.
6. Se não houver empate, `shootout: null`.
7. Se houver amistoso, preencher `friendly` com `date` igual à data da final, `startsAt` anterior ao horário da final, `venue` e `note`; senão, `friendly: null`.
8. `npm run validate` e commit.

### B.7 Corrigir resultado

1. Editar os eventos da partida.
2. Rodar `npm run validate`.
3. Se a classificação mudar e os finalistas já estiverem definidos, o build falha listando antigos/novos.
4. Atualizar `finalists.final` para confirmar. Se a final já ocorreu:
   - revisar os eventos da final e o `shootout`, se houver;
   - se a correção mudar o pódio, o build falha até `finalists` ser atualizado;
   - adicionar um `notice` explicando a correção.
5. Se a correção alterar um empate que dependia de sorteio, revisar `drawOrder` (ver B.9) e registrar `notice`.
6. `npm run validate`, `npm test`, `npm run build`.

```yaml
notices:
  - date: "2026-12-03"
    message: "Resultado da final corrigido após revisão da súmula."
```

### B.8 Adiar partida

1. Mudar `status` para `"postponed"`.
2. `startsAt: null` (ou manter um horário provisório, se desejado).
3. `events: []`, `walkover: null`, `shootout: null`.
4. Atualizar `date` se a data também mudar.
5. Quando remarcar: `status: "scheduled"`, nova `date`, novo `startsAt`.
6. `npm run validate`.

### B.9 Sorteio

1. Rodar `npm run validate`; se o sorteio for necessário sem `drawOrder`, o erro `VAL-018` aparece.
2. A organização realiza o sorteio e define a ordem dos 3 times.
3. Preencher `drawOrder` com uma permutação, por exemplo `["tc", "ta", "tb"]`.
4. Se o sorteio for refeito, substituir `drawOrder` pela nova permutação e adicionar um `notice`; o MVP não mantém histórico de sorteios, apenas o registro vigente.
5. `npm run validate`; a classificação usará o sorteio apenas nos grupos que chegaram a ele.
6. A UI mostra “Sorteio” nas linhas decididas.

### B.10 Publicar

1. Editar via GitHub web ou local.
2. `npm run validate`; corrigir erros.
3. Commit em `main` seguindo Conventional Commits.
4. Acompanhar o Actions; se falhar, o site anterior permanece.
5. Após o deploy, hard refresh.
6. Em caso de problema, reverter o commit e publicar novamente.

### B.11 O que nunca fazer

- Criar campo de placar, pontos ou classificação.
- Criar partida de 3º lugar, `thirdPlace` ou campo de 4º lugar.
- Tratar o amistoso como partida (placar, eventos, cartões, estatísticas ou link de jogo).
- Editar HTML/componentes para “corrigir” um resultado.
- Apagar jogadora/evento para “limpar” histórico.
- Registrar `red` explícito para segundo amarelo.
- Registrar gol fictício em W.O.
- Usar nome completo, foto, contato, camisa ou data de nascimento.
- Commitar mapeamento privado, segredo ou `.env`.
- Adicionar analytics, cookie de terceiros ou script externo.

---

## Apêndice C — Catálogo de mensagens de validação

Templates em pt-BR. `{path}` é o caminho do campo; `{expected}` e `{found}` são preenchidos pelo validador. A mensagem final sempre inclui os três.

| Código | Modelo de mensagem |
|---|---|
| VAL-001 | “Não foi possível ler o YAML: {detalhe}. Verifique a sintaxe na linha {linha}, coluna {coluna}.” |
| VAL-002 | “Campo inválido em {path}: esperado {expected}; encontrado {found}. Consulte o schema da §5.4.” |
| VAL-003 | “Edição/fuso inválidos: esperado edition 2026 e timezone America/Sao_Paulo; encontrado {found}.” |
| VAL-004 | “Times inválidos: esperado exatamente 3 times com IDs ta, tb e tc; encontrado {found}.” |
| VAL-005 | “Abreviação duplicada: {found}. Cada time deve ter abreviação única.” |
| VAL-006 | “ID de jogadora duplicado: {found}. A mesma jogadora não pode estar em dois times nem repetir o ID.” |
| VAL-007 | “Apelido duplicado no time {time}: “{nickname}”. Após normalização, o apelido deve ser único dentro do time.” |
| VAL-008 | “Intervalo inválido para {playerId}: leftAt ({found}) deve ser posterior a joinedAt ({expected}).” |
| VAL-009 | “Elenco com {found} jogadoras ativas em {instante}; máximo permitido: 8. A 9ª ativa deve sair com leftAt ou ser registrada em outro time.” |
| VAL-010 | “Vínculo inválido de {playerId}: há evento em partida do time {timeAntigo}, mas a jogadora está no time {timeAtual}. Jogadora que já atuou não pode trocar de time.” |
| VAL-011 | “Conjunto de partidas inválido: esperado g1..g6 e final; encontrado {found}. Verifique stage/round/ID.” |
| VAL-012 | “Confronto de grupo inválido em {path}: esperado {expected}; encontrado {found}. O turno e returno têm seis confrontos definidos.” |
| VAL-013 | “Data/hora inválida em {path}: esperado {expected}; encontrado {found}. Use data real e startsAt com fuso; a data local em America/Sao_Paulo deve ser igual a date.” |
| VAL-014 | “Status {found} incompatível: finished exige startsAt; scheduled/postponed não podem ter eventos, walkover ou shootout.” |
| VAL-015 | “Ordem de partidas inválida para {time}: {found}. A ordem canônica é g1, g2, g3, g4, g5, g6 e final; nas datas com dois jogos do mesmo time, os horários devem respeitar essa ordem.” |
| VAL-016 | “Fase final inválida: {found}. As 6 partidas de grupo devem estar finished antes da final.” |
| VAL-017 | “Finalistas divergentes da classificação. Antigos: {old}. Novos: {new}. Atualize finalists.final para confirmar a correção.” |
| VAL-018 | “Sorteio necessário, mas drawOrder está {found}. Registre uma permutação dos 3 times ou resolva o empate.” |
| VAL-019 | “Evento em {path} referencia {playerId}, que não está no elenco de {home} nem de {away} na partida {matchId}.” |
| VAL-020 | “Jogadora {playerId} inelegível em {matchId}: joinedAt {joinedAt}, startsAt {startsAt}, leftAt {leftAt}. Esperado joinedAt < startsAt < leftAt (ou leftAt nulo).” |
| VAL-021 | “Assistência inválida em {path}: esperado jogadora do time da marcadora, diferente dela, apenas em gol normal; encontrado {found}.” |
| VAL-022 | “Cartões inválidos para {playerId} em {matchId}: encontrado {found}. Máximo de 2 amarelos por partida; o 2º amarelo é vermelho derivado; não registrar red explícito com 2 amarelos.” |
| VAL-023 | “{playerId} ({team}) está suspensa por {reason} em {sentOffIn} e não pode ter eventos em {suspendedFor}.” |
| VAL-024 | “W.O. inválido em {matchId}: {found}. Esperado partida finished, vencedor participante, motivo válido e sem shootout.” |
| VAL-025 | “Shootout inválido em {matchId}: {found}. Só é permitido na final finished, sem W.O., após empate no tempo normal, com valores ≥0 e diferentes.” |
| VAL-026 | “Campo de placar/classificação materializado em {path}: {found}. Placar, pontos e classificação são derivados; remova o campo.” |
| VAL-027 | “Partida {matchId} não pode ter homeTeamId/awayTeamId nem round diferente de null; os times vêm de finalists.” |
| VAL-028 | “Referência inexistente em {path}: {found}. Verifique times, jogadoras, partidas e notices.” |
| VAL-029 | “Eventos incompatíveis com W.O. em {matchId}: {found}. no_show não tem eventos; insufficient_players/withdrawal só permitem cartões.” |
| VAL-030 | “Final com empate no tempo normal exige shootout; ou shootout presente sem empate. Encontrado: {found}.” |
| VAL-031 | “Notice inválido em {path}: esperado data real e mensagem de 1 a 300 caracteres; encontrado {found}.” |
| VAL-032 | “Campo de privacidade proibido em {path}: {found}. Permitido apenas id, nickname, position, joinedAt e leftAt.” |
| VAL-033 | “Amistoso inválido em {path}: esperado data igual à final, horário anterior à final (quando definido), local e nota preenchidos, sem campos de partida; encontrado {found}.” |
| VAL-W01 | “Aviso: time {time} tem {n} jogadoras ativas; o alvo é 7 ou 8. A publicação não é bloqueada.” |
| VAL-W02 | “Aviso: partida {matchId} está em {date}, fora do calendário original. Confirme o adiamento.” |
| VAL-W03 | “Aviso: os times {a} e {b} têm o mesmo nome após normalização; a abreviação distingue, mas confirme o nome público.” |
| VAL-W04 | “Aviso: partida {matchId} está agendada, mas a data/horário já passou. A UI mostrará ‘Resultado pendente’.” |

**Resumo do job:**

```text
## Validação da Copa 2026

- Erros bloqueantes: {n}
- Avisos: {n}

### Erros
{tabela ou “Nenhum erro.”}

### Avisos
{tabela ou “Nenhum aviso.”}
```

- O script imprime a mesma informação no terminal.
- O exit code é `1` com erro, `0` sem erro.
- O resumo nunca inclui nome completo, mapeamento privado ou conteúdo de `.env`.
- Mensagens não usam termos da instituição ou da Airbnb.

---

## Apêndice D — Checklist manual de acessibilidade

Executar antes da publicação e após mudanças de UI. Registrar data e responsável.

### D.1 Teclado e foco

- [ ] Tab percorre skip link → header → nav → main → footer em ordem lógica.
- [ ] Skip link aparece ao receber foco e leva a `#conteudo`.
- [ ] Todos os links e o `<summary>` “Menu” são acionáveis com Enter/Espaço.
- [ ] O menu mobile abre/fecha sem JS e sem perder foco.
- [ ] O foco é visível em links, botões, summary, cards e contêiner de tabela.
- [ ] O anel de foco tem pelo menos 3:1 contra fundo e entorno.
- [ ] Nenhum foco fica obscurecido por header/card.
- [ ] A tabela larga pode ser rolada com setas quando o contêiner está focado.
- [ ] Não há armadilha de foco.

### D.2 Leitor de tela

- [ ] `<html lang="pt-BR">` e títulos legíveis.
- [ ] Um `<h1>` por página; hierarquia sem saltos.
- [ ] Landmarks `header`, `nav`, `main`, `footer`, `aside` são anunciados.
- [ ] Tabelas têm caption e cabeçalhos com `scope`.
- [ ] Abreviações V/E/D/GP/GC/CA/CV/PD são expandidas.
- [ ] Placar de pênaltis é lido por extenso, não só “1 (4) x (3) 1”.
- [ ] “Sorteio”, “Suspensa”, “W.O.”, “Resultado pendente” e “Elenco em formação” são lidos como texto.
- [ ] O card do amistoso é lido como informativo, sem ser anunciado como partida ou resultado.
- [ ] Links de partida/time têm nomes acessíveis claros.
- [ ] Ícones decorativos são ignorados; ícones informativos têm nome.

### D.3 Zoom, viewport e contraste

- [ ] 320px: página sem overflow horizontal; tabela rola no contêiner.
- [ ] 360px, 768px, 1024px e 1280px sem quebra de layout.
- [ ] Zoom 200% sem perda de conteúdo/funcionalidade.
- [ ] Texto normal ≥4,5:1; texto grande/componentes ≥3:1.
- [ ] Foco ≥3:1.
- [ ] Nenhuma informação essencial depende só de cor (testar em escala de cinza).
- [ ] Nenhum texto abaixo de 14px.
- [ ] Alvos de toque ≥44px na nav/menu; links inline ≥24px.

### D.4 Movimento e mídia

- [ ] `prefers-reduced-motion: reduce` remove transições/animacões.
- [ ] Não há autoplay, carrossel, vídeo ou conteúdo piscante.
- [ ] Não há parallax.
- [ ] Nenhuma imagem de pessoa; favicon sem marca de terceiros.

### D.5 Navegadores e dispositivos

- [ ] Chrome desktop.
- [ ] Firefox desktop.
- [ ] Safari desktop.
- [ ] Edge desktop.
- [ ] iOS Safari (ou simulador).
- [ ] Chrome Android (ou emulação).
- [ ] 4G simulado: página carrega sem layout quebrado.
- [ ] Lighthouse mobile ≥90 em Performance/Acessibilidade/Boas práticas/SEO nas páginas Início e partida.

### D.6 Conteúdo e privacidade

- [ ] Nome público correto; nenhuma ocorrência da instituição.
- [ ] Nenhuma ocorrência de “Airbnb”/marcas.
- [ ] Nenhum nome completo, foto, contato, camisa ou data de nascimento.
- [ ] Notas do amistoso e avisos usam apelidos/descrições genéricas, sem nome completo ou dado pessoal.
- [ ] Nenhum ID de jogadora no HTML/URL.
- [ ] Nenhum analytics/cookie/terceiros.
- [ ] 404 funciona e volta para a Início.
- [ ] Nenhum link/rota de Regulamento ou de 3º lugar.
- [ ] O amistoso aparece só na Fase final, com o rótulo “Informativo — não é partida oficial”.

### D.7 Assinatura

| Data | Responsável | Resultado | Observações |
|---|---|---|---|
| | | | |

---

## Apêndice E — Matriz de testes por regra

Legenda: U = unitário (Vitest); D = dados/schema (Vitest); B = build (`check-build`); E = E2E (Playwright); A = axe; M = manual.

Os IDs `TST-*` são estáveis. Casos removidos na v1.1 (por exemplo, disputa de 3º lugar) permanecem reservados e **NÃO DEVEM** ser reutilizados para outra regra; novos casos usam IDs novos. `TST-111` permanece reservado (caso removido na v1.1) e não deve ser reutilizado.

### E.1 Classificação e desempate

| TST | Regra/FR | Cenário | Ação/fixture | Esperado | Tipo |
|---|---|---|---|---|---|
| TST-001 | FR-06 | Pontuação 3/1/0 | 3 partidas com V/E/D | Linhas com 3/1/0 pontos | U |
| TST-002 | FR-06 | Ordenação por pontos | 3 times com pontos distintos | Ordem desc | U |
| TST-003 | FR-06 | Confronto direto em dois jogos | A e B empatados; A soma mais pontos nos dois jogos | A antes de B | U |
| TST-004 | FR-06 | Confronto direto empatado em pontos | Dois jogos com pontos iguais e saldo agregado diferente | Saldo agregado decide | U |
| TST-005 | FR-06 | Confronto direto não realizado | Um dos dois jogos scheduled/postponed | h2h ignorado; critérios seguintes | U |
| TST-006 | FR-06 | 3+ empatados | A/B/C com 6 pts | h2h não aplicado | U |
| TST-007 | FR-06 | 3+ reduzido a 2 | Critério separa A e B/C | h2h reaplicado a B/C | U |
| TST-008 | FR-06 | Critério vitórias | Times com wins diferentes | Maior wins à frente | U |
| TST-009 | FR-06 | Saldo/gols pró | `goalDifference` e `goalsFor` diferentes | Ordem correta | U |
| TST-010 | FR-06 | Menos gols contra | saldo/gols pró iguais, `goalsAgainst` diferente | Menor `goalsAgainst` à frente | U |
| TST-011 | FR-06 | Pontos disciplinares | Empate até disciplina | Menor pontuação à frente | U |
| TST-012 | FR-06 | Sorteio aplicado | Empate total + drawOrder | Ordem do drawOrder; badge | U |
| TST-013 | FR-06/VAL-018 | Sorteio sem drawOrder | Grupo completo, empate total + null | `DrawRequiredError`/VAL-018 | U/D |
| TST-014 | FR-06 | Classificação provisória | Uma partida scheduled | `provisional=true` | U |
| TST-015 | FR-06 | W.O. na classificação | g2 W.O. 1x0 | Pontos/gols/saldo como 1x0 | U |
| TST-016 | FR-06 | Final fora da classificação | Cartões/gols na final | Classificação inalterada | U |
| TST-105 | FR-06/VAL-018 | Empate total provisório | Grupo incompleto, empate total, `drawOrder: null` | Ordem fixa ta…tc; sem erro/badge | U |
| TST-110 | FR-06 | H2H agregado com W.O. | Dois jogos, um deles W.O. 1x0 | W.O. conta como 1x0 no agregado | U |

### E.2 Cartões e suspensão

| TST | Regra/FR | Cenário | Ação/fixture | Esperado | Tipo |
|---|---|---|---|---|---|
| TST-017 | FR-13 | Amarelo/vermelho | 1 yellow; 1 red | 1 e 2 pontos | U |
| TST-018 | FR-13 | 1 amarelo + vermelho direto | Mesma jogadora/partida | 3 pontos | U |
| TST-019 | FR-13 | Dois amarelos | 2 yellow, sem red | 3 pontos; red derivado=1 | U |
| TST-020 | VAL-022 | Terceiro amarelo no mesmo jogo | 3 yellow na mesma partida | Erro bloqueante | D |
| TST-021 | VAL-022 | Red explícito com 2 amarelos | 2 yellow + red | Erro bloqueante | D |
| TST-022 | FR-13 | Suspensão próxima partida | Red em g1; g3 do time | Suspensa em g3 | U |
| TST-023 | FR-13 | Sem próxima partida | Red na final ou na última partida do time | `suspendedFor=null` | U |
| TST-024 | VAL-023 | Evento de suspensa | Red em g1; evento em g3 | Erro bloqueante | D/U |
| TST-025 | FR-13 | Sem acúmulo de amarelos | 1 yellow em jogos diferentes | Sem suspensão | U |
| TST-026 | FR-13 | Cartões na final | Yellow/red na final | Contam stats; não classificação | U |
| TST-027 | FR-13 | Cartões em W.O. | Cards em W.O. | Contam stats; `no_show` não tem | U/D |
| TST-112 | FR-13 | Suspensão no mesmo dia | Red em g3; time joga g4 na mesma data | Suspensa em g4, a próxima canônica | U |

### E.3 Gols, assistências, pênaltis e estatísticas

| TST | Regra/FR | Cenário | Ação/fixture | Esperado | Tipo |
|---|---|---|---|---|---|
| TST-028 | FR-05 | Gol normal | 1 goal | Placar 1x0; artilharia +1 | U |
| TST-029 | FR-05 | Pênalti do tempo normal | goal penalty=true | Placar/artilharia +1 | U |
| TST-030 | FR-05 | Gol contra | ownGoal de TB em TA x TB | TA +1; ownGoals TB +1; goals TB 0 | U |
| TST-031 | FR-05 | Assistência válida | goal + assist mesmo time | Assistência +1 | U |
| TST-032 | VAL-021 | Assistência inválida | Mesma marcadora/outro time/pênalti/ownGoal | Erro bloqueante | D |
| TST-033 | FR-08 | Shootout fora das estatísticas | Final 1x1, 4x3 | Gols normais só; shootout não conta | U |
| TST-034 | FR-08 | Ordem da artilharia | Gols/assistências/nomes | Ordem normativa | U |
| TST-035 | FR-08 | Ordem de assistências | Assistências/gols/nomes | Ordem normativa | U |
| TST-036 | FR-08 | Ordem de cartões | Pontos/red/yellow/nomes | Ordem normativa | U |
| TST-037 | FR-08 | Gols contra | Seção separada | Fora da artilharia | U/E |
| TST-038 | FR-17 | Fora do elenco ativo | p-007 leftAt + assist | Marca textual “fora do elenco ativo” | U/E |
| TST-115 | FR-08 | Estatísticas coletivas com shootout | Final 1x1, 4x3; grupo + final | Ambos +1 empate; vencedor +1 `shootoutWins`; perdedor +1 `shootoutLosses`; GP/GC/SG sem shootout | U |

### E.4 Elenco e elegibilidade

| TST | Regra/FR | Cenário | Ação/fixture | Esperado | Tipo |
|---|---|---|---|---|---|
| TST-039 | FR-03 | 7/8 ativas | Time com 7 e 8 | Válido | D |
| TST-040 | FR-03/VAL-009 | 9ª ativa | Time com 9 simultâneas | Erro bloqueante | D |
| TST-041 | FR-03/VAL-W01 | Menos de 7 | Time com 6 | Aviso, exit 0 | D |
| TST-042 | FR-03 | Badge <5 | Time com 4 ativas | Badge público; 6 sem badge | E/M |
| TST-043 | VAL-007 | Apelido duplicado | “Ana” e “ana” no time | Erro; “Ana” e “Aná” válidos | D |
| TST-044 | VAL-006 | Jogadora em dois times | Mesmo p-001 em TA/TB | Erro bloqueante | D |
| TST-045 | FR-15 | leftAt preserva histórico | p-007 sai, tem assistência | Histórico mantido; não ocupa vaga | U/D |
| TST-046 | VAL-020 | Elegibilidade | joinedAt >= startsAt | Erro bloqueante | D |
| TST-047 | VAL-010 | Transferência após atuar | p-001 com evento em TA e agora em TB | Erro bloqueante | D |
| TST-048 | VAL-009 | Sobreposição >8 | 8 ativas + 1 joined antes de leftAt | Erro no instante | D |

### E.5 Validação, schema e fase final

| TST | Regra/FR | Cenário | Ação/fixture | Esperado | Tipo |
|---|---|---|---|---|---|
| TST-049 | VAL-002 | Campo desconhecido | `fullName` | Erro de schema | D |
| TST-050 | VAL-032 | Campo de privacidade | `photo`/`contact`/`birthDate` | Erro de schema | D |
| TST-051 | VAL-013 | Data/hora inválida | 31/02 ou startsAt sem fuso | Erro bloqueante | D |
| TST-052 | VAL-014 | Finished sem startsAt | `status: finished`, `startsAt: null` | Erro bloqueante | D |
| TST-053 | VAL-014 | Scheduled com eventos | Evento em scheduled | Erro bloqueante | D |
| TST-054 | VAL-011/012 | Partidas/confrontos | ID faltando ou par errado | Erro bloqueante | D |
| TST-055 | VAL-028 | Referência inexistente | p-999/time x/match z | Erro bloqueante | D |
| TST-056 | VAL-002 | Agregação | Vários erros no mesmo YAML | Todos listados | D |
| TST-057 | VAL-W02 | Aviso não bloqueia | Data fora do calendário | Exit 0 + aviso | D |
| TST-058 | VAL-017 | finalists nulo incompleto | Grupo incompleto | Válido | D |
| TST-059 | VAL-017 | finalists divergente | Grupo completo, snapshot errado | Erro com antigos/novos | D |
| TST-060 | VAL-016 | Final antes do grupo | Final finished, grupo incompleto | Erro bloqueante | D |
| TST-061 | VAL-024/029 | W.O. inválido | no_show com gol/cartão; winner inválido | Erro bloqueante | D |
| TST-062 | VAL-025/030 | Shootout inválido | Não empate, valores iguais, grupo | Erro bloqueante | D |
| TST-063 | VAL-026 | Placar materializado | Campo `score` | Erro de schema | D |
| TST-064 | VAL-031 | Notice inválido | Data inválida/mensagem vazia | Erro bloqueante | D |
| TST-065 | VAL-027 | Final com homeTeamId | Campo presente | Erro de schema | D |
| TST-107 | VAL-033 | Amistoso inválido | Data diferente da final, horário depois da final, local/nota vazio ou campo de partida | Erro bloqueante | D |
| TST-109 | SPEC-017 | 3 times e 7 partidas | Fonte com 3 times e g1…g6 + final | Válido; `td`/`terceiro` falham | D |
| TST-116 | FR-06/VAL-012 | Simetria dos confrontos | g1…g6 com g4 `tb x ta` | Cada par tem um jogo em casa para cada time; g4 `ta x tb` falha | D/U |

### E.6 Interface e estados

| TST | Regra/FR | Cenário | Ação/fixture | Esperado | Tipo |
|---|---|---|---|---|---|
| TST-066 | FR-09 | Início antes da copa | Nenhum resultado, data anterior | Estado 1; classificação zerada | E |
| TST-067 | FR-09 | Início durante | Grupo incompleto | Próxima rodada, últimos, resumo | E |
| TST-068 | FR-09 | Início grupo completo | 6 finished | Card da final; link | E |
| TST-069 | FR-09 | Início após final | 7 finished | Campeão + pódio de 3 | E |
| TST-070 | FR-04 | Próximo jogo/pendente | Scheduled vencida | “Resultado pendente”; não é próximo | U/E |
| TST-071 | FR-04 | Lista por data | 7 partidas oficiais | Grupos por data; sem 3º lugar; amistoso fora da lista | E |
| TST-072 | FR-05 | Ordem de eventos | Minutos 10, null, 10 | 10,10,null; empate por arquivo | U/E |
| TST-073 | FR-05 | W.O. na UI | g2 | “0 x 1 (W.O.)” na ordem mandante/visitante + motivo; sem gol | E |
| TST-074 | FR-05 | Shootout na UI | Final | “1 (4) x (3) 1” + texto acessível | E |
| TST-075 | FR-06 | Tabela classificação | Página | 13 colunas; provisória; sorteio | E |
| TST-076 | FR-03/13 | Time | Página TA | Badge/suspensão/histórico | E |
| TST-077 | FR-08 | Estatísticas | Página | 5 seções; estados vazios | E |
| TST-078 | FR-07 | Fase final | 3 estados | “A definir”, card da final, pódio de 3 | E |
| TST-106 | FR-21 | Card do amistoso | `friendly` presente | Card antes da final, rótulo informativo, sem placar/status/link | E |
| TST-108 | FR-21 | Amistoso fora do competitivo | `friendly` presente | Ausente da Início, jogos, classificação, estatísticas e pódio | U/E |
| TST-113 | FR-07 | Pódio de 3 | Final finished | Campeã, vice e 3ª; sem 4º lugar | U/E |
| TST-114 | FR-21 | Sem amistoso | `friendly: null` | Nenhum card ou placeholder | E |
| TST-079 | FR-10 | Sem Regulamento | Nav/rotas | 6 links; `/regulamento/` 404 | E/B |
| TST-080 | FR-11 | Menu mobile | 320px | `<details>` “Menu” por teclado | E |
| TST-081 | FR-19 | 404 | URL inexistente | 404.html + link Início | E/B |
| TST-082 | FR-19 | Meta/OG | Todas as rotas | title/description/canonical/OG; sem og:image | E/B |
| TST-083 | FR-12 | Rotas geradas | `dist/` | Todas as rotas e 404 | B |

### E.7 Build, segurança e determinismo

| TST | Regra/FR | Cenário | Ação/fixture | Esperado | Tipo |
|---|---|---|---|---|---|
| TST-084 | SPEC-003 | Zero JS | `dist/` | Nenhum `.js`/`<script>` | B |
| TST-085 | SPEC-014 | Orçamento CSS | `dist/` | <30 KB gzip/página | B |
| TST-086 | FR-18 | Termos proibidos | `dist/` | Sem Sesc/Airbnb/Circular/fontes | B |
| TST-087 | AGENTS | Referências fora do build | `dist/` | Sem `airbnb-design-design.md`/tokens | B |
| TST-088 | FR-17 | IDs de jogadora | `dist/` | Nenhum `p-\d{3}` | B |
| TST-089 | FR-01 | Dados hardcoded | `src/` | Sem nomes/datas/resultados de times | B |
| TST-090 | FR-11 | Contraste de tokens | Pares do §11.3 | Todos os usos permitidos passam | U |
| TST-091 | NFR-06 | Determinismo | Duas execuções com `SOURCE_DATE_EPOCH` fixo | Classificação, estatísticas e pódio idênticos | U |
| TST-092 | NFR-06 | Ordem de eventos | Embaralhar eventos | Classificação/stats iguais | U |
| TST-093 | NFR-06 | Não mutação | Congelar entrada | Nenhuma mutação | U |
| TST-094 | SPEC-015 | Sem terceiros | Playwright | Todas as requisições same-origin | E |

### E.8 Acessibilidade e layout

| TST | Regra/FR | Cenário | Ação/fixture | Esperado | Tipo |
|---|---|---|---|---|---|
| TST-095 | FR-11 | axe | Rotas principais | Sem serious/critical | A |
| TST-096 | FR-11 | Foco visível | Tab em links/menu/tabela | Outline ≥3px e contraste | E |
| TST-097 | FR-11 | Teclado | Skip/nav/details/tabela | Tudo acionável | E |
| TST-098 | FR-11 | 320px | Início/jogos/classificação/times/stats | Sem overflow da página | E |
| TST-099 | FR-11 | Tabela rolável | 320px | Region focável + instrução | E |
| TST-100 | FR-11 | Reduced motion | Emular reduce | Sem transições/animações | E |
| TST-101 | FR-11 | Sem cor exclusiva | Badges/status | Texto visível em todos | E/M |
| TST-102 | FR-11 | Semântica de tabelas | Todas as tabelas | caption/th/scope | E |
| TST-103 | FR-11 | Zoom 200% | Navegador | Sem perda de conteúdo | M |
| TST-104 | FR-11 | Leitores de tela | NVDA/VoiceOver | Navegação compreensível | M |

## Apêndice F — Procedimento do mapeamento privado de IDs

### F.1 Princípio

O site publica apenas o ID opaco `p-XXX`, o apelido, a posição, o time e as estatísticas. O vínculo entre `p-XXX` e a pessoa real é dado pessoal e **NÃO DEVE** estar no repositório, no histórico do Git, no build, no `dist/`, em URLs, em issues, em PRs, em mensagens de commit ou em páginas públicas.

O ID opaco reduz a exposição, mas não anonimiza por si só: apelido + time + calendário podem identificar uma pessoa. Por isso, o mapeamento é tratado como informação sensível mesmo sendo pequeno.

- O mapeamento **NÃO DEVE** ser lido por `npm run validate`, pelo build, pelos testes, pelo CI ou por qualquer código do site.
- O mapeamento **NÃO DEVE** ser necessário para reproduzir a classificação ou as estatísticas.
- O mapeamento **DEVE** existir antes de a primeira partida da jogadora e **DEVE** ser atualizado junto com a fonte.
- A ausência do mapeamento não bloqueia o build; a presença de dados pessoais na fonte ou no `dist/` bloqueia.

### F.2 Onde guardar

O mapa **DEVE** ficar fora do repositório, em um dos seguintes locais:

| Opção | Quando usar | Requisitos mínimos |
|---|---|---|
| Nota segura em gerenciador de senhas | Padrão para uma organização pequena. | Autenticação em dois fatores, acesso nominal, backup exportável. |
| Arquivo criptografado (`age` ou GPG) em armazenamento institucional | Quando for necessário manter uma planilha ou tabela. | Chave privada fora do repositório, backup da chave, acesso restrito. |
| Cofre de documentos com controle de acesso | Quando a organização já tiver esse fluxo. | Permissão nominal, registro de acesso, revogação ao final. |

**Proibido:** commitar o mapa em qualquer branch, tag ou histórico; anexá-lo a issue/PR/discussão; enviá-lo por grupo de mensagens; compartilhar link público de pasta/planilha; gravar nome completo em comentário do YAML, mensagem de commit, nome de branch ou descrição de PR.

### F.3 Formato mínimo

O mapa **DEVE** conter, no mínimo:

| Campo | Obrigatório | Conteúdo |
|---|---|---|
| `id` | Sim | `p-XXX`, exatamente o ID usado na fonte. |
| `nickname` | Sim | Apelido público vigente. |
| `teamId` | Sim | `ta`…`tc` do vínculo atual. |
| `fullName` | Sim | Nome civil, para contato e identificação interna. |
| `joinedAt` | Recomendado | Mesma data da fonte, para conferência. |
| `leftAt` | Não | Preenchido quando a jogadora sai do elenco ativo. |
| `notes` | Não | Contato interno, apelido anterior ou observação operacional. |

Modelo ilustrativo (guardar como `copa-2026.private.md`, fora do repositório):

```markdown
# Mapa privado — Copa de Futsal Feminino Vila Mariana 2026

Atualizado em: 2026-11-24T18:00:00-03:00
Responsável: <nome do responsável>
Próximo ID: p-023 (exemplo; conferir o maior ID da fonte)

| id | nickname | teamId | fullName | joinedAt | leftAt | notes |
|---|---|---|---|---|---|---|
| p-001 | Ana | ta | <nome completo> | 2026-11-10T00:00:00-03:00 | — | — |
| p-002 | Bia | ta | <nome completo> | 2026-11-10T00:00:00-03:00 | — | — |
```

- O arquivo **DEVE** ser salvo fora da árvore do repositório. Se, por engano, for criado dentro dela, o `.gitignore` **DEVE** impedir o commit (F.9).
- O mapa **NÃO DEVE** ser convertido em `copa.yaml`, CSV público, JSON em `public/` ou conteúdo de página.
- O campo `fullName` **NÃO DEVE** ser abreviado para “nome” na fonte pública; a fonte nem sequer possui esse campo (schema estrito).

### F.4 Criar o vínculo de uma nova jogadora

1. Confirmar que o time tem menos de 8 jogadoras ativas e que o apelido é único no time.
2. Ler o maior ID já usado na fonte e no mapa; escolher o próximo `p-XXX` livre. **NUNCA** reutilizar um ID, mesmo que a jogadora tenha saído.
3. Abrir o mapa privado e acrescentar a linha com `id`, `nickname`, `teamId`, `fullName` e `joinedAt`.
4. Acrescentar à fonte apenas os campos públicos permitidos: `id`, `nickname`, `position`, `joinedAt`, `leftAt`.
5. Rodar `npm run validate` e corrigir erros.
6. Revisar `git diff` e `git status`; confirmar que o mapa não aparece.
7. Fazer backup do mapa e registrar a data da última atualização.

Se o processo for interrompido entre os passos 3 e 4, a próxima pessoa **DEVE** conferir a consistência entre mapa e fonte antes de continuar. Não deixar ID no mapa sem linha correspondente na fonte nem o contrário.

### F.5 Atualizar, corrigir e remover

- **Correção de apelido:** alterar o apelido na fonte e no mapa; manter o mesmo `id`. Se o apelido antigo tiver sido público, registrar em `notes` para rastreabilidade interna.
- **Saída do elenco ativo:** preencher `leftAt` na fonte e no mapa; **NÃO** apagar a linha, o ID ou os eventos. O histórico público permanece.
- **Correção de nome civil:** alterar somente o mapa; a fonte não muda.
- **Troca de time antes de atuar:** atualizar `teamId` no mapa e na fonte; o ID continua o mesmo. Depois de atuar, a troca é bloqueada por `VAL-010` e não deve ser feita no mapa para “contornar” a regra.
- **Jogadora que nunca atuou e sai antes da estreia:** `leftAt` na fonte; linha preservada no mapa.
- **ID órfão:** se houver linha no mapa sem jogadora na fonte, investigar; não reutilizar o ID. Corrigir a fonte ou remover a linha somente após confirmar que não há evento histórico.

### F.6 Acesso e segregação

- O acesso **DEVE** ser nominal; contas compartilhadas são proibidas.
- **RECOMENDADO:** duas pessoas com acesso — uma responsável pela operação e uma suplente —, ambas com autenticação em dois fatores.
- O mapa **NÃO DEVE** ser enviado a quem só precisa editar resultados; a edição da fonte não exige o mapa.
- Ao final da edição ou na troca de responsável, revogar acessos e trocar a senha/chave se houver dúvida.
- O backup **DEVE** ser testado antes da primeira partida; um backup que nunca foi aberto não é backup.

### F.7 Retenção e descarte

- O mapa **DEVE** ser mantido enquanto a edição estiver ativa e durante o período de correções.
- **RECOMENDADO:** descartar o mapa 12 meses após a final, mantendo apenas os dados públicos agregados. Se a organização tiver política de retenção própria, ela prevalece e **DEVE** ser registrada no próprio mapa.
- O descarte **DEVE** ser seguro: apagar o arquivo, o backup e a lixeira; revogar compartilhamentos; registrar a data e o responsável.
- **NÃO** apagar o mapa antes de encerrar a possibilidade de correções e de atender a eventuais solicitações das pessoas envolvidas.

### F.8 Incidente de exposição

Se o mapa ou um nome completo aparecer em local público:

1. **Conter:** remover a cópia pública, revogar link compartilhado, revogar acesso e, se necessário, tornar o repositório privado temporariamente.
2. **Avaliar:** identificar quais IDs, nomes e times foram expostos e se havia combinação com apelido, foto ou contato.
3. **Comunicar:** informar a organização e as pessoas afetadas (ou responsáveis, no caso de menores), conforme a orientação aplicável; não abrir issue pública com dados pessoais.
4. **Preservar o histórico público:** **NÃO** renomear IDs, apagar eventos ou reescrever a fonte para “esconder” o ocorrido; isso quebra a rastreabilidade e não desfaz a exposição.
5. **Registrar:** anotar em local privado a data, a causa, o escopo, as ações e o responsável.
6. **Corrigir a causa:** revisar permissões, `.gitignore`, fluxo de commit e backups; se uma credencial vazou, trocá-la e recriptografar o mapa.
7. **Revisar:** atualizar este procedimento se a falha tiver sido processual.

### F.9 Defesas no repositório

O repositório **DEVE** manter `.gitignore` com, no mínimo:

```gitignore
# Mapa privado e dados pessoais — nunca commitar
private/
*.private.*
*.private
.env
.env.*

# Build e ferramentas
node_modules/
dist/
.astro/
playwright-report/
test-results/
```

- `git status --short` e `git diff --cached --name-only` **DEVEM** ser revisados antes de cada commit.
- A revisão **DEVE** confirmar no mapa que nenhuma pessoa aparece em dois times; o schema só detecta IDs repetidos, não a mesma pessoa com dois IDs.
- `git ls-files` **NÃO DEVE** retornar caminhos que casem com `private/`, `*.private.*` ou `.env*`.
- A revisão de PR **DEVE** conferir se o diff contém apenas campos públicos do schema; `fullName`, `photo`, `contact`, `shirtNumber`, `birthDate` e `jersey` são bloqueados pelo Zod estrito (`VAL-002`/`VAL-032`).
- O teste de build (`TST-088`) confirma que nenhum ID `p-XXX` aparece no HTML; isso não substitui a revisão do mapa, que é operacional.

### F.10 Checklist do mapeamento

Executar antes da primeira partida e a cada inclusão/remoção:

- [ ] O mapa está fora do repositório.
- [ ] Todo `p-XXX` da fonte tem linha no mapa; toda linha do mapa tem jogadora na fonte.
- [ ] Nenhuma pessoa aparece em dois times (conferir o mapa, não só os IDs).
- [ ] Nenhum ID foi reutilizado.
- [ ] Nenhum nome completo, contato ou data de nascimento aparece na fonte, em comentários, commits ou `dist/`.
- [ ] `git status` e `git ls-files` não mostram o mapa.
- [ ] O acesso é nominal e com dois fatores.
- [ ] O backup foi aberto e conferido.
- [ ] A data de descarte está registrada.
- [ ] A pessoa responsável sabe o que fazer em caso de exposição (F.8).

---

## Apêndice G — ADRs resumidos

ADRs registram decisões de arquitetura e o porquê. O status de cada uma é **Aceito** nesta SPEC v1.1; mudanças exigem nova ADR ou emenda na §15.

### G.1 ADR-001 — Astro estático com zero JS de cliente

- **Contexto:** site somente leitura, MPA, GitHub Pages, 4G, orçamento de 0 KB de JS e nenhuma interação que exija estado no navegador.
- **Decisão:** usar Astro com `output: 'static'`, sem framework de UI, sem `client:*` e sem `<script>`. Toda a lógica roda no build.
- **Consequências:** HTML pré-renderizado, deploy simples e cacheável; menu mobile com `<details>` nativo; qualquer interatividade futura exigirá nova decisão e novo orçamento.
- **Alternativas rejeitadas:** SPA/React (JS e hidratação desnecessários), Next export (runtime e complexidade), HTML escrito à mão (duplicação e validação frágil).
- **Rastreabilidade:** §4.1, §4.4, §11.9, §12.2; SPEC-003, SPEC-014.

### G.2 ADR-002 — YAML 1.2 único com Zod estrito

- **Contexto:** a organização precisa editar times, elencos, partidas e eventos sem admin; o formato deve ser legível, versionável e validável.
- **Decisão:** uma única fonte `data/2026/copa.yaml`, parseada com `yaml` 1.2 e validada por schema Zod `strict()`. Campo desconhecido é erro.
- **Consequências:** comentários e diffs legíveis; datas precisam de aspas; qualquer novo campo exige atualização do schema e desta SPEC; não há banco nem CMS.
- **Alternativas rejeitadas:** JSON (sem comentários), TOML (listas aninhadas ruins), CSV (relações e eventos), CMS/banco (fora do escopo e com backend).
- **Rastreabilidade:** §5, §8; SPEC-001, SPEC-002, VAL-002.

### G.3 ADR-003 — Node 26, npm, TypeScript 6 e lockfile

- **Contexto:** build precisa ser reproduzível no CI e em ambiente limpo; `@astrojs/check` ainda não aceita TypeScript 7.
- **Decisão:** Node 26 LTS, npm com `package-lock.json`, TypeScript 6.0.x em `strict`. `npm ci` no CI.
- **Consequências:** instalação determinística; `engines` restringe versões; subir para TypeScript 7 exige atualização do toolchain e nova ADR.
- **Alternativas rejeitadas:** TypeScript 7 (incompatível com o checker), pnpm/yarn (ferramenta extra sem ganho no escopo), Node 24 (fora do alvo).
- **Rastreabilidade:** §4.1, §12.1, §12.3; SPEC-004.

### G.4 ADR-004 — CSS puro com tokens do projeto

- **Contexto:** o design de referência é interno e não pode publicar nomes de marca/fontes proprietárias; o orçamento de CSS é apertado e a acessibilidade é requisito.
- **Decisão:** CSS puro, mobile-first, com `src/styles/tokens.css` contendo aliases semânticos e valores renomeados. Nenhum framework de UI ou utilitários.
- **Consequências:** controle total do CSS e do contraste; mais CSS manual; componentes não podem usar hexadecimais ou medidas avulsas; a referência permanece fora do build.
- **Alternativas rejeitadas:** Tailwind (configuração e classes extensas), CSS-in-JS (runtime), kit de UI (peso, marca e dependências).
- **Rastreabilidade:** §11.2, §11.3; SPEC-013, TST-090.

### G.5 ADR-005 — Domínio puro e derivado, sem placar materializado

- **Contexto:** placar, classificação, cartões, suspensões e estatísticas precisam ser determinísticos e nunca editados à mão.
- **Decisão:** funções puras recebem a competição validada e `now`; todo derivado é calculado no build. A fonte não tem campo de placar, pontos ou classificação.
- **Consequências:** fonte única de verdade; recálculo a cada build; funções precisam ser testadas com entradas congeladas e ordem embaralhada; o custo é irrelevante para 7 partidas.
- **Alternativas rejeitadas:** gravar classificação/placar no YAML (drift e edição manual), views de banco (backend), cache incremental (complexidade sem ganho).
- **Rastreabilidade:** §6, §7; SPEC-005, SPEC-006, VAL-026.

### G.6 ADR-006 — Validação agrega erros e bloqueia o build

- **Contexto:** erros de dados precisam ser corrigidos em um ciclo só, por uma pessoa que pode não ser desenvolvedora.
- **Decisão:** o loader agrega todos os erros de schema e semânticos em `DataValidationError`, com código, caminho, esperado, encontrado e mensagem em pt-BR. Erros bloqueiam; avisos não bloqueiam.
- **Consequências:** uma execução mostra o conjunto completo; o validador é maior; erro de sintaxe YAML para na primeira ocorrência; o resumo do Actions lista erros e avisos.
- **Alternativas rejeitadas:** fail-fast em tudo (vários ciclos), warnings como erro (bloqueia dados operacionais), lint separado (duplicaria regras).
- **Rastreabilidade:** §8; SPEC-002, VAL-001, VAL-002, §8.5.

### G.7 ADR-007 — Desempate por grupos, com confronto direto só entre dois

- **Contexto:** o PRD exige confronto direto apenas quando exatamente dois times estão empatados; com 3+ o critério não se aplica; se o grupo reduzir a dois, o confronto direto volta. Na v1.1, cada par tem dois jogos.
- **Decisão:** ordenar por grupos de pontos e aplicar os critérios em sequência, reaplicando o confronto direto quando o grupo chegar a exatamente dois. O confronto direto soma os pontos dos dois jogos; se empatar, usa o saldo agregado; só vale com ambos `finished`; W.O. conta 1x0. `drawOrder` só é exigido se o sorteio for alcançado.
- **Consequências:** algoritmo recursivo, não um único comparador; casos de 3+, de redução e de dois jogos precisam de testes dedicados; a ordem é determinística e a classificação é provisória enquanto houver jogo de grupo aberto.
- **Alternativas rejeitadas:** comparador único com h2h (errado para 3+), h2h entre todos os empatados (contraria o PRD), sorteio sempre (não determinístico).
- **Rastreabilidade:** §7.3; ALG-003, VAL-018, TST-003…TST-013.

### G.8 ADR-008 — `finalists` é snapshot validado

- **Contexto:** a final depende da classificação, mas uma correção posterior pode mudar os finalistas; o PRD exige alerta e confirmação.
- **Decisão:** `finalists.final` registra explicitamente `[1º, 2º]`; o build compara com a classificação calculada. Divergência bloqueia e lista antigos/novos. Atualizar o snapshot é a confirmação. Não há `thirdPlace`.
- **Consequências:** mudança de finalista nunca é silenciosa; uma correção após a final pode exigir atualização do snapshot e um `notice`; o build falha até a confirmação.
- **Alternativas rejeitadas:** derivar finalistas automaticamente (mudaria o passado), congelar os dados de grupo (impediria correções), confirmação só manual sem validação (erro silencioso).
- **Rastreabilidade:** §7.7; ALG-007, VAL-017, TST-058, TST-059.

### G.9 ADR-009 — W.O. é 1x0 administrativo

- **Contexto:** o PRD/briefing fixam W.O. em 1x0; não há placar digitado e não se deve inventar gol.
- **Decisão:** `walkover` registra vencedor, motivo e nota; o placar derivado é 1x0; não há gols/assistências; cartões são permitidos apenas nos motivos `insufficient_players`/`withdrawal`; `no_show` não tem eventos. W.O. conta para classificação e não para artilharia.
- **Consequências:** UI mostra o placar 1x0 para o vencedor na ordem mandante/visitante, com “(W.O.)” e motivo; saldo de gols é afetado; a fonte não contém gol fictício; o caso é validado por `VAL-024`/`VAL-029`.
- **Alternativas rejeitadas:** 3x0 (não previsto), registrar placar parcial (não confiável), não pontuar (quebraria a classificação).
- **Rastreabilidade:** §7.11; ALG-011, VAL-024, VAL-029, TST-061, TST-073.

### G.10 ADR-010 — Mapeamento de IDs privado, fora do repositório

- **Contexto:** privacidade exige apenas apelido/posição/time/estatísticas; o organizador ainda precisa saber quem é `p-XXX`.
- **Decisão:** IDs opacos e estáveis; o vínculo com o nome civil fica em mapa privado, fora do repositório e do build. O ID nunca é exibido nem reutilizado.
- **Consequências:** operação exige um procedimento à parte (Apêndice F); depuração de dados depende do mapa; o repositório público não contém dados pessoais.
- **Alternativas rejeitadas:** nome completo na fonte (viola privacidade), mapa criptografado dentro do repo (risco de vazamento e de histórico), UUID (mais longo, sem ganho).
- **Rastreabilidade:** §5.3, §11.10, Apêndice F; SPEC-007, TST-088.

### G.11 ADR-011 — Fonte do sistema e tema claro

- **Contexto:** `Airbnb Cereal` e `Circular` são proprietárias; fontes externas pesam e criam dependência de terceiros; o MVP não prevê tema escuro.
- **Decisão:** pilha de fontes do sistema, sem `@font-face` e sem download; apenas tema claro. Pesos 400–700 e escala fixa.
- **Consequências:** zero requisições de fonte e boa performance; a identidade visual depende de cor, espaço e tipografia; tema escuro exigirá novos tokens e spec.
- **Alternativas rejeitadas:** auto-hospedar Cereal/Circular (licença), Google Fonts (terceiro), fonte aberta extra (peso e licença), tema escuro no MVP (escopo).
- **Rastreabilidade:** §11.4, §11.6; SPEC-014, TST-086.

### G.12 ADR-012 — GitHub Pages de projeto, deploy por Actions

- **Contexto:** restrição de produto: site estático no GitHub Pages, sem backend; o repositório é um site de projeto em `/futsal-cup/`.
- **Decisão:** `site` + `base` no Astro; workflow oficial do Pages com artefato; deploy só em `main`; falha preserva o site anterior; `404.html` na raiz.
- **Consequências:** links internos usam `withBase`; não há preview de PR; cache do Pages pode exigir hard refresh; rollback é por commit.
- **Alternativas rejeitadas:** domínio próprio (operacional), Netlify/Vercel (novo fornecedor), deploy por branch `gh-pages` (menos controle e histórico).
- **Rastreabilidade:** §12; SPEC-004, TST-083.

### G.13 ADR-013 — Regulamento adiado e histórico futuro

- **Contexto:** o briefing marca FR-10 como ADIADO e FR-20 como FUTURO; não há conteúdo de regulamento nem de histórico nesta entrega.
- **Decisão:** não criar rota, link, item de navegação, página ou placeholder de Regulamento; não implementar histórico de alterações. O 404 cobre eventual URL antiga.
- **Consequências:** a navegação tem 6 links; `/regulamento/` não existe; PRD/AGENTS alinhados na v1.1; não há promessa pública de conteúdo futuro.
- **Alternativas rejeitadas:** página “em breve” (placeholder e escopo), link para PDF externo (não especificado), item oculto no rodapé (ainda é promessa).
- **Rastreabilidade:** §2.4, §10.1; SPEC-011, SPEC-012, TST-079.

### G.14 ADR-014 — Testes em camadas com matriz obrigatória

- **Contexto:** regras de competição têm alto risco de erro e a UI precisa de acessibilidade verificável; o tempo até a copa é curto.
- **Decisão:** funções puras testadas com Vitest; schema/validações com fixtures; `check-build` para `dist/`; Playwright + axe para E2E/acessibilidade; checklist manual para leitor de tela, zoom e navegadores. A matriz do Apêndice E é obrigatória.
- **Consequências:** feedback rápido na camada mais baixa; E2E mais lento e dependente de browser; sem meta de cobertura, mas todos os `TST-*` devem existir; bugs ganham teste na camada mais baixa possível.
- **Alternativas rejeitadas:** só E2E (lento e frágil), só unitários (não cobre layout/axe), snapshot visual (ruído e manutenção).
- **Rastreabilidade:** §13, Apêndice E; TST-001…TST-116.

### G.15 ADR-015 — Amistoso como metadado informativo

- **Contexto:** a organização realiza um amistoso do 3º colocado no dia da final, mas ele não faz parte da competição e não deve alterar classificação, estatísticas, suspensões ou pódio.
- **Decisão:** representar o amistoso como `friendly` (`date`, `startsAt`, `venue`, `note`), sem status, eventos, placar, W.O., shootout, times ou cartões. Exibir um card informativo na Fase final, antes da final, com o rótulo “Informativo — não é partida oficial”.
- **Consequências:** o schema é estrito e `VAL-033` valida data/horário/local/nota; o amistoso não entra em `Match`, `nextMatch`, `lastResults`, classificação, estatísticas, suspensões ou pódio; participantes podem ser descritos na nota por apelido ou descrição genérica, sem dados estruturados ou dados pessoais.
- **Alternativas rejeitadas:** modelar como partida `stage: friendly` (contaminaria algoritmos e estatísticas), não exibir (perde informação operacional), criar página própria (escopo e navegação desnecessários).
- **Rastreabilidade:** §5.4, §7.12, §10.8; SPEC-016, DM-016, VAL-033.

### G.16 ADR-016 — Formato de 3 times e 7 partidas

- **Contexto:** a decisão de produto de 12/11/2026 substituiu o formato de 4 times/8 partidas por 3 times, 6 jogos de grupo em turno e returno e final única.
- **Decisão:** fixar `ta`, `tb`, `tc`; 6 partidas `g1`…`g6`; final `1º x 2º`; 3º lugar pela classificação; sem semifinais, sem 3º x 4º e sem 4º lugar.
- **Consequências:** schema com 3 times e 7 partidas; 7 rotas de jogo e 3 de time; pódio de 3; calendário com dois jogos do mesmo time em 24/11, 26/11 e 01/12; PRD/AGENTS atualizados na v1.1.
- **Alternativas rejeitadas:** manter 4 times (contraria a decisão), turno único (menos jogos), semifinais (formato não previsto), partida de 3º lugar (contraria a decisão).
- **Rastreabilidade:** §2, §5.4, §6.3, §7.7, §10; SPEC-017, DM-001, DM-017.

### G.17 Rastreabilidade das ADRs

| ADR | Seções principais | Emendas relacionadas |
|---|---|---|
| ADR-001 | §4.1, §4.4, §11.9, §12.2 | — |
| ADR-002 | §5, §8 | 17 |
| ADR-003 | §4.1, §12.1, §12.3 | — |
| ADR-004 | §11.2, §11.3 | 15 |
| ADR-005 | §6, §7 | 1, 17 |
| ADR-006 | §8 | — |
| ADR-007 | §7.3 | 7, 13, 19 |
| ADR-008 | §7.7 | 8, 21 |
| ADR-009 | §7.11 | 6 |
| ADR-010 | §5.3, §11.10, Apêndice F | — |
| ADR-011 | §11.4, §11.6 | 15 |
| ADR-012 | §12 | — |
| ADR-013 | §2.4, §10.1 | 5 |
| ADR-014 | §13, Apêndice E | — |
| ADR-015 | §7.12, §10.8 | 20 |
| ADR-016 | §2, §5.4, §7.7, §10 | 18, 21 |

---

**Fim da SPEC.** Alterações nesta especificação exigem revisão da §15 e, quando afetarem produto, o alinhamento do PRD/AGENTS descrito na §15.2.
