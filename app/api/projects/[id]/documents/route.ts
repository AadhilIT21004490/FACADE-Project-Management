import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { ProjectDocument, Project } from "@/models";
import { auth } from "@/lib/auth";
import { logActivity } from "@/lib/logActivity";
import { uploadToCloudinary } from "@/lib/cloudinary";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: projectId } = await params;
    await connectDB();
    const docs = await ProjectDocument.find({ projectId }).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: docs });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: projectId } = await params;
    const formData = await request.formData();
    
    const file = formData.get("file") as File | null;
    const category = formData.get("category") as string | null;

    if (!file) return NextResponse.json({ error: "File is required" }, { status: 400 });

    await connectDB();
    const project = await Project.findOne({ _id: projectId, userId: session.user.id });
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const { url, publicId } = await uploadToCloudinary(buffer, file.name, `facade/docs/${projectId}`);

    const doc = await ProjectDocument.create({
      projectId,
      name: file.name,
      fileUrl: url,
      publicId: publicId,
      category: category || "other",
      size: file.size,
      fileType: file.type,
    });

    logActivity({
      projectId,
      action: "Document Uploaded",
      description: `Uploaded file: ${file.name}`,
    });

    return NextResponse.json({ success: true, data: doc }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/projects/[id]/documents]", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}