"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Alert } from "@/types";

function variant(severity: Alert["severity"]) {
  if (severity === "low") return "success";
  if (severity === "medium") return "warning";
  return "destructive";
}

export function AlertsTable({ initialAlerts }: { initialAlerts: Alert[] }) {
  const [alerts, setAlerts] = useState(initialAlerts);

  const resolve = async (id: string) => {
    const response = await fetch("/api/alerts", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    });
    if (response.ok) {
      setAlerts((current) =>
        current.map((alert) => (alert.id === id ? { ...alert, resolved: true } : alert))
      );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Alert Feed</CardTitle>
        <CardDescription>Threshold-based events generated from the network telemetry engine.</CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Message</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {alerts.map((alert) => (
              <TableRow key={alert.id}>
                <TableCell className="min-w-[320px]">{alert.message}</TableCell>
                <TableCell>
                  <Badge variant={variant(alert.severity)}>{alert.severity}</Badge>
                </TableCell>
                <TableCell>{alert.resolved ? "Resolved" : "Open"}</TableCell>
                <TableCell>{new Date(alert.created_at).toLocaleString()}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    disabled={alert.resolved}
                    onClick={() => resolve(alert.id)}
                  >
                    Resolve
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
