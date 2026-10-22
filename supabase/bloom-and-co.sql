-- =========================================================
-- BLOOM & CO — Base de datos en Supabase
-- Pega TODO este archivo en Supabase → SQL Editor → New query
-- y toca "Run". Crea las tablas, las reglas de seguridad y carga
-- tus productos, opciones y extras actuales.
-- =========================================================

-- ---------- 1. TABLAS ----------
create table if not exists public.productos (
  id          integer primary key,
  nombre      text    not null,
  categoria   text    not null,
  descripcion text    not null default '',
  etiqueta    text,                       -- "Nuevo", "Más vendido"… (vacío = sin etiqueta)
  imagenes    text[]  not null default '{}', -- rutas de las fotos, ej. img/lirio-azul.jpg
  extras      text[],                     -- ids de extras permitidos (vacío = todos los generales)
  orden       integer not null default 0, -- orden en el catálogo (menor = primero)
  activo      boolean not null default true,  -- false = no aparece en la página
  agotado     boolean not null default false  -- true = se muestra como "Agotado"
);

create table if not exists public.opciones (
  id          bigint generated always as identity primary key,
  producto_id integer not null references public.productos(id) on delete cascade,
  nombre      text    not null,           -- ej. "12 flores"
  precio      numeric(10,2) not null check (precio >= 0), -- en dólares
  orden       integer not null default 0
);

create table if not exists public.extras (
  id        text primary key,             -- ej. "peluche" (sin espacios ni tildes)
  nombre    text    not null,
  detalle   text    not null default '',
  precio    numeric(10,2) not null check (precio >= 0), -- en dólares, por unidad
  max       integer not null default 1 check (max >= 1),
  imagen    text,                         -- ej. img/extras/flor.jpg (vacío = ícono)
  exclusivo boolean not null default false, -- true = solo en productos que lo nombren
  orden     integer not null default 0,
  activo    boolean not null default true,
  agotado   boolean not null default false
);

create table if not exists public.pedidos (
  id              bigint generated always as identity primary key,
  creado          timestamptz not null default now(),
  codigo          text not null check (char_length(codigo) <= 20),
  items           jsonb not null,
  total_usd       numeric(10,2) not null check (total_usd >= 0),
  total_bs        numeric(14,2),
  tasa_bcv        numeric(12,4),
  abono_usd       numeric(10,2),
  resto_usd       numeric(10,2),
  metodo_pago     text check (char_length(metodo_pago) <= 40),
  mensaje_tarjeta text check (char_length(mensaje_tarjeta) <= 300),
  estado          text not null default 'nuevo'  -- nuevo, abonado, entregado, cancelado
);

-- ---------- 2. SEGURIDAD (Row Level Security) ----------
-- La página solo puede LEER productos/opciones/extras y CREAR pedidos.
-- Nadie desde la página puede modificar precios ni ver los pedidos.
alter table public.productos enable row level security;
alter table public.opciones  enable row level security;
alter table public.extras    enable row level security;
alter table public.pedidos   enable row level security;

drop policy if exists "leer productos" on public.productos;
create policy "leer productos" on public.productos for select to anon using (activo);
drop policy if exists "leer opciones" on public.opciones;
create policy "leer opciones" on public.opciones for select to anon using (true);
drop policy if exists "leer extras" on public.extras;
create policy "leer extras" on public.extras for select to anon using (activo);
drop policy if exists "crear pedidos" on public.pedidos;
create policy "crear pedidos" on public.pedidos for insert to anon
  with check (estado = 'nuevo' and jsonb_typeof(items) = 'array' and jsonb_array_length(items) between 1 and 50);

-- ---------- 3. DATOS INICIALES (tu catálogo actual) ----------
insert into public.productos (id, nombre, categoria, descripcion, etiqueta, imagenes, extras, orden) values (1, 'Ramo de flores amarillas con luz', 'Ramos', 'Ramo de flores amarillas hechas a mano, con luces cálidas, papel elegante, lazo lavanda y tarjeta.', 'Más vendido', array['img/ramo-flores-luz.jpg']::text[], null, 10) on conflict (id) do nothing;
insert into public.productos (id, nombre, categoria, descripcion, etiqueta, imagenes, extras, orden) values (2, 'Girasol en maceta', 'Girasoles', 'Girasol con hojas y maceta café, todo tejido en limpiapipas. Perfecto para el escritorio o la mesa de noche.', null, array['img/girasol-maceta-2.jpg','img/girasol-maceta-1.jpg']::text[], null, 20) on conflict (id) do nothing;
insert into public.productos (id, nombre, categoria, descripcion, etiqueta, imagenes, extras, orden) values (3, 'Girasol en bolsa de regalo', 'Girasoles', 'Nuestro girasol en maceta, entregado en bolsa blanca con ventana y asas de cinta. Listo para regalar.', 'Listo para regalar', array['img/girasol-bolsa-regalo.jpg','img/girasol-maceta-1.jpg']::text[], array['flor','mariposa','lazo','tarjeta','chocolates','peluche']::text[], 30) on conflict (id) do nothing;
insert into public.productos (id, nombre, categoria, descripcion, etiqueta, imagenes, extras, orden) values (4, 'Rama de flores amarillas', 'Flores sueltas', 'Rama con tres flores amarillas y botones verdes. Ideal para jarrones o para armar tu propio ramo.', null, array['img/rama-flores-amarillas.jpg']::text[], null, 40) on conflict (id) do nothing;
insert into public.productos (id, nombre, categoria, descripcion, etiqueta, imagenes, extras, orden) values (5, 'Lirio azul', 'Flores sueltas', 'Lirio de pétalos grandes con centro amarillo y hojas verdes. También lo hacemos en el color que quieras.', 'Nuevo', array['img/lirio-azul.jpg']::text[], null, 50) on conflict (id) do nothing;
insert into public.productos (id, nombre, categoria, descripcion, etiqueta, imagenes, extras, orden) values (7, 'Caja de lirios azules con luz', 'Ramos', 'Lirios azules y blanco tejidos a mano, en caja negra con asa de cinta y luces LED que los iluminan de noche.', 'Nuevo', array['img/caja-lirios-azules-1.jpg','img/caja-lirios-azules-2.jpg','img/caja-lirios-azules-3.jpg','img/caja-lirios-azules-4.jpg']::text[], array['hotwheels','flor','mariposa','lazo','tarjeta','chocolates','peluche']::text[], 60) on conflict (id) do nothing;
insert into public.productos (id, nombre, categoria, descripcion, etiqueta, imagenes, extras, orden) values (6, 'Combo ramo y girasol', 'Combos', 'Ramo de flores amarillas con luz cálida más un girasol en maceta dentro de su bolsa de regalo.', 'Combo', array['img/promo-flores-amarillas.jpg','img/ramo-flores-luz.jpg','img/girasol-bolsa-regalo.jpg']::text[], null, 70) on conflict (id) do nothing;

insert into public.opciones (producto_id, nombre, precio, orden) select 1, '12 flores', 20, 1 where not exists (select 1 from public.opciones where producto_id = 1 and nombre = '12 flores');
insert into public.opciones (producto_id, nombre, precio, orden) select 1, '20 flores', 30, 2 where not exists (select 1 from public.opciones where producto_id = 1 and nombre = '20 flores');
insert into public.opciones (producto_id, nombre, precio, orden) select 2, '1 girasol', 8, 1 where not exists (select 1 from public.opciones where producto_id = 2 and nombre = '1 girasol');
insert into public.opciones (producto_id, nombre, precio, orden) select 2, '2 girasoles', 15, 2 where not exists (select 1 from public.opciones where producto_id = 2 and nombre = '2 girasoles');
insert into public.opciones (producto_id, nombre, precio, orden) select 3, 'Con bolsa de ventana', 10, 1 where not exists (select 1 from public.opciones where producto_id = 3 and nombre = 'Con bolsa de ventana');
insert into public.opciones (producto_id, nombre, precio, orden) select 4, '1 rama', 4, 1 where not exists (select 1 from public.opciones where producto_id = 4 and nombre = '1 rama');
insert into public.opciones (producto_id, nombre, precio, orden) select 4, '3 ramas', 11, 2 where not exists (select 1 from public.opciones where producto_id = 4 and nombre = '3 ramas');
insert into public.opciones (producto_id, nombre, precio, orden) select 5, '1 lirio', 5, 1 where not exists (select 1 from public.opciones where producto_id = 5 and nombre = '1 lirio');
insert into public.opciones (producto_id, nombre, precio, orden) select 5, '3 lirios', 14, 2 where not exists (select 1 from public.opciones where producto_id = 5 and nombre = '3 lirios');
insert into public.opciones (producto_id, nombre, precio, orden) select 7, '3 lirios', 25, 1 where not exists (select 1 from public.opciones where producto_id = 7 and nombre = '3 lirios');
insert into public.opciones (producto_id, nombre, precio, orden) select 7, '5 lirios', 38, 2 where not exists (select 1 from public.opciones where producto_id = 7 and nombre = '5 lirios');
insert into public.opciones (producto_id, nombre, precio, orden) select 6, 'Ramo 12 flores + girasol', 27, 1 where not exists (select 1 from public.opciones where producto_id = 6 and nombre = 'Ramo 12 flores + girasol');
insert into public.opciones (producto_id, nombre, precio, orden) select 6, 'Ramo 20 flores + girasol', 36, 2 where not exists (select 1 from public.opciones where producto_id = 6 and nombre = 'Ramo 20 flores + girasol');

insert into public.extras (id, nombre, detalle, precio, max, imagen, exclusivo, orden) values ('flor', 'Flor adicional', 'Del mismo estilo del producto', 1.5, 20, 'img/extras/flor.jpg', false, 10) on conflict (id) do nothing;
insert into public.extras (id, nombre, detalle, precio, max, imagen, exclusivo, orden) values ('luces', 'Luces LED cálidas', 'Tira de luces que brillan de noche', 2, 3, 'img/extras/luces.jpg', false, 20) on conflict (id) do nothing;
insert into public.extras (id, nombre, detalle, precio, max, imagen, exclusivo, orden) values ('mariposa', 'Mariposa decorativa', 'Se coloca entre las flores', 1, 5, null, false, 30) on conflict (id) do nothing;
insert into public.extras (id, nombre, detalle, precio, max, imagen, exclusivo, orden) values ('lazo', 'Lazo de otro color', 'Dinos el color por WhatsApp', 1, 1, 'img/extras/lazo.jpg', false, 40) on conflict (id) do nothing;
insert into public.extras (id, nombre, detalle, precio, max, imagen, exclusivo, orden) values ('tarjeta', 'Tarjeta decorada', 'Con tu mensaje escrito a mano', 1.5, 1, null, false, 50) on conflict (id) do nothing;
insert into public.extras (id, nombre, detalle, precio, max, imagen, exclusivo, orden) values ('chocolates', 'Chocolates', 'Cajita de bombones', 4, 3, null, false, 60) on conflict (id) do nothing;
insert into public.extras (id, nombre, detalle, precio, max, imagen, exclusivo, orden) values ('peluche', 'Peluche pequeño', 'Osito de unos 15 cm', 6, 2, null, false, 70) on conflict (id) do nothing;
insert into public.extras (id, nombre, detalle, precio, max, imagen, exclusivo, orden) values ('bolsa', 'Bolsa de regalo', 'Bolsa blanca con ventana', 2, 2, 'img/extras/bolsa.jpg', false, 80) on conflict (id) do nothing;
insert into public.extras (id, nombre, detalle, precio, max, imagen, exclusivo, orden) values ('hotwheels', 'Carrito Hot Wheels', 'Carrito de colección en su empaque', 4, 5, 'img/extras/hotwheels.jpg', true, 90) on conflict (id) do nothing;
