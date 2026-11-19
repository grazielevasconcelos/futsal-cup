# Copa de Futsal Feminino Vila Mariana 2026

Site público, estático e somente leitura da Copa de Futsal Feminino Vila Mariana 2026.

A edição de 2026 tem **3 times**, **6 partidas na fase classificatória em turno e returno**, **1 semifinal** e **1 final**, totalizando **8 partidas oficiais**. A semifinal é **2º x 3º**, com **vantagem do empate para o 2º**; a final é **1º x vencedora da semifinal**, com **vantagem do empate para o 1º**. A **3ª colocada é a perdedora da semifinal**; não há disputa de 3º lugar, 4º lugar, amistoso, prorrogação, pênaltis ou shootout.

- **Site:** https://grazielevasconcelos.github.io/futsal-cup/
- **Publicação:** GitHub Pages
- **Idioma:** português do Brasil
- **Fuso horário:** America/Sao_Paulo
- **Privacidade:** apenas apelido, posição, time e estatísticas

## Stack

| Camada | Tecnologia |
|---|---|
| Site | Astro 7 (output estático) |
| Linguagem | TypeScript 6 |
| Dados | YAML validado com Zod 4 |
| Testes | Vitest 5, Playwright 1.65 e axe |
| Runtime | Node 26 e npm 11 |
| Deploy | GitHub Actions + GitHub Pages |

O MVP não usa JavaScript no cliente, backend, banco de dados, login ou área administrativa.

## Comandos

```bash
npm ci                              # instala o lockfile
npm run dev                         # servidor local
npm run validate                    # valida data/2026/copa.yaml
npm run check                       # astro check
npm test                            # testes unitários e de dados
npm run build                       # gera dist/
npm run preview                     # serve dist/
npm run build:test                  # build do E2E com a fixture concluída
npm run preview:test                # serve dist-test/ em localhost:4322
npm run test:build                  # varre dist/
npm run test:e2e                    # Playwright + axe sobre dist-test/
npm run verify                      # sequência completa
```

Na primeira execução do E2E, instale os três motores:

```bash
npx playwright install --with-deps chromium firefox webkit
```

O E2E usa a fixture de temporada concluída `tests/fixtures/valida.yaml`, constrói `dist-test/` e serve essa pasta na porta 4322. O build de produção em `dist/` não é alterado. A suíte completa roda em Chromium (desktop e mobile) e um smoke de compatibilidade em Firefox; no CI, o mesmo smoke roda também em WebKit (Safari desktop e iOS). Para rodar WebKit localmente, use `PLAYWRIGHT_WEBKIT=1` após instalar as dependências do sistema.

## Estrutura

```text
.
├── data/2026/copa.yaml        # fonte única de dados
├── scripts/                   # validação e checagens de build
├── src/
│   ├── components/            # componentes Astro
│   ├── layouts/               # layout global
│   ├── lib/                   # domínio, dados e formatação
│   ├── pages/                 # rotas estáticas
│   └── styles/                # tokens e estilos do projeto
├── tests/                     # unitários, dados, build e E2E
├── PRD.md                     # produto e regras
├── SPEC.md                    # especificação técnica
├── AGENTS.md                  # instruções para agentes
├── PLAN.md                    # plano de execução
└── TASKS.md                   # checklist de execução
```

## Fonte de dados

A fonte única de dados do MVP é `data/2026/copa.yaml`: edição, times, elencos, partidas (`g1`…`g6`, `semi`, `final`), eventos, `semifinalists`, `finalists`, `drawOrder` e avisos. O site não terá dados duplicados no HTML e não permitirá edição pelo navegador.

A fonte pública está no estado pré-competição: nomes dos times, elencos, horários e local ainda serão confirmados pela organização. Não há resultados fictícios publicados. A temporada concluída usada pelos testes fica em `tests/fixtures/valida.yaml` e não vai para o build de produção.

Antes de publicar, rode:

```bash
npm run validate
```

A validação bloqueia a publicação quando há erro de schema, confronto inválido, jogadora inelegível, evento de suspensa, W.O. inválido, campo de privacidade ou divergência de `semifinalists`/`finalists`. Campos antigos `friendly` e `shootout` geram erro de migração.

## Publicação

O GitHub Pages é habilitado uma única vez em **Settings → Pages → Source: GitHub Actions**.

1. Edite `data/2026/copa.yaml`.
2. Rode `npm run validate` e corrija os erros.
3. Faça commit em `main` seguindo Conventional Commits.
4. O GitHub Actions roda validação, testes, build e E2E; se tudo passar, publica no GitHub Pages.
5. Se a validação falhar, o site anterior permanece no ar.
6. Após o deploy, faça hard refresh (Ctrl+F5 / Cmd+Shift+R) se o HTML antigo estiver em cache.

### Rollback

Para desfazer uma publicação problemática, reverta o commit e envie para `main`:

```bash
git revert <commit>
git push origin main
```

O CI valida e republica a versão anterior. Não é necessário mexer no ambiente do Pages.

## Documentação

| Documento | Conteúdo |
|---|---|
| [`PRD.md`](PRD.md) | Produto, regras da competição e critérios de aceite. |
| [`SPEC.md`](SPEC.md) | Stack, schema, algoritmos, validação, UI, testes e deploy. |
| [`AGENTS.md`](AGENTS.md) | Restrições do repositório, design, acessibilidade e testes. |
| [`PLAN.md`](PLAN.md) | Plano de execução por fatias. |
| [`TASKS.md`](TASKS.md) | Checklist de implementação. |
| [`docs/decisoes-v2.0.md`](docs/decisoes-v2.0.md) | Registro das decisões da v2.0 (semifinal, vantagem do empate, 3ª colocada e remoções). |
| [`docs/decisoes-v1.1.md`](docs/decisoes-v1.1.md) | Registro histórico das decisões da v1.1. |

## Licença e referências

Este é um projeto da organização da copa. A referência visual em `airbnb-design-design.md` e `airbnb-design-tokens.css` é interna, não oficial e não implica afiliação com o Airbnb; ela não vai para o build.
