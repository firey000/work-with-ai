
const id = Number(new URLSearchParams(location.search).get('id')) || 1;
const product = getProduct(id) || PRODUCTS[0];
const category = CATEGORIES.find(c => c.id === product.cat);
let qty = 1;

function specRows(specs) {
  return Object.entries(specs).map(([k, v]) => `<div class="spec-row"><span>${k}</span><span>${v}</span></div>`).join('');
}

function openTab(name, scroll) {
  document.querySelectorAll('.tabs__nav button').forEach(b => b.classList.toggle('active', b.dataset.tab === name));
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.id === 'tab-' + name));
  if (scroll) document.getElementById('tabs').scrollIntoView({ behavior: 'smooth' });
}

function renderProduct() {
  document.title = product.name + ' — БАЙТ';
  document.getElementById('crumbs').innerHTML = `
    <a href="index.html">Главная</a>
    <i>/</i><a href="catalog.html">Каталог</a>
    <i>/</i><a href="catalog.html?cat=${category.id}">${category.name}</a>
    <i>/</i><span>${product.brand}</span>`;

  
  const images = product.gallery || [product.img];
  document.getElementById('mainImg').src = `img/${images[0]}.svg`;
  document.getElementById('mainImg').alt = product.name;
  const thumbs = document.getElementById('thumbs');
  thumbs.innerHTML = images.map((img, i) => `<button class="${i === 0 ? 'active' : ''}" data-img="${img}"><img src="img/${img}.svg" alt=""></button>`).join('');
  thumbs.querySelectorAll('button').forEach(btn => btn.addEventListener('click', () => {
    thumbs.querySelectorAll('button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('mainImg').src = `img/${btn.dataset.img}.svg`;
  }));

  document.getElementById('pName').textContent = product.name;
  document.getElementById('pMeta').innerHTML = `
    ${stars(product.rating)}
    <a href="#tabs" onclick="openTab('reviews')">${product.reviews} отзывов</a>
    <span>Код товара: ${String(100000 + product.id * 731)}</span>`;
  document.getElementById('pShortSpecs').innerHTML = specRows(Object.fromEntries(Object.entries(product.specs).slice(0, 6)));

  const discount = product.old ? Math.round((1 - product.price / product.old) * 100) : 0;
  document.getElementById('pPrice').innerHTML = `
    <span class="price">${formatPrice(product.price)}</span>
    ${product.old ? `<s>${formatPrice(product.old)}</s><span class="badge badge--sale">−${discount}%</span>` : ''}`;
  document.getElementById('pCredit').innerHTML = `Рассрочка 0% — от <b>${formatPrice(Math.ceil(product.price / 12))}/мес</b> на 12 месяцев`;
  document.getElementById('pStock').innerHTML = `
    <div>${product.stock > 0 ? `<b class="in-stock">В наличии: ${product.stock} шт.</b>` : '<b class="no-stock">Нет в наличии</b>'}<span>Самовывоз сегодня из 5 магазинов</span></div>
    <div><b>Доставка завтра</b><span>Бесплатно от 5 000 ₽</span></div>
    <div><b>Гарантия 36 месяцев</b><span>Обмен и возврат 14 дней</span></div>`;

  const buyBtn = document.getElementById('buyBtn');
  if (product.stock === 0) {
    buyBtn.disabled = true;
    buyBtn.textContent = 'Нет в наличии';
  }
  buyBtn.addEventListener('click', () => addToCart(product.id, qty));
  document.getElementById('minus').addEventListener('click', () => setQty(qty - 1));
  document.getElementById('plus').addEventListener('click', () => setQty(qty + 1));

  const favBtn = document.getElementById('favBtn');
  const updateFav = () => { favBtn.textContent = load('bait-favs').includes(product.id) ? '♥ В избранном' : '♡ В избранное'; };
  favBtn.addEventListener('click', () => { toggleFav(product.id); updateFav(); });
  updateFav();

  document.getElementById('tab-desc').innerHTML = `<p>${product.desc}</p><p>Товар официально поставляется в Россию и имеет гарантию производителя. Если сомневаетесь в совместимости — наши консультанты помогут подобрать комплектующие.</p>`;
  document.getElementById('tab-specs').innerHTML = specRows(product.specs);
  document.getElementById('reviewsBtn').textContent = `Отзывы (${product.reviews})`;
  document.getElementById('tab-reviews').innerHTML = REVIEWS.map(r => `
    <div class="review">
      <div class="review__head"><b>${r.name}</b>${stars(r.rating)}<span>${r.date}</span></div>
      <p>${r.text}</p>
    </div>`).join('');
  document.querySelectorAll('.tabs__nav button').forEach(b => b.addEventListener('click', () => openTab(b.dataset.tab)));

  let similar = PRODUCTS.filter(p => p.cat === product.cat && p.id !== product.id);
  if (similar.length < 4) similar = similar.concat(PRODUCTS.filter(p => p.cat !== product.cat).slice(0, 4 - similar.length));
  document.getElementById('similar').innerHTML = similar.slice(0, 4).map(productCard).join('');
}

function setQty(value) {
  qty = Math.max(1, Math.min(value, product.stock || 1));
  document.getElementById('qty').textContent = qty;
}

renderProduct();
