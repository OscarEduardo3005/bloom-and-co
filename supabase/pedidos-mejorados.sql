-- =========================================================
-- BLOOM & CO — Pedidos separados por campos y por categoría
-- Pega este archivo en Supabase → SQL Editor → New query → Run.
--
-- Qué hace:
--   1. Guarda una copia de seguridad de tus pedidos (esquema "respaldo").
--   2. Separa el contenido de "items" en columnas propias:
--      categoría, producto, opción, cantidad y extras.
--   3. "estado" pasa a ser una lista desplegable.
--   4. Agrega columnas para llenar a mano: cliente, dirección,
--      fecha de entrega y notas (datos que llegan por WhatsApp).
--   5. Crea "pedido_productos" (una fila por producto, con su
--      categoría y precios) y "pedido_extras" (una fila por extra).
--   6. Vuelve a cargar todos tus pedidos con el nuevo formato.
--
-- La página NO cambia: sigue guardando los pedidos igual que antes.
-- Reemplaza a "pedidos-separados.sql" y a versiones anteriores de este archivo.
-- Es seguro ejecutarlo varias veces: siempre conserva tus pedidos.
-- =========================================================

begin;

-- ---------- 1. LISTA DE ESTADOS (menú desplegable) ----------
do $$
begin
  if not exists (
    select 1 from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'estado_pedido' and n.nspname = 'public'
  ) then
    create type public.estado_pedido as enum
      ('nuevo', 'abonado', 'en preparación', 'entregado', 'cancelado');
  end if;
end $$;

-- ---------- 2. COPIA DE SEGURIDAD ----------
create schema if not exists respaldo;

do $$
declare
  v_nombre text := 'pedidos_' || to_char(clock_timestamp() at time zone 'America/Caracas', 'YYYYMMDD_HH24MISS_MS');
begin
  execute format('create table respaldo.%I as select * from public.pedidos', v_nombre);
end $$;

revoke all on all tables in schema respaldo from anon, authenticated;

-- Copia temporal para volver a cargar los datos al final
create temp table pedidos_tmp on commit drop as
select to_jsonb(p) as j from public.pedidos p;

-- ---------- 3. QUITAR LA ESTRUCTURA ANTERIOR ----------
drop view  if exists public.vista_pedidos;
drop view  if exists public.vista_extras_pedidos;
drop table if exists public.pedido_extras    cascade;
drop table if exists public.pedido_items     cascade;
drop table if exists public.pedido_productos cascade;
drop table if exists public.pedidos          cascade;
drop function if exists public.separar_pedido(bigint)        cascade;
drop function if exists public.tg_separar_pedido()           cascade;
drop function if exists public.tg_pedido_resumen()           cascade;
drop function if exists public.categoria_de_item(jsonb)      cascade;

-- ---------- 4. NUEVA TABLA DE PEDIDOS ----------
create table public.pedidos (
  -- Identificación
  id               bigint generated always as identity primary key,
  fecha_pedido     timestamp(0),
  codigo           text not null check (char_length(codigo) <= 20),
  estado           public.estado_pedido not null default 'nuevo',

  -- Lo que pidió el cliente (se llena solo a partir de "items")
  categoria        text,
  producto         text,
  opcion           text,
  cantidad         integer,
  extras           text,
  mensaje_tarjeta  text check (char_length(mensaje_tarjeta) <= 300),

  -- Pago
  metodo_pago      text check (char_length(metodo_pago) <= 40),
  total_usd        numeric(10,2) not null check (total_usd >= 0),
  abono_usd        numeric(10,2),
  resto_usd        numeric(10,2),
  total_bs         numeric(14,2),
  tasa_bcv         numeric(12,4),

  -- Datos de entrega (para llenar a mano con lo que llega por WhatsApp)
  cliente          text,
  direccion        text,
  fecha_entrega    date,
  notas            text,

  -- Datos originales que envía la página (no editar)
  items            jsonb not null,
  creado           timestamptz not null default now()
);

create index pedidos_creado_idx on public.pedidos (creado desc);
create index pedidos_codigo_idx on public.pedidos (codigo);

-- ---------- 5. TABLAS DE DETALLE ----------
create table public.pedido_productos (
  id                  bigint generated always as identity primary key,
  codigo              text not null,
  linea               integer not null,
  categoria           text,
  producto            text,
  opcion              text,
  cantidad            integer not null default 1,
  precio_unitario_usd numeric(10,2),
  subtotal_usd        numeric(10,2),
  extras              text,
  idea                text,
  producto_id         integer,
  tipo                text,
  pedido_id           bigint not null references public.pedidos(id) on delete cascade
);

create table public.pedido_extras (
  id                  bigint generated always as identity primary key,
  codigo              text not null,
  categoria           text,
  producto            text,
  extra               text not null,
  cantidad            integer not null default 1,
  pedido_producto_id  bigint not null references public.pedido_productos(id) on delete cascade,
  pedido_id           bigint not null references public.pedidos(id) on delete cascade
);

create index pedido_productos_pedido_idx on public.pedido_productos (pedido_id);
create index pedido_extras_pedido_idx    on public.pedido_extras (pedido_id);
create index pedido_extras_producto_idx  on public.pedido_extras (pedido_producto_id);

-- ---------- 6. CATEGORÍA DE CADA PRODUCTO ----------
-- Busca la categoría en la tabla "productos". Los ramos armados en
-- "Crea tu ramo" quedan en la categoría "Crea tu ramo".
create function public.categoria_de_item(it jsonb)
returns text
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select case
    when it->>'tipo' = 'creacion' then 'Crea tu ramo'
    else coalesce(
      (select p.categoria from public.productos p
        where it->>'producto_id' ~ '^\d+$' and p.id = (it->>'producto_id')::integer),
      'Sin categoría')
  end;
$$;

revoke execute on function public.categoria_de_item(jsonb) from public, anon, authenticated;

-- ---------- 7. LLENAR LAS COLUMNAS AL GUARDAR ----------
-- Si el pedido tiene un solo producto, cada columna tiene un solo valor.
-- Si tiene varios, los valores van en el mismo orden separados por " | ".
create function public.tg_pedido_resumen()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_varios boolean;
begin
  new.fecha_pedido := date_trunc('minute', new.creado at time zone 'America/Caracas');

  begin
    if jsonb_typeof(new.items) = 'array' then
      v_varios := jsonb_array_length(new.items) > 1;

      select
        string_agg(public.categoria_de_item(e), ' | ' order by o),
        string_agg(coalesce(nullif(e->>'nombre', ''), 'Ramo personalizado'), ' | ' order by o),
        string_agg(coalesce(nullif(e->>'detalle', ''), '—'), ' | ' order by o),
        sum(case when e->>'cantidad' ~ '^\d+$' then (e->>'cantidad')::integer else 1 end),
        coalesce(
          string_agg(
            case when v_varios
                 then coalesce(nullif(e->>'nombre', ''), 'Ramo') || ': ' || (e->>'extras')
                 else e->>'extras' end,
            ' | ' order by o) filter (where nullif(e->>'extras', '') is not null),
          'Sin extras')
      into new.categoria, new.producto, new.opcion, new.cantidad, new.extras
      from jsonb_array_elements(new.items) with ordinality as x(e, o);
    end if;
  exception when others then
    -- Si algo falla, el pedido igual se guarda
    raise warning 'No se pudo separar el pedido %: %', new.codigo, sqlerrm;
  end;

  return new;
end;
$$;

create trigger pedido_resumen
  before insert or update of items, creado on public.pedidos
  for each row execute function public.tg_pedido_resumen();

-- ---------- 8. UNA FILA POR PRODUCTO Y POR EXTRA ----------
create function public.separar_pedido(p_pedido_id bigint)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_codigo  text;
  v_items   jsonb;
  it        jsonb;
  n         integer := 0;
  v_cat     text;
  v_prod    text;
  v_prod_id bigint;
  ex        text;
  m         text[];
begin
  select codigo, items into v_codigo, v_items
  from public.pedidos where id = p_pedido_id;

  if v_items is null or jsonb_typeof(v_items) <> 'array' then
    return;
  end if;

  delete from public.pedido_productos where pedido_id = p_pedido_id;

  for it in select value from jsonb_array_elements(v_items) loop
    n := n + 1;
    v_cat  := public.categoria_de_item(it);
    v_prod := coalesce(nullif(it->>'nombre', ''), 'Ramo personalizado');

    insert into public.pedido_productos (
      codigo, linea, categoria, producto, opcion, cantidad,
      precio_unitario_usd, subtotal_usd, extras, idea,
      producto_id, tipo, pedido_id
    ) values (
      v_codigo,
      n,
      v_cat,
      v_prod,
      nullif(it->>'detalle', ''),
      case when it->>'cantidad' ~ '^\d+$' then (it->>'cantidad')::integer else 1 end,
      case when it->>'precio_unitario_usd' ~ '^-?\d+(\.\d+)?$' then (it->>'precio_unitario_usd')::numeric end,
      case when it->>'subtotal_usd' ~ '^-?\d+(\.\d+)?$' then (it->>'subtotal_usd')::numeric end,
      coalesce(nullif(it->>'extras', ''), 'Sin extras'),
      nullif(it->>'idea', ''),
      case when it->>'tipo' <> 'creacion' and it->>'producto_id' ~ '^\d+$' then (it->>'producto_id')::integer end,
      it->>'tipo',
      p_pedido_id
    )
    returning id into v_prod_id;

    -- "1 x Luces LED cálidas, 1 x Peluche pequeño" → una fila por extra
    if coalesce(it->>'extras', '') <> '' then
      foreach ex in array string_to_array(it->>'extras', ',') loop
        ex := trim(ex);
        continue when ex = '';
        m := regexp_match(ex, '^(\d+)\s*[xX×]\s*(.+)$');
        insert into public.pedido_extras (codigo, categoria, producto, extra, cantidad, pedido_producto_id, pedido_id)
        values (v_codigo, v_cat, v_prod, coalesce(trim(m[2]), ex), coalesce(m[1]::integer, 1), v_prod_id, p_pedido_id);
      end loop;
    end if;
  end loop;
end;
$$;

revoke execute on function public.separar_pedido(bigint) from public, anon, authenticated;

create function public.tg_separar_pedido()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  begin
    perform public.separar_pedido(new.id);
  exception when others then
    -- Si algo falla, el pedido igual se guarda
    raise warning 'No se pudo separar el pedido %: %', new.codigo, sqlerrm;
  end;
  return null;
end;
$$;

create trigger pedido_separar
  after insert or update of items on public.pedidos
  for each row execute function public.tg_separar_pedido();

-- ---------- 9. VOLVER A CARGAR TUS PEDIDOS ----------
insert into public.pedidos (
  id, codigo, estado, mensaje_tarjeta, metodo_pago,
  total_usd, abono_usd, resto_usd, total_bs, tasa_bcv,
  cliente, direccion, fecha_entrega, notas, items, creado
)
overriding system value
select
  (j->>'id')::bigint,
  j->>'codigo',
  case when j->>'estado' in ('nuevo', 'abonado', 'en preparación', 'entregado', 'cancelado')
       then (j->>'estado')::public.estado_pedido
       else 'nuevo'::public.estado_pedido end,
  j->>'mensaje_tarjeta',
  j->>'metodo_pago',
  (j->>'total_usd')::numeric,
  (j->>'abono_usd')::numeric,
  (j->>'resto_usd')::numeric,
  (j->>'total_bs')::numeric,
  (j->>'tasa_bcv')::numeric,
  j->>'cliente',
  j->>'direccion',
  case when j->>'fecha_entrega' ~ '^\d{4}-\d{2}-\d{2}$' then (j->>'fecha_entrega')::date end,
  j->>'notas',
  j->'items',
  (j->>'creado')::timestamptz
from pedidos_tmp
order by (j->>'id')::bigint;

-- Los próximos pedidos siguen la numeración
select setval(
  pg_get_serial_sequence('public.pedidos', 'id'),
  coalesce((select max(id) from public.pedidos), 0) + 1,
  false
);

-- ---------- 10. SEGURIDAD ----------
-- La página solo puede CREAR pedidos. No puede verlos ni modificarlos.
alter table public.pedidos          enable row level security;
alter table public.pedido_productos enable row level security;
alter table public.pedido_extras    enable row level security;

revoke all on public.pedidos, public.pedido_productos, public.pedido_extras from anon, authenticated;
grant insert on public.pedidos to anon, authenticated;

do $$
begin
  execute format('grant usage, select on sequence %s to anon, authenticated',
                 pg_get_serial_sequence('public.pedidos', 'id'));
end $$;

create policy "crear pedidos" on public.pedidos for insert to anon, authenticated
  with check (estado = 'nuevo' and jsonb_typeof(items) = 'array' and jsonb_array_length(items) between 1 and 50);

-- ---------- 11. DESCRIPCIONES (Table Editor → Definition) ----------
comment on table  public.pedidos                 is 'Pedidos de la tienda: una fila por pedido.';
comment on column public.pedidos.fecha_pedido    is 'Fecha y hora del pedido (hora de Venezuela). Se llena sola.';
comment on column public.pedidos.codigo          is 'Código del pedido, el mismo que llega por WhatsApp.';
comment on column public.pedidos.estado          is 'Estado del pedido. Cámbialo desde el menú desplegable.';
comment on column public.pedidos.categoria       is 'Categoría del producto (Ramos, Girasoles, Combos…). Se llena sola.';
comment on column public.pedidos.producto        is 'Nombre del producto. Se llena solo.';
comment on column public.pedidos.opcion          is 'Presentación elegida, por ejemplo "5 lirios". Se llena sola.';
comment on column public.pedidos.cantidad        is 'Total de unidades del pedido. Se llena sola.';
comment on column public.pedidos.extras          is 'Extras elegidos. Se llena solo.';
comment on column public.pedidos.mensaje_tarjeta is 'Mensaje que el cliente quiere en la tarjeta.';
comment on column public.pedidos.metodo_pago     is 'Pago Móvil o Divisas.';
comment on column public.pedidos.total_usd       is 'Total del pedido en dólares.';
comment on column public.pedidos.abono_usd       is 'Monto que el cliente paga por adelantado.';
comment on column public.pedidos.resto_usd       is 'Monto que paga el día de la entrega.';
comment on column public.pedidos.total_bs        is 'Total en bolívares con la tasa del día.';
comment on column public.pedidos.tasa_bcv        is 'Tasa BCV usada para calcular los bolívares.';
comment on column public.pedidos.cliente         is 'Nombre del cliente (llenar a mano desde WhatsApp).';
comment on column public.pedidos.direccion       is 'Dirección de entrega (llenar a mano desde WhatsApp).';
comment on column public.pedidos.fecha_entrega   is 'Fecha de entrega (llenar a mano desde WhatsApp).';
comment on column public.pedidos.notas           is 'Notas internas sobre el pedido.';
comment on column public.pedidos.items           is 'Datos originales que envía la página. No editar.';
comment on column public.pedidos.creado          is 'Fecha exacta de registro (hora universal). No editar.';

comment on table  public.pedido_productos                     is 'Productos de cada pedido: una fila por producto. Se llena sola.';
comment on column public.pedido_productos.linea               is 'Número del producto dentro del pedido (1, 2, 3…).';
comment on column public.pedido_productos.categoria           is 'Categoría del producto.';
comment on column public.pedido_productos.opcion              is 'Presentación elegida, por ejemplo "5 lirios".';
comment on column public.pedido_productos.precio_unitario_usd is 'Precio de una unidad en dólares (incluye extras).';
comment on column public.pedido_productos.subtotal_usd        is 'Precio unitario × cantidad, en dólares.';
comment on column public.pedido_productos.idea                is 'Detalles del ramo de "Crea tu ramo" (si aplica).';

comment on table  public.pedido_extras          is 'Extras de cada pedido: una fila por extra. Se llena sola.';
comment on column public.pedido_extras.producto is 'Producto al que se agregó el extra.';
comment on column public.pedido_extras.extra    is 'Nombre del extra, por ejemplo "Peluche pequeño".';

commit;

notify pgrst, 'reload schema';
