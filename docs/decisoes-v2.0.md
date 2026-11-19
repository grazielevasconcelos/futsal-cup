# Decisões da v2.0 — Copa de Futsal Feminino Vila Mariana 2026

**Data:** 18/11/2026  
**Status:** Registro histórico  
**Fontes:** `PRD.md` v2.0, `SPEC.md` v2.0 e `AGENTS.md` v2.0

> **Aviso:** este documento registra as decisões de produto e de formato da v2.0. Ele **não é normativo** e não substitui o PRD, o AGENTS ou a SPEC. Em caso de divergência, prevalecem o `PRD.md`, o `AGENTS.md` e a `SPEC.md` na versão vigente. As decisões da v1.1 permanecem preservadas em `docs/decisoes-v1.1.md` apenas como histórico.

## 1. Formato da edição 2026

- A edição tem **3 times fixos**: `ta`, `tb`, `tc`.
- A fase classificatória é disputada em **turno e returno**, com **6 partidas** (`g1`…`g6`).
- Cada time joga **4 partidas de grupo**; cada par de times tem **um jogo em casa para cada lado**.
- A fase final passa a ter **semifinal e final**:
  - **Semifinal:** 2º x 3º, partida única.
  - **Final:** 1º x vencedora da semifinal, partida única.
- Total de **8 partidas oficiais**: 6 de grupo + 1 semifinal + 1 final.
- **Não há amistoso do 3º colocado.**
- **Não há disputa de 3º lugar nem 4º lugar.** A 3ª colocada é a perdedora da semifinal.
- O pódio tem **campeã, vice-campeã e 3ª colocada**.

## 2. Calendário

| Data | Partidas |
|---|---|
| 24/11/2026 | `g1` TA x TB e `g2` TB x TC |
| 26/11/2026 | `g3` TA x TC e `g4` TB x TA |
| 01/12/2026 | `g5` TC x TA e `g6` TC x TB |
| 02/12/2026 | Semifinal: 2º x 3º |
| 03/12/2026 | Final: 1º x vencedora da semifinal |

- Em 24/11, 26/11 e 01/12, um time joga duas vezes; os horários devem ser distintos e respeitar a ordem canônica.
- A ordem canônica completa é `g1` → `g2` → `g3` → `g4` → `g5` → `g6` → `semi` → `final`.
- Horários e nomes definitivos dos times ainda não foram definidos.
- O local continua em Vila Mariana, São Paulo; o nome da instituição não aparece na interface pública.

## 3. Semifinal

- Disputada entre o **2º e o 3º colocado** da fase classificatória.
- O **2º colocado tem vantagem do empate** e mando de campo.
- O confronto é registrado no snapshot `semifinalists`, no formato `[2º, 3º]`.
- A ordem do snapshot define mando e vantagem; não existe campo separado de vantagem.
- Empate no tempo normal classifica o 2º colocado.
- **Não há prorrogação, pênaltis ou shootout.**
- W.O. é permitido e o vencedor administrativo avança; o W.O. prevalece sobre a vantagem do empate.

## 4. Final

- Disputada entre o **1º colocado** e a **vencedora da semifinal**.
- O **1º colocado tem vantagem do empate** e mando de campo.
- O confronto é registrado no snapshot `finalists`, no formato `[1º, vencedora da semifinal]`.
- A ordem do snapshot define mando e vantagem; não existe campo separado de vantagem.
- Empate no tempo normal dá o título ao 1º colocado.
- **Não há prorrogação, pênaltis ou shootout.**
- W.O. é permitido e o vencedor administrativo é campeão; o W.O. prevalece sobre a vantagem do empate.

## 5. Vantagem do empate

- A vantagem é uma consequência da posição no chaveamento, não um placar ou evento.
- Na semifinal, o empate classifica o 2º colocado.
- Na final, o empate dá o título ao 1º colocado.
- O placar oficial continua sendo o do tempo normal; a classificação ou o título em caso de empate é exibido como informação textual separada.
- A vantagem não transforma empate em vitória nas estatísticas: a partida continua contando como empate em V/E/D.

## 6. Snapshots e correções

- `semifinalists` é o snapshot oficial da semifinal.
  - É `null` enquanto o grupo não termina.
  - Quando o grupo termina, deve ser igual à classificação: `[2º, 3º]`.
  - Se uma correção após a semifinal mudar os semifinalistas esperados, o build falha listando antigos e novos e exige reconciliação dos dados.
- `finalists` é o snapshot oficial da final.
  - É `null` enquanto a semifinal não termina.
  - Quando a semifinal termina, deve ser igual ao esperado: `[1º, vencedora da semifinal]`.
  - Se uma correção após a final mudar os finalistas, o build falha listando antigos e novos; atualizar `finalists` é a confirmação explícita.
- Toda correção relevante deve ser explicada em `notices`, que gera banner global.
- `drawOrder` continua sendo um registro manual da ordem do sorteio vigente.

## 7. Suspensões e chaveamento

- Um cartão vermelho suspende a jogadora da **próxima partida real do time**.
- O caminho do time no chaveamento é considerado:
  - o 1º colocado não disputa a semifinal; depois do grupo, sua próxima partida é a final;
  - o 2º e o 3º disputam a semifinal; um vermelho na última partida de grupo é cumprido na semifinal;
  - um vermelho na semifinal é cumprido na final se o time avançar; se for eliminado, não há partida seguinte;
  - um vermelho na final não tem partida seguinte e não tem efeito.
- A jogadora suspensa não pode ter eventos na partida em que cumpre a suspensão.
- Cartões da semifinal e da final contam para estatísticas e suspensão, mas não para a classificação.

## 8. Estatísticas

- `buildTeamStats` agrega **grupo + semifinal + final**.
- V/E/D usam o **tempo normal**; uma semifinal ou final empatada conta como empate.
- Não há campanha de pênaltis, `shootoutWins` ou `shootoutLosses`.
- GP/GC/SG incluem as 8 partidas oficiais.
- Artilharia, assistências e cartões incluem a semifinal e a final.
- A classificação continua usando apenas as 6 partidas de grupo.
- O W.O. conta como 1x0 para o vencedor e não gera gols ou assistências individuais.

## 9. W.O.

- Manual, com placar fixo **1x0** para o vencedor.
- Motivos: `no_show`, `insufficient_players` ou `withdrawal`.
- Sem gols ou assistências fictícios.
- Cartões são permitidos em `insufficient_players`/`withdrawal`; `no_show` não tem eventos.
- Permitido na fase classificatória, na semifinal e na final.
- O vencedor administrativo avança ou conquista o título; o W.O. prevalece sobre a vantagem do empate.
- O site não detecta ausência nem automatiza retirada; a organização registra um W.O. por partida restante.

## 10. Remoções em relação à v1.1

- Removido o metadado `friendly` e o card informativo do amistoso.
- Removido o campo `shootout` e toda a lógica de pênaltis, incluindo `shootoutWins`/`shootoutLosses`.
- Removida a regra de final direta entre 1º e 2º.
- Removida a definição da 3ª colocada pela classificação; agora é a perdedora da semifinal.
- Removidos testes, fixtures, textos e validações específicos de amistoso e shootout.
- Campos antigos `friendly` e `shootout` devem gerar mensagem de migração clara, não serem silenciosamente ignorados.

## 11. Interface

- Rótulos públicos: **“Semifinal”** e **“Final”**.
- A Fase final exibe a semifinal e a final, com a vantagem do empate indicada textualmente.
- Antes da semifinal, a final deve exibir o 1º colocado e a indicação **“Vencedora da semifinal”**; não usar “Confrontos a definir” quando o 1º já é conhecido.
- Em caso de empate, a interface deve dizer quem avançou ou foi campeã pela vantagem do empate, sem depender apenas de cor.
- A 3ª colocada é rotulada como **“3ª colocada”**.
- Não há card, rota ou link de amistoso, disputa de 3º lugar ou pênaltis.
- A página de Jogos lista as 8 partidas oficiais.
- A página de Times não exibe colunas de pênaltis.
- A página de Classificação informa que a semifinal e a final não alteram a tabela.

## 12. Rastreabilidade

| Decisão | PRD v2.0 | SPEC v2.0 | AGENTS v2.0 |
|---|---|---|---|
| 3 times / 8 partidas | §1, §7.1, §8 | §5.7, §8.2, §10 | §Visão geral, §Formato |
| Semifinal 2º x 3º | §7.1, §7.7, §10.6 | §7.7, §10.8 | §Formato, §Fase final |
| Final 1º x vencedora da semifinal | §7.1, §7.7, §10.6 | §7.7, §10.8 | §Formato, §Fase final |
| Vantagem do empate | §7.1, §7.7, §12 | §7.1, §7.7, §10.8 | §Formato, §Fase final |
| Semifinalistas / finalistas | §7.7, §7.9, §8.1 | §5.4, §5.7, §7.7, §8.2 | §Fase final, §Validação |
| Suspensão no chaveamento | §7.5, §12 | §7.5, §8.2 | §Cartões e suspensão |
| Estatísticas sem shootout | §10.4, §10.5, §12 | §6.2, §7.6, §10.6 | §Diretrizes, §Testes |
| Remoção do amistoso | §6.2, §7.9, §8 | §2.3, §5.4, §8.2 | §Validação, §Testes |
| Remoção do shootout | §6.2, §7.3, §7.6 | §5.4, §7.11, §8.2 | §Partida, §Testes |
| 3ª colocada = perdedora da semifinal | §7.1, §7.7, §12 | §7.7, §10.8 | §Formato, §Fase final |

## 13. Pendências

- Definição de horários, nomes dos times e local exato.
- Atualização da implementação, das fixtures e dos testes para o formato v2.0.
- Publicação do site antes da primeira partida, em 24/11/2026.
