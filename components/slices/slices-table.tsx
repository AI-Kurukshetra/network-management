"use client";

import { useState } from "react";

import { SliceForm } from "@/components/slices/slice-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Slice } from "@/types";

export function SlicesTable({ initialSlices }: { initialSlices: Slice[] }) {
  const [slices, setSlices] = useState(initialSlices);

  const handleSave = (savedSlice: Slice) => {
    setSlices((current) => {
      const exists = current.some((item) => item.id === savedSlice.id);
      return exists
        ? current.map((item) => (item.id === savedSlice.id ? savedSlice : item))
        : [...current, savedSlice];
    });
  };

  const deleteSlice = async (id: string) => {
    const response = await fetch(`/api/slices?id=${id}`, { method: "DELETE" });
    if (response.ok) {
      setSlices((current) => current.filter((item) => item.id !== id));
    }
  };

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-4">
        <div>
          <CardTitle>Slice Inventory</CardTitle>
          <CardDescription>Provision and manage service slices for different traffic profiles.</CardDescription>
        </div>
        <SliceForm mode="create" triggerLabel="Add Slice" onSaved={handleSave} />
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Latency Target</TableHead>
              <TableHead>Bandwidth</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {slices.map((slice) => (
              <TableRow key={slice.id}>
                <TableCell className="font-medium">{slice.name}</TableCell>
                <TableCell>{slice.latency_target} ms</TableCell>
                <TableCell>{slice.bandwidth} Mbps</TableCell>
                <TableCell>{new Date(slice.created_at).toLocaleString()}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <SliceForm mode="edit" slice={slice} triggerLabel="Edit" onSaved={handleSave} />
                    <Button variant="ghost" onClick={() => deleteSlice(slice.id)}>
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
