import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Deadline } from "@/models";
import { auth } from "@/lib/auth";
import { logActivity } from "@/lib/logActivity";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await request.json();

    await connectDB();
    const deadline = await Deadline.findByIdAndUpdate(id, { $set: body }, { new: true });
    if (!deadline) return NextResponse.json({ error: "Deadline not found" }, { status: 404 });

    logActivity({
      projectId: deadline.projectId,
      action: "Deadline Updated",
      description: `Updated deadline: ${deadline.title}`,
    });

    return NextResponse.json({ success: true, data: deadline });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    await connectDB();
    const deadline = await Deadline.findByIdAndDelete(id);
    if (!deadline) return NextResponse.json({ error: "Deadline not found" }, { status: 404 });

    logActivity({
      projectId: deadline.projectId,
      action: "Deadline Deleted",
      description: `Deleted deadline: ${deadline.title}`,
    });

    return NextResponse.json({ success: true, message: "Deleted" });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}