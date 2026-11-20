# Guia de atualização pelo celular (app do GitHub)

Guia prático para registrar os resultados das partidas `g1` a `g6` direto no
app do GitHub, editando apenas `data/2026/copa.yaml`.

## Passo a passo

1. Abra o repositório no app do GitHub e navegue até
   `data/2026/copa.yaml`.
2. Toque no ícone de lápis (Editar).
3. Role até o bloco da partida que acabou (`g1`…`g6`) **e não mexa nos demais**.
4. Preencha os campos conforme a seção abaixo.
5. Role até o fim e use uma mensagem de commit clara, por exemplo:
   `dados: registra resultado do jogo 1`.
6. Confirme o commit direto em `main`.
7. Aguarde o GitHub Actions. Se falhar, o site publicado permanece na versão
   anterior; abra o erro do workflow, corrija no YAML e comite de novo.

## Regras de ouro

- **Nunca digite placar.** O placar é calculado a partir dos gols em `events`.
- Só edite **um jogo por commit**: fica fácil revisar o diff no celular.
- Mantenha a indentação de 2 espaços e as aspas nos IDs e datas.
- Só lance eventos de jogadoras que estavam aptas naquele jogo (verifique a
  lista de IDs no topo do arquivo).
- `semi`, `final`, `semifinalists` e `finalists` ficam como estão até o fim da
  fase classificatória. Não os edite ao registrar jogos de grupo.

## Registrando uma partida realizada

No bloco da partida:

1. Troque `status: "scheduled"` por `status: "finished"`.
2. Mantenha `startsAt` preenchido (obrigatório em partida finalizada).
3. Substitua `events: []` pela lista de eventos, em ordem cronológica.

### Gol (com ou sem assistência)

```yaml
    events:
      - type: "goal"
        playerId: "p-003"
        assistPlayerId: "p-001"
        minute: 7
        penalty: false
```

- `assistPlayerId` é opcional; sem assistência, use `assistPlayerId: null`
  (ou omita a linha).
- `minute` é opcional; se não souber, use `minute: null` (ou omita a linha).

### Pênalti convertido no tempo normal

```yaml
      - type: "goal"
        playerId: "p-010"
        penalty: true
```

Pênalti **não tem assistência**.

### Gol contra

```yaml
      - type: "ownGoal"
        playerId: "p-012"
        minute: 15
```

`playerId` é a jogadora que marcou **contra**; o gol conta para o adversário e
não entra na artilharia dela. Gol contra **não tem assistência**.

### Cartões

```yaml
      - type: "yellow"
        playerId: "p-005"
        minute: 20
      - type: "yellow"
        playerId: "p-005"
        minute: 35
      - type: "red"
        playerId: "p-005"
        minute: 35
```

- Segundo amarelo no mesmo jogo: registre os dois amarelos **e** o vermelho.
- Vermelho direto: registre só o `red`.
- A suspensão da próxima partida do time é calculada automaticamente; o sistema
  bloqueia eventos de jogadora suspensa, então confira antes de lançar.

### Exemplo de jogo completo

```yaml
  - id: "g1"
    stage: "group"
    round: 1
    homeTeamId: "ta"
    awayTeamId: "tb"
    date: "2026-11-24"
    startsAt: "2026-11-24T18:45:00-03:00"
    venue: "7º andar"
    status: "finished"
    walkover: null
    events:
      - type: "goal"
        playerId: "p-003"
        assistPlayerId: "p-001"
        minute: 7
        penalty: false
      - type: "yellow"
        playerId: "p-012"
        minute: 12
      - type: "goal"
        playerId: "p-010"
        minute: 25
        penalty: true
```

Resultado derivado: TA 1 x 1 TB.

## W.O.

Quando a partida não acontece e é decidida administrativamente:

```yaml
    status: "finished"
    walkover:
      winnerTeamId: "tb"
      reason: "no_show"
    events: []
```

- Motivos válidos: `no_show`, `insufficient_players`, `withdrawal`.
- Placar fixo 3x0 para a vencedora; **não** lance gols nem assistências.
- `no_show` não tem nenhum evento. Em `insufficient_players` e `withdrawal`,
  cartões são permitidos.

## Partida adiada

```yaml
    status: "postponed"
    startsAt: null
```

Sem eventos e sem W.O. Ao remarcar, ajuste `date`/`startsAt` e volte para
`status: "scheduled"`.

## Consulta rápida de IDs

Os IDs das jogadoras estão no topo do próprio arquivo, por time:

- **TA** (`p-001` a `p-008`)
- **TB** (`p-009` a `p-016`)
- **TC** (`p-017` a `p-024`)

Antes de lançar um evento, confira se o ID pertence a uma jogadora do time
certo. Evento com jogadora de outro time ou de time que não joga a partida
bloqueia a publicação.

## Erros comuns que bloqueiam a publicação

- Placar digitado manualmente ou campo fora do schema (o arquivo não aceita
  campos de placar, `friendly` ou `shootout`).
- Assistência de jogadora de outro time, igual à marcadora, em pênalti ou em
  gol contra.
- Evento de jogadora suspensa ou inelegível naquela partida.
- `status: "finished"` sem `startsAt`.
- Indentação quebrada ou aspas removidas de IDs e datas.
