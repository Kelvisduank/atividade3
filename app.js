const UNIDADE_TEXTO = {
  g: 'g', kg: 'kg', ml: 'ml', l: 'l',
  xicara: 'xícara(s)', 'colher-sopa': 'colher(es) de sopa', 'colher-cha': 'colher(es) de chá',
  unidade: '', 'a-gosto': 'a gosto',
};

const lista = document.getElementById('lista');
const detalhe = document.getElementById('receita');
let indice = [];

function textoIngrediente({ nome, quantidade, unidade }) {
  if (unidade === 'a-gosto') return `${nome} a gosto`;
  if (quantidade === null) return `${nome} (quantidade não informada)`;  return `${quantidade} ${UNIDADE_TEXTO[unidade]} ${nome}`.replace(/\s+/g, ' ');
}

function el(tag, texto) {
  const e = document.createElement(tag);
  if (texto !== undefined) e.textContent = texto;
  return e;
}

function mostrarLista(categoria) {
  lista.replaceChildren(...indice
    .filter(r => !categoria || r.categoria === categoria)
    .map(r => {
      const li = el('li');
      const a = el('a', r.titulo);
      a.href = `#${r.id}`;
      li.append(a);
      return li;
    }));
}

async function mostrarReceita(id) {
  if (!id) { detalhe.hidden = true; return; }
  const r = await (await fetch(`receitas/${id}.json`)).json();
  const meta = [r.rendimento && `${r.rendimento} porções`, r.tempoMinutos && `${r.tempoMinutos} min`]
    .filter(Boolean).join(' · ');
  const ingredientes = el('ul');
  ingredientes.append(...r.ingredientes.map(i => el('li', textoIngrediente(i))));
  const passos = el('ol');
  passos.append(...r.passos.map(p => el('li', p)));
  detalhe.replaceChildren(el('h2', r.titulo), el('p', meta), el('h3', 'Ingredientes'), ingredientes, el('h3', 'Modo de preparo'), passos);
  if (r.pendencias.length) {
    const aviso = el('p', `Falta confirmar: ${r.pendencias.join('; ')}`);
    aviso.className = 'pendencia';
    detalhe.append(aviso);
  }
  detalhe.hidden = false;
}

document.getElementById('filtros').addEventListener('click', e => {
  const botao = e.target.closest('button');
  if (!botao) return;
  document.querySelectorAll('#filtros button').forEach(b => b.setAttribute('aria-pressed', String(b === botao)));
  mostrarLista(botao.dataset.cat);
});

window.addEventListener('hashchange', () => mostrarReceita(location.hash.slice(1)));

indice = await (await fetch('receitas/indice.json')).json();
mostrarLista('');
mostrarReceita(location.hash.slice(1));
