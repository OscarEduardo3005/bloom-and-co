-- =========================================================
-- BLOOM & CO — Reparar permisos para guardar pedidos
-- Pega este archivo en Supabase → SQL Editor → New query → Run.
-- Es seguro ejecutarlo varias veces: no borra datos.
-- =========================================================

-- 1. Permisos de la API pública (la página) sobre las tablas
grant usage on schema public to anon, authenticated;
grant select on public.productos, public.opciones, public.extras to anon, authenticated;
grant insert on public.pedidos to anon, authenticated;

-- 2. Reglas de seguridad (RLS), recreadas para la página
alter table public.pedidos enable row level security;
drop policy if exists "crear pedidos" on public.pedidos;
create policy "crear pedidos" on public.pedidos for insert to anon, authenticated
  with check (estado = 'nuevo' and jsonb_typeof(items) = 'array' and jsonb_array_length(items) between 1 and 50);

drop policy if exists "leer productos" on public.productos;
create policy "leer productos" on public.productos for select to anon, authenticated using (activo);
drop policy if exists "leer opciones" on public.opciones;
create policy "leer opciones" on public.opciones for select to anon, authenticated using (true);
drop policy if exists "leer extras" on public.extras;
create policy "leer extras" on public.extras for select to anon, authenticated using (activo);

-- 3. Pide a la API que vuelva a leer la estructura de las tablas
notify pgrst, 'reload schema';
