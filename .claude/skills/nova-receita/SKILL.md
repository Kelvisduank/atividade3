---
name: nova-receita
description: Transforma uma receita culinária (comida ou bebida, categoria doce, salgado ou bebida) em texto solto (ditada, colada de mensagem de WhatsApp, transcrita de caderno) num arquivo novo receitas/<id>.json no schema do caderno receitas-da-casa e roda o validador. Use quando pedirem para adicionar, cadastrar, salvar ou transcrever uma receita de comer ou beber NOVA no caderno. Não use para "receitas" que não são de comida (limpeza, produtos caseiros, passo a passo técnico), para editar uma receita que já existe, nem para dúvidas de culinária.
allowed-tools: Read, Glob, Write, Bash(npm run validar), PowerShell(npm run validar)
---

# Nova receita no caderno

## O que ela faz

Recebe uma receita escrita do jeito que a pessoa falou ("2 xícaras de farinha, uns 3 ovos,
sal a gosto, assa uns 40 min") e gera **um** arquivo `receitas/<id>.json` que passa no
validador. Ela nunca completa o que não foi dito: lacuna vira `null` + item em `pendencias`.

## Quando dispara (e quando não)

- ✅ "Salva essa receita de escondidinho que minha mãe mandou no zap: ..."
- ❌ "Quanto tempo de forno pra um escondidinho?" (dúvida de culinária, não é cadastro)
- ❌ "Corrige o tempo do bolo de cenoura pra 50 min" (edita receita existente: edição normal)
- ❌ "Salva no caderno a receita de limpeza da panela" (não é comida; já disparou errado
  aqui antes deste ajuste, veja `docs/LOG-TESTES-SKILL.md`)

## Passos

1. `Glob receitas/*.json` e confira se já existe receita com o mesmo prato. Se existir,
   pare e pergunte se é uma variação (novo `id`) ou uma edição (aí esta skill não serve).
2. Leia [reference.md](reference.md): o mapeamento de "jeito de falar" → campos e unidades
   está lá. Não chute a unidade sem olhar a tabela.
3. Escreva `receitas/<id>.json`. O `id` é o título em slug (`escondidinho-de-carne`).
4. Rode `npm run validar`. Se falhar, corrija **só** o arquivo novo e rode de novo.
   Se não conseguir rodar o comando, pare e avise; nunca edite `indice.json` à mão.
5. Responda em até 5 linhas: arquivo criado, resultado do validador e a lista de
   `pendencias` (o que a pessoa precisa confirmar com quem passou a receita).

## Exemplo de invocação

```
> Cadastra o brigadeiro: 1 lata de leite condensado, 1 colher de manteiga,
  4 colheres de chocolate em pó. Mexe no fogo até desgrudar da panela.
```

Resultado esperado: `receitas/brigadeiro.json`, categoria `doce`, "1 colher de manteiga"
vira `colher-sopa` + pendência "confirmar se é colher de sopa", `rendimento: null` +
pendência, e o validador passando.
