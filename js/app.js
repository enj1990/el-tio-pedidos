/* global MENU, ESPECIALES, WHATSAPP, money, priceCart, buildMessage */
const $ = (sel, el = document) => el.querySelector(sel);
const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;

const store = {
  get(k, fallback, s = localStorage) { try { return JSON.parse(s.getItem(k)) ?? fallback; } catch { return fallback; } },
  set(k, v, s = localStorage) { try { s.setItem(k, JSON.stringify(v)); } catch { /* modo privado: sigue sin guardar */ } }
};

let cart = store.get('eltio-cart', []);

/* ---------- Carta ---------- */

const priceText = tiers => tiers.slice().reverse()
  .map(([q, p]) => (q === 1 ? money(p) : `<small>${q} x ${money(p)}</small>`)).join(' ');

const stepper = (key, name, extra = '') => `
  <div class="stepper" data-key="${key}" data-qty="0">
    <button type="button" class="stepper__btn stepper__btn--minus" data-step="-1" aria-label="Quitar ${esc(name)}">−</button>
    <output class="stepper__qty">0</output>
    <button type="button" class="stepper__btn stepper__btn--plus" data-step="1" aria-label="Agregar ${esc(name)}">+</button>
    ${extra}
  </div>`;

function itemActions(item) {
  if (item.choose) {
    const opts = ESPECIALES.map(e => `<option>${esc(e)}</option>`).join('');
    const selects = Array.from({ length: item.choose }, (_, i) =>
      `<select class="pick" aria-label="Especial ${i + 1}">${opts}</select>`).join('');
    return `<div class="picks">${selects}
      <button type="button" class="btn-add" data-promo="${item.id}">+ Agregar</button></div>`;
  }
  if (item.sizes) {
    return `<div class="sizes">${item.variants.map(v => `
      <div class="size"><span class="size__label">${v.label}<b>${money(v.tiers[0][1])}</b></span>
      ${stepper(`${item.id}|${v.id}|`, `${item.name} ${v.label}`)}</div>`).join('')}</div>`;
  }
  const six = item.pool ? `<button type="button" class="stepper__six" data-step="6" aria-label="Agregar media docena de ${esc(item.name)}">+6</button>` : '';
  return stepper(`${item.id}||`, item.name, six);
}

const card = item => `
  <li class="card${item.sizes || item.choose ? ' card--wide' : ''}">
    <div class="card__info">
      <h3 class="card__name">${esc(item.name)}</h3>
      ${item.desc ? `<p class="card__desc">${esc(item.desc)}</p>` : ''}
      ${item.sizes ? '' : `<p class="card__price">${priceText(item.tiers)}</p>`}
    </div>
    ${itemActions(item)}
  </li>`;

function render() {
  $('#tabs').innerHTML = MENU.map(c => `
    <button type="button" class="tab" data-tab="${c.id}" aria-controls="p-${c.id}">
      <span class="tab__pic"><img src="assets/img/${c.img}" alt="" width="64" height="64">${c.badge ? `<em>${c.badge}</em>` : ''}</span>
      <span class="tab__label">${esc(c.tab || c.name)}</span>
    </button>`).join('');

  $('#panels').innerHTML = MENU.map(c => `
    <section class="panel" id="p-${c.id}" data-id="${c.id}" aria-labelledby="t-${c.id}" hidden>
      <header class="panel__head">
        <img src="assets/img/${c.img}" alt="${esc(c.name)} de El Tío" width="600" height="300">
        <h2 class="panel__title" id="t-${c.id}">${esc(c.name)}</h2>
        <p class="panel__note">${esc(c.note)}</p>
      </header>
      ${c.tip ? `<p class="panel__tip">${esc(c.tip)}</p>` : ''}
      <ul class="cards">${c.items.map(card).join('')}</ul>
      <p class="panel__swipe">Deslizá para ver más →</p>
    </section>`).join('');
}

/* ---------- Pestañas + deslizar ---------- */

let current = 0;

function show(index, dir = 0) {
  current = (index + MENU.length) % MENU.length;
  const id = MENU[current].id;
  $$('.panel').forEach(p => {
    p.hidden = p.dataset.id !== id;
    p.classList.remove('from-left', 'from-right');
  });
  const panel = $(`#p-${id}`);
  if (dir) panel.classList.add(dir > 0 ? 'from-right' : 'from-left');
  $$('.tab').forEach(t => t.setAttribute('aria-current', t.dataset.tab === id));
  $(`[data-tab="${id}"]`).scrollIntoView({ inline: 'center', block: 'nearest', behavior: calm ? 'auto' : 'smooth' });
  const top = $('#tabs').offsetTop;
  if (window.scrollY > top) window.scrollTo({ top, behavior: 'auto' });
  try { history.replaceState(null, '', `#${id}`); } catch { /* sin URL compartible, no pasa nada */ }
}

let touchX = 0, touchY = 0;
$('#panels').addEventListener('touchstart', e => { touchX = e.touches[0].clientX; touchY = e.touches[0].clientY; }, { passive: true });
$('#panels').addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - touchX;
  const dy = e.changedTouches[0].clientY - touchY;
  if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.5 && !e.target.closest('select')) show(current + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
});

/* ---------- Carrito ---------- */

function changeQty(key, delta) {
  let line = cart.find(l => l.key === key);
  if (!line) {
    const [itemId, variantId, choices] = key.split('|');
    line = { key, itemId, variantId, choices: choices ? choices.split(',') : [], qty: 0 };
    cart.push(line);
  }
  line.qty = Math.max(0, line.qty + delta);
  cart = cart.filter(l => l.qty > 0);
  update();
}

// El "+" lanza una bolita hasta la barra del pedido.
function fly(fromEl) {
  navigator.vibrate?.(12);
  const bar = $('#cartbar');
  bar.classList.remove('is-bump'); void bar.offsetWidth; bar.classList.add('is-bump');
  if (calm) return;
  const a = fromEl.getBoundingClientRect();
  const b = $('#cartbar-total').getBoundingClientRect();
  const dot = document.createElement('span');
  dot.className = 'fly';
  document.body.append(dot);
  dot.animate([
    { transform: `translate(${a.x + a.width / 2}px, ${a.y + a.height / 2}px) scale(1)` },
    { transform: `translate(${b.x + b.width / 2}px, ${b.y + b.height / 2}px) scale(.3)`, opacity: .7 }
  ], { duration: 550, easing: 'cubic-bezier(.4,-.35,.7,1)' }).onfinish = () => dot.remove();
}

function renderCartLines() {
  const { groups, total } = priceCart(cart);
  $('#cart-lines').innerHTML = groups.length ? groups.map(g => `
    <h3 class="cart__group">${esc(g.name)}</h3>
    <ul class="cart__list">${g.lines.map(l => `
      <li class="cart__line">
        <span class="cart__label">${esc(l.label)}</span>
        ${stepper(l.key, l.label)}
        <span class="cart__price">${l.price === null ? '' : money(l.price)}</span>
      </li>`).join('')}
      ${g.pools.map(p => `<li class="cart__line cart__line--pool"><span class="cart__label">${p.qty} empanadas</span><span class="cart__price">${money(p.price)}</span></li>`).join('')}
    </ul>`).join('') : '<p class="cart__empty">Tu pedido está vacío. ¡Elegí algo rico!</p>';
  $('#cart-total').textContent = money(total);
  $('#send').disabled = !groups.length;
}

function update() {
  store.set('eltio-cart', cart);
  renderCartLines();
  $$('.stepper').forEach(s => {
    const qty = cart.find(l => l.key === s.dataset.key)?.qty || 0;
    s.dataset.qty = qty;
    s.querySelector('.stepper__qty').value = qty;
  });
  // Puntito en la pestaña si esa categoría tiene algo en el pedido
  $$('.tab').forEach(t => t.classList.toggle('has-items',
    cart.some(l => MENU.find(c => c.id === t.dataset.tab).items.some(i => i.id === l.itemId))));
  const count = cart.reduce((n, l) => n + l.qty, 0);
  $('#cartbar').hidden = !count;
  $('#cartbar-count').textContent = count === 1 ? '1 producto' : `${count} productos`;
  $('#cartbar-total').textContent = money(priceCart(cart).total);
}

/* ---------- Eventos ---------- */

document.addEventListener('click', e => {
  const tab = e.target.closest('[data-tab]');
  if (tab) {
    const i = MENU.findIndex(c => c.id === tab.dataset.tab);
    return show(i, Math.sign(i - current));
  }

  const step = e.target.closest('[data-step]');
  if (step) {
    const delta = Number(step.dataset.step);
    changeQty(step.closest('.stepper').dataset.key, delta);
    if (delta > 0 && !step.closest('.sheet')) fly(step);
    return;
  }

  const promo = e.target.closest('[data-promo]');
  if (promo) {
    const choices = $$('.pick', promo.parentElement).map(s => s.value);
    changeQty(`${promo.dataset.promo}||${choices.join(',')}`, 1);
    fly(promo);
    promo.textContent = '¡Agregada!';
    setTimeout(() => { promo.textContent = '+ Agregar'; }, 1200);
    return;
  }

  const desc = e.target.closest('.card__desc');
  if (desc) desc.classList.toggle('is-open');
});

/* ---------- Portada ---------- */

const intro = $('#intro');
function closeIntro() {
  store.set('eltio-intro', true, sessionStorage);
  document.body.classList.remove('is-locked');
  if (calm) { intro.hidden = true; return; }
  intro.classList.add('is-out');
  intro.addEventListener('animationend', () => { intro.hidden = true; }, { once: true });
}
$('#go').addEventListener('click', closeIntro);

/* ---------- Pedido ---------- */

const dialog = $('#cart');
const form = $('#checkout');
const f = form.elements; // form.name sería el atributo del form, no el input

$('#cartbar').addEventListener('click', () => dialog.showModal());
$('#close').addEventListener('click', () => dialog.close());
$('#clear').addEventListener('click', () => { cart = []; update(); dialog.close(); });
dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); }); // tocar afuera cierra

form.addEventListener('change', () => {
  f.address.required = f.delivery.value === 'delivery';
});

form.addEventListener('submit', e => {
  e.preventDefault();
  const data = {
    name: f.name.value.trim(),
    delivery: f.delivery.value === 'delivery',
    address: f.address.value.trim(),
    pay: f.pay.value,
    note: f.note.value.trim()
  };
  store.set('eltio-cliente', { name: data.name, address: data.address });
  const url = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(buildMessage(cart, data))}`;
  // Primero el cartel de gracias, después WhatsApp. Si el navegador frena el salto, queda el botón.
  dialog.close();
  $('#thanks-wa').href = url;
  $('#thanks').hidden = false;
  setTimeout(() => { window.location.href = url; }, calm ? 800 : 2400);
});

$('#again').addEventListener('click', () => {
  cart = [];
  update();
  $('#thanks').hidden = true;
  show(0);
});

/* ---------- Inicio ---------- */

render();
$('#year').textContent = new Date().getFullYear();
const cliente = store.get('eltio-cliente', {});
f.name.value = cliente.name || '';
f.address.value = cliente.address || '';
// La portada sale una vez por visita (volver de WhatsApp no la repite).
if (store.get('eltio-intro', false, sessionStorage)) { intro.hidden = true; document.body.classList.remove('is-locked'); }
update();
show(Math.max(0, MENU.findIndex(c => `#${c.id}` === location.hash)));
