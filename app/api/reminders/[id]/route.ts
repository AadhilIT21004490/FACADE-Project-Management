import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Reminder } from "@/models";
import { auth } from "@/lib/auth";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await request.json();

    await connectDB();
    const reminder = await Reminder.findByIdAndUpdate(id, { $set: body }, { new: true });
    if (!reminder) return NextResponse.json({ error: "Reminder not found" }, { status: 404 });

    return NextResponse.json({ success: true, data: reminder });
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
    const reminder = await Reminder.findByIdAndDelete(id);
    if (!reminder) return NextResponse.json({ error: "Reminder not found" }, { status: 404 });

    return NextResponse.json({ success: true, message: "Deleted" });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}