# Skill `nova-receita`

Transforma uma receita escrita de qualquer jeito ("uns 3 ovos, sal a gosto, assa até
dourar") num arquivo JSON válido do caderno, sem inventar o que não foi dito: tudo que
faltou vira `null` e entra numa lista de `pendencias` para confirmar depois.

**Como usar em outro projeto:** copie esta pasta para `.claude/skills/nova-receita/` do seu
projeto e reinicie o Claude Code. Ela pressupõe um `npm run validar` e o schema de
`scripts/validar.mjs` deste repositório, então adapte o `reference.md` ao seu schema.
Dispara sozinha quando você pede para "adicionar/cadastrar uma receita", ou na mão com
`/nova-receita`.
