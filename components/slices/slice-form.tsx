"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { Slice } from "@/types";

type SliceFormProps = {
  mode: "create" | "edit";
  slice?: Slice;
  onSaved: (slice: Slice) => void;
  triggerLabel: string;
};

const initialState = {
  name: "",
  latency_target: "",
  bandwidth: ""
};

export function SliceForm({ mode, slice, onSaved, triggerLabel }: SliceFormProps) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(initialState);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (slice) {
      setForm({
        name: slice.name,
        latency_target: String(slice.latency_target),
        bandwidth: String(slice.bandwidth)
      });
    } else {
      setForm(initialState);
    }
  }, [slice, open]);

  const save = async () => {
    setIsSaving(true);
    const response = await fetch("/api/slices", {
      method: mode === "create" ? "POST" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: slice?.id,
        name: form.name,
        latency_target: Number(form.latency_target),
        bandwidth: Number(form.bandwidth)
      })
    });

    setIsSaving(false);

    if (!response.ok) {
      return;
    }

    const savedSlice = (await response.json()) as Slice;
    onSaved(savedSlice);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={mode === "create" ? "default" : "outline"}>{triggerLabel}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Create slice" : "Edit slice"}</DialogTitle>
          <DialogDescription>Define latency targets and bandwidth allocation for the slice.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Slice name"
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
          />
          <Input
            placeholder="Latency target (ms)"
            type="number"
            value={form.latency_target}
            onChange={(event) =>
              setForm((current) => ({ ...current, latency_target: event.target.value }))
            }
          />
          <Input
            placeholder="Bandwidth (Mbps)"
            type="number"
            value={form.bandwidth}
            onChange={(event) => setForm((current) => ({ ...current, bandwidth: event.target.value }))}
          />
          <Button className="w-full" onClick={save} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save slice"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
