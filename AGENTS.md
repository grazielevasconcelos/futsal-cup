# AGENTS.md

Instruções para agentes de código que trabalham neste repositório.

## Visão geral

Site público, estático e somente leitura da **Copa de Futsal Feminino Vila Mariana 2026**. A competição tem 4 times, 6 partidas na fase classificatória e 2 partidas na fase final. Os dados são mantidos em uma fonte versionada e o site é publicado no GitHub Pages.

**Estado atual:** o repositório contém apenas documentação. A stack, o formato da fonte de dados e a estrutura de código ainda serão definidos em uma spec técnica. Não presuma tecnologias nem crie comandos fictícios.

## Fontes de verdade

Leia antes de implementar qualquer mudança:

| Arquivo | Papel |
|---|---|
| `PRD.md` | Fonte de verdade de produto, regras da competição, validações e critérios de aceite. |
| `context.md` | Contexto original da organização. Em caso de conflito, o `PRD.md` prevalece. |
| `README.md` | Visão geral do repositório (hoje mínimo). |

- Não invente requisitos que não estejam no PRD.
- Se uma decisão de produto não estiver documentada, pergunte antes de assumir.
- Mudanças de regra exigem atualização do `PRD.md` e deste arquivo, se afetarem instruções para agentes.

## Restrições inegociáveis

- **Nome público:** "Copa de Futsal Feminino Vila Mariana 2026". O nome da instituição (Sesc) **não pode aparecer** na interface pública, títulos, metadados ou textos exibidos ao público. Em documentação interna, é permitido.
- **Site estático:** publicação no GitHub Pages, sem backend próprio, sem banco de dados e sem login.
- **Somente leitura:** não existe área administrativa nem edição pelo site no MVP. A edição ocorre apenas na fonte de dados versionada.
- **Fonte única de dados:** times, jogadoras, partidas e eventos vêm de um único arquivo versionado. Não duplique dados no HTML nem edite resultados/classificação manualmente.
- **Privacidade:** exibir apenas apelido, posição, time e estatísticas. Nunca nome completo, foto, contato, camisa ou data de nascimento.
- **Idioma:** português do Brasil em toda a interface e nos textos públicos.
- **Mobile-first e acessível:** tabelas semânticas, contraste adequado, navegação por teclado e textos alternativos.
- **Fuso horário:** America/Sao_Paulo.
- **Sem segredos** no repositório público e sem analytics/cookies de rastreamento de terceiros.
- **Determinismo:** a mesma fonte de dados deve sempre produzir a mesma classificação e as mesmas estatísticas.

## Regras da competição que o código deve garantir

### Formato

- 4 times; fase classificatória em turno único (6 partidas).
- Vitória = 3 pontos, empate = 1, derrota = 0.
- Fase final: **1º x 2º** (final) e **3º x 4º** (disputa de 3º lugar). Não há semifinais.
- A disputa de 3º lugar acontece antes da final.
- A classificação considera apenas as 6 partidas da fase classificatória. Cartões e resultados das finais não alteram a classificação.

### Desempate (nesta ordem)

1. **Confronto direto**, somente quando exatamente dois times estão empatados em pontos. Se o confronto direto foi empate, passa ao próximo critério. Se um grupo de 3+ times for reduzido a exatamente dois, o confronto direto volta a valer para esses dois.
2. Número de vitórias.
3. Saldo de gols (gols pró − gols contra).
4. Gols pró.
5. Menos gols contra.
6. Pontos disciplinares (menor é melhor): amarelo = 1; vermelho = 2; **segundo amarelo no mesmo jogo = 1 + 2 = 3 pontos**, sem somar outro amarelo.
7. Sorteio, com a ordem final registrada manualmente na fonte de dados.

Com 3 ou mais times empatados, o confronto direto **não** é aplicado até que o grupo se reduza a dois.

### Elenco

- Cada time tem 7 ou 8 jogadoras; a 9ª é bloqueada e menos de 7 gera alerta visível (sem impedir a publicação).
- Apelido obrigatório e único dentro do time; pode repetir entre times.
- Posição opcional (goleira ou linha); time obrigatório.
- A mesma jogadora não pode estar em dois times.
- Inclusão de novas jogadoras é permitida até 8, antes da partida em que ela atuará; elegibilidade a partir da próxima partida, sem eventos retroativos.
- Jogadora que já atuou não pode trocar de time nesta edição.
- Remover jogadora do elenco ativo não apaga seu histórico.

### Partida, gols e assistências

- Placar é **derivado dos gols registrados**; não existe placar digitado separadamente.
- Gol normal e pênalti no tempo normal contam para placar e artilharia.
- Gol contra é vinculado à jogadora que marcou contra, conta para o time adversário e **não** entra na artilharia dela; não tem assistência.
- Assistência é opcional, do mesmo time da marcadora e diferente dela.
- Minuto de gol, assistência e cartão é opcional.
- Gols, assistências e cartões da final e da disputa de 3º lugar contam para as estatísticas individuais.
- Pênaltis da disputa não contam para placar, artilharia nem assistências; registra-se apenas o placar dos pênaltis.
- Só pode haver evento vinculado a jogadora do elenco do time naquela partida.

### Cartões e suspensão

- Segundo amarelo no mesmo jogo gera vermelho.
- Vermelho (direto ou por segundo amarelo) suspende a jogadora da próxima partida do time.
- Não há suspensão por acúmulo de amarelos.
- Jogadora suspensa não pode ter eventos na partida que não pode disputar; o sistema deve alertar e bloquear.
- Cartões na disputa de pênaltis não entram nas estatísticas nem geram suspensão.

### Fase final

- Empate no tempo normal na final ou na disputa de 3º lugar vai direto para pênaltis: 5 cobranças alternadas e morte súbita, se necessário.
- Exibir o resultado no formato `1 (4) x (3) 1`.
- Apenas o placar dos pênaltis é registrado; sem detalhes de cobradoras.
- Se uma correção após a final mudar os finalistas, exibir alerta e exigir confirmação.

### Calendário

| Data | Partidas |
|---|---|
| 17/11/2026 | TA x TB e TC x TD |
| 19/11/2026 | TA x TC e TB x TD |
| 24/11/2026 | TA x TD e TB x TC |
| 26/11/2026 | 3º x 4º e 1º x 2º (final) |

Horários e nomes definitivos dos times ainda não foram definidos; devem vir da fonte de dados, não fixos no código.

## Validação obrigatória dos dados

A publicação deve ser bloqueada com mensagem clara quando houver:

- quantidade de times diferente de 4 na edição 2026;
- time com mais de 8 jogadoras ou apelido repetido dentro do time;
- jogadora em dois times;
- evento referenciando jogadora fora do elenco do time;
- assistência de jogadora de outro time ou igual à marcadora;
- gol contra com assistência;
- placar incompatível com os gols registrados;
- partida final sem o confronto 1º x 2º ou 3º x 4º conforme a classificação;
- evento de jogadora suspensa na partida em que está suspensa;
- data/hora inválida ou referência a time, jogadora ou partida inexistente.

## Diretrizes de implementação

- Isole as regras de negócio (pontuação, desempate, cartões, suspensões, placar, artilharia) em funções puras e testáveis.
- Derive classificação e estatísticas sempre a partir dos eventos; nunca as armazene como verdade editável.
- A fonte de dados deve ser legível por humanos e ter formato validado antes do build.
- Evite dependências desnecessárias; o site precisa carregar rápido em 4G.
- Preserve a estrutura preparada para edições futuras, mas exiba apenas 2026.
- Não inclua o nome da instituição em nenhum texto público; revise títulos, metadados, `alt`, rodapé e mensagens.

## Commits

Siga o padrão **Conventional Commits** em todos os commits:

```text
<tipo>(<escopo opcional>): <descrição curta no imperativo>
```

Tipos mais usados:

| Tipo | Uso |
|---|---|
| `feat` | Nova funcionalidade. |
| `fix` | Correção de bug. |
| `docs` | Alteração apenas em documentação. |
| `style` | Formatação sem mudança de comportamento. |
| `refactor` | Refatoração sem nova funcionalidade ou correção. |
| `test` | Criação ou ajuste de testes. |
| `perf` | Melhoria de performance. |
| `build` | Mudanças no build ou dependências. |
| `ci` | Mudanças em configuração de CI/publicação. |
| `chore` | Tarefas auxiliares sem impacto no produto. |

Exemplos:

```text
feat(classificacao): aplica critérios de desempate
fix(dados): bloqueia evento de jogadora suspensa
docs: atualiza instruções de publicação
chore: configura deploy no GitHub Pages
```

- Use descrição curta, no imperativo, em português do Brasil.
- Use escopo quando ajudar a identificar a área afetada (por exemplo, `classificacao`, `estatisticas`, `dados`, `ui`, `publicacao`).
- Mudanças incompatíveis devem usar `!` após o tipo/escopo e um rodapé `BREAKING CHANGE:` explicando o impacto.
- **Exceção conhecida:** commits feitos pelo app do GitHub podem não permitir seguir o padrão. Nesses casos, a limitação é aceita, mas a recomendação prevalece: sempre que a mensagem puder ser controlada (commits locais, PRs, squash etc.), use Conventional Commits.

## Testes mínimos esperados

- Pontuação 3/1/0 e ordenação da classificação.
- Desempate entre dois times, incluindo confronto direto empatado.
- Desempate com 3+ times e reaplicação do confronto direto ao reduzir para dois.
- Pontos disciplinares, incluindo segundo amarelo (3 pontos).
- Suspensão automática e bloqueio de eventos.
- Gol contra, assistência opcional e pênaltis fora da artilharia.
- Definição de finalistas e pódio.
- Todas as validações de dados listadas acima.

## Comandos

Ainda não definidos. Quando a stack e o plano de implementação forem escolhidos, atualize esta seção com:

- instalação de dependências;
- execução local;
- validação da fonte de dados;
- testes;
- build e publicação.

Use apenas comandos reais e verificáveis do projeto; nunca documente comandos que não funcionam.
