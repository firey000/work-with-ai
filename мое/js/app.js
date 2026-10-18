
const ICONS = {
  heart: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21s-7-4.5-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6c-2.5 4.5-9.5 9-9.5 9z"/></svg>',
  cart: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2 3h3l2.5 12h12L22 7H6"/></svg>',
  star: '<svg viewBox="0 0 24 24" width="14" height="14" fill="#F5A524"><path d="M12 2l3 6.5 7 .8-5.2 4.8 1.4 7L12 17.6 5.8 21l1.4-7L2 9.3l7-.8z"/></svg>'
};

function formatPrice(n) {
  return n.toLocaleString('ru-RU') + ' ₽';
}

function getProduct(id) {
  return PRODUCTS.find(p => p.id === Number(id));
}

function load(key) {
  try { return JSON.parse(localStorage.getItem(key)) || []; } catch (e) { return []; }
}
function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}


function getCart() { return load('bait-cart'); }

function addToCart(id, qty = 1) {
  const product = getProduct(id);
  if (!product || product.stock === 0) return;
  const cart = getCart();
  const item = cart.find(i => i.id === product.id);
  if (item) item.qty = Math.min(item.qty + qty, product.stock);
  else cart.push({ id: product.id, qty: Math.min(qty, product.stock) });
  save('bait-cart', cart);
  updateCounters();
  renderCart();
  showToast('Товар добавлен в корзину');
}

function changeQty(id, delta) {
  let cart = getCart();
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty < 1) cart = cart.filter(i => i.id !== id);
  if (item.qty > getProduct(id).stock) item.qty = getProduct(id).stock;
  save('bait-cart', cart);
  updateCounters();
  renderCart();
}

function renderCart() {
  const list = document.getElementById('cartList');
  if (!list) return;
  const cart = getCart();
  let total = 0;
  if (cart.length === 0) {
    list.innerHTML = '<p class="cart__empty">Корзина пока пустая</p>';
  } else {
    list.innerHTML = cart.map(item => {
      const p = getProduct(item.id);
      total += p.price * item.qty;
      return `
        <div class="cart-item">
          <img src="img/${p.img}.svg" alt="">
          <div class="cart-item__info">
            <a href="product.html?id=${p.id}">${p.name}</a>
            <b>${formatPrice(p.price * item.qty)}</b>
            <div class="qty qty--small">
              <button onclick="changeQty(${p.id}, -1)">−</button>
              <span>${item.qty}</span>
              <button onclick="changeQty(${p.id}, 1)">+</button>
            </div>
          </div>
        </div>`;
    }).join('');
  }
  document.getElementById('cartTotal').textContent = formatPrice(total);
}

function openCart() {
  renderCart();
  document.body.classList.add('cart-open');
}
function closeCart() {
  document.body.classList.remove('cart-open');
}

function toggleFav(id, btn) {
  let favs = load('bait-favs');
  if (favs.includes(id)) {
    favs = favs.filter(f => f !== id);
    showToast('Удалено из избранного');
  } else {
    favs.push(id);
    showToast('Добавлено в избранное');
  }
  save('bait-favs', favs);
  if (btn) btn.classList.toggle('active', favs.includes(id));
  updateCounters();
}

function updateCounters() {
  const cartCount = getCart().reduce((sum, i) => sum + i.qty, 0);
  const favCount = load('bait-favs').length;
  document.querySelectorAll('[data-count="cart"]').forEach(el => {
    el.textContent = cartCount;
    el.hidden = cartCount === 0;
  });
  document.querySelectorAll('[data-count="fav"]').forEach(el => {
    el.textContent = favCount;
    el.hidden = favCount === 0;
  });
}

function stars(rating) {
  return `<span class="rating">${ICONS.star}<b>${rating.toFixed(1)}</b></span>`;
}

function productCard(p) {
  const isFav = load('bait-favs').includes(p.id);
  const discount = p.old ? Math.round((1 - p.price / p.old) * 100) : 0;
  const shortSpecs = Object.values(p.specs).slice(0, 3).join(' · ');
  return `
    <article class="card">
      <div class="card__top">
        ${p.badge ? `<span class="badge">${p.badge}</span>` : ''}
        ${discount ? `<span class="badge badge--sale">−${discount}%</span>` : ''}
        <button class="card__fav ${isFav ? 'active' : ''}" onclick="toggleFav(${p.id}, this)" aria-label="В избранное">${ICONS.heart}</button>
      </div>
      <a href="product.html?id=${p.id}" class="card__img"><img src="img/${p.img}.svg" alt="${p.name}"></a>
      <div class="card__meta">${stars(p.rating)} <span>${p.reviews} отзывов</span></div>
      <a href="product.html?id=${p.id}" class="card__title">${p.name}</a>
      <p class="card__specs">${shortSpecs}</p>
      <div class="card__bottom">
        <div>
          ${p.old ? `<s>${formatPrice(p.old)}</s>` : ''}
          <div class="price">${formatPrice(p.price)}</div>
        </div>
        ${p.stock > 0
          ? `<button class="btn btn--icon" onclick="addToCart(${p.id})" aria-label="В корзину">${ICONS.cart}</button>`
          : '<span class="out">Нет в наличии</span>'}
      </div>
    </article>`;
}

let toastTimer;
function showToast(text) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = text;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2000);
}

document.addEventListener('DOMContentLoaded', () => {
  updateCounters();
  const checkout = document.getElementById('checkout');
  if (checkout) {
    checkout.addEventListener('click', () => {
      if (getCart().length === 0) return showToast('Сначала добавьте товары');
      save('bait-cart', []);
      updateCounters();
      renderCart();
      showToast('Заказ оформлен! (учебный проект)');
    });
  }
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeCart(); });
});
