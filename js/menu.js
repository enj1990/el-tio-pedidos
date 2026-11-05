// Carta de El Tío. Para cambiar precios o productos, editá solo este archivo.
// tiers: [cantidad, precio] — el pedido usa el combo más barato (ej. 2 lomos = $34.000).
// pool: productos que se suman entre sí para armar docenas (empanadas surtidas).

const WHATSAPP = '5493512264116';

const ESPECIALES = ['Especial (jamón y morrones)', 'Jamón y huevo', 'Napolitana'];

const MENU = [
  {
    id: 'lomos', name: 'Lomos', img: 'lomo.jpg', note: '100% carne de lomo',
    tip: 'Todos completos con papas. ¿Con ajíes? Avisá en la nota.',
    items: [
      { id: 'lomo-bife', name: 'Lomo de bife', desc: 'Bife de lomo, chimichurri, jamón, queso tybo, tomate, lechuga, huevo, mayonesa casera y papas fritas.', tiers: [[2, 34000], [1, 18000]] },
      { id: 'lomo-prensado', name: 'Lomo de ternera prensado', desc: 'Carne prensada de ternera, chimichurri, jamón, queso tybo, tomate, lechuga, huevo, mayonesa casera y papas fritas.', tiers: [[2, 28000], [1, 15000]] }
    ]
  },
  {
    id: 'hamburguesas', name: 'Hamburguesas', img: 'hamburguesa-cheddar.jpg', note: 'Enormes y muy ricas',
    tip: 'Medallón casero de 150 g, con papas fritas.',
    items: [
      { id: 'burger-simple', name: 'Hamburguesa simple', desc: 'Chimichurri, jamón, queso tybo, tomate, lechuga, huevo, mayonesa casera y papas fritas.', tiers: [[2, 24000], [1, 13000]] },
      { id: 'burger-cheddar', name: 'Hamburguesa cheddar y panceta', desc: 'Chimichurri, cheddar, panceta, tomate, lechuga, huevo, mayonesa casera y papas fritas.', tiers: [[2, 28000], [1, 15000]] },
      { id: 'burger-doble', name: 'Doble simple', desc: 'Dos medallones de 150 g.', tiers: [[1, 15000]] },
      { id: 'burger-doble-cheddar', name: 'Doble cheddar y panceta', desc: 'Dos medallones de 150 g con cheddar y panceta.', tiers: [[1, 16000]] }
    ]
  },
  {
    id: 'pizzas', name: 'Pizzas', img: 'pizza.jpg', note: 'Muzza que estira',
    tip: '¿Van 2 grandes? Mirá las promos, sale menos.',
    items: [
      { id: 'pz-muzza', name: 'Muzzarella', sizes: [['Media', 7000], ['Grande', 12000]] },
      { id: 'pz-especial', name: 'Especial', desc: 'Jamón y morrones.', sizes: [['Media', 8000], ['Grande', 13000]] },
      { id: 'pz-jyh', name: 'Jamón y huevo', sizes: [['Media', 8000], ['Grande', 13000]] },
      { id: 'pz-napo', name: 'Napolitana', desc: 'Rodajas de tomate, ajo y perejil.', sizes: [['Media', 8000], ['Grande', 13000]] },
      { id: 'pz-anchoas', name: 'Jamón y anchoas', desc: 'No entra en promociones.', sizes: [['Media', 9000], ['Grande', 15000]] }
    ]
  },
  {
    id: 'promos', name: 'Promo x2 pizzas', tab: 'Promos', badge: '2x', img: 'pizza.jpg', note: 'Para compartir',
    tip: 'Jamón y anchoas no entra en ninguna promo.',
    items: [
      { id: 'promo-2muzza', name: 'Dos muzzarella', tiers: [[1, 22000]] },
      { id: 'promo-muzza-esp', name: 'Una muzza + una especial', desc: 'Elegí la especial.', choose: 1, tiers: [[1, 23000]] },
      { id: 'promo-2esp', name: 'Dos especiales', desc: 'Elegí las dos.', choose: 2, tiers: [[1, 24000]] }
    ]
  },
  {
    id: 'empanadas', name: 'Empanadas', img: 'empanadas.jpg', note: 'Recién salidas del horno',
    tip: 'Unidad $2.000 · ½ docena $11.000 · docena $19.000. Podés mezclar gustos.',
    items: [
      { id: 'emp-arabes', name: 'Árabes', pool: 'empanadas', tiers: [[12, 19000], [6, 11000], [1, 2000]] },
      { id: 'emp-criollas', name: 'Criollas saladas', pool: 'empanadas', tiers: [[12, 19000], [6, 11000], [1, 2000]] },
      { id: 'emp-jyq', name: 'Jamón y queso', pool: 'empanadas', tiers: [[12, 19000], [6, 11000], [1, 2000]] }
    ]
  },
  {
    id: 'milanesa', name: 'Sándwich de milanesa', tab: 'Milanesa', img: 'milanesa.jpg', note: 'Bien cargado',
    tip: 'Con papas fritas.',
    items: [
      { id: 'mila-clasica', name: 'Tira de pan clásica', desc: 'Nalga, tomate, lechuga, mayonesa casera y papas fritas.', tiers: [[1, 21000]] },
      { id: 'mila-full', name: 'Tira de pan FULL', desc: 'Nalga, jamón, queso tybo, tomate, lechuga, huevo, mayonesa casera y papas fritas.', tiers: [[1, 23000]] },
      { id: 'mila-media-clasica', name: 'Media tira clásica', tiers: [[1, 11000]] },
      { id: 'mila-media-full', name: 'Media tira FULL', tiers: [[1, 12000]] }
    ]
  },
  {
    id: 'papas', name: 'Papas', img: 'papas.jpg', note: '¿Todavía no las probaste?',
    items: [
      { id: 'papas-chica', name: 'Papas fritas chicas', tiers: [[1, 5000]] },
      { id: 'papas-grande', name: 'Papas fritas grandes', tiers: [[1, 10000]] },
      { id: 'papas-cheddar', name: 'Bandeja de papas con cheddar', tiers: [[1, 13000]] },
      { id: 'papas-huevo', name: 'Papas con huevo', tiers: [[1, 13000]] }
    ]
  }
];

// Pizzas: cada tamaño es una variante con su propio precio unitario.
MENU.forEach(cat => cat.items.forEach(item => {
  item.variants = item.sizes
    ? item.sizes.map(([label, price]) => ({ id: label.toLowerCase(), label, tiers: [[1, price]] }))
    : [{ id: '', label: '', tiers: item.tiers }];
}));

if (typeof module !== 'undefined') module.exports = { MENU, ESPECIALES, WHATSAPP };
