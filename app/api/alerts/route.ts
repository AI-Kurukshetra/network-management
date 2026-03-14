import { NextResponse } from "next/server";

import { listAlerts } from "@/lib/data";

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
