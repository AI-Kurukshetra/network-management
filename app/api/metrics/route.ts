import { NextResponse } from "next/server";

import { getDashboardPayload } from "@/lib/data";

export async function GET() {
  try {
    const payload = await getDashboardPayload();
    return NextResponse.json(payload);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load metrics." },
      { status: 500 }
    );
  }
}
