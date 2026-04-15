import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Reminder, Project } from "@/models";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const projects = await Project.find({ userId: session.user.id });
    const projectIds = projects.map(p => p._id);

    const reminders = await Reminder.find({ projectId: { $in: projectIds } }).sort({ date: 1 });
    return NextResponse.json({ success: true, data: reminders });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    await connectDB();
    
    // Auth check config implicitly ensures we only attach to a permitted project
    const project = await Project.findOne({ _id: body.projectId, userId: session.user.id });
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    const reminder = await Reminder.create(body);
    return NextResponse.json({ success: true, data: reminder }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}