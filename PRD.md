# PRD — Copa de Futsal Feminino Vila Mariana 2026

**Versão:** 2.1
**Data:** 20/11/2026
**Status:** Aceito  
**Responsável:** Organização da Copa  
**Público-alvo:** organização, desenvolvimento e jogadoras

> **Nota da v2.0:** esta versão incorpora as decisões de produto de 18/11/2026 registradas em `docs/decisoes-v2.0.md`. A competição passa a ter **8 partidas oficiais**: 6 jogos classificatórios em turno e returno, **1 semifinal** e **1 final**. Não há mais amistoso do 3º colocado nem disputa de pênaltis. A versão 1.1 permanece como registro histórico em `docs/decisoes-v1.1.md`.
>
> **Nota da v2.1:** o site passa a oferecer tema claro (padrão) e escuro. A preferência manual é salva localmente no navegador; não há conta, backend, cookie ou sincronização entre dispositivos. Um script pequeno e local é permitido somente para aplicar, alternar e persistir o tema.

> **Nota histórica da v1.1:** a versão 1.1 incorporou as decisões de produto de 12/11/2026 e detalhava uma competição com 7 partidas oficiais, final direta entre 1º e 2º, amistoso informativo do 3º colocado e disputa de pênaltis na final. Esses elementos foram substituídos pela v2.0.

---

## 1. Contexto e problema

A Copa de Futsal Feminino Vila Mariana é uma competição anual organizada pela turma de futsal feminino do Sesc Vila Mariana. A edição de 2026 terá **3 times**, **6 partidas na fase classificatória em turno e returno**, **1 semifinal** e **1 final**, totalizando **8 partidas oficiais**.

A semifinal será disputada entre o **2º e o 3º colocado** da fase classificatória, com **vantagem do empate para o 2º colocado**. A final será disputada entre o **1º colocado** e a **vencedora da semifinal**, com **vantagem do empate para o 1º colocado**. Empates encerram a partida no tempo normal: **não há prorrogação, disputa de pênaltis ou cobranças alternadas**. A 3ª colocada é a perdedora da semifinal; não há disputa de 3º lugar nem 4º lugar.

Hoje, o acompanhamento da competição depende de planilhas, mensagens e cálculos manuais. Isso cria riscos de erro nos critérios de desempate, dificulta a consulta pelas jogadoras e reduz a visibilidade da copa.

O produto proposto é um **site público, estático e somente leitura**, publicado no GitHub Pages, alimentado por uma fonte de dados versionada. Ele centraliza a tabela de jogos, os resultados, a classificação automática, as estatísticas individuais e coletivas e a fase final.

**Nome de exibição:** Copa de Futsal Feminino Vila Mariana 2026.  
**Nome interno:** pode mencionar o Sesc Vila Mariana em documentação interna, mas o nome da instituição não deve aparecer na interface pública, em títulos, metadados ou textos exibidos ao público.

---

## 2. Relação com a spec técnica

Este PRD define **produto, regras e comportamentos esperados**. Ele não define stack, framework, banco de dados, formato exato do arquivo de dados ou estrutura de código.

A implementação segue estes documentos:

| Documento | Papel |
|---|---|
| `PRD.md` | Fonte de verdade de produto, regras e critérios de aceite. |
| `AGENTS.md` | Restrições do repositório, design, acessibilidade, privacidade e testes. |
| `SPEC.md` | Especificação técnica normativa: stack, schema, algoritmos, validação, UI, CI e deploy. |
| `PLAN.md` / `TASKS.md` | Plano e checklist de execução, subordinados ao PRD, ao AGENTS e à SPEC. |
| `docs/decisoes-v2.2.md` | Registro do passe visual da v2.2; não altera regras de produto. |
| `docs/decisoes-v2.0.md` | Registro histórico das decisões da v2.0; não é normativo. |
| `docs/decisoes-v2.1.md` | Registro da decisão de tema claro/escuro e persistência local. |
| `docs/decisoes-v1.1.md` | Registro histórico das decisões da v1.1; não é normativo. |

Restrições de produto já conhecidas:

- Publicação no **GitHub Pages**.
- Site **estático**, sem backend próprio. JavaScript de cliente é limitado à alternância e persistência local do tema; não há frameworks, hidratação nem chamadas externas.
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
- Exibir a semifinal, a final e o pódio de três posições.
- Garantir consistência entre placar, eventos, classificação e chaveamento.
- Reduzir a zero os cálculos manuais de classificação e de definição de finalistas.

### 3.2 Não objetivos do MVP

- Não é um sistema de operação ao vivo de partidas.
- Não é um sistema de cadastro com login.
- Não é uma plataforma multi-competição.
- Não substitui a organização do evento (arbitragem, materiais, logística, cerimonial).
- Não é um histórico de edições anteriores.
- Não é uma plataforma de transmissão, apostas ou ingressos.

---

## 4. Métricas de sucesso

- Site publicado e acessível antes da primeira partida, em **24/11/2026**.
- **100% das 8 partidas oficiais** registradas ao final da copa.
- Classificação e estatísticas corretas em **100% dos casos**, incluindo empates, desempates e vantagem do empate na semifinal e na final.
- Nenhum cálculo manual de classificação ou de definição de finalistas durante a competição.
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

- **3 times:** TA, TB e TC, com IDs estáveis (`ta`, `tb`, `tc`), nomes-base fixos, nome de exibição e logo opcionais. URLs são baseadas nos IDs; a interface mostra apenas o nome de exibição ou o nome-base.
- Elencos de 7 a 9 jogadoras ativas.
- Cadastro de jogadoras com apelido obrigatório, posição opcional e time.
- Calendário com **6 jogos classificatórios em turno e returno + 1 semifinal + 1 final**.
- Registro de resultados, gols, assistências e cartões.
- Classificação automática com critérios de desempate.
- Semifinal com vantagem do empate para o 2º colocado.
- Final com vantagem do empate para o 1º colocado.
- Definição automática dos semifinalistas e finalistas por snapshots validados.
- Pódio de três posições: campeã, vice-campeã e 3ª colocada.
- Estatísticas individuais e coletivas das 8 partidas oficiais.
- Páginas: Início, Jogos, Classificação, Times, Estatísticas e Fase final.
- Validação automática dos dados antes da publicação.
- Publicação no GitHub Pages.
- Tema claro por padrão e tema escuro selecionável, com preferência salva no navegador.
- Layout mobile-first, em português do Brasil e acessível. O único JavaScript no cliente é o necessário para o tema.

### 6.2 Fora do escopo do MVP

- Área administrativa com login.
- Banco de dados ou backend próprio.
- Cronômetro, placar ao vivo, tempos técnicos e controle de faltas.
- Escalação e controle de presença.
- Fotos, nomes completos, números de camisa, dados de contato ou data de nascimento.
- Histórico de edições anteriores.
- Notificações, chat, pagamentos, streaming ou ingressos.
- W.O. automático e detecção automática de ausência ou de jogadoras em quadra.
- Partida de 3º lugar e 4º lugar.
- Prorrogação, disputa de pênaltis, shootout ou cobranças alternadas.
- Amistoso do 3º colocado ou qualquer partida não oficial.
- Arbitragem, materiais, logística e cerimonial do evento.
- Impressão/PDF e analytics.
- Login para atletas.
- Página de Regulamento no MVP (adiada; ver §6.3).

### 6.3 Adiado e futuro

| Item | Situação | Observação |
|---|---|---|
| **FR-10 — Regulamento** | **ADIADO** | Sem rota, link, página ou placeholder no MVP. O 404 cobre eventual URL antiga. |
| **FR-20 — Histórico de alterações** | **FUTURO** | Pode ser avaliado em versões futuras; não é obrigatório no MVP. |

---

## 7. Regras da competição

### 7.1 Formato

- **3 times:** TA, TB e TC.
- **Fase classificatória:** todos contra todos, em **turno e returno**, totalizando **6 partidas**. Cada time joga **4 partidas** e cada par de times tem **um jogo em casa para cada lado**.
- **Pontuação da fase classificatória:** vitória = 3 pontos; empate = 1 ponto; derrota = 0 ponto.
- **Classificação:** define 1º, 2º e 3º colocados. Apenas as 6 partidas de grupo contam para esta tabela.
- **Semifinal:** **2º x 3º**, em partida única. O **2º colocado tem vantagem do empate** e joga como mandante.
- **Final:** **1º x vencedora da semifinal**, em partida única. O **1º colocado tem vantagem do empate** e joga como mandante.
- **Empates:** uma partida empatada termina no tempo normal. **Não há prorrogação, disputa de pênaltis, shootout ou cobranças alternadas.** Na semifinal, o empate classifica o 2º colocado; na final, o empate dá o título ao 1º colocado.
- **3ª colocada:** é a **perdedora da semifinal**. **Não há disputa de 3º x 4º, partida de 3º lugar nem 4º lugar.**
- **Pódio:** campeã (vencedora da final), vice-campeã (perdedora da final) e 3ª colocada (perdedora da semifinal).
- **W.O. na semifinal ou na final:** o vencedor administrativo avança ou conquista o título; o W.O. prevalece sobre a vantagem do empate.
- **Total:** **8 partidas oficiais** (g1…g6, semifinal e final).

### 7.2 Elenco

- Cada time tem **7 a 9 jogadoras ativas**, sem contar comissão técnica.
- Campos da jogadora: **apelido** (obrigatório), **posição** (opcional: goleira ou linha) e **time** (obrigatório).
- O apelido é a identidade pública da jogadora. Deve ser **único dentro do time** e pode se repetir entre times diferentes.
- A mesma jogadora não pode estar em dois times.
- O elenco é **flexível**: novas alunas podem ser incluídas a qualquer momento, inclusive após o início da copa, desde que:
  - o time tenha vaga (no máximo **9 jogadoras ativas simultaneamente**);
  - a jogadora não esteja em outro time;
  - a inclusão seja feita antes da partida em que ela vai atuar.
- A nova jogadora fica elegível a partir da próxima partida do time. Não há registro retroativo de eventos.
- A saída do elenco ativo é registrada com `leftAt`; ela **preserva o histórico** de gols, assistências e cartões e **libera a vaga** para outra jogadora. O limite de 9 é de jogadoras ativas simultâneas, não de IDs já cadastrados.
- Se o time já estiver com 9 jogadoras ativas, a organização decide como acomodar uma nova aluna; o site bloqueia a 10ª ativa.
- Uma jogadora que já participou de uma partida **não pode trocar de time** nesta edição.
- O sistema bloqueia a 10ª jogadora ativa e sinaliza elenco incompleto quando houver menos de 7. Times incompletos não impedem a publicação do site, mas ficam visivelmente sinalizados para a organização.
- O badge público **“Elenco em formação”** aparece somente quando o time tem **menos de 5 atletas ativas**. Entre 5 e 6, a pendência fica apenas no aviso de build; não há badge público.
- O mínimo de **3 jogadoras em quadra** é regra de jogo, não regra de elenco. O site não detecta quantas jogadoras estão em quadra; o W.O. é registrado manualmente.

### 7.3 Partida

- **2 tempos de 20 minutos.**
- **1 tempo técnico de 1 minuto por time por tempo**, não acumulável entre os tempos.
- **Intervalo de 10 minutos.**
- **5 jogadoras em quadra**, incluindo a goleira.
- Mínimo de **3 jogadoras** para começar ou continuar uma partida.
- **Substituições ilimitadas.**
- O produto não controla cronômetro, tempo técnico, faltas ou superioridade numérica. Essas regras ficam na organização/arbitragem.
- Status de partida no modelo:
  - `scheduled`: agendada; `date` obrigatória e `startsAt` opcional;
  - `finished`: encerrada; exige `startsAt` e permite eventos ou W.O.;
  - `postponed`: adiada; não tem eventos nem W.O.
- Uma partida `scheduled` com data/horário já passados é exibida como **“Resultado pendente”** e não é tratada como próximo jogo.

### 7.4 Critérios de desempate

A classificação da fase classificatória segue a ordem abaixo:

1. **Confronto direto**, aplicado apenas quando **exatamente dois times** estão empatados em pontos.
   - Considera os **dois jogos** entre os times empatados, somando os pontos conquistados em cada um.
   - Se a soma de pontos for igual, considera o **saldo de gols agregado** dos dois jogos.
   - Se o saldo agregado também for igual, segue para o próximo critério.
   - O confronto direto só é aplicado se **os dois jogos estiverem `finished`**. Se um deles não estiver encerrado, o critério é ignorado e seguem os próximos.
   - W.O. conta como **3x0** para o vencedor no confronto direto.
   - Quando um grupo de 3 ou mais times empatados é reduzido a exatamente dois por um critério anterior, o confronto direto volta a ser aplicado a esses dois.
2. **Número de vitórias.**
3. **Saldo de gols** (gols pró menos gols contra).
4. **Gols pró.**
5. **Menos gols contra.**
6. **Pontos disciplinares**, com menor pontuação tendo vantagem:
   - cartão amarelo = 1 ponto;
   - cartão vermelho = 3 pontos;
   - **segundo amarelo no mesmo jogo** é convertido em vermelho e vale **3 pontos disciplinares no total**. O segundo amarelo não soma outro ponto de amarelo. O registro da jogadora mostra “2º amarelo → vermelho”.
7. **Sorteio**, realizado pela organização, com a ordem final registrada manualmente na fonte de dados em `drawOrder`.

Observações:

- Com **3 ou mais times empatados**, o confronto direto não é aplicado; segue-se para vitórias, saldo, gols pró, menos gols contra, cartões e sorteio.
- A classificação considera **apenas as 6 partidas da fase classificatória**.
- Resultados e cartões da **semifinal e da final** não alteram a classificação.
- O `drawOrder` é um registro manual da ordem vigente. Se o sorteio for refeito, ele pode ser atualizado; o MVP não mantém histórico de sorteios.

### 7.5 Cartões e suspensão

- Cartão amarelo é advertência; cartão vermelho é expulsão.
- Um segundo amarelo no mesmo jogo gera vermelho.
- Cartão vermelho, direto ou por segundo amarelo, **suspende a jogadora da próxima partida real do time** na competição.
- A “próxima partida real” considera o caminho do time no chaveamento:
  - o 1º colocado não disputa a semifinal; após a fase classificatória, sua próxima partida é a final;
  - o 2º e o 3º colocados disputam a semifinal; um vermelho na última partida de grupo é cumprido na semifinal;
  - um vermelho na semifinal é cumprido na final se o time se classificar; se o time for eliminado, não há partida seguinte e a suspensão não tem efeito;
  - um vermelho na final não tem partida seguinte e não tem efeito.
- Se o time não tiver próxima partida, a suspensão não tem efeito.
- Não há suspensão por acúmulo de cartões amarelos.
- A jogadora suspensa não pode ter eventos registrados na partida que ela não pode disputar; o sistema deve alertar e bloquear.
- Cartões da semifinal e da final contam para as estatísticas e para a suspensão, mas **não** alteram a classificação.
- Cartões em W.O. são permitidos apenas nos motivos `insufficient_players` e `withdrawal`; `no_show` não tem eventos.

### 7.6 Gols, assistências e placar

- O placar de cada partida é **derivado dos gols registrados**. Não existe placar digitado separadamente.
- Cada gol é um evento vinculado à **jogadora marcadora**.
- A assistência é **opcional**, vinculada a uma jogadora do mesmo time, diferente da marcadora.
- A assistência é **proibida** em gol de pênalti e em gol contra.
- O minuto do gol, da assistência e do cartão é **opcional**.
- Tipos de gol:
  - **Normal:** conta para o placar e para a artilharia da marcadora.
  - **Pênalti no tempo normal:** conta para o placar e para a artilharia.
  - **Gol contra:** vinculado à jogadora que marcou contra, mas conta para o time adversário e **não** entra na artilharia dela; não tem assistência.
- Gols, assistências e cartões da semifinal e da final contam para as estatísticas individuais.
- Não há disputa de pênaltis nem gols de shootout.
- Uma jogadora só pode ser vinculada a um evento se estiver no elenco do time naquela partida e elegível no início dela.

### 7.7 Fase final

- A **semifinal** é disputada entre **2º e 3º colocados** da fase classificatória.
- A **final** é disputada entre o **1º colocado** e a **vencedora da semifinal**.
- O confronto da semifinal é registrado em um snapshot `semifinalists`, no formato `[2º, 3º]`, preenchido somente quando as 6 partidas de grupo estiverem encerradas e igual à classificação final.
- O confronto da final é registrado em um snapshot `finalists`, no formato `[1º, vencedora da semifinal]`, preenchido somente quando a semifinal estiver encerrada.
- A ordem dos snapshots define o mando de campo e a **vantagem do empate**: o primeiro time é o mandante e avança ou conquista o título em caso de empate.
- **Semifinal empatada:** o 2º colocado avança; o 3º colocado é a 3ª colocada.
- **Final empatada:** o 1º colocado é campeão; a vencedora da semifinal é vice-campeã.
- **Não há prorrogação nem pênaltis.** O placar do tempo normal é o placar oficial; a classificação ou o título em caso de empate é uma informação separada, derivada da vantagem.
- W.O. na semifinal define o vencedor administrativo, que avança; W.O. na final define o título conforme o vencedor administrativo. O W.O. prevalece sobre a vantagem do empate.
- Se uma correção após a semifinal mudar os semifinalistas esperados, o build **falha** listando os semifinalistas antigos e os novos; a organização deve reconciliar os dados e explicar a correção em `notices`.
- Se uma correção após a final mudar os finalistas, o build **falha** listando os finalistas antigos e os novos; atualizar `finalists` é a confirmação explícita da mudança. A correção também deve ser explicada em `notices`.
- A 3ª colocada é a **perdedora da semifinal**; **não há disputa de 3º lugar nem 4º lugar**.
- O pódio tem **campeã, vice-campeã e 3ª colocada**.

### 7.8 Calendário e local

| Data | Partidas |
|---|---|
| **24/11/2026** | TA x TB (g1) e TC x TA (g2) |
| **26/11/2026** | TB x TC (g3) e TB x TA (g4) |
| **01/12/2026** | TA x TC (g5) e TC x TB (g6) |
| **03/12/2026** | Semifinal: 2º x 3º e Final: 1º x vencedora da semifinal |

- Cada time joga **duas vezes** em 24/11, 26/11 e 01/12; os horários devem ser distintos e respeitar a ordem canônica g1 → g2 → g3 → g4 → g5 → g6 → semifinal → final. A semifinal e a final acontecem no mesmo dia (03/12), com horários distintos, a semifinal primeiro.
- Horários exatos: **a definir**.
- Local: Vila Mariana, São Paulo. O nome da instituição não deve aparecer na interface pública.
- Se uma partida for adiada, a organização atualiza `status` para `postponed`, ajusta `date`/`startsAt` e, quando remarcar, volta para `scheduled`.
- **W.O.:** é registrado manualmente, com placar fixo **3x0** para o vencedor. Motivos: `no_show`, `insufficient_players` ou `withdrawal`. Não há gols ou assistências fictícios. Cartões são permitidos em `insufficient_players`/`withdrawal`; `no_show` não tem eventos. O site não detecta ausência nem automatiza retirada de time; a organização registra um W.O. por partida restante. W.O. é permitido na semifinal e na final.
- Não há partida de 3º lugar nem amistoso.

### 7.9 Correções, sorteio e avisos

- Correções de resultados e eventos recalculam classificação, estatísticas, suspensões, semifinalistas, finalistas e pódio.
- `semifinalists` é o snapshot oficial da semifinal; depois da semifinal, uma correção que mude os semifinalistas bloqueia o build até os dados serem reconciliados.
- `finalists` é o snapshot oficial da final; depois da final, uma correção que mude os finalistas bloqueia o build até o snapshot ser atualizado.
- `drawOrder` é o registro manual da ordem do sorteio vigente; se o sorteio for refeito, ele pode ser atualizado.
- `notices` é o canal público para explicar correções, adiamentos e decisões operacionais; a interface exibe um banner global.
- O aviso de build é o canal operacional; nenhum dos dois é obrigatório para o build passar, mas ambos são recomendados.

---

## 8. Requisitos funcionais

| ID | Requisito | Prioridade | Critério de aceite resumido |
|---|---|---|---|
| FR-01 | Fonte de dados única e versionada com edição, times, jogadoras, partidas e eventos | Obrigatório | O site é gerado a partir de uma única fonte; não há dados duplicados ou editados manualmente no HTML |
| FR-02 | Validação automática dos dados | Obrigatório | Dados inválidos bloqueiam a publicação com mensagem clara e indicação do problema |
| FR-03 | Times e elencos | Obrigatório | Exibir 3 times, elencos com apelido e posição; nome de exibição e logo opcionais sem mudar ID/URL |
| FR-04 | Calendário de jogos | Obrigatório | Exibir as 8 partidas oficiais agrupadas por data, com status, placar e local |
| FR-05 | Detalhe da partida | Obrigatório | Exibir placar derivado dos gols, eventos de gol, assistência e cartões |
| FR-06 | Classificação automática | Obrigatório | Aplicar 3/1/0 e todos os critérios de desempate na ordem definida, apenas nas 6 partidas de grupo |
| FR-07 | Fase final e pódio | Obrigatório | Exibir semifinal 2º x 3º, final 1º x vencedora da semifinal, campeã, vice-campeã e 3ª colocada; sem 3º x 4º e sem 4º lugar |
| FR-08 | Estatísticas individuais e coletivas | Obrigatório | Artilharia, assistências, cartões e gols contra vinculados à jogadora; estatísticas do time com V/E/D no tempo normal nas 8 partidas oficiais |
| FR-09 | Página inicial | Desejável | Exibir próximo jogo, últimos resultados, resumo da classificação e destaques |
| FR-10 | Página de Regulamento | **ADIADO** | Sem rota, link, página ou placeholder no MVP |
| FR-11 | Layout mobile-first e acessível | Obrigatório | Navegação e tabelas funcionam em celular; contraste, foco e semântica adequados |
| FR-12 | Publicação no GitHub Pages | Obrigatório | Site público, sem login, atualizado após a publicação da fonte de dados |
| FR-13 | Suspensões | Obrigatório | Exibir jogadoras suspensas e a partida que perdem; bloquear eventos indevidos; considerar o caminho do time no chaveamento |
| FR-14 | Correções e avisos | Obrigatório | Correções recalculam classificação, estatísticas e chaveamento; alertar se semifinalistas ou finalistas mudarem após a respectiva partida; `notices` gera banner |
| FR-15 | Flexibilidade de elenco | Obrigatório | Permitir inclusão de novas alunas dentro do limite de 9 ativas, com elegibilidade a partir da próxima partida |
| FR-16 | Edição 2026 | Obrigatório | Exibir apenas 2026, com estrutura preparada para edições futuras |
| FR-17 | Privacidade | Obrigatório | Exibir apenas apelido, posição, time e estatísticas; sem nome completo, foto, contato, camisa ou data de nascimento |
| FR-18 | Nome de exibição | Obrigatório | Usar “Copa de Futsal Feminino Vila Mariana 2026”; não exibir o nome da instituição na interface |
| FR-19 | Compartilhamento | Desejável | Título e descrição adequados para compartilhamento do link |
| FR-20 | Histórico de alterações | **FUTURO** | Não obrigatório no MVP; pode ser avaliado em versões futuras |
| FR-21 | Tema claro e escuro | Desejável | Claro por padrão; alternância acessível; preferência persistida localmente no navegador |

### 8.1 Regras de validação obrigatórias

- Exatamente **3 times** na edição 2026, com IDs `ta`, `tb` e `tc`.
- Exatamente **8 partidas oficiais**: `g1`…`g6`, `semi` e `final`.
- Cada time com no máximo **9 jogadoras ativas simultaneamente**; menos de 7 gera aviso.
- Apelido único dentro do time após normalização.
- Jogadora não pode estar em dois times.
- Evento de gol, assistência ou cartão deve referenciar jogadora do elenco do time na partida e elegível no início dela.
- Assistência deve ser de jogadora do mesmo time da marcadora, diferente dela, e é proibida em pênalti e em gol contra.
- Gol contra não pode ter assistência.
- Placar deve ser derivado dos gols; campo de placar materializado é proibido.
- A **semifinal** deve ser **2º x 3º** conforme a classificação; a **final** deve ser **1º x vencedora da semifinal**; não há 3º x 4º.
- `semifinalists` deve ser nulo com grupo incompleto e igual à classificação quando o grupo estiver completo; divergência após a semifinal bloqueia o build.
- `finalists` deve ser nulo com semifinal incompleta e igual ao esperado quando a semifinal estiver completa; divergência após a final bloqueia o build.
- A ordem dos snapshots define mando e vantagem do empate; não há campo separado de vantagem.
- `drawOrder` deve ser uma permutação dos 3 times ou nulo; é exigido quando um empate chega ao sorteio na classificação final.
- Jogadora suspensa não pode ter evento na partida em que está suspensa, considerando o caminho do time no chaveamento e a ausência de semifinal para o 1º colocado.
- Datas e horários devem ser válidos e coerentes com America/Sao_Paulo.
- Não pode haver referência a time, jogadora, partida ou aviso inexistente.
- W.O. deve ser `finished`, ter vencedor participante, motivo válido, sem gols/assistências e sem shootout; `no_show` não tem eventos; cartões só em `insufficient_players`/`withdrawal`. W.O. é permitido na semifinal e na final e prevalece sobre a vantagem do empate.
- Campos de partida de shootout ou de amistoso são proibidos e devem gerar mensagem de migração clara.
- Campos de privacidade proibidos: nome completo, foto, contato, camisa, data de nascimento, telefone, e-mail, endereço ou redes sociais.

---

## 9. Requisitos não funcionais

- **Publicação:** GitHub Pages, site estático, sem backend próprio.
- **Acesso:** público, sem login; leitura apenas.
- **Atualização:** após a publicação da fonte de dados, o site é reconstruído e publicado automaticamente.
- **Performance:** carregamento rápido em celular e conexão 4G; assets leves.
- **Acessibilidade:** WCAG 2.2 AA, contraste adequado, navegação por teclado, foco visível, tabelas semânticas, textos alternativos e respeito a `prefers-reduced-motion`.
- **Compatibilidade:** versões recentes de Chrome, Safari, Firefox e Edge; mobile-first; 320px sem overflow horizontal da página.
- **Idioma:** português do Brasil.
- **Fuso horário:** America/Sao_Paulo.
- **Privacidade:** apenas apelido, posição, time e estatísticas; sem cookies de rastreamento ou analytics de terceiros.
- **Confiabilidade:** cálculos determinísticos; a mesma fonte de dados gera sempre a mesma classificação.
- **Manutenibilidade:** fonte de dados legível por humanos, validação clara e histórico via Git.
- **Segurança:** nenhum segredo no repositório público; sem autenticação no MVP.
- **Disponibilidade:** depende do GitHub Pages; sem SLA. Em caso de indisponibilidade, a fonte de dados versionada permanece como backup.
- **JavaScript no cliente:** somente um script local mínimo para inicializar, alternar e persistir o tema; sem frameworks, hidratação, chamadas externas ou outros usos de estado.
- **Tema:** o claro é o padrão, independentemente da configuração do sistema. O tema escolhido fica em `localStorage` no navegador; sem valor salvo ou se o armazenamento falhar, usar claro.
- **Design:** cores, tipografia, espaçamento, raios, sombras e movimento vêm de tokens do projeto; a referência visual interna não vai para o build.

---

## 10. Páginas e navegação

### 10.1 Início

- Próximo jogo ou próxima rodada.
- Últimos resultados.
- Resumo da classificação (3 times).
- Destaques: artilheira, líder de assistências.
- Atalho para a fase final quando definida.
- Estados especiais: antes da copa, durante a classificatória, classificatória encerrada, após a semifinal e após a final.
- Partida `scheduled` vencida aparece como “Resultado pendente” e não como próximo jogo.

### 10.2 Jogos

- Lista por data, com as **8 partidas oficiais**.
- Cada partida mostra: times, data, horário, local, status e placar.
- Detalhe da partida: gols, assistências, cartões e minuto quando informado.
- Sem prorrogação, pênaltis ou shootout.

### 10.3 Classificação

- Tabela: Posição, Time, Pontos, Jogos, Vitórias, Empates, Derrotas, Gols pró, Gols contra, Saldo, Cartões amarelos, Cartões vermelhos e Pontos disciplinares.
- Explicação dos critérios de desempate, incluindo o confronto direto de dois jogos.
- Indicação de empate que exigiu sorteio.
- Atualização automática após cada resultado.
- A classificação usa apenas as 6 partidas de grupo; a semifinal e a final não entram.

### 10.4 Times

- 3 times com ID estável, nome-base (`Time A`, `Time B`, `Time C`), nome de exibição opcional, abreviação, logo opcional e elenco. A interface usa o nome de exibição quando existe; caso contrário, usa o nome-base. O nome e o logo podem ser atualizados sem alterar IDs ou URLs.
- Cada jogadora: apelido, posição, gols, assistências, cartões e status de suspensão.
- Estatísticas coletivas: jogos, V/E/D no tempo normal, GP/GC/SG, cartões e pontos disciplinares nas 8 partidas oficiais.
- Uma semifinal ou final empatada conta como empate em V/E/D; a definição por vantagem do empate é exibida separadamente e não altera o placar.
- Badge “Elenco em formação” quando houver menos de 5 atletas ativas.
- Jogadoras com `leftAt` e histórico aparecem em seção separada, com a marca “fora do elenco ativo”.

### 10.5 Estatísticas

- **Artilharia:** gols em todas as 8 partidas oficiais, incluindo pênaltis do tempo normal e excluindo gols contra. Ordenação: gols, assistências, apelido, time.
- **Assistências:** ordenação: assistências, gols, apelido, time.
- **Cartões:** amarelos, vermelhos e pontos disciplinares por jogadora e por time.
- **Gols contra:** separados, sem entrada na artilharia.
- Atletas fora do elenco ativo com eventos aparecem com marca textual.

### 10.6 Fase final

- **Semifinal:** 2º x 3º, com indicação da vantagem do empate para o 2º colocado.
- **Final:** 1º x vencedora da semifinal, com indicação da vantagem do empate para o 1º colocado.
- A final pode ser exibida antes da semifinal com o 1º colocado definido e a indicação “Vencedora da semifinal”; não usar “Confrontos a definir” quando o 1º já é conhecido.
- Placar do tempo normal; em caso de empate, indicar textualmente quem avançou ou foi campeã pela vantagem.
- W.O. exibido com o placar administrativo e o vencedor.
- Campeã, vice-campeã e 3ª colocada.
- Estado “a definir” antes da classificação.
- Não há card, rota ou link de disputa de 3º lugar nem de amistoso.

### 10.7 Regulamento

- **ADIADO no MVP.**
- Não há rota, link, item de navegação, página ou placeholder.
- O 404 cobre eventual URL antiga.

---

## 11. Fluxos principais

### 11.1 Antes da copa

1. Organização cria a fonte de dados com edição, times, elencos e calendário.
2. Validação automática verifica limites, apelidos, referências, datas, confrontos e a sequência das 8 partidas.
3. Site é publicado.
4. Público consulta times, jogos e classificação.

### 11.2 Após cada partida

1. Organização registra gols, assistências e cartões.
2. Placar é derivado dos gols.
3. Classificação, estatísticas e suspensões são recalculadas.
4. Site é publicado.
5. Público consulta o resultado atualizado.

### 11.3 Fim da fase classificatória

1. Classificação final é calculada com todos os critérios.
2. Se houver empate persistente, organização realiza sorteio e registra `drawOrder`.
3. Semifinalistas são gravados em `semifinalists` no formato `[2º, 3º]`.
4. Site publica a semifinal e a final com o 1º colocado e a indicação “Vencedora da semifinal”.
5. A 3ª colocada será a perdedora da semifinal; não há partida de 3º lugar.

### 11.4 Semifinal

1. Organização registra o resultado da semifinal.
2. Se houver empate no tempo normal, o 2º colocado avança pela vantagem do empate.
3. Se houver W.O., o vencedor administrativo avança; o W.O. prevalece sobre a vantagem.
4. Finalistas são gravados em `finalists` no formato `[1º, vencedora da semifinal]`.
5. A perdedora da semifinal é a 3ª colocada.
6. Site publica o confronto da final.

### 11.5 Final

1. Organização registra o resultado da final.
2. Se houver empate no tempo normal, o 1º colocado é campeão pela vantagem do empate.
3. Se houver W.O., o vencedor administrativo é campeão.
4. Site publica campeã, vice-campeã e 3ª colocada.

### 11.6 Correção

1. Organização edita o resultado ou evento.
2. Validação e recálculo são executados.
3. Se a correção alterar os semifinalistas depois da semifinal, o build falha listando antigos e novos; a organização reconcilia os dados e explica a correção em `notices`.
4. Se a correção alterar os finalistas depois da final, o build falha listando antigos e novos; a organização atualiza `finalists` para confirmar e explica a correção em `notices`.
5. Se a correção alterar um empate que dependia de sorteio, a organização revisa `drawOrder`.
6. Organização adiciona um `notice` explicando a correção.
7. Site é republicado.

---

## 12. Critérios de aceite

1. **Times e elencos**
   - Dado uma edição com 3 times, quando um time tiver 9 jogadoras ativas simultâneas, então a validação bloqueia a inclusão.
   - Quando um time tiver menos de 7 jogadoras ativas, então o site sinaliza elenco incompleto.
   - Quando um time tiver menos de 5 atletas ativas, então o badge “Elenco em formação” aparece; entre 5 e 6, não aparece.
   - Quando duas jogadoras do mesmo time tiverem o mesmo apelido, então a validação bloqueia.
   - Quando a mesma jogadora estiver em dois times, então a validação bloqueia.
   - Quando uma jogadora com `leftAt` tiver histórico, então ele é preservado e a vaga é liberada.

2. **Pontuação**
   - Vitória soma 3 pontos; empate soma 1; derrota soma 0.
   - Apenas as 6 partidas de grupo contam para a classificação.

3. **Desempate entre dois times**
   - Dois times empatados em pontos: a soma dos pontos dos dois jogos do confronto direto decide.
   - Se a soma de pontos for igual, o saldo agregado dos dois jogos decide.
   - Se o saldo agregado for igual, aplica-se o próximo critério.
   - Se um dos dois jogos não estiver `finished`, o confronto direto é ignorado.
   - W.O. conta como 3x0 no confronto direto.

4. **Desempate entre três ou mais times**
   - O confronto direto não é aplicado.
   - A ordem segue vitórias, saldo, gols pró, menos gols contra, pontos disciplinares e sorteio.
   - Se um critério reduzir o grupo a dois times, o confronto direto volta a valer para esses dois, considerando os dois jogos.

5. **Cartões**
   - Amarelo = 1 ponto; vermelho = 3 pontos.
    - Segundo amarelo no mesmo jogo = 3 pontos disciplinares no total para o time.
   - Vermelho suspende a jogadora da próxima partida real do time, considerando o chaveamento e a ausência de semifinal para o 1º colocado.
   - Um vermelho na semifinal suspende a final apenas se o time se classificar; um vermelho na final não tem efeito.
   - Não há suspensão por acúmulo de amarelos.
   - Cartões da semifinal e da final contam para estatísticas e suspensão, não para a classificação.
   - Cartões de W.O. contam em `insufficient_players`/`withdrawal`; `no_show` não tem eventos.

6. **Gols e assistências**
   - O placar é a soma dos gols registrados.
   - Gol contra conta para o time adversário e não entra na artilharia da jogadora.
   - Assistência é opcional, do mesmo time e diferente da marcadora; é proibida em pênalti e em gol contra.
   - Pênalti no tempo normal conta para artilharia; não há pênaltis de disputa.

7. **Semifinal**
   - É disputada entre 2º e 3º colocados.
   - O 2º colocado tem vantagem do empate e mando de campo.
   - Empate no tempo normal classifica o 2º colocado.
   - Não há prorrogação nem pênaltis.
   - W.O. é permitido e prevalece sobre a vantagem do empate.

8. **Final**
   - É disputada entre o 1º colocado e a vencedora da semifinal.
   - O 1º colocado tem vantagem do empate e mando de campo.
   - Empate no tempo normal dá o título ao 1º colocado.
   - Não há prorrogação nem pênaltis.
   - W.O. é permitido e prevalece sobre a vantagem do empate.
   - Uma semifinal ou final empatada conta como empate em V/E/D nas estatísticas do time.

9. **Pódio e 3ª colocada**
   - A 3ª colocada é a perdedora da semifinal.
   - O pódio exibe campeã, vice-campeã e 3ª colocada.
   - Não há 4º lugar, disputa de 3º lugar ou partida de consolação.

10. **Snapshots e correções**
    - `semifinalists` é nulo com grupo incompleto e igual à classificação quando o grupo termina.
    - `finalists` é nulo com semifinal incompleta e igual ao esperado quando a semifinal termina.
    - A ordem dos snapshots define mando e vantagem do empate.
    - Se uma correção mudar os semifinalistas depois da semifinal, o build falha listando antigos e novos.
    - Se uma correção mudar os finalistas depois da final, o build falha até `finalists` ser atualizado.
    - `notices` gera banner global.

11. **Elenco flexível**
    - Nova jogadora pode ser incluída se o time tiver menos de 9 ativas.
    - Ela fica elegível a partir da próxima partida.
    - Não há eventos retroativos.
    - Jogadora que já atuou não pode trocar de time.
    - `leftAt` preserva histórico e libera vaga.

12. **Suspensão**
    - Jogadora suspensa não pode ter eventos na partida que perde.
    - O site exibe a suspensão e a partida afetada.
    - A suspensão considera o caminho real do time: 1º vai direto à final; 2º e 3º disputam a semifinal; o vencedor da semifinal disputa a final.

13. **Publicação e acesso**
    - Site público, sem login, no GitHub Pages.
    - Fonte de dados versionada e validada.
    - Nenhum dado sensível além do apelido.

14. **Interface**
    - Nome de exibição sem o nome da instituição.
    - Tema claro padrão e escuro selecionável; preferência persistida no navegador.
    - Layout mobile-first, em português e acessível; JavaScript limitado à funcionalidade de tema.
    - Páginas Início, Jogos, Classificação, Times, Estatísticas e Fase final acessíveis.
    - A fase final exibe semifinal e final, com a vantagem do empate indicada textualmente.
    - `/regulamento/` não existe e não aparece em links.

15. **Tema**
    - Sem preferência salva, o site é exibido no tema claro.
    - O controle de tema funciona por teclado e informa seu estado acessivelmente.
    - A escolha escura é mantida entre páginas e recarregamentos no mesmo navegador.
    - Se `localStorage` estiver indisponível, a página inicia em claro e a alternância ainda funciona na visita atual.
    - Contraste AA, foco visível, mobile e impressão clara funcionam nos dois temas.

---

## 13. Cronograma

| Data | Marco |
|---|---|
| **09/11/2026** | PRD v1.0 proposto |
| **12/11/2026** | PRD v1.1 e SPEC v1.2 alinhados às decisões de formato |
| **18/11/2026** | PRD v2.0 e SPEC v2.0 alinhados ao novo formato com semifinal |
| **18/11 a 20/11/2026** | Implementação do MVP v2.0 |
| **21/11 a 23/11/2026** | Testes, dados de exemplo e congelamento do escopo |
| **24/11/2026** | Primeira rodada (g1/g2) |
| **26/11/2026** | Segunda rodada (g3/g4) |
| **01/12/2026** | Terceira rodada (g5/g6) |
| **03/12/2026** | Semifinal (2º x 3º) e final (1º x vencedora da semifinal) |
| **04/12/2026** | Retrospectiva e registro de melhorias |

**Contingência:** se o site não estiver pronto até 24/11, a organização pode registrar os dados na fonte versionada e publicar o site assim que possível, sem alterar a condução da copa.

---

## 14. Riscos e mitigações

| Risco | Impacto | Mitigação |
|---|---|---|
| Prazo curto até 24/11 | Alto | Congelar escopo, priorizar os itens obrigatórios, fazer teste completo até 23/11 |
| Carga física: um time joga duas vezes em 24/11, 26/11 e 01/12 | Alto | Calendário explícito; horários distintos; ordem canônica validada; a organização controla aquecimento/recuperação |
| Erro no lançamento de dados | Alto | Validação automática, exemplos, revisão antes de publicar |
| Interpretação errada dos desempates | Alto | Critérios explícitos, confronto direto de dois jogos e testes com casos de exemplo |
| Interpretação errada da vantagem do empate | Alto | Regra explícita na UI, rótulos textuais, testes unitários e E2E |
| Semifinalistas ou finalistas errados | Alto | Snapshots `semifinalists`/`finalists` validados; build falha com antigos/novos; `notices` para o público |
| Correção após a semifinal ou a final | Alto | Bloqueio do build com antigos/novos; reconciliação explícita e `notice` |
| W.O. mal registrado | Médio | Schema de `walkover`; validação de motivo/eventos; UI explícita; W.O. prevalece sobre a vantagem |
| Elenco flexível gerar inconsistência | Médio | `joinedAt`/`leftAt`, limite de 9 ativas, apelido único, vínculo imutável |
| Suspensão aplicada à partida errada | Médio | Ordem canônica, caminho do time no chaveamento, validação de cronologia e testes |
| Sorteio refeito sem atualizar `drawOrder` | Médio | `drawOrder` é registro vigente; validação e `notice` |
| Cache do GitHub Pages | Baixo | Verificar após o deploy e orientar recarregar a página |
| Nome da instituição ou marca na interface | Médio | Revisão de textos públicos; nome de exibição definido no PRD |
| Contraste insuficiente | Médio | Tokens medidos, testes de contraste e axe |
| Overflow em 320px | Médio | Mobile-first; tabelas com rolagem acessível; teste E2E |
| Fonte proprietária no build | Baixo | Pilha do sistema; sem auto-hospedagem de fontes proprietárias |
| JavaScript além do tema | Médio | Build permite apenas o inicializador/alternador local do tema e limita seu orçamento |
| Build não determinístico | Médio | Funções puras, ordenação estável e lockfile |
| Perda de dados | Baixo | Histórico no Git e backup da fonte de dados |
| GitHub Pages indisponível | Baixo | Fonte versionada é o backup; sem SLA |
| Vazamento de dados pessoais | Alto | Schema estrito, revisão e mapeamento privado fora do repositório |

---

## 15. Decisões e premissas

- Nome de exibição: **Copa de Futsal Feminino Vila Mariana 2026**.
- O nome da instituição pode aparecer em documentos internos, mas não na interface pública.
- Site estático no GitHub Pages, sem backend, sem login ou área administrativa. JavaScript local é permitido somente para o tema claro/escuro.
- Fonte de dados versionada e validada; site somente leitura.
- Apenas a edição 2026, com estrutura preparada para edições futuras.
- **3 times** (`ta`, `tb`, `tc`), **6 partidas de grupo em turno e returno**, **1 semifinal** e **1 final**, totalizando **8 partidas oficiais**.
- Os IDs e URLs dos times são estáveis e independentes dos nomes de exibição; a interface mostra apenas o nome de exibição ou o nome-base. Logos locais dos times são opcionais.
- Calendário: 24/11, 26/11, 01/12 e 03/12/2026; horários a definir.
- Cada par de times tem um jogo em casa para cada lado; `g4` é `tb x ta`.
- A semifinal é **2º x 3º**, com vantagem do empate para o 2º colocado.
- A final é **1º x vencedora da semifinal**, com vantagem do empate para o 1º colocado.
- Empate encerra a partida no tempo normal; não há prorrogação, pênaltis ou shootout.
- A 3ª colocada é a perdedora da semifinal; **não há disputa de 3º lugar nem 4º lugar**.
- Pódio de três posições: campeã, vice-campeã e 3ª colocada.
- W.O. é permitido na semifinal e na final e prevalece sobre a vantagem do empate.
- `semifinalists` e `finalists` são snapshots validados; a ordem define mando e vantagem.
- Correção após a semifinal que mude semifinalistas bloqueia o build; correção após a final que mude finalistas bloqueia até atualização do snapshot.
- Confronto direto apenas para dois times, considerando os dois jogos; se os pontos empatarem, o saldo agregado decide; só vale com os dois jogos `finished`; W.O. conta 3x0.
- `drawOrder` é obrigatório apenas quando o sorteio é necessário e pode ser atualizado se o sorteio for refeito.
- Placar derivado dos gols.
- Segundo amarelo = 3 pontos para o time (1 amarelo + 1 vermelho).
- Suspensão é cumprida na próxima partida real do time, considerando o chaveamento.
- Elenco flexível, com limite de 9 ativas simultâneas e mínimo de 7 sinalizado; badge público com menos de 5.
- Jogadora que já atuou não troca de time nesta edição.
- Estatísticas do time somam grupo + semifinal + final; V/E/D pelo tempo normal; empate na semifinal ou final conta como empate.
- Sem nome completo, número de camisa, foto, contato ou data de nascimento.
- Sem escalação, cronômetro, placar ao vivo ou controle de faltas.
- Regulamento adiado no MVP; histórico de alterações é futuro.
- Sem o nome da instituição na interface pública.

---

## 16. Questões em aberto

Estas questões não bloqueiam o MVP e podem ser resolvidas pela organização durante a implementação:

- Horários exatos das partidas, incluindo os dois jogos do mesmo time em 24/11, 26/11 e 01/12 e os horários da semifinal e da final.
- Nomes definitivos dos times B e C.
- Local/quadra exata a exibir publicamente.
- Como acomodar novas alunas se todos os times estiverem com 9 ativas.
- Critério de assistência em casos duvidosos.
- Data de habilitação do GitHub Pages.
- Necessidade de impressão/PDF ou analytics no futuro.

---

## 17. Glossário

- **TA, TB, TC:** abreviações estáveis dos três times; os IDs (`ta`, `tb`, `tc`) e as URLs correspondentes não dependem do nome público editável.
- **Fase classificatória:** todos contra todos, em turno e returno, com 6 partidas.
- **Semifinal:** partida única entre o 2º e o 3º colocados, com vantagem do empate para o 2º.
- **Final:** partida única entre o 1º colocado e a vencedora da semifinal, com vantagem do empate para o 1º.
- **Vantagem do empate:** regra que classifica ou dá o título ao time melhor colocado quando a partida termina empatada no tempo normal.
- **3ª colocada:** perdedora da semifinal.
- **Confronto direto:** soma dos pontos e, se necessário, do saldo agregado dos dois jogos entre dois times empatados em pontos.
- **Saldo de gols:** gols pró menos gols contra.
- **Gols pró:** gols marcados.
- **Gols contra:** gols marcados contra o próprio time; contam para o adversário e não entram na artilharia da marcadora.
- **Gols sofridos:** gols marcados pelo adversário no gol do time.
- **Pontos disciplinares:** amarelo = 1; vermelho = 3; segundo amarelo = 3 para o time.
- **Tempo técnico:** pausa de 1 minuto por time por tempo.
- **W.O.:** vitória administrativa por 3x0; registrada manualmente, sem gols ou assistências fictícios.
- **Fonte de dados:** arquivo versionado que contém todas as informações da copa.
- **`semifinalists`:** snapshot dos dois semifinalistas, no formato `[2º, 3º]`, validado contra a classificação.
- **`finalists`:** snapshot dos dois finalistas, no formato `[1º, vencedora da semifinal]`, validado contra a classificação e o resultado da semifinal.
- **`drawOrder`:** ordem manual do sorteio vigente.

---

## 18. Aprovação

- [x] Organização da Copa
- [x] Desenvolvimento
- [x] Revisão final do PRD
