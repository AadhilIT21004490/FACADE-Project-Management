import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Credential } from "@/models";
import { auth } from "@/lib/auth";
import { logActivity } from "@/lib/logActivity";
import { encrypt } from "@/lib/encrypt";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await request.json();

    if (body.password) {
      body.password = encrypt(body.password);
    }

    await connectDB();
    const cred = await Credential.findByIdAndUpdate(id, { $set: body }, { new: true });
    if (!cred) return NextResponse.json({ error: "Credential not found" }, { status: 404 });

    logActivity({
      projectId: cred.projectId,
      action: "Credential Updated",
      description: `Updated credentials for: ${cred.serviceName}`,
    });

    return NextResponse.json({ success: true, data: cred });
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
    const cred = await Credential.findByIdAndDelete(id);
    if (!cred) return NextResponse.json({ error: "Credential not found" }, { status: 404 });

    logActivity({
      projectId: cred.projectId,
      action: "Credential Deleted",
      description: `Deleted credentials for: ${cred.serviceName}`,
    });

    return NextResponse.json({ success: true, message: "Deleted" });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}