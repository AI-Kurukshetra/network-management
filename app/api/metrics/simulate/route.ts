import { NextResponse } from "next/server";

import { runSimulationTick } from "@/lib/simulation";

export async function POST() {
  try {
    const result = await runSimulationTick();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to simulate metrics." },
      { status: 500 }
    );
  }
}
