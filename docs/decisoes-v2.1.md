# Decisões da v2.1 — tema claro e escuro

**Data:** 20/11/2026  
**Status:** Aceito  
**Escopo:** tema visual e preferência de exibição; sem alteração das regras da competição.

## Decisão

- O tema claro é o padrão, inclusive quando não há preferência salva ou quando `localStorage` não está disponível.
- A pessoa pode alternar entre tema claro e escuro por um controle acessível no cabeçalho.
- A escolha é salva em `localStorage` na chave `futsal-cup-theme` e restaurada em páginas e visitas futuras no mesmo navegador. O nome é específico do projeto para evitar colisões com outros GitHub Pages no mesmo domínio.
- A preferência é local ao navegador/dispositivo; não é enviada ao servidor nem sincronizada.
- Um único script inline, local e de até 1 KB gzip é permitido para inicializar, alternar e salvar o tema.
- O script não coleta dados, não faz requisições, não usa cookies, analytics, frameworks ou hidratação.
- Cores claras e escuras são aliases semânticos em `src/styles/tokens.css`; ambos os temas devem cumprir WCAG 2.2 AA.

## Motivação

O GitHub Pages não oferece banco de dados para preferências por pessoa. `localStorage` fornece persistência no cliente sem backend, conta ou requisição adicional, seguindo o padrão adotado pelo projeto `career-path`.

## Consequências e limites

- A preferência não acompanha a pessoa entre navegadores ou dispositivos.
- Limpar os dados do navegador remove a preferência; o site volta ao tema claro.
- Se o navegador bloquear o armazenamento, a troca de tema permanece funcional na página atual, mas não persiste.
- A restrição original de zero JavaScript no cliente é substituída pela exceção estrita descrita acima. Qualquer novo uso de JavaScript exige nova decisão.
- A impressão deve continuar legível e não deve depender de armazenamento local.

## Documentos normativos

Detalhes de implementação e testes estão em `PRD.md` v2.1, `SPEC.md` v2.1 e `AGENTS.md`.
