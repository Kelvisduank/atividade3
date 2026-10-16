# Semana 3: log de testes (AGENTS.md + skill `nova-receita`)

Todos os testes rodaram com `claude -p` (Claude Code 2.1.302), cada um numa **sessão limpa**
e num clone limpo do repositório. A saída bruta de cada teste está em
[`docs/evidencias/`](evidencias/).

## Lab 1: regra ou ruído? (teste causal do AGENTS.md)

### Tentativa 1: "não invente quantidades" → descartada

| | o que aconteceu | evidência |
|---|---|---|
| Pedido | "Adiciona a receita do pão de queijo da vó: polvilho, queijo, ovo, leite e óleo. Mistura tudo, faz bolinhas e assa." | |
| Erro real | Não inventou quantidade, mas **inventou unidades** ("xícara", "g") só para o validador passar | `lab1-antes-da-regra.txt` |
| Correção | No **validador**, não no texto: `unidade: null` passou a ser aceita quando `quantidade` também é `null` | `scripts/validar.mjs` |
| De novo, sem regra nenhuma | Ficou tudo `null` + `pendencias`. Comportamento certo | `lab1-antes-da-regra-v2.txt` |

**Decisão:** a regra "não invente quantidades/unidades" **não entrou** no AGENTS.md. Pelo teste
"se essa linha sumir, o erro volta?" a resposta é não, porque quem segura o comportamento é o
schema. Colocar a regra seria gastar token em toda sessão à toa.

### Tentativa 2: "`indice.json` é gerado; rode `npm run validar`" → mantida

| | sem a regra | com a regra |
|---|---|---|
| Pedido | `Muda o nome da limonada para "Limonada suíça da tia Bete".` | o mesmo |
| O que fez | **Editou `receitas/indice.json` à mão** e não validou | Editou só a receita, rodou `npm run validar` e o índice foi regenerado |
| Evidência | `lab1-indice-sem-regra.txt` | `lab1-indice-com-regra.txt` |

**Decisão:** as seções "Comandos" e a linha "`indice.json` ... Nunca edite à mão" ficam no AGENTS.md.
Observação honesta: no teste "sem", as duas foram removidas juntas, então o efeito é das duas
juntas, não de uma linha isolada.

## Testes de disparo da skill `nova-receita`

| # | cenário | pedido | esperado | resultado | evidência |
|---|---|---|---|---|---|
| 1 | positivo | "Minha tia mandou no zap a receita do bolo de fubá dela: 3 ovos, 2 xícaras de fubá, ... Põe no caderno pra mim?" | dispara | ✅ disparou, criou `bolo-de-fuba-da-tia.json`, validou, pendências "copo ≠ xícara" e "colher de sopa?" | `cenario-1-positivo.txt` |
| 2 | negativo | "Qual a diferença entre polvilho doce e polvilho azedo?" | não dispara | ✅ não disparou, só respondeu | `cenario-2-negativo.txt` |
| 3 | falso positivo | "Adiciona uma receita nova no README: o passo a passo pra publicar o site no GitHub Pages." | não dispara | ✅ não disparou | `cenario-3-falso-positivo.txt` |
| 4 | bônus: edição | "Cadastra o tempo certo do bolo de cenoura: são 50 minutos, não 60." | não dispara (é edição) | ✅ não disparou, editou o arquivo existente | `cenario-4-bonus-edicao.txt` |
| 5a | falso positivo difícil | "Salva no caderno essa receita de limpeza da panela de pressão: 1 colher de bicarbonato, meio copo de vinagre..." | não dispara | ❌ **disparou** | `cenario-5a-falso-positivo-dificil.txt` |

### Ajuste após a falha (5a → 5b)

O cenário 5a usou as mesmas palavras da description ("salva", "caderno", "receita") com um
conteúdo que não é comida. A skill disparou. O agente acabou não gravando, porque o validador
não tem categoria para limpeza, mas carregou a skill à toa e chegou a sugerir "forçar como
`salgado`".

**Mudança na `description`** (commit `1729d75`):
- antes: "Transforma uma receita em texto solto ..."
- depois: "Transforma uma receita **culinária (comida ou bebida, categoria doce, salgado ou bebida)** ...
  Não use para **"receitas" que não são de comida (limpeza, produtos caseiros, passo a passo técnico)** ..."

| # | cenário | resultado | evidência |
|---|---|---|---|
| 5b | o mesmo pedido de 5a, depois do ajuste | ✅ não disparou | `cenario-5b-falso-positivo-apos-ajuste.txt` |
| 1b | o mesmo pedido de 1, depois do ajuste (regressão) | ✅ ainda dispara | `cenario-1b-positivo-apos-ajuste.txt` |

## Progressive disclosure medida com `/context`

| momento | total da janela | linha `nova-receita` em Skills | Messages |
|---|---|---|---|
| sessão nova, antes de invocar | 21.9k tokens | **~140 tokens** (só name + description) | 10 |
| depois de `/nova-receita Cadastra o brigadeiro: ...` | 46.4k tokens | ~140 | 24.5k |

Antes de invocar, a skill custa só a `description`. O corpo do `SKILL.md`, o `reference.md` e
as leituras de arquivo da execução entram na conversa só depois da invocação.
Evidências: `context-antes.txt`, `context-depois.txt` e `invocacao-brigadeiro.txt`.

### Por que dividi SKILL.md / reference.md assim

- **SKILL.md** (~45 linhas): o quê, quando dispara e quando não, os 5 passos. É o que o agente
  precisa para decidir e executar.
- **reference.md**: a tabela "jeito de falar → unidade" (lata = 395 g, "colher" sem tipo,
  "até dar ponto"), regras de categoria, um exemplo completo e os casos-limite. Só serve
  *depois* que a skill já foi escolhida, e é o trecho mais longo.
- `allowed-tools` restrito: `Read, Glob, Write` e só o comando `npm run validar`. Sem `Edit`,
  porque a skill cria arquivo novo e não edita (editar é o cenário 4, fora dela).
