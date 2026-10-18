const p = byId(new URLSearchParams(location.search).get('id')) || byId(1);
renderLayout(p.cat);
document.title = p.name + ' — купить в ВОЛЬТ';
const disc = p.old ? Math.round((1 - p.price / p.old) * 100) : 0;
const entries = Object.entries(p.specs);

document.querySelector('.crumbs').innerHTML = `<a href="index.html">Главная</a><span><a href="catalog.html">Каталог</a></span><span><a href="catalog.html?cat=${p.cat}">${catName(p.cat)}</a></span><span>${p.brand}</span>`;

// Галерея
const views = [0, 1, 2, 3];
const main = document.querySelector('.main-img');
document.querySelector('.thumbs').innerHTML = views.map(v => `<button class="${v ? '' : 'active'}" data-v="${v}">${imgTag(p.cat, p.color, v)}</button>`).join('');
const show = v => { main.innerHTML = imgTag(p.cat, p.color, v, p.name); main.classList.remove('zoom'); };
show(0);
document.querySelector('.thumbs').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  document.querySelectorAll('.thumbs button').forEach(x => x.classList.toggle('active', x === b)); show(+b.dataset.v);
});
main.onclick = () => main.classList.toggle('zoom');
main.onmousemove = e => { const r = main.getBoundingClientRect(); main.querySelector('img').style.transformOrigin = `${(e.clientX - r.left) / r.width * 100}% ${(e.clientY - r.top) / r.height * 100}%`; };

// Инфо
document.querySelector('.p-info').innerHTML = `
  <h1>${p.name}</h1>
  <div class="p-meta"><span class="stars">${stars(p.rating)}</span><a href="#tabs" data-open="reviews">${p.rating} · ${p.reviews} ${plural(p.reviews, ['отзыв', 'отзыва', 'отзывов'])}</a><span>Код товара: ${String(p.id * 48731).padStart(7, '0')}</span></div>
  <div class="p-specs"><h3>Основные характеристики</h3><dl>${entries.slice(0, 7).map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl>
  <a href="#tabs" class="link" data-open="specs">Все характеристики →</a></div>
  ${p.cat === 'gpu' ? `<div class="variants"><h3>Модификация</h3><div class="pills"><button class="pill active">Стандарт</button><button class="pill">OC Edition</button><button class="pill">White</button></div></div>` : ''}`;
document.querySelectorAll('.variants .pill').forEach(b => b.onclick = () => document.querySelectorAll('.variants .pill').forEach(x => x.classList.toggle('active', x === b)));

// Блок покупки
document.querySelector('.buy-box').innerHTML = `
  <div class="bb-price"><span class="price">${fmt(p.price)}</span>${p.old ? `<span class="old">${fmt(p.old)}</span><span class="disc">-${disc}%</span>` : ''}</div>
  <div class="bb-credit">Рассрочка 0% от <b>${fmt(Math.ceil(p.price / 12))}/мес</b> на 12 месяцев</div>
  <div class="bb-row"><div class="qty big"><button data-step="-1">−</button><input id="qty" value="1" inputmode="numeric"><button data-step="1">+</button></div>
    <button class="btn btn-accent btn-lg" id="buy-main">${icon('cart')} В корзину</button></div>
  <div class="bb-sub"><button class="btn btn-outline ${store.get('fav').includes(p.id) ? 'on' : ''}" id="fav-main">${icon('heart')} В избранное</button><button class="btn btn-outline" id="cmp">${icon('compare')} Сравнить</button></div>
  <div class="bb-list">
    <div>${icon('store')}<span>В наличии в ${Math.min(p.stock, 12)} магазинах<small>Самовывоз сегодня, бесплатно</small></span></div>
    <div>${icon('truck')}<span>Доставка курьером завтра<small>Бесплатно от 5 000 ₽</small></span></div>
    <div>${icon('shield')}<span>Гарантия ${p.specs['Гарантия'] || '12 мес.'}<small>Обмен и возврат 14 дней</small></span></div>
  </div>`;
const qty = document.querySelector('#qty');
document.querySelectorAll('[data-step]').forEach(b => b.onclick = () => { qty.value = Math.max(1, Math.min(p.stock, (+qty.value || 1) + +b.dataset.step)); });
qty.onchange = () => { qty.value = Math.max(1, Math.min(p.stock, parseInt(qty.value) || 1)); };
document.querySelector('#buy-main').onclick = () => { addToCart(p.id, +qty.value); openCart(); };
const favBtn = document.querySelector('#fav-main');
const paintFav = on => { favBtn.style.color = on ? 'var(--red)' : ''; favBtn.lastChild.textContent = on ? ' В избранном' : ' В избранное'; };
paintFav(store.get('fav').includes(p.id));
favBtn.onclick = () => paintFav(toggleFav(p.id));
document.querySelector('#cmp').onclick = () => toast('Товар добавлен к сравнению');

// Табы
document.querySelector('#t-desc').innerHTML = `<p>${p.desc}</p><p>Товар официально поставляется в Россию и сопровождается гарантией производителя. Перед покупкой уточняйте совместимость с вашими комплектующими — наши консультанты помогут бесплатно.</p>
  ${p.cat === 'gpu' ? '<p><b>Ключевые технологии:</b> трассировка лучей в реальном времени, DLSS/FSR, поддержка AV1-кодирования, 8K HDR через HDMI 2.1.</p>' : ''}`;
document.querySelector('#t-specs').innerHTML = `<table class="spec-table">${entries.map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join('')}<tr><td>Бренд</td><td>${p.brand}</td></tr></table>`;
const reviews = [...REVIEWS];
function renderReviews() {
  const dist = [5, 4, 3, 2, 1].map(s => [s, s === 5 ? 72 : s === 4 ? 19 : s === 3 ? 6 : s === 2 ? 2 : 1]);
  document.querySelector('#t-reviews').innerHTML = `<div class="reviews">
    <div class="r-summary"><div class="big">${p.rating}</div><div class="stars">${stars(p.rating)}</div><div style="color:var(--muted);font-size:13px">${p.reviews + reviews.length - REVIEWS.length} отзывов</div>
      <div class="r-bars">${dist.map(([s, v]) => `<div><span>${s}★</span><i><b style="width:${v}%"></b></i><span>${v}%</span></div>`).join('')}</div></div>
    <div>${reviews.map(r => `<div class="review"><div class="review-head"><b>${r.name}</b><span style="color:var(--muted);font-size:13px">${r.date}</span></div>
      <span class="stars">${stars(r.rating)}</span><p>${r.text}</p><div class="pc"><b>Достоинства:</b> ${r.pros}</div><div class="pc"><b>Недостатки:</b> ${r.cons}</div></div>`).join('')}
      <form class="r-form"><b>Оставить отзыв</b><div class="star-pick">${'<span>★</span>'.repeat(5)}</div>
        <input name="name" placeholder="Ваше имя" required><textarea name="text" placeholder="Расскажите о товаре" required></textarea>
        <button class="btn btn-accent" style="justify-self:start">Отправить</button></form></div></div>`;
  let rate = 0; const pick = document.querySelectorAll('.star-pick span');
  pick.forEach((s, i) => s.onclick = () => { rate = i + 1; pick.forEach((x, k) => x.classList.toggle('on', k <= i)); });
  document.querySelector('.r-form').onsubmit = e => {
    e.preventDefault(); if (!rate) { toast('Поставьте оценку'); return; }
    const f = e.target; reviews.unshift({ name: f.name.value, rating: rate, date: 'только что', text: f.text.value, pros: '—', cons: '—' });
    renderReviews(); toast('Спасибо за отзыв!');
  };
}
renderReviews();
document.querySelector('.tab-btns [data-tab=reviews]').textContent = `Отзывы (${p.reviews})`;
function openTab(id) {
  document.querySelectorAll('.tab-btns button').forEach(b => b.classList.toggle('active', b.dataset.tab === id));
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.id === 't-' + id));
}
document.querySelector('.tab-btns').onclick = e => { if (e.target.dataset.tab) openTab(e.target.dataset.tab); };
document.querySelectorAll('[data-open]').forEach(a => a.addEventListener('click', () => openTab(a.dataset.open)));

// Рекомендации
const acc = { gpu: ['psu', 'monitor', 'case'], cpu: ['motherboard', 'ram', 'ssd'] }[p.cat] || ['mouse', 'keyboard', 'ssd'];
document.querySelector('#with').innerHTML = PRODUCTS.filter(x => acc.includes(x.cat)).slice(0, 8).map(productCard).join('');
document.querySelector('#similar').innerHTML = PRODUCTS.filter(x => x.cat === p.cat && x.id !== p.id).concat(PRODUCTS.filter(x => x.hit && x.cat !== p.cat)).slice(0, 8).map(productCard).join('');
