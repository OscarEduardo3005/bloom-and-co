-- =========================================================
-- BLOOM & CO — Datos de entrega que escribe el cliente
-- Pega este archivo en Supabase → SQL Editor → New query → Run.
-- Ejecútalo DESPUÉS de "pedidos-mejorados.sql".
-- Es seguro ejecutarlo varias veces: no borra datos.
-- =========================================================

-- 1. Límites de tamaño (los mismos que tiene el formulario de la página)
alter table public.pedidos drop constraint if exists pedidos_cliente_largo;
alter table public.pedidos add constraint pedidos_cliente_largo
  check (cliente is null or char_length(cliente) <= 80);

alter table public.pedidos drop constraint if exists pedidos_direccion_largo;
alter table public.pedidos add constraint pedidos_direccion_largo
  check (direccion is null or char_length(direccion) <= 300);

alter table public.pedidos drop constraint if exists pedidos_notas_largo;
alter table public.pedidos add constraint pedidos_notas_largo
  check (notas is null or char_length(notas) <= 300);

-- 2. La página puede enviar estos campos al crear el pedido
grant insert on public.pedidos to anon, authenticated;

-- 3. Descripciones (Table Editor → Definition)
comment on column public.pedidos.cliente       is 'Nombre del cliente. Lo escribe el cliente en el carrito.';
comment on column public.pedidos.direccion     is 'Dirección de entrega. La escribe el cliente en el carrito.';
comment on column public.pedidos.fecha_entrega is 'Fecha de entrega que elige el cliente en el carrito.';
comment on column public.pedidos.notas         is 'Indicaciones del cliente (hora, a quién entregar…). Opcional.';

-- 4. Recargar la API
notify pgrst, 'reload schema';
