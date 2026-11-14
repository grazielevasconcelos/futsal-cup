# Decisões da v1.1 — Copa de Futsal Feminino Vila Mariana 2026

**Data:** 12/11/2026  
**Status:** Registro histórico reconstruído  
**Fontes:** `SPEC.md` §15, `PRD.md` v1.1 e `AGENTS.md` v1.1

> **Aviso:** este documento é uma **reconstrução** das decisões da v1.1 a partir da SPEC e dos documentos alinhados. O briefing original da v1.1 não está versionado no repositório. Este registro não é a fonte original, não é normativo e não substitui o PRD, o AGENTS ou a SPEC. Em caso de divergência, prevalecem o PRD v1.1, o AGENTS v1.1 e a SPEC v1.2.

## 1. Formato da edição 2026

- A edição passa a ter **3 times fixos**: `ta`, `tb`, `tc`.
- A fase classificatória é disputada em **turno e returno**, com **6 partidas** (`g1`…`g6`).
- Cada time joga **4 partidas de grupo**; cada par de times tem **um jogo em casa para cada lado**.
- A fase final tem **uma final única** entre 1º e 2º.
- **Não há semifinais, disputa de 3º x 4º nem 4º lugar.**
- A 3ª colocada é a 3ª da classificação; o pódio tem **campeã, vice-campeã e 3ª colocada**.
- Total de **7 partidas oficiais**: 6 de grupo + 1 final.

## 2. Calendário

| Data | Partidas |
|---|---|
| 24/11/2026 | `g1` TA x TB e `g2` TB x TC |
| 26/11/2026 | `g3` TA x TC e `g4` TB x TA |
| 01/12/2026 | `g5` TC x TA e `g6` TC x TB |
| 03/12/2026 | Amistoso do 3º colocado (informativo) e final 1º x 2º |

- Em 24/11, 26/11 e 01/12, um time joga duas vezes; os horários devem ser distintos e respeitar a ordem canônica.
- A correção de simetria trocou `g4` de `ta x tb` para `tb x ta`, garantindo um jogo em casa para cada time em cada par.
- Horários e nomes definitivos dos times ainda não foram definidos.

## 3. Confronto direto

- Aplicado somente quando **exatamente dois times** estão empatados em pontos.
- Considera os **dois jogos** entre eles:
  1. soma dos pontos dos dois jogos;
  2. se empatar, **saldo agregado** dos dois jogos;
  3. se persistir, seguem os critérios gerais (vitórias, saldo, gols pró, menos gols contra, disciplina, sorteio).
- Só vale se **os dois jogos estiverem `finished`**; se um não estiver, o critério é ignorado.
- W.O. conta como **1x0** para o vencedor.
- Com 3 ou mais times empatados, o confronto direto não é aplicado até o grupo se reduzir a dois.

## 4. Amistoso do 3º colocado

- É um **metadado informativo** (`friendly`), não uma partida.
- Exibido como card na Fase final, **antes da final**, com o rótulo “Informativo — não é partida oficial”.
- Campos: data, horário, local e nota.
- Data igual à da final; horário anterior ao da final, quando ela tiver horário.
- Participantes, se necessário, apenas na nota, sem dados estruturados ou dados pessoais.
- Sem placar, eventos, cartões, estatísticas, suspensões, classificação, pódio ou link de jogo.
- Se `friendly` for `null`, nenhum card ou placeholder é exibido.

## 5. W.O. e retirada de time

- W.O. é manual, com placar fixo **1x0** para o vencedor.
- Motivos: `no_show`, `insufficient_players` ou `withdrawal`.
- Sem gols ou assistências fictícios.
- Cartões são permitidos em `insufficient_players`/`withdrawal`; `no_show` não tem eventos.
- O site não detecta ausência nem automatiza retirada; a organização registra um W.O. por partida restante.
- O W.O. conta para classificação e estatísticas coletivas; não conta para artilharia/assistências.

## 6. Finalistas e correções

- `finalists` é o snapshot oficial dos dois finalistas, preenchido quando as 6 partidas de grupo terminam.
- Deve ser igual à classificação final; divergência bloqueia o build.
- Se uma correção após a final mudar os finalistas, o build falha listando antigos e novos; atualizar `finalists` é a confirmação explícita.
- A correção deve ser explicada em `notices`, que gera banner global.
- O `notices` não é obrigatório para o build passar, mas é recomendado.

## 7. Sorteio

- `drawOrder` é uma permutação dos 3 times, obrigatória apenas quando um empate chega ao sorteio na classificação final.
- É um registro manual da ordem vigente; se o sorteio for refeito, pode ser atualizado.
- O MVP não mantém histórico de sorteios.
- A UI mostra o badge textual “Sorteio” nas linhas decididas.

## 8. Estatísticas coletivas e pênaltis

- `buildTeamStats` agrega as partidas oficiais de grupo + final.
- V/E/D usam o **tempo normal**.
- Uma final decidida nos pênaltis conta como **empate** para os dois times em V/E/D.
- A campanha nos pênaltis é registrada separadamente em `shootoutWins` e `shootoutLosses`.
- O shootout **não** altera gols pró, gols contra ou saldo de gols.
- O amistoso não entra em nenhuma estatística.
- A classificação continua usando apenas as 6 partidas de grupo.

## 9. Elenco e badge

- Máximo de **8 jogadoras ativas simultaneamente**; a 9ª ativa é bloqueada.
- `leftAt` remove do elenco ativo, preserva o histórico e libera a vaga.
- Menos de 7 ativas gera aviso de build; menos de 5 gera badge público “Elenco em formação”.
- Entre 5 e 6 ativas, não há badge público.
- O mínimo de 3 em quadra é regra de jogo, não de elenco.

## 10. Regulamento e escopo

- **FR-10 (Regulamento) está ADIADO**: sem rota, link, página ou placeholder.
- **FR-20 (Histórico de alterações) é FUTURO**.
- O MVP não tem JavaScript de cliente, backend, login ou área administrativa.
- A página de Fase final exibe o card do amistoso e a final; não há página de 3º lugar.

## 11. Rastreabilidade

| Decisão | PRD v1.1 | SPEC v1.2 | AGENTS v1.1 |
|---|---|---|---|
| 3 times / 7 partidas | §1, §7.1, §8 | §5.7, §8.2, §10 | §Visão geral, §Formato |
| Calendário e `g4` | §7.8, §10.6 | §5.7, §8.2, Apêndice A | §Calendário |
| Confronto direto de dois jogos | §7.4, §12 | §7.3, §8.2, §13.2 | §Desempate |
| Amistoso informativo | §7.9, §8 (FR-21), §10.6 | §5.4, §7.12, §10.8 | §Amistoso |
| W.O. 1x0 | §7.8, §8.1 | §7.11, §8.2 | §W.O. |
| `finalists` / `drawOrder` | §7.7, §7.10, §11.5 | §7.7, §8.2 | §Fase final, §Desempate |
| Estatísticas com shootout | §10.4, §12 | §6.2, §7.6, §10.6 | §Diretrizes |
| Badge <5 / 8 ativas | §7.2, §10.4 | §5.6, §8.3, §10.6 | §Elenco |
| Regulamento adiado | §6.3, §10.7 | §2.4, §10.1, §10.9 | §Visão geral |

## 12. Pendências

- Definição de horários, nomes dos times, local exato e detalhes do amistoso.
- Implementação do MVP conforme `PLAN.md` e `TASKS.md`.
