import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Payment, Project } from "@/models";
import { auth } from "@/lib/auth";
import { logActivity } from "@/lib/logActivity";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: projectId } = await params;
    await connectDB();
    const payments = await Payment.find({ projectId }).sort({ date: -1 });
    return NextResponse.json({ success: true, data: payments });
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

    const payment = await Payment.create({ ...body, projectId });

    project.paidAmount += Number(payment.amount);
    await project.save();

    logActivity({
      projectId,
      action: "Payment Added",
      description: `Added a payment of $${payment.amount}`,
    });

    return NextResponse.json({ success: true, data: payment }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}