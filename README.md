# Copa de Futsal Feminino Vila Mariana 2026

Site público, estático e somente leitura da Copa de Futsal Feminino Vila Mariana 2026.

A edição de 2026 tem **3 times**, **6 partidas na fase classificatória em turno e returno** e **1 final**, totalizando **7 partidas oficiais**. No dia da final, a organização realiza um **amistoso do 3º colocado**, exibido apenas como card informativo e sem efeito competitivo.

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
npm run test:build                  # varre dist/
npm run test:e2e                    # Playwright + axe
npm run verify                      # sequência completa
```

Na primeira execução do E2E:

```bash
npx playwright install --with-deps chromium
```

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

A fonte única de dados do MVP é `data/2026/copa.yaml`: edição, times, elencos, partidas, eventos, finalistas, `drawOrder`, amistoso e avisos. O site não terá dados duplicados no HTML e não permitirá edição pelo navegador.

Antes de publicar, rode:

```bash
npm run validate
```

A validação bloqueia a publicação quando há erro de schema, confronto inválido, jogadora inelegível, evento de suspensa, W.O. ou shootout inválido, amistoso inválido, campo de privacidade ou divergência de finalistas.

## Publicação

1. Edite `data/2026/copa.yaml`.
2. Rode `npm run validate` e corrija os erros.
3. Faça commit em `main` seguindo Conventional Commits.
4. O GitHub Actions roda validação, testes, build e E2E; se tudo passar, publica no GitHub Pages.
5. Se a validação falhar, o site anterior permanece no ar.

## Documentação

| Documento | Conteúdo |
|---|---|
| [`PRD.md`](PRD.md) | Produto, regras da competição e critérios de aceite. |
| [`SPEC.md`](SPEC.md) | Stack, schema, algoritmos, validação, UI, testes e deploy. |
| [`AGENTS.md`](AGENTS.md) | Restrições do repositório, design, acessibilidade e testes. |
| [`PLAN.md`](PLAN.md) | Plano de execução por fatias. |
| [`TASKS.md`](TASKS.md) | Checklist de implementação. |
| [`docs/decisoes-v1.1.md`](docs/decisoes-v1.1.md) | Registro histórico das decisões da v1.1. |

## Licença e referências

Este é um projeto da organização da copa. A referência visual em `airbnb-design-design.md` e `airbnb-design-tokens.css` é interna, não oficial e não implica afiliação com o Airbnb; ela não vai para o build.
