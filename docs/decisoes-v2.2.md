# Decisões da v2.2 — passe visual

**Data:** 22/11/2026  
**Status:** Aceito  
**Escopo:** contrato visual e hierarquia de interface; sem alteração das regras da competição, dos dados, das rotas ou do JavaScript.

## Decisão

- Refinar a camada visual com tipografia e hierarquia mais claras, sem trocar a identidade coral/pink nem os temas claro/escuro da v2.1.
- Adicionar tracking específico por tamanho: `--tracking-display` (`-0.02em`) em display e `--tracking-heading` (`-0.01em`) em `h1`–`h3`; o corpo permanece neutro.
- Usar `text-wrap: balance` em títulos, `text-wrap: pretty` em parágrafos e `font-variant-numeric: tabular-nums` em placares, tabelas e estatísticas.
- Exibir uma barra de gradiente decorativa no topo de cada cabeçalho de página, com `--accent-bar-width` (8rem) e `--accent-bar-height` (4px). A barra não recebe texto.
- Tornar os cards de partida e de time clicáveis na área inteira com link estendido (`::after` com `inset: 0`). O título continua sendo o nome acessível e o anel de foco é desenhado no card.
- Dar feedback de toque por cor/borda no `:active`, sem animação de `transform`.
- Transformar o placar em um painel visual centralizado, mantendo o texto acessível completo em `.visually-hidden`.
- Reduzir o logo dos times para `--team-logo-size` (5rem) nos cards e usar `--team-logo-size-lg` (12rem) apenas no cabeçalho do time a partir de 768px. O cabeçalho do time fica horizontal.
- Manter as estatísticas coletivas em 2 colunas em todas as larguras.
- Destacar a campeã no pódio com borda de acento, barra de gradiente e nome em `heading-1`; a Início passa a ter uma única seção “Campeã” com o pódio, sem repetir uma seção “Pódio”.
- Ajustar atalhos para 1, 2 ou 3 colunas conforme a largura, usando `--shortcut-min` (10rem) e um limite de 3 colunas.
- Ajustar badges, tabelas, estados vazios e o banner de avisos para a nova hierarquia.

## O que não muda

- Regras da competição, schema, validação, classificação, estatísticas e pódio.
- Rotas, textos de estado, `aria-current`, semântica de tabelas e conteúdo público.
- O único JavaScript permitido continua sendo o script inline de tema da v2.1.
- Não há fontes externas, fotos de pessoas, cores novas, requisições de terceiros ou animações de `transform`.

## Acessibilidade

- Todos os pares de cor continuam saindo dos tokens e são validados nos dois temas por `tests/unit/tokens.test.ts`.
- O card inteiro é clicável, mas o foco visível aparece no card e o nome acessível vem do título; não há controles aninhados.
- A barra de gradiente e os chevrons são CSS decorativo, sem texto na árvore acessível.
- O placar mantém o texto completo para leitores de tela; a versão visual é apenas um resumo.
- Nenhuma página pode ter overflow horizontal em 320px; tabelas largas continuam rolando dentro do contêiner focável.

## Consequências e limites

- A barra de gradiente é puramente decorativa; não substitui títulos, badges ou textos de estado.
- O link estendido impede selecionar texto dentro do card, o que é aceitável para cards de navegação.
- O logo maior no cabeçalho do time fica restrito a telas ≥768px; no mobile, o logo de 5rem preserva espaço para o nome e as estatísticas.
- Qualquer novo componente interativo dentro de um card exige reavaliar o padrão de link estendido para evitar controles aninhados.

## Documentos normativos

Detalhes de implementação e testes estão em `SPEC.md` v2.2, `AGENTS.md` v2.2, `PLAN.md` e `TASKS.md`.
