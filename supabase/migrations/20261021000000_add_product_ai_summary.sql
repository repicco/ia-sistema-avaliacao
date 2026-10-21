alter table public.products
  add column ai_summary text,
  add column ai_summary_updated_at timestamptz,
  add column ai_summary_feedback_count integer;
