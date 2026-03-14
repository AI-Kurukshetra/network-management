insert into network_slices (name, latency_target, bandwidth)
values
  ('Gaming', 15, 500),
  ('Video Streaming', 30, 800),
  ('IoT', 45, 250)
on conflict do nothing;

with slices as (
  select id, name from network_slices
),
ordered_slices as (
  select id, row_number() over (order by name) as rn from slices
)
insert into network_functions (name, type, status, cpu_usage, latency, packet_loss, throughput, slice_id)
select *
from (
  values
    ('AMF-01', 'AMF', 'healthy', 42, 16, 0.30, 410, (select id from ordered_slices where rn = 1)),
    ('SMF-02', 'SMF', 'healthy', 55, 18, 0.55, 535, (select id from ordered_slices where rn = 2)),
    ('UPF-03', 'UPF', 'degraded', 88, 57, 1.10, 620, (select id from ordered_slices where rn = 3)),
    ('AMF-04', 'AMF', 'healthy', 36, 20, 0.25, 340, (select id from ordered_slices where rn = 1)),
    ('SMF-05', 'SMF', 'healthy', 61, 25, 0.42, 585, (select id from ordered_slices where rn = 2)),
    ('UPF-06', 'UPF', 'healthy', 48, 22, 0.36, 670, (select id from ordered_slices where rn = 3)),
    ('AMF-07', 'AMF', 'healthy', 53, 24, 0.61, 320, (select id from ordered_slices where rn = 1)),
    ('SMF-08', 'SMF', 'degraded', 84, 49, 0.95, 700, (select id from ordered_slices where rn = 2)),
    ('UPF-09', 'UPF', 'healthy', 58, 28, 0.52, 760, (select id from ordered_slices where rn = 3)),
    ('UPF-10', 'UPF', 'healthy', 46, 19, 0.27, 690, (select id from ordered_slices where rn = 1))
) as seed(name, type, status, cpu_usage, latency, packet_loss, throughput, slice_id)
on conflict (name) do nothing;

insert into alerts (message, severity, resolved, resolution_comment, resolved_at, network_function_id, slice_id)
select
  'UPF-03 latency exceeded threshold at 57 ms.',
  'critical',
  false,
  null,
  null,
  nf.id,
  nf.slice_id
from network_functions nf
where nf.name = 'UPF-03'
on conflict do nothing;

insert into metric_snapshots (timestamp, avg_latency, avg_cpu_usage, avg_packet_loss, avg_throughput, health_score)
values
  (now() - interval '25 seconds', 24, 52, 0.40, 545, 83),
  (now() - interval '20 seconds', 25, 55, 0.44, 552, 82),
  (now() - interval '15 seconds', 29, 58, 0.48, 549, 79),
  (now() - interval '10 seconds', 33, 62, 0.53, 535, 75),
  (now() - interval '5 seconds', 37, 67, 0.61, 528, 71),
  (now(), 39, 69, 0.66, 520, 69)
on conflict do nothing;
