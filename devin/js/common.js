const ICONS = {
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
  cart: '<circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2 3h3l2.7 12.4a2 2 0 0 0 2 1.6h7.6a2 2 0 0 0 2-1.5L21 8H6"/>',
  heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z"/>',
  compare: '<path d="M18 20V10M12 20V4M6 20v-6"/>',
  menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
  grid: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
  pin: '<path d="M12 22s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/>',
  close: '<path d="M18 6 6 18M6 6l12 12"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
  truck: '<path d="M1 3h15v13H1zM16 8h4l3 3v5h-7"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>',
  card: '<rect x="1" y="4" width="22" height="16" rx="2"/><path d="M1 10h22"/>',
  tool: '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4z"/>',
  store: '<path d="M3 9l1-5h16l1 5M4 9v11h16V9M9 20v-6h6v6"/>',
  chevL: '<path d="m15 18-6-6 6-6"/>', chevR: '<path d="m9 18 6-6-6-6"/>', filter: '<path d="M22 3H2l8 9.5V19l4 2v-8.5z"/>',
  bolt: '<path d="M13 2 3 14h9l-1 8 10-12h-9z"/>'
};
const icon = (n, cls = 'icon') => `<svg class="${cls}" viewBox="0 0 24 24">${ICONS[n]}</svg>`;
const fmt = n => n.toLocaleString('ru-RU') + ' ₽';
const stars = r => '★★★★★'.slice(0, Math.round(r)) + '☆☆☆☆☆'.slice(0, 5 - Math.round(r));
const catName = id => (CATEGORIES.find(c => c.id === id) || {}).name || '';
const byId = id => PRODUCTS.find(p => p.id === +id);
const plural = (n, f) => f[(n % 10 === 1 && n % 100 !== 11) ? 0 : (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)) ? 1 : 2];

// ---- Хранилище ----
const store = {
  get(k) { try { return JSON.parse(localStorage.getItem(k)) || (k === 'cart' ? {} : []); } catch { return k === 'cart' ? {} : []; } },
  set(k, v) { localStorage.setItem(k, JSON.stringify(v)); updateBadges(); }
};
function addToCart(id, qty = 1) {
  const c = store.get('cart'); c[id] = (c[id] || 0) + qty; store.set('cart', c);
  toast('Товар добавлен в корзину'); renderCart();
}
function setQty(id, q) { const c = store.get('cart'); if (q <= 0) delete c[id]; else c[id] = q; store.set('cart', c); renderCart(); syncBuyButtons(); }
function toggleFav(id) {
  let f = store.get('fav'); const on = f.includes(id);
  f = on ? f.filter(x => x !== id) : [...f, id]; store.set('fav', f);
  toast(on ? 'Удалено из избранного' : 'Добавлено в избранное'); return !on;
}
function updateBadges() {
  const c = store.get('cart'); const n = Object.values(c).reduce((a, b) => a + b, 0);
  document.querySelectorAll('[data-badge=cart]').forEach(b => { b.textContent = n || ''; });
  const f = store.get('fav').length;
  document.querySelectorAll('[data-badge=fav]').forEach(b => { b.textContent = f || ''; });
}
let toastTimer;
function toast(msg) {
  let t = document.querySelector('.toast');
  if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.append(t); }
  t.textContent = msg; t.classList.add('show'); clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2000);
}

// ---- Карточка товара ----
function productCard(p) {
  const fav = store.get('fav').includes(p.id); const inCart = store.get('cart')[p.id];
  const disc = p.old ? Math.round((1 - p.price / p.old) * 100) : 0;
  return `<article class="card" data-id="${p.id}">
    <div class="labels">${p.hit ? '<span class="label hit">ХИТ</span>' : ''}${disc ? `<span class="label">-${disc}%</span>` : ''}</div>
    <button class="fav ${fav ? 'on' : ''}" data-fav="${p.id}" aria-label="В избранное">${icon('heart')}</button>
    <a class="card-img" href="product.html?id=${p.id}">${imgTag(p.cat, p.color, 0, p.name)}</a>
    <div class="card-info">
      <div class="rating"><span class="stars">${stars(p.rating)}</span>${p.rating} · ${p.reviews} ${plural(p.reviews, ['отзыв', 'отзыва', 'отзывов'])}</div>
      <a class="card-title" href="product.html?id=${p.id}">${p.name}</a>
      <div class="card-specs">${p.short.map(s => `<span>${s}</span>`).join('')}</div>
      <div class="stock ${p.stock < 10 ? 'low' : ''}">${p.stock < 10 ? 'Осталось мало: ' + p.stock + ' шт.' : 'В наличии'}</div>
    </div>
    <div class="card-bottom">
      <div class="price">${p.old ? `<span class="old">${fmt(p.old)}</span>` : ''}${fmt(p.price)}</div>
      <button class="buy ${inCart ? 'in' : ''}" data-buy="${p.id}" aria-label="В корзину">${icon('cart')}</button>
    </div></article>`;
}
function syncBuyButtons() {
  const c = store.get('cart');
  document.querySelectorAll('[data-buy]').forEach(b => b.classList.toggle('in', !!c[b.dataset.buy]));
}

// ---- Шапка / подвал / корзина ----
function renderLayout(activeCat) {
  const header = `
  <div class="topbar"><div class="container">
    <a class="city" href="#">${icon('pin', 'icon')} Москва</a>
    <nav><a href="#">Магазины</a><a href="#">Доставка и оплата</a><a href="#">Гарантия</a><a href="#">Сервисный центр</a><a href="#">Для бизнеса</a></nav>
    <a href="tel:88005553535" style="color:#fff;font-weight:600">8 800 555-35-35</a>
  </div></div>
  <header class="header"><div class="container" style="position:relative">
    <button class="burger" data-mega aria-label="Меню">${icon('menu')}</button>
    <a href="index.html" class="logo"><span class="logo-mark">${icon('bolt')}</span><span>ВОЛЬТ<small>комплектующие и периферия</small></span></a>
    <button class="btn btn-accent catalog-btn" data-mega>${icon('menu')} Каталог</button>
    <form class="search" action="catalog.html"><input name="q" placeholder="Поиск: RTX 4070, Ryzen 7, SSD 1 ТБ..." autocomplete="off"><button aria-label="Найти">${icon('search')}</button></form>
    <div class="h-actions">
      <a href="#" class="h-action">${icon('compare')}<span>Сравнение</span></a>
      <a href="catalog.html?fav=1" class="h-action">${icon('heart')}<span>Избранное</span><b class="badge" data-badge="fav"></b></a>
      <button class="h-action" data-cart>${icon('cart')}<span>Корзина</span><b class="badge" data-badge="cart"></b></button>
    </div>
    <div class="mega"><div class="container"><div class="mega-grid">
      ${CATEGORIES.map(c => `<a href="catalog.html?cat=${c.id}">${imgTag(c.id, c.id === 'cpu' ? '#e8492f' : '#2b2f36')}${c.name}</a>`).join('')}
    </div></div></div>
  </div></header>
  <nav class="catnav"><div class="container">
    ${CATEGORIES.map(c => `<a href="catalog.html?cat=${c.id}" class="${c.id === activeCat ? 'active' : ''}">${c.name}</a>`).join('')}
  </div></nav>`;
  const footer = `
  <footer class="footer"><div class="container">
    <div class="f-grid">
      <div><a href="index.html" class="logo"><span class="logo-mark">${icon('bolt')}</span><span>ВОЛЬТ</span></a>
        <div class="f-phone">8 800 555-35-35</div><div>Ежедневно с 8:00 до 22:00</div>
        <div class="socials"><a href="#">VK</a><a href="#">TG</a><a href="#">YT</a><a href="#">OK</a></div></div>
      <div><h4>Покупателям</h4><ul><li><a href="#">Как оформить заказ</a></li><li><a href="#">Доставка</a></li><li><a href="#">Оплата и рассрочка</a></li><li><a href="#">Возврат товара</a></li></ul></div>
      <div><h4>Компания</h4><ul><li><a href="#">О нас</a></li><li><a href="#">Магазины</a></li><li><a href="#">Вакансии</a></li><li><a href="#">Контакты</a></li></ul></div>
      <div><h4>Сервис</h4><ul><li><a href="#">Сборка ПК</a></li><li><a href="#">Гарантия</a></li><li><a href="#">Сервисный центр</a></li><li><a href="#">Trade-in</a></li></ul></div>
    </div>
    <div class="f-bottom"><span>© 2026 ВОЛЬТ. Учебный проект, не является публичной офертой.</span><div class="pay"><span>МИР</span><span>VISA</span><span>MC</span><span>СБП</span></div></div>
  </div></footer>
  <div class="overlay"></div>
  <aside class="drawer" aria-label="Корзина"><div class="drawer-head"><h3>Корзина</h3><button data-close>${icon('close')}</button></div>
    <div class="drawer-body"></div><div class="drawer-foot"></div></aside>`;
  document.body.insertAdjacentHTML('afterbegin', header);
  document.body.insertAdjacentHTML('beforeend', footer);
  const q = new URLSearchParams(location.search).get('q'); if (q) document.querySelector('.search input').value = q;
  bindGlobal(); updateBadges(); renderCart();
}
function renderCart() {
  const body = document.querySelector('.drawer-body'); if (!body) return;
  const c = store.get('cart'); const ids = Object.keys(c);
  if (!ids.length) {
    body.innerHTML = `<div class="empty">${icon('cart')}<p style="margin-top:10px">Корзина пуста</p><a href="catalog.html" class="btn btn-outline" style="margin-top:16px">Перейти в каталог</a></div>`;
    document.querySelector('.drawer-foot').innerHTML = ''; return;
  }
  let sum = 0;
  body.innerHTML = ids.map(id => { const p = byId(id); if (!p) return ''; sum += p.price * c[id];
    return `<div class="cart-item">${imgTag(p.cat, p.color)}<div><div class="t">${p.name}</div>
      <div class="qty"><button data-q="${id}" data-d="-1">−</button><span>${c[id]}</span><button data-q="${id}" data-d="1">+</button></div>
      <div><button class="rm" data-rm="${id}">Удалить</button></div></div><b>${fmt(p.price * c[id])}</b></div>`; }).join('');
  const n = Object.values(c).reduce((a, b) => a + b, 0);
  document.querySelector('.drawer-foot').innerHTML = `<div class="total"><span>Итого (${n} шт.)</span><span>${fmt(sum)}</span></div>
    <button class="btn btn-accent btn-lg" style="width:100%" data-checkout>Оформить заказ</button>`;
}
function openCart(open = true) {
  document.querySelector('.drawer').classList.toggle('open', open);
  document.querySelector('.overlay').classList.toggle('open', open);
}
function bindGlobal() {
  document.addEventListener('click', e => {
    const t = e.target.closest('button,a'); if (!t) {
      if (!e.target.closest('.mega')) document.querySelector('.mega').classList.remove('open');
      if (e.target.classList.contains('overlay')) { openCart(false); document.querySelector('.filters')?.classList.remove('open'); }
      return;
    }
    if (t.dataset.buy) { e.preventDefault(); addToCart(+t.dataset.buy); t.classList.add('in'); }
    else if (t.dataset.fav) { e.preventDefault(); t.classList.toggle('on', toggleFav(+t.dataset.fav)); }
    else if (t.hasAttribute('data-cart')) openCart();
    else if (t.hasAttribute('data-close')) openCart(false);
    else if (t.dataset.q) { const c = store.get('cart'); setQty(t.dataset.q, c[t.dataset.q] + +t.dataset.d); }
    else if (t.dataset.rm) setQty(t.dataset.rm, 0);
    else if (t.hasAttribute('data-checkout')) { store.set('cart', {}); renderCart(); syncBuyButtons(); openCart(false); toast('Спасибо! Заказ оформлен, менеджер свяжется с вами'); }
    else if (t.hasAttribute('data-mega')) { e.stopPropagation(); document.querySelector('.mega').classList.toggle('open'); }
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { openCart(false); document.querySelector('.mega').classList.remove('open'); } });
}
