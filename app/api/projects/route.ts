import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Project } from "@/models";
import { auth } from "@/lib/auth";
import { logActivity } from "@/lib/logActivity";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");

    await connectDB();
    const query: any = { userId: session.user.id };
    if (status) query.status = status;

    const projects = await Project.find(query).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: projects });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    if (!body.name) return NextResponse.json({ success: false, error: "Project name is required" }, { status: 400 });

    await connectDB();
    const project = await Project.create({
      ...body,
      userId: session.user.id,
    });

    logActivity({
      projectId: project._id,
      action: "Project Created",
      description: `Project ${project.name} was created.`,
    });

    return NextResponse.json({ success: true, data: project }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}