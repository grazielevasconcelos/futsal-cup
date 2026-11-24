# Decisões da v2.3 — impressão e PDF

**Data:** 24/11/2026  
**Status:** Aceito  
**Escopo:** apresentação em papel/PDF no navegador; sem mudança de dados, regras, rotas ou JavaScript.

## Decisão

- Preparar todas as páginas para impressão em A4 retrato, com tema claro, tabelas completas e layout adaptado ao papel.
- Incluir no rodapé um guia nativo `<details>` com instruções para imprimir ou salvar em PDF, incluindo A4, orientação, cabeçalhos/rodapés e gráficos de fundo.
- Não adicionar botão `window.print()`, diálogo, estado em `localStorage` ou JavaScript. A impressão é iniciada pelo navegador.
- Usar uma folha `src/styles/print.css` carregada depois das folhas comuns e preservar cores/tipografia por tokens do projeto.
- Manter dados essenciais compreensíveis sem depender de cores de fundo.

## Consequências e limites

- A impressão é acionada pelo menu do navegador ou por Ctrl/Cmd+P; o guia explica as opções recomendadas.
- A preferência do tema não afeta o resultado: a impressão usa tokens claros.
- O navegador controla a paginação final; regras de quebra evitam fragmentar cards e linhas sempre que possível.
- Não há numeração de páginas nem geração de PDF no servidor.
- O escopo de JavaScript continua limitado ao tema da v2.1.

## Documentos normativos

Detalhes de implementação e testes estão em `PRD.md`, `SPEC.md` §11.11, `AGENTS.md` e `PLAN.md`.
