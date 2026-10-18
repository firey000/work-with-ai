
function renderCategories() {
  document.getElementById('cats').innerHTML = CATEGORIES.map(c => {
    const count = PRODUCTS.filter(p => p.cat === c.id).length;
    return `
      <a href="catalog.html?cat=${c.id}" class="cat">
        <div><b>${c.name}</b><span>${count} товар${count === 1 ? '' : count < 5 ? 'а' : 'ов'}</span></div>
        <img src="img/${c.img}.svg" alt="">
      </a>`;
  }).join('');
}

function renderHits(cat) {
  let list = cat === 'all' ? PRODUCTS : PRODUCTS.filter(p => p.cat === cat);
  list = [...list].sort((a, b) => (b.badge === 'Хит') - (a.badge === 'Хит') || b.reviews - a.reviews).slice(0, 8);
  document.getElementById('hits').innerHTML = list.map(productCard).join('');
}

document.querySelectorAll('#hitTabs .chip').forEach(chip => {
  chip.addEventListener('click', () => {
    document.querySelectorAll('#hitTabs .chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    renderHits(chip.dataset.cat);
  });
});

document.getElementById('subscribeForm').addEventListener('submit', e => {
  e.preventDefault();
  const input = document.getElementById('email');
  const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim());
  input.classList.toggle('error', !ok);
  if (ok) {
    input.value = '';
    showToast('Готово! Промокод отправлен на почту');
  } else {
    showToast('Введите правильный e-mail');
  }
});

renderCategories();
renderHits('all');
