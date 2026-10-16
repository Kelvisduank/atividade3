# AGENTS.md — receitas-da-casa

Caderno de receitas da família: site estático (HTML + JS puro, sem framework, sem dependências).
Cada receita é um arquivo `receitas/<id>.json`; o site lê `receitas/indice.json`.

## Comandos
- `npm run validar` — valida todas as receitas e regenera `receitas/indice.json`. Rode depois de criar ou editar qualquer receita.
- `npm test` — testes do validador (`node:test`, sem libs).
- `npm run dev` — sobe o site em http://localhost:3000 (`fetch` não funciona abrindo o HTML direto).

## Estrutura
- `receitas/*.json` — uma receita por arquivo; o nome do arquivo é exatamente o `id`.
- `receitas/indice.json` — gerado pelo validador. Nunca edite à mão.
- `scripts/validar.mjs` — o schema mora aqui (`validarReceita`). Ele é a fonte da verdade, não este arquivo.
- `app.js`, `index.html`, `style.css` — o site.

## Convenções
- Código e textos em português do Brasil; JS em ES modules, `const` por padrão, sem ponto e vírgula opcional omitido.
- Não adicione dependências npm. Se achar que precisa de uma, pergunte antes.
- Unidades de ingrediente só da lista `UNIDADES` em `scripts/validar.mjs`.
