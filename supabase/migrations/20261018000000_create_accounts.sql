create table if not exists public.accounts (
  id text primary key,
  first_name text not null,
  last_name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  active boolean not null default true,
  email text not null,
  password text not null
);

create unique index if not exists accounts_email_lower_unique
  on public.accounts (lower(email));

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists accounts_set_updated_at on public.accounts;

create trigger accounts_set_updated_at
before update on public.accounts
for each row
execute function public.set_updated_at();

alter table public.accounts enable row level security;
