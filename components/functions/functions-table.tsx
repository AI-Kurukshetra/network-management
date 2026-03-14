import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatLatency, formatPercent, formatThroughput } from "@/lib/utils";
import type { NetworkFunction, Slice } from "@/types";

function statusVariant(status: NetworkFunction["status"]) {
  if (status === "healthy") return "success";
  if (status === "degraded") return "warning";
  return "destructive";
}

export function FunctionsTable({
  functions,
  slices
}: {
  functions: NetworkFunction[];
  slices: Slice[];
}) {
  const sliceMap = new Map(slices.map((slice) => [slice.id, slice.name]));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Network Functions</CardTitle>
        <CardDescription>Live telecom control plane and user plane instances.</CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>CPU</TableHead>
              <TableHead>Latency</TableHead>
              <TableHead>Packet Loss</TableHead>
              <TableHead>Throughput</TableHead>
              <TableHead>Slice</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {functions.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{item.type}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant(item.status)}>{item.status}</Badge>
                </TableCell>
                <TableCell>{formatPercent(item.cpu_usage)}</TableCell>
                <TableCell>{formatLatency(item.latency)}</TableCell>
                <TableCell>{formatPercent(item.packet_loss)}</TableCell>
                <TableCell>{formatThroughput(item.throughput)}</TableCell>
                <TableCell>{sliceMap.get(item.slice_id) ?? "Unknown"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
