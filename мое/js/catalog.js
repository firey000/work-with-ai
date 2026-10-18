
const params = new URLSearchParams(location.search);
const state = {
  cat: params.get('cat') || 'all',
  q: (params.get('q') || '').trim(),
  fav: params.get('fav') === '1',
  brands: [],
  min: 0,
  max: Infinity,
  rating: 0,
  stock: false,
  sort: 'popular'
};

function renderCategoryFilter() {
  const items = [{ id: 'all', name: 'Все товары' }, ...CATEGORIES];
  document.getElementById('fCats').innerHTML = items.map(c => `
    <label><input type="radio" name="cat" value="${c.id}" ${state.cat === c.id ? 'checked' : ''}> ${c.name}</label>
  `).join('');
  document.querySelectorAll('input[name="cat"]').forEach(r => r.addEventListener('change', () => {
    state.cat = r.value;
    state.brands = [];
    renderBrandFilter();
    render();
  }));
}

function renderBrandFilter() {
  const inCat = PRODUCTS.filter(p => state.cat === 'all' || p.cat === state.cat);
  const brands = [...new Set(inCat.map(p => p.brand))].sort();
  document.getElementById('fBrands').innerHTML = brands.map(b => `
    <label><input type="checkbox" value="${b}" ${state.brands.includes(b) ? 'checked' : ''}> ${b}
      <small>${inCat.filter(p => p.brand === b).length}</small></label>
  `).join('');
  document.querySelectorAll('#fBrands input').forEach(cb => cb.addEventListener('change', () => {
    state.brands = [...document.querySelectorAll('#fBrands input:checked')].map(i => i.value);
    render();
  }));
}

function getFiltered() {
  const favs = load('bait-favs');
  const q = state.q.toLowerCase();
  let list = PRODUCTS.filter(p =>
    (state.cat === 'all' || p.cat === state.cat) &&
    (!state.fav || favs.includes(p.id)) &&
    (!q || (p.name + ' ' + p.brand).toLowerCase().includes(q)) &&
    (state.brands.length === 0 || state.brands.includes(p.brand)) &&
    p.price >= state.min && p.price <= state.max &&
    p.rating >= state.rating &&
    (!state.stock || p.stock > 0)
  );
  const sorts = {
    popular: (a, b) => b.reviews - a.reviews,
    cheap: (a, b) => a.price - b.price,
    expensive: (a, b) => b.price - a.price,
    rating: (a, b) => b.rating - a.rating
  };
  return list.sort(sorts[state.sort]);
}

function render() {
  const list = getFiltered();
  const cat = CATEGORIES.find(c => c.id === state.cat);
  const title = state.fav ? 'Избранное' : cat ? cat.name : 'Все товары';
  document.getElementById('catTitle').textContent = title;
  document.getElementById('crumbCat').textContent = title;
  document.title = title + ' — БАЙТ';
  document.getElementById('count').textContent = list.length + ' шт.';
  document.getElementById('queryInfo').textContent = state.q ? `Поиск: «${state.q}»` : '';
  document.querySelectorAll('.nav a').forEach(a => a.classList.toggle('active', a.href.endsWith('cat=' + state.cat)));

  const grid = document.getElementById('products');
  if (list.length === 0) {
    grid.innerHTML = `
      <div class="empty" style="grid-column: 1 / -1">
        <h3>Ничего не найдено</h3>
        <p>Попробуйте изменить фильтры или поисковый запрос</p>
        <button class="btn" onclick="resetFilters()">Сбросить фильтры</button>
      </div>`;
  } else {
    grid.innerHTML = list.map(productCard).join('');
  }
}

function resetFilters() {
  Object.assign(state, { cat: 'all', q: '', fav: false, brands: [], min: 0, max: Infinity, rating: 0, stock: false });
  document.getElementById('fMin').value = '';
  document.getElementById('fMax').value = '';
  document.getElementById('fStock').checked = false;
  document.querySelector('input[name="rating"][value="0"]').checked = true;
  document.querySelector('.search input').value = '';
  history.replaceState(null, '', 'catalog.html');
  renderCategoryFilter();
  renderBrandFilter();
  render();
}

document.getElementById('fMin').addEventListener('input', e => { state.min = Number(e.target.value) || 0; render(); });
document.getElementById('fMax').addEventListener('input', e => { state.max = Number(e.target.value) || Infinity; render(); });
document.getElementById('fStock').addEventListener('change', e => { state.stock = e.target.checked; render(); });
document.querySelectorAll('input[name="rating"]').forEach(r => r.addEventListener('change', () => { state.rating = Number(r.value); render(); }));
document.getElementById('sort').addEventListener('change', e => { state.sort = e.target.value; render(); });
document.getElementById('resetBtn').addEventListener('click', resetFilters);
document.getElementById('filtersToggle').addEventListener('click', () => document.getElementById('filters').classList.toggle('open'));

document.querySelector('.search input').value = state.q;
renderCategoryFilter();
renderBrandFilter();
render();
