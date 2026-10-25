-- =========================================================
-- BLOOM & CO — Pedidos separados y fáciles de leer
-- Pega este archivo en Supabase → SQL Editor → New query → Run.
-- Es seguro ejecutarlo varias veces: no borra pedidos.
--
-- Qué hace:
--   1. Crea "pedido_items": una fila por cada producto del pedido.
--   2. Crea "pedido_extras": una fila por cada extra (peluche, luces…).
--   3. Separa automáticamente cada pedido nuevo al guardarse.
--   4. Separa también los pedidos que ya existen.
--   5. Crea "vista_pedidos" y "vista_extras_pedidos" para consultarlos.
-- La página NO cambia: sigue guardando en "pedidos" igual que antes.
-- =========================================================

-- ---------- 1. TABLAS ----------
create table if not exists public.pedido_items (
  id                  bigint generated always as identity primary key,
  pedido_id           bigint not null references public.pedidos(id) on delete cascade,
  codigo              text   not null,
  linea               integer not null,
  tipo                text,
  producto_id         integer,
  producto            text,
  opcion              text,
  cantidad            integer not null default 1,
  precio_unitario_usd numeric(10,2),
  subtotal_usd        numeric(10,2),
  extras_texto        text,
  idea                text
);

create table if not exists public.pedido_extras (
  id        bigint generated always as identity primary key,
  pedido_id bigint  not null references public.pedidos(id) on delete cascade,
  item_id   bigint  not null references public.pedido_items(id) on delete cascade,
  codigo    text    not null,
  producto  text,
  extra     text    not null,
  cantidad  integer not null default 1
);

create index if not exists pedido_items_pedido_idx  on public.pedido_items (pedido_id);
create index if not exists pedido_extras_pedido_idx on public.pedido_extras (pedido_id);
create index if not exists pedido_extras_item_idx   on public.pedido_extras (item_id);

-- Solo tú (desde el panel) puedes verlas. La página no tiene acceso.
alter table public.pedido_items  enable row level security;
alter table public.pedido_extras enable row level security;
revoke all on public.pedido_items, public.pedido_extras from anon, authenticated;

-- ---------- 2. FUNCIÓN QUE SEPARA UN PEDIDO ----------
create or replace function public.separar_pedido(p_pedido_id bigint)
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
  v_item_id bigint;
  ex        text;
  m         text[];
begin
  select codigo, items into v_codigo, v_items
  from public.pedidos where id = p_pedido_id;

  if v_items is null or jsonb_typeof(v_items) <> 'array' then
    return;
  end if;

  -- Si el pedido ya estaba separado, se vuelve a separar desde cero
  delete from public.pedido_items where pedido_id = p_pedido_id;

  for it in select value from jsonb_array_elements(v_items) loop
    n := n + 1;

    insert into public.pedido_items (
      pedido_id, codigo, linea, tipo, producto_id, producto, opcion,
      cantidad, precio_unitario_usd, subtotal_usd, extras_texto, idea
    ) values (
      p_pedido_id,
      v_codigo,
      n,
      it->>'tipo',
      case when it->>'producto_id' ~ '^\d+$' then (it->>'producto_id')::integer end,
      it->>'nombre',
      it->>'detalle',
      case when it->>'cantidad' ~ '^\d+$' then (it->>'cantidad')::integer else 1 end,
      case when it->>'precio_unitario_usd' ~ '^-?\d+(\.\d+)?$' then (it->>'precio_unitario_usd')::numeric end,
      case when it->>'subtotal_usd' ~ '^-?\d+(\.\d+)?$' then (it->>'subtotal_usd')::numeric end,
      nullif(it->>'extras', ''),
      nullif(it->>'idea', '')
    )
    returning id into v_item_id;

    -- Extras: "1 x Luces LED cálidas, 1 x Peluche pequeño" → una fila por extra
    if coalesce(it->>'extras', '') <> '' then
      foreach ex in array string_to_array(it->>'extras', ',') loop
        ex := trim(ex);
        continue when ex = '';
        m := regexp_match(ex, '^(\d+)\s*[xX×]\s*(.+)$');
        insert into public.pedido_extras (pedido_id, item_id, codigo, producto, extra, cantidad)
        values (
          p_pedido_id,
          v_item_id,
          v_codigo,
          it->>'nombre',
          coalesce(trim(m[2]), ex),
          coalesce(m[1]::integer, 1)
        );
      end loop;
    end if;
  end loop;
end;
$$;

-- Nadie desde la página puede ejecutar esta función
revoke execute on function public.separar_pedido(bigint) from public, anon, authenticated;

-- ---------- 3. SEPARAR AUTOMÁTICAMENTE CADA PEDIDO NUEVO ----------
create or replace function public.tg_separar_pedido()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  begin
    perform public.separar_pedido(new.id);
  exception when others then
    -- Si algo falla al separar, el pedido igual queda guardado
    raise warning 'No se pudo separar el pedido %: %', new.codigo, sqlerrm;
  end;
  return null;
end;
$$;

drop trigger if exists separar_pedido_al_guardar on public.pedidos;
create trigger separar_pedido_al_guardar
  after insert on public.pedidos
  for each row execute function public.tg_separar_pedido();

-- ---------- 4. SEPARAR LOS PEDIDOS QUE YA EXISTEN ----------
do $$
declare r record;
begin
  for r in select id from public.pedidos loop
    perform public.separar_pedido(r.id);
  end loop;
end $$;

-- ---------- 5. VISTAS PARA CONSULTAR ----------
drop view if exists public.vista_pedidos;
create view public.vista_pedidos with (security_invoker = true) as
select
  p.id                                                         as pedido_id,
  p.codigo,
  to_char(p.creado at time zone 'America/Caracas', 'DD/MM/YYYY HH24:MI') as fecha,
  p.estado,
  i.linea,
  i.producto,
  i.opcion,
  i.cantidad,
  i.precio_unitario_usd,
  i.subtotal_usd,
  coalesce(i.extras_texto, 'Sin extras')                        as extras,
  i.idea,
  p.mensaje_tarjeta,
  p.metodo_pago,
  p.total_usd,
  p.total_bs,
  p.tasa_bcv,
  p.abono_usd,
  p.resto_usd
from public.pedidos p
left join public.pedido_items i on i.pedido_id = p.id
order by p.creado desc, i.linea;

drop view if exists public.vista_extras_pedidos;
create view public.vista_extras_pedidos with (security_invoker = true) as
select
  e.codigo,
  to_char(p.creado at time zone 'America/Caracas', 'DD/MM/YYYY HH24:MI') as fecha,
  e.producto,
  e.extra,
  e.cantidad
from public.pedido_extras e
join public.pedidos p on p.id = e.pedido_id
order by p.creado desc, e.item_id, e.id;

revoke all on public.vista_pedidos, public.vista_extras_pedidos from anon, authenticated;

-- ---------- 6. DESCRIPCIONES (se ven en Table Editor → Definition) ----------
comment on table  public.pedido_items  is 'Productos de cada pedido: una fila por producto. Se llena sola al guardar un pedido.';
comment on column public.pedido_items.codigo              is 'Código del pedido (el mismo del WhatsApp).';
comment on column public.pedido_items.linea               is 'Número del producto dentro del pedido (1, 2, 3…).';
comment on column public.pedido_items.tipo                is 'producto = del catálogo; otro valor = ramo personalizado.';
comment on column public.pedido_items.producto            is 'Nombre del producto.';
comment on column public.pedido_items.opcion              is 'Presentación elegida, por ejemplo "5 lirios".';
comment on column public.pedido_items.cantidad            is 'Cuántas unidades pidió.';
comment on column public.pedido_items.precio_unitario_usd is 'Precio de una unidad en dólares (incluye extras).';
comment on column public.pedido_items.subtotal_usd        is 'Precio unitario × cantidad, en dólares.';
comment on column public.pedido_items.extras_texto        is 'Extras tal como los eligió el cliente.';
comment on column public.pedido_items.idea                is 'Detalles del ramo personalizado (si aplica).';

comment on table  public.pedido_extras is 'Extras de cada pedido: una fila por extra. Se llena sola al guardar un pedido.';
comment on column public.pedido_extras.producto is 'Producto al que se agregó el extra.';
comment on column public.pedido_extras.extra    is 'Nombre del extra, por ejemplo "Peluche pequeño".';
comment on column public.pedido_extras.cantidad is 'Cuántas unidades del extra.';

comment on view public.vista_pedidos        is 'Pedidos completos: una fila por producto, con totales, pago y mensaje.';
comment on view public.vista_extras_pedidos is 'Extras pedidos: una fila por extra, con su producto y fecha.';

notify pgrst, 'reload schema';
