// Valida todas as receitas em receitas/*.json contra o schema do projeto
// e regenera receitas/indice.json (lista usada pelo site).
// Uso: node scripts/validar.mjs   (sai com código 1 se alguma receita for inválida)
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export const CATEGORIAS = ['doce', 'salgado', 'bebida'];
export const UNIDADES = ['g', 'kg', 'ml', 'l', 'xicara', 'colher-sopa', 'colher-cha', 'unidade', 'a-gosto'];

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export function validarReceita(r, nomeArquivo) {
  const erros = [];
  const exigir = (cond, msg) => { if (!cond) erros.push(msg); };

  exigir(r && typeof r === 'object' && !Array.isArray(r), 'a receita precisa ser um objeto');
  if (erros.length) return erros;

  exigir(typeof r.id === 'string' && SLUG.test(r.id), 'id precisa ser slug minúsculo com hífen (ex.: bolo-de-cenoura)');
  if (nomeArquivo) exigir(`${r.id}.json` === nomeArquivo, `o arquivo precisa se chamar ${r.id}.json`);
  exigir(typeof r.titulo === 'string' && r.titulo.trim() !== '', 'titulo é obrigatório');
  exigir(CATEGORIAS.includes(r.categoria), `categoria precisa ser uma de: ${CATEGORIAS.join(', ')}`);
  exigir(r.rendimento === null || (Number.isInteger(r.rendimento) && r.rendimento > 0),
    'rendimento precisa ser inteiro positivo (porções) ou null se não foi informado');
  exigir(r.tempoMinutos === null || (Number.isInteger(r.tempoMinutos) && r.tempoMinutos > 0),
    'tempoMinutos precisa ser inteiro positivo ou null se não foi informado');

  exigir(Array.isArray(r.ingredientes) && r.ingredientes.length > 0, 'ingredientes precisa ser uma lista não vazia');
  (Array.isArray(r.ingredientes) ? r.ingredientes : []).forEach((ing, i) => {
    const onde = `ingredientes[${i}]`;
    exigir(typeof ing.nome === 'string' && ing.nome.trim() !== '', `${onde}.nome é obrigatório`);
    exigir(UNIDADES.includes(ing.unidade) || (ing.unidade === null && ing.quantidade === null),
      `${onde}.unidade precisa ser uma de: ${UNIDADES.join(', ')} (ou null junto com quantidade null)`);
    if (ing.unidade === 'a-gosto') {
      exigir(ing.quantidade === null, `${onde}: com unidade "a-gosto" a quantidade precisa ser null`);
    } else {
      exigir(ing.quantidade === null || (typeof ing.quantidade === 'number' && ing.quantidade > 0),
        `${onde}.quantidade precisa ser número positivo ou null se não foi informada`);
    }
  });

  exigir(Array.isArray(r.passos) && r.passos.length > 0 && r.passos.every(p => typeof p === 'string' && p.trim() !== ''),
    'passos precisa ser uma lista não vazia de textos');
  exigir(Array.isArray(r.pendencias) && r.pendencias.every(p => typeof p === 'string'),
    'pendencias precisa ser uma lista de textos (vazia se nada ficou faltando)');

  return erros;
}

function main() {
  const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
  const pasta = join(raiz, 'receitas');
  const arquivos = readdirSync(pasta).filter(f => f.endsWith('.json') && f !== 'indice.json').sort();
  let falhou = false;
  const indice = [];

  for (const arq of arquivos) {
    let receita;
    try {
      receita = JSON.parse(readFileSync(join(pasta, arq), 'utf8'));
    } catch (e) {
      console.error(`✗ ${arq}: JSON inválido (${e.message})`);
      falhou = true;
      continue;
    }
    const erros = validarReceita(receita, arq);
    if (erros.length) {
      falhou = true;
      console.error(`✗ ${arq}`);
      erros.forEach(e => console.error(`   - ${e}`));
    } else {
      console.log(`✓ ${arq}`);
      indice.push({ id: receita.id, titulo: receita.titulo, categoria: receita.categoria });
    }
  }

  if (falhou) process.exit(1);
  writeFileSync(join(pasta, 'indice.json'), JSON.stringify(indice, null, 2) + '\n');
  console.log(`indice.json atualizado (${indice.length} receitas)`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
