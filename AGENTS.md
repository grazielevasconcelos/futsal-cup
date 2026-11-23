# AGENTS.md

Instruções para agentes de código que trabalham neste repositório.

## Visão geral

Site público, estático e somente leitura da **Copa de Futsal Feminino Vila Mariana 2026**. A competição tem **3 times**, **6 partidas na fase classificatória em turno e returno**, **1 semifinal** e **1 final**, totalizando **8 partidas oficiais**.

A semifinal é disputada entre o **2º e o 3º colocado**, com **vantagem do empate para o 2º**. A final é disputada entre o **1º colocado** e a **vencedora da semifinal**, com **vantagem do empate para o 1º**. Empates encerram a partida no tempo normal: **não há prorrogação, pênaltis, shootout ou cobranças alternadas**. A 3ª colocada é a perdedora da semifinal; não há disputa de 3º lugar nem 4º lugar. Os dados são mantidos em uma fonte versionada e o site é publicado no GitHub Pages.

**Estado atual:** o repositório contém o PRD v2.1, a SPEC v2.2, o plano de execução e as referências visuais. A stack, o schema, os algoritmos, os temas, o contrato visual e os comandos estão definidos na `SPEC.md`.

## Fontes de verdade

Leia antes de implementar qualquer mudança:

| Arquivo | Papel |
|---|---|
| `PRD.md` | Fonte de verdade de produto, regras da competição, validações e critérios de aceite. |
| `SPEC.md` | Especificação técnica normativa: stack, schema, algoritmos, validação, UI, testes, CI e deploy. |
| `AGENTS.md` | Restrições do repositório, design, acessibilidade, privacidade e testes. |
| `PLAN.md` / `TASKS.md` | Plano e checklist de execução, subordinados ao PRD, ao AGENTS e à SPEC. |
| `docs/decisoes-v2.2.md` | Registro do passe visual: tipografia, cards clicáveis, placar, times e pódio. |
| `docs/decisoes-v2.1.md` | Registro da decisão de tema claro/escuro e persistência local. |
| `docs/decisoes-v2.0.md` | Registro histórico das decisões da v2.0; não é normativo. |
| `docs/decisoes-v1.1.md` | Registro histórico das decisões da v1.1; não é normativo. |
| `context.md` | Contexto original da organização; em caso de conflito, prevalece o PRD. |
| `README.md` | Visão geral, comandos e publicação. |
| `airbnb-design-design.md` | Referência visual não oficial (Airbnb DLS): princípios, tipografia, cores, espaçamento, raios, elevação e movimento. |
| `airbnb-design-tokens.css` | Tokens CSS da referência visual; valores indicativos, não canônicos. |

- Não invente requisitos que não estejam no PRD ou na SPEC.
- Se uma decisão de produto não estiver documentada, pergunte antes de assumir.
- Mudanças de regra exigem atualização do `PRD.md`, da `SPEC.md` e deste arquivo, se afetarem instruções para agentes.
- Os arquivos de design são referência visual, não fonte de verdade de produto. Em conflito, prevalecem o PRD, a SPEC, este AGENTS e os requisitos de acessibilidade.
- Mudanças de identidade visual ou de tokens exigem atualização da seção de design deste arquivo.

## Restrições inegociáveis

- **Nome público:** "Copa de Futsal Feminino Vila Mariana 2026". O nome da instituição (Sesc) **não pode aparecer** na interface pública, títulos, metadados ou textos exibidos ao público. Em documentação interna, é permitido.
- **Site estático:** publicação no GitHub Pages, sem backend próprio, sem banco de dados e sem login.
- **JavaScript no cliente:** permitido somente um script inline/local mínimo para inicializar, alternar e salvar a preferência de tema em `localStorage`. Não adicionar frameworks, hidratação, chamadas externas ou outros scripts sem nova decisão documentada.
- **Somente leitura:** não existe área administrativa nem edição pelo site no MVP. A edição ocorre apenas na fonte de dados versionada.
- **Fonte única de dados:** times, jogadoras, partidas e eventos vêm de um único arquivo versionado. Não duplique dados no HTML nem edite resultados/classificação manualmente.
- **Identidade estável dos times:** preserve os IDs `ta`, `tb` e `tc`, os nomes-base “Time A/B/C” e as URLs derivadas dos IDs; nomes de exibição e logos são opcionais e editáveis. Exiba somente o nome de exibição quando informado, senão o nome-base.
- **Privacidade:** exibir apenas apelido, posição, time e estatísticas. Nunca nome completo, foto, contato, camisa ou data de nascimento.
- **Idioma:** português do Brasil em toda a interface e nos textos públicos.
- **Mobile-first e acessível:** WCAG 2.2 AA, tabelas semânticas, contraste adequado, navegação por teclado, foco visível e textos alternativos.
- **Fuso horário:** America/Sao_Paulo.
- **Sem segredos** no repositório público e sem analytics/cookies de rastreamento de terceiros.
- **Determinismo:** a mesma fonte de dados deve sempre produzir a mesma classificação e as mesmas estatísticas.

## Design e identidade visual

### Referências

Os arquivos `airbnb-design-design.md` e `airbnb-design-tokens.css` são uma referência visual **não oficial**, de terceiros (designsystems.one), baseada em material público sobre o Airbnb DLS.

- Não são documentação oficial da Airbnb e não implicam afiliação, endosso ou patrocínio. Preserve os cabeçalhos de autoria e atribuição.
- Os valores são **indicativos**, não canônicos. Em conflito, prevalecem o `PRD.md`, a `SPEC.md`, este `AGENTS.md` e os requisitos de acessibilidade.
- A referência é de uso interno na documentação, não de interface pública. Não publique os arquivos de referência como páginas do site; o `airbnb-design-design.md` não deve ir para o build.
- **Não importe `airbnb-design-tokens.css` integralmente no CSS publicado.** Crie `src/styles/tokens.css` com os valores necessários, renomeados para tokens do projeto e sem nomes de marca ou de fontes proprietárias. A referência permanece interna e não vai ao build.
- Não use logotipos, ícones proprietários ou o nome "Airbnb" de forma que sugira que o site é oficial, endossado ou afiliado. O nome público continua sendo "Copa de Futsal Feminino Vila Mariana 2026". Nomes internos de arquivos e tokens podem manter a referência para rastreabilidade.
- Não altere os valores dos arquivos de referência para adaptar o produto. Sobrescritas devem ser documentadas na SPEC.
- Na camada do projeto, prefira aliases semânticos (por exemplo, `--color-text`, `--color-text-muted`, `--color-surface`, `--color-accent`) mapeados para os valores da referência. Componentes devem consumir os aliases, não os nomes da marca.
- Toda cor, tipografia, espaçamento, raio, sombra e movimento deve vir dos tokens. Não repita valores hexadecimais ou medidas avulsas nos componentes; se precisar de um valor novo, crie um token do projeto e justifique.

### Tipografia

- `Airbnb Cereal` e `Circular` são fontes proprietárias. Não baixe, embuta ou auto-hospede esses arquivos sem licença. O layout deve funcionar com a pilha de fallback (`-apple-system`, `'Helvetica Neue'`, `sans-serif`) ou com uma alternativa aberta definida na SPEC.
- Use a escala: `display` 48/56, `heading-1` 32/36, `heading-2` 22/26, `body` 16/24 e `small` 14/18 (tamanho/entrelinha).
- Pesos previstos: 400, 500, 600 e 700. Não use pesos fora dessa faixa nem dependa de variantes que a fonte de fallback não tenha.
- Não crie passos de texto abaixo de 14px. `display` é para títulos curtos; em telas estreitas, prefira `heading-1` ou `heading-2`.
- Preserve o par tamanho/entrelinha dos tokens; não ajuste a entrelinha isoladamente sem testar a leitura em mobile.
- Use `--tracking-display` (`-0.02em`) em display e `--tracking-heading` (`-0.01em`) em títulos; não aplique tracking negativo no corpo.
- Use `text-wrap: balance` em títulos e `text-wrap: pretty` em parágrafos. Números de placar, tabelas e estatísticas usam `tabular-nums`.
- O eyebrow do cabeçalho pode usar caixa alta curta com `--letter-spacing-badge`; não use caixa alta em blocos longos.

### Cores e contraste

- Texto, superfícies, bordas, acentos e foco devem ter aliases semânticos para os temas claro e escuro. O tema claro é o padrão; `data-theme="dark"` ativa o escuro.
- Todo par de texto e componente interativo deve cumprir WCAG AA no tema claro e no escuro: 4,5:1 para texto normal e 3:1 para texto grande e componentes de interface. Testes devem calcular os dois conjuntos de tokens.
- Acentos coral/pink são para texto grande (≥24px ou ≥19px em negrito), ícones ou elementos não textuais, salvo quando o par exato de tokens for validado para texto normal. Não use o gradiente atrás de texto ou tabelas.
- `--color-border` é uma hairline decorativa (1,4:1): não use como única indicação de foco, borda de campo ou estado.
- Não comunique estado (vitória/empate/derrota, classificação, cartão, suspensão, avanço por vantagem do empate) apenas por cor; use também texto, rótulo ou ícone.
- Todo par de cor usado em texto ou componente interativo deve atender WCAG AA: 4,5:1 para texto normal e 3:1 para texto grande e componentes de interface.
- A referência visual interna fornece valores de tema claro. O tema escuro usa tokens semânticos do projeto documentados na SPEC; não altere os arquivos de referência.

### Espaçamento, forma e movimento

- Base de 8px: use `--space-1` a `--space-6` (8, 16, 24, 32, 48 e 64px). Evite valores intermediários arbitrários.
- Raios: `--radius-small` (8px), `--radius-card` (12px) e `--radius-pill` (9999px). Use `--radius-card` em cards de partidas, times, jogadoras e estatísticas.
- Elevação: `--shadow-card` para cards e `--shadow-floating` para elementos sobrepostos. Não crie sombras fora dos tokens.
- Movimento: use `--motion-default` (250ms) em transições discretas e respeite `prefers-reduced-motion: reduce`. Não anime conteúdo essencial nem use movimento para transmitir informação. Não adicione animação de `transform`; feedback de toque usa cor/borda.
- Cabeçalhos de página usam uma barra de gradiente decorativa de `--accent-bar-width` × `--accent-bar-height`, sem texto sobreposto.
- Cards de partida e de time são clicáveis na área inteira: o link do título cobre o card com `::after` e o foco aparece no card. Não aninhe outros controles.
- Logos usam `--team-logo-size` (5rem) nos cards e `--team-logo-size-lg` (12rem) no cabeçalho do time em telas ≥768px.
- Estatísticas coletivas ficam em 2 colunas; atalhos usam `auto-fit` com `--shortcut-min` e no máximo 3 colunas.
- Badges usam `--radius-pill`, padding horizontal `--space-2` e `--letter-spacing-badge`; não fixe altura.
- Estados vazios usam borda tracejada com acento em `border-inline-start`; o último parágrafo não tem margem.

### Adaptação ao produto

- O DLS é otimizado para fotografia e produtos de viagem. Este site é orientado a dados e não exibe fotos de jogadoras (privacidade e desempenho em 4G).
- Adapte a intenção, não clone: aproveite a paleta coral/pink, a tipografia arredondada, o espaçamento generoso e os cards de 12px; priorize a leitura de tabelas, resultados e estatísticas.
- Não exiba fotos de jogadoras. Evite imagens de pessoas reais; prefira composição tipográfica, cor e ícones discretos. Imagens decorativas, se existirem, devem ser leves, licenciadas, com `alt` adequado e sem marcas da Airbnb.
- Logos fornecidos pela organização para representar os times podem ser publicados como assets locais após confirmação de autorização; use campos opcionais na fonte de dados, sem imagens remotas.
- Não use o gradiente coral→pink em grandes áreas ou atrás de tabelas; reserve-o para pequenos acentos.
- Não sacrifique densidade, contraste ou clareza para reproduzir o estilo. Em dúvida, acessibilidade e legibilidade vencem.
- A fase final deve indicar textualmente a vantagem do empate e quem avançou ou foi campeã em caso de empate; não use apenas cor ou posição na tabela.
- Não há card de amistoso, disputa de 3º lugar ou pênaltis. A 3ª colocada é a perdedora da semifinal e deve ser rotulada como “3ª colocada”.

### Acessibilidade visual

- Garanta foco visível com contraste de pelo menos 3:1 contra o fundo e o entorno; não remova `outline` sem substituto equivalente.
- Use tabelas semânticas com `caption`, `th` e `scope`; não use tabelas apenas para layout. Tabelas largas podem rolar dentro de um contêiner focável e rotulado, mas a página não deve ter overflow horizontal em 320px.
- Em cards clicáveis, o link do título é o único controle e seu texto é o nome acessível; o foco é desenhado no card. Não coloque links ou botões aninhados.
- Barra de gradiente e chevrons são decorativos (CSS sem texto) e não entram na árvore acessível.
- O painel visual do placar mantém o texto acessível completo em `.visually-hidden`; não dependa do número visual nem da cor.
- Ícones informativos precisam de texto alternativo; ícones decorativos devem usar `aria-hidden="true"`.
- Respeite zoom de 200% e navegação por teclado sem perda de conteúdo ou funcionalidade.

## Regras da competição que o código deve garantir

### Formato

- **3 times:** TA, TB e TC.
- Fase classificatória em **turno e returno**: 6 partidas. Cada time joga 4 partidas e cada par tem um jogo em casa para cada lado.
- Vitória = 3 pontos, empate = 1, derrota = 0 na fase classificatória.
- **Semifinal:** **2º x 3º**, partida única; o 2º tem vantagem do empate e mando de campo.
- **Final:** **1º x vencedora da semifinal**, partida única; o 1º tem vantagem do empate e mando de campo.
- Empate encerra a partida no tempo normal; **não há prorrogação, pênaltis ou shootout**. Na semifinal, o empate classifica o 2º; na final, o empate dá o título ao 1º.
- **3ª colocada:** é a perdedora da semifinal. **Não há 3º x 4º, disputa de 3º lugar nem 4º lugar.**
- Pódio de três posições: campeã, vice-campeã e 3ª colocada.
- **8 partidas oficiais:** `g1`…`g6`, `semi` e `final`.
- W.O. é permitido na semifinal e na final e prevalece sobre a vantagem do empate.

### Desempate (nesta ordem)

1. **Confronto direto**, somente quando exatamente dois times estão empatados em pontos.
   - Soma dos pontos dos **dois jogos** entre eles.
   - Se a soma empatar, **saldo agregado** dos dois jogos.
   - Se o saldo agregado empatar, passa ao próximo critério.
   - Só vale se os **dois jogos** estiverem `finished`; se um não estiver, o confronto direto é ignorado.
   - W.O. conta como 3x0.
2. Número de vitórias.
3. Saldo de gols (gols pró − gols contra).
4. Gols pró.
5. Menos gols contra.
6. Pontos disciplinares (menor é melhor): amarelo = 1; vermelho = 3; **segundo amarelo no mesmo jogo = 3 pontos no total**, sem somar outro amarelo.
7. Sorteio, com a ordem final registrada manualmente na fonte de dados em `drawOrder`.

Com 3 ou mais times empatados, o confronto direto **não** é aplicado até que o grupo se reduza a dois. A classificação considera apenas as 6 partidas de grupo; a semifinal e a final não alteram posições.

### Elenco

- Cada time tem 7 a 9 jogadoras **ativas**; a 10ª ativa é bloqueada e menos de 7 gera aviso visível (sem impedir a publicação).
- `leftAt` remove a jogadora do elenco ativo, preserva o histórico e libera a vaga; o limite é de 9 ativas simultâneas.
- Badge público “Elenco em formação” somente com menos de 5 ativas; entre 5 e 6, apenas aviso de build.
- Apelido obrigatório e único dentro do time; pode repetir entre times.
- Posição opcional (goleira ou linha); time obrigatório.
- A mesma jogadora não pode estar em dois times.
- Inclusão de novas jogadoras é permitida até 9 ativas, antes da partida em que ela atuará; elegibilidade a partir da próxima partida, sem eventos retroativos.
- Jogadora que já atuou não pode trocar de time nesta edição.
- Remover jogadora do elenco ativo não apaga seu histórico.
- O mínimo de 3 em quadra é regra de jogo, não de elenco; o site não detecta jogadoras em quadra.

### Partida, gols e assistências

- Placar é **derivado dos gols registrados**; não existe placar digitado separadamente.
- Gol normal e pênalti no tempo normal contam para placar e artilharia.
- Gol contra é vinculado à jogadora que marcou contra, conta para o time adversário e **não** entra na artilharia dela; não tem assistência.
- Assistência é opcional, do mesmo time da marcadora e diferente dela; é proibida em pênalti e em gol contra.
- Minuto de gol, assistência e cartão é opcional.
- Gols, assistências e cartões da semifinal e da final contam para as estatísticas individuais.
- Não há disputa de pênaltis, shootout ou gols de shootout.
- Só pode haver evento vinculado a jogadora do elenco do time naquela partida e elegível no início dela.
- Status: `scheduled`, `finished` e `postponed`; `date` obrigatória; `startsAt` opcional em `scheduled`, obrigatório em `finished`; `postponed` sem eventos nem W.O.

### Cartões e suspensão

- Segundo amarelo no mesmo jogo gera vermelho.
- Vermelho (direto ou por segundo amarelo) suspende a jogadora da **próxima partida real do time**, considerando o chaveamento:
  - o 1º colocado não disputa a semifinal; seu próximo jogo após o grupo é a final;
  - o 2º e o 3º disputam a semifinal; vermelho na última partida de grupo é cumprido na semifinal;
  - vermelho na semifinal é cumprido na final se o time avançar; se for eliminado, não há partida seguinte;
  - vermelho na final não tem efeito.
- Não há suspensão por acúmulo de amarelos.
- Jogadora suspensa não pode ter eventos na partida que não pode disputar; o sistema deve alertar e bloquear.
- Cartões na semifinal e na final contam para estatísticas e suspensão, mas não para a classificação.
- Cartões de W.O. contam, exceto `no_show`, que não tem eventos.

### Fase final

- Semifinal **2º x 3º**; o 2º tem vantagem do empate.
- Final **1º x vencedora da semifinal**; o 1º tem vantagem do empate.
- `semifinalists` é o snapshot `[2º, 3º]`; a ordem define mando e vantagem.
- `finalists` é o snapshot `[1º, vencedora da semifinal]`; a ordem define mando e vantagem.
- `semifinalists` é nulo enquanto o grupo não termina; `finalists` é nulo enquanto a semifinal não termina.
- Empate na semifinal classifica o 2º; empate na final dá o título ao 1º.
- W.O. na semifinal ou na final define o vencedor administrativo e prevalece sobre a vantagem.
- A 3ª colocada é a perdedora da semifinal; não há partida de 3º lugar.
- Se uma correção após a semifinal mudar os semifinalistas, o build falha listando antigos/novos e exige reconciliação e explicação em `notices`.
- Se uma correção após a final mudar os finalistas, o build falha listando antigos/novos e exige atualização de `finalists` e explicação em `notices`.

### Calendário

| Data | Partidas |
|---|---|
| 24/11/2026 | TA x TB (g1) e TC x TA (g2) |
| 26/11/2026 | TB x TC (g3) e TB x TA (g4) |
| 01/12/2026 | TA x TC (g5) e TC x TB (g6) |
| 03/12/2026 | Semifinal: 2º x 3º e Final: 1º x vencedora da semifinal |

- Cada time joga duas vezes em 24/11, 26/11 e 01/12; os horários devem ser distintos e respeitar a ordem canônica g1 → g2 → g3 → g4 → g5 → g6 → semifinal → final. A semifinal e a final acontecem no mesmo dia (03/12), com horários distintos, a semifinal primeiro.
- Horários e nomes definitivos dos times ainda não foram definidos; devem vir da fonte de dados, não fixos no código.
- Se uma partida for adiada, a organização atualiza `status` para `postponed`, ajusta `date`/`startsAt` e, quando remarcar, volta para `scheduled`.

### W.O. e retirada de time

- W.O. é manual, com placar fixo **3x0** para o vencedor.
- Motivos: `no_show`, `insufficient_players` ou `withdrawal`.
- Sem gols ou assistências fictícios.
- Cartões são permitidos em `insufficient_players`/`withdrawal`; `no_show` não tem eventos.
- O W.O. é permitido na fase classificatória, na semifinal e na final.
- Na semifinal e na final, o vencedor administrativo avança ou conquista o título; o W.O. prevalece sobre a vantagem do empate.
- O site não detecta ausência nem automatiza retirada de time; a organização registra um W.O. por partida restante.

## Validação obrigatória dos dados

A publicação deve ser bloqueada com mensagem clara quando houver:

- quantidade de times diferente de 3 na edição 2026;
- conjunto de partidas diferente de `g1`…`g6` + `semi` + `final`;
- confrontos de grupo diferentes dos seis do turno e returno, time repetido, time contra si mesmo ou par sem os dois jogos;
- time com mais de 9 jogadoras ativas simultaneamente ou apelido repetido dentro do time;
- jogadora em dois times;
- evento referenciando jogadora fora do elenco do time na partida ou inelegível;
- assistência de jogadora de outro time, igual à marcadora, em pênalti ou em gol contra;
- gol contra com assistência;
- placar materializado ou incompatível com os gols registrados;
- semifinal sem o confronto 2º x 3º conforme a classificação;
- final sem o confronto 1º x vencedora da semifinal conforme a classificação e o resultado da semifinal;
- `semifinalists` divergente da classificação ou ausente quando o grupo termina; divergência após a semifinal bloqueia o build;
- `finalists` divergente do esperado ou ausente quando a semifinal termina; divergência após a final bloqueia o build;
- `drawOrder` inválido ou ausente quando o sorteio é necessário;
- evento de jogadora suspensa na partida em que está suspensa, considerando o caminho do time no chaveamento e a ausência de semifinal para o 1º colocado;
- data/hora inválida ou referência a time, jogadora, partida ou aviso inexistente;
- W.O. inválido (não `finished`, vencedor fora dos participantes, motivo inválido, gols/assistências, shootout ou amistoso);
- campo de partida de shootout ou de amistoso;
- campo de privacidade proibido (nome completo, foto, contato, camisa, data de nascimento, telefone, e-mail, endereço ou redes sociais).

O catálogo completo de códigos `VAL-*` e `VAL-W*` está na `SPEC.md` §8.

## Diretrizes de implementação

- Isole as regras de negócio (pontuação, desempate, cartões, suspensões, placar, artilharia, estatísticas coletivas, semifinalistas, finalistas e pódio) em funções puras e testáveis.
- Derive classificação e estatísticas sempre a partir dos eventos; nunca as armazene como verdade editável.
- `buildTeamStats` agrega grupo + semifinal + final; V/E/D usam o tempo normal, uma semifinal ou final empatada conta como empate; não há campanha de pênaltis; o placar e a vantagem do empate são informações separadas.
- A fonte de dados deve ser legível por humanos e ter formato validado antes do build.
- O build de produção usa somente `data/2026/copa.yaml`; fixtures em `tests/fixtures/` alimentam apenas testes e o `dist-test/` do E2E, nunca o `dist/` publicado.
- Evite dependências desnecessárias; o site precisa carregar rápido em 4G.
- Preserve a estrutura preparada para edições futuras, mas exiba apenas 2026.
- Aplique os tokens de design antes dos estilos de componentes; não codifique cores, tamanhos, espaçamentos ou sombras diretamente.
- Valide contraste, foco e comportamento em mobile em toda alteração de UI; a referência visual não substitui os testes de acessibilidade.
- Não inclua o nome da instituição nem marcas da Airbnb em textos ou assets visuais públicos (logotipos, imagens, favicon, metadados, Open Graph); revise títulos, metadados, `alt`, favicon, imagens, Open Graph, rodapé e mensagens. Nomes internos de arquivos e tokens são permitidos.
- Não adicione JavaScript de cliente, analytics, cookies de terceiros ou chamadas externas.
- Use Conventional Commits em todos os commits.

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
- Use escopo quando ajudar a identificar a área afetada (por exemplo, `classificacao`, `estatisticas`, `dados`, `ui`, `design`, `publicacao`).
- Mudanças incompatíveis devem usar `!` após o tipo/escopo e um rodapé `BREAKING CHANGE:` explicando o impacto.
- **Exceção conhecida:** commits feitos pelo app do GitHub podem não permitir seguir o padrão. Nesses casos, a limitação é aceita, mas a recomendação prevalece: sempre que a mensagem puder ser controlada (commits locais, PRs, squash etc.), use Conventional Commits.

## Testes mínimos esperados

- Pontuação 3/1/0 e ordenação da classificação.
- Desempate entre dois times, incluindo confronto direto de dois jogos com pontos empatados e saldo agregado.
- Confronto direto ignorado quando um dos dois jogos não está `finished`.
- Desempate com 3+ times e reaplicação do confronto direto ao reduzir para dois.
- Pontos disciplinares, incluindo segundo amarelo (3 pontos).
- Suspensão automática e bloqueio de eventos, incluindo:
  - 1º colocado sem semifinal, com vermelho no último jogo de grupo cumprido na final;
  - vermelho na semifinal cumprido na final apenas se o time avançar;
  - vermelho na final sem partida seguinte.
- Gol contra, assistência opcional e pênaltis do tempo normal fora da artilharia.
- Estatísticas coletivas: grupo + semifinal + final; empate na semifinal/final conta como empate em V/E/D; GP/GC/SG incluem as 8 partidas; sem colunas de shootout.
- Simetria dos confrontos: cada par tem um jogo em casa para cada lado; `g4` é `tb x ta`.
- Semifinal 2º x 3º e vantagem do empate para o 2º.
- Final 1º x vencedora da semifinal e vantagem do empate para o 1º.
- Vitória administrativa por W.O. na semifinal e na final, inclusive quando o vencedor é o visitante.
- Definição de 3ª colocada como perdedora da semifinal, sem 4º lugar.
- `semifinalists`, `finalists`, `drawOrder` e `notices`.
- Correção que muda semifinalistas após a semifinal e finalistas após a final bloqueia o build com antigos/novos.
- Ausência de amistoso, shootout e disputa de pênaltis em dados, UI e build.
- Todas as validações de dados listadas acima.
- Contraste WCAG AA dos pares de cor usados em texto e componentes interativos.
- Foco visível e navegação por teclado nos componentes interativos.
- Ausência de informação transmitida apenas por cor.
- Respeito a `prefers-reduced-motion`.
- Layout sem overflow horizontal da página em 320px; tabelas largas com rolagem acessível.
- Tokens de tracking, atalhos, logos e barra de gradiente definidos e documentados.
- Cards de partida e de time clicáveis na área inteira, com o título como nome acessível e foco no card.
- Painel de placar com texto acessível completo e números tabulares.
- Cabeçalho de time horizontal, logo menor nos cards e estatísticas em 2 colunas.
- Pódio com a campeã destacada e sem seção duplicada na Início.
- Nenhuma animação de `transform` adicionada.
- `airbnb-design-design.md` fora do build e ausência de arquivos das fontes proprietárias `Airbnb Cereal` e `Circular`.
- Textos e metadados públicos sem o nome da instituição ou marcas da Airbnb.
- Ausência de JavaScript de cliente no `dist/`.
- Card da final antes da semifinal com o 1º colocado e “Vencedora da semifinal”, sem “Confrontos a definir”.

## Comandos

Comandos definidos na `SPEC.md` §12.7. Use apenas comandos reais e verificáveis do projeto; nunca documente comandos que não funcionam.

| Comando | O que faz | Quando usar |
|---|---|---|
| `npm ci` | Instala exatamente o lockfile. | Setup local/CI. |
| `npm run dev` | Servidor Astro de desenvolvimento. | UI local. |
| `npm run validate` | Valida `data/2026/copa.yaml` e imprime erros/avisos. | Antes de commit. |
| `npm run check` | `astro check` (TypeScript + Astro). | Antes de commit/CI. |
| `npm test` | Vitest (unitários + dados). | Antes de commit/CI. |
| `npm run build` | Gera `dist/` estático com a fonte pública. | Publicação local/CI. |
| `npm run build:test` | Gera `dist-test/` com a fixture concluída, sem tocar em `dist/`. | E2E local/CI. |
| `npm run preview` | Serve `dist/` em `localhost:4321/futsal-cup/`. | Conferência local. |
| `npm run preview:test` | Serve `dist-test/` em `localhost:4322/futsal-cup/`. | E2E local. |
| `npm run test:build` | Varre `dist/` (rotas, JS, termos, orçamento). | Após build de produção. |
| `npm run test:e2e` | Playwright + axe sobre `dist-test/`. | Após build de teste. |
| `npm run verify` | Sequência completa local. | Antes de PR/publicação. |
| `npx playwright install --with-deps chromium firefox webkit` | Instala os navegadores de teste. | Setup do E2E. |
