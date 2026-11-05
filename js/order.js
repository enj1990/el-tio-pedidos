// Lógica pura del pedido: precios y mensaje de WhatsApp. Sin DOM, se testea con node.
/* global MENU */
const _menu = typeof MENU !== 'undefined' ? MENU : require('./menu.js').MENU;

const money = n => '$' + n.toLocaleString('es-AR');

// Greedy por combos: alcanza para estos tiers (12/6/1 y 2/1).
function tierPrice(tiers, qty) {
  let total = 0;
  for (const [size, price] of tiers) {
    total += Math.floor(qty / size) * price;
    qty %= size;
  }
  return total;
}

function findItem(id) {
  for (const cat of _menu) {
    const item = cat.items.find(i => i.id === id);
    if (item) return { cat, item };
  }
  return null;
}

function lineLabel(item, line) {
  const v = item.variants.find(x => x.id === line.variantId);
  let label = item.name;
  if (v && v.label) label = `Pizza ${item.name} (${v.label})`;
  if (line.choices && line.choices.length) label += ` (${line.choices.join(' + ')})`;
  return label;
}

// Devuelve las líneas agrupadas por categoría, en el orden de la carta, con precios.
function priceCart(cart) {
  const groups = [];
  let total = 0;
  for (const cat of _menu) {
    const lines = cart.filter(l => l.qty > 0 && findItem(l.itemId)?.cat === cat);
    if (!lines.length) continue;
    const group = { name: cat.name, lines: [], pools: [] };
    const pools = {};
    for (const line of lines) {
      const { item } = findItem(line.itemId);
      const v = item.variants.find(x => x.id === line.variantId) || item.variants[0];
      const out = { key: line.key, label: lineLabel(item, line), qty: line.qty, price: null };
      if (item.pool) {
        pools[item.pool] = pools[item.pool] || { qty: 0, tiers: v.tiers };
        pools[item.pool].qty += line.qty;
      } else {
        out.price = tierPrice(v.tiers, line.qty);
        total += out.price;
      }
      group.lines.push(out);
    }
    for (const p of Object.values(pools)) {
      const price = tierPrice(p.tiers, p.qty);
      group.pools.push({ qty: p.qty, price });
      total += price;
    }
    groups.push(group);
  }
  return { groups, total };
}

function buildMessage(cart, form) {
  const { groups, total } = priceCart(cart);
  const out = ['*PEDIDO EL TÍO*', '', `👤 ${form.name}`];
  out.push(form.delivery ? `🛵 Delivery: ${form.address}` : '🏃 Retira en el local');
  out.push(`💵 Paga con: ${form.pay}`, '');
  for (const g of groups) {
    out.push(`*${g.name.toUpperCase()}*`);
    for (const l of g.lines) out.push(`${l.qty}x ${l.label}` + (l.price === null ? '' : ` — ${money(l.price)}`));
    for (const p of g.pools) out.push(`Total ${p.qty} empanadas — ${money(p.price)}`);
    out.push('');
  }
  if (form.note) out.push(`📝 Nota: ${form.note}`, '');
  out.push(`*TOTAL: ${money(total)}*`);
  if (form.delivery) out.push('(+ envío a confirmar)');
  return out.join('\n');
}

if (typeof module !== 'undefined') module.exports = { money, tierPrice, priceCart, buildMessage };
