# El Tío · Pedidos online

Web estática: el cliente arma su pedido y se abre WhatsApp (351 226 4116) con el mensaje listo.

## Editar precios o productos
Solo `js/menu.js`. El número de WhatsApp también está ahí (`WHATSAPP`).

## Estilos
Se editan en `scss/`, y se compila a `css/main.css`:

```
npm install
npm run build    # o npm run watch mientras editás
npm test         # verifica precios y mensaje
```

## Publicar
Publicado en https://eltio-pedidos.netlify.app — para actualizar, subí la carpeta (sin `node_modules`) a Netlify Drop, GitHub Pages o Vercel. El link que te den es el que va en la bio de Instagram, en el estado de WhatsApp, etc.
Atajos directos a una sección: `tulink/#empanadas`, `#pizzas`, `#promos`, `#lomos`.
Cuando tengas el dominio, poné la URL completa en `og:image` dentro de `index.html` para que se vea la foto al compartir.
