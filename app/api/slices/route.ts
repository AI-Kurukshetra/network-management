import { NextResponse } from "next/server";

import { createSlice, listSlices } from "@/lib/data";

export async function GET() {
  try {
    const slices = await listSlices();
    return NextResponse.json(slices);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load slices." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      name?: string;
      latency_target?: number;
      bandwidth?: number;
    };

    if (!body.name || body.latency_target == null || body.bandwidth == null) {
      return NextResponse.json({ error: "Missing required slice fields." }, { status: 400 });
    }

    const slice = await createSlice({
      name: body.name,
      latency_target: Number(body.latency_target),
      bandwidth: Number(body.bandwidth)
    });

    return NextResponse.json(slice, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create slice." },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as {
      id?: string;
      name?: string;
      latency_target?: number;
      bandwidth?: number;
    };

    if (!body.id || !body.name || body.latency_target == null || body.bandwidth == null) {
      return NextResponse.json({ error: "Missing required slice fields." }, { status: 400 });
    }

    const { updateSlice } = await import("@/lib/data");
    const slice = await updateSlice(body.id, {
      name: body.name,
      latency_target: Number(body.latency_target),
      bandwidth: Number(body.bandwidth)
    });

    return NextResponse.json(slice);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update slice." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing slice id." }, { status: 400 });
    }

    const { deleteSlice } = await import("@/lib/data");
    await deleteSlice(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete slice." },
      { status: 500 }
    );
  }
}
