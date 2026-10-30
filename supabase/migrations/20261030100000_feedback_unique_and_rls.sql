delete from public.products_feedbacks
where id not in (
  select distinct on (product_id, created_by) id
  from public.products_feedbacks
  order by product_id, created_by, created_at desc, id desc
);

create unique index if not exists products_feedbacks_product_account_unique
  on public.products_feedbacks (product_id, created_by);

drop policy if exists products_select_public on public.products;
create policy products_select_public
  on public.products
  for select
  to anon, authenticated
  using (true);

drop policy if exists products_feedbacks_select_public on public.products_feedbacks;
create policy products_feedbacks_select_public
  on public.products_feedbacks
  for select
  to anon, authenticated
  using (true);
