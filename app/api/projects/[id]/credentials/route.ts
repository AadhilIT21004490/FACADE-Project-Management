import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Credential, Project } from "@/models";
import { auth } from "@/lib/auth";
import { logActivity } from "@/lib/logActivity";
import { encrypt, decrypt } from "@/lib/encrypt";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: projectId } = await params;
    await connectDB();
    const credentials = await Credential.find({ projectId }).sort({ createdAt: -1 });

    const decryptedData = credentials.map((cred) => {
      let clearPassword = "";
      if (cred.password) {
        try {
          clearPassword = decrypt(cred.password);
        } catch (e) {
          clearPassword = "Error decrypting";
        }
      }
      return {
        _id: cred._id,
        projectId: cred.projectId,
        serviceName: cred.serviceName,
        url: cred.url,
        username: cred.username,
        password: clearPassword,
        notes: cred.notes,
        createdAt: cred.createdAt,
      };
    });

    return NextResponse.json({ success: true, data: decryptedData });
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

    let encPassword = "";
    if (body.password) {
      encPassword = encrypt(body.password);
    }

    const cred = await Credential.create({
      ...body,
      projectId,
      password: encPassword,
    });

    logActivity({
      projectId,
      action: "Credential Added",
      description: `Added credentials for: ${cred.serviceName}`,
    });

    return NextResponse.json({ success: true, data: cred }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}