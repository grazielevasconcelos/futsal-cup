# SPEC — Copa de Futsal Feminino Vila Mariana 2026

**Versão:** 2.3
**Data:** 24/11/2026
**Status:** Aceito  
**Fonte de produto:** `PRD.md` v2.2 + `AGENTS.md` v2.3
**Registro de decisões:** `docs/decisoes-v2.3.md` (impressão); `docs/decisoes-v2.2.md` (passe visual); `docs/decisoes-v2.1.md` (tema); `docs/decisoes-v2.0.md` (formato)

Esta é a especificação técnica normativa do site. Ela está subordinada ao `PRD.md` (produto) e ao `AGENTS.md` (restrições do repositório). Em caso de conflito, prevalecem o PRD e o AGENTS; as interpretações e emendas estão registradas na §15. O alinhamento do PRD/AGENTS com a v2.3 foi aplicado. `PLAN.md` e `TASKS.md` são documentos de execução subordinados a esta SPEC.

> **Mudança de formato na v2.0 (18/11/2026):** a edição 2026 passa a ter **8 partidas oficiais**: 6 classificatórias em turno e returno (`g1`…`g6`), **1 semifinal** (`semi`, 2º x 3º) e **1 final** (`final`, 1º x vencedora da semifinal). O 2º e o 1º colocados têm **vantagem do empate** na semifinal e na final, respectivamente. Empates encerram no tempo normal: **não há prorrogação, pênaltis ou shootout**. A **3ª colocada é a perdedora da semifinal**; não há disputa de 3º lugar nem 4º lugar. O **amistoso do 3º colocado foi removido** e os campos `friendly` e `shootout` são proibidos com mensagem de migração. As emendas estão na §15 e foram refletidas no PRD v2.0 e no AGENTS v2.0.
>
> **Mudança de tema na v2.1 (20/11/2026):** tema claro como padrão e tema escuro selecionável; um script inline mínimo lê/grava a preferência no `localStorage` (`futsal-cup-theme`). O script não usa rede, frameworks, hidratação, cookies ou dados pessoais. A exceção ao zero-JS fica limitada a esse comportamento.
>
> **Passe visual na v2.2 (22/11/2026):** refinamento de tipografia, hierarquia, cards clicáveis por inteiro, painel de placar, cabeçalho de time horizontal e destaque da campeã. Não altera regras da competição, dados, rotas ou JavaScript; não adiciona cores, fontes, fotos ou animações de transform.
>
> **Impressão na v2.3 (24/11/2026):** páginas preparadas para A4 retrato e PDF pelo navegador, com tema claro, tabelas sem corte e guia nativo no rodapé. Não adiciona botão de impressão ou JavaScript além do tema.

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
| SPEC-003 | JavaScript de cliente limitado ao script inline de tema: inicializar, alternar e persistir `light`/`dark` em `localStorage`; sem scripts externos, frameworks, hidratação ou chamadas de rede. | `npm run test:build` e E2E de estado/persistência. |
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
| SPEC-014 | Orçamento: script inline de tema ≤ 1 KB gzip por página, CSS < 30 KB gzip, sem fontes externas e sem imagens de pessoas. | `npm run test:build`. |
| SPEC-015 | Nenhum segredo, analytics, cookie de rastreamento ou requisição de terceiros. | Varredura e teste E2E de rede. |
| SPEC-016 | **OBSOLETO na v2.0:** o amistoso do 3º colocado foi removido. Não existe `friendly` nem partida não oficial; campos antigos geram erro de migração. | Schema estrito, validação `VAL-002` e testes de ausência na UI. |
| SPEC-017 | O formato de 2026 tem 3 times e **8 partidas oficiais**: 6 de grupo em turno e returno + 1 semifinal + 1 final. Não há partida de 3º lugar nem 4º lugar. | Schema, validação, rotas e testes. |
| SPEC-018 | Semifinal e final usam a **vantagem do empate** do mandante (2º e 1º colocados, respectivamente); não há prorrogação, pênaltis ou shootout. W.O. prevalece sobre a vantagem. | Testes de placar, vencedor, pódio e UI. |
| SPEC-019 | `semifinalists` e `finalists` são snapshots validados; a ordem define mando e vantagem. Divergência após a respectiva partida bloqueia o build com antigos/novos. | Schema, validação e testes de correção. |

---

## 2. Contexto, escopo e não escopo

### 2.1 Produto

Site público, estático e somente leitura da Copa de Futsal Feminino Vila Mariana 2026, com **3 times**, **6 partidas classificatórias em turno e returno**, **1 semifinal** e **1 final**. A semifinal é **2º x 3º**, com vantagem do empate para o 2º; a final é **1º x vencedora da semifinal**, com vantagem do empate para o 1º. A 3ª colocada é a perdedora da semifinal; não há disputa de 3º lugar nem 4º lugar. A organização edita a fonte YAML; o site apenas lê, valida e publica.

**Nome público (imutável na UI):** “Copa de Futsal Feminino Vila Mariana 2026”.

O nome da instituição **NÃO DEVE** aparecer em interface, título, metadados, Open Graph, favicon, `alt`, rodapé, mensagens ou URLs públicas. Documentação interna pode mencioná-lo.

### 2.2 No escopo do MVP

- **3 times** com nomes e abreviações vindos da fonte (`ta`, `tb`, `tc`).
- Elencos com apelido, posição opcional, `joinedAt`/`leftAt`.
- Calendário de **8 partidas oficiais**, agrupado por data: 6 de grupo + 1 semifinal + 1 final.
- Resultados derivados de gols, gols contra, assistências, cartões, W.O. e pênaltis do tempo normal.
- Classificação automática com desempate por grupos e **confronto direto em dois jogos**.
- Suspensões automáticas e bloqueio de eventos, considerando o caminho do time no chaveamento.
- Fase final com `semifinalists` e `finalists` validados, **semifinal**, **final** e **pódio de 3**: campeã, vice-campeã e 3ª colocada.
- Estatísticas individuais e coletivas das **8 partidas oficiais**, sem campanha de pênaltis.
- Tema claro padrão e tema escuro selecionável, com preferência local no navegador.
- Páginas Início, Jogos, Classificação, Times, Estatísticas, Fase final e 404.
- Validação bloqueante, avisos de build, CI e deploy no GitHub Pages.
- Acessibilidade AA, SEO básico e performance em 4G.

### 2.3 Fora do escopo do MVP

- Admin, login, backend, banco de dados, área de edição no site.
- Placar ao vivo, cronômetro, faltas, escalação, presença, substituições.
- Fotos de jogadoras, nomes completos, contatos, camisa, data de nascimento.
- **Disputa de 3º lugar e 4º lugar**: a 3ª colocada é a perdedora da semifinal; não há partida extra.
- **Prorrogação, disputa de pênaltis ou shootout**: empates encerram no tempo normal e são resolvidos pela vantagem do empate no chaveamento.
- **Amistoso ou outra partida não oficial**: não há `friendly`, card informativo ou evento recreativo na fonte.
- Histórico de edições anteriores, multi-competição, busca, filtros com JS.
- Notificações, chat, pagamentos, streaming, ingressos.
- W.O. automático, detecção de jogadoras em quadra, automação de desistência de time inteiro.
- Regulamento (FR-10, adiado) e analytics. Impressão/PDF pelo navegador está no escopo conforme a §11.11.
- Fontes proprietárias e imagens de pessoas. Logos dos times enviados pela organização são opcionais e servidos localmente. O selo oficial da competição é permitido somente no cabeçalho da página inicial, como asset local.
- Persistência em servidor da preferência de tema: a escolha vive somente no `localStorage` do navegador.
- `PLAN.md` e `TASKS.md` nesta etapa.

### 2.4 Adiado e futuro

| Item | Status | Efeito |
|---|---|---|
| FR-10 — página de Regulamento | **ADIADO** | Sem rota `/regulamento/`, sem link na nav, sem placeholder. Acesso retorna 404. |
| FR-20 — histórico de alterações | **FUTURO** | Sem página, sem API, sem UI. O histórico oficial é o Git. |
| FR-09 — página inicial | Desejável no MVP | Implementada com os estados da §10.3. |
| FR-19 — compartilhamento | Desejável no MVP | Título, descrição, canonical e Open Graph básico. |

### 2.5 Dados operacionais em aberto

Não há questão técnica bloqueante. Os itens abaixo são **dados** a preencher na fonte, com fallback explícito na UI:

| Dado | Campo | Fallback público |
|---|---|---|
| Nomes de exibição dos times B e C | `teams[].displayName` | Nome-base de `teams[].name` quando o campo for `null`. |
| Horários das partidas | `matches[].startsAt` | “Horário a definir”. |
| Local/quadra das partidas | `matches[].venue` | “Local a definir”. |
| Horário e local da semifinal | `semi.startsAt`, `semi.venue` | “Horário a definir” / “Local a definir”. |
| Horário e local da final | `final.startsAt`, `final.venue` | “Horário a definir” / “Local a definir”. |
| Critério de assistência duvidosa | decisão da organização ao lançar `assistPlayerId` | Sem impacto técnico; o dado é opcional. |
| Acomodação quando todos os times têm 9 | decisão da organização | O site bloqueia a 10ª ativa; a organização decide a saída/`leftAt`. |
| Habilitar Pages | configuração do repositório | Documentado na §12. |

Nenhum desses itens pode ser usado como desculpa para “a definir” silencioso no código. O campo existe, o fallback é explícito e a validação não depende do valor.

### 2.6 Premissas

- A edição é 2026; o build de produção lê somente `data/2026/copa.yaml`. O build de teste do E2E pode ler `tests/fixtures/valida.yaml` via `COPA_DATA_FILE` e grava em `dist-test/`.
- O formato é de **3 times e 8 partidas oficiais** (6 de grupo + semifinal + final).
- O repositório é público; a fonte não contém dados pessoais além do apelido.
- O mapeamento `p-XXX` → pessoa fica fora do repositório (Apêndice F).
- O site não controla quem está em quadra; W.O. é registrado manualmente.
- O GitHub Pages serve o projeto em `/futsal-cup/`.
- A mesma versão de Node/ICU e o mesmo `package-lock.json` são usados no build.
- Não há amistoso nem shootout; `semifinalists` e `finalists` são os únicos snapshots do chaveamento.

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
| **Partida** | Jogo oficial com `stage`, `date`, `status`, eventos e eventual W.O. |
| **Fase classificatória** | **6 partidas em turno e returno**; somente elas contam para a classificação. Cada time joga 4 vezes. |
| **Fase final** | **Semifinal** (2º x 3º) e **final** (1º x vencedora da semifinal); não há disputa de 3º lugar. |
| **Semifinal** | Partida única entre 2º e 3º; o 2º tem mando e vantagem do empate. Empate classifica o 2º. |
| **Final** | Partida única entre 1º e vencedora da semifinal; o 1º tem mando e vantagem do empate. Empate dá o título ao 1º. |
| **3ª colocada** | Perdedora da semifinal; **não** há partida de 3º lugar nem 4º lugar. |
| **Vantagem do empate** | Regra do chaveamento: em caso de empate no tempo normal, avança ou vence o mandante do snapshot (`semifinalists[0]` ou `finalists[0]`). Não altera o placar nem V/E/D. |
| **Evento** | `goal`, `ownGoal`, `yellow` ou `red`, aninhado na partida. |
| **Gol contra** | `ownGoal` da jogadora que marcou contra o próprio time; credita o adversário; não entra na artilharia dela. |
| **Assistência** | Jogadora do mesmo time da marcadora, diferente dela; opcional; proibida em pênalti e gol contra. |
| **Pênalti do tempo normal** | `goal` com `penalty: true`; conta no placar e na artilharia. |
| **W.O.** | Vitória administrativa por 3x0, registrada em `walkover`; sem gols/assistências; cartões permitidos conforme o motivo. Aplicado por partida; não há automação de desistência de time inteiro. |
| **Suspensão** | Efeito de um vermelho (direto ou 2º amarelo) na próxima partida real do time, considerando o chaveamento. Se o time joga duas vezes na mesma data, a próxima partida pode ser no mesmo dia. |
| **Pontos disciplinares** | Amarelo = 1; vermelho = 3; segundo amarelo = 3 no total; menor é melhor. |
| **Confronto direto** | Soma dos pontos dos **dois jogos** de grupo entre exatamente dois times empatados; se empatar, saldo agregado dos dois jogos. Só vale com os dois jogos `finished`; W.O. conta como 3x0. |
| **Sorteio** | Critério final, registrado em `drawOrder` (permutação dos 3 times); badge textual “Sorteio”. |
| **Semifinalistas** | Snapshot `semifinalists` com `[2º, 3º]`, validado contra a classificação. A ordem define mando e vantagem. |
| **Finalistas** | Snapshot `finalists` com `[1º, vencedora da semifinal]`, validado contra a classificação e o resultado da semifinal. A ordem define mando e vantagem. |
| **Pódio** | Campeã (vencedora da final), vice-campeã (perdedora da final) e 3ª colocada (perdedora da semifinal). **Não há 4º lugar.** |
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
[2] validação semântica (referências, elencos, calendário, W.O., snapshots do mata-mata)
        │  erros → build falha; avisos → job summary
        ▼
[3] domínio puro: placar, classificação, suspensões, estatísticas, pódio
        │
        ▼
[4] páginas Astro (getStaticPaths, layouts, componentes)
        │
        ▼
 dist/ (HTML + CSS + inicializador inline mínimo do tema)
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
│   │   ├── NavList.astro
│   │   ├── HomeShortcuts.astro
│   │   ├── SiteFooter.astro
│   │   ├── NoticeBanner.astro
│   │   ├── MatchCard.astro
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
- Nenhum `client:*` ou import de framework de UI.
- Única exceção de script: inicializador inline de tema em `BaseLayout.astro`, antes do CSS renderizado, para aplicar a preferência salva sem flash de tema. Não criar arquivos JS externos nem scripts para outros recursos.
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
const stage = z.enum(['group', 'semi', 'final']);
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
  name: z.string().min(1).max(60), // deve corresponder a Time A/B/C conforme o id
  displayName: z.string().trim().min(1).max(60).nullable().default(null),
  abbreviation: z.string().regex(/^[A-Z0-9]{1,5}$/, 'Abreviação inválida: use 1 a 5 caracteres A-Z ou 0-9.'),
  logo: z.string().regex(/^\/images\/times\/[a-z0-9-]+\.(?:webp|png|jpe?g)$/i).nullable().default(null),
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
  events: z.array(eventSchema),
}).strict();

const semiMatchSchema = z.object({
  id: z.literal('semi'),
  stage: z.literal('semi'),
  round: z.null(),
  date: dateOnly,
  startsAt: isoDateTime.nullable(),
  venue: z.string().min(1).max(120).nullable(),
  status,
  walkover: walkoverSchema.nullable(),
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
  events: z.array(eventSchema),
}).strict();

const matchSchema = z.discriminatedUnion('stage', [
  groupMatchSchema,
  semiMatchSchema,
  finalMatchSchema,
]);

/* ---------- envelope ---------- */

const semifinalistsSchema = z.tuple([teamId, teamId]);
const finalistsSchema = z.tuple([teamId, teamId]);

const noticeSchema = z.object({
  date: dateOnly,
  message: z.string().min(1).max(300),
}).strict();

export const competitionSchema = z.object({
  edition: z.literal(2026),
  timezone: z.literal('America/Sao_Paulo'),
  teams: z.array(teamSchema).length(3),
  matches: z.array(matchSchema).length(8),
  semifinalists: semifinalistsSchema.nullable(),
  finalists: finalistsSchema.nullable(),
  drawOrder: z.array(teamId).length(3).nullable(),
  notices: z.array(noticeSchema),
}).strict();
```

`name` é o nome-base fixo correspondente ao ID (`ta` = “Time A”, `tb` = “Time B”, `tc` = “Time C”); não deve ser usado para renomear o time. `displayName` e `logo` são opcionais e assumem `null` quando omitidos. A UI exibe `displayName ?? name`, sem abreviação. Um logo deve ser um asset local em `public/images/times/`; `npm run validate` e o build bloqueiam caminho externo ou arquivo inexistente.

**Decisões de schema:**

- `leftAt` é obrigatório e explícito (`null` quando ativa).
- `joinedAt`/`leftAt` são strings ISO, não objetos `Date` do YAML, para evitar ambiguidade de fuso.
- `venue: null` é permitido em partidas; a UI mostra “Local a definir”.
- `startsAt: null` é permitido em `scheduled`/`postponed`; `finished` exige valor.
- `walkover.note` e `event.minute` são opcionais; o loader normaliza ausência para `null`.
- `semifinalists`, `finalists` e `drawOrder` são obrigatórios no envelope, ainda que `null`.
- Partidas de mata-mata (`semi`, `final`) não têm `homeTeamId`/`awayTeamId`; usam os snapshots. `round` é `null`.
- Não existe `shootout` em partida alguma. Não existe `friendly` no envelope.
- Os campos antigos `friendly` e `shootout` são desconhecidos para o schema estrito e geram `VAL-002` com mensagem de migração explícita (“removido na v2.0”), nunca são ignorados.
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
- Máximo de 9 jogadoras ativas simultaneamente em qualquer instante. A 10ª ativa é bloqueada (`VAL-009`).
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
  se ativos > 9: erro VAL-009 no instante t
```

O empate `leftAt == joinedAt` é inválido (`VAL-008`), portanto a substituição no mesmo instante é representada por `leftAt` de uma e `joinedAt` da outra no mesmo timestamp; a ordem -1 antes de +1 mantém o máximo em 9.

### 5.7 Regras semânticas do envelope

Além do schema, a validação semântica **DEVE** garantir:

- `edition === 2026` e `timezone === "America/Sao_Paulo"`.
- Exatamente **3 times** com IDs `ta`, `tb`, `tc`.
- Exatamente **8 partidas** com IDs `g1`…`g6`, `semi`, `final`.
- `g1`…`g6` formam exatamente os seis confrontos do **turno e returno**:
  - `g1`: ta x tb; `g2`: tc x ta (rodada 1, 24/11/2026);
  - `g3`: tb x tc; `g4`: tb x ta (rodada 2, 26/11/2026);
  - `g5`: ta x tc; `g6`: tc x tb (rodada 3, 01/12/2026).
- Cada time joga exatamente **4 partidas de grupo**; não há time contra si mesmo nem par de times sem os dois jogos.
- `round` de `g1`/`g2` = 1; `g3`/`g4` = 2; `g5`/`g6` = 3. `semi` e `final` têm `round: null`.
- `semi` e `final` não têm `homeTeamId`/`awayTeamId`; usam `semifinalists` e `finalists`.
- `date` é uma data de calendário válida; se `startsAt` existe, sua data local em `America/Sao_Paulo` é igual a `date`.
- `finished` exige `startsAt`; `scheduled`/`postponed` não têm eventos nem W.O.
- A ordem cronológica de cada time respeita a ordem canônica (`g1` → `g2` → `g3` → `g4` → `g5` → `g6` → `semi` → `final`): a semifinal ocorre depois das 6 partidas de grupo e a final depois da semifinal. Um time pode ter duas partidas na mesma data, desde que os horários sejam distintos e respeitem essa ordem.
- O calendário oficial é: grupo em 24/11, 26/11 e 01/12; `semi` e `final` em 03/12, com horários distintos, a semifinal primeiro (`VAL-W02` avisa sobre desvio).
- `semifinalists` é `null` enquanto o grupo não termina; quando as 6 partidas terminam, é obrigatório e deve ser `[2º, 3º]` da classificação.
- `finalists` é `null` enquanto a semifinal não termina; quando a semifinal termina, é obrigatório e deve ser `[1º, vencedora da semifinal]`. A vencedora considera W.O. e, em empate no tempo normal, a vantagem do empate do 2º colocado (mandante da semifinal).
- A ordem de `semifinalists` e `finalists` define mando e vantagem; não há campo separado de vantagem.
- `drawOrder` é uma permutação dos 3 times ou `null`; é obrigatório apenas se um empate chegar ao sorteio na classificação final (6 partidas de grupo `finished`).
- `notices` tem datas válidas e mensagens não vazias.
- `friendly` e `shootout` não existem na v2.0; qualquer ocorrência é erro de schema com mensagem de migração.

---

## 6. Modelo de domínio

### 6.1 Entidades e tipos

```ts
export type TeamId = 'ta' | 'tb' | 'tc';
export type PlayerId = `p-${string}`;
export type MatchId = 'g1' | 'g2' | 'g3' | 'g4' | 'g5' | 'g6' | 'semi' | 'final';
export type Stage = 'group' | 'semi' | 'final';
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
  readonly displayName: string | null;
  readonly abbreviation: string;
  readonly logo: string | null;
  readonly players: readonly Player[];
}

export interface Walkover {
  readonly winnerTeamId: TeamId;
  readonly reason: WalkoverReason;
  readonly note: string | null;
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
  readonly events: readonly Event[];
}

export interface GroupMatch extends MatchBase {
  readonly stage: 'group';
  readonly round: 1 | 2 | 3;
  readonly homeTeamId: TeamId;
  readonly awayTeamId: TeamId;
}

export interface SemiFinalMatch extends MatchBase {
  readonly id: 'semi';
  readonly stage: 'semi';
  readonly round: null;
}

export interface FinalStageMatch extends MatchBase {
  readonly id: 'final';
  readonly stage: 'final';
  readonly round: null;
}

export type KnockoutMatch = SemiFinalMatch | FinalStageMatch;
export type Match = GroupMatch | KnockoutMatch;

// Partida com participantes resolvidos; o mata-mata usa os snapshots.
export type ResolvedMatch = Match & {
  readonly homeTeamId: TeamId;
  readonly awayTeamId: TeamId;
};

export interface PlayoffSnapshots {
  readonly semifinalists: readonly [TeamId, TeamId] | null;
  readonly finalists: readonly [TeamId, TeamId] | null;
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
  readonly semifinalists: readonly [TeamId, TeamId] | null;
  readonly finalists: readonly [TeamId, TeamId] | null;
  readonly drawOrder: readonly TeamId[] | null;
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
  readonly suspendedFor: MatchId | null; // null = sem próxima partida ou chaveamento ainda indefinido
  readonly pendingFinalists: boolean;    // true = próxima partida real depende de snapshots futuros
}

export interface Podium {
  readonly champion: TeamId | null;
  readonly runnerUp: TeamId | null;
  readonly third: TeamId | null;
}
```

### 6.3 Invariantes de domínio

| ID | Invariante |
|---|---|
| DM-001 | A competição tem edição 2026, fuso `America/Sao_Paulo`, **3 times** e **8 partidas oficiais** (6 de grupo + semifinal + final). |
| DM-002 | Cada time tem ID, nome-base (`Time A/B/C`), nome de exibição opcional, abreviação única, logo opcional e elenco. IDs e URLs `/times/{id}/` são estáveis; UI usa `displayName ?? name`. |
| DM-003 | Jogadora tem ID opaco e único na edição, apelido único no time, posição opcional, `joinedAt` e `leftAt`. |
| DM-004 | Partida tem `stage`, `date`, `status` e regras de `startsAt`; `finished` exige `startsAt`; `scheduled`/`postponed` não têm eventos/W.O. |
| DM-005 | Evento é `goal`, `ownGoal`, `yellow` ou `red`; assistência é opcional, do mesmo time e diferente da marcadora; pênalti não tem assistência; gol contra não tem assistência/pênalti. |
| DM-006 | Placar é sempre derivado dos eventos; não existe campo de placar. W.O. é a única exceção (3x0 administrativo). |
| DM-007 | W.O. é `walkover` em partida `finished`, com vencedor e motivo; não tem gols/assistências nem shootout; cartões permitidos conforme o motivo; é válido no grupo, na semifinal e na final. |
| DM-008 | Empate encerra a partida no tempo normal. Não há prorrogação, pênaltis ou shootout: na semifinal o empate classifica o 2º (`semifinalists[0]`); na final o empate dá o título ao 1º (`finalists[0]`). O W.O. prevalece sobre a vantagem. |
| DM-009 | `semifinalists` e `finalists` são snapshots oficiais (`[2º, 3º]` e `[1º, vencedora da semifinal]`), `null` enquanto a etapa anterior não termina, obrigatórios e iguais ao esperado quando ela termina. |
| DM-010 | `drawOrder` é uma permutação dos **3 times**; só é exigido quando um empate chega ao sorteio na classificação final. |
| DM-011 | `notices` é uma lista de avisos com data e mensagem; gera banner global. |
| DM-012 | O vínculo da jogadora é temporal e imutável após o primeiro evento; `leftAt` preserva histórico e não ocupa vaga. |
| DM-013 | Suspensão é derivada de vermelho direto ou segundo amarelo e vale para a próxima partida real do time no chaveamento, inclusive semifinal/final; sem acúmulo de amarelos. Se o time joga duas vezes na mesma data, a suspensão pode valer para a segunda partida do mesmo dia. |
| DM-014 | Privacidade: apenas apelido, posição, time e estatísticas são públicos; IDs de jogadora e datas de elenco não são renderizados. |
| DM-015 | Nenhuma classificação, estatística, suspensão ou pódio é armazenado como verdade editável. |
| DM-016 | **OBSOLETO na v2.0:** não existe amistoso, `friendly` ou `shootout`; campos antigos são proibidos e geram mensagem de migração. |
| DM-017 | O pódio tem campeã, vice-campeã e 3ª colocada; a 3ª é a **perdedora da semifinal**. **Não há 4º lugar** e não há partida de 3º lugar. |
| DM-018 | Semifinal e final resolvem seus participantes pelos snapshots; a ordem define mando e vantagem do empate. W.O. prevalece sobre a vantagem. |

### 6.4 Regras de derivação

- **Placar normal:** gols do time = gols de suas jogadoras + gols contra de jogadoras adversárias. Pênalti do tempo normal é `goal` com `penalty: true` e conta normalmente.
- **W.O.:** placar fixo 3x0 para `winnerTeamId`; ignora eventos para fins de placar; cartões não alteram o placar.
- **Scheduled/postponed:** sem placar; a UI mostra “—”, “A definir” ou “Adiada”.
- **Classificação:** apenas as 6 partidas de grupo `finished`; a semifinal, a final e seus cartões não alteram a classificação.
- **Semifinal:** participantes `[2º, 3º]`; o 2º é mandante e tem vantagem do empate. Empate no tempo normal classifica o 2º. W.O. define o vencedor administrativo.
- **Final:** participantes `[1º, vencedora da semifinal]`; o 1º é mandante e tem vantagem do empate. Empate no tempo normal dá o título ao 1º. W.O. define o campeão administrativo.
- **Suspensão:** um vermelho na partida N suspende na próxima partida real do time no chaveamento (N+1), que pode ser no mesmo dia, na semifinal ou na final. O 1º colocado não disputa a semifinal; o vermelho no último jogo de grupo é cumprido na final, quando ela existir. Sem próxima partida, sem efeito. Cartões da semifinal e da final contam para estatísticas e suspensão, mas não para a classificação.
- **Pódio:** campeã = vencedora da final (incluindo vantagem do empate e W.O.); vice = perdedora; 3ª = perdedora da semifinal. Não há 4º lugar e não há partida de 3º lugar.
- **Estatísticas coletivas:** agregam as 8 partidas oficiais; um empate na semifinal ou na final conta como empate em V/E/D; a vantagem do empate é informação separada e não altera o placar.
- **Remoções:** `friendly` e `shootout` não entram em nenhuma derivação porque não existem no schema v2.0.

---

## 7. Algoritmos

Todas as funções desta seção são puras: recebem `Competition` já validada e, quando necessário, `now: Date`. Não leem arquivos, não usam `Date.now()` internamente, não mutam a entrada e retornam novas estruturas. A ordem de arrays de entrada só é usada quando explicitamente indicado (desempate de eventos no mesmo minuto).

### 7.1 ALG-001 — Derivação de placar

Os algoritmos que precisam dos participantes de uma partida usam `resolveMatchTeams`; quando a partida já foi resolvida, recebem `ResolvedMatch`. Para partidas de grupo, os participantes já estão na fonte; para a **semifinal** e a **final**, são resolvidos a partir de `semifinalists` e `finalists`:

```text
resolveMatchTeams(match, snapshots):
  se match.stage == 'group':
    retornar { homeTeamId: match.homeTeamId, awayTeamId: match.awayTeamId }
  se match.stage == 'semi':
    se snapshots.semifinalists == null:
      lançar erro de invariante (VAL-017: semifinal sem semifinalistas)
    retornar { homeTeamId: snapshot[0], awayTeamId: snapshot[1] }
  se snapshots.finalists == null:
    lançar erro de invariante (VAL-017: final sem finalistas)
  retornar { homeTeamId: finalists[0], awayTeamId: finalists[1] }

toResolvedMatch(match, snapshots):
  times = resolveMatchTeams(match, snapshots)
  retornar { ...match, ...times }
```

```text
deriveScore(match, snapshots):
  se match.status != finished: retornar null
  times = resolveMatchTeams(match, snapshots)
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
- Não existe `shootout`; empate permanece empate no placar.
- W.O. ignora eventos para placar; `walkover` é a única fonte do 3x0.
- `teamOf` é resolvido pelo elenco do time na partida; a validação já garantiu que a jogadora pertence a um dos dois times.
- `resolveMatchTeams` lança erro de invariante com snapshot `null`; a UI **DEVE** checar o snapshot antes de chamar funções de placar para a semifinal/final e usar o fallback “Confrontos a definir” (ou “Vencedora da semifinal” quando o 1º já é conhecido).
- `winnerOf(match, snapshots)`:
  - partida não `finished` → `null`;
  - W.O. → `winnerTeamId`;
  - `group` com empate → `null`;
  - `semi`/`final` com empate → mandante do snapshot (`semifinalists[0]`/`finalists[0]`), por vantagem do empate;
  - caso contrário, o time com mais gols.

### 7.2 ALG-002 — Linhas da classificação

```text
buildStandingRow(team, groupMatches):
  points=0; played=0; wins=0; draws=0; losses=0; gf=0; ga=0
  yellow=0; red=0; disciplinary=0

  para cada match em groupMatches:
    se team != match.homeTeamId && team != match.awayTeamId: continuar
    se match.status != finished: continuar
    played += 1
    score = deriveScore(match, null)   // grupo não depende de snapshots
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
        score = deriveScore(m, null)   // grupo não depende de snapshots; W.O. vira 3x0
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
- W.O. conta como 3x0 no confronto direto, tanto para pontos quanto para o saldo agregado.
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
Jogo 1: A 3x0 B (W.O.). Jogo 2: B 2x0 A.
Pontos do confronto: A 3, B 3. Gols agregados: A 3, B 2 → A fica à frente.
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
    pontos = 3                  // valor total do segundo amarelo convertido em vermelho
  senão se vermelhosDiretos >= 1:
    pontos = 3 + amarelos       // 1 amarelo + 1 vermelho direto = 4
  senão:
    pontos = amarelos

  retornar { yellow: amarelos, red: redTotal, redDerived: redDerivado, points: pontos }
```

- `red` é o número exibido na coluna “Vermelhos”; inclui o segundo amarelo. `redDerived` é apenas o vermelho derivado do segundo amarelo.
- `points` é o valor usado no desempate e na tabela; **não** é `yellow*1 + red*3`.
- Um segundo amarelo **NÃO** deve ser registrado como evento `red` explícito. A UI mostra “2º amarelo → vermelho” no segundo amarelo.
- Um vermelho direto com um amarelo no mesmo jogo é permitido e vale 3 pontos.
- Não há suspensão nem bloqueio por acúmulo de amarelos entre partidas; `VAL-022` olha apenas a mesma partida.
- Cartões de W.O. contam para estatísticas/suspensão, exceto `no_show`, que não tem eventos.
- Cartões da semifinal e da final contam para estatísticas/suspensão, mas não para a classificação. Não há partida de 3º lugar.

### 7.5 ALG-005 — Suspensões

```text
buildSuspensions(competition):
  resultado = []
  snapshots = { semifinalists: competition.semifinalists,
                finalists: competition.finalists }
  para cada time:
    partidas = matchesDoTime(time, snapshots).sort(byCanonicalOrder)
    para cada partida em partidas:
      reds = redCardsForTeamInMatch(time, partida)
      para cada red em reds:
        proxima = próxima partida real do time após partida na lista
        pendente = proxima == null && partida.stage == 'group' &&
          competition.finalists == null
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
- `matchesDoTime(time, snapshots)` inclui sempre as 4 partidas de grupo do time, a `semi` quando `snapshots.semifinalists` existe e o time é participante, e a `final` quando `snapshots.finalists` existe e o time é participante. Assim, a função não lança erro antes de o chaveamento estar definido.
- “Próxima partida real” é a próxima na ordem canônica: `g1` → `g2` → `g3` → `g4` → `g5` → `g6` → `semi` → `final`, considerando apenas partidas em que o time participa de fato:
  - o 1º colocado não participa da `semi`; depois do grupo, sua próxima partida é a `final`;
  - o 2º e o 3º participam da `semi`; um vermelho na última partida de grupo é cumprido na semifinal;
  - um vermelho na semifinal é cumprido na final apenas se o time avançar; se for eliminado, não há partida seguinte;
  - um vermelho na final não tem partida seguinte e não tem efeito.
- Como cada time joga duas vezes em algumas datas, a ordem canônica dentro da mesma data é a ordem dos IDs. A validação impede ordem cronológica incompatível (`VAL-015`).
- Se o time ainda não tem próxima partida definida e `finalists` é `null` após a última partida de grupo, `suspendedFor = null` e `pendingFinalists = true`: a suspensão pode valer para a semifinal ou para a final, mas o chaveamento ainda não está fechado. Quando os snapshots forem preenchidos, o build recalcula.
- Se o time não tem próxima partida por ter sido eliminado na semifinal ou por ter disputado a final, `suspendedFor = null` e `pendingFinalists = false`; a suspensão não tem efeito.
- Se a próxima partida é `postponed` ou `scheduled`, a suspensão permanece pendente para ela.
- Se a próxima partida é `finished`, a suspensão foi cumprida e não se estende à seguinte.
- A jogadora suspensa **NÃO DEVE** ter nenhum evento na partida `suspendedFor` (`VAL-023`).
- Enquanto `pendingFinalists = true`, não há partida definida para bloquear; quando os snapshots forem preenchidos, o build recalcula e aplica `VAL-023` se o time estiver na partida.
- Não há eventos de shootout; não há cartões de disputa de pênaltis.

Status para a página do time:

```text
suspensionStatus(player):
  reds = todas as suspensões da jogadora
  pendente = reds.find(s => s.suspendedFor != null &&
    match(s.suspendedFor).status != finished)
  se pendente: “Suspensa na partida {adversário} de {data}”
  senão se reds.some(s => s.pendingFinalists):
    “Suspensão pendente — fase final a definir”
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
  snapshots = { semifinalists: competition.semifinalists,
                finalists: competition.finalists }

  para cada partida oficial finished (stage 'group', 'semi' ou 'final'):
    times = resolveMatchTeams(partida, snapshots)
    score = deriveScore(partida, snapshots)

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

- `buildTeamStats` usa as **8 partidas oficiais** (`group` + `semi` + `final`); não há amistoso.
- O placar do W.O. já é 3x0 em `deriveScore`; ele conta como vitória/derrota e entra em GP/GC/SG. Cartões de W.O. contam, exceto `no_show` (que não tem eventos).
- `timeDaJogadora` é resolvido pelo **elenco** (`team.players`), não pelo evento: eventos de cartão não carregam `teamId`. A busca considera apenas os dois participantes da partida (`times.homeTeamId` e `times.awayTeamId`); `VAL-006` garante que a jogadora não está em dois times e `VAL-019` garante que todo evento referencia jogadora de um dos dois elencos, então a resolução retorna exatamente um time; zero times é erro de invariante.
- `elencoDaPartida(times)` é a união dos elencos dos dois participantes, incluindo jogadoras com `leftAt != null`: cartões registrados enquanto a jogadora era elegível continuam contando para o time, mesmo que ela tenha saído depois.
- Uma semifinal ou final empatada conta como **empate** para os dois times em V/E/D. A vantagem do empate é uma informação separada: ela define quem avança ou é campeã, mas não transforma o empate em vitória.
- Não existem `shootoutWins`, `shootoutLosses` nem colunas de pênaltis.
- A classificação continua usando apenas as 6 partidas de grupo (`buildStandings`); `buildTeamStats` é para a página do time e não altera posições.
- Jogadoras sem eventos aparecem no elenco com zeros, mas não nas tabelas de líderes.
- Jogadoras com `leftAt != null` e eventos continuam nas estatísticas, com marca textual “fora do elenco ativo”.
- Gols contra não entram em `goals`; entram em `ownGoals`.
- Pênalti do tempo normal entra em `goals`; não há gols de shootout.
- Assistência em pênalti é inválida; assistência em gol contra é inválida.
- Cartões da semifinal e da final entram nas estatísticas; não há cartões de 3º lugar.
- Cartões de W.O. entram, exceto `no_show`.

**Ordenações normativas:**

| Tabela | Ordem |
|---|---|
| Artilharia | `goals` desc, `assists` desc, `compareText(nickname)` asc, `compareText(displayName ?? name)` asc, `playerId` asc. Somente `goals ≥ 1`. |
| Assistências | `assists` desc, `goals` desc, `compareText(nickname)` asc, `compareText(displayName ?? name)` asc, `playerId` asc. Somente `assists ≥ 1`. |
| Cartões por jogadora | `disciplinaryPoints` desc, `red` desc, `yellow` desc, `compareText(nickname)` asc, `compareText(displayName ?? name)` asc, `playerId` asc. Somente quem tem ao menos um cartão. |
| Cartões por time | `disciplinaryPoints` desc, `red` desc, `yellow` desc, `compareText(displayName ?? name)` asc, `teamId` asc. Todos os 3 times. |
| Gols contra | `ownGoals` desc, `compareText(nickname)` asc, `compareText(displayName ?? name)` asc, `playerId` asc. Somente `ownGoals ≥ 1`. |

### 7.7 ALG-007 — Snapshots do mata-mata, pódio e correções

```text
groupComplete = todas as 6 partidas de grupo estão finished
se groupComplete:
  ranking = rankTeams(competition)
  esperadoSemifinal = [ranking[1].teamId, ranking[2].teamId]
  se semifinalists == null: erro VAL-017
  se semifinalists != esperadoSemifinal: erro VAL-017 com antigos e novos
senão:
  se semifinalists != null: erro VAL-017

semiComplete = match('semi').status == finished
se semiComplete:
  se semifinalists == null: erro VAL-017 (sem cascata)
  vencedorSemi = winnerOf(semi, snapshots)
  esperadoFinal = [ranking[0].teamId, vencedorSemi]
  se finalists == null: erro VAL-017
  se finalists != esperadoFinal: erro VAL-017 com antigos e novos
senão:
  se finalists != null: erro VAL-017
```

- Se `rankTeams` lançar `DrawRequiredError` durante a validação dos snapshots, o erro reportado é `VAL-018`; `VAL-017` não é emitido em cascata.
- `semifinalists[0]` é o mandante da semifinal (2º colocado) e tem vantagem do empate; `semifinalists[1]` é o visitante (3º).
- `finalists[0]` é o mandante da final (1º colocado) e tem vantagem do empate; `finalists[1]` é a vencedora da semifinal.
- A partida `semi` não tem `homeTeamId`/`awayTeamId`; usa `semifinalists`. A `final` usa `finalists`. Não existe partida de 3º lugar.
- Se uma correção após a semifinal mudar os semifinalistas esperados (por exemplo, correção de resultado de grupo), o build **DEVE** falhar listando os semifinalistas antigos e os novos. Atualizar `semifinalists` é a confirmação explícita; a organização também deve reconciliar eventos/resultado da semifinal e explicar a correção em `notices`.
- Se uma correção após a final mudar os finalistas, o build **DEVE** falhar listando os finalistas antigos e os novos. Atualizar `finalists` é a confirmação explícita; a correção também deve ser explicada em `notices`.
- `notices` é o canal público para explicar a correção; o aviso de build é o canal operacional. Nenhum dos dois é obrigatório para o build passar, mas ambos são recomendados.
- Pódio:

```text
buildPodium(competition):
  se !groupComplete:
    champion=null; runnerUp=null; third=null
  senão:
    ranking = rankTeams(competition)
    se semi.status != finished:
      champion=null; runnerUp=null; third=null
    senão:
      snapshots = { semifinalists, finalists }
      vencedorSemi = winnerOf(semi, snapshots)
      third = (vencedorSemi == semifinalists[0]) ? semifinalists[1] : semifinalists[0]
      se final.status != finished:
        champion=null; runnerUp=null
      senão:
        champion = winnerOf(final, snapshots)
        runnerUp = (champion == finalists[0]) ? finalists[1] : finalists[0]
```

- `winnerOf(match, snapshots)` usa W.O. e placar normal, nesta ordem. Em empate no tempo normal de `semi`/`final`, retorna o mandante do snapshot por vantagem do empate. Em partida de grupo empatada, retorna `null`.
- `third` é a **perdedora da semifinal**, não a 3ª da classificação. Não existe `fourth`.
- O pódio completo (campeã, vice-campeã e 3ª colocada) só é exibido quando a `final` está `finished`.
- A final encerrada não exige outra partida: não há disputa de 3º lugar (`VAL-016`).
- W.O. na semifinal ou na final prevalece sobre a vantagem do empate: o vencedor administrativo avança ou é campeão.

### 7.8 ALG-008 — Próximo jogo, resultados e estados da Início

```text
homeState(competition, now):
  groupMatches = matches.filter(stage == group)
  groupComplete = groupMatches.every(m => m.status == finished)
  semi = match('semi')
  final = match('final')

  se final.status == finished:
    retornar 'afterFinal'
  se semi.status == finished:
    retornar 'semiComplete'
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
- Se o grupo terminou e a semifinal ainda não encerrou, o próximo jogo é a semifinal; a final já pode aparecer como card informativo com o 1º colocado e “Vencedora da semifinal”. Não há amistoso.
- Se a semifinal terminou e a final ainda não encerrou, o próximo jogo é a final.
- Se a final terminou, a Início mostra campeã/pódio (estado 5).
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
    VAL-014 status × eventos/W.O.
    VAL-015 ordem canônica
    VAL-016 progressão do mata-mata
    VAL-017 snapshots do mata-mata
    VAL-018 sorteio
    VAL-019 elenco da partida
    VAL-020 elegibilidade
    VAL-021 assistências
    VAL-022 cartões
    VAL-023 suspensão
    VAL-024 W.O.
    VAL-026 placar materializado
    VAL-027 times do mata-mata
    VAL-028 referências
    VAL-029 eventos de W.O.
    VAL-031 notices
    VAL-032 privacidade
    VAL-W01..W04 avisos
  retornar { erros, avisos }
```

- A ordem é a da tabela, mas a agregação é independente; um erro não impede os demais, exceto quando o schema falha.
- Erros que dependem de referências inválidas são omitidos para evitar cascata; o erro de referência já é reportado.
- O exit code é `1` se houver erro; `0` se houver apenas avisos.
- O resumo em Markdown é gerado mesmo em falha e escrito em `GITHUB_STEP_SUMMARY` quando disponível.

### 7.11 ALG-011 — Placar e resultado do mata-mata: apresentação

```text
formatScore(match, snapshots):
  se match.stage == 'semi' && snapshots.semifinalists == null:
    retornar “Confrontos a definir”
  se match.stage == 'final' && snapshots.finalists == null:
    retornar “Confrontos a definir”
  se match.status == postponed: retornar “Adiada”
  se match.status == scheduled: retornar “A definir”
  score = deriveScore(match, snapshots)
  se match.walkover != null:
    retornar “{score.home} x {score.away} (W.O.)”
  retornar “{score.home} x {score.away}”

formatScoreAccessible(match, snapshots, homeName, awayName):
  se snapshot necessário for null:
    retornar “Confrontos a definir; a fase final depende da etapa anterior.”
  se match.status == postponed:
    retornar “Partida adiada.”
  se match.status == scheduled:
    retornar “Partida agendada; placar a definir.”
  score = deriveScore(match, snapshots)
  times = resolveMatchTeams(match, snapshots)
  vencedor = winnerOf(match, snapshots)
  nomeVencedor = vencedor == times.homeTeamId ? homeName : awayName
  se match.walkover != null:
    motivo = rótulo(match.walkover.reason)   // “Não compareceu”, “Menos de 3 jogadoras em quadra” ou “Desistência”
    retornar “{homeName} {score.home} a {score.away} {awayName} por W.O. — {motivo}.”
  se match.stage != 'group' && score.home == score.away:
    se match.stage == 'semi':
      retornar “{homeName} {score.home} a {score.away} {awayName} no tempo normal; {nomeVencedor} avança pela vantagem do empate.”
    senão:
      retornar “{homeName} {score.home} a {score.away} {awayName} no tempo normal; {nomeVencedor} conquista o título pela vantagem do empate.”
  retornar “{homeName} {score.home} a {score.away} {awayName}.”
```

- O placar do mata-mata usa a ordem mandante/visitante do snapshot (`semifinalists[0]/[1]` ou `finalists[0]/[1]`).
- O W.O. é exibido na ordem mandante/visitante: se o visitante venceu, o placar é `0 x 3 (W.O.)`, nunca um `1 x 0` fixo. O W.O. substitui a vantagem do empate.
- Em empate no tempo normal da semifinal/final, o placar continua `N x N`; a definição pela vantagem é um texto separado e sempre visível. Não use cor como única indicação.
- W.O. mostra o motivo: “Não compareceu”, “Menos de 3 jogadoras em quadra” ou “Desistência”.
- Gols ocorridos antes de uma interrupção de W.O. não são registrados no MVP; a UI não inventa gols. A limitação fica na §16.
- Não há shootout, pênaltis ou texto de cobranças alternadas.

### 7.12 ALG-012 — OBSOLETO

O algoritmo do cartão informativo do amistoso foi removido na v2.0. O ID fica reservado e **NÃO DEVE** ser reutilizado. Não há `FriendlyCard`, `buildFriendlyCard` ou card informativo de partida não oficial.

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
| VAL-002 | Schema Zod falha: campo desconhecido, tipo errado, campo obrigatório ausente, enum inválido, string vazia/curta/longa, formato inválido; inclui logo externo/inválido ou caminho local inexistente. Inclui campos removidos na v2.0 (`friendly`, `shootout`), com mensagem de migração explícita. | Schema §5.4 e asset local em `public/images/times/`. | Issue com caminho e valor. | §5.4 |
| VAL-003 | `edition != 2026` ou `timezone != "America/Sao_Paulo"`. | `2026` / `America/Sao_Paulo`. | Valor encontrado. | DM-001 |
| VAL-004 | Quantidade de times ≠ 3, IDs diferentes de `ta`…`tc` ou IDs duplicados. | Exatamente 3 times `ta`,`tb`,`tc`. | Lista encontrada. | DM-001/002 |
| VAL-005 | Abreviação de time duplicada (comparação case-insensitive). | Abreviações únicas. | Duplicata e times. | DM-002 |
| VAL-006 | ID de jogadora duplicado no mesmo time ou em times diferentes. | ID único na edição. | ID e times. | DM-003 |
| VAL-007 | Apelido duplicado dentro do time após `normalizeText`/`uniqueKey`; apelido vazio após normalização. | Único no time, não vazio. | Apelido e time. | DM-003 |
| VAL-008 | `leftAt != null` e `leftAt <= joinedAt`. | `leftAt > joinedAt`. | Datas encontradas. | DM-012 |
| VAL-009 | Mais de 9 jogadoras ativas simultaneamente em qualquer instante (inclui a 10ª ativa). | Máximo 9. | Instante e contagem. | DM-012 |
| VAL-010 | Jogadora com evento em partida de time diferente do time atual (transferência após atuar). | Vínculo imutável após o primeiro evento. | Jogadora, time atual, partida. | DM-012 |
| VAL-011 | Conjunto de partidas ≠ 8 IDs exatos; ID duplicado; `stage`/`round` incompatível com o ID; `semi` ou `final` ausente/duplicada. | `g1`…`g6`, `semi`, `final`. | Lista encontrada. | DM-004 |
| VAL-012 | Confrontos de grupo diferentes dos seis do turno e returno; time repetido; time contra si mesmo; par sem os dois jogos. | `g1` ta×tb, `g2` tc×ta, `g3` tb×tc, `g4` tb×ta, `g5` ta×tc, `g6` tc×tb. | Confronto encontrado. | DM-004 |
| VAL-013 | Data de calendário inválida; `startsAt` inválido; data local de `startsAt` em `America/Sao_Paulo` diferente de `date`; `notice.date` inválida. | Data real e coerente com o fuso. | Valores encontrados. | DM-004/011 |
| VAL-014 | `finished` sem `startsAt`; `scheduled`/`postponed` com eventos ou `walkover`. | `finished` com `startsAt`; demais sem eventos/W.O. | Status e campos. | DM-004 |
| VAL-015 | Time com duas partidas no mesmo `startsAt`; ordem canônica incompatível com `startsAt`, inclusive `g6` → `semi` → `final`. | Ordem canônica e cronologia coerentes, inclusive nas datas com dois jogos do mesmo time. | Partidas e horários. | DM-004 |
| VAL-016 | Semifinal encerrada antes de as 6 partidas de grupo terminarem; final encerrada antes de a semifinal terminar; partida de mata-mata com eventos/placar sem o snapshot necessário; semifinal/final ausente na progressão. | Grupo completo antes da semifinal; semifinal encerrada antes da final; snapshots definidos antes dos eventos. | Status e IDs. | DM-009/DM-018 |
| VAL-017 | `semifinalists` nulo com grupo completo; não nulo com grupo incompleto; divergente de `[2º, 3º]`; `finalists` nulo com semifinal completa; não nulo com semifinal incompleta; divergente de `[1º, vencedora da semifinal]`; divergência após a semifinal/final. | Snapshots `[2º, 3º]` e `[1º, vencedora]` válidos, iguais ao esperado. | Antigos e novos snapshots. | DM-009/SPEC-019 |
| VAL-018 | `drawOrder` inválido (não é permutação dos 3) ou ausente quando um empate chega ao sorteio na classificação final (6 partidas de grupo `finished`). | Permutação dos 3 ou `null`; presente quando necessário. | Valor e grupo. | DM-010 |
| VAL-019 | Evento referencia jogadora fora do elenco dos dois times da partida. | Jogadora do elenco do time na partida. | Jogadora, times, partida. | DM-005 |
| VAL-020 | Jogadora inelegível no início da partida: `joinedAt >= startsAt` ou (`leftAt != null` e `leftAt <= startsAt`). | `joinedAt < startsAt < leftAt` (ou `leftAt` nulo). | Datas e partida. | DM-012 |
| VAL-021 | Assistência inválida: igual à marcadora; de outro time; em gol de pênalti; em gol contra; `ownGoal` com assistência/pênalti. | Assistência opcional, do mesmo time, diferente, só em `goal` normal. | Marcadora, assistente, tipo. | DM-005 |
| VAL-022 | Terceiro amarelo **no mesmo jogo**; `red` explícito com dois amarelos; mais de um `red` explícito; `red` em evento de `ownGoal` (schema). | No máximo 2 amarelos e 1 vermelho direto por jogadora/partida; 2º amarelo é derivado. | Jogadora, partida, cartões. | DM-005 |
| VAL-023 | Evento de jogadora suspensa na partida em que ela cumpre suspensão. | Nenhum evento da suspensa na partida `suspendedFor`. | Jogadora, partida, motivo. | DM-013 |
| VAL-024 | W.O. inválido: partida não `finished`; vencedor fora dos participantes; motivo inválido; `winnerTeamId` ausente; W.O. na semifinal/final sem snapshot. | `walkover` em partida `finished`, vencedor participante, motivo válido; permitido no grupo, na semifinal e na final. | Campos encontrados. | DM-007 |
| VAL-026 | Placar materializado: qualquer campo `score`, `homeScore`, `awayScore`, `result`, `points`, `standings` ou similar. | Placar/classificação sempre derivados. | Campo e caminho. | DM-006/015 |
| VAL-027 | Partida `semi` ou `final` com `homeTeamId`/`awayTeamId` ou `round` diferente de `null`. | Times derivados de `semifinalists`/`finalists`; `round: null`. | Campos encontrados. | DM-009/DM-018 |
| VAL-028 | Referência inexistente a time, jogadora, partida ou notice (além do schema). | IDs existentes na edição. | Referência e origem. | §5.3 |
| VAL-029 | `no_show` com qualquer evento; `insufficient_players`/`withdrawal` com `goal`/`ownGoal`; W.O. com assistência. | `no_show` sem eventos; demais só cartões; W.O. sem gols/assistências. | Eventos encontrados. | DM-007 |
| VAL-031 | `notice` com data inválida ou mensagem vazia/longa. | Data real e mensagem 1..300. | Valores encontrados. | DM-011 |
| VAL-032 | Campo de privacidade proibido: `fullName`, `photo`, `contact`, `shirtNumber`, `jersey`, `birthDate`, `phone`, `email`, `address`, `instagram`. | Nenhum campo pessoal além de `nickname`, `position`, `joinedAt`, `leftAt`. | Campo e caminho. | DM-014 |

**Sobre “placar incompatível”:** como não existe placar armazenado, não há como divergir. A regra é garantida por `VAL-026` (campo de placar é proibido) e pelos testes de derivação (`TST-028`…`TST-037`). Se um campo de placar for adicionado no futuro, a validação de igualdade com `deriveScore` passa a ser obrigatória.

### 8.3 Avisos (não bloqueiam)

| ID | Condição | Mensagem | Efeito |
|---|---|---|---|
| VAL-W01 | Time com menos de 7 jogadoras ativas. | “Time {nome} tem {n} jogadoras ativas; o alvo é 7 a 9. A publicação não é bloqueada.” | Job summary; badge público só se `<5` (regra de UI, não de validação). |
| VAL-W02 | Partida `scheduled`/`finished` fora da data original do calendário (24/11, 26/11, 01/12, 03/12). | “Partida {id} está em {data}, fora do calendário original. Confirme o adiamento.” | Job summary. `postponed` é isenta. |
| VAL-W03 | Nome público duplicado após normalização (`displayName ?? name`). | “Os times {a} e {b} têm o mesmo nome público; confirme o nome de exibição.” | Job summary. |
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

- `VAL-002`: “Campo `friendly` removido na v2.0: não existe amistoso. Remova o bloco e use apenas as 8 partidas oficiais (g1…g6, semi e final).”
- `VAL-002`: “Campo `shootout` removido na v2.0: empates não têm pênaltis nem shootout. Remova o campo; a definição usa a vantagem do empate.”
- `VAL-009`: “Elenco com 10 jogadoras ativas em 2026-11-24T19:00:00-03:00; máximo permitido: 9. A 10ª jogadora deve sair com `leftAt` ou ser registrada em outro time.”
- `VAL-017`: “Semifinalistas divergentes da classificação. Antigos: [ta, tb]. Novos: [ta, tc]. Atualize `semifinalists` para confirmar a correção.”
- `VAL-017`: “Finalistas divergentes do esperado. Antigos: [tc, ta]. Novos: [tc, tb]. Atualize `finalists` para confirmar a correção.”
- `VAL-023`: “p-016 (tc) está suspensa por 2º amarelo em g5 e não pode ter eventos em g6.”
- `VAL-024`: “W.O. inválido em g2: `no_show` não pode ter eventos; encontrados 2 cartões.”
- `VAL-032`: “Campo desconhecido em teams[0].players[0]: `fullName`. Remova o campo; a privacidade permite apenas id, nickname, position, joinedAt e leftAt.”

---

## 9. Contratos internos

### 9.1 Contratos de dados e domínio

```ts
// lib/data/load.ts
export function loadCompetition(filePath?: string): Competition;
export function parseCompetition(rawText: string, source: string): Competition;
export function validateCompetition(raw: unknown): ValidationResult;

// lib/domain/score.ts
export function resolveMatchTeams(match: Match, snapshots: PlayoffSnapshots | null):
  { readonly homeTeamId: TeamId; readonly awayTeamId: TeamId };
export function toResolvedMatch(match: Match, snapshots: PlayoffSnapshots | null): ResolvedMatch;
export function deriveScore(match: Match, snapshots?: PlayoffSnapshots | null): Score | null;
export function winnerOf(match: Match, snapshots?: PlayoffSnapshots | null): TeamId | null;

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

// lib/domain/playoffs.ts
export function buildExpectedSemifinalists(competition: Competition):
  readonly [TeamId, TeamId] | null;
export function buildExpectedFinalists(competition: Competition):
  readonly [TeamId, TeamId] | null;
export function buildPodium(competition: Competition): Podium;

// lib/domain/home.ts
export type HomeState =
  | 'beforeCup' | 'duringGroup' | 'groupComplete' | 'semiComplete' | 'afterFinal';
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
export function formatScore(match: Match, snapshots: PlayoffSnapshots | null): string;
export function formatScoreAccessible(
  match: Match,
  snapshots: PlayoffSnapshots | null,
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
- `winnerOf` retorna `null` para partida não finished e para empate de grupo; em empate de `semi`/`final`, retorna o mandante do snapshot por vantagem do empate; W.O. tem precedência.
- `formatStatus` retorna “Agendada”, “Encerrada”, “Adiada” ou “Resultado pendente”, nunca apenas uma classe CSS.
- `formatScore` retorna o texto visual (“A definir”, “Adiada”, `3 x 0 (W.O.)` ou `2 x 1`); `formatScoreAccessible` retorna a frase completa com nomes, placar e, no empate do mata-mata, quem avançou/foi campeã pela vantagem. Componentes não montam o formato manualmente.
- `buildExpectedSemifinalists` retorna `[2º, 3º]` ou `null`; `buildExpectedFinalists` retorna `[1º, vencedora]` ou `null`. Ambos não lançam erro com etapa incompleta.

### 9.2 Contratos de páginas

Cada página **DEVE**:

1. Chamar `loadCompetition()` uma vez e usar seletores de domínio.
2. Definir `title`, `description`, `canonicalPath` e `activeNav`.
3. Renderizar um único `<h1>`, com seções `<h2>`/`<h3>` em ordem.
4. Não conter dados de times, partidas, resultados ou estatísticas hardcoded.
5. Não conter `client:*`, scripts externos ou chamadas de rede; o único script permitido é o inline de tema em `BaseLayout.astro`.
6. Usar `withBase()` para todos os links internos.
7. Renderizar estados vazios explícitos quando não houver dados.

### 9.3 Contratos de componentes

| Componente | Props principais | Obrigações |
|---|---|---|
| `BaseLayout.astro` | `title`, `description`, `canonicalPath`, `activeNav`, `noindex?` | `<html lang="pt-BR">`, skip link, header, nav, `<main id="conteudo">`, footer, notices, meta tags. Carrega os times da fonte oficial e repassa ao cabeçalho. |
| `SiteHeader.astro` | `activeNav`, `activeTeamId?`, `teams` | Nome público, nav desktop, `<details>` “Menu” no mobile, submenu de Times, controle acessível de tema, `aria-current="page"`. |
| `NavList.astro` | `activeNav`, `activeTeamId?`, `teams` | Seis seções; submenu de Times com um link por time vindo dos dados; `aria-current` único. |
| `HomeShortcuts.astro` | `teams` | Atalhos para Jogos, Times e Classificação, mais os três times com links diretos. |
| `SiteFooter.astro` | `buildTimestamp` | Nome público, “Atualizado em … (horário de Brasília)”, sem instituição/Airbnb/analytics. |
| `NoticeBanner.astro` | `notices` | `<aside aria-labelledby="avisos-title">`, lista com `<time>`, nada só por cor. |
| `MatchCard.astro` | `match`, `competition`, `now`, `showStage?` | Times resolvidos pelo snapshot, fase, data, horário/local com fallback, status textual, placar/W.O., vantagem do empate quando aplicável e link para detalhe. |
| `Score.astro` | `match`, `snapshots`, `homeTeam`, `awayTeam` | Usa `formatScore` e `formatScoreAccessible`; nunca só parênteses sem explicação; exibe texto de vantagem/W.O. |
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
| `/jogos/semi/` | idem | Detalhe da semifinal | `jogos` | Semifinal — Copa … |
| `/classificacao/` | `classificacao/index.astro` | Tabela e critérios | `classificacao` | Classificação — Copa … |
| `/times/` | `times/index.astro` | 3 times | `times` | Times — Copa … |
| `/times/ta/`…`/times/tc/` | `times/[teamId].astro` | Elenco e histórico | `times` | {Time} ({abrev}) — Copa … |
| `/estatisticas/` | `estatisticas/index.astro` | Artilharia, assistências, cartões, gols contra | `estatisticas` | Estatísticas — Copa … |
| `/fase-final/` | `fase-final/index.astro` | Semifinal, final e pódio | `fase-final` | Fase final — Copa … |
| `/404.html` | `404.astro` | Página não encontrada | — | Página não encontrada — Copa … |
| `/regulamento/` | **não existe** | 404 | — | — |

- Todas as rotas usam barra final, exceto `404.html`.
- URLs com IDs de time são estáveis; renomear o time não muda `/times/ta/`.
- `/jogos/[matchId]` tem `getStaticPaths` fechado nos 8 IDs (`g1`…`g6`, `semi`, `final`); qualquer outro caminho cai no 404. `/jogos/terceiro/` não existe.
- `/times/[teamId]` tem `getStaticPaths` fechado em `ta`, `tb` e `tc`; `/times/td/` não existe.
- Nenhuma rota, link, metadado ou placeholder de Regulamento.
- Nenhuma rota para amistoso, disputa de 3º lugar ou pênaltis.
- Nenhuma rota de admin, API, busca, filtro ou edição.

### 10.2 Layout global

Ordem do documento:

```text
<a class="skip-link" href="#conteudo">Pular para o conteúdo</a>
<header>
  <a href="/futsal-cup/">Copa de Futsal Feminino Vila Mariana 2026</a>
  <div class="site-header__actions">
    <nav aria-label="Principal"> ... 6 seções + submenu de Times ... </nav>   // desktop
    <details class="menu-mobile">
      <summary>Menu</summary>
      <nav aria-label="Principal (menu móvel)"> ... 6 seções + 3 times ... </nav>
    </details>
    <button class="theme-toggle" aria-label="Tema escuro" aria-pressed="false"> ... </button>
  </div>
</header>
<aside aria-labelledby="avisos-title"> ... notices, se houver ... </aside>
<main id="conteudo" tabindex="-1"> ... </main>
<footer> ... </footer>
```

- Nav: Início, Jogos, Classificação, Times, Estatísticas, Fase final. Sem Regulamento.
- Times tem um submenu com um link por time, gerado a partir de `competition.teams`: href `/times/{id}/` usando o ID estável e rótulo `displayName ?? name`, sem IDs ou nomes fixos no HTML.
- No desktop, o submenu abre com `:hover` e `:focus-within`, sem JavaScript, posicionado sobre o conteúdo com `--shadow-floating` e `--z-nav-submenu`; fecha quando o ponteiro sai ou o foco tabula para fora.
- No mobile, ao abrir `<details>` “Menu”, os três links de times ficam sempre visíveis como lista indentada, sem um segundo toque.
- `aria-current="page"` no link ativo, uma única vez por navegação, com indicador visual que não depende só de cor (sublinhado + peso). Em `/times/`, marca Times; em `/times/{id}/`, marca o time no submenu e mantém Times destacado como seção, sem segundo `aria-current`.
- O item de nav com submenu exibe um chevron decorativo em CSS (`::after`), sem texto alternativo e sem animação de transform.
- O `<summary>` “Menu” é focável, tem alvo mínimo de 44×44px e funciona com Enter/Espaço nativamente.
- O botão “Tema escuro” tem alvo mínimo de 44×44px, ícones decorativos ocultos da árvore acessível e `aria-pressed` sincronizado ao tema aplicado.
- O claro é o padrão. A inicialização lê `localStorage["futsal-cup-theme"]` antes do CSS; apenas o valor exato `dark` ativa o escuro. Sem preferência, valor inválido ou falha de leitura, usa claro.
- Ao ativar o botão, alterna `data-theme` no elemento raiz e tenta persistir `light`/`dark`. Falha de escrita não bloqueia a alternância na página atual.
- Sem JavaScript, o botão de tema é ocultado (classe `no-js` removida na inicialização) e o site permanece no tema claro.
- A preferência é local ao perfil do navegador/dispositivo, sem servidor, conta, cookie ou sincronização.
- No desktop (`min-width: 768px`), o menu mobile fica oculto e a nav desktop visível; no mobile, o contrário. Apenas uma nav é exibida por vez.
- Não há JS para abrir/fechar o menu; `<details>` nativo resolve.
- O header não é sticky (evita foco obscurecido).
- Cards de partida e de time usam link estendido: o título é o nome acessível e a área clicável cobre o card inteiro. O foco desenha o anel no card e não há controles interativos aninhados.
- Cada `.page-header` tem uma barra de gradiente decorativa (largura `--accent-bar-width`, altura `--accent-bar-height`) sem texto sobreposto.
- O rodapé contém o nome público e “Atualizado em {data} às {hora} (horário de Brasília)”. Não contém instituição, Airbnb, analytics, cookies ou links de terceiros.
- O skip link é o primeiro elemento focável e fica visível ao receber foco.

### 10.3 Início — cinco estados

O estado é calculado no build por `getHomeState(competition, now)`. Não há contagem regressiva.

Em todos os estados da Início, o selo local da competição acompanha o título público no cabeçalho; é decorativo (`alt=""`) e não substitui o nome em texto HTML.

#### UI-HOME-01 — Antes da copa

Condição: `hoje < primeira data do grupo` e nenhuma partida de grupo `finished`.

- Nome público em `<h1>` curto.
- “Primeira rodada — {data da primeira rodada}” com os dois jogos do dia, sem data fixa no componente.
- Atalhos para Jogos, Times e Classificação, mais os três times com links diretos para `/times/{id}/`, gerados a partir dos dados.
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

Condição: as 6 partidas de grupo estão `finished`, semifinal ainda não encerrada.

- Card da **semifinal** “2º x 3º” com data, local, horário ou fallback, e link para o detalhe.
- Card da **final** com o 1º colocado e “Vencedora da semifinal”; não usar “Confrontos a definir” quando o 1º já é conhecido.
- Texto visível da vantagem do empate para o 2º na semifinal e para o 1º na final.
- Link para Fase final.
- Últimos resultados da última data encerrada.
- Classificação final (sem “provisória”); a 3ª colocada ainda não está definida.
- Se a semifinal já estiver encerrada, o estado é o 4.

#### UI-HOME-04 — Após a semifinal

Condição: `semi` `finished`, final ainda não encerrada.

- Card da **final** com o 1º colocado e a vencedora da semifinal, data/local/horário e link.
- Texto visível da vantagem do empate para o 1º.
- 3ª colocada já definida como perdedora da semifinal, com rótulo “3ª colocada”.
- Link para Fase final.
- Resultado da semifinal e últimos resultados.
- Classificação final (sem “provisória”).
- Se a final já estiver encerrada, o estado é o 5.

#### UI-HOME-05 — Após a final

Condição: `final` `finished`.

- Campeã em destaque com texto “Campeã: {time}” (não só cor).
- Pódio completo: campeã, vice-campeã e 3ª colocada; não há 4º lugar.
- Link para Fase final.
- Resultado da final, com texto de vantagem do empate se aplicável.
- Sem contagem regressiva; sem dados inventados.

**Fallback de agenda:** se não houver próximo jogo e existirem partidas `postponed`, a Início mostra “Agenda em atualização” no bloco de próxima rodada e mantém últimos resultados/classificação. Isso não cria um sexto estado; é um conteúdo dos estados 2/3/4.

### 10.4 Jogos — lista e detalhe

**Lista (`/jogos/`)**

- Agrupar por `date` em ordem ascendente.
- Cada grupo tem `<h2>` com data e dia da semana: “Terça-feira, 24/11/2026”.
- Cada card mostra: fase (“Rodada 1”, “Rodada 2”, “Rodada 3”, “Semifinal”, “Final”), times, horário ou “Horário a definir”, local ou “Local a definir”, status textual e placar quando aplicável.
- A lista contém as **8 partidas oficiais**; não há amistoso, disputa de 3º lugar ou pênaltis.
- Status: “Agendada”, “Encerrada”, “Adiada” ou “Resultado pendente” (derivado para `scheduled` vencida).
- W.O.: placar derivado na ordem mandante/visitante (3x0 para o vencedor) + “(W.O.)” + motivo.
- Em empate na semifinal/final, o placar permanece `N x N` e o card indica textualmente quem avançou/foi campeã pela vantagem do empate.
- Partidas `postponed` aparecem na data cadastrada com “Adiada”; não somem da lista.
- `semi` com `semifinalists: null` mostra “Confrontos a definir” no lugar dos times e não calcula placar.
- `final` com `finalists: null` mostra o 1º colocado e “Vencedora da semifinal” quando `semifinalists` já existe; sem `semifinalists`, mostra “Confrontos a definir”.
- Link do card para `/jogos/{id}/`.

**Detalhe (`/jogos/{id}/`)**

- Cabeçalho: fase, times, data/hora, local, status, placar.
- `semi` com `semifinalists: null` ou `final` com `finalists: null`: “Confrontos a definir”, explicação de que a fase depende da etapa anterior e link para Classificação/Fase final; sem placar/eventos e sem chamar `resolveMatchTeams`.
- Placar normal ou W.O. com texto acessível; em empate de mata-mata, indicar a vantagem do empate.
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
- Sem seção, texto ou link de shootout/pênaltis.

### 10.5 Classificação

- Tabela com colunas: Posição, Time, Pontos, Jogos, V, E, D, GP, GC, SG, CA, CV, PD.
- `<caption>`: “Classificação da fase classificatória — Copa de Futsal Feminino Vila Mariana 2026”.
- Cabeçalhos com `<abbr title="...">` para V, E, D, GP, GC, SG, CA, CV e PD; a nota abaixo da tabela repete os significados por extenso.
- Time como `<th scope="row">`; posição como `<td>`.
- “Classificação provisória” visível enquanto qualquer partida de grupo não estiver `finished`.
- Badge “Sorteio” na linha do time cuja posição foi decidida por `drawOrder`, com texto oculto “posição definida por sorteio”.
- Nota abaixo da tabela: “V = vitórias, E = empates, D = derrotas, GP = gols pró, GC = gols contra, SG = saldo de gols, CA = cartões amarelos, CV = cartões vermelhos, PD = pontos disciplinares. Vermelhos incluem o segundo amarelo. Pontos disciplinares: amarelo 1, vermelho 3, segundo amarelo 3 no total; menor é melhor.”
- Lista ordenada dos critérios de desempate, incluindo “confronto direto só para dois times” e “sorteio”.
- Tabela dentro de `.table-scroll` com `role="region"`, `aria-labelledby`, `tabindex="0"` e `overflow-x:auto`; a página não tem overflow horizontal em 320px.
- Dica visível em telas estreitas: “Deslize horizontalmente para ver todas as colunas.”
- Se não houver partidas encerradas, mostrar as 3 linhas zeradas e o aviso de classificação provisória.
- Nota visível: “A semifinal e a final não alteram esta classificação.”

### 10.6 Times

**Lista (`/times/`)**

- 3 cards com nome de exibição ou nome-base (sem abreviação), logo opcional, posição/registro, número de atletas ativas, estatísticas coletivas (jogos, V/E/D no tempo normal, GP/GC/SG, cartões/pontos) e link.
- Badge “Elenco em formação” somente quando ativas < 5.
- Entre 5 e 6 ativas, não há badge público; a pendência aparece no CI (`VAL-W01`).
- Não há fotos de pessoas. Logo opcional do time é exibido quando informado.

**Detalhe (`/times/{id}/`)**

- Cabeçalho com nome de exibição ou nome-base (sem abreviação), logo opcional, posição na classificação e estatísticas coletivas das **8 partidas oficiais**.
- O logo tem texto alternativo vazio quando acompanhado pelo nome visível; se `logo` for `null`, não renderizar imagem nem placeholder.
- A vantagem do empate é exibida separadamente quando o time decidiu uma semifinal/final empatada; ela não é somada a V/E/D. A partida continua contando como empate.
- Não há campanha, coluna ou texto de pênaltis/shootout.
- Tabela do elenco ativo: Apelido, Posição, Gols, Assistências, Amarelos, Vermelhos, Pontos disciplinares, Suspensão.
- Posição: “Goleira”, “Linha” ou “—”.
- Status de suspensão textual: “Sem suspensão”, “Suspensa na partida {adversário} de {data}”, “Suspensão pendente — fase final a definir” ou “Suspensão sem efeito — sem próxima partida”.
- Badge “Elenco em formação” quando ativas < 5.
- Seção separada “Atletas com histórico na edição” para jogadoras com `leftAt != null` e ao menos um evento; mostrar estatísticas e “fora do elenco ativo”.
- Se não houver atletas no histórico, omitir a seção.
- Se o elenco ativo estiver vazio, “Nenhuma atleta no elenco ativo”.

### 10.7 Estatísticas

Seções, nesta ordem:

1. **Artilharia** — Posição, Atleta, Time, Gols, Assistências. Nota: “Inclui pênaltis do tempo normal e as 8 partidas oficiais; não inclui gols contra nem shootout.”
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
| UI-FINAL-01 | Grupo incompleto | “Confrontos a definir” + explicação de que a fase final depende das 6 partidas; link para Classificação. Sem card de semifinal/final com times inventados. |
| UI-FINAL-02 | Grupo completo, semifinal não encerrada | Card “2º x 3º” com data/local/horário e link; card da final com o 1º colocado e “Vencedora da semifinal”; textos de vantagem do empate para o 2º e para o 1º. |
| UI-FINAL-03 | Semifinal encerrada, final não encerrada | Card da final “1º x vencedora da semifinal” com data/local/horário; 3ª colocada (perdedora da semifinal) em destaque; texto de vantagem do empate para o 1º. |
| UI-FINAL-04 | Final encerrada | Pódio completo (campeã, vice-campeã e 3ª colocada) + ficha da final + ficha da semifinal. |

- Os cards usam `semifinalists`/`finalists`; não há times hardcoded.
- Se a semifinal ou a final foi W.O., mostrar o placar derivado na ordem mandante/visitante (3x0 para o vencedor), “(W.O.)” e o motivo; o W.O. prevalece sobre a vantagem.
- Em empate no tempo normal, mostrar o placar `N x N` e o texto de quem avançou/foi campeã pela vantagem do empate.
- “Campeã”, “Vice-campeã” e “3ª colocada” são textos visíveis. **NÃO DEVE** existir “4º lugar”, card de disputa de 3º lugar ou card de amistoso.
- Antes da semifinal, a final deve exibir o 1º colocado e “Vencedora da semifinal”; **NÃO DEVE** usar “Confrontos a definir” quando o 1º já é conhecido.
- Não há card, link ou texto de pênaltis/shootout.

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
| UI-MATCH-05 | W.O. | Placar derivado na ordem mandante/visitante (3x0 para o vencedor) + “(W.O.)” + motivo; sem gols fictícios. |
| UI-MATCH-06 | Vantagem do empate | Placar `N x N` + texto “{time} avança/conquista o título pela vantagem do empate”. |
| UI-MATCH-07 | Mata-mata sem snapshot | “Confrontos a definir”; sem placar/eventos; link para Classificação/Fase final. |
| UI-MATCH-08 | Final com 1º definido | 1º colocado + “Vencedora da semifinal”; não usar “Confrontos a definir”. |
| UI-STANDINGS-01 | Provisória | Badge “Classificação provisória”. |
| UI-STANDINGS-02 | Final | Sem badge de provisória. |
| UI-STANDINGS-03 | Sorteio | Badge “Sorteio” na linha. |
| UI-TEAM-01 | Elenco em formação | Badge visível com ativas < 5. |
| UI-TEAM-02 | Suspensão | Texto “Suspensa na partida …”. |
| UI-TEAM-03 | Histórico | Seção “Atletas com histórico na edição”. |
| UI-STATS-01 | Sem dados | Mensagem de estado vazio. |
| UI-STATS-02 | Fora do elenco | Marca textual “fora do elenco ativo”. |
| UI-FINAL-01/02/03/04 | Fase final | Conforme §10.8. |
| UI-THEME-01 | Tema padrão | Claro se não houver preferência `dark` salva ou se a leitura falhar. |
| UI-THEME-02 | Alternância | Botão acessível troca tema, ícone e `aria-pressed`; grava `light`/`dark`; erro de gravação não bloqueia a tela atual. |
| UI-404-01 | Não encontrada | 404 com link. |

### 10.11 SEO, metadados e favicon

- `<html lang="pt-BR">`.
- Título único por página; descrição única, 50..160 caracteres.
- `link rel="canonical"` absoluto com base `/futsal-cup/`.
- Open Graph: `og:title`, `og:description`, `og:url`, `og:type=website`, `og:site_name`. Sem `og:image`.
- 404: `noindex`, sem canonical/OG.
- Favicon `public/favicon.svg`: 32×32, monograma tipográfico simples “CF” ou “Copa”, fundo coral e texto branco ou vice-versa, sem logotipos/marcas da Airbnb ou da instituição. Caminho público `/futsal-cup/favicon.svg`.
- `meta name="color-scheme" content="light dark"`; `color-scheme` CSS acompanha `data-theme`. O claro é o primeiro/padrão.
- Sem `robots.txt` obrigatório; sem sitemap no MVP.
- Nenhuma imagem OG, foto, fonte externa ou script de terceiros. Não há arquivo JS externo; somente o script inline local da §10.2.

---

## 11. Design e acessibilidade

### 11.1 Princípios

- Orientado a dados: tabelas, resultados e estatísticas têm prioridade sobre decoração.
- Mobile-first: 320px é o piso; o layout cresce sem overflow horizontal da página.
- Identidade coral/pink em acentos, títulos grandes e detalhes; nunca atrás de tabelas ou em grandes áreas.
- Sem fotos de jogadoras e sem imagens de pessoas. A hierarquia vem de tipografia, cor e espaço.
- Acessibilidade vence o estilo em qualquer conflito.
- Tema claro por padrão e tema escuro escolhido manualmente; não seguir automaticamente o tema do sistema.

### 11.2 Camada de tokens

A referência `airbnb-design-tokens.css` é interna e indicativa. Para evitar publicar nomes de fontes proprietárias e nomes de marca no CSS final, o projeto **NÃO DEVE** importar o arquivo integralmente. Ele **DEVE** criar `src/styles/tokens.css` com os valores necessários, renomeados para tokens do projeto, documentando a correspondência nesta SPEC. Essa é uma extensão da referência, não uma alteração dos valores originais.

Os valores claros abaixo são os aliases padrão. O seletor `:root[data-theme="dark"]` sobrescreve apenas cores semânticas e sombras. Todos os componentes continuam consumindo os mesmos aliases; os valores escuros são uma adaptação do projeto, não parte da referência visual.

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
| `--color-text` (escuro) | projeto | `#f5f5f7` | Texto principal no escuro. |
| `--color-text-muted` (escuro) | projeto | `#b8b8bd` | Texto secundário no escuro. |
| `--color-surface` (escuro) | projeto | `#161618` | Superfície principal. |
| `--color-surface-subtle` (escuro) | projeto | `#242427` | Superfície sutil/linhas alternadas. |
| `--color-border` (escuro) | projeto | `#48484f` | Hairline decorativa. |
| `--color-accent` (escuro) | projeto | `#ff7a7e` | Acento coral claro. |
| `--color-accent-strong` (escuro) | projeto | `#ff6b91` | Acento pink claro. |
| `--color-on-accent` (escuro) | projeto | `#222222` | Texto sobre acento no tema escuro. |
| `--color-focus` (escuro) | projeto | `#f5f5f7` | Anel de foco no tema escuro. |
| `--font-family-body` | `--font-body` (substituído) | `-apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif` | Texto; sem fontes proprietárias. |
| `--text-display-size` / `--text-display-line` | `--text-display` | `48px` / `56px` | Título curto em telas largas. |
| `--text-heading-1-size` / `--text-heading-1-line` | `--text-heading-1` | `32px` / `36px` | `<h1>`/seções. |
| `--text-heading-2-size` / `--text-heading-2-line` | `--text-heading-2` | `22px` / `26px` | Subtítulos. |
| `--text-body-size` / `--text-body-line` | `--text-body` | `16px` / `24px` | Corpo. |
| `--text-small-size` / `--text-small-line` | `--text-small` | `14px` / `18px` | Tabelas, badges, legendas. |
| `--tracking-display` | — | `-0.02em` | Tracking de títulos em `display`. |
| `--tracking-heading` | — | `-0.01em` | Tracking de `h1`–`h3`. |
| `--space-1`…`--space-6` | `--space-1`…`--space-6` | `8/16/24/32/48/64px` | Espaçamento. |
| `--radius-small` | `--radius-small` | `8px` | Elementos pequenos. |
| `--radius-card` | `--radius-card` | `12px` | Cards. |
| `--radius-pill` | `--radius-pill` | `9999px` | Badges. |
| `--shadow-card` | `--shadow-card` | `0 6px 16px rgba(0,0,0,0.12)` | Cards. |
| `--shadow-floating` | `--shadow-floating` | `0 3px 12px rgba(0,0,0,0.15)` | Menu sobreposto. |
| `--shadow-card` (escuro) | projeto | `0 6px 16px rgba(0,0,0,0.4)` | Cards no tema escuro. |
| `--shadow-floating` (escuro) | projeto | `0 3px 12px rgba(0,0,0,0.5)` | Elementos sobrepostos no tema escuro. |
| `--shortcut-min` | — | `10rem` | Largura mínima de cada atalho no grid `auto-fit`. |
| `--team-logo-size` | — | `5rem` | Logo nos cards de time e no cabeçalho do time no mobile. |
| `--team-logo-size-lg` | — | `12rem` | Logo no cabeçalho do time a partir de 768px. |
| `--competition-logo-size` | — | `7rem` | Selo da competição no cabeçalho da página inicial. |
| `--accent-bar-width` | — | `8rem` | Comprimento da barra de gradiente decorativa. |
| `--accent-bar-height` | — | `4px` | Espessura da barra de gradiente decorativa. |
| `--z-nav-submenu` | — | `5` | Sobreposição do submenu de Times no desktop. |
| `--motion-default` | `--motion-default` | `250ms cubic-bezier(0.2,0,0,1)` | Transições discretas. |

A referência agrupa tamanho e entrelinha no mesmo token; o projeto separa cada par em `*-size` e `*-line` para uso direto em `font-size`/`line-height`.

Tokens técnicos adicionais (também em `tokens.css`): `--page-gutter`, `--content-max`, `--measure`, `--tap-target`, `--border-width`, `--focus-width`, `--focus-offset`, `--table-min-width`, `--shortcut-min`, `--team-logo-size`, `--team-logo-size-lg`, `--competition-logo-size`, `--accent-bar-width`, `--accent-bar-height`, `--z-nav-submenu`, `--gradient-accent`.

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

Pares do tema escuro (recalculados pelo teste de tokens):

| Par | Contraste aproximado | Uso permitido |
|---|---:|---|
| `--color-text` sobre `--color-surface` | 16,60:1 | Texto normal e grande. |
| `--color-text` sobre `--color-surface-subtle` | 14,22:1 | Texto normal e grande. |
| `--color-text-muted` sobre `--color-surface` | 9,15:1 | Texto normal. |
| `--color-text-muted` sobre `--color-surface-subtle` | 7,83:1 | Texto normal. |
| `--color-accent` sobre `--color-surface` | 7,17:1 | Texto, ícones e detalhes. |
| `--color-accent-strong` sobre `--color-surface` | 6,68:1 | Texto, ícones e detalhes. |
| `--color-on-accent` sobre `--color-accent` | 6,32:1 | Texto normal sobre acento. |
| `--color-focus` sobre `--color-surface` / `--color-surface-subtle` | 16,60 / 14,22:1 | Anel de foco. |
| `--color-border` sobre `--color-surface` | 1,99:1 | Apenas hairline decorativa. |

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
- Tracking é específico por tamanho: `--tracking-display` (`-0.02em`) em display e `--tracking-heading` (`-0.01em`) em `h1`–`h3`; o corpo fica em `0`.
- Usar `text-wrap: balance` em títulos e `text-wrap: pretty` em parágrafos, sem depender disso para informação essencial.
- Números de placar, tabelas e estatísticas usam `font-variant-numeric: tabular-nums`.
- Não usar `text-transform: uppercase` em blocos longos; apenas no eyebrow curto do cabeçalho e em badges curtos, com `letter-spacing` tokenizado.

### 11.5 Cores, estados e significado

- Não comunicar vitória/empate/derrota, classificação, cartão, suspensão, W.O. ou sorteio apenas por cor.
- Badges sempre com texto: “Encerrada”, “Adiada”, “Resultado pendente”, “W.O.”, “Sorteio”, “Elenco em formação”, “Suspensa”, “Classificação provisória”.
- Placar e resultados sempre em texto; ícones são decorativos (`aria-hidden="true"`).
- “Campeã” é texto, não apenas destaque de cor.
- Linhas alternadas podem usar `--color-surface-subtle`; a informação não depende disso.
- Links: `--color-text` com sublinhado de 2px em `--color-accent`; hover aumenta a espessura do sublinhado. Não usar coral como cor de texto de corpo.
- Botão primário: fundo `--color-text`, texto `--color-surface`; botão secundário: fundo transparente, texto `--color-text`, borda 2px `--color-text`.
- Foco: `outline: var(--focus-width) solid var(--color-focus); outline-offset: var(--focus-offset);` e fallback `:focus`. Não remover `outline` sem substituto equivalente.
- Botão do tema: ícone decorativo sol/lua com `aria-hidden="true"`; estado do tema exposto via `aria-pressed`, sem depender apenas do ícone ou da cor.

### 11.6 Espaçamento, forma, elevação e movimento

- Base 8px; usar `--space-1`…`--space-6`. Não usar valores intermediários arbitrários.
- Página: gutter `--space-2` no mobile e `--space-4` a partir de 768px.
- Cards: padding `--space-3`, raio `--radius-card`, sombra `--shadow-card`. No hover, usar `--shadow-floating`; no `:active`, mudar apenas cor de fundo/borda, sem transform.
- Cards de partida e de time: o link do título usa `::after` com `inset: 0` para cobrir o card; o anel de foco é desenhado no card via `:focus-within`.
- Barra decorativa do cabeçalho: `--gradient-accent`, largura `--accent-bar-width`, altura `--accent-bar-height`, sem texto sobreposto.
- Badges: raio `--radius-pill`, padding horizontal `--space-2`, `letter-spacing: --letter-spacing-badge` e quebra de linha permitida; não fixar altura.
- Estatísticas coletivas: grid de 2 colunas em todas as larguras.
- Logos de time: `--team-logo-size` nos cards e no mobile; `--team-logo-size-lg` no cabeçalho do time a partir de 768px.
- Tabelas: `vertical-align: middle`, cabeçalhos sem quebra de linha, números tabulares e rolagem contida no contêiner.
- Estados vazios: borda tracejada com acento em `border-inline-start` e último parágrafo sem margem.
- Não criar sombras fora dos tokens.
- Movimento: apenas transições de cor/borda/sublinhado/sombra com `--motion-default`. Nada de animação de conteúdo essencial nem de `transform`.
- A troca de tema não anima `background-color`; superfícies mudam instantaneamente para evitar contraste transitório abaixo de AA.
- `@media (prefers-reduced-motion: reduce)` deve zerar animações/transições e `scroll-behavior`.
- A impressão usa sempre os tokens claros, mesmo quando a tela está no tema escuro.
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
- `aria-current="page"` no link ativo, uma única vez por navegação; no detalhe do time, o submenu marca o time e a seção Times permanece destacada.
- Tabelas: `<caption>`, `<th scope="col">`, `<th scope="row">`, `<abbr title>`, sem tabela de layout.
- Contêiner de rolagem: `role="region"`, `aria-labelledby`, `tabindex="0"`, instrução textual; foco visível.
- Placar e definição por vantagem do empate com texto acessível completo; não depender de parênteses, cor ou posição. O painel visual do placar mantém o texto acessível em `.visually-hidden`.
- Suspensões, W.O., sorteio, vantagem do empate e elenco em formação sempre com texto.
- Cards clicáveis por inteiro: o link do título é o único controle, seu texto é o nome acessível e o foco aparece no card. Não aninhar links ou botões dentro do card.
- Barra de gradiente, chevrons e demais traços decorativos são CSS sem conteúdo textual e não entram na árvore acessível.
- Ícones decorativos com `aria-hidden="true"`; ícones informativos com nome acessível.
- Alternância de tema acessível por teclado; claro padrão; preferência restaurada/persistida no `localStorage`; falhas de armazenamento degradam para tema claro ou alternância apenas na página.
- `prefers-reduced-motion` respeitado.
- Zoom 200% sem perda de conteúdo/funcionalidade.
- Impressão A4 retrato usa sempre tema claro, não corta tabelas e oferece guia nativo de impressão/PDF sem JavaScript adicional.
- Nenhum conteúdo piscante, autoplay ou tempo limite.
- Não há formulários no MVP; se houver no futuro, labels e erros acessíveis.
- Testar com teclado, leitor de tela (NVDA/VoiceOver) e zoom; checklist no Apêndice D.

### 11.9 Performance e orçamento

| Métrica | Limite | Verificação |
|---|---|---|
| JS de cliente | Um script inline de tema ≤ 1 KB gzip/página; nenhum arquivo JS externo em `dist/` | `npm run test:build` |
| CSS | < 30 KB gzip por página | `npm run test:build` |
| HTML | ≤ 60 KB gzip por página | `npm run test:build` |
| Peso total (HTML+CSS) | ≤ 90 KB gzip por página | `npm run test:build` |
| Fontes externas | 0 | varredura de `dist/` |
| Imagens de pessoas | 0 | varredura de `dist/` |
| Requisições de terceiros | 0 | Playwright |
| Lighthouse mobile (Início e partida) | ≥ 90 em Performance, Acessibilidade, Boas práticas e SEO | auditoria manual no checklist |

- Sem fotos de pessoas. Logos de times ficam em `public/images/times/`, cada um com no máximo 200 KB e referenciado na fonte. O selo oficial da competição fica em `public/images/brand/copa-vila-mariana-2026.webp`, com transparência e até 120 KB; não é configurável pela fonte de dados. Favicon SVG pequeno.
- CSS crítico inline? **NÃO** no MVP; um único CSS externo cacheável é suficiente. Evitar `style` inline.
- Sem prefetch de rotas, sem service worker, sem fontes.
- O site deve carregar em 4G com uma única requisição HTML + CSS, o selo otimizado da competição na Início e favicon opcional; o script de tema é inline no HTML e não adiciona requisição.

### 11.10 Conteúdo e privacidade visual

- Somente apelido, posição, time e estatísticas.
- Nenhum nome completo, foto, contato, camisa, data de nascimento, idade ou endereço.
- Nenhum ID de jogadora no HTML, em atributos, URLs ou JSON.
- Nenhum logo da instituição ou da Airbnb; nenhuma marca de terceiros.
- Textos públicos em pt-BR, com “você” e linguagem clara.
- Textos livres (`notices[].message`) são públicos: use apelidos ou descrições genéricas; nunca inclua nome completo, contato ou outro dado pessoal.
- Datas por extenso quando ajudar (“Terça-feira, 24/11/2026”); horários em 24h.
- “Horário de Brasília” no rodapé para explicar o fuso.

### 11.11 Impressão e PDF

- A impressão é iniciada pelos controles do navegador; não há botão `window.print()`, diálogo de impressão ou preferência persistida.
- `src/styles/print.css` é importado por último em `BaseLayout.astro` e define `@page { size: A4 portrait; margin: 12mm 14mm 16mm; }`.
- O tema impresso é sempre claro, inclusive quando a tela está em `data-theme="dark"`. Cores, escala tipográfica e sombras vêm dos tokens de impressão em `src/styles/tokens.css`.
- A navegação, o controle de tema, o skip link, dicas de rolagem, links de retorno, atalhos de navegação e o guia do rodapé não são impressos.
- Cards e destaques usam grids adequados à largura A4; componentes e linhas de tabela evitam quebras internas quando possível. O rodapé mantém o nome do site e a data de atualização.
- Tabelas deixam de rolar no papel (`overflow: visible`), removem a largura mínima, repetem o cabeçalho (`table-header-group`) e evitam quebra de linhas. Texto e dados essenciais não podem depender de cores de fundo.
- Gradientes e badges podem solicitar reprodução exata de cores, mas a leitura não deve depender da opção de gráficos de fundo.
- O `<details>` “Como imprimir ou salvar em PDF” do rodapé informa A4, retrato, cabeçalhos/rodapés, gráficos de fundo e a opção móvel de salvar como PDF. Deve ser operável por teclado e fica oculto no papel.
- Testes E2E simulam `media: print`, verificam tema claro, controles ocultos, largura da tabela, grids e repetição do cabeçalho. A conferência visual de PDFs complementa os testes automatizados.

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

const runWebkit = Boolean(process.env.CI) || process.env.PLAYWRIGHT_WEBKIT === '1';

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:4322/futsal-cup/',
    trace: 'retain-on-failure',
  },
  webServer: {
    command:
      'npm run build:test && npm run preview:test -- --host 127.0.0.1 --port 4322 --ignore-lock',
    url: 'http://127.0.0.1:4322/futsal-cup/',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    { name: 'desktop-chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-chromium', use: { ...devices['Pixel 5'] } },
    {
      name: 'desktop-firefox',
      testMatch: /compatibility\.spec\.ts/,
      use: { ...devices['Desktop Firefox'] },
    },
    ...(runWebkit
      ? [
          {
            name: 'desktop-webkit',
            testMatch: /compatibility\.spec\.ts/,
            use: { ...devices['Desktop Safari'] },
          },
          {
            name: 'mobile-webkit',
            testMatch: /compatibility\.spec\.ts/,
            use: { ...devices['iPhone 13'] },
          },
        ]
      : []),
  ],
});
```

- CI instala Chromium, Firefox e WebKit: `npx playwright install --with-deps chromium firefox webkit`.
- `tests/e2e/compatibility.spec.ts` roda um smoke de rotas, menu móvel, skip link e tabela larga em Firefox e, no CI (ou com `PLAYWRIGHT_WEBKIT=1`), em Safari desktop e iOS Safari via WebKit. Chrome/Edge usam o Chromium; a conferência visual e em dispositivos reais continua no checklist manual (Apêndice D).
- WebKit exige bibliotecas de sistema; por isso os projetos WebKit ficam fora do `npm run verify` local por padrão e rodam no CI, onde `--with-deps` as instala. Para rodar localmente, use `PLAYWRIGHT_WEBKIT=1` após instalar as dependências.
- `--ignore-lock` mantém o preview em primeiro plano em ambientes que detectam agentes; o Playwright encerra o processo ao final.
- O `webServer` do E2E constrói `dist-test/` a partir de `tests/fixtures/valida.yaml` e serve essa pasta na porta 4322. O build de produção em `dist/` permanece intacto e é o único publicado.
- O `webServer` do E2E não depende de `dist/`; `npm run test:build` continua exigindo o build de produção.
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

      - name: Instalar navegadores
        run: npx playwright install --with-deps chromium firefox webkit

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
- O E2E constrói `dist-test/` com a fixture concluída; o artefato publicado continua sendo `dist/`, gerado a partir de `data/2026/copa.yaml`.
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
| `npm run build` | Gera `dist/` estático com a fonte pública. | Publicação local/CI. |
| `npm run build:test` | Gera `dist-test/` com a fixture concluída, sem tocar em `dist/`. | E2E local/CI. |
| `npm run preview` | Serve `dist/` em `localhost:4321/futsal-cup/`. | Conferência local. |
| `npm run preview:test` | Serve `dist-test/` em `localhost:4322/futsal-cup/`. | E2E local. |
| `npm run test:build` | Varre `dist/` (rotas, JS, termos, orçamento). | Após build de produção. |
| `npm run test:e2e` | Playwright + axe sobre `dist-test/`. | Após build de teste. |
| `npm run verify` | Sequência completa local. | Antes de PR/publicação. |
| `npx playwright install --with-deps chromium firefox webkit` | Instala os navegadores de teste. | Setup do E2E. |

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
| `COPA_DATA_FILE` | Fonte alternativa usada apenas pelo build de teste do E2E; o build de produção não a define. | Não |
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
| Build | `scripts/check-build.ts` | Rotas, links internos, 404, ausência de Regulamento, script inline de tema ≤1 KB gzip, sem JS externo, termos proibidos, fontes proprietárias, orçamento, IDs de jogadora. | Sim |
| E2E | Playwright | Navegação, teclado, foco, 320px, tabelas roláveis, meta tags, 404, menu `<details>`. Smoke em Chromium, Firefox e WebKit (Safari desktop e iOS). | Sim |
| Acessibilidade | Playwright + axe-core | Violações `serious`/`critical` nas rotas principais. | Sim |
| Impressão | Vitest + Playwright; conferência visual de PDF | Tokens claros, A4, tabelas sem corte, cabeçalho repetido, controles ocultos e guia por teclado. | Sim |
| Manual | Checklist Apêndice D | Leitor de tela, zoom 200%, dispositivos reais, Safari/Firefox/Edge, Lighthouse, inspeção visual. | Antes da publicação |

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
- W.O. 3x0 conta para pontos, vitórias, gols pró/contra e saldo; no confronto direto, o W.O. conta como 3x0 para o vencedor.

**Cartões e suspensão**

- Amarelo = 1; vermelho = 3; 1 amarelo + 1 vermelho direto = 4; dois amarelos = 3 no total.
- Dois amarelos no mesmo jogo geram vermelho derivado para estatísticas/suspensão.
- Terceiro amarelo no mesmo jogo bloqueia; vermelho explícito com dois amarelos bloqueia.
- Vermelho direto suspende a próxima partida real do time, considerando o chaveamento.
- 1º colocado sem semifinal: vermelho no último jogo de grupo é cumprido na final, quando definida.
- 2º/3º: vermelho na última partida de grupo é cumprido na semifinal; vermelho na semifinal é cumprido na final apenas se o time avançar.
- Vermelho na final não tem partida seguinte e não tem efeito.
- Sem próxima partida, sem efeito.
- Jogadora suspensa não pode ter eventos na partida que perde.
- Cartões da semifinal e da final contam para estatísticas/suspensão, não para classificação; não há cartões de 3º lugar.
- Cartões de W.O. contam, exceto `no_show`.
- Não há suspensão por acúmulo de amarelos.

**Gols, assistências e pênaltis do tempo normal**

- Placar derivado de gols normais, pênaltis do tempo normal e gols contra.
- Gol contra credita o adversário e não entra na artilharia da jogadora.
- Assistência opcional, do mesmo time, diferente da marcadora; proibida em pênalti e gol contra.
- Pênalti do tempo normal conta na artilharia; não há shootout.
- W.O. sem gols/assistências; cartões permitidos conforme motivo.
- Estatísticas coletivas: `buildTeamStats` agrega grupo + semifinal + final (8 partidas); empate na semifinal/final conta como empate em V/E/D; não há `shootoutWins`/`shootoutLosses`; GP/GC/SG incluem o tempo normal; W.O. conta 3x0.
- Simetria dos confrontos: cada par tem um jogo em casa para cada time; `g4` é `tb x ta`; trocar para `ta x tb` falha `VAL-012`.

**Elenco e elegibilidade**

- 7–9 ativas; 10ª bloqueada; <7 gera aviso; <5 gera badge.
- Apelido único no time após normalização; acentos distintos.
- Jogadora em dois times bloqueada.
- `leftAt` preserva histórico e não ocupa vaga.
- `joinedAt`/`leftAt` definem elegibilidade; eventos retroativos bloqueados.
- Jogadora que atuou não troca de time.
- Jogadora fora do elenco ativo com eventos aparece nas estatísticas com marca textual.

**Fase final e correções**

- 8 partidas oficiais: `g1`…`g6`, `semi`, `final`; conjunto diferente falha `VAL-011`.
- `semifinalists` nulo com grupo incompleto; obrigatório e igual a `[2º, 3º]` com grupo completo.
- `finalists` nulo com semifinal incompleta; obrigatório e igual a `[1º, vencedora da semifinal]` com semifinal completa.
- Semifinal 2º x 3º e vantagem do empate para o 2º; final 1º x vencedora da semifinal e vantagem do empate para o 1º.
- Empate na semifinal classifica o 2º; empate na final dá o título ao 1º; placar continua empate.
- W.O. na semifinal e na final prevalece sobre a vantagem e define vencedor/campeão, inclusive quando o vencedor é o visitante.
- Pódio com campeã, vice-campeã e 3ª colocada; a 3ª é a perdedora da semifinal; não há 4º lugar.
- Correção que muda semifinalistas após a semifinal ou finalistas após a final falha listando antigos/novos.
- `notices` gera banner global.
- `friendly` e `shootout` são proibidos e geram `VAL-002` com mensagem de migração; ausência de amistoso, shootout e disputa de pênaltis em dados, UI e build.
- Card da final antes da semifinal mostra o 1º colocado e “Vencedora da semifinal”, sem “Confrontos a definir”.

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
- Impressão A4 retrato em tema claro; tabelas sem corte e com cabeçalho repetido; guia de impressão/PDF abre e fecha por teclado sem JavaScript adicional.
- Meta tags, canonical, OG, favicon, 404.
- Ausência de `client:*` e de JS externo em `dist/`; somente script inline do tema, dentro do orçamento.
- Ausência de `airbnb-design-design.md`, `airbnb-design-tokens.css`, fontes proprietárias e termos proibidos em `dist/`.

### 13.3 Fixtures e factories

- `tests/fixtures/valida.yaml`: temporada completa válida (pode ser a do Apêndice A); é a fixture do build de teste do E2E, não a fonte pública.
- `tests/fixtures/invalida-*.yaml`: casos de schema (campo desconhecido, tipo, data, enum, `friendly`/`shootout` legados).
- `tests/factories/competition.ts`: `buildValidCompetition()`, `withTeam()`, `withMatch()`, `withEvent()`, `withSemifinalists()`, `withFinalists()`, `withDrawOrder()`.
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
npx playwright install --with-deps chromium firefox webkit
npm run test:e2e
```

Ou, após o setup:

```bash
npm run verify
```

- `npm run verify` não instala navegadores; rode o `npx playwright install --with-deps chromium firefox webkit` uma vez.
- O CI executa os passos na ordem acima.
- `npm run test:build` exige `dist/` atualizado; `npm run test:e2e` constrói `dist-test/` a partir da fixture e não altera `dist/`.
- O smoke cross-browser (`compatibility.spec.ts`) roda em `desktop-firefox` localmente e, no CI (ou com `PLAYWRIGHT_WEBKIT=1`), também em `desktop-webkit` e `mobile-webkit`; os demais testes de UI rodam nas duas viewports Chromium.

---

## 14. Rastreabilidade

### 14.1 Requisitos funcionais do PRD

| FR | Prioridade | Onde na SPEC | Verificação | Status |
|---|---|---|---|---|
| FR-01 | Obrigatório | §5, §6, §9 | Schema único + build + varredura de dados hardcoded | MVP |
| FR-02 | Obrigatório | §8, §12 | Fixtures inválidas; build falha; job summary | MVP |
| FR-03 | Obrigatório | §5.6, §6, §10.6 | Testes de elenco + páginas de times | MVP |
| FR-04 | Obrigatório | §6, §7.8, §10.4 | Testes de calendário + lista/detalhe das 8 partidas | MVP |
| FR-05 | Obrigatório | §7.1, §7.9, §10.4 | Testes de eventos + detalhe | MVP |
| FR-06 | Obrigatório | §7.2, §7.3 | Testes de desempate | MVP |
| FR-07 | Obrigatório | §7.7, §10.8 | Testes de semifinal, final, snapshots e pódio | MVP |
| FR-08 | Obrigatório | §7.6, §10.7 | Testes de estatísticas das 8 partidas | MVP |
| FR-09 | Desejável | §10.3 | E2E dos cinco estados | MVP (desejável) |
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
| Fase final | ALG-007, VAL-016/017, SPEC-018/019, UI-FINAL (semifinal, final, vantagem e pódio de 3). |
| Remoção do amistoso/shootout | SPEC-016 (obsoleto), VAL-002, §5.4/§7.12, ausência na UI. |
| Elenco flexível | §5.6, VAL-020, UI-TEAM-03. |
| Suspensão | ALG-005, VAL-023, UI-TEAM-02. |
| Correções | ALG-007, VAL-017, notices. |
| Publicação e acesso | §12, workflow. |
| Interface | §10, §11, testes E2E. |

---

## 15. Emendas e interpretações

### 15.1 Emendas registradas

**Emendas vigentes da v2.0 (18/11/2026):**

| # | Tema | Decisão desta SPEC | Origem | Aplicação na v2.0 |
|---|---|---|---|---|
| 25 | Formato 2026 | 3 times, 6 jogos de grupo em turno e returno, **semifinal** e **final**: 8 partidas oficiais (`g1`…`g6`, `semi`, `final`). | PRD v2.0 §7.1/§7.8; `docs/decisoes-v2.0.md`. | Schema, validação, rotas, calendário e testes. |
| 26 | Semifinal | 2º x 3º, partida única; o 2º é mandante e tem vantagem do empate; empate classifica o 2º; W.O. prevalece. | PRD v2.0 §7.1/§7.7. | `semifinalists`, ALG-001/007, UI e testes. |
| 27 | Final | 1º x vencedora da semifinal; o 1º é mandante e tem vantagem do empate; empate dá o título ao 1º; W.O. prevalece. | PRD v2.0 §7.1/§7.7. | `finalists`, ALG-001/007, UI e testes. |
| 28 | Empates | Não há prorrogação, pênaltis, shootout ou cobranças alternadas; o placar do tempo normal é o placar oficial. | PRD v2.0 §7.1/§7.7. | Remoção de `shootout`, validação, estatísticas e UI. |
| 29 | 3ª colocada | É a **perdedora da semifinal**; não há disputa de 3º lugar nem 4º lugar. | PRD v2.0 §7.1/§7.7. | ALG-007, pódio e UI. |
| 30 | Estatísticas coletivas | Agregam grupo + semifinal + final (8 partidas); empate no mata-mata conta como empate em V/E/D; sem `shootoutWins`/`shootoutLosses`. | PRD v2.0 §10.4/§10.5. | ALG-006, tipos, UI de times e testes. |
| 31 | Suspensão no chaveamento | O vermelho suspende a próxima partida real: 1º vai direto à final; 2º/3º cumprem na semi; vermelho na semi só vale na final se avançar; vermelho na final não tem efeito. | PRD v2.0 §7.5. | ALG-005, `VAL-023` e UI. |
| 32 | Snapshots e correções | `semifinalists`/`finalists` são snapshots validados; divergência após a respectiva partida bloqueia com antigos/novos e exige reconciliação/`notices`. | PRD v2.0 §7.7/§8.1. | Schema, ALG-007, `VAL-016/017` e testes. |
| 33 | Remoções | `friendly`, card de amistoso, `shootout` e colunas de pênaltis foram removidos; campos antigos geram `VAL-002` com mensagem de migração. | PRD v2.0 §6.2/§7.9/§8. | Schema, validação, UI, build e testes. |
| 34 | Interface da fase final | Rótulos “Semifinal” e “Final”; a final antes da semi mostra o 1º e “Vencedora da semifinal”; a vantagem do empate é sempre textual; “3ª colocada”. | PRD v2.0 §10.6; AGENTS v2.0. | §10.3/§10.8, componentes e E2E. |
| 35 | Tema claro/escuro | Claro como padrão; controle manual acessível; `localStorage["futsal-cup-theme"]` persiste a preferência por navegador; fallback claro se ausente/inválido/indisponível. Um script inline ≤1 KB gzip é a única exceção de JavaScript. | PRD v2.1 §6/§8/§9; `docs/decisoes-v2.1.md`. | PRD, AGENTS, tokens, BaseLayout, cabeçalho, orçamento, testes de contraste/E2E. |
| 36 | Impressão e PDF | A4 retrato pelo navegador, tema claro, tabelas sem corte e guia nativo `<details>`; sem botão ou JavaScript novo. | PRD v2.2; `docs/decisoes-v2.3.md`. | PRD, AGENTS, SPEC §11.11, tokens, folha de impressão, guia e testes. |

As emendas 1–24 foram as decisões históricas da v1.1 e permanecem registradas em `docs/decisoes-v1.1.md`, que não é normativo. Quando qualquer uma delas conflitar com a v2.0 (por exemplo, final única, amistoso ou shootout), prevalecem as emendas 25–34 e a v2.0. Para tema e JavaScript de cliente, prevalece a emenda 35 e os documentos v2.1. Para impressão/PDF, prevalece a emenda 36 e os documentos v2.3; o limite de JavaScript continua sendo o da emenda 35.

### 15.2 Alinhamento v2.0 (histórico)

O alinhamento abaixo foi aplicado nesta entrega. A aprovação formal do PRD (§18) está registrada no próprio PRD; o commit `docs` é o registro final e só deve ser declarado concluído depois de existir.

**PRD.md v2.0**

- [x] §1/§3.1/§7.1: 3 times, 6 partidas de grupo em turno e returno, semifinal 2º x 3º e final 1º x vencedora; 8 partidas oficiais.
- [x] §7.1/§7.7: vantagem do empate para o 2º na semifinal e para o 1º na final; sem prorrogação, pênaltis ou shootout; 3ª colocada é a perdedora da semifinal.
- [x] §7.5: suspensão considera o caminho do time no chaveamento, incluindo o 1º colocado sem semifinal.
- [x] §7.7/§8.1: `semifinalists` e `finalists` como snapshots validados; correções após semifinal/final bloqueiam com antigos/novos.
- [x] §7.8: calendário com semifinal e final em 03/12.
- [x] §7.9/§10.6: remover o amistoso e o card informativo; exibir semifinal/final com vantagem textual e 3ª colocada.
- [x] §10.4/§10.5: estatísticas coletivas das 8 partidas, empate no mata-mata como empate, sem colunas de pênaltis.
- [x] §8/§12: validação e critérios de aceite para snapshots, vantagem, W.O. no mata-mata, remoção de amistoso/shootout e pódio de 3.

**AGENTS.md v2.0**

- [x] §Visão geral, §Formato e §Calendário: 8 partidas, semifinal, final, vantagem do empate e 3ª colocada.
- [x] §Regras da competição: chaveamento, snapshots, W.O. no mata-mata e suspensão pelo caminho real.
- [x] §Validação: remoção de `VAL-025`/`VAL-030`/`VAL-033`, snapshots e migração de `friendly`/`shootout`.
- [x] §Design e §Testes: rótulos “Semifinal”/“Final”, vantagem textual, 3ª colocada, ausência de amistoso/shootout e card da final antes da semi.

**README.md, PLAN.md e TASKS.md**

- [x] Visão geral, comandos, estrutura de dados e checklist refletem a v2.0.

**docs/decisoes-v2.0.md**

- [x] Registro histórico das decisões da v2.0, com rastreabilidade e pendências.

**Commit**

- [ ] Commits `docs(prd)`, `docs(agents)`, `docs(spec)` e `docs:` da v2.0 criados após a revisão final. Não declarar concluído antes de o commit existir.

### 15.3 Alinhamento v2.1 — tema

- [x] `PRD.md` v2.1 define o tema claro por padrão, alternância acessível e persistência local com fallback.
- [x] `AGENTS.md` v2.1 limita JavaScript no cliente ao script inline/local do tema e define tokens/contraste para os dois temas.
- [x] `docs/decisoes-v2.1.md` registra o uso namespaced de `localStorage["futsal-cup-theme"]`, limites de privacidade e a ausência de sincronização.
- [x] `BaseLayout.astro` inicializa a preferência antes do CSS; controle do cabeçalho alterna o tema sem framework ou rede.
- [x] Testes validam tokens/contraste, orçamento do script, fallback de armazenamento, teclado, persistência entre rotas e axe nos dois temas.
- [x] Impressão força o tema claro.
- [x] Impressão A4 retrato, tabela sem corte, guia nativo e testes E2E registrados na v2.3.

### 15.4 Conflitos resolvidos

| Conflito | Resolução |
|---|---|
| PRD §10.5 diz “excluindo pênaltis” | Interpretado como “excluindo a disputa de pênaltis”; pênalti do tempo normal conta. Emenda 1. |
| PRD §6.1/§10.7 incluem Regulamento; briefing adia FR-10 | FR-10 ADIADO; sem rota/link/placeholder. Emenda 5. |
| AGENTS permite importar `airbnb-design-tokens.css`; teste proíbe nomes de fontes/marca no `dist/` | Não importar integralmente; estender com tokens do projeto. Emenda 15. |
| PRD §7.2 fala em sinalizar <7; briefing cria badge <5 | Badge público <5; aviso de build <7; 10ª bloqueada. Emenda 4 e atualização do limite do elenco. |
| PRD §7.8 não define W.O.; briefing define 3x0 | W.O. 3x0 administrativo, manual. Emenda 6. |
| PRD §11.5 “alerta e exige confirmação” sem mecanismo | `finalists` divergente bloqueia o build; atualizar `finalists` é a confirmação. Emenda 8. |
| PRD v1.0/AGENTS v1.0 descreviam 4 times, 8 partidas e disputa de 3º lugar | PRD v1.1 e AGENTS v1.1 foram atualizados: 3 times, 7 partidas e pódio de 3. Emendas 18, 21. |
| PRD v1.0 não tinha amistoso nem confronto direto de dois jogos | PRD v1.1 e AGENTS v1.1 incorporaram o `friendly` informativo e o confronto direto agregado dos dois jogos; emendas 19 e 20. O `friendly` foi removido na v2.0. |
| PRD v1.1/AGENTS v1.1 previam 7 partidas, final direta 1º x 2º, amistoso e shootout | A v2.0 adota 8 partidas, semifinal 2º x 3º, final 1º x vencedora, vantagem do empate, 3ª colocada como perdedora da semifinal e remoção de `friendly`/`shootout`. Emendas 25–34. |
| PRD v1.1 definia a 3ª colocada pela classificação do grupo | A v2.0 define a 3ª colocada como perdedora da semifinal; a classificação do grupo define apenas semifinalistas e finalistas. Emenda 29. |

### 15.5 Regra de manutenção

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
| Empate no mata-mata confundido com shootout | Médio | Texto explícito de vantagem do empate; ausência de `shootout`; testes de UI e de build. |
| Erro de lançamento de dados | Alto | Schema estrito, validação agregada, fixtures, revisão antes do commit. |
| Interpretação errada do desempate | Alto | Algoritmo por grupos, exemplos trabalhados e matriz de testes. |
| Correção após a semifinal/final mudar snapshots | Alto | `semifinalists`/`finalists` validados; build falha com antigos/novos; `notices` para o público. |
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

- 3 times, 8 partidas oficiais (6 de grupo + semifinal + final) e o calendário de 24/11, 26/11, 01/12 e 03/12.
- A semifinal é 2º x 3º e a final é 1º x vencedora da semifinal; ambos os mandantes têm vantagem do empate.
- Nomes, horários e local exato são dados operacionais; a UI tem fallback.
- O site é somente leitura; a edição é via Git.
- O mapeamento de IDs é privado e fora do repositório.
- W.O. é registrado manualmente; o site não detecta jogadoras em quadra.
- A classificação é provisória enquanto houver partida de grupo não encerrada.
- O build usa Node 26 e o lockfile; versões diferentes podem alterar ICU/formatação, mas não a lógica pura.
- O Pages será habilitado manualmente uma vez.

### 16.3 Limitações documentadas

- Gols ocorridos antes de uma interrupção de W.O. não são registrados no MVP.
- Não há prorrogação, pênaltis, shootout ou cobranças alternadas; empates encerram no tempo normal e são resolvidos pela vantagem do empate no mata-mata.
- Não há placar ao vivo, cronômetro, faltas, escalação ou presença.
- Não há histórico de edições anteriores nem comparação entre edições.
- Não há área administrativa, login ou edição no site.
- Não há analytics, geração de PDF no servidor ou numeração de páginas; impressão/PDF ocorre pelo navegador.
- Não há detecção automática de W.O. ou de quantidade de jogadoras em quadra.
- A retirada de um time não é automatizada: a organização registra um W.O. `withdrawal` em cada partida restante e mantém o elenco/histórico como estão.
- Não há partida de 3º lugar nem 4º lugar; a 3ª colocada é a perdedora da semifinal.
- Não há imagens de jogadoras.
- O site não substitui a organização/arbitragem.

### 16.4 Questões em aberto (não bloqueantes)

Estas são **dados operacionais**, não decisões de spec:

- Nomes definitivos dos times.
- Horários exatos das partidas, incluindo os dois jogos do mesmo time em 24/11, 26/11 e 01/12 e os horários da semifinal e da final.
- Local/quadra exata a exibir.
- Critério de assistência em casos duvidosos (decisão da organização).
- Como acomodar novas alunas quando todos os times estiverem com 8 (decisão da organização; o site bloqueia a 10ª ativa).
- Data de habilitação do Pages.

Nenhuma questão bloqueia a implementação. A UI tem fallback para horário/local; os nomes vêm da fonte; a 10ª ativa é bloqueada.

### 16.5 Decisões que NÃO ficam em aberto

- Stack, schema, rotas, algoritmos, validação, tokens, testes, CI e deploy estão fechados nesta SPEC.
- FR-10 está adiado; FR-20 é futuro.
- W.O. é 3x0.
- Badge público é <5; aviso de build é <7.
- `semifinalists` e `finalists` são snapshots validados; a ordem define mando e vantagem.
- `drawOrder` é obrigatório apenas quando o sorteio é necessário.
- O formato é 3 times, 6 jogos de grupo em turno e returno, semifinal 2º x 3º e final 1º x vencedora; não há 3º x 4º.
- O pódio tem 3 posições; a 3ª é a perdedora da semifinal; não há 4º lugar.
- O confronto direto usa os dois jogos e só vale com ambos `finished`.
- Empate no mata-mata é resolvido pela vantagem do mandante; não há shootout.
- A retirada de time é W.O. manual por partida.
- Não há JS de cliente além do script mínimo de tema especificado na §10.2.

---

## 17. Definição de pronto

### 17.1 Esta entrega (SPEC)

- [x] `SPEC.md` na raiz, em pt-BR.
- [x] Todos os blocos previstos da SPEC (1–17 + Apêndices A–G).
- [x] Schema YAML completo e consistente.
- [x] Algoritmos determinísticos de placar, desempate, cartões, suspensão, estatísticas, W.O., vantagem do empate e pódio.
- [x] Catálogo de validação com bloqueantes e avisos.
- [x] Catálogo de páginas/estados, incluindo os cinco estados da Início.
- [x] Rotas sem Regulamento e sem amistoso.
- [x] Tokens, contraste, foco, teclado e 320px com critérios verificáveis.
- [x] Build/CI/deploy com comandos npm reais.
- [x] Matriz de testes por regra e rastreabilidade FR-01..FR-21, incluindo TST-116 (simetria dos confrontos) e TST-117..TST-120 (semifinal, vantagem do empate, W.O. no mata-mata e 3ª colocada).
- [x] Nenhuma questão bloqueante em aberto; apenas dados operacionais.
- [x] Emendas registradas e alinhamento do PRD v2.0/AGENTS v2.0 aplicado.
- [x] `PRD.md`, `AGENTS.md`, `docs/decisoes-v2.0.md`, `PLAN.md` e `TASKS.md` alinhados nesta entrega.

### 17.2 Implementação do MVP

- [ ] `data/2026/copa.yaml` válido, com 3 times, 8 partidas e elencos.
- [ ] `npm ci` funciona em ambiente limpo.
- [ ] `npm run validate` passa sem erros; avisos revisados.
- [ ] `npm run check` passa.
- [ ] `npm test` passa.
- [ ] `npm run build` gera `dist/` com todas as rotas.
- [ ] `npm run test:build` passa (script inline de tema ≤1 KB gzip, sem JS externo, CSS <30 KB gzip, termos proibidos, rotas, 404).
- [ ] `npm run test:e2e` passa (axe, teclado, 320px, meta tags, 404).
- [ ] `dist/404.html` existe e funciona.
- [ ] `/regulamento/` não existe e não aparece em links.
- [x] Impressão A4 retrato em tema claro; tabelas sem corte; guia de impressão/PDF sem JavaScript adicional.
- [ ] 6 páginas na nav; menu mobile `<details>` funcional.
- [ ] Início nos cinco estados, sem contagem regressiva.
- [ ] Jogos agrupados por data; 8 partidas oficiais; sem card ou rota de 3º lugar.
- [ ] Detalhe com placar, eventos, W.O. e desfalques; sem shootout.
- [ ] Classificação com 13 colunas, 3 linhas, provisória, sorteio e critérios.
- [ ] Times com elenco ativo, badge <5, suspensão e histórico.
- [ ] Estatísticas com artilharia, assistências, cartões e gols contra das 8 partidas.
- [ ] Fase final com semifinal, final, vantagem do empate textual e pódio de 3 sem 4º lugar.
- [ ] Metadados, canonical, OG sem imagem, favicon e 404.
- [ ] Tema claro padrão, alternância clara/escura acessível e persistência local entre rotas/recarregamentos.
- [ ] Nenhum nome da instituição/Airbnb, fonte proprietária, foto ou dado pessoal.
- [ ] CI/publicação no GitHub Pages funcionando; site anterior preservado em falha.
- [ ] Checklist manual do Apêndice D assinado.
- [ ] Commit `docs` com PRD/AGENTS/README alinhados e mensagem Conventional Commits.

### 17.3 Critérios de aceite finais

1. A mesma fonte produz sempre a mesma classificação e estatísticas.
2. Nenhum placar/classificação/estatística é editado manualmente.
3. Nenhum evento referencia jogadora fora do elenco ou suspensa indevidamente.
4. Nenhuma 10ª ativa, apelido duplicado, jogadora em dois times ou transferência após atuação.
5. Nenhuma semifinal sem `semifinalists` válido e nenhuma final sem `finalists` válido; correção bloqueia até confirmação. Não há partida de 3º lugar.
6. Nenhuma rota/link/placeholder de Regulamento, amistoso ou 3º lugar.
7. Nenhum JS externo ou uso de JavaScript além da alternância/persistência de tema; nenhuma fonte externa, imagem de pessoa ou analytics.
8. Nenhum texto público com instituição, Airbnb ou dado pessoal.
9. WCAG 2.2 AA verificado; 320px sem overflow da página.
10. Empate no mata-mata é comunicado com a vantagem do empate; não há shootout, prorrogação ou pênaltis.
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
    homeTeamId: "tc"
    awayTeamId: "ta"
    date: "2026-11-24"
    startsAt: "2026-11-24T20:30:00-03:00"
    venue: "Vila Mariana, São Paulo"
    status: "finished"
    walkover: null
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

  - id: "g3"
    stage: "group"
    round: 2
    homeTeamId: "tb"
    awayTeamId: "tc"
    date: "2026-11-26"
    startsAt: "2026-11-26T19:00:00-03:00"
    venue: "Vila Mariana, São Paulo"
    status: "finished"
    walkover:
      winnerTeamId: "tc"
      reason: "no_show"
      note: "TB não compareceu."
    events: []
    # W.O. 0x1 para TC na ordem mandante/visitante; sem gols ou assistências.

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
    homeTeamId: "ta"
    awayTeamId: "tc"
    date: "2026-12-01"
    startsAt: "2026-12-01T19:00:00-03:00"
    venue: "Vila Mariana, São Paulo"
    status: "finished"
    walkover: null
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
        # 2º amarelo -> vermelho derivado; p-016 suspensa em g6.

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
        # Vermelho direto; TB é 3ª e cumpre a suspensão na semifinal.

  - id: "semi"
    stage: "semi"
    round: null
    date: "2026-12-03"
    startsAt: "2026-12-03T19:00:00-03:00"
    venue: "Vila Mariana, São Paulo"
    status: "finished"
    walkover: null
    events:
      - type: "goal"
        playerId: "p-004"
        assistPlayerId: "p-002"
        minute: 12
        penalty: false
      - type: "goal"
        playerId: "p-012"
        assistPlayerId: "p-013"
        minute: 18
        penalty: false
      - type: "goal"
        playerId: "p-013"
        assistPlayerId: "p-012"
        minute: 26
        penalty: false
    # TA (2ª) x TB (3ª), 1x2. p-014 (TB) está suspensa e não tem eventos.

  - id: "final"
    stage: "final"
    round: null
    date: "2026-12-03"
    startsAt: "2026-12-03T20:30:00-03:00"
    venue: "Vila Mariana, São Paulo"
    status: "finished"
    walkover: null
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
        playerId: "p-012"
        assistPlayerId: null
        minute: 17
        penalty: false
      - type: "yellow"
        playerId: "p-006"
        minute: 21
      # 1x1 no tempo normal; TC é campeã pela vantagem do empate.

semifinalists: ["ta", "tb"]
finalists: ["tc", "tb"]

drawOrder: null

notices: []
```

**Conferência do exemplo:**

- Grupo: TC 7 pts, 5 gols pró, 3 contra, saldo +2; TA 7 pts, 4 pró, 4 contra, saldo 0; TB 2 pts, 2 pró, 4 contra, saldo −2.
- TC e TA empatam em pontos. O confronto direto soma os dois jogos: g2 TC 3x1 TA e g5 TA 1x0 TC. Pontos 3–3; saldo agregado TC 3x2, então TC é 1ª e TA é 2ª. TB é 3ª.
- `semifinalists: ["ta", "tb"]`: semifinal TA x TB, com TA como mandante e vantagem do empate. TA terminou em 2º e TB em 3º.
- A semifinal terminou 1x2 para TB. `finalists: ["tc", "tb"]`: final TC x TB, com TC como mandante e vantagem do empate. A 3ª colocada é TA, perdedora da semifinal; **não há 4º lugar**.
- g3 é W.O. 0x1 para TC na ordem mandante/visitante, sem gols/assistências; conta pontos, vitória, gols pró/contra e saldo.
- p-016 (TC) recebe o 2º amarelo em g5 e cumpre suspensão em g6; não tem eventos em g6.
- p-014 (TB) recebe vermelho direto em g6; como TB é 3ª e disputa a semifinal, a suspensão é cumprida na `semi`, onde p-014 não tem eventos.
- A final terminou 1x1 no tempo normal. TC é campeã pela vantagem do empate; TB é vice-campeã e TA é 3ª colocada. Não há shootout, prorrogação ou pênaltis.
- Gols, assistências e cartões da semifinal e da final entram nas estatísticas individuais e coletivas; a classificação considera apenas as 6 partidas de grupo.
- p-007 (TA) saiu em 25/11 e tem assistência em g1; aparece como “fora do elenco ativo”.
- O exemplo não usa `drawOrder`; nenhum empate chegou ao sorteio.

---

## Apêndice B — Como atualizar a Copa

Receitas operacionais. Sempre rode `npm run validate` antes de commitar. A edição é feita apenas na fonte; não há admin.

### B.1 Antes da primeira partida

1. Preencher `edition`, `timezone`, 3 times, elencos e 8 partidas oficiais (g1…g6 + `semi` + `final`).
2. `date` obrigatória; `startsAt` pode ser `null`; `venue` pode ser `null` nas partidas.
3. `status: "scheduled"`, `walkover: null`, `events: []`.
4. `semifinalists: null`, `finalists: null`, `drawOrder: null`, `notices: []`.
5. Rodar `npm run validate`, `npm test`, `npm run build`.
6. Publicar. A Início deve mostrar o estado “Antes da copa”.

### B.2 Adicionar jogadora

1. Confirmar que o time tem menos de 9 ativas.
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
4. `npm run validate`; a validação confirma que nunca houve mais de 9 ativas simultâneas.

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
3. `events: []` para `no_show`.
4. Para `insufficient_players`/`withdrawal`, permitir apenas cartões (`yellow`/`red`), nunca `goal`/`ownGoal`.
5. O placar exibido será 3x0 para o vencedor; não criar gol fictício.
6. W.O. é permitido na fase classificatória, na semifinal e na final; prevalece sobre a vantagem do empate.
7. `npm run validate` e commit.

### B.6 Registrar semifinal e final

1. Confirmar que as 6 partidas de grupo estão `finished`.
2. Rodar `npm run validate`; a validação aponta os semifinalistas esperados.
3. Preencher `semifinalists` exatamente com `[2º, 3º]`; a ordem define mando e vantagem do empate para o 2º.
4. Registrar a `semi` com `stage: "semi"`, `round: null`, sem `homeTeamId`/`awayTeamId`, e os eventos normalmente. A `semi` usa `semifinalists`.
5. Quando a semifinal terminar, rodar `npm run validate`; a validação aponta os finalistas esperados.
6. Preencher `finalists` exatamente com `[1º, vencedora da semifinal]`; a ordem define mando e vantagem do empate para o 1º. A vencedora considera W.O. e, em empate, a vantagem do 2º.
7. Registrar a `final` com `stage: "final"`, `round: null`, sem `homeTeamId`/`awayTeamId`, e os eventos normalmente.
8. Empate encerra no tempo normal: **não** preencher shootout, prorrogação ou pênaltis. Na semifinal avança o 2º; na final vence o 1º.
9. A 3ª colocada é a perdedora da semifinal; não criar partida de 3º x 4º nem campo de 4º lugar.
10. `npm run validate` e commit.

### B.7 Corrigir resultado

1. Editar os eventos da partida.
2. Rodar `npm run validate`.
3. Se a classificação mudar e `semifinalists` já estiver preenchido, o build falha listando antigos/novos.
4. Atualizar `semifinalists` para confirmar e reconciliar o resultado/eventos da semifinal. Se a semifinal já ocorreu, revisar também `finalists` e a final.
5. Se a correção após a final mudar os finalistas ou o pódio, o build falha até `finalists` ser atualizado; adicionar um `notice` explicando a correção.
6. Se a correção alterar um empate que dependia de sorteio, revisar `drawOrder` (ver B.9) e registrar `notice`.
7. `npm run validate`, `npm test`, `npm run build`.

```yaml
notices:
  - date: "2026-12-03"
    message: "Resultado da final corrigido após revisão da súmula."
```

### B.8 Adiar partida

1. Mudar `status` para `"postponed"`.
2. `startsAt: null` (ou manter um horário provisório, se desejado).
3. `events: []`, `walkover: null`.
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
- Criar `friendly`, `shootout`, prorrogação ou pênaltis; esses campos são proibidos com mensagem de migração.
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
| VAL-009 | “Elenco com {found} jogadoras ativas em {instante}; máximo permitido: 9. A 10ª ativa deve sair com leftAt ou ser registrada em outro time.” |
| VAL-010 | “Vínculo inválido de {playerId}: há evento em partida do time {timeAntigo}, mas a jogadora está no time {timeAtual}. Jogadora que já atuou não pode trocar de time.” |
| VAL-011 | “Conjunto de partidas inválido: esperado g1..g6, semi e final; encontrado {found}. Verifique stage/round/ID.” |
| VAL-012 | “Confronto de grupo inválido em {path}: esperado {expected}; encontrado {found}. O turno e returno têm seis confrontos definidos.” |
| VAL-013 | “Data/hora inválida em {path}: esperado {expected}; encontrado {found}. Use data real e startsAt com fuso; a data local em America/Sao_Paulo deve ser igual a date.” |
| VAL-014 | “Status {found} incompatível: finished exige startsAt; scheduled/postponed não podem ter eventos nem walkover.” |
| VAL-015 | “Ordem de partidas inválida para {time}: {found}. A ordem canônica é g1, g2, g3, g4, g5, g6, semi e final; nas datas com dois jogos do mesmo time, os horários devem respeitar essa ordem.” |
| VAL-016 | “Fase final inválida: {found}. As 6 partidas de grupo devem estar finished antes da semifinal, e a semifinal antes da final.” |
| VAL-017 | “Snapshots do mata-mata divergentes. Semifinalistas antigos: {oldSemi}; novos: {newSemi}. Finalistas antigos: {oldFinal}; novos: {newFinal}. Atualize semifinalists/finalists para confirmar a correção.” |
| VAL-018 | “Sorteio necessário, mas drawOrder está {found}. Registre uma permutação dos 3 times ou resolva o empate.” |
| VAL-019 | “Evento em {path} referencia {playerId}, que não está no elenco de {home} nem de {away} na partida {matchId}.” |
| VAL-020 | “Jogadora {playerId} inelegível em {matchId}: joinedAt {joinedAt}, startsAt {startsAt}, leftAt {leftAt}. Esperado joinedAt < startsAt < leftAt (ou leftAt nulo).” |
| VAL-021 | “Assistência inválida em {path}: esperado jogadora do time da marcadora, diferente dela, apenas em gol normal; encontrado {found}.” |
| VAL-022 | “Cartões inválidos para {playerId} em {matchId}: encontrado {found}. Máximo de 2 amarelos por partida; o 2º amarelo é vermelho derivado; não registrar red explícito com 2 amarelos.” |
| VAL-023 | “{playerId} ({team}) está suspensa por {reason} em {sentOffIn} e não pode ter eventos em {suspendedFor}.” |
| VAL-024 | “W.O. inválido em {matchId}: {found}. Esperado partida finished, vencedor participante, motivo válido e sem gols/assistências.” |
| VAL-026 | “Campo de placar/classificação materializado em {path}: {found}. Placar, pontos e classificação são derivados; remova o campo.” |
| VAL-027 | “Partida {matchId} não pode ter homeTeamId/awayTeamId nem round diferente de null; os times vêm de semifinalists/finalists.” |
| VAL-028 | “Referência inexistente em {path}: {found}. Verifique times, jogadoras, partidas e notices.” |
| VAL-029 | “Eventos incompatíveis com W.O. em {matchId}: {found}. no_show não tem eventos; insufficient_players/withdrawal só permitem cartões.” |
| VAL-031 | “Notice inválido em {path}: esperado data real e mensagem de 1 a 300 caracteres; encontrado {found}.” |
| VAL-032 | “Campo de privacidade proibido em {path}: {found}. Permitido apenas id, nickname, position, joinedAt e leftAt.” |
| VAL-W01 | “Aviso: time {time} tem {n} jogadoras ativas; o alvo é 7 a 9. A publicação não é bloqueada.” |
| VAL-W02 | “Aviso: partida {matchId} está em {date}, fora do calendário original. Confirme o adiamento.” |
| VAL-W03 | “Aviso: os times {a} e {b} têm o mesmo nome público após normalização; confirme o nome de exibição.” |
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
- [ ] A vantagem do empate é lida por extenso (“Em caso de empate, avança/vence o mandante”), não apenas por cor ou posição.
- [ ] “Sorteio”, “Suspensa”, “W.O.”, “Resultado pendente” e “Elenco em formação” são lidos como texto.
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

> O smoke automatizado (`tests/e2e/compatibility.spec.ts`) cobre carregamento, menu móvel, skip link e tabela larga em Firefox e WebKit. A inspeção visual, os dispositivos reais e o Lighthouse continuam manuais.

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
- [ ] Avisos usam apelidos/descrições genéricas, sem nome completo ou dado pessoal.
- [ ] Nenhum ID de jogadora no HTML/URL.
- [ ] Nenhum analytics/cookie/terceiros.
- [ ] 404 funciona e volta para a Início.
- [ ] Nenhum link/rota de Regulamento, amistoso ou 3º lugar.
- [ ] A 3ª colocada aparece como “3ª colocada”, sem 4º lugar e sem card de disputa de 3º lugar.

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
| TST-015 | FR-06 | W.O. na classificação | g2 W.O. 3x0 | Pontos/gols/saldo como 3x0 | U |
| TST-016 | FR-06 | Mata-mata fora da classificação | Gols/cartões na semifinal e na final | Classificação inalterada | U |
| TST-105 | FR-06/VAL-018 | Empate total provisório | Grupo incompleto, empate total, `drawOrder: null` | Ordem fixa ta…tc; sem erro/badge | U |
| TST-110 | FR-06 | H2H agregado com W.O. | Dois jogos, um deles W.O. 3x0 | W.O. conta como 3x0 no agregado | U |

### E.2 Cartões e suspensão

| TST | Regra/FR | Cenário | Ação/fixture | Esperado | Tipo |
|---|---|---|---|---|---|
| TST-017 | FR-13 | Amarelo/vermelho | 1 yellow; 1 red | 1 e 3 pontos | U |
| TST-018 | FR-13 | 1 amarelo + vermelho direto | Mesma jogadora/partida | 4 pontos | U |
| TST-019 | FR-13 | Dois amarelos | 2 yellow, sem red | 3 pontos; red derivado=1 | U |
| TST-020 | VAL-022 | Terceiro amarelo no mesmo jogo | 3 yellow na mesma partida | Erro bloqueante | D |
| TST-021 | VAL-022 | Red explícito com 2 amarelos | 2 yellow + red | Erro bloqueante | D |
| TST-022 | FR-13 | Suspensão próxima partida | Red em g1; g2 do time | Suspensa em g2 | U |
| TST-023 | FR-13 | Sem próxima partida | Red na final | `suspendedFor=null`; sem efeito | U |
| TST-024 | VAL-023 | Evento de suspensa | Red em g1; evento em g2 | Erro bloqueante | D/U |
| TST-025 | FR-13 | Sem acúmulo de amarelos | 1 yellow em jogos diferentes | Sem suspensão | U |
| TST-026 | FR-13 | Cartões na final | Yellow/red na final | Contam stats; não classificação | U |
| TST-027 | FR-13 | Cartões em W.O. | Cards em W.O. | Contam stats; `no_show` não tem | U/D |
| TST-112 | FR-13 | Suspensão no mesmo dia | Red em g3; time joga g4 na mesma data | Suspensa em g4, a próxima canônica | U |
| TST-121 | FR-13 | 1º colocado sem semifinal | Red no último jogo de grupo do 1º; finalists ainda nulo | `pendingFinalists=true`; quando a final é definida, cumpre na final | U |
| TST-122 | FR-13 | Vermelho na semifinal | Red na semi; time avança ou é eliminado | Cumpre na final só se avançar; eliminado não tem partida seguinte | U |
| TST-123 | FR-13 | 2º/3º com vermelho no grupo | Red no último jogo de grupo do 2º ou 3º | Cumpre na semifinal | U |

### E.3 Gols, assistências, pênaltis e estatísticas

| TST | Regra/FR | Cenário | Ação/fixture | Esperado | Tipo |
|---|---|---|---|---|---|
| TST-028 | FR-05 | Gol normal | 1 goal | Placar 1x0; artilharia +1 | U |
| TST-029 | FR-05 | Pênalti do tempo normal | goal penalty=true | Placar/artilharia +1 | U |
| TST-030 | FR-05 | Gol contra | ownGoal de TB em TA x TB | TA +1; ownGoals TB +1; goals TB 0 | U |
| TST-031 | FR-05 | Assistência válida | goal + assist mesmo time | Assistência +1 | U |
| TST-032 | VAL-021 | Assistência inválida | Mesma marcadora/outro time/pênalti/ownGoal | Erro bloqueante | D |
| TST-033 | FR-08 | Sem shootout nas estatísticas | Final 1x1, sem shootout | Gols normais contam; não há coluna/campo de shootout | U |
| TST-034 | FR-08 | Ordem da artilharia | Gols/assistências/nomes | Ordem normativa | U |
| TST-035 | FR-08 | Ordem de assistências | Assistências/gols/nomes | Ordem normativa | U |
| TST-036 | FR-08 | Ordem de cartões | Pontos/red/yellow/nomes | Ordem normativa | U |
| TST-037 | FR-08 | Gols contra | Seção separada | Fora da artilharia | U/E |
| TST-038 | FR-17 | Fora do elenco ativo | p-007 leftAt + assist | Marca textual “fora do elenco ativo” | U/E |
| TST-115 | FR-08 | Estatísticas coletivas das 8 partidas | Grupo + semi + final; empates no mata-mata | Ambas +1 empate em V/E/D; GP/GC/SG incluem as 8 partidas; sem `shootoutWins`/`shootoutLosses` | U |

### E.4 Elenco e elegibilidade

| TST | Regra/FR | Cenário | Ação/fixture | Esperado | Tipo |
|---|---|---|---|---|---|
| TST-039 | FR-03 | 7–9 ativas | Times com 7, 8 e 9 | Válido | D |
| TST-040 | FR-03/VAL-009 | 10ª ativa | Time com 10 simultâneas | Erro bloqueante | D |
| TST-041 | FR-03/VAL-W01 | Menos de 7 | Time com 6 | Aviso, exit 0 | D |
| TST-042 | FR-03 | Badge <5 | Time com 4 ativas | Badge público; 6 sem badge | E/M |
| TST-043 | VAL-007 | Apelido duplicado | “Ana” e “ana” no time | Erro; “Ana” e “Aná” válidos | D |
| TST-044 | VAL-006 | Jogadora em dois times | Mesmo p-001 em TA/TB | Erro bloqueante | D |
| TST-045 | FR-15 | leftAt preserva histórico | p-007 sai, tem assistência | Histórico mantido; não ocupa vaga | U/D |
| TST-046 | VAL-020 | Elegibilidade | joinedAt >= startsAt | Erro bloqueante | D |
| TST-047 | VAL-010 | Transferência após atuar | p-001 com evento em TA e agora em TB | Erro bloqueante | D |
| TST-048 | VAL-009 | Sobreposição >9 | 8 ativas + 2 joined antes de leftAt | Erro no instante | D |

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
| TST-058 | VAL-017 | Snapshots nulos com etapa incompleta | Grupo incompleto e semifinal incompleta | `semifinalists`/`finalists` nulos são válidos | D |
| TST-059 | VAL-017 | `finalists` divergente | Semifinal completa, snapshot errado | Erro com antigos/novos | D |
| TST-060 | VAL-016 | Mata-mata antes da etapa anterior | Final finished com grupo ou semifinal incompleta | Erro bloqueante | D |
| TST-061 | VAL-024/029 | W.O. inválido | no_show com gol/cartão; winner inválido | Erro bloqueante | D |
| TST-062 | VAL-017 | `semifinalists` divergente | Grupo completo, snapshot errado | Erro com antigos/novos | D |
| TST-063 | VAL-026 | Placar materializado | Campo `score` | Erro de schema | D |
| TST-064 | VAL-031 | Notice inválido | Data inválida/mensagem vazia | Erro bloqueante | D |
| TST-065 | VAL-027 | Semifinal/final com homeTeamId | Campo presente em `semi` ou `final` | Erro de schema | D |
| TST-107 | VAL-002 | Campos removidos | `friendly` ou `shootout` presentes | Erro de migração explícito | D |
| TST-109 | SPEC-017 | 3 times e 8 partidas | Fonte com 3 times e g1…g6 + semi + final | Válido; `td`/`terceiro` falham | D |
| TST-124 | VAL-017 | Semifinalistas obrigatórios | Grupo completo, `semifinalists: null` | Erro bloqueante | D |
| TST-125 | VAL-017 | Finalistas obrigatórios | Semifinal completa, `finalists: null` | Erro bloqueante | D |
| TST-126 | VAL-016 | Semifinal antes do grupo | `semi` finished, grupo incompleto | Erro bloqueante | D |
| TST-127 | VAL-017 | Correção após a final | `finalists` antigos ≠ novos | Erro com antigos/novos; exige `notices` | D |
| TST-128 | VAL-024 | W.O. no mata-mata | `semi`/`final` com W.O. para o visitante | Vencedor administrativo avança/vence | D/U |
| TST-116 | FR-06/VAL-012 | Simetria dos confrontos | g1…g6 com g4 `tb x ta` | Cada par tem um jogo em casa para cada time; g4 `ta x tb` falha | D/U |

### E.6 Interface e estados

| TST | Regra/FR | Cenário | Ação/fixture | Esperado | Tipo |
|---|---|---|---|---|---|
| TST-066 | FR-09 | Início antes da copa | Nenhum resultado, data anterior | Estado 1; classificação zerada | E |
| TST-067 | FR-09 | Início durante | Grupo incompleto | Próxima rodada, últimos, resumo | E |
| TST-068 | FR-09 | Início grupo completo | 6 finished | Card da semifinal 2º x 3º e card da final com 1º + “Vencedora da semifinal” | E |
| TST-069 | FR-09 | Início após final | 8 finished | Campeã + pódio de 3 | E |
| TST-070 | FR-04 | Próximo jogo/pendente | Scheduled vencida | “Resultado pendente”; não é próximo | U/E |
| TST-071 | FR-04 | Lista por data | 8 partidas oficiais | Grupos por data (4 datas); sem 3º lugar; sem amistoso | E |
| TST-072 | FR-05 | Ordem de eventos | Minutos 10, null, 10 | 10,10,null; empate por arquivo | U/E |
| TST-073 | FR-05 | W.O. na UI | g2 | “0 x 3 (W.O.)” na ordem mandante/visitante + motivo; sem gol | E |
| TST-074 | FR-05 | Empate no mata-mata na UI | Final/semi 1x1 | Placar “1 x 1” + texto de vantagem do empate; sem shootout | E |
| TST-075 | FR-06 | Tabela classificação | Página | 13 colunas; provisória; sorteio | E |
| TST-076 | FR-03/13 | Time | Página TA | Badge/suspensão/histórico | E |
| TST-077 | FR-08 | Estatísticas | Página | 5 seções; estados vazios | E |
| TST-078 | FR-07 | Fase final | 5 estados | Semifinal, final, vantagem do empate textual e pódio de 3 | E |
| TST-113 | FR-07 | Pódio de 3 | Final finished | Campeã, vice e 3ª; sem 4º lugar | U/E |
| TST-129 | FR-07 | Card da final antes da semi | Grupo completo, semi pendente | Mostra 1º colocado e “Vencedora da semifinal” | E |
| TST-130 | FR-07 | Card da semifinal | Grupo completo | Mostra 2º x 3º e vantagem do empate para o 2º | E |
| TST-131 | FR-07 | Título por vantagem | Final 1x1 | Texto explícito de campeã pela vantagem; sem pênaltis | E |
| TST-132 | FR-07 | Terceira colocada | Semifinal e final finished | “3ª colocada” é a perdedora da semi; sem 4º lugar | U/E |
| TST-079 | FR-10 | Sem Regulamento | Nav/rotas | 6 seções + 3 links de times no submenu; `/regulamento/` 404 | E/B |
| TST-080 | FR-11 | Menu mobile | 320px | `<details>` “Menu” por teclado; 3 links de times visíveis ao abrir | E |
| TST-081 | FR-19 | 404 | URL inexistente | 404.html + link Início | E/B |
| TST-082 | FR-19 | Meta/OG | Todas as rotas | title/description/canonical/OG; sem og:image | E/B |
| TST-083 | FR-12 | Rotas geradas | `dist/` | Todas as rotas e 404 | B |

### E.7 Build, segurança e determinismo

| TST | Regra/FR | Cenário | Ação/fixture | Esperado | Tipo |
|---|---|---|---|---|---|
| TST-084 | SPEC-003 | **Obsoleto na v2.1** | — | Zero JS foi substituído pelo TST-122 | — |
| TST-085 | SPEC-014 | Orçamento CSS | `dist/` | <30 KB gzip/página | B |
| TST-086 | FR-18 | Termos proibidos | `dist/` | Sem Sesc/Airbnb/Circular/fontes | B |
| TST-087 | AGENTS | Referências fora do build | `dist/` | Sem `airbnb-design-design.md`/tokens | B |
| TST-088 | FR-17 | IDs de jogadora | `dist/` | Nenhum `p-\d{3}` | B |
| TST-089 | FR-01 | Dados hardcoded | `src/` | Sem nomes/datas/resultados de times | B |
| TST-090 | FR-11/FR-21 | Contraste de tokens | Pares claros e escuros do §11.3 | Todos os usos permitidos passam nos dois temas | U |
| TST-122 | SPEC-003/014 | Limite e escopo do script | Todas as páginas de `dist/` | Exatamente um script inline de tema ≤1 KB gzip; nenhum arquivo JS externo | B |
| TST-123 | FR-21 | Tema padrão e controle | Sem preferência salva | Tema claro; botão acessível e não pressionado | E |
| TST-124 | FR-21 | Alternância de tema | Acionar botão | Tema/ícone/`aria-pressed` atualizados; preferência gravada | E |
| TST-125 | FR-21 | Persistência local | Navegar e recarregar | Tema salvo é restaurado sem flash | E |
| TST-126 | FR-21 | Armazenamento indisponível | `localStorage` lança erro | Claro como fallback e alternância funciona na página | E |
| TST-127 | FR-11/21 | Acessibilidade no tema escuro | Rotas principais | Sem violações serious/critical e contraste dos dois temas aprovado | A/U |
| TST-133 | FR-11 | Layout de impressão | Classificação, `media: print` | A4 retrato; controles ocultos; tabela sem overflow e dentro da largura imprimível | E |
| TST-134 | FR-11 | Tema impresso | Tela em tema escuro, `media: print` | `color-scheme: light`, fundo branco e texto escuro | E |
| TST-135 | FR-11 | Grids e tabelas no papel | Jogos/classificação, `media: print` | Cards em duas colunas; `thead` como `table-header-group`; linhas sem quebra interna | E/U |
| TST-136 | FR-11 | Guia de impressão | Rodapé, teclado | `<details>` acessível explica A4, opções do navegador e PDF; sem JS adicional | E |
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

1. Confirmar que o time tem menos de 9 jogadoras ativas e que o apelido é único no time.
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

ADRs registram decisões de arquitetura e o porquê. O status de cada uma é **Aceito** nesta SPEC v2.1; mudanças exigem nova ADR ou emenda na §15. As ADRs 015 e 016 foram reescritas na v2.0; o histórico da v1.1 permanece em `docs/decisoes-v1.1.md`.

### G.1 ADR-001 — Astro estático com JavaScript mínimo de cliente

- **Contexto:** site somente leitura, MPA e GitHub Pages. Tema claro/escuro exige guardar uma preferência local sem backend.
- **Decisão original (v2.0):** Astro `output: 'static'`, sem framework de UI, `client:*` ou `<script>`.
- **Emenda (v2.1):** permanece sem framework e hidratação; permite apenas um script inline de até 1 KB gzip para tema, com estado em `localStorage`, sem rede ou dados pessoais.
- **Consequências:** HTML pré-renderizado e deploy estático/cacheável; menu mobile com `<details>` nativo; a preferência é por navegador/dispositivo e não sincroniza.
- **Alternativas rejeitadas:** SPA/React (JS e hidratação desnecessários), Next export (runtime e complexidade), HTML escrito à mão (duplicação e validação frágil).
- **Rastreabilidade:** §4.1, §4.4, §10.2, §11.9, §12.2; SPEC-003, SPEC-014, emenda 35.

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
- **Consequências:** fonte única de verdade; recálculo a cada build; funções precisam ser testadas com entradas congeladas e ordem embaralhada; o custo é irrelevante para 8 partidas.
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
- **Decisão:** ordenar por grupos de pontos e aplicar os critérios em sequência, reaplicando o confronto direto quando o grupo chegar a exatamente dois. O confronto direto soma os pontos dos dois jogos; se empatar, usa o saldo agregado; só vale com ambos `finished`; W.O. conta 3x0. `drawOrder` só é exigido se o sorteio for alcançado.
- **Consequências:** algoritmo recursivo, não um único comparador; casos de 3+, de redução e de dois jogos precisam de testes dedicados; a ordem é determinística e a classificação é provisória enquanto houver jogo de grupo aberto.
- **Alternativas rejeitadas:** comparador único com h2h (errado para 3+), h2h entre todos os empatados (contraria o PRD), sorteio sempre (não determinístico).
- **Rastreabilidade:** §7.3; ALG-003, VAL-018, TST-003…TST-013.

### G.8 ADR-008 — `semifinalists` e `finalists` são snapshots validados

- **Contexto:** semifinal e final dependem da classificação e do resultado anterior, mas uma correção posterior pode mudar os participantes; o PRD exige alerta e confirmação.
- **Decisão:** `semifinalists` registra `[2º, 3º]` e `finalists` registra `[1º, vencedora da semifinal]`. O build compara cada snapshot com o esperado. Divergência bloqueia e lista antigos/novos. Atualizar o snapshot é a confirmação. A ordem define mando e vantagem; não há `thirdPlace`.
- **Consequências:** mudança de participante nunca é silenciosa; uma correção após a semifinal/final pode exigir atualização dos snapshots e um `notice`; o build falha até a confirmação.
- **Alternativas rejeitadas:** derivar participantes automaticamente (mudaria o passado), congelar os dados de grupo (impediria correções), confirmação só manual sem validação (erro silencioso).
- **Rastreabilidade:** §7.7; ALG-007, VAL-017, TST-058, TST-059, TST-062, TST-124…TST-127.

### G.9 ADR-009 — W.O. é 3x0 administrativo

- **Contexto:** o PRD/briefing fixam W.O. em 3x0; não há placar digitado e não se deve inventar gol.
- **Decisão:** `walkover` registra vencedor, motivo e nota; o placar derivado é 3x0; não há gols/assistências; cartões são permitidos apenas nos motivos `insufficient_players`/`withdrawal`; `no_show` não tem eventos. W.O. conta para classificação e não para artilharia.
- **Consequências:** UI mostra o placar 3x0 para o vencedor na ordem mandante/visitante, com “(W.O.)” e motivo; saldo de gols é afetado; a fonte não contém gol fictício; o caso é validado por `VAL-024`/`VAL-029`.
- **Alternativas rejeitadas:** 1x0 (placar administrativo anterior), registrar placar parcial (não confiável), não pontuar (quebraria a classificação).
- **Rastreabilidade:** §7.11; ALG-011, VAL-024, VAL-029, TST-061, TST-073.

### G.10 ADR-010 — Mapeamento de IDs privado, fora do repositório

- **Contexto:** privacidade exige apenas apelido/posição/time/estatísticas; o organizador ainda precisa saber quem é `p-XXX`.
- **Decisão:** IDs opacos e estáveis; o vínculo com o nome civil fica em mapa privado, fora do repositório e do build. O ID nunca é exibido nem reutilizado.
- **Consequências:** operação exige um procedimento à parte (Apêndice F); depuração de dados depende do mapa; o repositório público não contém dados pessoais.
- **Alternativas rejeitadas:** nome completo na fonte (viola privacidade), mapa criptografado dentro do repo (risco de vazamento e de histórico), UUID (mais longo, sem ganho).
- **Rastreabilidade:** §5.3, §11.10, Apêndice F; SPEC-007, TST-088.

### G.11 ADR-011 — Fonte do sistema e tema claro por padrão

- **Contexto:** `Airbnb Cereal` e `Circular` são proprietárias; fontes externas pesam e criam dependência de terceiros. A decisão de tema escuro foi adicionada na v2.1.
- **Decisão:** pilha de fontes do sistema, sem `@font-face` e sem download; tema claro como padrão e tokens de projeto para claro/escuro. Pesos 400–700 e escala fixa.
- **Consequências:** zero requisições de fonte e boa performance; a identidade visual depende de cor, espaço e tipografia; os dois temas passam pela mesma validação de contraste.
- **Alternativas rejeitadas:** auto-hospedar Cereal/Circular (licença), Google Fonts (terceiro), fonte aberta extra (peso e licença).
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
- **Consequências:** a navegação tem 6 seções, com um submenu de Times alimentado pela fonte de dados; `/regulamento/` não existe; PRD/AGENTS alinhados na v1.1; não há promessa pública de conteúdo futuro.
- **Alternativas rejeitadas:** página “em breve” (placeholder e escopo), link para PDF externo (não especificado), item oculto no rodapé (ainda é promessa).
- **Rastreabilidade:** §2.4, §10.1; SPEC-011, SPEC-012, TST-079.

### G.14 ADR-014 — Testes em camadas com matriz obrigatória

- **Contexto:** regras de competição têm alto risco de erro e a UI precisa de acessibilidade verificável; o tempo até a copa é curto.
- **Decisão:** funções puras testadas com Vitest; schema/validações com fixtures; `check-build` para `dist/`; Playwright + axe para E2E/acessibilidade; checklist manual para leitor de tela, zoom e navegadores. A matriz do Apêndice E é obrigatória.
- **Consequências:** feedback rápido na camada mais baixa; E2E mais lento e dependente de browser; sem meta de cobertura, mas todos os `TST-*` devem existir; bugs ganham teste na camada mais baixa possível.
- **Alternativas rejeitadas:** só E2E (lento e frágil), só unitários (não cobre layout/axe), snapshot visual (ruído e manutenção).
- **Rastreabilidade:** §13, Apêndice E; TST-001…TST-132.

### G.15 ADR-015 — Remoção do amistoso e do shootout na v2.0

- **Contexto:** a v1.1 previa um amistoso informativo e shootout na final. A v2.0 removeu ambos: o amistoso não faz parte da competição e empates no mata-mata são resolvidos pela vantagem do empate.
- **Decisão:** não existe `friendly`, `stage: friendly`, card informativo, `shootout` ou cobranças alternadas. Campos antigos são desconhecidos no schema estrito e geram `VAL-002` com mensagem de migração. A Fase final exibe apenas semifinal, final, vantagem textual e pódio.
- **Consequências:** o schema fica menor; não há rota, card ou estatística de amistoso/shootout; uma fonte v1.1 precisa ser migrada removendo esses campos; a UI e os testes verificam a ausência.
- **Alternativas rejeitadas:** manter `friendly` opcional (contaminaria a lista de partidas), manter `shootout` (contradiz a regra de empate), ignorar campos antigos silenciosamente (migração invisível).
- **Rastreabilidade:** §5.4, §7.12, §10.8; SPEC-016, DM-016, VAL-002, TST-107.

### G.16 ADR-016 — Formato de 3 times, semifinal e final na v2.0

- **Contexto:** a decisão de produto de 18/11/2026 substituiu o formato de 7 partidas por 8 partidas oficiais, com semifinal e final, mantendo 3 times e turno e returno no grupo.
- **Decisão:** fixar `ta`, `tb`, `tc`; 6 partidas `g1`…`g6`; semifinal `2º x 3º` com vantagem do empate para o 2º; final `1º x vencedora da semifinal` com vantagem do empate para o 1º; 3ª colocada é a perdedora da semifinal; sem 3º x 4º e sem 4º lugar.
- **Consequências:** schema com 3 times e 8 partidas; 8 rotas de jogo e 3 de time; pódio de 3; calendário com grupo em 24/11, 26/11 e 01/12, semifinal e final em 03/12; PRD/AGENTS atualizados na v2.0.
- **Alternativas rejeitadas:** manter final direta 1º x 2º (formato v1.1), turno único (menos jogos), partida de 3º lugar (contraria a decisão), prorrogação/pênaltis (contraria a regra de empate).
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
| ADR-008 | §7.7 | 8, 21, 25–34 |
| ADR-009 | §7.11 | 6 |
| ADR-010 | §5.3, §11.10, Apêndice F | — |
| ADR-011 | §11.4, §11.6 | 15 |
| ADR-012 | §12 | — |
| ADR-013 | §2.4, §10.1 | 5 |
| ADR-014 | §13, Apêndice E | — |
| ADR-015 | §7.12, §10.8 | 25–34 |
| ADR-016 | §2, §5.4, §7.7, §10 | 25–34 |

---

**Fim da SPEC.** Alterações nesta especificação exigem revisão da §15 e, quando afetarem produto, o alinhamento do PRD/AGENTS descrito na §15.2.
