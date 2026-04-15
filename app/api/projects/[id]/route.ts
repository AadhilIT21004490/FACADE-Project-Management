import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Project } from "@/models";
import { auth } from "@/lib/auth";
import { logActivity } from "@/lib/logActivity";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    await connectDB();
    const project = await Project.findOne({ _id: id, userId: session.user.id });
    if (!project) return NextResponse.json({ success: false, error: "Project not found" }, { status: 404 });

    return NextResponse.json({ success: true, data: project });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await request.json();

    await connectDB();
    const project = await Project.findOneAndUpdate(
      { _id: id, userId: session.user.id },
      { $set: body },
      { new: true, runValidators: true }
    );

    if (!project) return NextResponse.json({ success: false, error: "Project not found" }, { status: 404 });

    logActivity({
      projectId: project._id,
      action: "Project Updated",
      description: "Project details were updated.",
    });

    return NextResponse.json({ success: true, data: project });
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
    const project = await Project.findOneAndDelete({ _id: id, userId: session.user.id });
    
    if (!project) return NextResponse.json({ success: false, error: "Project not found" }, { status: 404 });

    // In a real app, you might want to delete cascading dependencies (deadlines, credentials, documents, etc.)
    return NextResponse.json({ success: true, message: "Project deleted" });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}