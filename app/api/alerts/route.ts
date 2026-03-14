import { NextResponse } from "next/server";

import { listAlerts, resolveAlert } from "@/lib/data";

export async function GET() {
  try {
    const alerts = await listAlerts();
    return NextResponse.json(alerts);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load alerts." },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as { id?: string };
    if (!body.id) {
      return NextResponse.json({ error: "Missing alert id." }, { status: 400 });
    }

    await resolveAlert(body.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update alert." },
      { status: 500 }
    );
  }
}
