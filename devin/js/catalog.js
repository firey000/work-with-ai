const params = new URLSearchParams(location.search);
const state = { cat: params.get('cat') || '', q: (params.get('q') || '').trim().toLowerCase(), fav: params.get('fav') === '1',
  min: 0, max: 0, brands: [], stock: false, rating: 0, sort: 'popular', view: localStorage.getItem('view') || 'grid', page: 1 };
const PER_PAGE = 9;
renderLayout(state.cat);

const baseList = () => PRODUCTS.filter(p => (!state.cat || p.cat === state.cat) &&
  (!state.q || (p.name + ' ' + p.brand + ' ' + p.short.join(' ')).toLowerCase().includes(state.q)) &&
  (!state.fav || store.get('fav').includes(p.id)));

// Заголовок и крошки
const title = state.fav ? 'Избранное' : state.q ? `Поиск: «${params.get('q')}»` : state.cat ? catName(state.cat) : 'Все товары';
document.title = title + ' — ВОЛЬТ';
document.querySelector('#crumb').textContent = title;
document.querySelector('.cat-title h1').textContent = title;

// Чипы категорий
document.querySelector('.chips').innerHTML = `<a href="catalog.html" class="pill ${!state.cat ? 'active' : ''}">Все</a>` +
  CATEGORIES.map(c => `<a href="catalog.html?cat=${c.id}" class="pill ${c.id === state.cat ? 'active' : ''}">${c.name}</a>`).join('');

// Фильтры
const prices = baseList().map(p => p.price);
const pMin = prices.length ? Math.min(...prices) : 0, pMax = prices.length ? Math.max(...prices) : 0;
const minI = document.querySelector('#pmin'), maxI = document.querySelector('#pmax'), range = document.querySelector('#prange');
minI.placeholder = 'от ' + pMin; maxI.placeholder = 'до ' + pMax; range.min = pMin; range.max = pMax; range.value = pMax;
range.oninput = () => { maxI.value = range.value; };
const brandCounts = {}; baseList().forEach(p => brandCounts[p.brand] = (brandCounts[p.brand] || 0) + 1);
document.querySelector('#brands').innerHTML = Object.keys(brandCounts).sort().map(b =>
  `<label class="check"><input type="checkbox" value="${b}">${b}<small>${brandCounts[b]}</small></label>`).join('');

function readFilters() {
  state.min = +minI.value || 0; state.max = +maxI.value || 0;
  state.brands = [...document.querySelectorAll('#brands input:checked')].map(i => i.value);
  state.stock = document.querySelector('#instock').checked;
  state.rating = +(document.querySelector('input[name=rating]:checked') || {}).value || 0;
  state.page = 1; render();
}
document.querySelector('.filters').addEventListener('change', readFilters);
document.querySelector('#apply').onclick = () => { readFilters(); document.querySelector('.filters').classList.remove('open'); document.querySelector('.overlay').classList.remove('open'); };
document.querySelector('#reset').onclick = () => {
  document.querySelectorAll('.filters input').forEach(i => { if (i.type === 'checkbox' || i.type === 'radio') i.checked = false; else if (i.type !== 'range') i.value = ''; });
  range.value = pMax; readFilters();
};
document.querySelector('.filter-toggle').onclick = () => { document.querySelector('.filters').classList.add('open'); document.querySelector('.overlay').classList.add('open'); };
document.querySelector('#sort').onchange = e => { state.sort = e.target.value; render(); };
document.querySelectorAll('.view-btns button').forEach(b => b.onclick = () => { state.view = b.dataset.view; localStorage.setItem('view', state.view); render(); });

function render() {
  let list = baseList().filter(p => (!state.min || p.price >= state.min) && (!state.max || p.price <= state.max) &&
    (!state.brands.length || state.brands.includes(p.brand)) && (!state.stock || p.stock >= 10) && p.rating >= state.rating);
  const sorters = { popular: (a, b) => b.reviews - a.reviews, cheap: (a, b) => a.price - b.price, expensive: (a, b) => b.price - a.price,
    rating: (a, b) => b.rating - a.rating, discount: (a, b) => (b.old ? b.old - b.price : 0) - (a.old ? a.old - a.price : 0) };
  list.sort(sorters[state.sort]);
  document.querySelector('.cat-title span').textContent = `${list.length} ${plural(list.length, ['товар', 'товара', 'товаров'])}`;
  const grid = document.querySelector('#products');
  grid.classList.toggle('list', state.view === 'list');
  document.querySelectorAll('.view-btns button').forEach(b => b.classList.toggle('active', b.dataset.view === state.view));
  const pages = Math.ceil(list.length / PER_PAGE);
  const shown = list.slice(0, state.page * PER_PAGE);
  grid.innerHTML = shown.length ? shown.map(productCard).join('') : '';
  document.querySelector('.no-results').hidden = !!shown.length;
  const more = document.querySelector('.more');
  more.hidden = pages <= 1;
  more.innerHTML = (state.page < pages ? `<button class="btn btn-outline" id="more-btn">Показать ещё</button>` : '') +
    `<div class="pages">${Array.from({ length: pages }, (_, i) => `<button class="${i + 1 === state.page ? 'active' : ''}" data-page="${i + 1}">${i + 1}</button>`).join('')}</div>`;
}
document.querySelector('.more').addEventListener('click', e => {
  if (e.target.id === 'more-btn') { state.page++; render(); }
  if (e.target.dataset.page) { state.page = +e.target.dataset.page; render(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
});
render();
