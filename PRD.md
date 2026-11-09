# PRD — Copa de Futsal Feminino Vila Mariana 2026

**Versão:** 1.0  
**Data:** 09/11/2026  
**Status:** Proposto  
**Responsável:** Organização da Copa  
**Público-alvo:** organização, desenvolvimento e jogadoras

---

## 1. Contexto e problema

A Copa de Futsal Feminino Vila Mariana é uma competição anual organizada pela turma de futsal feminino do Sesc Vila Mariana. A edição de 2026 terá 4 times, 6 partidas na fase classificatória e mais 2 partidas na fase final.

Hoje, o acompanhamento da competição depende de planilhas, mensagens e cálculos manuais. Isso cria riscos de erro nos critérios de desempate, dificulta a consulta pelas jogadoras e reduz a visibilidade da copa.

O produto proposto é um **site público, estático e somente leitura**, publicado no GitHub Pages, alimentado por uma fonte de dados versionada. Ele centraliza a tabela de jogos, os resultados, a classificação automática, as estatísticas individuais e a fase final.

**Nome de exibição:** Copa de Futsal Feminino Vila Mariana 2026.  
**Nome interno:** pode mencionar o Sesc Vila Mariana em documentação interna, mas o nome da instituição não deve aparecer na interface pública, em títulos, metadados ou textos exibidos ao público.

---

## 2. Relação com a spec técnica

Este PRD define **produto, regras e comportamentos esperados**. Ele não define stack, framework, banco de dados, formato exato do arquivo de dados ou estrutura de código. A spec técnica/SDD e o plano de implementação serão produzidos depois, a partir deste documento.

Restrições de produto já conhecidas:

- Publicação no **GitHub Pages**.
- Site **estático**, sem backend próprio.
- **Sem área administrativa e sem login** no MVP.
- A gestão dos dados é feita por uma **fonte de dados versionada**, editada pela organização.
- O site público é **somente leitura**.

---

## 3. Objetivos e não objetivos

### 3.1 Objetivos

- Centralizar as informações da copa em um único site.
- Automatizar a classificação e os critérios de desempate.
- Registrar gols, assistências e cartões vinculados à jogadora que realizou a ação.
- Dar visibilidade para jogadoras e torcida.
- Exibir a fase final e o pódio.
- Garantir consistência entre placar, eventos e classificação.
- Reduzir a zero os cálculos manuais de classificação.

### 3.2 Não objetivos do MVP

- Não é um sistema de operação ao vivo de partidas.
- Não é um sistema de cadastro com login.
- Não é uma plataforma multi-competição.
- Não substitui a organização do evento (arbitragem, materiais, logística, cerimonial).
- Não é um histórico de edições anteriores.

---

## 4. Métricas de sucesso

- Site publicado e acessível antes da primeira partida, em **17/11/2026**.
- **100% das 8 partidas** registradas ao final da copa.
- Classificação e estatísticas corretas em **100% dos casos**, incluindo empates e desempates.
- Nenhum cálculo manual de classificação durante a competição.
- Nenhum evento (gol, assistência ou cartão) vinculado à jogadora errada.
- Todas as jogadoras conseguem consultar a classificação e seus próprios números pelo celular.
- Organização consegue atualizar o site após uma partida sem depender de desenvolvimento.

---

## 5. Personas e permissões

| Persona | Permissões |
|---|---|
| **Organização** | Edita a fonte de dados, valida, publica e corrige informações. Não usa login no site. |
| **Jogadora** | Consulta o site público. Não edita. |
| **Torcida** | Consulta o site público. Não edita. |

No MVP não existem contas, login, níveis de permissão ou área administrativa. A edição é restrita a quem tem acesso ao repositório.

---

## 6. Escopo

### 6.1 No escopo

- 4 times: TA, TB, TC e TD, com nomes editáveis.
- Elencos de 7 ou 8 jogadoras.
- Cadastro de jogadoras com apelido obrigatório, posição opcional e time.
- Calendário com 6 jogos classificatórios + final + disputa de 3º lugar.
- Registro de resultados, gols, assistências e cartões.
- Classificação automática com critérios de desempate.
- Fase final, pódio e campeão.
- Estatísticas: artilharia, assistências e cartões.
- Páginas: Início, Jogos, Classificação, Times, Estatísticas, Fase final e Regulamento.
- Validação automática dos dados antes da publicação.
- Publicação no GitHub Pages.
- Layout mobile-first, em português do Brasil.

### 6.2 Fora do escopo do MVP

- Área administrativa com login.
- Banco de dados ou backend próprio.
- Cronômetro, placar ao vivo, tempos técnicos e controle de faltas.
- Escalação e controle de presença.
- Fotos, nomes completos, números de camisa, dados de contato ou data de nascimento.
- Histórico de edições anteriores.
- Notificações, chat, pagamentos, streaming ou ingressos.
- W.O. automático e regras próprias de cancelamento.
- Arbitragem, materiais, logística e cerimonial do evento.
- Modo escuro, impressão/PDF e analytics como itens obrigatórios.
- Login para atletas.

---

## 7. Regras da competição

### 7.1 Formato

- **4 times**.
- **Fase classificatória:** todos contra todos, em 6 partidas.
- **Pontuação:** vitória = 3 pontos; empate = 1 ponto; derrota = 0 ponto.
- **Fase final:** 1º x 2º na final e 3º x 4º na disputa de 3º lugar. **Não há semifinais.**
- O vencedor da final é campeão; o perdedor é vice-campeão.
- O vencedor da disputa de 3º lugar fica em 3º; o perdedor fica em 4º.

### 7.2 Elenco

- Cada time tem **7 ou 8 jogadoras**, sem contar comissão técnica.
- Campos da jogadora: **apelido** (obrigatório), **posição** (opcional: goleira ou linha) e **time** (obrigatório).
- O apelido é a identidade pública da jogadora. Deve ser **único dentro do time** e pode se repetir entre times diferentes.
- A mesma jogadora não pode estar em dois times.
- O elenco é **flexível**: novas alunas podem ser incluídas a qualquer momento, inclusive após o início da copa, desde que:
  - o time tenha vaga (máximo de 8 jogadoras);
  - a jogadora não esteja em outro time;
  - a inclusão seja feita antes da partida em que ela vai atuar.
- A nova jogadora fica elegível a partir da próxima partida do time. Não há registro retroativo de eventos.
- Se o time já estiver com 8 jogadoras, a organização decide como acomodar a nova aluna.
- Uma jogadora que já participou de uma partida **não pode trocar de time** nesta edição.
- A remoção de uma jogadora do elenco ativo não apaga seu histórico de gols, assistências e cartões.
- O sistema bloqueia a 9ª jogadora e sinaliza elenco incompleto quando houver menos de 7. Times incompletos não impedem a publicação do site, mas ficam visivelmente sinalizados para a organização.

### 7.3 Partida

- **2 tempos de 20 minutos.**
- **1 tempo técnico de 1 minuto por time por tempo**, não acumulável entre os tempos.
- **Intervalo de 10 minutos.**
- **5 jogadoras em quadra**, incluindo a goleira.
- Mínimo de **3 jogadoras** para começar ou continuar uma partida.
- **Substituições ilimitadas.**
- O produto não controla cronômetro, tempo técnico, faltas ou superioridade numérica. Essas regras ficam na página de Regulamento e são aplicadas pela organização/arbitragem.

### 7.4 Critérios de desempate

A classificação da fase classificatória segue a ordem abaixo:

1. **Confronto direto**, aplicado apenas quando **exatamente dois times** estão empatados em pontos.
   - Se o confronto direto terminou empatado, segue para o próximo critério.
   - Quando um grupo de 3 ou mais times empatados é reduzido a exatamente dois por um critério anterior, o confronto direto volta a ser aplicado a esses dois.
2. **Número de vitórias.**
3. **Saldo de gols** (gols pró menos gols contra).
4. **Gols pró.**
5. **Menos gols contra.**
6. **Pontos disciplinares**, com menor pontuação tendo vantagem:
   - cartão amarelo = 1 ponto;
   - cartão vermelho = 2 pontos;
   - **segundo amarelo no mesmo jogo** é convertido em vermelho: o time soma 1 ponto pelo primeiro amarelo + 2 pontos pelo vermelho = **3 pontos**. O segundo amarelo não soma outro ponto de amarelo. O registro da jogadora mostra “2º amarelo → vermelho”.
7. **Sorteio**, realizado pela organização, com a ordem final registrada manualmente na fonte de dados.

Observações:

- Com **3 ou mais times empatados**, o confronto direto não é aplicado; segue-se para vitórias, saldo, gols pró, menos gols contra, cartões e sorteio.
- A classificação considera **apenas as 6 partidas da fase classificatória**.
- Cartões e resultados da final e da disputa de 3º lugar não alteram a classificação.

### 7.5 Cartões e suspensão

- Cartão amarelo é advertência; cartão vermelho é expulsão.
- Um segundo amarelo no mesmo jogo gera vermelho.
- Cartão vermelho, direto ou por segundo amarelo, **suspende a jogadora da próxima partida do time** na competição.
- Se o time não tiver próxima partida, a suspensão não tem efeito.
- Não há suspensão por acúmulo de cartões amarelos.
- Cartões durante a disputa de pênaltis não entram nas estatísticas nem geram suspensão.
- A jogadora suspensa não pode ter eventos registrados na partida que ela não pode disputar; o sistema deve alertar e bloquear.

### 7.6 Gols, assistências e placar

- O placar de cada partida é **derivado dos gols registrados**. Não existe placar digitado separadamente.
- Cada gol é um evento vinculado à **jogadora marcadora**.
- A assistência é **opcional**, vinculada a uma jogadora do mesmo time, diferente da marcadora.
- O minuto do gol, da assistência e do cartão é **opcional**.
- Tipos de gol:
  - **Normal:** conta para o placar e para a artilharia da marcadora.
  - **Pênalti no tempo normal:** conta para o placar e para a artilharia.
  - **Gol contra:** vinculado à jogadora que marcou contra, mas conta para o time adversário e **não** entra na artilharia dela; não tem assistência.
- Gols e assistências da final e da disputa de 3º lugar contam para as estatísticas individuais.
- Gols da **disputa de pênaltis** não contam para placar, artilharia ou assistências. A disputa é registrada apenas pelo placar final dos pênaltis.
- Uma jogadora só pode ser vinculada a um evento se estiver no elenco do time naquela partida.

### 7.7 Fase final

- Os confrontos são definidos pela classificação final:
  - **1º x 2º** — final;
  - **3º x 4º** — disputa de 3º lugar.
- Em caso de empate no tempo normal na final ou na disputa de 3º lugar, o vencedor é definido em **disputa de pênaltis direta**: 5 cobranças alternadas e, se necessário, morte súbita.
- O resultado é exibido no formato `1 (4) x (3) 1`, com o placar dos pênaltis entre parênteses.
- O MVP registra apenas o placar dos pênaltis, sem detalhes de quem cobrou ou converteu.

### 7.8 Calendário e local

| Data | Partidas |
|---|---|
| **17/11/2026** | TA x TB e TC x TD |
| **19/11/2026** | TA x TC e TB x TD |
| **24/11/2026** | TA x TD e TB x TC |
| **26/11/2026** | 3º x 4º e 1º x 2º (final) |

- Cada time joga uma vez por data na fase classificatória.
- A disputa de 3º lugar acontece antes da final.
- Horários exatos: **a definir**.
- Local: Vila Mariana, São Paulo. O nome da instituição não deve aparecer na interface pública.
- Se uma partida for adiada, a organização atualiza data e horário na fonte de dados.
- Não há W.O. automático. Se houver desistência ou ausência, a organização registra o resultado conforme sua decisão.

---

## 8. Requisitos funcionais

| ID | Requisito | Prioridade | Critério de aceite resumido |
|---|---|---|---|
| FR-01 | Fonte de dados única e versionada com edição, times, jogadoras, partidas e eventos | Obrigatório | O site é gerado a partir de uma única fonte; não há dados duplicados ou editados manualmente no HTML |
| FR-02 | Validação automática dos dados | Obrigatório | Dados inválidos bloqueiam a publicação com mensagem clara e indicação do problema |
| FR-03 | Times e elencos | Obrigatório | Exibir 4 times, elencos com apelido e posição, e permitir nomes editáveis |
| FR-04 | Calendário de jogos | Obrigatório | Exibir as 8 partidas, agrupadas por data, com status, placar e local |
| FR-05 | Detalhe da partida | Obrigatório | Exibir placar derivado dos gols, eventos de gol, assistência, cartões e pênaltis |
| FR-06 | Classificação automática | Obrigatório | Aplicar 3/1/0 e todos os critérios de desempate na ordem definida |
| FR-07 | Fase final e pódio | Obrigatório | Exibir 1º x 2º, 3º x 4º, campeão, vice, 3º e 4º |
| FR-08 | Estatísticas individuais | Obrigatório | Artilharia, assistências e cartões vinculados à jogadora, com ordenação definida |
| FR-09 | Página inicial | Desejável | Exibir próximo jogo, últimos resultados, resumo da classificação e destaques |
| FR-10 | Página de Regulamento | Desejável | Exibir todas as regras da competição em linguagem clara |
| FR-11 | Layout mobile-first e acessível | Obrigatório | Navegação e tabelas funcionam em celular; contraste e semântica adequados |
| FR-12 | Publicação no GitHub Pages | Obrigatório | Site público, sem login, atualizado após a publicação da fonte de dados |
| FR-13 | Suspensões | Obrigatório | Exibir jogadoras suspensas e a partida que perdem; bloquear eventos indevidos |
| FR-14 | Correções | Obrigatório | Correções recalculam classificação, estatísticas e chaveamento; alertar se finalistas mudarem após a final |
| FR-15 | Flexibilidade de elenco | Obrigatório | Permitir inclusão de novas alunas dentro do limite de 8, com elegibilidade a partir da próxima partida |
| FR-16 | Edição 2026 | Obrigatório | Exibir apenas 2026, com estrutura preparada para edições futuras |
| FR-17 | Privacidade | Obrigatório | Exibir apenas apelido, posição, time e estatísticas; sem nome completo, foto ou contato |
| FR-18 | Nome de exibição | Obrigatório | Usar “Copa de Futsal Feminino Vila Mariana 2026”; não exibir o nome da instituição na interface |
| FR-19 | Compartilhamento | Desejável | Título e descrição adequados para compartilhamento do link |
| FR-20 | Histórico de alterações | Futuro | Não obrigatório no MVP; pode ser avaliado em versões futuras |

### 8.1 Regras de validação obrigatórias

- Exatamente 4 times na edição 2026.
- Cada time com no máximo 8 jogadoras; menos de 7 gera alerta.
- Apelido único dentro do time.
- Jogadora não pode estar em dois times.
- Evento de gol, assistência ou cartão deve referenciar jogadora do elenco do time.
- Assistência deve ser de jogadora do mesmo time da marcadora e diferente dela.
- Gol contra não pode ter assistência.
- Placar deve ser compatível com a soma dos gols registrados.
- Partida da fase final deve ter 1º x 2º ou 3º x 4º conforme a classificação.
- Jogadora suspensa não pode ter evento na partida em que está suspensa.
- Datas e horários devem ser válidos.
- Não pode haver referência a time, jogadora ou partida inexistente.

---

## 9. Requisitos não funcionais

- **Publicação:** GitHub Pages, site estático, sem backend próprio.
- **Acesso:** público, sem login; leitura apenas.
- **Atualização:** após a publicação da fonte de dados, o site é reconstruído e publicado automaticamente.
- **Performance:** carregamento rápido em celular e conexão 4G; assets leves.
- **Acessibilidade:** contraste adequado, navegação por teclado, tabelas semânticas, textos alternativos.
- **Compatibilidade:** versões recentes de Chrome, Safari, Firefox e Edge; mobile-first.
- **Idioma:** português do Brasil.
- **Fuso horário:** America/Sao_Paulo.
- **Privacidade:** apenas apelido, posição e time; sem cookies de rastreamento ou analytics de terceiros.
- **Confiabilidade:** cálculos determinísticos; a mesma fonte de dados gera sempre a mesma classificação.
- **Manutenibilidade:** fonte de dados legível por humanos, validação clara e histórico via Git.
- **Segurança:** nenhum segredo no repositório público; sem autenticação no MVP.
- **Disponibilidade:** depende do GitHub Pages; sem SLA. Em caso de indisponibilidade, a fonte de dados versionada permanece como backup.

---

## 10. Páginas e navegação

### 10.1 Início

- Próximo jogo ou próxima rodada.
- Últimos resultados.
- Resumo da classificação (4 times).
- Destaques: artilheira, líder de assistências.
- Atalho para a fase final quando definida.
- Estado especial: antes da copa, depois da classificatória e após a final.

### 10.2 Jogos

- Lista por data, com as 8 partidas.
- Cada partida mostra: times, data, horário, local, status e placar.
- Detalhe da partida: gols, assistências, cartões, pênaltis e minuto quando informado.

### 10.3 Classificação

- Tabela: Posição, Time, Pontos, Jogos, Vitórias, Empates, Derrotas, Gols pró, Gols contra, Saldo, Cartões amarelos, Cartões vermelhos e Pontos disciplinares.
- Explicação dos critérios de desempate.
- Indicação de empate que exigiu sorteio.
- Atualização automática após cada resultado.

### 10.4 Times

- 4 times com nome, abreviação e elenco.
- Cada jogadora: apelido, posição, gols, assistências, cartões e status de suspensão.
- Estatísticas coletivas do time.

### 10.5 Estatísticas

- **Artilharia:** gols em todas as partidas oficiais, excluindo pênaltis. Ordenação: gols, assistências, apelido.
- **Assistências:** ordenação: assistências, gols, apelido.
- **Cartões:** amarelos, vermelhos e pontos disciplinares por jogadora e por time.
- **Gols contra:** separados, sem entrada na artilharia.

### 10.6 Fase final

- Final e disputa de 3º lugar.
- Placar do tempo normal e placar dos pênaltis.
- Campeão, vice, 3º e 4º.
- Estado “a definir” antes da classificação.

### 10.7 Regulamento

- Formato da competição.
- Pontuação e critérios de desempate.
- Regras de elenco, partida, cartões, suspensões e pênaltis.
- Calendário e local.

---

## 11. Fluxos principais

### 11.1 Antes da copa

1. Organização cria a fonte de dados com edição, times, elencos e calendário.
2. Validação automática verifica limites, apelidos, referências e datas.
3. Site é publicado.
4. Público consulta times, jogos e regulamento.

### 11.2 Após cada partida

1. Organização registra gols, assistências, cartões e pênaltis, se houver.
2. Placar é derivado dos gols.
3. Classificação e estatísticas são recalculadas.
4. Site é publicado.
5. Público consulta o resultado atualizado.

### 11.3 Fim da fase classificatória

1. Classificação final é calculada com todos os critérios.
2. Se houver empate persistente, organização realiza sorteio e registra a ordem.
3. Confrontos da final e da disputa de 3º lugar são definidos.
4. Site publica o chaveamento.

### 11.4 Finais

1. Organização registra o resultado da disputa de 3º lugar.
2. Organização registra o resultado da final.
3. Se houver empate, registra o placar dos pênaltis.
4. Site publica campeão, vice, 3º e 4º.

### 11.5 Correção

1. Organização edita o resultado ou evento.
2. Validação e recálculo são executados.
3. Se a correção alterar os finalistas depois da final, o sistema exibe alerta e exige confirmação.
4. Site é republicado.

---

## 12. Critérios de aceite

1. **Times e elencos**
   - Dado uma edição com 4 times, quando um time tiver 9 jogadoras, então a validação bloqueia a inclusão.
   - Quando um time tiver menos de 7 jogadoras, então o site sinaliza elenco incompleto.
   - Quando duas jogadoras do mesmo time tiverem o mesmo apelido, então a validação bloqueia.
   - Quando a mesma jogadora estiver em dois times, então a validação bloqueia.

2. **Pontuação**
   - Vitória soma 3 pontos; empate soma 1; derrota soma 0.

3. **Desempate entre dois times**
   - Dois times empatados em pontos: o vencedor do confronto direto fica à frente.
   - Se o confronto direto foi empate, aplica-se o próximo critério.

4. **Desempate entre três ou mais times**
   - O confronto direto não é aplicado.
   - A ordem segue vitórias, saldo, gols pró, menos gols contra, pontos disciplinares e sorteio.
   - Se um critério reduzir o grupo a dois times, o confronto direto volta a valer para esses dois.

5. **Cartões**
   - Amarelo = 1 ponto; vermelho = 2 pontos.
   - Segundo amarelo no mesmo jogo = 1 amarelo + 1 vermelho = 3 pontos para o time.
   - Vermelho suspende a jogadora da próxima partida.
   - Não há suspensão por acúmulo de amarelos.

6. **Gols e assistências**
   - O placar é a soma dos gols registrados.
   - Gol contra conta para o time adversário e não entra na artilharia da jogadora.
   - Assistência é opcional, do mesmo time e diferente da marcadora.
   - Pênalti no tempo normal conta para artilharia; pênalti da disputa não conta.

7. **Fase final**
   - 1º x 2º na final; 3º x 4º na disputa de 3º lugar.
   - Empate no tempo normal vai direto para pênaltis.
   - O placar dos pênaltis é exibido entre parênteses.
   - Campeão, vice, 3º e 4º são exibidos corretamente.

8. **Elenco flexível**
   - Nova jogadora pode ser incluída se o time tiver até 8.
   - Ela fica elegível a partir da próxima partida.
   - Não há eventos retroativos.
   - Jogadora que já atuou não pode trocar de time.

9. **Suspensão**
   - Jogadora suspensa não pode ter eventos na partida que perde.
   - O site exibe a suspensão e a partida afetada.

10. **Correções**
    - Correção de resultado recalcula classificação, estatísticas e chaveamento.
    - Se a correção mudar os finalistas após a final, o sistema alerta e exige confirmação.

11. **Publicação e acesso**
    - Site público, sem login, no GitHub Pages.
    - Fonte de dados versionada e validada.
    - Nenhum dado sensível além do apelido.

12. **Interface**
    - Nome de exibição sem o nome da instituição.
    - Layout mobile-first, em português.
    - Páginas Início, Jogos, Classificação, Times, Estatísticas, Fase final e Regulamento acessíveis.

---

## 13. Cronograma

| Data | Marco |
|---|---|
| **09/11/2026** | PRD aprovado |
| **10/11 a 15/11/2026** | Implementação |
| **16/11/2026** | Testes, dados de exemplo e congelamento do escopo |
| **17/11/2026** | Primeira rodada |
| **19/11/2026** | Segunda rodada |
| **24/11/2026** | Terceira rodada |
| **26/11/2026** | Disputa de 3º lugar e final |
| **27/11/2026** | Retrospectiva e registro de melhorias |

**Contingência:** se o site não estiver pronto até 17/11, a organização pode registrar os dados na fonte versionada e publicar o site assim que possível, sem alterar a condução da copa.

---

## 14. Riscos e mitigações

| Risco | Impacto | Mitigação |
|---|---|---|
| Prazo curto até 17/11 | Alto | Congelar escopo, priorizar os itens obrigatórios, fazer teste completo em 16/11 |
| Erro no lançamento de dados | Alto | Validação automática, exemplos, revisão antes de publicar |
| Interpretação errada dos desempates | Alto | Critérios explícitos e testes com casos de exemplo |
| Cartões e suspensões | Médio | Regras claras e validação de eventos |
| Elenco flexível gerar inconsistência | Médio | Limite de 8, apelido único, bloquear jogadora em dois times e trocas de time após atuação |
| Atraso na publicação do site | Médio | Publicar imediatamente após cada partida; comunicação à organização |
| Internet instável no local | Médio | Dados podem ser preenchidos depois; site é somente leitura |
| Cache do GitHub Pages | Baixo | Verificar após o deploy e orientar recarregar a página |
| Nome da instituição na interface | Médio | Revisão de textos públicos; nome de exibição definido no PRD |
| Perda de dados | Baixo | Histórico no Git e backup da fonte de dados |

---

## 15. Decisões e premissas

- Nome de exibição: **Copa de Futsal Feminino Vila Mariana 2026**.
- O nome da instituição pode aparecer em documentos internos, mas não na interface pública.
- Site estático no GitHub Pages, sem backend, sem login e sem área administrativa.
- Fonte de dados versionada e validada; site somente leitura.
- Apenas a edição 2026, com estrutura preparada para edições futuras.
- Calendário: 17/11, 19/11, 24/11 e 26/11/2026; horários a definir.
- Disputa de 3º lugar antes da final.
- Pênaltis diretos, com placar registrado apenas como resultado.
- Placar derivado dos gols.
- Segundo amarelo = 3 pontos para o time (1 amarelo + 1 vermelho).
- Confronto direto apenas para dois times; reaplicado quando um grupo maior se reduz a dois.
- Elenco flexível, com limite de 8 e mínimo de 7 sinalizado.
- Jogadora que já atuou não troca de time nesta edição.
- Sem nome completo, número de camisa, foto ou contato.
- Sem escalação, cronômetro, placar ao vivo ou controle de faltas.
- Sem o nome da instituição na interface pública.

---

## 16. Questões em aberto

Estas questões não bloqueiam o MVP e podem ser resolvidas pela organização durante a implementação:

- Horários exatos das partidas.
- Nomes definitivos dos times.
- Local/quadra exata a exibir publicamente.
- Como acomodar novas alunas se todos os times estiverem com 8 jogadoras.
- Regra de W.O. ou desistência, se ocorrer.
- Critério de assistência em casos duvidosos.
- Necessidade de modo escuro, impressão/PDF ou analytics no futuro.

---

## 17. Glossário

- **TA, TB, TC, TD:** abreviações provisórias dos quatro times.
- **Fase classificatória:** todos contra todos, com 6 partidas.
- **Fase final:** final (1º x 2º) e disputa de 3º lugar (3º x 4º).
- **Confronto direto:** partida entre dois times empatados em pontos.
- **Saldo de gols:** gols pró menos gols contra.
- **Gols pró:** gols marcados.
- **Gols contra:** gols sofridos.
- **Pontos disciplinares:** amarelo = 1; vermelho = 2; segundo amarelo = 3 para o time.
- **Tempo técnico:** pausa de 1 minuto por time por tempo.
- **Pênaltis:** disputa de 5 cobranças alternadas e morte súbita.
- **W.O.:** vitória por ausência do adversário; não automatizado no MVP.
- **Fonte de dados:** arquivo versionado que contém todas as informações da copa.

---

## 18. Aprovação

- [ ] Organização da Copa
- [ ] Desenvolvimento
- [ ] Revisão final do PRD
