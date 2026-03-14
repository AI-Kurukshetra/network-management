"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { formatDateTime } from "@/lib/utils";
import type { Alert } from "@/types";

function variant(severity: Alert["severity"]) {
  if (severity === "low") return "success";
  if (severity === "medium") return "warning";
  return "destructive";
}

export function AlertsTable({ initialAlerts }: { initialAlerts: Alert[] }) {
  const [alerts, setAlerts] = useState(initialAlerts);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [comment, setComment] = useState("");
  const [nextResolvedState, setNextResolvedState] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openActionDialog = (alert: Alert, resolved: boolean) => {
    setSelectedAlert(alert);
    setNextResolvedState(resolved);
    setComment("");
    setError(null);
  };

  const closeDialog = () => {
    setSelectedAlert(null);
    setComment("");
    setError(null);
  };

  const updateStatus = async () => {
    if (!selectedAlert) {
      return;
    }

    if (!comment.trim()) {
      setError("Comment is required.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const response = await fetch(`/api/alerts/${selectedAlert.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        resolved: nextResolvedState,
        comment: comment.trim()
      })
    });

    setIsSubmitting(false);

    if (response.ok) {
      setAlerts((current) =>
        current.map((alert) =>
          alert.id === selectedAlert.id
            ? {
                ...alert,
                resolved: nextResolvedState,
                resolution_comment: comment.trim(),
                resolved_at: nextResolvedState ? new Date().toISOString() : null
              }
            : alert
        )
      );
      closeDialog();
      return;
    }

    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    setError(payload?.error ?? "Failed to update alert.");
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
              <TableHead>Comment</TableHead>
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
                <TableCell className="min-w-[260px] text-muted-foreground">
                  {alert.resolution_comment ?? "No comment added."}
                </TableCell>
                <TableCell>{formatDateTime(alert.created_at)}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    onClick={() => openActionDialog(alert, !alert.resolved)}
                  >
                    {alert.resolved ? "Unresolve" : "Resolve"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <Dialog open={Boolean(selectedAlert)} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{nextResolvedState ? "Resolve alert" : "Reopen alert"}</DialogTitle>
            <DialogDescription>
              Add an operator comment so the alert action is traceable.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-2xl bg-muted/50 p-4 text-sm text-muted-foreground">
              {selectedAlert?.message}
            </div>
            <Textarea
              placeholder={nextResolvedState ? "Describe why the alert is being resolved..." : "Describe why the alert is being reopened..."}
              value={comment}
              onChange={(event) => setComment(event.target.value)}
            />
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <Button className="w-full" onClick={updateStatus} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : nextResolvedState ? "Resolve Alert" : "Unresolve Alert"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
