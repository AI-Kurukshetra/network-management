alter table if exists alerts
  add column if not exists resolution_comment text;

alter table if exists alerts
  add column if not exists resolved_at timestamptz;
