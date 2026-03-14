create extension if not exists "pgcrypto";

create table if not exists network_slices (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  latency_target integer not null check (latency_target > 0),
  bandwidth integer not null check (bandwidth > 0),
  created_at timestamptz not null default now()
);

create table if not exists network_functions (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  type text not null check (type in ('AMF', 'SMF', 'UPF')),
  status text not null check (status in ('healthy', 'degraded', 'down')),
  cpu_usage numeric(5,2) not null default 0,
  latency numeric(6,2) not null default 0,
  packet_loss numeric(5,2) not null default 0,
  throughput numeric(8,2) not null default 0,
  slice_id uuid references network_slices(id) on delete cascade,
  updated_at timestamptz not null default now()
);

create table if not exists alerts (
  id uuid primary key default gen_random_uuid(),
  message text not null,
  severity text not null check (severity in ('low', 'medium', 'critical')),
  resolved boolean not null default false,
  resolution_comment text,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  network_function_id uuid references network_functions(id) on delete set null,
  slice_id uuid references network_slices(id) on delete set null
);

create table if not exists metric_snapshots (
  id uuid primary key default gen_random_uuid(),
  timestamp timestamptz not null default now(),
  avg_latency numeric(6,2) not null,
  avg_cpu_usage numeric(6,2) not null,
  avg_packet_loss numeric(5,2) not null,
  avg_throughput numeric(10,2) not null,
  health_score numeric(5,2) not null
);
