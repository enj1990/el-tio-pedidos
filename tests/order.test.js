const test = require('node:test');
const assert = require('node:assert');
const { tierPrice, priceCart, buildMessage } = require('../js/order.js');

test('combos: 2 lomos y docenas surtidas', () => {
  assert.strictEqual(tierPrice([[2, 34000], [1, 18000]], 3), 52000);
  assert.strictEqual(tierPrice([[12, 19000], [6, 11000], [1, 2000]], 20), 19000 + 11000 + 4000);
});

test('empanadas de distintos gustos suman a la docena', () => {
  const cart = [
    { key: 'emp-arabes||', itemId: 'emp-arabes', variantId: '', choices: [], qty: 6 },
    { key: 'emp-jyq||', itemId: 'emp-jyq', variantId: '', choices: [], qty: 6 },
    { key: 'pz-napo|grande|', itemId: 'pz-napo', variantId: 'grande', choices: [], qty: 1 }
  ];
  assert.strictEqual(priceCart(cart).total, 19000 + 13000);
  const msg = buildMessage(cart, { name: 'Ana', delivery: true, address: 'Colón 123', pay: 'Efectivo', note: '' });
  assert.match(msg, /1x Pizza Napolitana \(Grande\) — \$13\.000/);
  assert.match(msg, /6x Árabes\n6x Jamón y queso\nTotal 12 empanadas — \$19\.000/);
  assert.match(msg, /\*TOTAL: \$32\.000\*/);
  assert.match(msg, /Delivery: Colón 123/);
});

test('promo con elección', () => {
  const cart = [{ key: 'promo-2esp||Napolitana,Jamón y huevo', itemId: 'promo-2esp', variantId: '', choices: ['Napolitana', 'Jamón y huevo'], qty: 1 }];
  assert.match(buildMessage(cart, { name: 'X', delivery: false, pay: 'Efectivo' }), /1x Dos especiales \(Napolitana \+ Jamón y huevo\) — \$24\.000/);
});
