alter table public.products
  alter column external_link drop not null,
  add column price numeric(10, 2) check (price is null or price >= 0);
