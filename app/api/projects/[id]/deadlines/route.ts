import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Deadline, Project } from "@/models";
import { auth } from "@/lib/auth";
import { logActivity } from "@/lib/logActivity";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: projectId } = await params;
    await connectDB();
    const deadlines = await Deadline.find({ projectId }).sort({ date: 1 });
    return NextResponse.json({ success: true, data: deadlines });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: projectId } = await params;
    const body = await request.json();

    await connectDB();
    const project = await Project.findOne({ _id: projectId, userId: session.user.id });
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    const deadline = await Deadline.create({ ...body, projectId });

    logActivity({
      projectId,
      action: "Deadline Added",
      description: `Added a new ${body.type} deadline: ${deadline.title}`,
    });

    return NextResponse.json({ success: true, data: deadline }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}