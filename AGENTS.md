# AGENTS.md

Instruções para agentes de código que trabalham neste repositório.

## Visão geral

Site público, estático e somente leitura da **Copa de Futsal Feminino Vila Mariana 2026**. A competição tem **3 times**, **6 partidas na fase classificatória em turno e returno** e **1 final**, totalizando **7 partidas oficiais**. No dia da final, a organização realiza um **amistoso do 3º colocado**, tratado como evento informativo e sem efeito competitivo. Os dados são mantidos em uma fonte versionada e o site é publicado no GitHub Pages.

**Estado atual:** o repositório contém o PRD v1.1, a SPEC v1.2, o plano de execução e as referências visuais. A implementação do site ainda não começou; a stack, o schema, os algoritmos e os comandos estão definidos na `SPEC.md`.

## Fontes de verdade

Leia antes de implementar qualquer mudança:

| Arquivo | Papel |
|---|---|
| `PRD.md` | Fonte de verdade de produto, regras da competição, validações e critérios de aceite. |
| `SPEC.md` | Especificação técnica normativa: stack, schema, algoritmos, validação, UI, testes, CI e deploy. |
| `AGENTS.md` | Restrições do repositório, design, acessibilidade, privacidade e testes. |
| `PLAN.md` / `TASKS.md` | Plano e checklist de execução, subordinados ao PRD, ao AGENTS e à SPEC. |
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
- **Sem JavaScript no cliente:** o MVP não usa scripts, hidratação, frameworks de cliente ou chamadas externas.
- **Somente leitura:** não existe área administrativa nem edição pelo site no MVP. A edição ocorre apenas na fonte de dados versionada.
- **Fonte única de dados:** times, jogadoras, partidas e eventos vêm de um único arquivo versionado. Não duplique dados no HTML nem edite resultados/classificação manualmente.
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

### Cores e contraste

- Texto principal: `--color-text` sobre `--color-surface` (15,9:1). Texto secundário: `--color-text-muted` sobre branco (4,9:1). Use `--color-surface` para superfícies e `--color-surface-subtle` para fundos sutis.
- `--color-accent` e `--color-accent-strong` têm cerca de 3:1 sobre branco: use apenas em texto grande (≥24px ou ≥19px em negrito), ícones ou elementos não textuais. Não use como cor de texto de corpo nem como fundo de texto normal.
- `--color-accent-strong` fica no limite de 4,5:1 sobre branco. Valide o par exato antes de usá-lo como fundo de texto; gradientes podem reduzir o contraste.
- `--color-border` é uma hairline decorativa (1,4:1): não use como única indicação de foco, borda de campo ou estado.
- Não comunique estado (vitória/empate/derrota, classificação, cartão, suspensão) apenas por cor; use também texto, rótulo ou ícone.
- Todo par de cor usado em texto ou componente interativo deve atender WCAG AA: 4,5:1 para texto normal e 3:1 para texto grande e componentes de interface.
- Os tokens de referência são de tema claro. Não implemente tema escuro no MVP; isso exigiria spec e novos tokens.

### Espaçamento, forma e movimento

- Base de 8px: use `--space-1` a `--space-6` (8, 16, 24, 32, 48 e 64px). Evite valores intermediários arbitrários.
- Raios: `--radius-small` (8px), `--radius-card` (12px) e `--radius-pill` (9999px). Use `--radius-card` em cards de partidas, times, jogadoras e estatísticas.
- Elevação: `--shadow-card` para cards e `--shadow-floating` para elementos sobrepostos. Não crie sombras fora dos tokens.
- Movimento: use `--motion-default` (250ms) em transições discretas e respeite `prefers-reduced-motion: reduce`. Não anime conteúdo essencial nem use movimento para transmitir informação.

### Adaptação ao produto

- O DLS é otimizado para fotografia e produtos de viagem. Este site é orientado a dados e não exibe fotos de jogadoras (privacidade e desempenho em 4G).
- Adapte a intenção, não clone: aproveite a paleta coral/pink, a tipografia arredondada, o espaçamento generoso e os cards de 12px; priorize a leitura de tabelas, resultados e estatísticas.
- Não exiba fotos de jogadoras. Evite imagens de pessoas reais; prefira composição tipográfica, cor e ícones discretos. Imagens decorativas, se existirem, devem ser leves, licenciadas, com `alt` adequado e sem marcas da Airbnb.
- Não use o gradiente coral→pink em grandes áreas ou atrás de tabelas; reserve-o para pequenos acentos.
- Não sacrifique densidade, contraste ou clareza para reproduzir o estilo. Em dúvida, acessibilidade e legibilidade vencem.
- O card do amistoso é informativo: sem placar, status de partida, link de jogo ou tratamento visual de partida oficial.

### Acessibilidade visual

- Garanta foco visível com contraste de pelo menos 3:1 contra o fundo e o entorno; não remova `outline` sem substituto equivalente.
- Use tabelas semânticas com `caption`, `th` e `scope`; não use tabelas apenas para layout. Tabelas largas podem rolar dentro de um contêiner focável e rotulado, mas a página não deve ter overflow horizontal em 320px.
- Ícones informativos precisam de texto alternativo; ícones decorativos devem usar `aria-hidden="true"`.
- Respeite zoom de 200% e navegação por teclado sem perda de conteúdo ou funcionalidade.

## Regras da competição que o código deve garantir

### Formato

- **3 times:** TA, TB e TC.
- Fase classificatória em **turno e returno**: 6 partidas. Cada time joga 4 partidas e cada par tem um jogo em casa para cada lado.
- Vitória = 3 pontos, empate = 1, derrota = 0.
- Fase final: **1º x 2º** (final única). Não há semifinais.
- **3º lugar:** é o 3º da classificação. **Não há 3º x 4º, disputa de 3º lugar nem 4º lugar.**
- Pódio de três posições: campeã, vice-campeã e 3ª colocada.
- O **amistoso do 3º colocado** é um metadado informativo (`friendly`) no dia da final, antes da final; não é partida oficial e não altera classificação, estatísticas, suspensões ou pódio.

### Desempate (nesta ordem)

1. **Confronto direto**, somente quando exatamente dois times estão empatados em pontos.
   - Soma dos pontos dos **dois jogos** entre eles.
   - Se a soma empatar, **saldo agregado** dos dois jogos.
   - Se o saldo agregado empatar, passa ao próximo critério.
   - Só vale se os **dois jogos** estiverem `finished`; se um não estiver, o confronto direto é ignorado.
   - W.O. conta como 1x0.
2. Número de vitórias.
3. Saldo de gols (gols pró − gols contra).
4. Gols pró.
5. Menos gols contra.
6. Pontos disciplinares (menor é melhor): amarelo = 1; vermelho = 2; **segundo amarelo no mesmo jogo = 1 + 2 = 3 pontos**, sem somar outro amarelo.
7. Sorteio, com a ordem final registrada manualmente na fonte de dados em `drawOrder`.

Com 3 ou mais times empatados, o confronto direto **não** é aplicado até que o grupo se reduza a dois. A classificação considera apenas as 6 partidas de grupo; a final e o amistoso não alteram posições.

### Elenco

- Cada time tem 7 ou 8 jogadoras **ativas**; a 9ª ativa é bloqueada e menos de 7 gera aviso visível (sem impedir a publicação).
- `leftAt` remove a jogadora do elenco ativo, preserva o histórico e libera a vaga; o limite é de 8 ativas simultâneas.
- Badge público “Elenco em formação” somente com menos de 5 ativas; entre 5 e 6, apenas aviso de build.
- Apelido obrigatório e único dentro do time; pode repetir entre times.
- Posição opcional (goleira ou linha); time obrigatório.
- A mesma jogadora não pode estar em dois times.
- Inclusão de novas jogadoras é permitida até 8 ativas, antes da partida em que ela atuará; elegibilidade a partir da próxima partida, sem eventos retroativos.
- Jogadora que já atuou não pode trocar de time nesta edição.
- Remover jogadora do elenco ativo não apaga seu histórico.
- O mínimo de 3 em quadra é regra de jogo, não de elenco; o site não detecta jogadoras em quadra.

### Partida, gols e assistências

- Placar é **derivado dos gols registrados**; não existe placar digitado separadamente.
- Gol normal e pênalti no tempo normal contam para placar e artilharia.
- Gol contra é vinculado à jogadora que marcou contra, conta para o time adversário e **não** entra na artilharia dela; não tem assistência.
- Assistência é opcional, do mesmo time da marcadora e diferente dela; é proibida em pênalti e em gol contra.
- Minuto de gol, assistência e cartão é opcional.
- Gols, assistências e cartões da final contam para as estatísticas individuais.
- Pênaltis da disputa não contam para placar, artilharia nem assistências; registra-se apenas o placar dos pênaltis.
- Só pode haver evento vinculado a jogadora do elenco do time naquela partida e elegível no início dela.
- Status: `scheduled`, `finished` e `postponed`; `date` obrigatória; `startsAt` opcional em `scheduled`, obrigatório em `finished`; `postponed` sem eventos, W.O. ou shootout.

### Cartões e suspensão

- Segundo amarelo no mesmo jogo gera vermelho.
- Vermelho (direto ou por segundo amarelo) suspende a jogadora da próxima partida do time.
- Não há suspensão por acúmulo de amarelos.
- Jogadora suspensa não pode ter eventos na partida que não pode disputar; o sistema deve alertar e bloquear.
- Cartões na disputa de pênaltis não entram nas estatísticas nem geram suspensão.
- Cartões da final contam para estatísticas e suspensão, mas não para a classificação.
- Cartões de W.O. contam, exceto `no_show`, que não tem eventos.
- O amistoso não tem cartões.

### Fase final

- Apenas **1º x 2º** na final; não há 3º x 4º.
- `finalists` é o snapshot oficial dos dois finalistas, validado contra a classificação; é nulo enquanto o grupo não termina.
- Empate no tempo normal na final vai direto para pênaltis: 5 cobranças alternadas e morte súbita, se necessário.
- Exibir o resultado no formato `1 (4) x (3) 1`.
- Apenas o placar dos pênaltis é registrado; sem detalhes de cobradoras.
- Se uma correção após a final mudar os finalistas, o build falha listando antigos/novos e exige atualização de `finalists`.
- A 3ª colocada é a 3ª da classificação; não há partida de 3º lugar.
- W.O. na final define o título conforme o vencedor administrativo.

### Calendário

| Data | Partidas |
|---|---|
| 24/11/2026 | TA x TB (g1) e TB x TC (g2) |
| 26/11/2026 | TA x TC (g3) e TB x TA (g4) |
| 01/12/2026 | TC x TA (g5) e TC x TB (g6) |
| 03/12/2026 | Amistoso do 3º colocado (informativo) e 1º x 2º (final) |

- Cada time joga duas vezes em 24/11, 26/11 e 01/12; os horários devem ser distintos e respeitar a ordem canônica g1 → g2 → g3 → g4 → g5 → g6 → final.
- O amistoso é na mesma data da final e antes do horário da final, quando ela tiver horário.
- Horários e nomes definitivos dos times ainda não foram definidos; devem vir da fonte de dados, não fixos no código.
- Se uma partida for adiada, a organização atualiza `status` para `postponed`, ajusta `date`/`startsAt` e, quando remarcar, volta para `scheduled`.

### W.O. e retirada de time

- W.O. é manual, com placar fixo **1x0** para o vencedor.
- Motivos: `no_show`, `insufficient_players` ou `withdrawal`.
- Sem gols ou assistências fictícios.
- Cartões são permitidos em `insufficient_players`/`withdrawal`; `no_show` não tem eventos.
- O site não detecta ausência nem automatiza retirada de time; a organização registra um W.O. por partida restante.

### Amistoso do 3º colocado

- Metadado `friendly` com data, horário, local e nota; data igual à da final; horário anterior ao da final, quando ela tiver horário.
- Participantes, se necessário, apenas na nota, sem dados estruturados ou dados pessoais.
- Sem placar, eventos, cartões, estatísticas, suspensões, classificação, pódio ou link de jogo.
- Card informativo na Fase final, antes da final, com o rótulo “Informativo — não é partida oficial”.
- Se `friendly` for `null`, nenhum card ou placeholder é exibido.

## Validação obrigatória dos dados

A publicação deve ser bloqueada com mensagem clara quando houver:

- quantidade de times diferente de 3 na edição 2026;
- conjunto de partidas diferente de `g1`…`g6` + `final`;
- confrontos de grupo diferentes dos seis do turno e returno, time repetido, time contra si mesmo ou par sem os dois jogos;
- time com mais de 8 jogadoras ativas simultaneamente ou apelido repetido dentro do time;
- jogadora em dois times;
- evento referenciando jogadora fora do elenco do time na partida ou inelegível;
- assistência de jogadora de outro time, igual à marcadora, em pênalti ou em gol contra;
- gol contra com assistência;
- placar materializado ou incompatível com os gols registrados;
- partida final sem o confronto 1º x 2º conforme a classificação;
- `finalists` divergente da classificação ou ausente quando o grupo termina;
- `drawOrder` inválido ou ausente quando o sorteio é necessário;
- evento de jogadora suspensa na partida em que está suspensa;
- data/hora inválida ou referência a time, jogadora, partida ou aviso inexistente;
- W.O. inválido (não `finished`, vencedor fora dos participantes, motivo inválido, shootout presente, gols/assistências);
- shootout inválido (fora da final, sem empate no tempo normal, com W.O., valores iguais ou negativos);
- amistoso inválido (data diferente da final, horário posterior, local/nota vazio ou campo de partida);
- campo de privacidade proibido (nome completo, foto, contato, camisa, data de nascimento, telefone, e-mail, endereço ou redes sociais).

O catálogo completo de códigos `VAL-*` e `VAL-W*` está na `SPEC.md` §8.

## Diretrizes de implementação

- Isole as regras de negócio (pontuação, desempate, cartões, suspensões, placar, artilharia, estatísticas coletivas, pódio) em funções puras e testáveis.
- Derive classificação e estatísticas sempre a partir dos eventos; nunca as armazene como verdade editável.
- `buildTeamStats` agrega grupo + final; V/E/D usam o tempo normal, uma final decidida nos pênaltis conta como empate e a campanha nos pênaltis é registrada separadamente (`shootoutWins`/`shootoutLosses`); o shootout não altera GP/GC/SG; o amistoso não entra.
- A fonte de dados deve ser legível por humanos e ter formato validado antes do build.
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
- Suspensão automática e bloqueio de eventos.
- Gol contra, assistência opcional e pênaltis fora da artilharia.
- Estatísticas coletivas: grupo + final; final nos pênaltis conta como empate em V/E/D; `shootoutWins`/`shootoutLosses` separados; GP/GC/SG sem shootout; amistoso fora.
- Simetria dos confrontos: cada par tem um jogo em casa para cada lado; `g4` é `tb x ta`.
- Definição de finalistas e pódio de 3, sem 4º lugar.
- W.O. 1x0, motivos e cartões permitidos.
- `finalists`, `drawOrder` e `notices`.
- Amistoso como card informativo e ausência em listas/estatísticas.
- Todas as validações de dados listadas acima.
- Contraste WCAG AA dos pares de cor usados em texto e componentes interativos.
- Foco visível e navegação por teclado nos componentes interativos.
- Ausência de informação transmitida apenas por cor.
- Respeito a `prefers-reduced-motion`.
- Layout sem overflow horizontal da página em 320px; tabelas largas com rolagem acessível.
- `airbnb-design-design.md` fora do build e ausência de arquivos das fontes proprietárias `Airbnb Cereal` e `Circular`.
- Textos e metadados públicos sem o nome da instituição ou marcas da Airbnb.
- Ausência de JavaScript de cliente no `dist/`.

## Comandos

Comandos definidos na `SPEC.md` §12.7. Use apenas comandos reais e verificáveis do projeto; nunca documente comandos que não funcionam.

| Comando | O que faz | Quando usar |
|---|---|---|
| `npm ci` | Instala exatamente o lockfile. | Setup local/CI. |
| `npm run dev` | Servidor Astro de desenvolvimento. | UI local. |
| `npm run validate` | Valida `data/2026/copa.yaml` e imprime erros/avisos. | Antes de commit. |
| `npm run check` | `astro check` (TypeScript + Astro). | Antes de commit/CI. |
| `npm test` | Vitest (unitários + dados). | Antes de commit/CI. |
| `npm run build` | Gera `dist/` estático. | Publicação local/CI. |
| `npm run preview` | Serve `dist/` em `localhost:4321/futsal-cup/`. | Conferência local/E2E. |
| `npm run test:build` | Varre `dist/` (rotas, JS, termos, orçamento). | Após build. |
| `npm run test:e2e` | Playwright + axe. | Após build. |
| `npm run verify` | Sequência completa local. | Antes de PR/publicação. |
| `npx playwright install --with-deps chromium` | Instala o navegador de teste. | Setup do E2E. |
