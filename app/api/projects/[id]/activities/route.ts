import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { ActivityLog } from "@/models";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: projectId } = await params;
    await connectDB();
    const activities = await ActivityLog.find({ projectId }).sort({ createdAt: -1 }).limit(50);
    return NextResponse.json({ success: true, data: activities });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}