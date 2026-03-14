import { NextResponse } from "next/server";

import { updateAlertStatus } from "@/lib/data";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    if (!params.id) {
      return NextResponse.json({ error: "Missing alert id." }, { status: 400 });
    }

    const body = (await request.json()) as { resolved?: boolean; comment?: string };
    if (typeof body.resolved !== "boolean") {
      return NextResponse.json({ error: "Missing resolved status." }, { status: 400 });
    }

    const comment = body.comment?.trim();
    if (!comment) {
      return NextResponse.json({ error: "Comment is required." }, { status: 400 });
    }

    await updateAlertStatus(params.id, {
      resolved: body.resolved,
      comment
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update alert." },
      { status: 500 }
    );
  }
}
