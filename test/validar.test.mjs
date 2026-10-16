import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validarReceita } from '../scripts/validar.mjs';

const valida = () => ({
  id: 'cafe-coado',
  titulo: 'Café coado',
  categoria: 'bebida',
  rendimento: 2,
  tempoMinutos: 10,
  ingredientes: [
    { nome: 'pó de café', quantidade: 2, unidade: 'colher-sopa' },
    { nome: 'açúcar', quantidade: null, unidade: 'a-gosto' },
  ],
  passos: ['Ferva a água.', 'Passe o café no coador.'],
  pendencias: [],
});

test('aceita uma receita válida', () => {
  assert.deepEqual(validarReceita(valida(), 'cafe-coado.json'), []);
});

test('aceita null em campos não informados', () => {
  const r = { ...valida(), rendimento: null, tempoMinutos: null, pendencias: ['rendimento não informado'] };
  assert.deepEqual(validarReceita(r), []);
});

test('rejeita nome de arquivo diferente do id', () => {
  assert.equal(validarReceita(valida(), 'cafe.json').length, 1);
});

test('rejeita unidade fora da lista', () => {
  const r = valida();
  r.ingredientes[0].unidade = 'colher';
  assert.match(validarReceita(r)[0], /unidade/);
});

test('aceita unidade null quando a quantidade também é null', () => {
  const r = valida();
  r.ingredientes[0] = { nome: 'pó de café', quantidade: null, unidade: null };
  assert.deepEqual(validarReceita(r), []);
});

test('rejeita unidade null com quantidade preenchida', () => {
  const r = valida();
  r.ingredientes[0].unidade = null;
  assert.match(validarReceita(r)[0], /unidade/);
});

test('rejeita quantidade preenchida com unidade a-gosto', () => {
  const r = valida();
  r.ingredientes[1].quantidade = 1;
  assert.match(validarReceita(r)[0], /a-gosto/);
});

test('rejeita categoria desconhecida', () => {
  assert.match(validarReceita({ ...valida(), categoria: 'sobremesa' })[0], /categoria/);
});

test('rejeita receita sem pendencias', () => {
  const r = valida();
  delete r.pendencias;
  assert.match(validarReceita(r)[0], /pendencias/);
});
