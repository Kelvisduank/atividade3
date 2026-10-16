# Receitas da Casa

Caderno de receitas da família num site estático. Cada receita é um arquivo JSON em
`receitas/`, validado por um schema. Quando uma informação não foi passada (quantidade,
tempo de forno...), ela fica `null` e aparece no site como "falta confirmar".

## Rodando

```bash
npm run validar   # valida as receitas e gera receitas/indice.json
npm test          # testes do validador
npm run dev       # abre o site em http://localhost:3000
```

Não tem dependências: só Node 20+.

## Trabalhando com IA neste repositório

- [`AGENTS.md`](AGENTS.md): regras do projeto para qualquer coding agent. O `CLAUDE.md`
  só importa ele (`@AGENTS.md`).
- [`.claude/skills/nova-receita/`](.claude/skills/nova-receita/): skill que transforma
  receita em texto solto em JSON válido. Para usar, peça "cadastra essa receita: ..." ou
  chame `/nova-receita`.
- [`docs/LOG-TESTES-SKILL.md`](docs/LOG-TESTES-SKILL.md): testes causais das regras e
  testes de disparo da skill (positivo, negativo, falso positivo, ajuste após falha).
