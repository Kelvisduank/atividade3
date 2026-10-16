# Referência: nova-receita

Só é lido no passo 2 da skill. A fonte da verdade do schema é
`scripts/validar.mjs` (`validarReceita`, `CATEGORIAS`, `UNIDADES`). Se este arquivo e o
validador discordarem, vale o validador, e este arquivo precisa ser corrigido.

## Formato de saída

```json
{
  "id": "slug-do-titulo",
  "titulo": "Título como a pessoa chama a receita",
  "categoria": "doce | salgado | bebida",
  "rendimento": 8,
  "tempoMinutos": 45,
  "ingredientes": [
    { "nome": "farinha de trigo", "quantidade": 2, "unidade": "xicara" }
  ],
  "passos": ["Um passo por item, no imperativo."],
  "pendencias": ["o que não foi informado e precisa ser confirmado"]
}
```

- `rendimento` = porções (inteiro). "Rende uma forma" não é número → `null` + pendência.
- `tempoMinutos` = tempo total. "Uns 40 min de forno" + preparo não informado → `40` + pendência
  "tempo de preparo além do forno não informado".
- `pendencias` é obrigatório: lista vazia `[]` só se nada ficou faltando.

## Do jeito de falar para unidade

| a pessoa escreveu | `quantidade` | `unidade` | pendência? |
|---|---|---|---|
| "2 xícaras", "2 xíc", "2 copos americanos"* | 2 | `xicara` | *copo americano ≠ xícara: sim |
| "1 colher", "1 colher cheia" (sem dizer qual) | 1 | `colher-sopa` | sim: "confirmar se é colher de sopa" |
| "1 colher de chá", "1 colherzinha" | 1 | `colher-cha` | não / sim pra "colherzinha" |
| "meio quilo", "500g" | 500 | `g` | não |
| "1 lata de leite condensado" | 395 | `g` | não (lata padrão = 395 g) |
| "1 caixinha de creme de leite" | 200 | `g` | não (caixinha padrão = 200 g) |
| "3 ovos", "1 cebola" | 3 | `unidade` | não |
| "uns 3 ovos", "2 ou 3 ovos" | 3 (o maior) | `unidade` | sim: "quantidade aproximada: 2 ou 3" |
| "sal a gosto", "pitada de sal" | `null` | `a-gosto` | não |
| "farinha até dar ponto" | `null` | `null` | sim: "quantidade de farinha não informada (até dar ponto)" |
| ingrediente citado sem quantidade nenhuma | `null` | `null` | sim |

Nunca escolha uma unidade só para o validador passar. Unidade desconhecida → `null` +
pendência.

## Categoria

- `doce`: bolo, torta doce, pudim, brigadeiro, sobremesa.
- `salgado`: prato principal, salgadinho, pão, torta salgada, molho.
- `bebida`: suco, vitamina, café, drink.
- Ambíguo (ex.: "torta de banana com queijo") → escolha a mais provável e registre em
  `pendencias`: "categoria escolhida: doce, confirmar".

## Exemplo completo

Entrada:
> "escondidinho da mãe: meio quilo de carne moída, 1kg de mandioca, 1 caixinha de creme de
> leite, queijo pra gratinar, cebola e alho. cozinha a mandioca e amassa com o creme de
> leite, refoga a carne com cebola e alho, monta em camadas e leva no forno até dourar"

Saída `receitas/escondidinho-da-mae.json`:

```json
{
  "id": "escondidinho-da-mae",
  "titulo": "Escondidinho da mãe",
  "categoria": "salgado",
  "rendimento": null,
  "tempoMinutos": null,
  "ingredientes": [
    { "nome": "carne moída", "quantidade": 500, "unidade": "g" },
    { "nome": "mandioca", "quantidade": 1, "unidade": "kg" },
    { "nome": "creme de leite", "quantidade": 200, "unidade": "g" },
    { "nome": "queijo para gratinar", "quantidade": null, "unidade": null },
    { "nome": "cebola", "quantidade": null, "unidade": null },
    { "nome": "alho", "quantidade": null, "unidade": null }
  ],
  "passos": [
    "Cozinhe a mandioca e amasse com o creme de leite.",
    "Refogue a carne com a cebola e o alho.",
    "Monte em camadas: purê, carne, purê e queijo por cima.",
    "Leve ao forno até dourar."
  ],
  "pendencias": [
    "quantidade de queijo, cebola e alho não informada",
    "ordem das camadas suposta (purê, carne, purê): confirmar",
    "temperatura e tempo de forno não informados",
    "rendimento não informado"
  ]
}
```

Repare: a ordem das camadas foi uma inferência, por isso foi para `pendencias`.

## Casos-limite já vistos

- **Receita com mesmo nome já existe** → não sobrescreva; pergunte (passo 1).
- **Duas receitas no mesmo texto** (ex.: bolo + cobertura): se a cobertura só serve pro
  bolo, é uma receita só com os passos da cobertura no final (veja `bolo-de-cenoura.json`).
  Se forem pratos independentes, crie dois arquivos e avise.
- **Validador bloqueado por permissão**: não "valide de cabeça" nem edite `indice.json`.
  Diga que o arquivo foi criado mas não validado, e peça para rodar `npm run validar`.
