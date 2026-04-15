import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const user = await User.findById(session.user.id);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json({ 
       success: true, 
       data: { 
          name: user.name, 
          email: user.email, 
          preferences: user.preferences || { paymentReminders: true, deadlineReminders: true, emailNotifications: true } 
       } 
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { profile, preferences, security } = body;

    await connectDB();
    const user = await User.findById(session.user.id).select("+password");

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    if (profile) {
      if (profile.name) user.name = profile.name;
      if (profile.email) {
         const existing = await User.findOne({ email: profile.email.toLowerCase(), _id: { $ne: user._id } });
         if (existing) return NextResponse.json({ success: false, error: "Email already taken" }, { status: 400 });
         user.email = profile.email.toLowerCase();
      }
    }

    if (preferences) {
      user.preferences = { ...user.preferences, ...preferences };
    }

    if (security && security.currentPassword && security.newPassword) {
      if (!user.password) return NextResponse.json({ success: false, error: "No password set on this account" }, { status: 400 });
      const isMatch = await bcrypt.compare(security.currentPassword, user.password);
      if (!isMatch) return NextResponse.json({ success: false, error: "Incorrect current password" }, { status: 400 });
      user.password = await bcrypt.hash(security.newPassword, 12);
    }

    await user.save();

    return NextResponse.json({ success: true, message: "Settings updated successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Internal server error" }, { status: 500 });
  }
}
