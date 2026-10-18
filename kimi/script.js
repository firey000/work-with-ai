
// ПКХаб — логика сайта
let cart = 0;

function addToCart(){
  cart++;
  const el = document.getElementById('cartCount');
  if(el){ el.textContent = cart; }
  alert('Товар добавлен в корзину! Всего: ' + cart);
}

function setImg(el, sym){
  document.getElementById('mainImg').textContent = sym;
  document.querySelectorAll('.gallery__thumbs div').forEach(d => d.classList.remove('active'));
  el.classList.add('active');
}

function showTab(i, btn){
  document.querySelectorAll('.tab-pane').forEach((p, idx) => p.classList.toggle('active', idx === i));
  document.querySelectorAll('.tabs__nav button').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

function applyFilters(){
  const n = document.getElementById('count');
  const val = 3 + Math.floor(Math.random() * 4); // демо-фильтрация
  if(n) n.textContent = val;
  alert('Фильтры применены (демо-режим). Найдено: ' + val);
}

function sortCards(mode){
  const grid = document.getElementById('cards');
  if(!grid) return;
  const cards = [...grid.children];
  const num = c => parseInt(c.querySelector('.price').textContent.replace(/[^0-9]/g, ''));
  const rate = c => parseFloat(c.querySelector('.rate').textContent.replace(',', '.'));
  if(mode === 'cheap') cards.sort((a,b) => num(a) - num(b));
  if(mode === 'exp')  cards.sort((a,b) => num(b) - num(a));
  if(mode === 'rate') cards.sort((a,b) => rate(b) - rate(a));
  cards.forEach(c => grid.appendChild(c));
}
