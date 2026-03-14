alter table if exists network_functions
  add column if not exists throughput integer default 0;

alter table if exists metric_snapshots
  add column if not exists avg_throughput integer default 0;

update network_functions
set throughput = greatest(100, least(1200, coalesce(throughput, 0)))
where throughput is null or throughput = 0;

update metric_snapshots
set avg_throughput = greatest(100, least(1200, coalesce(avg_throughput, 0)))
where avg_throughput is null or avg_throughput = 0;
