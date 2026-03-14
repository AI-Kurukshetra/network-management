import { NextResponse } from "next/server";

import { listFunctions } from "@/lib/data";

export async function GET() {
  try {
    const functions = await listFunctions();
    return NextResponse.json(functions);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load network functions." },
      { status: 500 }
    );
  }
}
