import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { ProjectDocument } from "@/models";
import { auth } from "@/lib/auth";
import { logActivity } from "@/lib/logActivity";
import { deleteFromCloudinary } from "@/lib/cloudinary";

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    await connectDB();
    
    const doc = await ProjectDocument.findById(id);
    if (!doc) return NextResponse.json({ error: "Document not found" }, { status: 404 });

    await deleteFromCloudinary(doc.publicId);
    await ProjectDocument.findByIdAndDelete(id);

    logActivity({
      projectId: doc.projectId,
      action: "Document Deleted",
      description: `Deleted file: ${doc.name}`,
    });

    return NextResponse.json({ success: true, message: "Deleted" });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}