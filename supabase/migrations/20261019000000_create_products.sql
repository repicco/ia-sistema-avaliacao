create table if not exists public.products (
  id text primary key,
  name text not null,
  description text,
  image_url text not null check (image_url ~* '^https://'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  score boolean not null default false,
  external_link text not null
);

create index if not exists products_catalog_order_idx
  on public.products (created_at desc, id desc);

create or replace function public.set_products_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_set_updated_at on public.products;

create trigger products_set_updated_at
before update on public.products
for each row
execute function public.set_products_updated_at();

alter table public.products enable row level security;
