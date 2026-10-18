renderLayout();

// Слайдер
const slides = [...document.querySelectorAll('.slide')];
const dots = document.querySelector('.dots');
let cur = 0, timer;
dots.innerHTML = slides.map((_, i) => `<button aria-label="Слайд ${i + 1}"></button>`).join('');
function go(i) {
  cur = (i + slides.length) % slides.length;
  slides.forEach((s, k) => s.classList.toggle('active', k === cur));
  [...dots.children].forEach((d, k) => d.classList.toggle('active', k === cur));
  clearInterval(timer); timer = setInterval(() => go(cur + 1), 5000);
}
dots.addEventListener('click', e => { const i = [...dots.children].indexOf(e.target); if (i >= 0) go(i); });
document.querySelector('.s-prev').onclick = () => go(cur - 1);
document.querySelector('.s-next').onclick = () => go(cur + 1);
document.querySelectorAll('[data-slide-img]').forEach(el => { const [c, col] = el.dataset.slideImg.split('|'); el.innerHTML = imgTag(c, col, 0, '', true); });
go(0);

// Категории
document.querySelector('.cats').innerHTML = CATEGORIES.slice(0, 8).map(c => {
  const n = PRODUCTS.filter(p => p.cat === c.id).length * 137 + 40;
  return `<a class="cat-card" href="catalog.html?cat=${c.id}"><div><b>${c.name}</b><span>${n} ${plural(n, ['товар', 'товара', 'товаров'])}</span></div>${imgTag(c.id, c.id === 'cpu' ? '#e8492f' : '#2b2f36')}</a>`;
}).join('');

// Хиты продаж
const hitTabs = document.querySelector('#hit-tabs');
const tabCats = [['all', 'Все'], ['gpu', 'Видеокарты'], ['cpu', 'Процессоры'], ['ram', 'Память'], ['monitor', 'Мониторы'], ['mouse', 'Периферия']];
hitTabs.innerHTML = tabCats.map(([id, n], i) => `<button class="pill ${i ? '' : 'active'}" data-tab="${id}">${n}</button>`).join('');
function renderHits(cat) {
  let list = PRODUCTS.filter(p => cat === 'all' ? p.hit : cat === 'mouse' ? ['mouse', 'keyboard', 'headset'].includes(p.cat) : p.cat === cat);
  list = list.sort((a, b) => b.reviews - a.reviews).slice(0, 8);
  document.querySelector('#hits').innerHTML = list.map(productCard).join('');
}
hitTabs.addEventListener('click', e => {
  const b = e.target.closest('[data-tab]'); if (!b) return;
  hitTabs.querySelectorAll('.pill').forEach(x => x.classList.toggle('active', x === b)); renderHits(b.dataset.tab);
});
renderHits('all');

// Сборка, бренды, статьи
document.querySelectorAll('[data-img]').forEach(el => { const [c, col] = el.dataset.img.split('|'); el.innerHTML = imgTag(c, col || '#2b2f36'); });
document.querySelector('.brands').innerHTML = BRANDS.map(b => `<a href="catalog.html?q=${b}" class="brand">${b}</a>`).join('');
const covers = [['gpu', '#7a8a99'], ['case', '#16181c'], ['cpu', '#e8492f']];
document.querySelector('.articles').innerHTML = ARTICLES.map((a, i) => `<a href="#" class="article"><div class="cover">${imgTag(covers[i][0], covers[i][1], 1)}</div>
  <div class="body"><span class="tag">${a.tag}</span><h3>${a.title}</h3><div class="meta">${a.date} · ${a.read} чтения</div></div></a>`).join('');

document.querySelector('.subscribe form').addEventListener('submit', e => {
  e.preventDefault(); const i = e.target.querySelector('input');
  if (!/^\S+@\S+\.\S+$/.test(i.value)) { toast('Введите корректный e-mail'); return; }
  i.value = ''; toast('Вы подписаны! Промокод на 500 ₽ отправлен на почту');
});
