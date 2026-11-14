# PRD — Copa de Futsal Feminino Vila Mariana 2026

**Versão:** 1.1  
**Data:** 12/11/2026  
**Status:** Proposto  
**Responsável:** Organização da Copa  
**Público-alvo:** organização, desenvolvimento e jogadoras

> **Nota da v1.1:** esta versão incorpora as decisões de produto de 12/11/2026 registradas em `docs/decisoes-v1.1.md` e detalhadas na `SPEC.md`. A aprovação formal da §18 permanece pendente.

---

## 1. Contexto e problema

A Copa de Futsal Feminino Vila Mariana é uma competição anual organizada pela turma de futsal feminino do Sesc Vila Mariana. A edição de 2026 terá **3 times**, **6 partidas na fase classificatória em turno e returno** e **1 final**, totalizando **7 partidas oficiais**. No dia da final, a organização realiza também um **amistoso do 3º colocado**, tratado como evento informativo e sem efeito competitivo.

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
| `docs/decisoes-v1.1.md` | Registro histórico das decisões da v1.1; não é normativo. |

Restrições de produto já conhecidas:

- Publicação no **GitHub Pages**.
- Site **estático**, sem backend próprio e **sem JavaScript no cliente** no MVP.
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
- Exibir a fase final e o pódio de três posições.
- Garantir consistência entre placar, eventos e classificação.
- Reduzir a zero os cálculos manuais de classificação.

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
- **100% das 7 partidas oficiais** registradas ao final da copa; o amistoso é informativo e não entra nessa contagem.
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

- **3 times:** TA, TB e TC, com nomes editáveis.
- Elencos de 7 ou 8 jogadoras ativas.
- Cadastro de jogadoras com apelido obrigatório, posição opcional e time.
- Calendário com **6 jogos classificatórios em turno e returno + 1 final**.
- Registro de resultados, gols, assistências e cartões.
- Classificação automática com critérios de desempate.
- Fase final, pódio de três posições e campeã.
- Estatísticas individuais e coletivas, incluindo campanha separada nos pênaltis.
- Card informativo do **amistoso do 3º colocado**, sem efeito competitivo.
- Páginas: Início, Jogos, Classificação, Times, Estatísticas e Fase final.
- Validação automática dos dados antes da publicação.
- Publicação no GitHub Pages.
- Layout mobile-first, em português do Brasil, acessível e sem JavaScript no cliente.

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
- Amistoso tratado como partida oficial, com placar, eventos, cartões ou estatísticas.
- Arbitragem, materiais, logística e cerimonial do evento.
- Modo escuro, impressão/PDF e analytics como itens obrigatórios.
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
- **Pontuação:** vitória = 3 pontos; empate = 1 ponto; derrota = 0 ponto.
- **Fase final:** **1º x 2º na final única**. Não há semifinais.
- **3º lugar:** é o 3º colocado da classificação. **Não há disputa de 3º x 4º e não há 4º lugar.**
- A vencedora da final é campeã; a perdedora é vice-campeã; a 3ª da classificação completa o pódio.
- O **amistoso do 3º colocado** é um evento informativo no dia da final, não uma partida oficial.

### 7.2 Elenco

- Cada time tem **7 ou 8 jogadoras ativas**, sem contar comissão técnica.
- Campos da jogadora: **apelido** (obrigatório), **posição** (opcional: goleira ou linha) e **time** (obrigatório).
- O apelido é a identidade pública da jogadora. Deve ser **único dentro do time** e pode se repetir entre times diferentes.
- A mesma jogadora não pode estar em dois times.
- O elenco é **flexível**: novas alunas podem ser incluídas a qualquer momento, inclusive após o início da copa, desde que:
  - o time tenha vaga (no máximo **8 jogadoras ativas simultaneamente**);
  - a jogadora não esteja em outro time;
  - a inclusão seja feita antes da partida em que ela vai atuar.
- A nova jogadora fica elegível a partir da próxima partida do time. Não há registro retroativo de eventos.
- A saída do elenco ativo é registrada com `leftAt`; ela **preserva o histórico** de gols, assistências e cartões e **libera a vaga** para outra jogadora. O limite de 8 é de jogadoras ativas simultâneas, não de IDs já cadastrados.
- Se o time já estiver com 8 jogadoras ativas, a organização decide como acomodar a nova aluna; o site bloqueia a 9ª ativa.
- Uma jogadora que já participou de uma partida **não pode trocar de time** nesta edição.
- O sistema bloqueia a 9ª jogadora ativa e sinaliza elenco incompleto quando houver menos de 7. Times incompletos não impedem a publicação do site, mas ficam visivelmente sinalizados para a organização.
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
  - `finished`: encerrada; exige `startsAt` e permite eventos, W.O. ou shootout;
  - `postponed`: adiada; não tem eventos, W.O. nem shootout.
- Uma partida `scheduled` com data/horário já passados é exibida como **“Resultado pendente”** e não é tratada como próximo jogo.

### 7.4 Critérios de desempate

A classificação da fase classificatória segue a ordem abaixo:

1. **Confronto direto**, aplicado apenas quando **exatamente dois times** estão empatados em pontos.
   - Considera os **dois jogos** entre os times empatados, somando os pontos conquistados em cada um.
   - Se a soma de pontos for igual, considera o **saldo de gols agregado** dos dois jogos.
   - Se o saldo agregado também for igual, segue para o próximo critério.
   - O confronto direto só é aplicado se **os dois jogos estiverem `finished`**. Se um deles não estiver encerrado, o critério é ignorado e seguem os próximos.
   - W.O. conta como **1x0** para o vencedor no confronto direto.
   - Quando um grupo de 3 ou mais times empatados é reduzido a exatamente dois por um critério anterior, o confronto direto volta a ser aplicado a esses dois.
2. **Número de vitórias.**
3. **Saldo de gols** (gols pró menos gols contra).
4. **Gols pró.**
5. **Menos gols contra.**
6. **Pontos disciplinares**, com menor pontuação tendo vantagem:
   - cartão amarelo = 1 ponto;
   - cartão vermelho = 2 pontos;
   - **segundo amarelo no mesmo jogo** é convertido em vermelho: o time soma 1 ponto pelo primeiro amarelo + 2 pontos pelo vermelho = **3 pontos**. O segundo amarelo não soma outro ponto de amarelo. O registro da jogadora mostra “2º amarelo → vermelho”.
7. **Sorteio**, realizado pela organização, com a ordem final registrada manualmente na fonte de dados em `drawOrder`.

Observações:

- Com **3 ou mais times empatados**, o confronto direto não é aplicado; segue-se para vitórias, saldo, gols pró, menos gols contra, cartões e sorteio.
- A classificação considera **apenas as 6 partidas da fase classificatória**.
- Cartões e resultados da final e do amistoso não alteram a classificação.
- O `drawOrder` é um registro manual da ordem vigente. Se o sorteio for refeito, ele pode ser atualizado; o MVP não mantém histórico de sorteios.

### 7.5 Cartões e suspensão

- Cartão amarelo é advertência; cartão vermelho é expulsão.
- Um segundo amarelo no mesmo jogo gera vermelho.
- Cartão vermelho, direto ou por segundo amarelo, **suspende a jogadora da próxima partida do time** na competição.
- Se o time não tiver próxima partida, a suspensão não tem efeito.
- Não há suspensão por acúmulo de cartões amarelos.
- Cartões durante a disputa de pênaltis não entram nas estatísticas nem geram suspensão; o modelo não registra eventos de shootout.
- A jogadora suspensa não pode ter eventos registrados na partida que ela não pode disputar; o sistema deve alertar e bloquear.
- Cartões da final contam para as estatísticas e para a suspensão, mas **não** alteram a classificação.
- Cartões em W.O. são permitidos apenas nos motivos `insufficient_players` e `withdrawal`; `no_show` não tem eventos. O amistoso não tem cartões.

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
- Gols e assistências da final contam para as estatísticas individuais.
- Gols da **disputa de pênaltis** não contam para placar, artilharia ou assistências. A disputa é registrada apenas pelo placar final dos pênaltis.
- Uma jogadora só pode ser vinculada a um evento se estiver no elenco do time naquela partida e elegível no início dela.
- O amistoso não tem gols, assistências, placar ou eventos no modelo.

### 7.7 Fase final

- A final é disputada entre **1º e 2º colocados** da fase classificatória.
- O confronto é registrado em um snapshot `finalists`, preenchido somente quando as 6 partidas de grupo estiverem encerradas e igual à classificação final.
- Em caso de empate no tempo normal na final, o vencedor é definido em **disputa de pênaltis direta**: 5 cobranças alternadas e, se necessário, morte súbita.
- O resultado é exibido no formato `1 (4) x (3) 1`, com o placar dos pênaltis entre parênteses.
- O MVP registra apenas o placar dos pênaltis, sem detalhes de quem cobrou ou converteu.
- A 3ª colocada é a 3ª da classificação; **não há disputa de 3º lugar nem 4º lugar**.
- O pódio tem **campeã, vice-campeã e 3ª colocada**.
- W.O. na final define o título conforme o vencedor administrativo.
- Se uma correção após a final mudar os finalistas, o build **falha** listando os finalistas antigos e os novos; atualizar `finalists` é a confirmação explícita. A correção também deve ser explicada em `notices`.
- O amistoso do 3º colocado é exibido antes da final, como card informativo, e não altera o pódio.

### 7.8 Calendário e local

| Data | Partidas |
|---|---|
| **24/11/2026** | TA x TB (g1) e TB x TC (g2) |
| **26/11/2026** | TA x TC (g3) e TB x TA (g4) |
| **01/12/2026** | TC x TA (g5) e TC x TB (g6) |
| **03/12/2026** | Amistoso do 3º colocado (informativo) e 1º x 2º (final) |

- Cada time joga **duas vezes** em 24/11, 26/11 e 01/12; os horários devem ser distintos e respeitar a ordem canônica g1 → g2 → g3 → g4 → g5 → g6 → final.
- O amistoso acontece na mesma data da final e antes do horário da final, quando a final tiver horário definido.
- Horários exatos: **a definir**.
- Local: Vila Mariana, São Paulo. O nome da instituição não deve aparecer na interface pública.
- Se uma partida for adiada, a organização atualiza `status` para `postponed`, ajusta `date`/`startsAt` e, quando remarcar, volta para `scheduled`.
- **W.O.:** é registrado manualmente, com placar fixo **1x0** para o vencedor. Motivos: `no_show`, `insufficient_players` ou `withdrawal`. Não há gols ou assistências fictícios. Cartões são permitidos em `insufficient_players`/`withdrawal`; `no_show` não tem eventos. O site não detecta ausência nem automatiza retirada de time; a organização registra um W.O. por partida restante.
- Não há partida de 3º lugar.

### 7.9 Amistoso do 3º colocado

- O amistoso é um **metadado informativo** (`friendly`), não uma partida.
- Campos: data, horário, local e nota. A data deve ser a mesma da final; o horário deve ser anterior ao da final, quando ela tiver horário.
- Participantes, se necessário, são descritos apenas na nota, por apelido ou descrição genérica, sem dados estruturados ou dados pessoais.
- O amistoso **não** tem placar, eventos, cartões, estatísticas, suspensões, classificação, pódio ou link de jogo.
- A interface exibe o card com o rótulo **“Informativo — não é partida oficial”**, antes da final.
- Se não houver amistoso, o campo é `null` e nenhum card ou placeholder é exibido.

### 7.10 Correções, sorteio e avisos

- Correções de resultados e eventos recalculam classificação, estatísticas, suspensões e pódio.
- `finalists` é o snapshot oficial da final; uma correção que mude os finalistas depois da final bloqueia o build até o snapshot ser atualizado.
- `drawOrder` é o registro manual da ordem do sorteio vigente; se o sorteio for refeito, ele pode ser atualizado.
- `notices` é o canal público para explicar correções, adiamentos e decisões operacionais; a interface exibe um banner global.
- O aviso de build é o canal operacional; nenhum dos dois é obrigatório para o build passar, mas ambos são recomendados.

---

## 8. Requisitos funcionais

| ID | Requisito | Prioridade | Critério de aceite resumido |
|---|---|---|---|
| FR-01 | Fonte de dados única e versionada com edição, times, jogadoras, partidas e eventos | Obrigatório | O site é gerado a partir de uma única fonte; não há dados duplicados ou editados manualmente no HTML |
| FR-02 | Validação automática dos dados | Obrigatório | Dados inválidos bloqueiam a publicação com mensagem clara e indicação do problema |
| FR-03 | Times e elencos | Obrigatório | Exibir 3 times, elencos com apelido e posição, e permitir nomes editáveis |
| FR-04 | Calendário de jogos | Obrigatório | Exibir as 7 partidas oficiais agrupadas por data, com status, placar e local; o amistoso não entra na lista de jogos |
| FR-05 | Detalhe da partida | Obrigatório | Exibir placar derivado dos gols, eventos de gol, assistência, cartões e pênaltis |
| FR-06 | Classificação automática | Obrigatório | Aplicar 3/1/0 e todos os critérios de desempate na ordem definida |
| FR-07 | Fase final e pódio | Obrigatório | Exibir 1º x 2º, campeã, vice-campeã e 3ª colocada; sem 3º x 4º e sem 4º lugar |
| FR-08 | Estatísticas individuais e coletivas | Obrigatório | Artilharia, assistências, cartões e gols contra vinculados à jogadora; estatísticas do time com V/E/D no tempo normal e campanha separada nos pênaltis |
| FR-09 | Página inicial | Desejável | Exibir próximo jogo, últimos resultados, resumo da classificação e destaques |
| FR-10 | Página de Regulamento | **ADIADO** | Sem rota, link, página ou placeholder no MVP |
| FR-11 | Layout mobile-first e acessível | Obrigatório | Navegação e tabelas funcionam em celular; contraste, foco e semântica adequados |
| FR-12 | Publicação no GitHub Pages | Obrigatório | Site público, sem login, atualizado após a publicação da fonte de dados |
| FR-13 | Suspensões | Obrigatório | Exibir jogadoras suspensas e a partida que perdem; bloquear eventos indevidos |
| FR-14 | Correções e avisos | Obrigatório | Correções recalculam classificação, estatísticas e chaveamento; alertar se finalistas mudarem após a final; `notices` gera banner |
| FR-15 | Flexibilidade de elenco | Obrigatório | Permitir inclusão de novas alunas dentro do limite de 8 ativas, com elegibilidade a partir da próxima partida |
| FR-16 | Edição 2026 | Obrigatório | Exibir apenas 2026, com estrutura preparada para edições futuras |
| FR-17 | Privacidade | Obrigatório | Exibir apenas apelido, posição, time e estatísticas; sem nome completo, foto, contato, camisa ou data de nascimento |
| FR-18 | Nome de exibição | Obrigatório | Usar “Copa de Futsal Feminino Vila Mariana 2026”; não exibir o nome da instituição na interface |
| FR-19 | Compartilhamento | Desejável | Título e descrição adequados para compartilhamento do link |
| FR-20 | Histórico de alterações | **FUTURO** | Não obrigatório no MVP; pode ser avaliado em versões futuras |
| FR-21 | Amistoso do 3º colocado | Obrigatório (quando houver amistoso) | Exibir apenas como card informativo na Fase final, antes da final; sem placar, eventos, cartões, estatísticas, suspensões ou efeito competitivo |

### 8.1 Regras de validação obrigatórias

- Exatamente **3 times** na edição 2026, com IDs `ta`, `tb` e `tc`.
- Exatamente **7 partidas oficiais**: `g1`…`g6` e `final`.
- Cada time com no máximo **8 jogadoras ativas simultaneamente**; menos de 7 gera aviso.
- Apelido único dentro do time após normalização.
- Jogadora não pode estar em dois times.
- Evento de gol, assistência ou cartão deve referenciar jogadora do elenco do time na partida e elegível no início dela.
- Assistência deve ser de jogadora do mesmo time da marcadora, diferente dela, e é proibida em pênalti e em gol contra.
- Gol contra não pode ter assistência.
- Placar deve ser derivado dos gols; campo de placar materializado é proibido.
- A final deve ser **1º x 2º** conforme a classificação; não há 3º x 4º.
- `finalists` deve ser nulo com grupo incompleto e igual à classificação quando o grupo estiver completo; divergência após a final bloqueia o build.
- `drawOrder` deve ser uma permutação dos 3 times ou nulo; é exigido quando um empate chega ao sorteio na classificação final.
- Jogadora suspensa não pode ter evento na partida em que está suspensa.
- Datas e horários devem ser válidos e coerentes com America/Sao_Paulo.
- Não pode haver referência a time, jogadora, partida ou aviso inexistente.
- W.O. deve ser `finished`, ter vencedor participante, motivo válido, sem shootout e sem gols/assistências; `no_show` não tem eventos; cartões só em `insufficient_players`/`withdrawal`.
- Shootout só na final, `finished`, sem W.O., com tempo normal empatado e valores inteiros ≥0 e diferentes.
- O amistoso deve ter data igual à da final, horário anterior ao da final quando ela tiver horário, local e nota não vazios; não pode ter campos de partida.
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
- **Sem JavaScript no cliente:** o MVP não usa scripts, hidratação ou frameworks de cliente.
- **Design:** cores, tipografia, espaçamento, raios, sombras e movimento vêm de tokens do projeto; a referência visual interna não vai para o build.

---

## 10. Páginas e navegação

### 10.1 Início

- Próximo jogo ou próxima rodada.
- Últimos resultados.
- Resumo da classificação (3 times).
- Destaques: artilheira, líder de assistências.
- Atalho para a fase final quando definida.
- Estado especial: antes da copa, durante a classificatória, classificatória encerrada e após a final.
- Partida `scheduled` vencida aparece como “Resultado pendente” e não como próximo jogo.

### 10.2 Jogos

- Lista por data, com as **7 partidas oficiais**.
- Cada partida mostra: times, data, horário, local, status e placar.
- Detalhe da partida: gols, assistências, cartões, pênaltis e minuto quando informado.
- O amistoso **não** aparece na lista de jogos; ele tem card próprio na Fase final.

### 10.3 Classificação

- Tabela: Posição, Time, Pontos, Jogos, Vitórias, Empates, Derrotas, Gols pró, Gols contra, Saldo, Cartões amarelos, Cartões vermelhos e Pontos disciplinares.
- Explicação dos critérios de desempate, incluindo o confronto direto de dois jogos.
- Indicação de empate que exigiu sorteio.
- Atualização automática após cada resultado.
- A classificação usa apenas as 6 partidas de grupo; a final e o amistoso não entram.

### 10.4 Times

- 3 times com nome, abreviação e elenco.
- Cada jogadora: apelido, posição, gols, assistências, cartões e status de suspensão.
- Estatísticas coletivas: jogos, V/E/D no tempo normal, campanha nos pênaltis (V/D), GP/GC/SG, cartões e pontos disciplinares.
- A campanha nos pênaltis é exibida separadamente e não é somada a V/E/D; uma final decidida nos pênaltis conta como empate no tempo normal.
- Badge “Elenco em formação” quando houver menos de 5 atletas ativas.
- Jogadoras com `leftAt` e histórico aparecem em seção separada, com a marca “fora do elenco ativo”.

### 10.5 Estatísticas

- **Artilharia:** gols em todas as partidas oficiais, incluindo pênaltis do tempo normal e excluindo a disputa de pênaltis. Ordenação: gols, assistências, apelido, time.
- **Assistências:** ordenação: assistências, gols, apelido, time.
- **Cartões:** amarelos, vermelhos e pontos disciplinares por jogadora e por time.
- **Gols contra:** separados, sem entrada na artilharia.
- Atletas fora do elenco ativo com eventos aparecem com marca textual.
- O amistoso não entra em nenhuma estatística.

### 10.6 Fase final

- Apenas a final **1º x 2º**.
- Card informativo do amistoso, quando houver, antes da final, com o rótulo “Informativo — não é partida oficial”.
- Placar do tempo normal e placar dos pênaltis.
- Campeã, vice-campeã e 3ª colocada.
- Estado “a definir” antes da classificação.
- Não há card, rota ou link de disputa de 3º lugar.

### 10.7 Regulamento

- **ADIADO no MVP.**
- Não há rota, link, item de navegação, página ou placeholder.
- O 404 cobre eventual URL antiga.

---

## 11. Fluxos principais

### 11.1 Antes da copa

1. Organização cria a fonte de dados com edição, times, elencos e calendário.
2. Validação automática verifica limites, apelidos, referências, datas, confrontos e amistoso.
3. Site é publicado.
4. Público consulta times, jogos e classificação.

### 11.2 Após cada partida

1. Organização registra gols, assistências, cartões e pênaltis, se houver.
2. Placar é derivado dos gols.
3. Classificação, estatísticas e suspensões são recalculadas.
4. Site é publicado.
5. Público consulta o resultado atualizado.

### 11.3 Fim da fase classificatória

1. Classificação final é calculada com todos os critérios.
2. Se houver empate persistente, organização realiza sorteio e registra `drawOrder`.
3. Finalistas são gravados em `finalists` (1º x 2º).
4. Site publica o confronto da final.
5. A 3ª colocada é definida pela classificação; não há partida de 3º lugar.

### 11.4 Final

1. Organização registra o amistoso apenas como metadado informativo, se houver.
2. Organização registra o resultado da final.
3. Se houver empate no tempo normal, registra o placar dos pênaltis.
4. Site publica campeã, vice-campeã e 3ª colocada.
5. O amistoso não altera classificação, estatísticas, suspensões ou pódio.

### 11.5 Correção

1. Organização edita o resultado ou evento.
2. Validação e recálculo são executados.
3. Se a correção alterar os finalistas depois da final, o build falha listando antigos e novos; a organização atualiza `finalists` para confirmar.
4. Se a correção alterar um empate que dependia de sorteio, a organização revisa `drawOrder`.
5. Organização adiciona um `notice` explicando a correção.
6. Site é republicado.

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

3. **Desempate entre dois times**
   - Dois times empatados em pontos: a soma dos pontos dos dois jogos do confronto direto decide.
   - Se a soma de pontos for igual, o saldo agregado dos dois jogos decide.
   - Se o saldo agregado for igual, aplica-se o próximo critério.
   - Se um dos dois jogos não estiver `finished`, o confronto direto é ignorado.
   - W.O. conta como 1x0 no confronto direto.

4. **Desempate entre três ou mais times**
   - O confronto direto não é aplicado.
   - A ordem segue vitórias, saldo, gols pró, menos gols contra, pontos disciplinares e sorteio.
   - Se um critério reduzir o grupo a dois times, o confronto direto volta a valer para esses dois, considerando os dois jogos.

5. **Cartões**
   - Amarelo = 1 ponto; vermelho = 2 pontos.
   - Segundo amarelo no mesmo jogo = 1 amarelo + 1 vermelho = 3 pontos para o time.
   - Vermelho suspende a jogadora da próxima partida.
   - Não há suspensão por acúmulo de amarelos.
   - Cartões da final contam para estatísticas e suspensão, não para a classificação.
   - Cartões de W.O. contam em `insufficient_players`/`withdrawal`; `no_show` não tem eventos.

6. **Gols e assistências**
   - O placar é a soma dos gols registrados.
   - Gol contra conta para o time adversário e não entra na artilharia da jogadora.
   - Assistência é opcional, do mesmo time e diferente da marcadora; é proibida em pênalti e em gol contra.
   - Pênalti no tempo normal conta para artilharia; pênalti da disputa não conta.

7. **Fase final**
   - 1º x 2º na final; não há 3º x 4º.
   - Empate no tempo normal vai direto para pênaltis.
   - O placar dos pênaltis é exibido entre parênteses.
   - Campeã, vice-campeã e 3ª colocada são exibidas corretamente; não há 4º lugar.
   - Uma final decidida nos pênaltis conta como empate em V/E/D nas estatísticas do time e soma campanha separada nos pênaltis.

8. **Elenco flexível**
   - Nova jogadora pode ser incluída se o time tiver menos de 8 ativas.
   - Ela fica elegível a partir da próxima partida.
   - Não há eventos retroativos.
   - Jogadora que já atuou não pode trocar de time.
   - `leftAt` preserva histórico e libera vaga.

9. **Suspensão**
   - Jogadora suspensa não pode ter eventos na partida que perde.
   - O site exibe a suspensão e a partida afetada.

10. **Correções e avisos**
    - Correção de resultado recalcula classificação, estatísticas, suspensões e chaveamento.
    - Se a correção mudar os finalistas após a final, o sistema bloqueia o build até `finalists` ser atualizado.
    - `notices` gera banner global.
    - Se o sorteio for refeito, `drawOrder` pode ser atualizado.

11. **Amistoso**
    - O amistoso aparece apenas como card informativo na Fase final, antes da final.
    - Não tem placar, eventos, cartões, estatísticas, suspensões, classificação, pódio ou link de jogo.
    - Participantes, se houver, ficam apenas na nota.
    - Se `friendly` for `null`, nenhum card ou placeholder aparece.

12. **Publicação e acesso**
    - Site público, sem login, no GitHub Pages.
    - Fonte de dados versionada e validada.
    - Nenhum dado sensível além do apelido.

13. **Interface**
    - Nome de exibição sem o nome da instituição.
    - Layout mobile-first, em português, acessível e sem JavaScript no cliente.
    - Páginas Início, Jogos, Classificação, Times, Estatísticas e Fase final acessíveis.
    - `/regulamento/` não existe e não aparece em links.

---

## 13. Cronograma

| Data | Marco |
|---|---|
| **09/11/2026** | PRD v1.0 proposto |
| **12/11/2026** | PRD v1.1 e SPEC v1.2 alinhados às decisões de formato |
| **13/11 a 20/11/2026** | Implementação do MVP |
| **21/11 a 23/11/2026** | Testes, dados de exemplo e congelamento do escopo |
| **24/11/2026** | Primeira rodada (g1/g2) |
| **26/11/2026** | Segunda rodada (g3/g4) |
| **01/12/2026** | Terceira rodada (g5/g6) |
| **03/12/2026** | Amistoso do 3º colocado e final |
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
| Correção após a final mudar finalistas | Alto | `finalists` snapshot; build falha com antigos/novos; `notices` para o público |
| W.O. mal registrado | Médio | Schema de `walkover`; validação de motivo/eventos; UI explícita |
| Amistoso confundido com partida oficial | Médio | Rótulo informativo, card sem placar/status/link, validação e testes |
| Elenco flexível gerar inconsistência | Médio | `joinedAt`/`leftAt`, limite de 8 ativas, apelido único, vínculo imutável |
| Suspensão aplicada à partida errada | Médio | Ordem canônica, validação de cronologia e testes |
| Sorteio refeito sem atualizar `drawOrder` | Médio | `drawOrder` é registro vigente; validação e `notice` |
| Cache do GitHub Pages | Baixo | Verificar após o deploy e orientar recarregar a página |
| Nome da instituição ou marca na interface | Médio | Revisão de textos públicos; nome de exibição definido no PRD |
| Contraste insuficiente | Médio | Tokens medidos, testes de contraste e axe |
| Overflow em 320px | Médio | Mobile-first; tabelas com rolagem acessível; teste E2E |
| Fonte proprietária no build | Baixo | Pilha do sistema; sem auto-hospedagem de fontes proprietárias |
| JavaScript acidental | Médio | Sem framework de cliente; teste de `dist/` |
| Build não determinístico | Médio | Funções puras, ordenação estável e lockfile |
| Perda de dados | Baixo | Histórico no Git e backup da fonte de dados |
| GitHub Pages indisponível | Baixo | Fonte versionada é o backup; sem SLA |
| Vazamento de dados pessoais | Alto | Schema estrito, revisão e mapeamento privado fora do repositório |

---

## 15. Decisões e premissas

- Nome de exibição: **Copa de Futsal Feminino Vila Mariana 2026**.
- O nome da instituição pode aparecer em documentos internos, mas não na interface pública.
- Site estático no GitHub Pages, sem backend, sem login, sem área administrativa e sem JavaScript no cliente.
- Fonte de dados versionada e validada; site somente leitura.
- Apenas a edição 2026, com estrutura preparada para edições futuras.
- **3 times** (`ta`, `tb`, `tc`), **6 partidas de grupo em turno e returno** e **1 final**.
- Calendário: 24/11, 26/11, 01/12 e 03/12/2026; horários a definir.
- Cada par de times tem um jogo em casa para cada lado; `g4` é `tb x ta`.
- **Não há disputa de 3º lugar nem 4º lugar**; a 3ª colocada é a 3ª da classificação.
- Pódio de três posições: campeã, vice-campeã e 3ª colocada.
- O amistoso do 3º colocado é metadado informativo, sem efeito competitivo.
- Confronto direto apenas para dois times, considerando os dois jogos; se os pontos empatarem, o saldo agregado decide; só vale com os dois jogos `finished`; W.O. conta 1x0.
- `finalists` é snapshot validado; correção após a final bloqueia o build até atualização.
- `drawOrder` é obrigatório apenas quando o sorteio é necessário e pode ser atualizado se o sorteio for refeito.
- Pênaltis diretos na final, com placar registrado apenas como resultado.
- Placar derivado dos gols.
- Segundo amarelo = 3 pontos para o time (1 amarelo + 1 vermelho).
- Elenco flexível, com limite de 8 ativas simultâneas e mínimo de 7 sinalizado; badge público com menos de 5.
- Jogadora que já atuou não troca de time nesta edição.
- Estatísticas do time somam grupo + final; V/E/D pelo tempo normal; final nos pênaltis conta como empate; campanha nos pênaltis é separada.
- Sem nome completo, número de camisa, foto, contato ou data de nascimento.
- Sem escalação, cronômetro, placar ao vivo ou controle de faltas.
- Regulamento adiado no MVP; histórico de alterações é futuro.
- Sem o nome da instituição na interface pública.

---

## 16. Questões em aberto

Estas questões não bloqueiam o MVP e podem ser resolvidas pela organização durante a implementação:

- Horários exatos das partidas, incluindo os dois jogos do mesmo time em 24/11, 26/11 e 01/12.
- Nomes definitivos dos times.
- Local/quadra exata a exibir publicamente.
- Horário, local e texto do amistoso do 3º colocado.
- Quem disputa o amistoso; se necessário, descrever apenas na nota, sem dados estruturados.
- Como acomodar novas alunas se todos os times estiverem com 8 ativas.
- Critério de assistência em casos duvidosos.
- Data de habilitação do GitHub Pages.
- Necessidade de modo escuro, impressão/PDF ou analytics no futuro.

---

## 17. Glossário

- **TA, TB, TC:** abreviações provisórias dos três times.
- **Fase classificatória:** todos contra todos, em turno e returno, com 6 partidas.
- **Fase final:** final única entre 1º e 2º.
- **Amistoso do 3º colocado:** evento informativo no dia da final, sem efeito competitivo.
- **Confronto direto:** soma dos pontos e, se necessário, do saldo agregado dos dois jogos entre dois times empatados em pontos.
- **Saldo de gols:** gols pró menos gols contra.
- **Gols pró:** gols marcados.
- **Gols contra:** gols marcados contra o próprio time; contam para o adversário e não entram na artilharia da marcadora.
- **Gols sofridos:** gols marcados pelo adversário no gol do time.
- **Pontos disciplinares:** amarelo = 1; vermelho = 2; segundo amarelo = 3 para o time.
- **Tempo técnico:** pausa de 1 minuto por time por tempo.
- **Pênaltis:** disputa de 5 cobranças alternadas e morte súbita.
- **Shootout:** disputa de pênaltis da final; o placar é registrado separadamente e não conta para gols/assistências.
- **W.O.:** vitória administrativa por 1x0; registrada manualmente, sem gols ou assistências fictícios.
- **Fonte de dados:** arquivo versionado que contém todas as informações da copa.
- **`finalists`:** snapshot dos dois finalistas, validado contra a classificação.
- **`drawOrder`:** ordem manual do sorteio vigente.
- **`friendly`:** metadado informativo do amistoso.

---

## 18. Aprovação

- [ ] Organização da Copa
- [ ] Desenvolvimento
- [ ] Revisão final do PRD
