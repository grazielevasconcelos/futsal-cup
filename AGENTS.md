# AGENTS.md

Instruções para agentes de código que trabalham neste repositório.

## Visão geral

Site público, estático e somente leitura da **Copa de Futsal Feminino Vila Mariana 2026**. A competição tem 4 times, 6 partidas na fase classificatória e 2 partidas na fase final. Os dados são mantidos em uma fonte versionada e o site é publicado no GitHub Pages.

**Estado atual:** o repositório contém documentação e referências visuais (Airbnb DLS). A stack, o formato da fonte de dados e a estrutura de código ainda serão definidos em uma spec técnica. Não presuma tecnologias nem crie comandos fictícios.

## Fontes de verdade

Leia antes de implementar qualquer mudança:

| Arquivo | Papel |
|---|---|
| `PRD.md` | Fonte de verdade de produto, regras da competição, validações e critérios de aceite. |
| `context.md` | Contexto original da organização. Em caso de conflito, o `PRD.md` prevalece. |
| `README.md` | Visão geral do repositório (hoje mínimo). |
| `airbnb-design-design.md` | Referência visual não oficial (Airbnb DLS): princípios, tipografia, cores, espaçamento, raios, elevação e movimento. |
| `airbnb-design-tokens.css` | Tokens CSS da referência visual; valores indicativos, não canônicos. |

- Não invente requisitos que não estejam no PRD.
- Se uma decisão de produto não estiver documentada, pergunte antes de assumir.
- Mudanças de regra exigem atualização do `PRD.md` e deste arquivo, se afetarem instruções para agentes.
- Os arquivos de design são referência visual, não fonte de verdade de produto. Em conflito, prevalecem o `PRD.md`, este `AGENTS.md` e os requisitos de acessibilidade.
- Mudanças de identidade visual ou de tokens exigem atualização da seção de design deste arquivo.

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

## Design e identidade visual

### Referências

Os arquivos `airbnb-design-design.md` e `airbnb-design-tokens.css` são uma referência visual **não oficial**, de terceiros (designsystems.one), baseada em material público sobre o Airbnb DLS.

- Não são documentação oficial da Airbnb e não implicam afiliação, endosso ou patrocínio. Preserve os cabeçalhos de autoria e atribuição.
- Os valores são **indicativos**, não canônicos. Em conflito, prevalecem o `PRD.md`, este `AGENTS.md` e os requisitos de acessibilidade.
- A referência é de uso interno na documentação, não de interface pública. Não publique os arquivos de referência como páginas do site; o `airbnb-design-design.md` não deve ir para o build. O `airbnb-design-tokens.css` pode ser importado pela camada de tokens do projeto e compilado no CSS final. Não use logotipos, ícones proprietários ou o nome "Airbnb" de forma que sugira que o site é oficial, endossado ou afiliado. O nome público continua sendo "Copa de Futsal Feminino Vila Mariana 2026". Nomes internos de arquivos e tokens podem manter a referência para rastreabilidade.
- Não altere os valores dos arquivos de referência para adaptar o produto. Quando a UI for implementada, crie uma camada de tokens do projeto que importe ou estenda `airbnb-design-tokens.css`; sobrescritas devem ser documentadas.
- Na camada do projeto, prefira aliases semânticos (por exemplo, `--color-text`, `--color-text-muted`, `--color-surface`, `--color-accent`) mapeados para os tokens de referência. Componentes devem consumir os aliases, não os nomes da marca.
- Toda cor, tipografia, espaçamento, raio, sombra e movimento deve vir dos tokens. Não repita valores hexadecimais ou medidas avulsas nos componentes; se precisar de um valor novo, crie um token do projeto e justifique.
- A integração dos tokens ao build ainda não existe e será definida na spec técnica. Não presuma um pipeline.

### Tipografia

- `Airbnb Cereal` e `Circular` são fontes proprietárias. Não baixe, embuta ou auto-hospede esses arquivos sem licença. O layout deve funcionar com a pilha de fallback (`-apple-system`, `'Helvetica Neue'`, `sans-serif`) ou com uma alternativa aberta definida na spec técnica. Se usar uma fonte externa, auto-hospede apenas os pesos necessários e use `font-display: swap`.
- Use a escala: `display` 48/56, `heading-1` 32/36, `heading-2` 22/26, `body` 16/24 e `small` 14/18 (tamanho/entrelinha).
- Pesos previstos: 400, 500, 600 e 700. Não use pesos fora dessa faixa nem dependa de variantes que a fonte de fallback não tenha.
- Não crie passos de texto abaixo de 14px. `display` é para títulos curtos; em telas estreitas, prefira `heading-1` ou `heading-2`.
- Preserve o par tamanho/entrelinha dos tokens; não ajuste a entrelinha isoladamente sem testar a leitura em mobile.

### Cores e contraste

- Texto principal: `--airbnb-hof` sobre `--airbnb-white` (15,9:1). Texto secundário: `--airbnb-foggy` sobre branco (4,9:1). Use `--airbnb-white` para superfícies e `--airbnb-light` para fundos sutis; `--airbnb-hof` sobre `--airbnb-light` tem 14,9:1.
- `--airbnb-rausch` e `--airbnb-babu` têm cerca de 3:1 sobre branco: use apenas em texto grande (≥24px ou ≥19px em negrito), ícones ou elementos não textuais. Não use como cor de texto de corpo nem como fundo de texto normal.
- `--airbnb-pink` fica no limite de 4,5:1 sobre branco. Valide o par exato antes de usá-lo como fundo de texto; gradientes podem reduzir o contraste.
- `--airbnb-border` é uma hairline decorativa (1,4:1): não use como única indicação de foco, borda de campo ou estado.
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

### Acessibilidade visual

- Garanta foco visível com contraste de pelo menos 3:1 contra o fundo e o entorno; não remova `outline` sem substituto equivalente.
- Use tabelas semânticas com `caption`, `th` e `scope`; não use tabelas apenas para layout. Tabelas largas podem rolar dentro de um contêiner focável e rotulado, mas a página não deve ter overflow horizontal em 320px.
- Ícones informativos precisam de texto alternativo; ícones decorativos devem usar `aria-hidden="true"`.
- Respeite zoom de 200% e navegação por teclado sem perda de conteúdo ou funcionalidade.

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
- Aplique os tokens de design antes dos estilos de componentes; não codifique cores, tamanhos, espaçamentos ou sombras diretamente.
- Valide contraste, foco e comportamento em mobile em toda alteração de UI; a referência visual não substitui os testes de acessibilidade.
- Não inclua o nome da instituição nem marcas da Airbnb em textos ou assets visuais públicos (logotipos, imagens, favicon, metadados, Open Graph); revise títulos, metadados, `alt`, favicon, imagens, Open Graph, rodapé e mensagens. Nomes internos de arquivos e tokens são permitidos.

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
- Desempate entre dois times, incluindo confronto direto empatado.
- Desempate com 3+ times e reaplicação do confronto direto ao reduzir para dois.
- Pontos disciplinares, incluindo segundo amarelo (3 pontos).
- Suspensão automática e bloqueio de eventos.
- Gol contra, assistência opcional e pênaltis fora da artilharia.
- Definição de finalistas e pódio.
- Todas as validações de dados listadas acima.
- Contraste WCAG AA dos pares de cor usados em texto e componentes interativos.
- Foco visível e navegação por teclado nos componentes interativos.
- Ausência de informação transmitida apenas por cor.
- Respeito a `prefers-reduced-motion`.
- Layout sem overflow horizontal da página em 320px; tabelas largas com rolagem acessível.
- `airbnb-design-design.md` fora do build e ausência de arquivos das fontes proprietárias `Airbnb Cereal` e `Circular`.
- Textos e metadados públicos sem o nome da instituição ou marcas da Airbnb.

## Comandos

Ainda não definidos. Quando a stack e o plano de implementação forem escolhidos, atualize esta seção com:

- instalação de dependências;
- execução local;
- validação da fonte de dados;
- testes;
- build e publicação.

Use apenas comandos reais e verificáveis do projeto; nunca documente comandos que não funcionam.
