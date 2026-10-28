/* =========================================================
   CONFIGURACIÓN — tu número de WhatsApp
   (código de país + número, sin + ni espacios)
   ========================================================= */
const WHATSAPP = "584125735490";

/* =========================================================
   SUPABASE — base de datos de productos, extras y pedidos.
   Pega aquí los dos datos de tu proyecto (Supabase →
   Project Settings → API Keys). Sirve la clave "anon public"
   (empieza con eyJ…) o la "Publishable key" (sb_publishable_…).
   NUNCA uses la "service_role" ni la "Secret key".
   Si los dejas vacíos, la página funciona con los productos
   escritos en este archivo (PRODUCTOS y EXTRAS), como antes.
   ========================================================= */
const SUPABASE_URL = "https://befnzpcyzvdqewkgkjcj.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_l7WgfoP48nRZHKr0FMnVRw_meRlp3eR";

/* =========================================================
   TASA DEL DÓLAR (BCV) — ACTUALIZACIÓN AUTOMÁTICA
   La página consulta la tasa oficial del BCV en estas APIs,
   en orden. Si la primera falla, prueba la siguiente.
   Mientras el cliente tiene la página abierta, se vuelve a
   revisar cada TASA_REVISAR_MINUTOS. Si el BCV publicó una
   tasa nueva, todos los precios en bolívares (catálogo,
   carrito y total) cambian solos y aparece un aviso.
   También se revisa al volver a la pestaña o al recuperar
   la conexión a internet.
   TASA_MANUAL: si escribes un número aquí (ej. 150.25), la
   página usa SIEMPRE esa tasa y no consulta internet.
   Si lo dejas en null y fallan las APIs, se muestran solo
   los precios en dólares.
   ========================================================= */
const TASA_MANUAL = null;

/* =========================================================
   FORMA DE PAGO — porcentaje que el cliente abona por
   adelantado para apartar su pedido. El resto se cancela
   el día de la entrega. Cambia el 50 por otro número si
   quieres otro porcentaje (por ejemplo 30 o 100).
   ========================================================= */
const PORCENTAJE_ABONO = 50;

/* =========================================================
   MÉTODOS DE PAGO — se muestran en el carrito (con botones
   para copiar cada dato), en la sección de contacto y en el
   mensaje de WhatsApp.
   moneda: "Bs" muestra el monto a pagar en bolívares;
           "USD" lo muestra en dólares (para Zelle, efectivo…).
   nota:   texto que ve el cliente en el carrito con ese método.
   notaWhatsApp: frase que se agrega al mensaje del pedido.
   datos:  etiqueta y valor que ve el cliente. "copiar" es lo
           que se copia al tocar el botón (sin puntos ni
           paréntesis, para pegarlo directo en el banco).
   Para agregar otro método, copia el bloque { ... } completo,
   pégalo debajo (separado por una coma) y cambia los datos.
   Si hay más de uno, el cliente elige cuál usar.
   ========================================================= */
const METODOS_PAGO = [
  {
    id: "pagomovil",
    nombre: "Pago Móvil",
    moneda: "Bs",
    datos: [
      { etiqueta: "Banco",    valor: "Venezuela (0102)", copiar: "0102 Banco de Venezuela" },
      { etiqueta: "C.I.",     valor: "31.754.872",       copiar: "31754872" },
      { etiqueta: "Teléfono", valor: "(0412) 573.54.90", copiar: "04125735490" },
    ],
    nota: "Después de pagar, envía el pedido y adjunta la captura del pago en WhatsApp.",
    notaWhatsApp: "(Adjunto la captura del pago)",
  },
  {
    id: "divisas",
    nombre: "Divisas $",
    moneda: "USD",
    datos: [],   // sin datos: se paga en efectivo, en dólares
    nota: "Pagas en efectivo, en dólares. Envía el pedido y coordinamos por WhatsApp cómo entregar el abono.",
    notaWhatsApp: "(Pagaré en divisas)",
  },
  // Ejemplo para más adelante:
  // {
  //   id: "zelle",
  //   nombre: "Zelle",
  //   moneda: "USD",
  //   datos: [
  //     { etiqueta: "Correo",  valor: "correo@ejemplo.com", copiar: "correo@ejemplo.com" },
  //     { etiqueta: "Titular", valor: "Nombre Apellido",    copiar: "Nombre Apellido" },
  //   ],
  // },
];
const APIS_TASA = [
  "https://ve.dolarapi.com/v1/dolares/oficial",
  "https://pydolarve.org/api/v1/dollar?page=bcv&monitor=usd",
];
const TASA_REVISAR_MINUTOS = 10; // cada cuánto se revisa si el BCV cambió la tasa

/* =========================================================
   PRODUCTOS — agrega, quita o edita productos aquí.
   ⓘ Si conectaste Supabase (arriba), los productos, precios y
     extras se administran desde Supabase y esta lista solo se
     usa como respaldo si no hay conexión.
   imagenes: lista de fotos (la primera es la principal).
             Guarda las fotos en la carpeta img/.
   opciones: cada opción con su nombre y precio EN DÓLARES.
             El precio en bolívares se calcula solo con la tasa BCV.
   etiqueta: texto opcional sobre la foto ("Nuevo", "Más vendido").
   ⚠️ Los precios son de ejemplo: cámbialos por los tuyos.
   ========================================================= */
const PRODUCTOS = [
  { id:1, nombre:"Ramo de flores amarillas con luz", categoria:"Ramos",
    imagenes:["img/ramo-flores-luz.jpg"],
    descripcion:"Ramo de flores amarillas hechas a mano, con luces cálidas, papel elegante, lazo lavanda y tarjeta.",
    etiqueta:"Más vendido",
    opciones:[{nombre:"12 flores",precio:20},{nombre:"20 flores",precio:30}] },

  { id:2, nombre:"Girasol en maceta", categoria:"Girasoles",
    imagenes:["img/girasol-maceta-2.jpg","img/girasol-maceta-1.jpg"],
    descripcion:"Girasol con hojas y maceta café, todo tejido en limpiapipas. Perfecto para el escritorio o la mesa de noche.",
    opciones:[{nombre:"1 girasol",precio:8},{nombre:"2 girasoles",precio:15}] },

  { id:3, nombre:"Girasol en bolsa de regalo", categoria:"Girasoles",
    imagenes:["img/girasol-bolsa-regalo.jpg","img/girasol-maceta-1.jpg"],
    descripcion:"Nuestro girasol en maceta, entregado en bolsa blanca con ventana y asas de cinta. Listo para regalar.",
    etiqueta:"Listo para regalar",
    extras:["flor","lazo","tarjeta","chocolates","peluche"], // ya incluye bolsa
    opciones:[{nombre:"Con bolsa de ventana",precio:10}] },

  { id:4, nombre:"Rama de flores amarillas", categoria:"Flores sueltas",
    imagenes:["img/rama-flores-amarillas.jpg"],
    descripcion:"Rama con tres flores amarillas y botones verdes. Ideal para jarrones o para armar tu propio ramo.",
    opciones:[{nombre:"1 rama",precio:4},{nombre:"3 ramas",precio:11}] },

  { id:5, nombre:"Lirio azul", categoria:"Flores sueltas",
    imagenes:["img/lirio-azul.jpg"],
    descripcion:"Lirio de pétalos grandes con centro amarillo y hojas verdes. También lo hacemos en el color que quieras.",
    etiqueta:"Nuevo",
    opciones:[{nombre:"1 lirio",precio:5},{nombre:"3 lirios",precio:14}] },

  { id:7, nombre:"Caja de lirios azules con luz", categoria:"Ramos",
    imagenes:["img/caja-lirios-azules-1.jpg","img/caja-lirios-azules-2.jpg","img/caja-lirios-azules-3.jpg","img/caja-lirios-azules-4.jpg"],
    descripcion:"Lirios azules y blanco tejidos a mano, en caja negra con asa de cinta y luces LED que los iluminan de noche.",
    etiqueta:"Nuevo",
    extras:["hotwheels","flor","lazo","tarjeta","chocolates","peluche"], // ya incluye caja y luces
    opciones:[{nombre:"3 lirios",precio:25},{nombre:"5 lirios",precio:38}] },

  { id:6, nombre:"Combo ramo y girasol", categoria:"Combos",
    imagenes:["img/promo-flores-amarillas.jpg","img/ramo-flores-luz.jpg","img/girasol-bolsa-regalo.jpg"],
    descripcion:"Ramo de flores amarillas con luz cálida más un girasol en maceta dentro de su bolsa de regalo.",
    etiqueta:"Combo",
    opciones:[{nombre:"Ramo 12 flores + girasol",precio:27},{nombre:"Ramo 20 flores + girasol",precio:36}] },
];

/* =========================================================
   EXTRAS — complementos que el cliente puede sumar a cualquier
   producto con el botón "Extras". Precios EN DÓLARES (cada
   unidad); el monto en bolívares se calcula solo.
   max: cuántas unidades de ese extra se pueden agregar.
   imagen: foto del extra (cuadrada, en la carpeta img/extras/).
           Si no tiene, se muestra un ícono.
   exclusivo:true → ese extra NO aparece en todos los productos,
   solo en los que lo nombren en su lista extras:[...].
   Para que un producto muestre solo algunos extras, agrégale
   extras:["flor","luces"] en la lista PRODUCTOS. Si no lo
   tiene, muestra todos.
   ⚠️ Los precios son de ejemplo: cámbialos por los tuyos.
   ========================================================= */
/* Extras que no se ofrecen, aunque todavía existan en Supabase.
   Escribe aquí el id del extra para esconderlo en toda la página
   (catálogo y creador de ramos). Quítalo de la lista para volver
   a ofrecerlo. Los pedidos ya hechos no se modifican. */
const EXTRAS_OCULTOS = ["mariposa"];

/* Fotos de los extras. Lo que escribas aquí manda sobre la foto
   que venga de Supabase, así que basta con guardar la imagen en
   img/extras/ y nombrarla abajo. Quita la línea para volver al ícono. */
const EXTRAS_FOTOS = {
  tarjeta:    "img/extras/tarjeta.jpg",
  chocolates: "img/extras/chocolates.jpg",
  peluche:    "img/extras/peluche.jpg",
};
const conFotos = lista => lista.map(e => ({ ...e, imagen: EXTRAS_FOTOS[e.id] || e.imagen }));

const EXTRAS = [
  { id:"flor",       nombre:"Flor adicional",        detalle:"Del mismo estilo del producto",      precio:1.5, max:20, imagen:"img/extras/flor.jpg" },
  { id:"luces",      nombre:"Luces LED cálidas",     detalle:"Tira de luces que brillan de noche", precio:2,   max:3, imagen:"img/extras/luces.jpg" },
  { id:"lazo",       nombre:"Lazo de otro color",    detalle:"Dinos el color por WhatsApp",        precio:1,   max:1, imagen:"img/extras/lazo.jpg" },
  { id:"tarjeta",    nombre:"Tarjeta decorada",      detalle:"Con tu mensaje escrito a mano",      precio:1.5, max:1 },
  { id:"chocolates", nombre:"Chocolates",            detalle:"Cajita de bombones",                 precio:4,   max:3 },
  { id:"peluche",    nombre:"Peluche pequeño",       detalle:"Osito de unos 15 cm",                precio:6,   max:2 },
  { id:"bolsa",      nombre:"Bolsa de regalo",       detalle:"Bolsa blanca con ventana",           precio:2,   max:2, imagen:"img/extras/bolsa.jpg" },
  // exclusivo:true → solo aparece en los productos que lo incluyan en su lista extras:[...]
  { id:"hotwheels",  nombre:"Carrito Hot Wheels",    detalle:"Carrito de colección en su empaque", precio:4,   max:5, exclusivo:true, imagen:"img/extras/hotwheels.jpg" },
].map(e => ({ ...e, imagen: EXTRAS_FOTOS[e.id] || e.imagen }));

/* =========================================================
   CREA TU RAMO — opciones del creador personalizado.
   Todos los precios EN DÓLARES. ⚠️ Son de ejemplo.
   tipos:   qué puede crear el cliente. precioBase es lo que
            cuesta la presentación (papel, maceta, tallo…).
            minFlores / maxFlores: límites de flores.
   flores:  precio por cada flor. imagen: foto real de esa flor
            (carpeta img/creador/). Si no tiene, se dibuja.
            fotosPorColor: foto de la flor en cada color. Cuando el
            cliente elige un color, se muestra esa foto. Si un color
            no tiene foto, se usa "imagen" con un punto del color.
   colores: colores disponibles para las flores (hex = color
            que se dibuja en la vista previa).
   extras:  cuáles de la lista EXTRAS se ofrecen aquí.
   ========================================================= */
const CREADOR = {
  tipos: [
    { id:"ramo",   nombre:"Ramo",             carrito:"Ramo personalizado",    detalle:"Envuelto en papel con lazo",   precioBase:5, minFlores:3, maxFlores:40, imagen:"img/creador/tipo-ramo.jpg" },
    { id:"maceta", nombre:"Flores en maceta", carrito:"Maceta personalizada",  detalle:"Maceta tejida en limpiapipas", precioBase:4, minFlores:1, maxFlores:5, imagen:"img/creador/tipo-maceta.jpg" },
    { id:"suelta", nombre:"Flor individual",  carrito:"Flor personalizada",    detalle:"Con tallo y hojas",            precioBase:1, minFlores:1, maxFlores:1, imagen:"img/creador/tipo-suelta.jpg" },
  ],
  flores: [
    // genero: "m" (el girasol) o "f" (la rosa), para escribir bien el color: "rosa roja", "lirio rojo"
    { id:"girasol",   nombre:"Girasol",      plural:"Girasoles",       genero:"m", precio:3, imagen:"img/creador/girasol-amarillo.jpg",
      fotosPorColor: {
        amarillo: "img/creador/girasol-amarillo.jpg",
        naranja:  "img/creador/girasol-naranja.jpg",
        rojo:     "img/creador/girasol-rojo.jpg",
        rosado:   "img/creador/girasol-rosado.jpg",
        morado:   "img/creador/girasol-morado.jpg",
        azul:     "img/creador/girasol-azul.jpg",
        blanco:   "img/creador/girasol-blanco.jpg",
      } },
    { id:"pequena",   nombre:"Flor pequeña", plural:"Flores pequeñas", genero:"f", precio:1.5, imagen:"img/creador/pequena-rosado.jpg",
      fotosPorColor: {
        amarillo: "img/creador/pequena-amarillo.jpg",
        naranja:  "img/creador/pequena-naranja.jpg",
        rojo:     "img/creador/pequena-rojo.jpg",
        rosado:   "img/creador/pequena-rosado.jpg",
        morado:   "img/creador/pequena-morado.jpg",
        azul:     "img/creador/pequena-azul.jpg",
        blanco:   "img/creador/pequena-blanco.jpg",
      } },
    { id:"rosa",      nombre:"Rosa",         plural:"Rosas",           genero:"f", precio:3, imagen:"img/creador/rosa-rojo.jpg",
      fotosPorColor: {
        amarillo: "img/creador/rosa-amarillo.jpg",
        naranja:  "img/creador/rosa-naranja.jpg",
        rojo:     "img/creador/rosa-rojo.jpg",
        rosado:   "img/creador/rosa-rosado.jpg",
        morado:   "img/creador/rosa-morado.jpg",
        azul:     "img/creador/rosa-azul.jpg",
        blanco:   "img/creador/rosa-blanco.jpg",
      } },
    { id:"lirio",     nombre:"Lirio",        plural:"Lirios",          genero:"m", precio:4, imagen:"img/creador/flor-lirio.jpg",
      fotosPorColor: {
        azul:     "img/creador/flor-lirio.jpg",
        amarillo: "img/creador/lirio-amarillo.jpg",
        naranja:  "img/creador/lirio-naranja.jpg",
        rojo:     "img/creador/lirio-rojo.jpg",
        rosado:   "img/creador/lirio-rosado.jpg",
        morado:   "img/creador/lirio-morado.jpg",
        blanco:   "img/creador/lirio-blanco.jpg",
      } },
    { id:"tulipan",   nombre:"Tulipán",      plural:"Tulipanes",       genero:"m", precio:2.5, imagen:"img/creador/tulipan-rojo.jpg",
      fotosPorColor: {
        amarillo: "img/creador/tulipan-amarillo.jpg",
        naranja:  "img/creador/tulipan-naranja.jpg",
        rojo:     "img/creador/tulipan-rojo.jpg",
        rosado:   "img/creador/tulipan-rosado.jpg",
        morado:   "img/creador/tulipan-morado.jpg",
        azul:     "img/creador/tulipan-azul.jpg",
        blanco:   "img/creador/tulipan-blanco.jpg",
      } },
  ],
  colores: [
    { id:"amarillo", nombre:"amarillo", hex:"#F6C21C" },
    { id:"naranja",  nombre:"naranja",  hex:"#F28C28" },
    { id:"rojo",     nombre:"rojo",     hex:"#D7263D" },
    { id:"rosado",   nombre:"rosado",   hex:"#F48FB1" },
    { id:"morado",   nombre:"morado",   hex:"#7B4FC9" },
    { id:"azul",     nombre:"azul",     hex:"#1E5BD8" },
    { id:"blanco",   nombre:"blanco",   hex:"#F7F4EC" },
  ],
  papeles: [
    { id:"blanco",   nombre:"Blanco",   hex:"#F4F1EA" },
    { id:"kraft",    nombre:"Marrón",   hex:"#C9A27A" },
    { id:"negro",    nombre:"Negro",    hex:"#2B2730" },
    { id:"rosado",   nombre:"Rosado",   hex:"#F6C9D6" },
    { id:"lavanda",  nombre:"Lavanda",  hex:"#CFC3F2" },
  ],
  // elegirLazo: false → el cliente NO elige color de lazo (se usa el lavanda).
  // Cámbialo a true para volver a mostrar los colores de lazo.
  elegirLazo: false,
  lazos: [
    { id:"lavanda",  nombre:"Lavanda",  hex:"#A99BE6" },
    { id:"blanco",   nombre:"Blanco",   hex:"#FFFFFF" },
    { id:"rojo",     nombre:"Rojo",     hex:"#C8102E" },
    { id:"dorado",   nombre:"Dorado",   hex:"#D4AF37" },
    { id:"rosado",   nombre:"Rosado",   hex:"#F48FB1" },
  ],
  macetas: [
    { id:"cafe",       nombre:"Café",       hex:"#6B4A32" },
    { id:"blanco",     nombre:"Blanca",     hex:"#F2EFE8" },
    { id:"negro",      nombre:"Negra",      hex:"#2B2B2B" },
    { id:"terracota",  nombre:"Terracota",  hex:"#C0643C" },
  ],
  extras: ["luces","tarjeta","chocolates","peluche","bolsa"],
};

/* =========================================================
   LÓGICA DE LA PÁGINA — normalmente no necesitas tocar esto
   ========================================================= */
const $ = s => document.querySelector(s);
/* Formato de precios: $ 20,00 y Bs. 3.650,00 */
const fmt = n => n.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
let tasa = null, tasaFecha = null;
const usd = n => "$ " + fmt(n);
const bs = n => tasa ? "Bs. " + fmt(n * tasa) : "";
const precioHTML = (n, desde = false) =>
  `${desde ? "<small>Desde</small>" : ""}${usd(n)}${tasa ? `<span class="precio-bs">${bs(n)}</span>` : ""}`;
const precioTexto = n => tasa ? `${usd(n)} (${bs(n)})` : usd(n);
/* Divide un monto en abono (hoy) y resto (al entregar) */
const dividirPago = total => {
  const abono = Math.round(total * PORCENTAJE_ABONO) / 100;
  return { abono, resto: Math.round((total - abono) * 100) / 100 };
};
const montoHTML = n => `<strong>${usd(n)}</strong>${tasa ? ` <span class="monto-bs">(${bs(n)})</span>` : ""}`;

/* Obtener la tasa: manual → guardada (si es reciente) → APIs */
function leerTasa(d) {
  const v = d?.promedio ?? d?.price ?? d?.monitors?.usd?.price ?? d?.precio ?? d?.valor;
  const n = typeof v === "string" ? parseFloat(v.replace(",", ".")) : v;
  return n > 0 ? n : null;
}
let tasaRevisada = 0;      // momento de la última consulta
let consultando = false;

function guardarTasa() {
  try { localStorage.setItem("tasa-bcv", JSON.stringify({ tasa, fecha: tasaFecha, guardada: tasaRevisada })); } catch (e) {}
}

/* Consulta las APIs. Devuelve true si obtuvo una tasa. */
async function consultarTasa() {
  if (TASA_MANUAL || consultando || !navigator.onLine) return false;
  consultando = true;
  try {
    for (const url of APIS_TASA) {
      try {
        const r = await fetch(url, { cache: "no-store" });
        if (!r.ok) continue;
        const d = await r.json();
        const nueva = leerTasa(d);
        if (!nueva) continue;
        const anterior = tasa;
        const fechaNueva = d.fechaActualizacion || d.last_update || d.fecha || tasaFecha || new Date().toISOString();
        const cambio = anterior !== null && Math.abs(nueva - anterior) > 0.0001;
        const fechaCambio = fechaNueva !== tasaFecha;
        tasa = nueva; tasaFecha = fechaNueva; tasaRevisada = Date.now();
        guardarTasa();
        if (anterior === null || cambio || fechaCambio) pintarTasa(cambio);
        if (cambio) aviso(`La tasa BCV se actualizó: Bs. ${fmt(nueva)}`);
        return true;
      } catch (e) { /* prueba la siguiente API */ }
    }
    return false;
  } finally { consultando = false; }
}

async function cargarTasa() {
  if (TASA_MANUAL) { tasa = TASA_MANUAL; tasaFecha = null; return pintarTasa(); }
  // 1. Muestra al instante la última tasa guardada (si hay)
  try {
    const g = JSON.parse(localStorage.getItem("tasa-bcv"));
    if (g && g.tasa > 0) { tasa = g.tasa; tasaFecha = g.fecha; tasaRevisada = g.guardada || 0; pintarTasa(); }
  } catch (e) {}
  // 2. Si la guardada no es reciente, consulta la tasa actual
  if (Date.now() - tasaRevisada >= TASA_REVISAR_MINUTOS * 60000) {
    const ok = await consultarTasa();
    if (!ok && tasa === null) pintarTasa();
  }
  // 3. Sigue revisando mientras la página esté abierta
  setInterval(() => { if (!document.hidden) consultarTasa(); }, TASA_REVISAR_MINUTOS * 60000);
  // 4. Revisa al volver a la pestaña (si pasó el tiempo) o al recuperar internet
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && Date.now() - tasaRevisada >= TASA_REVISAR_MINUTOS * 60000) consultarTasa();
  });
  window.addEventListener("online", consultarTasa);
  // 5. Si el cliente tiene la página abierta en varias pestañas, se sincronizan
  window.addEventListener("storage", e => {
    if (e.key !== "tasa-bcv" || !e.newValue) return;
    try {
      const g = JSON.parse(e.newValue);
      if (g.tasa > 0 && g.tasa !== tasa) { tasa = g.tasa; tasaFecha = g.fecha; tasaRevisada = g.guardada; pintarTasa(true); }
    } catch (err) {}
  });
}
function pintarTasa(resaltar = false) {
  const el = document.querySelectorAll(".tasa-bcv");
  let texto;
  if (tasa) {
    const f = tasaFecha ? new Date(tasaFecha) : null;
    const fecha = f && !isNaN(f) ? " · " + f.toLocaleDateString("es-VE", { day: "2-digit", month: "2-digit", year: "numeric" }) : "";
    texto = `Tasa BCV: Bs. ${fmt(tasa)} por dólar${fecha}`;
  } else {
    texto = "Precios en dólares. Consulta el monto en bolívares por WhatsApp.";
  }
  el.forEach(e => e.textContent = texto);
  pintarProductos(); pintarCarrito();
  if (actual && $("#modal").classList.contains("visible")) pintarExtras();
  if (typeof pintarCreador === "function" && $("#crTipos")) conFoco(pintarCreador);
  // Destaca brevemente los montos en bolívares cuando la tasa cambia
  if (resaltar) document.querySelectorAll(".precio-bs, .total-bs, .item small, .chip-tasa").forEach(e => {
    e.classList.remove("tasa-cambio"); void e.offsetWidth; e.classList.add("tasa-cambio");
  });
}
const foto = (src, alt, lazy = true) =>
  `<img class="img-cubrir" src="${src}" alt="${alt}"${lazy ? ' loading="lazy"' : ""}>`;

let categoria = "Todos", busqueda = "", carrito = [];
try { carrito = JSON.parse(localStorage.getItem("carrito-amara")) || []; } catch (e) { carrito = []; }
const guardar = () => { try { localStorage.setItem("carrito-amara", JSON.stringify(carrito)); } catch (e) {} };

/* Filtros */
function pintarFiltros() {
  const categorias = ["Todos", ...new Set(PRODUCTOS.map(p => p.categoria))];
  if (!categorias.includes(categoria)) categoria = "Todos";
  $("#filtros").innerHTML = categorias.map(c =>
    `<button class="filtro" aria-pressed="${c === categoria}" data-cat="${c}">${c}</button>`).join("");
}
pintarFiltros();
$("#filtros").addEventListener("click", e => {
  const b = e.target.closest(".filtro"); if (!b) return;
  categoria = b.dataset.cat;
  document.querySelectorAll(".filtro").forEach(f => f.setAttribute("aria-pressed", f === b));
  pintarProductos(true);
});
let busquedaTimer;
$("#buscador").addEventListener("input", e => {
  busqueda = e.target.value.toLowerCase().trim();
  clearTimeout(busquedaTimer); busquedaTimer = setTimeout(() => pintarProductos(true), 150);
});

/* Catálogo */
function pintarProductos(animar = false) {
  const lista = PRODUCTOS.filter(p =>
    (categoria === "Todos" || p.categoria === categoria) &&
    (p.nombre + " " + p.descripcion + " " + p.categoria).toLowerCase().includes(busqueda));
  const cta = categoria === "Todos" && !busqueda ? `
    <article class="producto cta-creador">
      <a href="#crea-tu-ramo" class="cta-creador-enlace">
        <span class="cta-creador-arte cta-mosaico" aria-hidden="true">
          <img src="img/lirio-azul.jpg" alt="" loading="lazy">
          <img src="img/girasol-maceta-1.jpg" alt="" loading="lazy">
          <img src="img/rama-flores-amarillas.jpg" alt="" loading="lazy">
        </span>
        <span class="cta-creador-texto">
          <span class="nota-mano">¿No encuentras lo que buscas?</span>
          <strong>Crea tu propio ramo</strong>
          <span>Elige flores, colores, papel y extras. Te mostramos cómo queda y cuánto cuesta.</span>
          <span class="btn btn-principal">Empezar a crear</span>
        </span>
      </a>
    </article>` : "";
  $("#grilla").innerHTML = cta + (lista.length ? lista.map(p => `
    <article class="producto${p.agotado ? " agotado" : ""}">
      <button class="producto-img" data-ver="${p.id}" aria-label="Ver detalles de ${p.nombre}">
        ${foto(p.imagenes[0], p.nombre)}
        ${p.agotado ? `<span class="etiqueta etiqueta-agotado">Agotado</span>` : p.etiqueta ? `<span class="etiqueta">${p.etiqueta}</span>` : ""}
      </button>
      <div class="producto-info">
        <h3>${p.nombre}</h3>
        <p>${p.descripcion}</p>
        <div class="producto-pie">
          <span class="precio">${precioHTML(p.opciones[0].precio, p.opciones.length > 1)}</span>
          <div class="botones-card">
            ${p.agotado
              ? `<button class="btn-agregar btn-agotado" disabled>Agotado por ahora</button>`
              : `<button class="btn-extras-card" data-ver="${p.id}" data-extras>Extras</button>
            <button class="btn-agregar" data-ver="${p.id}">Agregar</button>`}
          </div>
        </div>
      </div>
    </article>`).join("")
    : `<p class="sin-resultados">No encontramos productos con esa palabra. Prueba con “girasol” o elige “Todos”.</p>`);
  if (typeof animarTarjetas === "function") animarTarjetas(animar);
}

/* Cualquier botón con data-ver abre el producto (catálogo y promoción) */
document.addEventListener("click", e => {
  const b = e.target.closest("[data-ver]");
  if (b) abrirModal(+b.dataset.ver, b.hasAttribute("data-extras"));
});

/* Modal */
let actual = null, opcionSel = 0, ultimoFoco = null, extrasSel = {};

/* Miniatura de un extra: su foto real, o un ícono si aún no tiene foto */
const ICONOS_EXTRA = {
  mariposa: '<path d="M11.4 11C9.8 6.6 6 4 3.2 4.6 1.4 5.2 2.4 9 4.6 10.4c1.6 1 4.1 1 6.8.6zM12.6 11c1.6-4.4 5.4-7 8.2-6.4 1.8.6.8 4.4-1.4 5.8-1.6 1-4.1 1-6.8.6zM11.4 12.2c-2.5.3-5.3 1.6-5.6 3.8-.3 1.9 1.9 2.5 3.4 1.3 1.3-1 1.9-2.9 2.2-5.1zM12.6 12.2c2.5.3 5.3 1.6 5.6 3.8.3 1.9-1.9 2.5-3.4 1.3-1.3-1-1.9-2.9-2.2-5.1z"/>',
  tarjeta: '<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 8l9 6 9-6"/>',
  chocolates: '<rect x="4" y="8" width="16" height="12" rx="2"/><path d="M4 12h16M12 8v12M12 8c-2-4-6-4-6-1s6 1 6 1zm0 0c2-4 6-4 6-1s-6 1-6 1z"/>',
  peluche: '<circle cx="7" cy="6.5" r="2.3"/><circle cx="17" cy="6.5" r="2.3"/><circle cx="12" cy="11" r="5"/><path d="M8 15.5c-1.8 1-3 2.6-3 4.5h14c0-1.9-1.2-3.5-3-4.5"/><path d="M10.5 11.5h.01M13.5 11.5h.01M11 13.5c.6.5 1.4.5 2 0"/>',
};
const miniExtra = e => e.imagen
  ? `<span class="extra-foto"><img src="${e.imagen}" alt="" loading="lazy"></span>`
  : `<span class="extra-foto extra-icono" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${ICONOS_EXTRA[e.id] || '<path d="M12 3l1.8 4.6L18 9.5l-4.2 1.9L12 16l-1.8-4.6L6 9.5l4.2-1.9z"/>'}</svg></span>`;

/* Extras disponibles para un producto */
/* Si el producto tiene su lista extras:[...], se muestran en ese mismo orden */
const extrasDe = p => p.extras ? p.extras.map(id => EXTRAS.find(e => e.id === id)).filter(Boolean) : EXTRAS.filter(e => !e.exclusivo);
/* Costo de un conjunto de extras { id: cantidad } */
const costoExtras = sel => Object.entries(sel || {}).reduce((s, [id, n]) => {
  const e = EXTRAS.find(x => x.id === id); return s + (e ? e.precio * n : 0);
}, 0);
/* Texto: "2 x Flor adicional, 1 x Chocolates" */
const textoExtras = sel => Object.entries(sel || {}).filter(([, n]) => n > 0)
  .map(([id, n]) => { const e = EXTRAS.find(x => x.id === id); return e ? `${n} x ${e.nombre}` : ""; })
  .filter(Boolean).join(", ");

function pintarExtras() {
  $("#listaExtras").innerHTML = extrasDe(actual).map(e => {
    const n = extrasSel[e.id] || 0;
    if (e.agotado) return `<li class="extra extra-agotado">${miniExtra(e)}<div class="extra-info"><strong>${e.nombre}</strong><small>Agotado por ahora</small></div></li>`;
    return `<li class="extra${n ? " activo" : ""}">
      ${miniExtra(e)}
      <div class="extra-info">
        <strong>${e.nombre}</strong>
        ${e.detalle ? `<small>${e.detalle}</small>` : ""}
        <span class="extra-precio">+ ${usd(e.precio)}${tasa ? ` · ${bs(e.precio)}` : ""}</span>
      </div>
      <div class="cantidad" role="group" aria-label="Cantidad de ${e.nombre}">
        <button data-extra-menos="${e.id}" aria-label="Quitar ${e.nombre}" ${n ? "" : "disabled"}>−</button>
        <span aria-live="polite">${n}</span>
        <button data-extra-mas="${e.id}" aria-label="Agregar ${e.nombre}" ${n >= e.max ? "disabled" : ""}>+</button>
      </div>
    </li>`;
  }).join("");
  actualizarPrecioModal();
}
function actualizarPrecioModal() {
  const base = actual.opciones[opcionSel].precio, extra = costoExtras(extrasSel);
  const cant = Object.values(extrasSel).reduce((a, b) => a + b, 0);
  $("#modalPrecio").innerHTML = precioHTML(base + extra);
  const { abono, resto } = dividirPago(base + extra);
  $("#modalAbonoCorto").innerHTML = PORCENTAJE_ABONO >= 100 ? "Pago completo por adelantado"
    : `Abonas hoy <strong>${usd(abono)}</strong> (${PORCENTAJE_ABONO}%) · el resto al recibir`;
  $("#modalPago").innerHTML = PORCENTAJE_ABONO >= 100
    ? `Este producto se cancela <strong>completo por adelantado</strong>: ${montoHTML(abono)}.`
    : `Para apartar tu pedido abonas el <strong>${PORCENTAJE_ABONO}%</strong> por adelantado: ${montoHTML(abono)}.<br>
       El <strong>${100 - PORCENTAJE_ABONO}% restante</strong> se cancela el día de la entrega: ${montoHTML(resto)}.`;
  $("#modalDesglose").textContent = extra ? `Incluye ${usd(extra)} en extras` : "";
  $("#resumenExtras").textContent = cant ? `${cant} ${cant === 1 ? "extra" : "extras"} · + ${usd(extra)}` : "Personaliza tu pedido";
}
function abrirExtras(abrir) {
  $("#panelExtras").hidden = !abrir;
  $("#botonExtras").setAttribute("aria-expanded", abrir);
}
$("#botonExtras").addEventListener("click", () => abrirExtras($("#panelExtras").hidden));
$("#listaExtras").addEventListener("click", e => {
  const b = e.target.closest("button"); if (!b || b.disabled) return;
  const id = b.dataset.extraMas || b.dataset.extraMenos;
  const ex = EXTRAS.find(x => x.id === id); if (!ex) return;
  const n = (extrasSel[id] || 0) + (b.dataset.extraMas ? 1 : -1);
  if (n <= 0) delete extrasSel[id]; else extrasSel[id] = Math.min(n, ex.max);
  pintarExtras();
  const mismo = $(`#listaExtras [${b.dataset.extraMas ? "data-extra-mas" : "data-extra-menos"}="${id}"]`);
  (mismo && !mismo.disabled ? mismo : $(`#listaExtras [data-extra-mas="${id}"]`))?.focus({ preventScroll: true });
});
function mostrarFoto(i) {
  $("#modalImg").innerHTML = foto(actual.imagenes[i], actual.nombre, false);
  document.querySelectorAll(".miniaturas button").forEach((b, j) => b.setAttribute("aria-pressed", j === i));
}
function abrirModal(id, conExtras = false) {
  actual = PRODUCTOS.find(p => p.id === id); if (!actual) return;
  opcionSel = 0; extrasSel = {}; ultimoFoco = document.activeElement;
  $("#modalMiniaturas").innerHTML = actual.imagenes.length > 1
    ? actual.imagenes.map((src, i) => `<button data-foto="${i}" aria-label="Ver foto ${i + 1}">${foto(src, "")}</button>`).join("")
    : "";
  mostrarFoto(0);
  $("#modalTitulo").textContent = actual.nombre;
  $("#modalDesc").textContent = actual.descripcion;
  $("#modalOpciones").innerHTML = actual.opciones.map((o, i) =>
    `<button class="opcion" data-i="${i}" aria-pressed="${i === 0}">${o.nombre}</button>`).join("");
  pintarExtras();
  abrirExtras(conExtras && !actual.agotado);
  $("#modalAgregar").disabled = !!actual.agotado;
  $("#modalAgregar").textContent = actual.agotado ? "Agotado por ahora" : "Agregar al carrito";
  $("#modalAgotado").hidden = !actual.agotado;
  $(".modal-caja").scrollTop = 0;
  $("#modal").classList.add("visible"); $("#capa").classList.add("visible");
  $("#cerrarModal").focus({ preventScroll: true });
}
function cerrarModal() {
  if (!$("#modal").classList.contains("visible")) return;
  $("#modal").classList.remove("visible");
  if (!$("#carrito").classList.contains("abierto")) $("#capa").classList.remove("visible");
  if (ultimoFoco) ultimoFoco.focus({ preventScroll: true });
}
$("#modalMiniaturas").addEventListener("click", e => {
  const b = e.target.closest("[data-foto]"); if (b) mostrarFoto(+b.dataset.foto);
});
$("#modalOpciones").addEventListener("click", e => {
  const b = e.target.closest(".opcion"); if (!b) return;
  opcionSel = +b.dataset.i;
  document.querySelectorAll(".opcion").forEach(o => o.setAttribute("aria-pressed", o === b));
  actualizarPrecioModal();
});
$("#modalAgregar").addEventListener("click", () => { agregar(actual, opcionSel, extrasSel); cerrarModal(); });
$("#cerrarModal").addEventListener("click", cerrarModal);
$("#modal").addEventListener("click", e => { if (e.target.id === "modal") cerrarModal(); });

/* Carrito */
function agregar(p, i, extras = {}) {
  const ex = Object.fromEntries(Object.entries(extras).filter(([, n]) => n > 0).sort());
  const firma = Object.entries(ex).map(([id, n]) => id + n).join("_");
  const clave = p.id + "-" + i + (firma ? "-" + firma : "");
  const existe = carrito.find(x => x.clave === clave);
  if (existe) existe.cantidad++;
  else carrito.push({ clave, id: p.id, opcion: i, extras: ex, cantidad: 1 });
  guardar(); pintarCarrito();
  aviso(firma ? `Agregado: ${p.nombre} con extras` : `Agregado: ${p.nombre}`);
}
/* Precio de una unidad (producto + sus extras, o creación personalizada) */
const precioUnidad = x => {
  if (x.creacion) return precioCreacion(x.creacion);
  const p = PRODUCTOS.find(q => q.id === x.id);
  return p.opciones[x.opcion].precio + costoExtras(x.extras);
};
/* Datos para mostrar cada línea del carrito */
function infoItem(x) {
  if (x.creacion) {
    const d = describirCreacion(x.creacion), t = crBuscar("tipos", x.creacion.tipo);
    return { nombre: t.carrito, detalle: d.flores, detalle2: d.presentacion,
      ext: textoExtras(x.creacion.extras), costoExt: costoExtras(x.creacion.extras),
      img: `<span class="item-svg item-real">${miniReal(x.creacion)}</span>`, idea: x.creacion.idea };
  }
  const p = PRODUCTOS.find(q => q.id === x.id), o = p.opciones[x.opcion];
  return { nombre: p.nombre, detalle: o.nombre, ext: textoExtras(x.extras), costoExt: costoExtras(x.extras),
    img: foto(p.imagenes[0], ""), agotado: !!p.agotado ||
      Object.keys(x.extras || {}).some(id => EXTRAS.find(e => e.id === id)?.agotado) };
}
const itemValido = x => x.creacion ? creacionValida(x.creacion)
  : (() => { const p = PRODUCTOS.find(q => q.id === x.id); return p && p.opciones[x.opcion]; })();
const ICONO_PAPELERA = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>';
let hayAgotados = false;
function pintarCarrito() {
  hayAgotados = false;
  let total = 0, unidades = 0;
  carrito = carrito.filter(itemValido);
  $("#carritoLista").innerHTML = carrito.length ? carrito.map(x => {
    const i = infoItem(x), sub = precioUnidad(x) * x.cantidad;
    total += sub; unidades += x.cantidad;
    if (i.agotado) hayAgotados = true;
    return `<li class="item${i.agotado ? " item-agotado" : ""}">
      <div class="item-img">${i.img}</div>
      <div class="item-cuerpo">
        <div class="item-cab">
          <h3>${i.nombre}</h3>
          <button class="item-quitar" data-quitar="${x.clave}" aria-label="Quitar ${i.nombre} del pedido">${ICONO_PAPELERA}</button>
        </div>
        <p class="item-detalle">${i.detalle}${i.detalle2 ? `<br>${i.detalle2}` : ""}</p>
        ${i.agotado ? `<p class="item-aviso">Se agotó. Quítalo para poder enviar tu pedido.</p>` : ""}
        ${i.ext ? `<p class="item-extras">+ ${i.ext} <span>(${usd(i.costoExt)} c/u)</span></p>` : ""}
        ${i.idea ? `<p class="item-idea">“${esc(i.idea)}”</p>` : ""}
        <div class="item-pie">
          <div class="cantidad" role="group" aria-label="Cantidad">
            <button data-menos="${x.clave}" aria-label="Quitar uno">−</button>
            <span aria-live="polite">${x.cantidad}</span>
            <button data-mas="${x.clave}" aria-label="Agregar uno">+</button>
          </div>
          <div class="item-precio"><strong>${usd(sub)}</strong>${tasa ? `<small>${bs(sub)}</small>` : ""}</div>
        </div>
      </div>
    </li>`;
  }).join("") : `<li class="carrito-vacio">
      <span class="vacio-icono" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 8h14l-1 12H6z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg></span>
      <strong>Tu carrito está vacío</strong>
      <span>Agrega unas flores o arma un ramo a tu gusto.</span>
      <div class="vacio-acciones">
        <a href="#productos" class="btn btn-principal" data-cerrar-carrito>Ver productos</a>
        <a href="#crea-tu-ramo" class="btn btn-borde" data-cerrar-carrito>Crea tu ramo</a>
      </div>
    </li>`;
  $("#carritoPie").hidden = !carrito.length;
  $("#carritoConteo").textContent = unidades ? `${unidades} ${unidades === 1 ? "producto" : "productos"}` : "";
  $("#total").textContent = usd(total);
  $("#totalBs").textContent = tasa ? bs(total) : "";
  const pago = dividirPago(total);
  $("#pagoCarrito").hidden = !carrito.length || PORCENTAJE_ABONO >= 100;
  document.querySelectorAll(".pct-abono").forEach(e => e.textContent = PORCENTAJE_ABONO);
  $("#abonoCarrito").innerHTML = montoHTML(pago.abono);
  $("#restoCarrito").innerHTML = montoHTML(pago.resto);
  if (typeof pintarMetodos === "function" && $("#metodosCarrito")) pintarMetodos(pago.abono);
  $("#contador").textContent = unidades;
  $("#contador").classList.toggle("vacio", unidades === 0);
  $("#enviarPedido").disabled = !carrito.length || hayAgotados;
  $("#enviarPedido").style.opacity = carrito.length && !hayAgotados ? 1 : .5;
  $("#avisoAgotado").hidden = !hayAgotados;
}
$("#carritoLista").addEventListener("click", e => {
  if (e.target.closest("[data-cerrar-carrito]")) return cerrarCarrito();
  const b = e.target.closest("button"); if (!b) return;
  const c = b.dataset;
  const x = carrito.find(i => i.clave === (c.mas || c.menos || c.quitar)); if (!x) return;
  if (c.mas) x.cantidad++;
  if (c.menos) x.cantidad--;
  if (c.quitar || x.cantidad < 1) carrito = carrito.filter(i => i !== x);
  guardar(); pintarCarrito();
});
/* En PC, la ventana flotante se ubica justo debajo del ícono de la bolsa */
function ubicarCarrito() {
  const c = $("#carrito");
  if (window.innerWidth <= 600) { c.style.top = c.style.right = ""; return; }
  const r = $("#abrirCarrito").getBoundingClientRect();
  const top = Math.max(12, r.bottom + 10);
  c.style.top = top + "px";
  c.style.setProperty("--carrito-top", top + "px");
  c.style.right = Math.max(12, window.innerWidth - r.right - 8) + "px";
}
window.addEventListener("resize", () => { if ($("#carrito").classList.contains("abierto")) ubicarCarrito(); });
function abrirCarrito() { ubicarCarrito(); $("#carrito").classList.add("abierto"); $("#carrito").setAttribute("aria-hidden", "false"); $("#capa").classList.add("visible"); $("#cerrarCarrito").focus({ preventScroll: true }); }
function cerrarCarrito() { $("#carrito").classList.remove("abierto"); $("#carrito").setAttribute("aria-hidden", "true"); if (!$("#modal").classList.contains("visible")) $("#capa").classList.remove("visible"); }
$("#abrirCarrito").addEventListener("click", abrirCarrito);
$("#cerrarCarrito").addEventListener("click", cerrarCarrito);
$("#capa").addEventListener("click", () => { cerrarCarrito(); cerrarModal(); });
document.addEventListener("keydown", e => { if (e.key === "Escape") { cerrarModal(); cerrarCarrito(); } });

/* =========================================================
   MÉTODOS DE PAGO (carrito y contacto)
   ========================================================= */
let metodoSel = METODOS_PAGO[0]?.id || null;
try { const m = localStorage.getItem("metodo-amara"); if (METODOS_PAGO.some(x => x.id === m)) metodoSel = m; } catch (e) {}
const metodoActual = () => METODOS_PAGO.find(m => m.id === metodoSel);
/* Monto en la moneda del método: "Bs. 8.665,60" o "$ 10,00" */
const montoMetodo = (m, n) => m.moneda === "Bs" && tasa ? bs(n) : usd(n);
/* Lo que se copia: "8665,60" (sin puntos de miles, como lo piden los bancos) */
const montoCopiar = (m, n) => (m.moneda === "Bs" && tasa ? n * tasa : n).toFixed(2).replace(".", ",");
const ICONO_COPIAR = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>';

const datosHTML = m => !m.datos.length ? "" : `<dl class="datos-pago">${m.datos.map(d => `
  <div><dt>${d.etiqueta}</dt><dd>${d.valor}</dd>
    <button class="btn-copiar" data-copiar="${d.copiar ?? d.valor}" aria-label="Copiar ${d.etiqueta}">${ICONO_COPIAR}<span>Copiar</span></button></div>`).join("")}</dl>`;

/* Texto que se copia con "Copiar todos los datos" */
const textoCopiarTodo = (m, monto) =>
  [m.nombre, ...m.datos.map(d => `${d.etiqueta}: ${d.copiar ?? d.valor}`)]
    .concat(monto !== undefined ? [`Monto: ${montoCopiar(m, monto)}`] : [])
    .join("\n");
const botonCopiarTodo = (m, monto) => !m.datos.length ? "" : `
  <button class="btn-copiar-todo" data-copiar="${textoCopiarTodo(m, monto).replace(/"/g, "&quot;")}">
    ${ICONO_COPIAR}<span>${monto !== undefined ? "Copiar todo con el monto" : "Copiar todos los datos"}</span>
  </button>`;

function pintarMetodos(abono) {
  const caja = $("#metodosCarrito");
  if (!METODOS_PAGO.length) { caja.hidden = true; return; }
  caja.hidden = !carrito.length;
  const m = metodoActual() || METODOS_PAGO[0];
  caja.innerHTML = `
    <span class="metodos-titulo">Método de pago</span>
    ${METODOS_PAGO.length > 1 ? `<div class="metodos-opciones" role="radiogroup" aria-label="Elige cómo pagar">
      ${METODOS_PAGO.map(x => `<button role="radio" aria-checked="${x.id === m.id}" data-metodo="${x.id}">${x.nombre}</button>`).join("")}
    </div>` : `<strong class="metodo-unico">${m.nombre}</strong>`}
    ${datosHTML(m)}
    <div class="monto-pagar">
      <span>Monto del abono${PORCENTAJE_ABONO >= 100 ? "" : ` (${PORCENTAJE_ABONO}%)`}<strong>${montoMetodo(m, abono)}</strong></span>
      ${m.datos.length ? `<button class="btn-copiar" data-copiar="${montoCopiar(m, abono)}" aria-label="Copiar monto">${ICONO_COPIAR}<span>Copiar</span></button>` : ""}
    </div>
    ${botonCopiarTodo(m, abono)}
    ${m.nota ? `<p class="metodos-nota">${m.nota}</p>` : ""}`;
}
function pintarMetodosContacto() {
  const c = $("#metodosContacto"); if (!c) return;
  c.innerHTML = `<ul class="metodos-lista">${METODOS_PAGO.map(m => `<li>${m.nombre}</li>`).join("")}</ul>`;
  c.closest(".dato").hidden = !METODOS_PAGO.length;
}
$("#metodosCarrito").addEventListener("click", e => {
  const b = e.target.closest("[data-metodo]"); if (!b) return;
  metodoSel = b.dataset.metodo;
  try { localStorage.setItem("metodo-amara", metodoSel); } catch (err) {}
  pintarCarrito();
  $(`[data-metodo="${metodoSel}"]`)?.focus({ preventScroll: true });
});

/* Copiar al portapapeles (cualquier botón con data-copiar) */
async function copiarTexto(t) {
  try { await navigator.clipboard.writeText(t); return true; }
  catch (e) {
    const a = document.createElement("textarea"); a.value = t; a.setAttribute("readonly", "");
    a.style.position = "fixed"; a.style.opacity = "0"; document.body.appendChild(a); a.select();
    let ok = false; try { ok = document.execCommand("copy"); } catch (err) {}
    a.remove(); return ok;
  }
}
document.addEventListener("click", async e => {
  const b = e.target.closest("[data-copiar]"); if (!b) return;
  const ok = await copiarTexto(b.dataset.copiar);
  const s = b.querySelector("span"); const antes = s.textContent;
  s.textContent = ok ? "¡Copiado!" : "No se pudo";
  b.classList.toggle("copiado", ok);
  if (ok && b.classList.contains("btn-copiar-todo")) aviso("Datos copiados. Pégalos en la app de tu banco.");
  setTimeout(() => { s.textContent = antes; b.classList.remove("copiado"); }, 1600);
});

/* =========================================================
   CREA TU RAMO
   ========================================================= */
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]));
const crBuscar = (lista, id) => CREADOR[lista].find(x => x.id === id);
/* "Rosa roja", "3 girasoles amarillos", "2 lirios azules" */
function nombreFlor(florId, colorId, n = 1) {
  const f = crBuscar("flores", florId), c = crBuscar("colores", colorId), plural = n > 1;
  let col = c.nombre;
  if (col.endsWith("o")) { if (f.genero === "f") col = col.slice(0, -1) + "a"; if (plural) col += "s"; }
  else if (!col.endsWith("a") && plural) col += "es";
  return `${plural ? (f.plural || f.nombre) : f.nombre} ${col}`;
}
const totalFlores = cfg => Object.values(cfg.flores || {}).reduce((a, b) => a + b, 0);
const costoFlores = cfg => Object.entries(cfg.flores || {}).reduce((s, [k, n]) => s + (crBuscar("flores", k.split("|")[0])?.precio || 0) * n, 0);
const precioCreacion = cfg => (crBuscar("tipos", cfg.tipo)?.precioBase || 0) + costoFlores(cfg) + costoExtras(cfg.extras);
function creacionValida(cfg) {
  const t = crBuscar("tipos", cfg?.tipo); if (!t) return false;
  const n = totalFlores(cfg);
  return n >= t.minFlores && n <= t.maxFlores &&
    Object.keys(cfg.flores).every(k => { const [f, c] = k.split("|"); return crBuscar("flores", f) && crBuscar("colores", c); });
}
function describirCreacion(cfg) {
  const flores = Object.entries(cfg.flores).map(([k, n]) => {
    const [f, c] = k.split("|"); return `${n} ${nombreFlor(f, c, n).toLowerCase()}`;
  }).join(", ");
  const partes = [];
  if (cfg.tipo === "ramo") partes.push(`Papel ${crBuscar("papeles", cfg.papel)?.nombre.toLowerCase()}`);
  if (cfg.lazo && cfg.tipo !== "maceta") partes.push(`${partes.length ? "lazo" : "Lazo"} ${crBuscar("lazos", cfg.lazo)?.nombre.toLowerCase()}`);
  if (cfg.tipo === "maceta") partes.push(`Maceta ${crBuscar("macetas", cfg.maceta)?.nombre.toLowerCase()}`);
  if (cfg.tipo === "suelta" && !partes.length) partes.push("Con tallo y hojas");
  return { flores, presentacion: partes.join(", ") };
}

/* ---------- Dibujo de la vista previa (SVG) ---------- */
function svgFlor(tipo, hex, x, y, r) {
  const borde = hex.toUpperCase() === "#F7F4EC" ? ' stroke="#CFC6B4" stroke-width="1"' : "";
  const petalos = (n, rx, ry, off) => Array.from({ length: n }, (_, i) =>
    `<ellipse cx="${x}" cy="${y - off}" rx="${rx}" ry="${ry}" fill="${hex}"${borde} transform="rotate(${i * 360 / n} ${x} ${y})"/>`).join("");
  switch (tipo) {
    case "girasol": return petalos(14, r * .22, r * .5, r * .55) + `<circle cx="${x}" cy="${y}" r="${r * .45}" fill="#5A3A22"/><circle cx="${x}" cy="${y}" r="${r * .25}" fill="none" stroke="#3E2716" stroke-width="${r * .08}"/>`;
    case "pequena": return petalos(6, r * .32, r * .42, r * .45) + `<circle cx="${x}" cy="${y}" r="${r * .3}" fill="#5A3A22"/>`;
    case "rosa": return `<circle cx="${x}" cy="${y}" r="${r * .85}" fill="${hex}"${borde}/>` +
      `<path d="M${x - r * .5} ${y}a${r * .5} ${r * .5} 0 1 1 ${r * .5} ${r * .5}M${x - r * .25} ${y}a${r * .25} ${r * .25} 0 1 1 ${r * .25} ${r * .25}" fill="none" stroke="rgba(0,0,0,.22)" stroke-width="${r * .1}" stroke-linecap="round"/>`;
    case "lirio": return petalos(6, r * .26, r * .62, r * .5) + `<circle cx="${x}" cy="${y}" r="${r * .18}" fill="${hex.toUpperCase() === "#F6C21C" ? "#E07B00" : "#F6C21C"}"/>`;
    case "tulipan": return `<path d="M${x - r * .6} ${y - r * .45}Q${x - r * .7} ${y + r * .6} ${x} ${y + r * .6}Q${x + r * .7} ${y + r * .6} ${x + r * .6} ${y - r * .45}L${x + r * .3} ${y - r * .1}L${x} ${y - r * .65}L${x - r * .3} ${y - r * .1}Z" fill="${hex}"${borde}/><path d="M${x} ${y - r * .65}L${x} ${y + r * .5}" stroke="rgba(0,0,0,.15)" stroke-width="${r * .08}"/>`;
  }
  return "";
}
/* ---------- Maqueta del ramo (SVG) ----------
   Dibuja exactamente lo que eligió el cliente: una flor por cada
   unidad, con su forma y su color, el papel, el lazo o la maceta.
   No hay azar: con las mismas opciones sale siempre el mismo dibujo. */

/* Lista de flores una por una, intercaladas para que se vean mezcladas.
   Devuelve tantas flores como pidió el cliente, ni una más ni una menos. */
function listaFlores(cfg, tope = Infinity) {
  const grupos = Object.entries(cfg.flores || {})
    .map(([k, n]) => { const [f, c] = k.split("|"); return { f, c, hex: crBuscar("colores", c)?.hex || "#CCC", n }; });
  const out = [];
  let quedan = grupos.reduce((a, g) => a + g.n, 0);
  while (out.length < Math.min(quedan + out.length, tope) && grupos.some(g => g.n > 0)) {
    for (const g of grupos) {
      if (g.n > 0 && out.length < tope) { out.push({ f: g.f, c: g.c, hex: g.hex, k: `${g.f}|${g.c}|${out.length}` }); g.n--; }
    }
  }
  return out;
}

/* Reparte n flores dentro de un óvalo, en espiral, de atrás hacia adelante */
function posiciones(n, cx, cy, rx, ry) {
  if (n === 1) return [[cx, cy]];
  const AUREO = Math.PI * (3 - Math.sqrt(5));
  return Array.from({ length: n }, (_, i) => {
    const d = Math.sqrt((i + 0.5) / n), a = i * AUREO;
    return [cx + rx * d * Math.cos(a), cy + ry * d * Math.sin(a)];
  }).sort((p, q) => p[1] - q[1]);          // los de abajo se dibujan al final: quedan al frente
}

/* Tamaño de cada flor según cuántas haya: muchas flores, flores más pequeñas */
const radioFlor = n => Math.max(9, Math.min(28, 74 / Math.sqrt(n + 1.2)));

const VERDE = "#4E8B3A", VERDE_OSC = "#3A6B2B";
let floresDibujadas = new Set();           // para animar solo las flores nuevas

function svgCreacion(cfg, animar = false) {
  const t = crBuscar("tipos", cfg.tipo);
  // Se dibuja TODO lo que lleva el cliente, aunque pase del máximo:
  // así ve de inmediato que le sobran flores. El tope solo evita
  // dibujos imposibles si algún día se sube mucho el límite.
  const fl = listaFlores(cfg, 60);
  const n = fl.length;
  const nuevas = new Set(fl.map(x => x.k));
  const esNueva = k => animar && !floresDibujadas.has(k);
  let s = "";

  const ramillete = (cx, cy, rx, ry, nudo, r) => {
    const P = posiciones(n, cx, cy, rx, ry);
    const tallos = P.map(([x, y]) =>
      `<path d="M${x.toFixed(1)} ${y.toFixed(1)}C${x.toFixed(1)} ${(y + (nudo[1] - y) * .55).toFixed(1)} ${nudo[0]} ${(y + (nudo[1] - y) * .5).toFixed(1)} ${nudo[0]} ${nudo[1]}" fill="none" stroke="${VERDE}" stroke-width="${Math.max(2, r * .16).toFixed(1)}" stroke-linecap="round"/>`).join("");
    const cabezas = P.map(([x, y], i) => {
      const g = fl[i];
      return `<g class="cr-flor${esNueva(g.k) ? " cr-nace" : ""}" style="--i:${i}">${svgFlor(g.f, g.hex, +x.toFixed(1), +y.toFixed(1), r)}</g>`;
    }).join("");
    return { tallos, cabezas };
  };

  if (cfg.tipo === "ramo") {
    const papel = crBuscar("papeles", cfg.papel)?.hex || "#F4F1EA";
    const lazo = crBuscar("lazos", cfg.lazo)?.hex || "#A99BE6";
    const r = radioFlor(n);
    // El ramillete crece con la cantidad, pero siempre queda sobre el papel
    const arriba = 22 + r * .6, abajo = 142 - r * .6, cy = (arriba + abajo) / 2;
    const ry = Math.min((abajo - arriba) / 2, 10 + n * 4.5);
    const rx = Math.min(86 - r * .5, 20 + n * 6);
    const { tallos, cabezas } = ramillete(120, cy, rx, ry, [120, 150], r);
    // papel de atrás
    s += `<path d="M34 118Q120 58 206 118L120 150Z" fill="${papel}" stroke="rgba(0,0,0,.14)" stroke-linejoin="round"/>`;
    // follaje: sale por los lados del ramillete
    if (n) s += [[-1,-.1],[1,-.1],[-.72,-.78],[.72,-.78],[0,-1.05]]
      .map(([fx, fy], i) => {
        const x = +Math.max(20, Math.min(220, 120 + fx * (rx + 9))).toFixed(1);
        const y = +Math.max(30, cy + fy * (ry + 9)).toFixed(1);
        return `<ellipse cx="${x}" cy="${y}" rx="8.5" ry="24" fill="${i % 2 ? VERDE : VERDE_OSC}" transform="rotate(${Math.round(fx * 26)} ${x} ${y})"/>`;
      }).join("");
    else s += `<ellipse cx="120" cy="86" rx="52" ry="40" fill="none" stroke="#C9C2B6" stroke-dasharray="7 7"/>`;
    s += tallos + cabezas;
    // cono de papel al frente
    s += `<path d="M40 112L120 148L200 112L176 126L120 232L64 126Z" fill="${papel}" stroke="rgba(0,0,0,.16)" stroke-linejoin="round"/>`;
    s += `<path d="M64 126L120 232L176 126" fill="none" stroke="rgba(0,0,0,.10)"/>`;
    s += `<path d="M120 150L120 232" stroke="rgba(0,0,0,.07)"/>`;
    // lazo
    s += `<path d="M120 178l-28-13v26zM120 178l28-13v26z" fill="${lazo}" stroke="rgba(0,0,0,.2)" stroke-linejoin="round"/>`;
    s += `<path d="M120 178l-11 32M120 178l11 32" stroke="${lazo}" stroke-width="6" stroke-linecap="round"/>`;
    s += `<circle cx="120" cy="178" r="6.5" fill="${lazo}" stroke="rgba(0,0,0,.22)"/>`;
  } else if (cfg.tipo === "maceta") {
    const mac = crBuscar("macetas", cfg.maceta)?.hex || "#6B4A32";
    const r = radioFlor(n) * .9;
    const ry = Math.min(36, 8 + n * 7), rx = Math.min(56, 12 + n * 9);
    const { tallos, cabezas } = ramillete(120, 96 - ry * .6, rx, ry, [120, 158], r);
    s += [[90,128,-38],[150,128,38]].map(([x, y, a], i) => `<ellipse cx="${x}" cy="${y}" rx="9" ry="22" fill="${i ? VERDE : VERDE_OSC}" transform="rotate(${a} ${x} ${y})"/>`).join("");
    if (!n) s += `<ellipse cx="120" cy="86" rx="40" ry="32" fill="none" stroke="#C9C2B6" stroke-dasharray="7 7"/>`;
    s += tallos + cabezas;
    s += `<path d="M78 162H162L152 226H88Z" fill="${mac}" stroke="rgba(0,0,0,.2)" stroke-linejoin="round"/>`;
    s += [92,104,116,128,140,152].map(x => `<path d="M${x} 164L${(x + (x - 120) * -.08).toFixed(1)} 224" stroke="rgba(0,0,0,.12)" stroke-width="2"/>`).join("");
    s += `<rect x="74" y="154" width="92" height="13" rx="4" fill="${mac}" stroke="rgba(0,0,0,.22)"/>`;
  } else {
    const lazo = crBuscar("lazos", cfg.lazo)?.hex || "#A99BE6";
    s += `<ellipse cx="101" cy="172" rx="10" ry="28" fill="${VERDE_OSC}" transform="rotate(-45 101 172)"/><ellipse cx="139" cy="152" rx="10" ry="28" fill="${VERDE}" transform="rotate(45 139 152)"/>`;
    if (n > 1) {                      // si agregó de más, se ven todas las flores
      const r = radioFlor(n);
      const ry = Math.min(44, 10 + n * 5), rx = Math.min(70, 18 + n * 7);
      const { tallos, cabezas } = ramillete(120, 96 - ry * .4, rx, ry, [120, 170], r);
      s += tallos + cabezas;
    } else {
      const g = fl[0];
      s += `<path d="M120 228V96" stroke="${VERDE}" stroke-width="6" stroke-linecap="round"/>`;
      s += g
        ? `<g class="cr-flor${esNueva(g.k) ? " cr-nace" : ""}" style="--i:0">${svgFlor(g.f, g.hex, 120, 76, 42)}</g>`
        : `<circle cx="120" cy="76" r="30" fill="none" stroke="#C9C2B6" stroke-dasharray="6 6"/>`;
    }
    s += `<path d="M120 198l-18-9v18zM120 198l18-9v18z" fill="${lazo}" stroke="rgba(0,0,0,.2)"/><circle cx="120" cy="198" r="5" fill="${lazo}"/>`;
  }
  if (animar) floresDibujadas = nuevas;
  return `<svg class="cr-maqueta" viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Así quedaría tu ${t?.nombre.toLowerCase() || "pedido"}">${s}</svg>`;
}

const EJEMPLO_CREACION = { tipo:"ramo", papel:"lavanda", lazo:"blanco", flores:{ "girasol|amarillo":3, "rosa|rojo":3, "pequena|blanco":3, "tulipan|rosado":2 }, extras:{} };

/* ---------- Estado e interfaz del creador ---------- */
let cr = { tipo:"ramo", flor:"girasol", color:"amarillo", flores:{}, papel:"blanco", lazo:"lavanda", maceta:"cafe", extras:{} };

const chip = (attr, item, activo, extra = "") =>
  `<button class="cr-chip${item.hex ? " cr-chip-color" : ""}" role="radio" aria-checked="${activo}" data-${attr}="${item.id}">${item.hex ? `<i style="background:${item.hex}"></i>` : ""}${item.nombre}${extra}</button>`;

/* Foto de una flor en el color elegido (o la foto general si ese color no tiene) */
function fotoFlor(florId, colorId) {
  const f = crBuscar("flores", florId);
  return (f?.fotosPorColor && f.fotosPorColor[colorId]) || f?.imagen || "";
}
/* Precarga las fotos por color para que cambien al instante al elegir un color */
CREADOR.flores.forEach(f => Object.values(f.fotosPorColor || {}).forEach(src => { const im = new Image(); im.src = src; }));

function muestraFlor(florId, colorId) {
  const c = crBuscar("colores", colorId), foto = fotoFlor(florId, colorId);
  return foto
    ? `<span class="cr-muestra cr-muestra-foto"><img src="${foto}" alt=""><i style="background:${c.hex}"></i></span>`
    : `<span class="cr-muestra"><svg viewBox="0 0 60 60">${svgFlor(florId, c.hex, 30, 30, 26)}</svg></span>`;
}
/* ---------- Vista previa del creador ----------
   Muestra la maqueta de lo que lleva armado el cliente y, debajo,
   una ficha por cada flor con su foto, su color y su cantidad. */

/* ========================================================================
   MAQUETA 3D — Vista previa realista con Three.js
   Se carga solo la primera vez que el cliente abre el creador.
   Si el navegador no soporta WebGL, se usa la maqueta SVG de respaldo.
   ======================================================================== */
const THREE_CDN = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
let _3dReady = false, _3dFailed = false, _3dLoading = false;
let _bouquet = null;

function cargarThree() {
  if (_3dReady || _3dLoading) return Promise.resolve();
  _3dLoading = true;
  return new Promise((res, rej) => {
    if (window.THREE) { _3dReady = true; _3dLoading = false; return res(); }
    const s = document.createElement("script");
    s.src = THREE_CDN;
    s.onload = () => { _3dReady = true; _3dLoading = false; res(); };
    s.onerror = () => { _3dFailed = true; _3dLoading = false; rej(); };
    document.head.appendChild(s);
  });
}

/* Clase que maneja la escena 3D dentro del contenedor del preview */
class Bouquet3D {
  constructor(container) {
    this.el = container;
    this.texCache = {};
    this.disposed = false;
    this.rotY = 0;
    this.dragging = false;
    this.lastX = 0;
    this.targetRot = 0;
    this.init();
  }

  init() {
    const T = window.THREE;
    const W = this.el.clientWidth || 320;
    const H = W;

    this.scene = new T.Scene();

    this.camera = new T.PerspectiveCamera(32, 1, 0.1, 100);
    this.camera.position.set(0, 2.8, 9.5);
    this.camera.lookAt(0, 1.2, 0);

    this.renderer = new T.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(W, H);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.sortObjects = true;
    const cv = this.renderer.domElement;
    cv.style.display = "block";
    cv.style.width = "100%";
    cv.style.height = "auto";
    cv.style.borderRadius = "14px";
    cv.style.touchAction = "pan-y";
    this.el.appendChild(cv);

    // Luces
    this.scene.add(new T.AmbientLight(0xffffff, 0.72));
    const dir = new T.DirectionalLight(0xffffff, 0.65);
    dir.position.set(4, 6, 5);
    this.scene.add(dir);
    const rim = new T.DirectionalLight(0xeee8dd, 0.3);
    rim.position.set(-3, 2, -4);
    this.scene.add(rim);

    // Grupo del ramo
    this.group = new T.Group();
    this.scene.add(this.group);

    this.setupDrag(cv);
    this.tick();
  }

  setupDrag(cv) {
    let startRot = 0;
    cv.addEventListener("pointerdown", e => {
      if (e.pointerType === "touch" && e.isPrimary === false) return;
      this.dragging = true; this.lastX = e.clientX; startRot = this.rotY;
      cv.setPointerCapture(e.pointerId);
    });
    cv.addEventListener("pointermove", e => {
      if (!this.dragging) return;
      this.rotY = startRot + (e.clientX - this.lastX) * 0.012;
    });
    cv.addEventListener("pointerup", () => { this.dragging = false; });
    cv.addEventListener("pointercancel", () => { this.dragging = false; });
  }

  tick() {
    if (this.disposed) return;
    requestAnimationFrame(() => this.tick());
    if (!this.dragging) this.rotY += 0.004;
    this.group.rotation.y += (this.rotY - this.group.rotation.y) * 0.12;
    this.renderer.render(this.scene, this.camera);
  }

  resize() {
    const W = this.el.clientWidth || 320;
    this.renderer.setSize(W, W);
  }

  dispose() {
    this.disposed = true;
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }

  /* --- Materiales y texturas --- */
  matColor(hex) {
    return new THREE.MeshLambertMaterial({ color: new THREE.Color(hex) });
  }

  loadTex(url) {
    if (this.texCache[url]) return this.texCache[url];
    const tex = new THREE.TextureLoader().load(url);
    tex.encoding = THREE.sRGBEncoding || 3001;
    this.texCache[url] = tex;
    return tex;
  }

  /* --- Construir la escena --- */
  update(cfg) {
    const T = window.THREE;
    // Limpiar
    while (this.group.children.length) {
      const c = this.group.children[0];
      this.group.remove(c);
      c.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material) { if (o.material.map) o.material.map.dispose(); o.material.dispose(); } });
    }

    const fl = listaFlores(cfg, 60);
    const n = fl.length;

    if (cfg.tipo === "ramo") this.buildRamo(cfg, fl, n);
    else if (cfg.tipo === "maceta") this.buildMaceta(cfg, fl, n);
    else this.buildSuelta(cfg, fl, n);
  }

  /* Posiciones en domo (espiral de Fibonacci) */
  domePositions(n, rx, ry, rz, cy) {
    if (n === 0) return [];
    if (n === 1) return [[0, cy + ry * 0.3, 0]];
    const PHI = Math.PI * (3 - Math.sqrt(5));
    const pts = [];
    for (let i = 0; i < n; i++) {
      const t = (i + 0.5) / n;
      const d = Math.sqrt(t);
      const a = i * PHI;
      pts.push([rx * d * Math.cos(a), cy + ry * (1 - t * 0.7), rz * d * Math.sin(a)]);
    }
    return pts.sort((a, b) => a[2] - b[2]);
  }

  addFlowerSprite(f, x, y, z, scale) {
    const T = window.THREE;
    const foto = fotoFlor(f.f, f.c);
    let mat;
    if (foto) {
      const tex = this.loadTex(foto);
      mat = new T.SpriteMaterial({ map: tex, depthWrite: false });
    } else {
      const canvas = document.createElement("canvas");
      canvas.width = 64; canvas.height = 64;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = f.hex; ctx.beginPath(); ctx.arc(32, 32, 30, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,.2)"; ctx.lineWidth = 2; ctx.stroke();
      const tex = new T.CanvasTexture(canvas);
      mat = new T.SpriteMaterial({ map: tex });
    }
    const sprite = new T.Sprite(mat);
    sprite.position.set(x, y, z);
    sprite.scale.set(scale, scale, 1);
    this.group.add(sprite);
    return sprite;
  }

  addStem(x1, y1, z1, x2, y2, z2) {
    const T = window.THREE;
    const dx = x2 - x1, dy = y2 - y1, dz = z2 - z1;
    const len = Math.sqrt(dx * dx + dy * dy + dz * dz);
    const geo = new T.CylinderGeometry(0.035, 0.04, len, 6);
    const mat = new T.MeshLambertMaterial({ color: 0x4E8B3A });
    const mesh = new T.Mesh(geo, mat);
    mesh.position.set((x1 + x2) / 2, (y1 + y2) / 2, (z1 + z2) / 2);
    mesh.lookAt(x2, y2, z2);
    mesh.rotateX(Math.PI / 2);
    this.group.add(mesh);
  }

  addLeaf(x, y, z, rot) {
    const T = window.THREE;
    const shape = new T.Shape();
    shape.moveTo(0, 0); shape.quadraticCurveTo(0.15, 0.4, 0, 0.7);
    shape.quadraticCurveTo(-0.15, 0.4, 0, 0);
    const geo = new T.ShapeGeometry(shape);
    const mat = new T.MeshLambertMaterial({ color: 0x4E8B3A, side: T.DoubleSide });
    const mesh = new T.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    mesh.rotation.set(0, rot, (Math.random() - 0.5) * 0.4 - 0.2);
    mesh.scale.set(0.7, 0.7, 0.7);
    this.group.add(mesh);
  }

  buildRamo(cfg, fl, n) {
    const T = window.THREE;
    const papelHex = crBuscar("papeles", cfg.papel)?.hex || "#F4F1EA";
    const lazoHex = crBuscar("lazos", cfg.lazo)?.hex || "#A99BE6";

    // Cono del papel (apunta hacia abajo)
    const coneGeo = new T.CylinderGeometry(0.1, 2.4, 4.8, 32, 1, true);
    const coneMat = new T.MeshLambertMaterial({ color: papelHex, side: T.DoubleSide });
    const cone = new T.Mesh(coneGeo, coneMat);
    cone.position.y = -1.0;
    this.group.add(cone);

    // Borde superior del cono
    const rimGeo = new T.TorusGeometry(2.4, 0.06, 8, 32);
    const rimMat = new T.MeshLambertMaterial({ color: papelHex });
    const rim = new T.Mesh(rimGeo, rimMat);
    rim.position.y = 1.4;
    rim.rotation.x = Math.PI / 2;
    this.group.add(rim);

    // Lazo
    const bowMat = new T.MeshLambertMaterial({ color: lazoHex });
    const bowL = new T.Mesh(new T.SphereGeometry(0.28, 12, 12), bowMat);
    bowL.position.set(-0.35, 0.1, 0);
    bowL.scale.set(1.2, 0.8, 0.6);
    this.group.add(bowL);
    const bowR = new T.Mesh(new T.SphereGeometry(0.28, 12, 12), bowMat);
    bowR.position.set(0.35, 0.1, 0);
    bowR.scale.set(1.2, 0.8, 0.6);
    this.group.add(bowR);
    const bowC = new T.Mesh(new T.SphereGeometry(0.14, 8, 8), bowMat);
    bowC.position.set(0, 0.1, 0);
    this.group.add(bowC);
    // Cintas del lazo
    const ribGeo = new T.CylinderGeometry(0.04, 0.03, 1.2, 6);
    for (const sx of [-1, 1]) {
      const rib = new T.Mesh(ribGeo, bowMat);
      rib.position.set(sx * 0.12, -0.5, 0);
      rib.rotation.z = sx * 0.25;
      this.group.add(rib);
    }

    if (!n) return;

    // Flores
    const flowerSize = Math.max(0.55, Math.min(1.6, 4.2 / Math.sqrt(n + 0.8)));
    const spread = Math.min(2.0, 0.5 + n * 0.12);
    const pts = this.domePositions(n, spread, 1.5, spread, 1.8);

    // Hojas entre las flores
    for (let i = 0; i < Math.min(n, 8); i++) {
      const a = i * Math.PI * 2 / Math.min(n, 8);
      this.addLeaf(Math.cos(a) * (spread + 0.3), 1.6 + Math.random() * 0.5, Math.sin(a) * (spread + 0.3), a + Math.PI);
    }

    // Tallos y flores
    pts.forEach((p, i) => {
      const f = fl[i];
      if (!f) return;
      this.addStem(p[0] * 0.2, 0.3, p[2] * 0.2, p[0], p[1] - flowerSize * 0.4, p[2]);
      this.addFlowerSprite(f, p[0], p[1], p[2], flowerSize);
    });
  }

  buildMaceta(cfg, fl, n) {
    const T = window.THREE;
    const macHex = crBuscar("macetas", cfg.maceta)?.hex || "#6B4A32";

    // Maceta
    const potGeo = new T.CylinderGeometry(1.2, 0.8, 1.8, 32);
    const potMat = new T.MeshLambertMaterial({ color: macHex });
    const pot = new T.Mesh(potGeo, potMat);
    pot.position.y = -1.5;
    this.group.add(pot);
    // Borde de la maceta
    const brimGeo = new T.CylinderGeometry(1.35, 1.2, 0.3, 32);
    const brim = new T.Mesh(brimGeo, potMat);
    brim.position.y = -0.45;
    this.group.add(brim);

    if (!n) return;

    const flowerSize = Math.max(0.7, Math.min(1.5, 3.8 / Math.sqrt(n + 0.5)));
    const spread = Math.min(1.3, 0.3 + n * 0.18);
    const pts = this.domePositions(n, spread, 1.2, spread, 0.6);

    for (let i = 0; i < Math.min(n, 5); i++) {
      const a = i * Math.PI * 2 / Math.min(n, 5);
      this.addLeaf(Math.cos(a) * (spread + 0.2), 0.4, Math.sin(a) * (spread + 0.2), a + Math.PI);
    }

    pts.forEach((p, i) => {
      const f = fl[i]; if (!f) return;
      this.addStem(p[0] * 0.15, -0.3, p[2] * 0.15, p[0], p[1] - flowerSize * 0.35, p[2]);
      this.addFlowerSprite(f, p[0], p[1], p[2], flowerSize);
    });
  }

  buildSuelta(cfg, fl, n) {
    const T = window.THREE;
    const lazoHex = crBuscar("lazos", cfg.lazo)?.hex || "#A99BE6";

    // Tallo principal
    const stemGeo = new T.CylinderGeometry(0.06, 0.06, 5, 8);
    const stemMat = new T.MeshLambertMaterial({ color: 0x4E8B3A });
    const stem = new T.Mesh(stemGeo, stemMat);
    stem.position.y = -0.5;
    this.group.add(stem);

    // Hojas
    this.addLeaf(-0.4, -0.8, 0, -0.4);
    this.addLeaf(0.4, 0.0, 0, 0.4);

    // Lazo pequeño
    const bowMat = new T.MeshLambertMaterial({ color: lazoHex });
    for (const sx of [-1, 1]) {
      const b = new T.Mesh(new T.SphereGeometry(0.16, 8, 8), bowMat);
      b.position.set(sx * 0.22, -1.4, 0);
      b.scale.set(1.2, 0.7, 0.5);
      this.group.add(b);
    }

    if (!n) return;
    const f = fl[0];
    this.addFlowerSprite(f, 0, 2.3, 0, 2.0);
  }
}

/* Inicializa o actualiza el visor 3D. Devuelve true si está activo, false si hay que usar SVG. */
function actualizar3D(cfg) {
  const container = $("#crPreview");
  if (!container || !_3dReady || _3dFailed) return false;
  try {
    if (!_bouquet) {
      container.innerHTML = "";
      _bouquet = new Bouquet3D(container);
    }
    _bouquet.update(cfg);
    return true;
  } catch (e) {
    console.warn("3D no disponible:", e);
    _3dFailed = true;
    if (_bouquet) { _bouquet.dispose(); _bouquet = null; }
    return false;
  }
}

/* Etiquetas flotantes sobre el canvas 3D */
function etiquetas3D(cfg) {
  const t = crBuscar("tipos", cfg.tipo), n = totalFlores(cfg);
  const flores = Object.entries(cfg.flores || {});
  const max = 8, extra = flores.length - max;
  const fichas = flores.slice(0, max).map(([k, q]) => {
    const [f, c] = k.split("|"), co = crBuscar("colores", c), foto = fotoFlor(f, c);
    const cara = foto ? `<img src="${foto}" alt="" loading="lazy">` : `<svg viewBox="0 0 60 60">${svgFlor(f, co.hex, 30, 30, 26)}</svg>`;
    return `<span class="mq-ficha" title="${q} ${nombreFlor(f, c, q).toLowerCase()}">${cara}<i style="background:${co.hex}"></i><b>${q}</b></span>`;
  }).join("") + (extra > 0 ? `<span class="mq-ficha mq-mas">+${extra}</span>` : "");
  let pres = "";
  if (cfg.tipo === "ramo") { const pa = crBuscar("papeles", cfg.papel); if (pa) pres = `<i style="background:${pa.hex}"></i>Papel ${pa.nombre.toLowerCase()}`; }
  if (cfg.tipo === "maceta") { const ma = crBuscar("macetas", cfg.maceta); if (ma) pres = `<i style="background:${ma.hex}"></i>Maceta ${ma.nombre.toLowerCase()}`; }
  return `<div class="mq3d-overlay">
    <span class="mq-etiqueta">Vista 3D · Arrastra para girar</span>
    ${pres ? `<span class="mq-pres">${pres}</span>` : ""}
    <span class="mq-cuenta">${n} ${n === 1 ? "flor" : "flores"}</span>
  </div><div class="mq-fichas">${fichas || `<span class="mq-vacio">Elige una flor y un color, y toca "Agregar".</span>`}</div>`;
}


function vistaReal(cfg) {
  /* Si Three.js ya cargó, actualiza el canvas 3D y devuelve las etiquetas */
  if (_3dReady && !_3dFailed && typeof Bouquet3D !== "undefined" && actualizar3D(cfg)) {
    return `<div class="mq mq-3d">${etiquetas3D(cfg)}</div>`;
  }
  /* Respaldo: maqueta SVG plana */
  const t = crBuscar("tipos", cfg.tipo), n = totalFlores(cfg);
  const flores = Object.entries(cfg.flores || {});
  const max = 8, extra = flores.length - max;
  const fichas = flores.slice(0, max).map(([k, q]) => {
    const [f, c] = k.split("|"), co = crBuscar("colores", c), foto = fotoFlor(f, c);
    const cara = foto ? `<img src="${foto}" alt="" loading="lazy">` : `<svg viewBox="0 0 60 60">${svgFlor(f, co.hex, 30, 30, 26)}</svg>`;
    return `<span class="mq-ficha" title="${q} ${nombreFlor(f, c, q).toLowerCase()}">${cara}<i style="background:${co.hex}"></i><b>${q}</b></span>`;
  }).join("") + (extra > 0 ? `<span class="mq-ficha mq-mas">+${extra}</span>` : "");
  let pres = "";
  if (cfg.tipo === "ramo") { const pa = crBuscar("papeles", cfg.papel); if (pa) pres = `<i style="background:${pa.hex}"></i>Papel ${pa.nombre.toLowerCase()}`; }
  if (cfg.tipo === "maceta") { const ma = crBuscar("macetas", cfg.maceta); if (ma) pres = `<i style="background:${ma.hex}"></i>Maceta ${ma.nombre.toLowerCase()}`; }
  return `<div class="mq">
    <div class="mq-lienzo">${svgCreacion(cfg, true)}</div>
    <span class="mq-etiqueta">Así va quedando</span>
    ${pres ? `<span class="mq-pres">${pres}</span>` : ""}
    <span class="mq-cuenta">${n} ${n === 1 ? "flor" : "flores"}</span>
    <div class="mq-fichas">${fichas || `<span class="mq-vacio">Elige una flor y un color, y toca \u201CAgregar\u201D.</span>`}</div>
  </div>`;
}
/* Miniatura (carrito y barra del celular) */
function miniReal(cfg) {
  return `<span class="mq-mini">${svgCreacion(cfg)}</span>`;
}

/* Estilos de la maqueta (se agregan solos, no hay que tocar el CSS) */
(function estilosMaqueta() {
  if (document.getElementById("estilos-maqueta")) return;
  const e = document.createElement("style");
  e.id = "estilos-maqueta";
  e.textContent = `
    .mq { position: relative; }
    .mq-lienzo { border-radius: 14px; overflow: hidden; background: linear-gradient(180deg, rgba(127,127,127,.07), rgba(127,127,127,.13)); }
    .mq-lienzo svg { display: block; width: 100%; height: auto; }
    .mq-etiqueta, .mq-pres, .mq-cuenta {
      position: absolute; display: inline-flex; align-items: center; gap: 6px;
      padding: 4px 10px; border-radius: 999px; font-size: .72rem; font-weight: 600;
      background: rgba(255,255,255,.92); color: #333; box-shadow: 0 1px 4px rgba(0,0,0,.14);
    }
    .mq-etiqueta { top: 10px; left: 10px; }
    .mq-pres { top: 10px; right: 10px; }
    .mq-cuenta { left: 10px; bottom: 10px; }
    .mq-pres i { width: 11px; height: 11px; border-radius: 50%; border: 1px solid rgba(0,0,0,.2); }
    .mq-fichas { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
    .mq-ficha { position: relative; width: 42px; height: 42px; border-radius: 50%; overflow: visible; }
    .mq-ficha > img, .mq-ficha > svg { width: 42px; height: 42px; border-radius: 50%; object-fit: cover; display: block; border: 1px solid rgba(127,127,127,.3); }
    .mq-ficha > i { position: absolute; left: -1px; bottom: -1px; width: 13px; height: 13px; border-radius: 50%; border: 2px solid #fff; }
    .mq-ficha > b { position: absolute; right: -4px; top: -4px; min-width: 18px; height: 18px; padding: 0 4px; border-radius: 9px;
      background: #2B2730; color: #fff; font-size: .68rem; line-height: 18px; text-align: center; }
    .mq-mas { display: flex; align-items: center; justify-content: center; border: 1px dashed rgba(127,127,127,.5); font-size: .78rem; font-weight: 600; }
    .mq-vacio { font-size: .82rem; opacity: .7; }
    .mq-mini { display: block; width: 100%; }
    .mq-mini svg { display: block; width: 100%; height: auto; }
    /* Vista 3D */
    .mq-3d { position: relative; }
    .mq3d-overlay { position: absolute; top: 0; left: 0; right: 0; display: flex; flex-wrap: wrap; justify-content: space-between; padding: 10px; pointer-events: none; z-index: 2; }
    .mq3d-overlay .mq-etiqueta, .mq3d-overlay .mq-pres, .mq3d-overlay .mq-cuenta { position: static; pointer-events: auto; }
    .mq-3d .mq-cuenta { position: absolute; left: 10px; bottom: 10px; z-index: 2; }
    .mq-3d .mq-fichas { margin-top: 12px; }
    /* Cada flor nueva aparece creciendo */
    .cr-flor { transform-box: fill-box; transform-origin: center; }
    .cr-nace { animation: mqNace .42s cubic-bezier(.2,.9,.3,1.35) both; animation-delay: calc(var(--i, 0) * 18ms); }
    @keyframes mqNace { from { opacity: 0; transform: scale(.25); } to { opacity: 1; transform: scale(1); } }
    @media (prefers-reduced-motion: reduce) { .cr-nace { animation: none; } }
  `;
  document.head.appendChild(e);
})();

function pintarCreador() {
  if (!$("#crTipos")) return;
  /* Carga Three.js en segundo plano la primera vez */
  if (!_3dReady && !_3dFailed && !_3dLoading) {
    cargarThree().then(() => {
      if ($("#crPreview")) { _bouquet = null; $("#crPreview").innerHTML = ""; $("#crPreview").innerHTML = vistaReal(cr); }
    }).catch(() => {});
  }
  const t = crBuscar("tipos", cr.tipo), n = totalFlores(cr);
  // 1. Tipo
  $("#crTipos").innerHTML = CREADOR.tipos.map(x => `
    <button class="cr-tipo" role="radio" aria-checked="${x.id === cr.tipo}" data-cr-tipo="${x.id}">
      <span class="cr-tipo-arte${x.imagen ? " cr-tipo-foto" : ""}" aria-hidden="true">${x.imagen ? `<img src="${x.imagen}" alt="" loading="lazy">` : svgCreacion({ ...EJEMPLO_CREACION, tipo: x.id, maceta: "cafe", flores: x.id === "ramo" ? { "girasol|amarillo": 5 } : x.id === "maceta" ? { "girasol|amarillo": 3 } : { "lirio|azul": 1 } })}</span>
      <strong>${x.nombre}</strong><small>${x.detalle}</small>
      <small class="cr-desde">${x.precioBase ? `Base ${usd(x.precioBase)}` : "Sin costo base"}</small>
    </button>`).join("");
  // 2. Flores
  $("#crFlorTipo").innerHTML = CREADOR.flores.map(f => `
    <button class="cr-chip cr-chip-flor" role="radio" aria-checked="${f.id === cr.flor}" data-cr-flor="${f.id}">
      ${fotoFlor(f.id, cr.color) ? `<img src="${fotoFlor(f.id, cr.color)}" alt="">` : `<svg viewBox="0 0 60 60" aria-hidden="true">${svgFlor(f.id, crBuscar("colores", cr.color).hex, 30, 30, 26)}</svg>`}
      ${f.nombre} <small>${usd(f.precio)}</small>
    </button>`).join("");
  $("#crFlorColor").innerHTML = CREADOR.colores.map(c => chip("cr-color", c, c.id === cr.color)).join("");
  const fSel = crBuscar("flores", cr.flor), cSel = crBuscar("colores", cr.color);
  const lleno = n >= t.maxFlores;
  $("#crAnadir").disabled = lleno;
  $("#crAnadir").innerHTML = `${muestraFlor(cr.flor, cr.color)} Agregar ${nombreFlor(cr.flor, cr.color)}`;
  const claves = Object.keys(cr.flores);
  $("#crLista").innerHTML = claves.length ? claves.map(k => {
    const [f, c] = k.split("|"), fl = crBuscar("flores", f), co = crBuscar("colores", c), q = cr.flores[k];
    return `<li class="cr-linea">
      ${muestraFlor(f, c)}
      <span class="cr-linea-txt"><strong>${nombreFlor(f, c)}</strong><small>${usd(fl.precio)} c/u · ${usd(fl.precio * q)}</small></span>
      <span class="cantidad">
        <button data-cr-menos="${k}" aria-label="Quitar ${nombreFlor(f, c)}">−</button><span>${q}</span>
        <button data-cr-mas="${k}" aria-label="Agregar ${nombreFlor(f, c)}" ${lleno ? "disabled" : ""}>+</button>
      </span></li>`;
  }).join("") : `<li class="cr-vacio">Aún no has agregado flores. Elige una flor y un color, y toca “Agregar”.</li>`;
  $("#crContador").textContent = t.maxFlores === 1 ? `${n} de 1 flor` : `${n} de ${t.maxFlores} flores máximo`;
  // 3. Presentación
  let pres = "";
  if (cr.tipo === "ramo") pres += `<span class="cr-sub">Papel</span><div class="cr-chips" role="radiogroup" aria-label="Papel">${CREADOR.papeles.map(x => chip("cr-papel", x, x.id === cr.papel)).join("")}</div>`;
  if (cr.tipo === "maceta") pres += `<span class="cr-sub">Color de la maceta</span><div class="cr-chips" role="radiogroup" aria-label="Maceta">${CREADOR.macetas.map(x => chip("cr-maceta", x, x.id === cr.maceta)).join("")}</div>`;
  if (CREADOR.elegirLazo && cr.tipo !== "maceta") pres += `<span class="cr-sub">Lazo</span><div class="cr-chips" role="radiogroup" aria-label="Lazo">${CREADOR.lazos.map(x => chip("cr-lazo", x, x.id === cr.lazo)).join("")}</div>`;
  if (!pres) pres = `<p class="cr-sin-opciones">La flor individual va con su tallo y hojas. No necesitas elegir presentación.</p>`;
  $("#crPresentacion").innerHTML = pres;
  // 4. Extras
  $("#crExtras").innerHTML = EXTRAS.filter(e => CREADOR.extras.includes(e.id)).map(e => {
    const q = cr.extras[e.id] || 0;
    if (e.agotado) return `<li class="extra extra-agotado">${miniExtra(e)}<div class="extra-info"><strong>${e.nombre}</strong><small>Agotado por ahora</small></div></li>`;
    return `<li class="extra${q ? " activo" : ""}">${miniExtra(e)}<div class="extra-info"><strong>${e.nombre}</strong>${e.detalle ? `<small>${e.detalle}</small>` : ""}
      <span class="extra-precio">+ ${usd(e.precio)}${tasa ? ` · ${bs(e.precio)}` : ""}</span></div>
      <div class="cantidad"><button data-cr-extra-menos="${e.id}" aria-label="Quitar ${e.nombre}" ${q ? "" : "disabled"}>−</button><span>${q}</span>
      <button data-cr-extra-mas="${e.id}" aria-label="Agregar ${e.nombre}" ${q >= e.max ? "disabled" : ""}>+</button></div></li>`;
  }).join("");
  pintarResumenCreador();
}
function pintarResumenCreador() {
  const t = crBuscar("tipos", cr.tipo), n = totalFlores(cr), total = precioCreacion(cr), ext = costoExtras(cr.extras);
  if (_bouquet) {
    actualizar3D(cr);
    const ov = $("#crPreview").querySelector(".mq-3d, .mq");
    if (ov) ov.outerHTML = `<div class="mq mq-3d">${etiquetas3D(cr)}</div>`;
    else $("#crPreview").insertAdjacentHTML("beforeend", `<div class="mq mq-3d">${etiquetas3D(cr)}</div>`);
  } else {
    $("#crPreview").innerHTML = vistaReal(cr);
  }
  $("#crTitulo").textContent = t.carrito;
  const filas = [[`Base (${t.nombre.toLowerCase()})`, t.precioBase], [`Flores (${n})`, costoFlores(cr)]];
  if (ext) filas.push(["Extras", ext]);
  $("#crDesglose").innerHTML = filas.map(([a, b]) => `<div><span>${a}</span><span>${usd(b)}</span></div>`).join("");
  $("#crTotal").innerHTML = precioHTML(total);
  const { abono } = dividirPago(total);
  $("#crAbono").innerHTML = n && PORCENTAJE_ABONO < 100 ? `Abonas hoy <strong>${usd(abono)}</strong>${tasa ? ` (${bs(abono)})` : ""} y el resto al recibir.` : "";
  let msg = "";
  if (n < t.minFlores) msg = t.minFlores === 1 ? "Agrega una flor para continuar." : `Agrega al menos ${t.minFlores} flores (llevas ${n}).`;
  else if (n > t.maxFlores) msg = t.maxFlores === 1 ? `Para “${t.nombre}” elige solo 1 flor (llevas ${n}). Quita las demás.` : `Para “${t.nombre}” el máximo es ${t.maxFlores} flores (llevas ${n}).`;
  $("#crMensaje").textContent = msg;
  $("#crAgregar").disabled = !!msg;
  // Barra fija en celular
  $("#crBarraMini").innerHTML = miniReal(cr);
  $("#crBarraFlores").textContent = `${n} ${n === 1 ? "flor" : "flores"}${tasa ? " · " + bs(total) : ""}`;
  $("#crBarraTotal").textContent = usd(total);
}
$("#crBarraVer")?.addEventListener("click", () => {
  document.querySelector(".creador-resumen").scrollIntoView({ behavior: "smooth", block: "start" });
});
/* La barra aparece mientras se recorren los pasos y se oculta al llegar al resumen */
if ("IntersectionObserver" in window && $("#crBarra")) {
  let enPasos = false, enResumen = false;
  const actualizarBarra = () => {
    const ver = enPasos && !enResumen;
    $("#crBarra").classList.toggle("visible", ver);
    $("#crBarra").setAttribute("aria-hidden", !ver);
    $("#crBarraVer").tabIndex = ver ? 0 : -1;
    document.body.classList.toggle("con-barra-creador", ver);
  };
  new IntersectionObserver(e => { enPasos = e[0].isIntersecting; actualizarBarra(); }).observe(document.querySelector(".creador-pasos"));
  new IntersectionObserver(e => { enResumen = e[0].isIntersecting; actualizarBarra(); }, { threshold: .25 }).observe(document.querySelector(".creador-resumen"));
}
/* Mantener el foco en el mismo botón después de redibujar */
function conFoco(fn) {
  const a = document.activeElement, attr = a && [...a.attributes].find(x => x.name.startsWith("data-cr"));
  fn();
  if (attr) { const b = document.querySelector(`[${attr.name}="${attr.value}"]`); if (b && !b.disabled) b.focus({ preventScroll: true }); else if (b) $("#crAnadir")?.focus({ preventScroll: true }); }
}
document.addEventListener("click", e => {
  const b = e.target.closest("#crea-tu-ramo button"); if (!b || b.disabled) return;
  const d = b.dataset, t = crBuscar("tipos", cr.tipo);
  conFoco(() => {
    if (d.crTipo) cr.tipo = d.crTipo;
    else if (d.crFlor) cr.flor = d.crFlor;
    else if (d.crColor) cr.color = d.crColor;
    else if (b.id === "crAnadir") { const k = cr.flor + "|" + cr.color; if (totalFlores(cr) < t.maxFlores) cr.flores[k] = (cr.flores[k] || 0) + 1; }
    else if (d.crMas) { if (totalFlores(cr) < t.maxFlores) cr.flores[d.crMas]++; }
    else if (d.crMenos) { if (--cr.flores[d.crMenos] <= 0) delete cr.flores[d.crMenos]; }
    else if (d.crPapel) cr.papel = d.crPapel;
    else if (d.crLazo) cr.lazo = d.crLazo;
    else if (d.crMaceta) cr.maceta = d.crMaceta;
    else if (d.crExtraMas) { const ex = EXTRAS.find(x => x.id === d.crExtraMas); cr.extras[ex.id] = Math.min((cr.extras[ex.id] || 0) + 1, ex.max); }
    else if (d.crExtraMenos) { if (--cr.extras[d.crExtraMenos] <= 0) delete cr.extras[d.crExtraMenos]; }
    else if (b.id === "crAgregar") return agregarCreacion();
    else if (b.id === "crReiniciar") { cr = { ...cr, flores: {}, extras: {} }; $("#crIdea").value = ""; }
    else return;
    pintarCreador();
  });
});
function agregarCreacion() {
  if (!creacionValida(cr)) return pintarResumenCreador();
  const c = { tipo: cr.tipo, flores: { ...cr.flores }, extras: { ...cr.extras }, idea: $("#crIdea").value.trim().slice(0, 300) };
  if (cr.tipo === "ramo") c.papel = cr.papel;
  if (CREADOR.elegirLazo && cr.tipo !== "maceta") c.lazo = cr.lazo;
  if (cr.tipo === "maceta") c.maceta = cr.maceta;
  carrito.push({ clave: "cr-" + Date.now(), creacion: c, cantidad: 1 });
  guardar(); pintarCarrito();
  aviso("¡Tu creación se agregó al carrito!");
  $("#crVerCarrito").hidden = false;
}
$("#crVerCarrito")?.addEventListener("click", abrirCarrito);

/* Mensaje de tarjeta: muestra "Escrito" cuando hay texto */
const estadoTarjeta = () => {
  const t = $("#mensajeTarjeta").value.trim();
  $("#tarjetaEstado").textContent = t ? `“${t.length > 34 ? t.slice(0, 34) + "…" : t}”` : "Opcional";
  $("#carritoTarjeta").classList.toggle("con-texto", !!t);
};
$("#mensajeTarjeta").addEventListener("input", estadoTarjeta);
$("#carritoTarjeta").addEventListener("toggle", () => { if ($("#carritoTarjeta").open) $("#mensajeTarjeta").focus({ preventScroll: true }); });

/* =========================================================
   DATOS DE ENTREGA — nombre, dirección, fecha e indicaciones
   Aparecen en el carrito, debajo del mensaje para la tarjeta.
   Se envían por WhatsApp y se guardan en Supabase, en las
   columnas cliente, direccion, fecha_entrega y notas.
   ========================================================= */
const ENTREGA_CLAVE = "entrega-bloom";
const LIMITE_ENTREGA = { cliente: 80, direccion: 300, notas: 300 };
const dos = n => String(n).padStart(2, "0");
const hoyISO = () => { const h = new Date(); return `${h.getFullYear()}-${dos(h.getMonth() + 1)}-${dos(h.getDate())}`; };
const fechaLegible = iso => { const [a, m, d] = String(iso || "").split("-"); return a && m && d ? `${d}/${m}/${a}` : ""; };

(function crearDatosEntrega() {
  if ($("#datosEntrega")) return;

  const estilo = document.createElement("style");
  estilo.textContent = `
    .carrito-entrega { border: 1px solid rgba(127,127,127,.28); border-radius: 14px; padding: 14px; margin: 12px 0; }
    .carrito-entrega h3 { margin: 0 0 10px; font-size: .95rem; font-weight: 700; }
    .entrega-campo { margin-bottom: 10px; }
    .entrega-campo:last-child { margin-bottom: 0; }
    .entrega-campo label { display: block; font-size: .8rem; font-weight: 600; margin-bottom: 4px; }
    .entrega-campo label span { font-weight: 400; opacity: .65; }
    .entrega-campo input, .entrega-campo textarea {
      width: 100%; box-sizing: border-box; padding: 9px 11px; border-radius: 10px;
      border: 1px solid rgba(127,127,127,.4); background: rgba(127,127,127,.06);
      color: inherit; font: inherit; font-size: 16px; line-height: 1.35;
    }
    .entrega-campo textarea { resize: vertical; min-height: 58px; }
    .entrega-campo input:focus, .entrega-campo textarea:focus { outline: 2px solid currentColor; outline-offset: 1px; }
    .entrega-campo [aria-invalid="true"] { border-color: #c0392b; }
    .entrega-error { color: #c0392b; font-size: .78rem; margin: 4px 0 0; }
  `;
  document.head.appendChild(estilo);

  const s = document.createElement("section");
  s.id = "datosEntrega";
  s.className = "carrito-entrega";
  s.setAttribute("aria-labelledby", "entregaTitulo");
  s.innerHTML = `
    <h3 id="entregaTitulo">Datos de entrega</h3>
    <div class="entrega-campo">
      <label for="entregaNombre">Tu nombre</label>
      <input id="entregaNombre" type="text" autocomplete="name" maxlength="${LIMITE_ENTREGA.cliente}" placeholder="Nombre y apellido">
      <p class="entrega-error" id="errorEntregaNombre" hidden></p>
    </div>
    <div class="entrega-campo">
      <label for="entregaDireccion">Dirección de entrega</label>
      <textarea id="entregaDireccion" rows="2" autocomplete="street-address" maxlength="${LIMITE_ENTREGA.direccion}" placeholder="Sector, calle, casa o edificio y un punto de referencia"></textarea>
      <p class="entrega-error" id="errorEntregaDireccion" hidden></p>
    </div>
    <div class="entrega-campo">
      <label for="entregaFecha">Fecha de entrega</label>
      <input id="entregaFecha" type="date" min="${hoyISO()}">
      <p class="entrega-error" id="errorEntregaFecha" hidden></p>
    </div>
    <div class="entrega-campo">
      <label for="entregaNotas">Indicaciones <span>(opcional)</span></label>
      <textarea id="entregaNotas" rows="2" maxlength="${LIMITE_ENTREGA.notas}" placeholder="Hora preferida, a quién entregar, si es sorpresa…"></textarea>
    </div>`;

  const tarjeta = $("#carritoTarjeta");
  if (tarjeta) tarjeta.insertAdjacentElement("afterend", s);
  else $("#enviarPedido").insertAdjacentElement("beforebegin", s);

  // Recuerda lo que escribió el cliente aunque cierre el carrito o recargue la página
  let guardado = {};
  try { guardado = JSON.parse(localStorage.getItem(ENTREGA_CLAVE)) || {}; } catch (e) { guardado = {}; }
  $("#entregaNombre").value = guardado.cliente || "";
  $("#entregaDireccion").value = guardado.direccion || "";
  $("#entregaFecha").value = guardado.fecha_entrega && guardado.fecha_entrega >= hoyISO() ? guardado.fecha_entrega : "";
  $("#entregaNotas").value = guardado.notas || "";

  s.addEventListener("input", e => {
    const campo = e.target;
    campo.removeAttribute("aria-invalid");
    const error = campo.parentElement.querySelector(".entrega-error");
    if (error) error.hidden = true;
    try { localStorage.setItem(ENTREGA_CLAVE, JSON.stringify(leerEntrega())); } catch (err) {}
  });
})();

/* Lee los datos de entrega tal como se guardan en Supabase */
function leerEntrega() {
  const valor = (id, max) => $(id).value.trim().slice(0, max);
  return {
    cliente: valor("#entregaNombre", LIMITE_ENTREGA.cliente),
    direccion: valor("#entregaDireccion", LIMITE_ENTREGA.direccion),
    fecha_entrega: $("#entregaFecha").value || null,
    notas: valor("#entregaNotas", LIMITE_ENTREGA.notas) || null,
  };
}

/* Revisa los campos obligatorios. Devuelve el primer campo con error, o null si todo está bien. */
function validarEntrega() {
  const d = leerEntrega();
  $("#entregaFecha").min = hoyISO();
  const reglas = [
    ["#entregaNombre",    "#errorEntregaNombre",    !d.cliente ? "Escribe tu nombre." : d.cliente.length < 2 ? "Escribe tu nombre completo." : ""],
    ["#entregaDireccion", "#errorEntregaDireccion", !d.direccion ? "Escribe la dirección de entrega." : d.direccion.length < 8 ? "Agrega más detalles de la dirección." : ""],
    ["#entregaFecha",     "#errorEntregaFecha",     !d.fecha_entrega ? "Elige la fecha de entrega." : d.fecha_entrega < hoyISO() ? "La fecha no puede ser anterior a hoy." : ""],
  ];
  let primero = null;
  reglas.forEach(([campo, error, texto]) => {
    $(error).textContent = texto;
    $(error).hidden = !texto;
    if (texto) { $(campo).setAttribute("aria-invalid", "true"); primero = primero || $(campo); }
    else $(campo).removeAttribute("aria-invalid");
  });
  return primero;
}

/* =========================================================
   CONEXIÓN CON SUPABASE
   ========================================================= */
const supabaseActivo = () => !!(SUPABASE_URL && SUPABASE_ANON_KEY);
const SUPABASE_BASE = SUPABASE_URL.trim().replace(/\/+$/, "").replace(/\/rest\/v1$/, "");
const sbFetch = (ruta, opciones = {}) => fetch(`${SUPABASE_BASE}/rest/v1/${ruta}`, {
  ...opciones,
  headers: {
    apikey: SUPABASE_ANON_KEY,
    // La clave antigua "anon" (eyJ…) también va como Authorization; la nueva "sb_publishable_…" solo como apikey
    ...(SUPABASE_ANON_KEY.startsWith("eyJ") ? { Authorization: `Bearer ${SUPABASE_ANON_KEY}` } : {}),
    "Content-Type": "application/json", ...(opciones.headers || {}),
  },
});
const redondear = n => Math.round(n * 100) / 100;

/* Convierte las filas de Supabase al formato que usa la página */
function catalogoDesdeSupabase(filasP, filasE) {
  const respaldoFoto = "img/ramo-flores-luz.jpg";
  const productos = filasP.map(f => ({
    id: f.id, nombre: f.nombre, categoria: f.categoria, descripcion: f.descripcion || "",
    etiqueta: f.etiqueta || "", agotado: !!f.agotado,
    imagenes: (f.imagenes && f.imagenes.length) ? f.imagenes : [respaldoFoto],
    extras: (f.extras && f.extras.length) ? f.extras : undefined,
    opciones: (f.opciones || []).slice().sort((a, b) => a.orden - b.orden).map(o => ({ nombre: o.nombre, precio: Number(o.precio) })),
  })).filter(p => p.opciones.length);
  const extras = filasE.map(f => ({
    id: f.id, nombre: f.nombre, detalle: f.detalle || "", precio: Number(f.precio), max: f.max || 1,
    imagen: f.imagen || undefined, exclusivo: !!f.exclusivo, agotado: !!f.agotado,
  }));
  return { productos, extras };
}
function aplicarCatalogo(c) {
  if (!c || !c.productos?.length) return;
  PRODUCTOS.splice(0, PRODUCTOS.length, ...c.productos);
  EXTRAS.splice(0, EXTRAS.length, ...conFotos(c.extras.filter(e => !EXTRAS_OCULTOS.includes(e.id))));
  pintarFiltros(); pintarProductos(); pintarCarrito();
  if (typeof pintarCreador === "function" && $("#crTipos")) conFoco(pintarCreador);
  if (actual && $("#modal").classList.contains("visible")) {
    const nuevo = PRODUCTOS.find(p => p.id === actual.id);
    if (nuevo) { actual = nuevo; opcionSel = Math.min(opcionSel, nuevo.opciones.length - 1); pintarExtras(); }
  }
}
async function cargarCatalogo() {
  if (!supabaseActivo()) return;
  // 1. Muestra al instante el último catálogo guardado (visitas anteriores)
  try { const g = JSON.parse(localStorage.getItem("catalogo-bloom")); if (g) aplicarCatalogo(g); } catch (e) {}
  // 2. Descarga el catálogo actual
  try {
    const [rp, re] = await Promise.all([
      sbFetch("productos?select=id,nombre,categoria,descripcion,etiqueta,imagenes,extras,orden,agotado,opciones(nombre,precio,orden)&order=orden.asc"),
      sbFetch("extras?select=id,nombre,detalle,precio,max,imagen,exclusivo,orden,agotado&order=orden.asc"),
    ]);
    if (!rp.ok || !re.ok) throw new Error(`Supabase respondió ${rp.status}/${re.status}`);
    const c = catalogoDesdeSupabase(await rp.json(), await re.json());
    if (!c.productos.length) return;
    aplicarCatalogo(c);
    try { localStorage.setItem("catalogo-bloom", JSON.stringify(c)); } catch (e) {}
  } catch (e) {
    console.warn("No se pudo cargar el catálogo de Supabase; se usa el de respaldo.", e);
  }
}

/* Código corto del pedido, ej. BC-1018-4821 (mes-día y 4 cifras) */
function codigoPedido() {
  const h = new Date();
  return `BC-${String(h.getMonth() + 1).padStart(2, "0")}${String(h.getDate()).padStart(2, "0")}-${Math.floor(1000 + Math.random() * 9000)}`;
}
/* Registra el pedido en Supabase (la página no puede leer los pedidos, solo crearlos) */
function guardarPedido(codigo, total, tarjeta, entrega = {}) {
  const pago = dividirPago(total);
  const items = carrito.map(x => {
    const i = infoItem(x), unidad = precioUnidad(x);
    return {
      tipo: x.creacion ? "creacion" : "producto", producto_id: x.id ?? null,
      nombre: i.nombre, detalle: [i.detalle, i.detalle2].filter(Boolean).join(" · "),
      extras: i.ext || null, idea: i.idea || null, cantidad: x.cantidad,
      precio_unitario_usd: redondear(unidad), subtotal_usd: redondear(unidad * x.cantidad),
    };
  });
  const fila = {
    codigo, items, total_usd: redondear(total),
    total_bs: tasa ? redondear(total * tasa) : null, tasa_bcv: tasa || null,
    abono_usd: PORCENTAJE_ABONO < 100 ? pago.abono : redondear(total),
    resto_usd: PORCENTAJE_ABONO < 100 ? pago.resto : 0,
    metodo_pago: metodoActual()?.nombre || null, mensaje_tarjeta: tarjeta || null,
    cliente: entrega.cliente || null, direccion: entrega.direccion || null,
    fecha_entrega: entrega.fecha_entrega || null, notas: entrega.notas || null,
  };
  // WhatsApp se abre en otra pestaña, así que esta página sigue abierta y el registro se completa
  return sbFetch("pedidos", { method: "POST", body: JSON.stringify(fila), headers: { Prefer: "return=minimal" } })
    .then(async r => {
      if (r.ok) { console.info(`✔ Pedido ${codigo} guardado en Supabase.`); return true; }
      const detalle = await r.text().catch(() => "");
      console.error(`✘ Supabase NO guardó el pedido ${codigo}. Código ${r.status}. ${pistaSupabase(r.status, detalle)}\nRespuesta: ${detalle}`);
      return false;
    })
    .catch(e => { console.error(`✘ No hubo conexión con Supabase al guardar el pedido ${codigo}.`, e); return false; });
}
/* Pista para entender el error (se ve en F12 → Console) */
function pistaSupabase(estado, detalle) {
  if (/42501|row-level security|permission denied/i.test(detalle))
    return "Faltan permisos: ejecuta el archivo supabase/reparar-permisos.sql en Supabase → SQL Editor.";
  if (estado === 401 || /api key|apikey|jwt/i.test(detalle))
    return "La clave (SUPABASE_ANON_KEY) no es válida o no corresponde a este proyecto.";
  if (estado === 503 || /PGRST002/.test(detalle))
    return "El proyecto de Supabase no responde. Si está en pausa, entra a tu panel de Supabase y toca «Restore project».";
  if (estado === 404 || /42P01|PGRST205|does not exist|Could not find the table/i.test(detalle))
    return "No se encontró la tabla: revisa que bloom-and-co.sql se haya ejecutado en ESTE proyecto.";
  if (estado === 400) return "Los datos del pedido no tienen el formato esperado.";
  return "";
}

/* =========================================================
   DIAGNÓSTICO DE SUPABASE
   Abre tu página agregando #diagnostico al final del enlace
   (ej. https://bloom-and-co.vercel.app/#diagnostico) y verás
   si la página puede leer productos y guardar pedidos.
   ========================================================= */
const VERSION_PAGINA = "2026-10-21 · pedidos v3";
async function diagnosticoSupabase() {
  let panel = $("#panelDiagnostico");
  if (!panel) {
    panel = document.createElement("div"); panel.id = "panelDiagnostico";
    panel.setAttribute("role", "dialog"); panel.setAttribute("aria-label", "Diagnóstico de Supabase");
    document.body.appendChild(panel);
  }
  const filas = [];
  const pintar = (fin = false) => {
    panel.innerHTML = `<div class="diag-caja"><h2>Diagnóstico de Supabase</h2>
      <ol class="diag-lista">${filas.map(f => `<li class="diag-${f.ok === true ? "ok" : f.ok === false ? "error" : "espera"}"><strong>${f.ok === true ? "✔" : f.ok === false ? "✘" : "…"} ${f.titulo}</strong><span>${esc(f.texto)}</span></li>`).join("")}</ol>
      ${fin ? `<div class="diag-botones"><button id="diagCopiar">Copiar resultado</button><button id="diagCerrar">Cerrar</button></div>` : ""}</div>`;
    if (fin) {
      $("#diagCerrar").onclick = () => { panel.remove(); history.replaceState(null, "", location.pathname + location.search); };
      $("#diagCopiar").onclick = async () => { await copiarTexto(filas.map(f => `${f.ok ? "OK" : "ERROR"} · ${f.titulo}: ${f.texto}`).join("\n")); $("#diagCopiar").textContent = "¡Copiado!"; };
    }
  };
  filas.push({ titulo: "Versión de la página", texto: VERSION_PAGINA, ok: true });
  const configOk = supabaseActivo();
  filas.push({ titulo: "Datos de conexión", ok: configOk,
    texto: configOk ? `${SUPABASE_BASE} · clave ${SUPABASE_ANON_KEY.slice(0, 18)}…` : "SUPABASE_URL o SUPABASE_ANON_KEY están vacíos en js/script.js." });
  pintar();
  if (!configOk) return pintar(true);
  // Prueba 1: leer productos
  const p1 = { titulo: "Leer productos", texto: "Probando…" }; filas.push(p1); pintar();
  try {
    const r = await sbFetch("productos?select=id,nombre&limit=50");
    const t = await r.text();
    if (r.ok) { const n = JSON.parse(t).length; p1.ok = n > 0; p1.texto = n ? `Respuesta ${r.status}: ${n} productos encontrados.` : `Respuesta ${r.status}, pero la tabla productos está vacía: ejecuta bloom-and-co.sql.`; }
    else { p1.ok = false; p1.texto = `Respuesta ${r.status}. ${pistaSupabase(r.status, t)} Detalle: ${t.slice(0, 220)}`; }
  } catch (e) { p1.ok = false; p1.texto = `Sin conexión con Supabase (${e.message}). Revisa la URL y tu internet.`; }
  pintar();
  // Prueba 2: guardar un pedido de prueba
  const p2 = { titulo: "Guardar pedido de prueba", texto: "Probando…" }; filas.push(p2); pintar();
  const codigo = "DIAG-" + Math.floor(1000 + Math.random() * 9000);
  try {
    const r = await sbFetch("pedidos", { method: "POST", headers: { Prefer: "return=minimal" },
      body: JSON.stringify({ codigo, items: [{ nombre: "Prueba de diagnóstico", cantidad: 1 }], total_usd: 0, metodo_pago: "Diagnóstico" }) });
    const t = await r.text();
    if (r.ok) { p2.ok = true; p2.texto = `Respuesta ${r.status}: se guardó el pedido ${codigo}. Búscalo en Supabase → Table Editor → pedidos (toca ↻) y luego bórralo.`; }
    else { p2.ok = false; p2.texto = `Respuesta ${r.status}. ${pistaSupabase(r.status, t)} Detalle: ${t.slice(0, 220)}`; }
  } catch (e) { p2.ok = false; p2.texto = `Sin conexión con Supabase (${e.message}).`; }
  pintar(true);
}
if (location.hash === "#diagnostico") setTimeout(diagnosticoSupabase, 300);
window.addEventListener("hashchange", () => { if (location.hash === "#diagnostico") diagnosticoSupabase(); });

/* Enviar pedido por WhatsApp */
$("#enviarPedido").addEventListener("click", async () => {
  // Los datos de entrega son obligatorios
  const campoConError = validarEntrega();
  if (campoConError) {
    campoConError.scrollIntoView({ block: "center", behavior: "smooth" });
    campoConError.focus({ preventScroll: true });
    aviso("Completa tus datos de entrega para enviar el pedido.");
    return;
  }
  const entrega = leerEntrega();
  let total = 0;
  const lineas = carrito.map(x => {
    const i = infoItem(x), sub = precioUnidad(x) * x.cantidad;
    total += sub;
    if (x.creacion) return `• ${x.cantidad} x ${i.nombre} – ${precioTexto(sub)}` +
      `\n   Flores: ${i.detalle}\n   Presentación: ${i.detalle2}` +
      (i.ext ? `\n   Extras por unidad: ${i.ext} (+ ${usd(i.costoExt)})` : "") +
      (i.idea ? `\n   Idea: ${i.idea}` : "");
    return `• ${x.cantidad} x ${i.nombre} (${i.detalle}) – ${precioTexto(sub)}` +
      (i.ext ? `\n   Extras por unidad: ${i.ext} (+ ${usd(i.costoExt)})` : "");
  });
  const tarjeta = $("#mensajeTarjeta").value.trim();
  const codigo = codigoPedido();
  const mensaje = `Hola Bloom & Co, quiero hacer este pedido${supabaseActivo() ? ` (N.º ${codigo})` : ""}:\n\n${lineas.join("\n")}\n\nTotal: ${precioTexto(total)}` +
    (tasa ? `\nTasa BCV usada: Bs. ${fmt(tasa)}` : "") +
    (PORCENTAJE_ABONO < 100
      ? `\n\nForma de pago:\n• Abono por adelantado (${PORCENTAJE_ABONO}%): ${precioTexto(dividirPago(total).abono)}` +
        `\n• Restante el día de la entrega (${100 - PORCENTAJE_ABONO}%): ${precioTexto(dividirPago(total).resto)}`
      : "") +
    (tarjeta ? `\n\nMensaje para la tarjeta: "${tarjeta}"` : "") +
    (metodoActual() ? `\n\nMétodo de pago: ${metodoActual().nombre}` +
      `\nMonto del abono: ${montoMetodo(metodoActual(), PORCENTAJE_ABONO < 100 ? dividirPago(total).abono : total)}` +
      (metodoActual().notaWhatsApp ? `\n${metodoActual().notaWhatsApp}` : "") : "") +
    `\n\nMi nombre: ${entrega.cliente}\nDirección de entrega: ${entrega.direccion}\nFecha de entrega: ${fechaLegible(entrega.fecha_entrega)}` +
    (entrega.notas ? `\nIndicaciones: ${entrega.notas}` : "");
  const urlWhatsApp = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(mensaje)}`;
  if (!supabaseActivo()) { window.open(urlWhatsApp, "_blank"); return; }

  // La pestaña se abre YA (al tocar el botón) para que el navegador no la bloquee;
  // mientras tanto se guarda el pedido y luego la pestaña va a WhatsApp.
  const ventana = window.open("", "_blank");
  const boton = $("#enviarPedido"), textoBoton = boton.innerHTML;
  boton.disabled = true; boton.innerHTML = "Registrando tu pedido…";
  if (ventana && ventana.document) {
    try { ventana.document.title = "Bloom & Co"; ventana.document.body.innerHTML = '<p style="font-family:system-ui,sans-serif;text-align:center;margin-top:40vh;color:#555">Abriendo WhatsApp…</p>'; } catch (e) {}
  }
  const espera = new Promise(r => setTimeout(() => r(false), 5000));
  await Promise.race([guardarPedido(codigo, total, tarjeta, entrega), espera]);
  boton.disabled = false; boton.innerHTML = textoBoton;
  if (ventana && !ventana.closed) ventana.location.href = urlWhatsApp;
  else window.location.href = urlWhatsApp; // si el navegador bloqueó la pestaña nueva
});

/* Menú móvil */
$("#botonMenu").addEventListener("click", () => {
  const abierto = $("#menu").classList.toggle("abierto");
  $("#botonMenu").setAttribute("aria-expanded", abierto);
});
document.querySelectorAll(".menu a").forEach(a => a.addEventListener("click", () => {
  $("#menu").classList.remove("abierto"); $("#botonMenu").setAttribute("aria-expanded", false);
}));

/* Aviso flotante */
let temporizador;
function aviso(texto) {
  $("#toast").textContent = texto; $("#toast").classList.add("visible");
  clearTimeout(temporizador); temporizador = setTimeout(() => $("#toast").classList.remove("visible"), 2200);
}

/* =========================================================
   TEMA: Claro / Oscuro / Automático
   ========================================================= */
const ICONOS_TEMA = {
  light: document.querySelector('[data-tema="light"] svg').outerHTML,
  dark:  document.querySelector('[data-tema="dark"] svg').outerHTML,
  auto:  document.querySelector('[data-tema="auto"] svg').outerHTML,
};
const sistemaOscuro = window.matchMedia("(prefers-color-scheme: dark)");
function temaActual() {
  try { const t = localStorage.getItem("tema-amara"); return t === "light" || t === "dark" ? t : "auto"; }
  catch (e) { return "auto"; }
}
function aplicarTema(t) {
  const raiz = document.documentElement;
  // Cambia todos los colores a la vez, sin transiciones a medias ni saltos
  raiz.classList.add("cambiando-tema");
  if (t === "auto") raiz.removeAttribute("data-theme"); else raiz.setAttribute("data-theme", t);
  try { t === "auto" ? localStorage.removeItem("tema-amara") : localStorage.setItem("tema-amara", t); } catch (e) {}
  const oscuro = t === "dark" || (t === "auto" && sistemaOscuro.matches);
  document.querySelector('meta[name="theme-color"]').setAttribute("content", oscuro ? "#151412" : "#1E1C19");
  $("#iconoTema").innerHTML = ICONOS_TEMA[t];
  document.querySelectorAll("[data-tema]").forEach(b => b.setAttribute("aria-checked", b.dataset.tema === t));
  $("#botonTema").setAttribute("aria-label", "Cambiar apariencia (actual: " + { light: "claro", dark: "oscuro", auto: "automático" }[t] + ")");
  requestAnimationFrame(() => requestAnimationFrame(() => raiz.classList.remove("cambiando-tema")));
}
function cerrarMenuTema() { $("#menuTema").classList.remove("abierto"); $("#botonTema").setAttribute("aria-expanded", "false"); }
$("#botonTema").addEventListener("click", e => {
  e.stopPropagation();
  const abierto = $("#menuTema").classList.toggle("abierto");
  $("#botonTema").setAttribute("aria-expanded", abierto);
  if (abierto) $('#menuTema [aria-checked="true"]').focus({ preventScroll: true });
});
$("#menuTema").addEventListener("click", e => {
  const b = e.target.closest("[data-tema]"); if (!b) return;
  aplicarTema(b.dataset.tema); cerrarMenuTema(); $("#botonTema").focus({ preventScroll: true });
});
document.addEventListener("click", e => { if (!e.target.closest(".tema")) cerrarMenuTema(); });
document.addEventListener("keydown", e => { if (e.key === "Escape") cerrarMenuTema(); });
sistemaOscuro.addEventListener("change", () => { if (temaActual() === "auto") aplicarTema("auto"); });
aplicarTema(temaActual());

$("#anio").textContent = new Date().getFullYear();
pintarMetodosContacto();
pintarCreador();
/* =========================================================
   ANIMACIONES DE PRODUCTOS Y GALERÍA
   PC: al pasar el mouse. Celular: al pasar por el centro de la
   pantalla mientras se desliza, y al tocar.
   ========================================================= */
const sinMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let obsAparecer = null, obsFoco = null, grillaVista = false;
if ("IntersectionObserver" in window && !sinMovimiento) {
  // Aparición suave al entrar en pantalla
  obsAparecer = new IntersectionObserver(entradas => entradas.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add("visible"); obsAparecer.unobserve(e.target);
    if (e.target.closest("#grilla")) grillaVista = true;
  }), { rootMargin: "0px 0px -6% 0px", threshold: .12 });
  // "En foco": el elemento que cruza el centro de la pantalla (efecto en celular)
  obsFoco = new IntersectionObserver(entradas => entradas.forEach(e =>
    e.target.classList.toggle("en-foco", e.isIntersecting)
  ), { rootMargin: "-38% 0px -38% 0px", threshold: 0 });
}
function prepararAnimado(el, i) {
  if (!obsAparecer) return;
  el.style.setProperty("--retraso", (i % 4) * 70 + "ms");
  el.classList.add("aparecer");
  obsAparecer.observe(el); obsFoco.observe(el);
}
function animarTarjetas(animar) {
  if (!obsAparecer) return;
  document.querySelectorAll("#grilla .producto").forEach((t, i) => {
    obsFoco.observe(t);
    if (animar) { t.style.setProperty("--i", i); t.classList.add("entrar"); }
    else if (grillaVista) t.classList.add("aparecer", "visible");
    else prepararAnimado(t, i);
  });
}
// Galería: pie de foto con el nombre y animaciones
document.querySelectorAll(".galeria figure").forEach((f, i) => {
  const img = f.querySelector("img");
  if (img && !f.querySelector("figcaption")) {
    const c = document.createElement("figcaption"); c.textContent = img.alt; f.appendChild(c);
  }
  f.tabIndex = 0;
  prepararAnimado(f, i);
});
// Al tocar en el celular: la tarjeta o foto "se presiona" y muestra su efecto
document.addEventListener("touchstart", e => {
  const el = e.target.closest(".producto, .galeria figure");
  if (!el) return;
  el.classList.add("tocado");
  setTimeout(() => el.classList.remove("tocado"), 450);
}, { passive: true });

pintarProductos(); pintarCarrito(); cargarTasa(); cargarCatalogo();
