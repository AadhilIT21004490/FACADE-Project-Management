import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Payment, Project } from "@/models";
import { auth } from "@/lib/auth";
import { logActivity } from "@/lib/logActivity";

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    await connectDB();
    
    const payment = await Payment.findById(id);
    if (!payment) return NextResponse.json({ error: "Payment not found" }, { status: 404 });

    await Payment.findByIdAndDelete(id);

    const project = await Project.findById(payment.projectId);
    if (project) {
       project.paidAmount -= Number(payment.amount);
       if (project.paidAmount < 0) project.paidAmount = 0;
       await project.save();
    }

    logActivity({
      projectId: payment.projectId,
      action: "Payment Deleted",
      description: `Deleted a payment of $${payment.amount}`,
    });

    return NextResponse.json({ success: true, message: "Deleted" });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}